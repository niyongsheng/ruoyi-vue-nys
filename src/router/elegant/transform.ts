// 改自 elegant-router 的构建期生成产物（本项目为运行期路由，此文件已是手工维护）：
// 视图解析改为 glob（见 @/router/dynamic/views.ts），文件尾部的 name<->path 映射
// 也换成了运行期注册表（见 @/router/dynamic/registry.ts）的同名 re-export

import type { RouteComponent, RouteRecordRaw } from 'vue-router';
import type { ElegantConstRoute } from '@elegant-router/vue';

/**
 * transform elegant const routes to vue routes
 * @param routes elegant const routes
 * @param layouts layout components
 * @param views view components
 */
export function transformElegantRoutesToVueRoutes(
  routes: ElegantConstRoute[],
  layouts: Record<string, RouteComponent | (() => Promise<RouteComponent>)>,
  views: Record<string, RouteComponent | (() => Promise<RouteComponent>)>
) {
  return routes.flatMap(route => transformElegantRouteToVueRoute(route, layouts, views));
}

/**
 * transform elegant route to vue route
 * @param route elegant const route
 * @param layouts layout components
 * @param views view components
 */
function transformElegantRouteToVueRoute(
  route: ElegantConstRoute,
  layouts: Record<string, RouteComponent | (() => Promise<RouteComponent>)>,
  views: Record<string, RouteComponent | (() => Promise<RouteComponent>)>
) {
  const LAYOUT_PREFIX = 'layout.';
  const VIEW_PREFIX = 'view.';
  const ROUTE_DEGREE_SPLITTER = '_';
  const FIRST_LEVEL_ROUTE_COMPONENT_SPLIT = '$';

  function isLayout(component: string) {
    return component.startsWith(LAYOUT_PREFIX);
  }

  function getLayoutName(component: string) {
    const layout = component.replace(LAYOUT_PREFIX, '');

    if (!layouts[layout]) {
      throw new Error(`Layout component "${layout}" not found`);
    }

    return layout;
  }

  function isView(component: string) {
    return component.startsWith(VIEW_PREFIX);
  }

  function getViewName(component: string) {
    const view = component.replace(VIEW_PREFIX, '');

    if (!views[view]) {
      // 后端 sys_menu.component 与前端文件路径不一致时，退化为 404 视图而不是中断整棵树
      // eslint-disable-next-line no-console
      console.error(
        `[route] 视图组件未找到：${view}（请检查后端 sys_menu.component 与前端文件路径是否一致），已退化为 404`
      );

      return '404';
    }

    return view;
  }

  function isFirstLevelRoute(item: ElegantConstRoute) {
    return !item.name.includes(ROUTE_DEGREE_SPLITTER);
  }

  function isSingleLevelRoute(item: ElegantConstRoute) {
    // 必须同时带 layout 前缀（'layout.base$view.xxx'）才算"单级路由"，
    // 否则纯 'view.xxx' 且无子路由的（后端菜单的子菜单）会走错分支
    return (
      isFirstLevelRoute(item) &&
      !item.children?.length &&
      Boolean(item.component?.includes(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT))
    );
  }

  function getSingleLevelRouteComponent(component: string) {
    const [layout, view] = component.split(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT);

    return {
      layout: getLayoutName(layout),
      view: getViewName(view)
    };
  }

  const vueRoutes: RouteRecordRaw[] = [];

  // add props: true to route
  if (route.path.includes(':') && !route.props) {
    route.props = true;
  }

  const { name, path, component, children, ...rest } = route;

  const vueRoute = { name, path, ...rest } as RouteRecordRaw;

  try {
    if (component) {
      if (isSingleLevelRoute(route)) {
        const { layout, view } = getSingleLevelRouteComponent(component);

        const singleLevelRoute: RouteRecordRaw = {
          path,
          component: layouts[layout],
          meta: {
            title: route.meta?.title || ''
          },
          children: [
            {
              name,
              path: '',
              component: views[view],
              ...rest
            } as RouteRecordRaw
          ]
        };

        return [singleLevelRoute];
      }

      if (isLayout(component)) {
        const layoutName = getLayoutName(component);

        vueRoute.component = layouts[layoutName];
      }

      if (isView(component)) {
        const viewName = getViewName(component);

        vueRoute.component = views[viewName];
      }
    }
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(`Error transforming route "${route.name}": ${error.toString()}`);
    return [];
  }

  // add redirect to child
  if (children?.length && !vueRoute.redirect) {
    vueRoute.redirect = {
      name: children[0].name
    };
  }

  if (children?.length) {
    const childRoutes = children.flatMap(child => transformElegantRouteToVueRoute(child, layouts, views));

    if (isFirstLevelRoute(route)) {
      vueRoute.children = childRoutes;
    } else {
      vueRoutes.push(...childRoutes);
    }
  }

  vueRoutes.unshift(vueRoute);

  return vueRoutes;
}

/**
 * 路由 name <-> path 映射改为运行期注册表（后端菜单驱动，编译期不可知）
 *
 * 实现见 src/router/dynamic/registry.ts
 */
export {
  getRouteName,
  getRoutePath,
  isRouteExistByPath,
  registerRoute,
  resetRegistry
} from '@/router/dynamic/registry';
