/**
 * 前端固定路由（不走后端 sys_menu）
 *
 * 对应 RuoYi `src/router/index.js` 的 constantRoutes / dynamicRoutes。
 * 后端菜单只提供"业务菜单"，首页/个人中心/登录等固定路由由前端维护。
 *
 * 说明：路由 meta 同时给了 `title`（中文兜底）与 `i18nKey`，消费方按
 * `i18nKey ? $t(i18nKey) : title` 取值（见 router/guard/title.ts、store/modules/tab/shared.ts），
 * 因此切换语言时浏览器标题、页签、面包屑都会跟着变。
 */
import type { CustomRoute } from '@elegant-router/types';
import { registerRoute } from '@/router/dynamic/registry';

/** 免登录常量路由 */
export const ruoyiConstantRoutes: CustomRoute[] = [
  {
    name: 'login',
    path: '/login',
    component: 'layout.blank$view.login',
    meta: {
      title: '登录',
      i18nKey: 'route.login',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: 'register',
    path: '/register',
    component: 'layout.blank$view.register',
    meta: {
      title: '注册',
      i18nKey: 'route.register',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: '401',
    path: '/401',
    component: 'layout.blank$view._builtin/401/index',
    meta: {
      title: '401',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: '403',
    path: '/403',
    component: 'layout.blank$view._builtin/403/index',
    meta: {
      title: '403',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: '404',
    path: '/404',
    component: 'layout.blank$view._builtin/404/index',
    meta: {
      title: '404',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: '500',
    path: '/500',
    component: 'layout.blank$view._builtin/500/index',
    meta: {
      title: '500',
      constant: true,
      hideInMenu: true
    }
  }
];

/** 登录后加载的固定路由 */
export const ruoyiAuthRoutes: CustomRoute[] = [
  {
    name: 'Index',
    path: '/index',
    // 首页用 soybean 原版工作台（src/views/home），组件名保持 Index
    component: 'layout.base$view.home/index',
    meta: {
      title: '首页',
      i18nKey: 'route.index',
      localIcon: 'dashboard',
      order: -1,
      fixedIndexInTab: 0
    }
  },
  {
    name: 'Profile',
    path: '/user/profile/:activeTab?',
    component: 'layout.base$view.system/user/profile/index',
    props: true,
    meta: {
      title: '个人中心',
      i18nKey: 'route.profile',
      localIcon: 'user',
      hideInMenu: true,
      activeMenu: 'Index'
    }
  },
  {
    name: 'Lock',
    path: '/lock',
    component: 'layout.blank$view.lock',
    meta: {
      title: '锁定屏幕',
      i18nKey: 'route.lock',
      constant: true,
      hideInMenu: true
    }
  },
  // ---- 以下对应 RuoYi 的 dynamicRoutes（隐藏路由 + 按钮级权限） ----
  {
    name: 'AuthRole',
    path: '/system/user-auth/role/:userId(\\d+)',
    component: 'layout.base$view.system/user/authRole',
    props: true,
    meta: {
      title: '分配角色',
      i18nKey: 'route.authRole',
      hideInMenu: true,
      activeMenu: 'User'
    },
    permissions: ['system:user:edit']
  } as CustomRoute,
  {
    name: 'AuthUser',
    path: '/system/role-auth/user/:roleId(\\d+)',
    component: 'layout.base$view.system/role/authUser',
    props: true,
    meta: {
      title: '分配用户',
      i18nKey: 'route.authUser',
      hideInMenu: true,
      activeMenu: 'Role'
    },
    permissions: ['system:role:edit']
  } as CustomRoute,
  {
    name: 'Data',
    path: '/system/dict-data/index/:dictId(\\d+)',
    component: 'layout.base$view.system/dict/data',
    props: true,
    meta: {
      title: '字典数据',
      i18nKey: 'route.dictData',
      hideInMenu: true,
      activeMenu: 'Dict'
    },
    permissions: ['system:dict:list']
  } as CustomRoute,
  {
    name: 'JobLog',
    path: '/monitor/job-log/index/:jobId(\\d+)',
    component: 'layout.base$view.monitor/job/log',
    props: true,
    meta: {
      title: '调度日志',
      i18nKey: 'route.jobLog',
      hideInMenu: true,
      activeMenu: 'Job'
    },
    permissions: ['monitor:job:list']
  } as CustomRoute,
  {
    name: 'GenEdit',
    path: '/tool/gen-edit/index/:tableId(\\d+)',
    component: 'layout.base$view.tool/gen/editTable',
    props: true,
    meta: {
      title: '修改生成配置',
      i18nKey: 'route.genEdit',
      hideInMenu: true,
      activeMenu: 'Gen'
    },
    permissions: ['tool:gen:edit']
  } as CustomRoute
];

/** 注册固定路由的 name <-> path 映射 */
export function registerFixedRoutes() {
  [...ruoyiConstantRoutes, ...ruoyiAuthRoutes].forEach(route => {
    registerRoute(route.name, route.path);
  });
}
