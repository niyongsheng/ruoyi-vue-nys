import type { ElegantConstRoute } from '@elegant-router/types';
import { layouts, views } from '@/router/dynamic/views';
import { transformElegantRoutesToVueRoutes } from '../elegant/transform';
import { ruoyiConstantRoutes } from './ruoyi-fixed';

/**
 * 静态路由（对应 RuoYi 的 constantRoutes / dynamicRoutes）
 *
 * 注意：业务菜单不在这里，由后端 `/getRouters` 运行期下发（dynamic 模式）。
 */
export function createStaticRoutes() {
  return {
    constantRoutes: ruoyiConstantRoutes
  };
}

/**
 * 把 ElegantConstRoute 转成 vue-router 的路由记录
 *
 * @param routes Elegant routes
 */
export function getAuthVueRoutes(routes: ElegantConstRoute[]) {
  return transformElegantRoutesToVueRoutes(routes, layouts, views);
}
