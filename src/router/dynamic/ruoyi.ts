/**
 * RuoYi `/getRouters` 返回结构 → ElegantConstRoute 转换
 *
 * RuoYi 的 RouterVo 结构见 nys_fast_service 的 SysMenuServiceImpl.buildMenus()。
 * 后端约定：
 *  - component: 'Layout' | 'ParentView' | 'InnerLink' | 'system/user/index'（视图路径）
 *  - hidden: 是否在菜单隐藏；redirect: 'noRedirect'；meta: {title, icon, noCache, link}
 *  - 子路由 path 为相对路径，父路由 path 以 / 开头
 */
import type { RouteMeta } from 'vue-router';
import type { ElegantConstRoute } from '@elegant-router/types';
import { registerRoute } from './registry';

interface RuoYiRouteMeta {
  title?: string;
  icon?: string;
  noCache?: boolean;
  link?: string | null;
}

export interface RuoYiRouterVo {
  name?: string;
  path: string;
  hidden?: boolean;
  redirect?: string;
  component?: string | null;
  alwaysShow?: boolean;
  query?: string;
  meta?: RuoYiRouteMeta | null;
  children?: RuoYiRouterVo[];
}

const EXTERNAL_LINK_REGEXP = /^https?:\/\//i;

/** 拼接父子路径 */
function joinPath(parentPath: string, path: string) {
  if (!parentPath) return path;
  if (path.startsWith('/')) return path;
  return `${parentPath.replace(/\/$/, '')}/${path}`;
}

/** RuoYi component 字符串 → ElegantConstRoute 的 component */
function transformComponent(component?: string | null) {
  if (!component) return undefined;

  if (component === 'Layout') return 'layout.base';
  if (component === 'ParentView') return 'view.ParentView';
  if (component === 'InnerLink') return 'view.InnerLink';

  return `view.${component}`;
}

/**
 * 转换 RuoYi 路由数组
 *
 * @param routes 后端返回的路由数组
 * @param parentPath 父级完整路径（递归用）
 */
export function transformRuoYiRoutes(routes: RuoYiRouterVo[], parentPath = ''): ElegantConstRoute[] {
  const result: ElegantConstRoute[] = [];

  routes.forEach((route, index) => {
    const fullPath = joinPath(parentPath, route.path);
    const isExternal = EXTERNAL_LINK_REGEXP.test(route.path) || Boolean(route.meta?.link);
    const children = route.children?.length ? transformRuoYiRoutes(route.children, fullPath) : undefined;

    // 后端对"一级菜单"会包一层 meta 为 null 的 Layout 壳（isMenuFrame），此处拍平
    if (!route.meta && children?.length === 1) {
      result.push(children[0]);
      return;
    }

    // 一级路由 name 缺失时用 path 生成（保证唯一）
    const name = route.name || `Route${index}${fullPath.replace(/\W/g, '')}`;

    const elegantRoute: ElegantConstRoute = {
      name,
      path: isExternal ? `/external-link/${name}` : fullPath,
      component: transformComponent(route.component),
      meta: buildMeta(route, index, isExternal)
    };

    if (children?.length) {
      elegantRoute.children = children;
      // 目录路由：redirect 到第一个可见子路由，避免直接访问时空白
      const firstVisibleChild = children.find(child => !child.meta?.hideInMenu) || children[0];
      elegantRoute.redirect = firstVisibleChild.path;
    }

    registerRoute(name, String(elegantRoute.path));

    result.push(elegantRoute);
  });

  return result;
}

/** 组装路由 meta */
function buildMeta(route: RuoYiRouterVo, index: number, isExternal: boolean): RouteMeta {
  const meta: RouteMeta = {
    title: route.meta?.title ?? '',
    order: index,
    hideInMenu: Boolean(route.hidden),
    // RuoYi 的 noCache → soybean 的 keepAlive（反向）
    keepAlive: !route.meta?.noCache
  };

  if (route.meta?.icon) {
    meta.localIcon = route.meta.icon;
  }

  if (isExternal) {
    // 外链：注册为安全路径 + meta.href，由路由守卫 window.open 打开（见 router/guard/route.ts）
    meta.href = route.meta?.link || route.path;
  }

  return meta;
}
