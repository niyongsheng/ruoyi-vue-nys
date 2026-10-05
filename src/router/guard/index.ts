import type { Router } from 'vue-router';
import { useTabStore } from '@/store/modules/tab';
import { createRouteGuard } from './route';
import { createProgressGuard } from './progress';
import { createDocumentTitleGuard } from './title';

/**
 * Router guard
 *
 * @param router - Router instance
 */
export function createRouterGuard(router: Router) {
  createProgressGuard(router);
  createRouteGuard(router);
  createDocumentTitleGuard(router);

  // 导航完成后登记页签（替代原来在 global-tab 组件里 watch 的方式）：
  // KeepAlive 的 include 必须在内容组件首次挂载前就包含该路由名，afterEach 时序更确定
  router.afterEach(to => {
    // not-found（含越权访问）不登记页签
    if (!to.name || to.name === 'not-found') return;

    // 布局之外的页面（constant：登录/注册/异常页/锁屏）不登记页签。
    // 它们走 layout.blank，根本没有页签栏；登记了反而会被 logout 时的
    // `tabStore.cacheTabs()` 持久化，等布局重新挂载（重新登录、锁屏解锁）时
    // 作为幽灵页签冒出来（典型现象：登录后页签栏多出一个「登录」页签）。
    if (to.meta.constant) return;

    const tabStore = useTabStore();

    tabStore.addTab(to as unknown as App.Global.TabRoute);
  });
}
