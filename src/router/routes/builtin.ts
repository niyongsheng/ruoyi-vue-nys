import type { CustomRoute } from '@elegant-router/types';
import { layouts, views } from '@/router/dynamic/views';
import { getRoutePath, registerRoute, transformElegantRoutesToVueRoutes } from '../elegant/transform';

export const ROOT_ROUTE: CustomRoute = {
  name: 'root',
  path: '/',
  // 注册表在模块初始化时可能为空，兜底到首页 /index（登录后 handleUpdateRootRouteRedirect 会重设）
  redirect: getRoutePath(import.meta.env.VITE_ROUTE_HOME) || '/index',
  meta: {
    title: 'root',
    constant: true
  }
};

const NOT_FOUND_ROUTE: CustomRoute = {
  name: 'not-found',
  path: '/:pathMatch(.*)*',
  component: 'layout.blank$view.404',
  meta: {
    title: 'not-found',
    constant: true
  }
};

const builtinRoutes: CustomRoute[] = [ROOT_ROUTE, NOT_FOUND_ROUTE];

export function createBuiltinVueRoutes() {
  builtinRoutes.forEach(route => registerRoute(route.name, route.path));

  return transformElegantRoutesToVueRoutes(builtinRoutes, layouts, views);
}
