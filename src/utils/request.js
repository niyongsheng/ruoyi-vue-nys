/**
 * 请求封装（自 RuoYi `src/utils/request.js` 移植）
 *
 * 保留 RuoYi 的调用契约，使 `src/api/**` 与 50 个业务页面零改动：
 *  - 响应直接返回后端信封 `{code, msg, data|rows, total}`，业务层用 `res.rows / res.total`
 *  - 失败时 Promise.reject，业务层 `.catch()` 语义不变
 *  - 401 提示并回登录页、500 错误提示、601 警告、其他 code 走 Notification
 *  - `download()` 通用下载（blob + file-saver）
 *
 * 改动点：token 从 Cookie 改为 localStg（见 utils/auth.js）；401 登出改为重置 soybean 的 auth store。
 */
/* eslint-disable no-console, eqeqeq, max-params, no-shadow, @typescript-eslint/no-shadow, prefer-promise-reject-errors, no-useless-concat --
 * 以上规则与 RuoYi 的调用契约冲突（Promise.reject 传字符串是业务层 `.catch()` 所依赖的），
 * 保持与上游一致以便对照，故在此豁免。 */
import { ElLoading, ElMessage, ElNotification } from 'element-plus';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { getAuthHeaders, getToken, removeToken } from '@/utils/auth';
import errorCode from '@/utils/errorCode';
import { sessionStg } from '@/utils/storage';
import { blobValidate, tansParams } from '@/utils/ruoyi';

let downloadLoadingInstance;
// 是否显示重新登录
export const isRelogin = { show: false };

const SENSITIVE_KEY = /password|passwd|pwd/i;

/**
 * 防重复提交的比对数据脱敏：递归把密码类字段替换为掩码。
 * 比对只需要判断「数据是否相同」，明文凭据不应写入 sessionStorage。
 */
function maskSensitive(data) {
  if (Array.isArray(data)) {
    return data.map(maskSensitive);
  }
  if (data && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, SENSITIVE_KEY.test(key) ? '***' : maskSensitive(value)])
    );
  }
  return data;
}

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分（dev 走 vite 代理，见 build/config/proxy.ts）
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10000
});

/**
 * 401 后统一登出（延迟引入 store，避免 store → api → request 的循环依赖）
 *
 * 走 authStore.resetStore()，内部会清理 token/路由/页签并跳转登录页，
 * 与路由守卫的启动态处理（getInfo 失败）共用同一套逻辑，不再硬跳转。
 */
async function handleLogout() {
  removeToken();

  try {
    const { useAuthStore } = await import('@/store/modules/auth');
    await useAuthStore().resetStore();
  } catch (e) {
    console.error(e);
  }
}

// request拦截器
service.interceptors.request.use(
  config => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false;
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;
    // 间隔时间(ms)，小于此时间视为重复提交
    const interval = (config.headers || {}).interval || 1000;
    if (getToken() && !isToken) {
      Object.assign(config.headers, getAuthHeaders());
    }
    // 自定义头部不应发给后端
    delete config.headers.isToken;
    delete config.headers.repeatSubmit;
    delete config.headers.interval;
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = `${config.url}?${tansParams(config.params)}`;
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        // 密码类字段以掩码参与比对：防重复提交只需要「数据是否相同」，
        // 明文凭据不得写入 sessionStorage（resetPwd/updatePwd/unlockScreen 等接口）
        data: typeof config.data === 'object' ? JSON.stringify(maskSensitive(config.data)) : config.data,
        time: new Date().getTime()
      };
      // 请求数据大小（近似值，仅用于阈值判断；不重复序列化整个 body，
      // 原写法 `Object.keys(JSON.stringify(obj)).length` 会为大 body 构造等长的临时字符键数组）
      const requestSize = String(requestObj.url).length + String(requestObj.data).length;
      const limitSize = 5 * 1024 * 1024; // 限制存放数据5M
      if (requestSize >= limitSize) {
        console.warn(`[${config.url}]: ` + '请求数据大小超出允许的5M限制，无法进行防重复提交验证。');
        return config;
      }
      const sessionObj = sessionStg.get('requestObj');
      if (!sessionObj) {
        sessionStg.set('requestObj', requestObj);
      } else {
        const s_url = sessionObj.url; // 请求地址
        const s_data = sessionObj.data; // 请求数据
        const s_time = sessionObj.time; // 请求时间
        if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
          const message = '数据正在处理，请勿重复提交';
          console.warn(`[${s_url}]: ${message}`);
          return Promise.reject(new Error(message));
        }
        sessionStg.set('requestObj', requestObj);
      }
    }
    return config;
  },
  error => {
    console.log(error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  res => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode.default;
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data;
    }
    if (code === 401) {
      // 会话过期：提示 + 静默回登录页（避免弹框残留在登录页，也避免与路由守卫重复处理）
      if (!isRelogin.show) {
        isRelogin.show = true;
        ElMessage.warning('登录状态已过期，请重新登录');
        handleLogout().finally(() => {
          isRelogin.show = false;
        });
      }
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
    } else if (code === 500) {
      ElMessage({ message: msg, type: 'error' });
      return Promise.reject(new Error(msg));
    } else if (code === 601) {
      ElMessage({ message: msg, type: 'warning' });
      return Promise.reject(new Error(msg));
    } else if (code !== 200) {
      ElNotification.error({ title: msg });
      return Promise.reject('error');
    }
    return Promise.resolve(res.data);
  },
  error => {
    console.log(`err${error}`);
    let { message } = error;
    if (message == 'Network Error') {
      message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    } else if (message.includes('Request failed with status code')) {
      message = `系统接口${message.slice(-3)}异常`;
    }
    ElMessage({ message, type: 'error', duration: 5 * 1000 });
    return Promise.reject(error);
  }
);

/**
 * 通用下载方法
 *
 * @param {string} url 请求地址（GET 时请自行拼好查询串）
 * @param {object} params 表单参数（POST 用）
 * @param {string} filename 保存的文件名
 * @param {object} [config] 额外 axios 配置；`method` 默认为 post（tool/gen 的导出用 get）
 */
export function download(url, params, filename, config) {
  const { method = 'post', ...extraConfig } = config || {};

  downloadLoadingInstance = ElLoading.service({ text: '正在下载数据，请稍候', background: 'rgba(0, 0, 0, 0.7)' });
  return service
    .request({
      url,
      method,
      data: params,
      transformRequest: [
        params => {
          return tansParams(params);
        }
      ],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob',
      // 下载不受全局 10s 超时限制（大文件导出常超过 10s），调用方仍可通过 config 覆盖
      timeout: 0,
      ...extraConfig
    })
    .then(async data => {
      const isBlob = blobValidate(data);
      if (isBlob) {
        const blob = new Blob([data]);
        saveAs(blob, filename);
      } else {
        const resText = await data.text();
        const rspObj = JSON.parse(resText);
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode.default;
        ElMessage.error(errMsg);
      }
      downloadLoadingInstance.close();
    })
    .catch(r => {
      console.error(r);
      ElMessage.error('下载文件出现错误，请联系管理员！');
      downloadLoadingInstance.close();
    });
}

export default service;
