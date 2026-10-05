import { computed, ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import { defineStore } from 'pinia';
import type { RouteKey } from '@elegant-router/types';
import { router } from '@/router';
import { useRouteStore } from '@/store/modules/route';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { useThemeStore } from '../theme';
import {
  extractTabsByAllRoutes,
  filterTabsByIds,
  findTabByRouteName,
  getAllTabs,
  getDefaultHomeTab,
  getFixedTabIds,
  getTabByRoute,
  getTabIdByRoute,
  isTabInTabs,
  updateTabByI18nKey,
  updateTabsByI18nKey
} from './shared';

export const useTabStore = defineStore(SetupStoreId.Tab, () => {
  const routeStore = useRouteStore();
  const themeStore = useThemeStore();
  const { routerPush } = useRouterPush(false);

  /** Tabs */
  const tabs = ref<App.Global.Tab[]>([]);

  /** Get active tab */
  const homeTab = ref<App.Global.Tab>();

  /** Init home tab */
  function initHomeTab() {
    homeTab.value = getDefaultHomeTab(router, routeStore.routeHome);
  }

  /** Get all tabs */
  const allTabs = computed(() => getAllTabs(tabs.value, homeTab.value));

  /** Active tab id */
  const activeTabId = ref<string>('');

  /** 页签是否已经初始化过（区分冷启动与布局重新挂载，见 initTabStore） */
  let isTabsInited = false;

  /**
   * 需要 KeepAlive 缓存的路由名（RuoYi 语义：以打开的页签为准）
   *
   * 替换原来由 routeStore.cacheRoutes 静态派生的方式：打开页签即缓存、关闭页签即清缓存。
   */
  const cachedRouteKeys = computed(() =>
    allTabs.value.filter(tab => tab.keepAlive !== false && tab.routeKey).map(tab => tab.routeKey)
  );

  /**
   * Set active tab id
   *
   * @param id Tab id
   */
  function setActiveTabId(id: string) {
    activeTabId.value = id;
  }

  /**
   * Init tab store
   *
   * @param currentRoute Current route
   */
  function initTabStore(currentRoute: App.Global.TabRoute) {
    const storageTabs = localStg.get('globalTabs');

    // 只在冷启动（布局第一次挂载）时从 localStorage 恢复页签。
    // 锁屏解锁、进出 blank 布局页面（登录/异常页）、重新登录都会让布局重新挂载，
    // 而持久化快照只在 beforeunload / 退出登录时写入——那时若再恢复，
    // 就会用一份更旧的快照覆盖掉本次会话里新开的页签。
    if (themeStore.tab.cache && storageTabs && !isTabsInited) {
      const extractedTabs = extractTabsByAllRoutes(router, storageTabs);
      tabs.value = updateTabsByI18nKey(extractedTabs);
    }

    // 注意不能用 `tabs.value.length` 判断是否冷启动：路由 afterEach 里的页签登记
    // 可能早于布局挂载，此时内存里已经有当前页签了
    isTabsInited = true;

    addTab(currentRoute);
  }

  /**
   * Add tab
   *
   * @param route Tab route
   * @param active Whether to activate the added tab
   */
  function addTab(route: App.Global.TabRoute, active = true) {
    const tab = getTabByRoute(route);

    const isHomeTab = tab.id === homeTab.value?.id;

    if (!isHomeTab && !isTabInTabs(tab.id, tabs.value)) {
      tabs.value.push(tab);
    }

    if (active) {
      setActiveTabId(tab.id);
    }
  }

  /**
   * Remove tab when remove active tab, switch to next tab or home tab
   *
   * @param tabId Tab id
   */
  async function removeTab(tabId: string) {
    const removeTabIndex = tabs.value.findIndex(tab => tab.id === tabId);
    if (removeTabIndex === -1) return;

    const isRemoveActiveTab = activeTabId.value === tabId;

    // if remove the last tab, then switch to the second last tab
    const nextTab = tabs.value[removeTabIndex + 1] || tabs.value[removeTabIndex - 1] || homeTab.value;

    // remove tab
    tabs.value.splice(removeTabIndex, 1);

    // if current tab is removed, then switch to next tab
    if (isRemoveActiveTab && nextTab) {
      await switchRouteByTab(nextTab);
    }
  }

  /** remove active tab */
  async function removeActiveTab() {
    await removeTab(activeTabId.value);
  }

  /**
   * remove tab by route name
   *
   * @param routeName route name
   */
  async function removeTabByRouteName(routeName: RouteKey) {
    const tab = findTabByRouteName(routeName, tabs.value);
    if (!tab) return;

    await removeTab(tab.id);
  }

  /**
   * Clear tabs
   *
   * @param excludes Exclude tab ids
   */
  async function clearTabs(excludes: string[] = []) {
    const remainTabIds = [...getFixedTabIds(tabs.value), ...excludes];

    const tabsToRemove = tabs.value.filter(tab => !remainTabIds.includes(tab.id));

    const removedTabsIds = tabsToRemove.map(tab => tab.id);

    // If no tabs are actually being removed based on excludes and fixed tabs, exit
    if (removedTabsIds.length === 0) {
      return;
    }

    const isRemoveActiveTab = removedTabsIds.includes(activeTabId.value);
    // filterTabsByIds returns tabs NOT in removedTabsIds, so these are the tabs that will remain
    const updatedTabs = filterTabsByIds(removedTabsIds, tabs.value);

    if (isRemoveActiveTab) {
      const activeTabCandidate = updatedTabs[updatedTabs.length - 1] || homeTab.value;

      if (activeTabCandidate) {
        // Ensure there's a tab to switch to
        await switchRouteByTab(activeTabCandidate);
      }
    }

    tabs.value = updatedTabs;
  }

  /**
   * Switch route by tab
   *
   * @param tab
   */
  async function switchRouteByTab(tab: App.Global.Tab) {
    const fail = await routerPush(tab.fullPath);
    if (!fail) {
      setActiveTabId(tab.id);
    }
  }

  /**
   * Clear left tabs
   *
   * @param tabId
   */
  async function clearLeftTabs(tabId: string) {
    const tabIds = tabs.value.map(tab => tab.id);
    const index = tabIds.indexOf(tabId);
    if (index === -1) return;

    const excludes = tabIds.slice(index);
    await clearTabs(excludes);
  }

  /**
   * Clear right tabs
   *
   * @param tabId
   */
  async function clearRightTabs(tabId: string) {
    const isHomeTab = tabId === homeTab.value?.id;
    if (isHomeTab) {
      clearTabs();
      return;
    }

    const tabIds = tabs.value.map(tab => tab.id);
    const index = tabIds.indexOf(tabId);
    if (index === -1) return;

    const excludes = tabIds.slice(0, index + 1);
    await clearTabs(excludes);
  }

  /**
   * Set new label of tab
   *
   * @default activeTabId
   * @param label New tab label
   * @param tabId Tab id
   */
  function setTabLabel(label: string, tabId?: string) {
    const id = tabId || activeTabId.value;

    const tab = tabs.value.find(item => item.id === id);
    if (!tab) return;

    tab.oldLabel = tab.label;
    tab.newLabel = label;
  }

  /**
   * Reset tab label
   *
   * @default activeTabId
   * @param tabId Tab id
   */
  function resetTabLabel(tabId?: string) {
    const id = tabId || activeTabId.value;

    const tab = tabs.value.find(item => item.id === id);
    if (!tab) return;

    tab.newLabel = undefined;
  }

  /**
   * Is tab retain
   *
   * @param tabId
   */
  function isTabRetain(tabId: string) {
    if (tabId === homeTab.value?.id) return true;

    const fixedTabIds = getFixedTabIds(tabs.value);

    return fixedTabIds.includes(tabId);
  }

  /** Update tabs by locale */
  function updateTabsByLocale() {
    tabs.value = updateTabsByI18nKey(tabs.value);

    if (homeTab.value) {
      homeTab.value = updateTabByI18nKey(homeTab.value);
    }
  }

  /** Cache tabs */
  function cacheTabs() {
    if (!themeStore.tab.cache) return;

    localStg.set('globalTabs', tabs.value);
  }

  // cache tabs when page is closed or refreshed
  useEventListener(window, 'beforeunload', () => {
    cacheTabs();
  });

  return {
    /** All tabs */
    tabs: allTabs,
    activeTabId,
    cachedRouteKeys,
    initHomeTab,
    initTabStore,
    addTab,
    removeTab,
    removeActiveTab,
    removeTabByRouteName,
    clearTabs,
    clearLeftTabs,
    clearRightTabs,
    switchRouteByTab,
    setTabLabel,
    resetTabLabel,
    isTabRetain,
    updateTabsByLocale,
    getTabIdByRoute,
    cacheTabs
  };
});
