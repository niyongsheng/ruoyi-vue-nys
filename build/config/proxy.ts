import type { ProxyOptions } from 'vite';
import { bgRed, bgYellow, green, lightBlue } from 'kolorist';
import { consola } from 'consola';

/**
 * Set http proxy
 *
 * 与 `src/utils/request.js` 共用同一个基址约定，避免"两个变量必须手工保持一致"：
 *  - `VITE_APP_BASE_API`：前端调用的接口前缀（dev 走代理，prod 由 nginx 反代）
 *  - `VITE_PROXY_TARGET`：dev 代理的后端真实地址（仅 dev 需要，见 .env.development）
 *
 * @param env - The current env
 * @param enable - If enable http proxy
 */
export function createViteProxy(env: Env.ImportMeta, enable: boolean) {
  const isEnableHttpProxy = enable && env.VITE_HTTP_PROXY === 'Y';

  if (!isEnableHttpProxy) return undefined;

  const { VITE_APP_BASE_API: proxyPattern, VITE_PROXY_TARGET: target } = env;

  if (!target) {
    // eslint-disable-next-line no-console
    console.warn('[proxy] VITE_HTTP_PROXY=Y 但未配置 VITE_PROXY_TARGET，代理未启用');
    return undefined;
  }

  const isEnableProxyLog = env.VITE_PROXY_LOG === 'Y';

  return createProxyItem({ proxyPattern, target }, isEnableProxyLog);
}

interface ProxyItem {
  /** 前端调用的前缀，如 /dev-api */
  proxyPattern: string;
  /** 后端真实地址，如 http://localhost:8080 */
  target: string;
}

function createProxyItem(item: ProxyItem, enableLog: boolean) {
  const proxy: Record<string, ProxyOptions> = {};

  proxy[item.proxyPattern] = {
    target: item.target,
    changeOrigin: true,
    configure: (_proxy, options) => {
      _proxy.on('proxyReq', (_proxyReq, req, _res) => {
        if (!enableLog) return;

        const requestUrl = `${lightBlue('[proxy url]')}: ${bgYellow(` ${req.method} `)} ${green(
          `${item.proxyPattern}${req.url}`
        )}`;

        const proxyUrl = `${lightBlue('[real request url]')}: ${green(`${options.target}${req.url}`)}`;

        consola.log(`${requestUrl}\n${proxyUrl}`);
      });
      _proxy.on('error', (_err, req, _res) => {
        if (!enableLog) return;
        consola.log(bgRed(`Error: ${req.method} `), green(`${options.target}${req.url}`));
      });
    },
    rewrite: path => path.replace(new RegExp(`^${item.proxyPattern}`), '')
  };

  return proxy;
}
