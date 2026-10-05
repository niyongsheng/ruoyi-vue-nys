import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { getInfo, login as loginApi } from '@/api/login';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { getToken, removeToken, setToken } from '@/utils/auth';
import { SetupStoreId } from '@/enum';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';

/** RuoYi `/getInfo` 返回的用户信息 */
interface RuoYiUser {
  userId?: number | string;
  userName?: string;
  nickName?: string;
  avatar?: string;
}

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref(getToken());

  const userInfo = reactive({
    userId: '' as string | number,
    userName: '',
    nickName: '',
    avatar: '',
    roles: [] as string[],
    /** RuoYi 的按钮权限标识，如 system:user:add（v-hasPermi 用） */
    permissions: [] as string[],
    pwdChrtype: '' as string,
    isDefaultModifyPwd: false,
    isPasswordExpired: false
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store */
  async function resetStore() {
    recordUserId();

    removeToken();

    authStore.$reset();

    if (!route.meta.constant) {
      await toLogin();
    }

    tabStore.cacheTabs();
    routeStore.resetStore();
  }

  /** Record the user ID of the previous login session */
  function recordUserId() {
    if (!userInfo.userId) {
      return;
    }

    localStg.set('lastLoginUserId', String(userInfo.userId));
  }

  /** Check if current login user is different from previous login user */
  function checkTabClear(): boolean {
    if (!userInfo.userId) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    if (lastLoginUserId !== String(userInfo.userId)) {
      localStg.remove('globalTabs');
      tabStore.clearTabs();

      return true;
    }

    return false;
  }

  /**
   * 登录（对齐 RuoYi 的调用形态：传入表单对象）
   *
   * @param loginForm { username, password, code, uuid }
   * @param redirect 登录后是否跳转，默认 true
   * @returns 是否登录成功（登录页据此决定是否刷新验证码）
   */
  async function login(
    loginForm: { username: string; password: string; code?: string; uuid?: string },
    redirect = true
  ): Promise<boolean> {
    startLoading();

    try {
      const res: any = await loginApi(loginForm.username, loginForm.password, loginForm.code, loginForm.uuid);

      // RuoYi 返回 { code, msg, token }
      setToken(res.token);
      token.value = res.token;

      const pass = await getUserInfo();

      if (!pass) {
        await resetStore();

        return false;
      }

      const isClear = checkTabClear();
      const needRedirect = isClear ? false : redirect;

      await redirectFromLogin(needRedirect);

      return true;
    } catch (e) {
      // 登录失败：request 拦截器已提示对应错误
      console.error(e);

      return false;
    } finally {
      endLoading();
    }
  }

  /** 拉取用户信息（RuoYi /getInfo） */
  async function getUserInfo() {
    try {
      const res: any = await getInfo();

      const user: RuoYiUser = res.user || {};

      userInfo.userId = user.userId ?? '';
      userInfo.userName = user.userName ?? '';
      userInfo.nickName = user.nickName ?? user.userName ?? '';
      userInfo.avatar = user.avatar ?? '';
      userInfo.roles = res.roles || [];
      userInfo.permissions = res.permissions || [];
      userInfo.pwdChrtype = res.pwdChrtype ?? '';
      userInfo.isDefaultModifyPwd = Boolean(res.isDefaultModifyPwd);
      userInfo.isPasswordExpired = Boolean(res.isPasswordExpired);

      if (userInfo.isDefaultModifyPwd) {
        window.$notification?.warning({ title: '提示', message: '您的密码为初始密码，请及时修改', duration: 0 });
      } else if (userInfo.isPasswordExpired) {
        window.$notification?.warning({ title: '提示', message: '您的密码已过期，请及时修改', duration: 0 });
      }

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /** 确保用户信息已就绪（幂等：已初始化则直接返回，避免每次导航都请求 /getInfo） */
  async function initUserInfo() {
    if (userInfo.userId) return;

    const hasToken = getToken();

    if (hasToken) {
      const pass = await getUserInfo();

      if (!pass) {
        await resetStore();
      }
    }
  }

  return {
    token,
    userInfo,
    isLogin,
    loginLoading,
    resetStore,
    login,
    getUserInfo,
    initUserInfo
  };
});
