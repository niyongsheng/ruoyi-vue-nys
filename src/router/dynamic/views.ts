/**
 * 视图组件表（glob 版）
 *
 * 替换 elegant-router 构建期生成的 `src/router/elegant/imports.ts` 里的静态 `views` 表。
 * Key 与 RuoYi 后端 `sys_menu.component` 字段完全一致，例如 'system/user/index'。
 */
// 布局组件懒加载：静态导入会让整个外壳（header/sider/tab/通知/搜索弹窗）
// 进入入口 chunk，登录页等无布局路由也要为它买单（实测入口 gzip −49 KB）
export const layouts: Record<string, any> = {
  base: () => import('@/layouts/base-layout/index.vue'),
  blank: () => import('@/layouts/blank-layout/index.vue')
};

const modules = import.meta.glob('/src/views/**/*.vue');

const viewMap: Record<string, () => Promise<any>> = {};

Object.keys(modules).forEach(key => {
  // '/src/views/system/user/index.vue' → 'system/user/index'
  const dir = key.split('/views/')[1]?.replace(/\.vue$/, '');
  if (dir) {
    viewMap[dir] = modules[key] as () => Promise<any>;
  }
});

// 特殊视图：RuoYi 的 ParentView / InnerLink 组件，以及 404 兜底
viewMap.ParentView = () => import('@/components/ParentView/index.vue');
viewMap.InnerLink = () => import('@/components/InnerLink/index.vue');
viewMap['404'] = () => import('@/views/_builtin/404/index.vue');

export const views = viewMap;
