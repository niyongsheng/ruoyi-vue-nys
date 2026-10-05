import type { LocationQueryRaw, RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router';
import type { RouteKey, RoutePath } from '@elegant-router/types';
import { useLockStore } from '@/store/modules/lock';
import { useRouteStore } from '@/store/modules/route';
import { getToken } from '@/utils/auth';
import { getRouteName } from '@/router/elegant/transform';

/**
 * create route guard
 *
 * @param router router instance
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const location = await initRoute(to);

    if (location) {
      return location;
    }

    const rootRoute: RouteKey = 'root';
    const loginRoute: RouteKey = 'login';

    const isLogin = Boolean(getToken());

    // 锁屏拦截（对应 RuoYi permission.js）：登录态下锁定后只能停留在锁屏页
    if (isLogin) {
      const isLocked = useLockStore().isLock;

      if (isLocked && to.path !== '/lock') {
        return { path: '/lock' };
      }

      if (!isLocked && to.path === '/lock') {
        return { path: '/' };
      }
    }

    const needLogin = !to.meta.constant;

    // if it is login route when logged in, then switch to the root page
    if (to.name === loginRoute && isLogin) {
      return { name: rootRoute };
    }

    // if the route does not need login, then it is allowed to access directly
    if (!needLogin) {
      return handleRouteSwitch(to, from);
    }

    // the route need login but the user is not logged in, then switch to the login page
    if (!isLogin) {
      return { name: loginRoute, query: { redirect: to.fullPath } };
    }

    // switch route normally
    return handleRouteSwitch(to, from);
  });
}

/**
 * initialize route
 *
 * @param to to route
 */
async function initRoute(to: RouteLocationNormalized): Promise<RouteLocationRaw | undefined> {
  const routeStore = useRouteStore();

  const notFoundRoute: RouteKey = 'not-found';
  const isNotFoundRoute = to.name === notFoundRoute;

  // if the constant route is not initialized, then initialize the constant route
  if (!routeStore.isInitConstantRoute) {
    await routeStore.initConstantRoute();

    // the route is captured by the "not-found" route because the constant route is not initialized
    // after the constant route is initialized, redirect to the original route
    const path = to.fullPath;
    const location: RouteLocationRaw = {
      path,
      replace: true,
      query: to.query,
      hash: to.hash
    };

    return location;
  }

  const isLogin = Boolean(getToken());

  if (!isLogin) {
    // if the user is not logged in and the route is a constant route but not the "not-found" route, then it is allowed to access.
    if (to.meta.constant && !isNotFoundRoute) {
      routeStore.onRouteSwitchWhenNotLoggedIn();

      return undefined;
    }

    // if the user is not logged in, then switch to the login page
    const loginRoute: RouteKey = 'login';
    const query = getRouteQueryOfLoginRoute(to, routeStore.routeHome);

    const location: RouteLocationRaw = {
      name: loginRoute,
      query
    };

    return location;
  }

  if (!routeStore.isInitAuthRoute) {
    // initialize the auth route
    await routeStore.initAuthRoute();

    // the route is captured by the "not-found" route because the auth route is not initialized
    // after the auth route is initialized, redirect to the original route
    if (isNotFoundRoute) {
      const rootRoute: RouteKey = 'root';
      const path = to.redirectedFrom?.name === rootRoute ? '/' : to.fullPath;

      const location: RouteLocationRaw = {
        path,
        replace: true,
        query: to.query,
        hash: to.hash
      };

      return location;
    }
  }

  routeStore.onRouteSwitchWhenLoggedIn();

  // the auth route is initialized
  // it is not the "not-found" route, then it is allowed to access
  if (!isNotFoundRoute) {
    return undefined;
  }

  // it is captured by the "not-found" route, then check whether the route exists
  const exist = await routeStore.getIsAuthRouteExist(to.path as RoutePath);
  const noPermissionRoute: RouteKey = '403';

  if (exist) {
    const location: RouteLocationRaw = {
      name: noPermissionRoute
    };

    return location;
  }

  return undefined;
}

function handleRouteSwitch(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  // route with href
  if (to.meta.href) {
    // 外链地址来自后端菜单配置：noopener 防止新页面通过 window.opener 反向操纵本管理端标签页
    window.open(to.meta.href, '_blank', 'noopener,noreferrer');

    return { path: from.fullPath, replace: true, query: from.query, hash: to.hash };
  }
  return undefined;
}

function getRouteQueryOfLoginRoute(to: RouteLocationNormalized, routeHome: RouteKey) {
  const loginRoute: RouteKey = 'login';
  const redirect = to.fullPath;
  const [redirectPath, redirectQuery] = redirect.split('?');
  const redirectName = getRouteName(redirectPath as RoutePath);

  const isRedirectHome = routeHome === redirectName;

  const query: LocationQueryRaw = to.name !== loginRoute && !isRedirectHome ? { redirect } : {};

  if (isRedirectHome && redirectQuery) {
    query.redirect = `/?${redirectQuery}`;
  }

  return query;
}
