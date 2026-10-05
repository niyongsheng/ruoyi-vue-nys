/* eslint-disable */
/**
 * 由 elegant-router 生成的路由类型已废弃，改为宽松类型
 *
 * 原因：本项目采用「后端菜单驱动」动态路由（sys_menu → /getRouters → 运行期 addRoute），
 * 路由表在编译期不可知，因此 RouteKey/RouteMap 等退化为 string。
 * 保留模块名与导出名，避免改动 20+ 处调用点。
 */
declare module '@elegant-router/types' {
  import type { RouteRecordRaw } from 'vue-router';

  type ElegantConstRoute = import('@elegant-router/vue').ElegantConstRoute;

  /** 路由布局 */
  export type RouteLayout = 'base' | 'blank';

  /** 路由名 */
  export type RouteKey = string;

  /** 路由路径 */
  export type RoutePath = string;

  /** 末级路由名 */
  export type LastLevelRouteKey = string;

  /** 路由名 → 路径映射 */
  export type RouteMap = Record<string, string>;

  /** 自定义路由 */
  export type CustomRoute = ElegantConstRoute;

  /** 路由 */
  export type ElegantRoute = ElegantConstRoute;

  export type { ElegantConstRoute, RouteRecordRaw };
}
