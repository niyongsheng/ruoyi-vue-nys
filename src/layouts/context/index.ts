import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useContext } from '@sa/hooks';
import type { RouteKey } from '@elegant-router/types';
import { useRouteStore } from '@/store/modules/route';
import { useRouterPush } from '@/hooks/common/router';

export const { setupStore: setupMixMenuContext, useStore: useMixMenuContext } = useContext('mix-menu', useMixMenu);

function useMixMenu() {
  const route = useRoute();
  const routeStore = useRouteStore();
  const { selectedKey } = useMenu();

  const activeFirstLevelMenuKey = ref('');

  const allMenus = computed<App.Global.Menu[]>(() => routeStore.menus);

  function setActiveFirstLevelMenuKey(key: string) {
    activeFirstLevelMenuKey.value = key;
  }

  /**
   * 求当前路由所属的一级菜单 key
   *
   * 按菜单树逐层查找（后端下发的 route name 不含下划线，如 `User` 而不是 `System_user`，
   * 因此不能靠 `split('_')` 反推层级——否则一级 key 会变成子菜单名，`childLevelMenus` 为空，
   * 表现为「固定侧边栏后切换菜单，子菜单抽屉仍被关掉」）。查找失败时退回下划线约定。
   */
  function getActiveFirstLevelMenuKey() {
    const key = selectedKey.value;
    const topLevelMenu = allMenus.value.find(menu => menuContainsKey(menu, key));

    setActiveFirstLevelMenuKey(topLevelMenu?.key ?? key.split('_')[0]);
  }

  function menuContainsKey(menu: App.Global.Menu, key: string): boolean {
    if (menu.key === key) return true;

    return Boolean(menu.children?.some(child => menuContainsKey(child, key)));
  }

  const firstLevelMenus = computed<App.Global.Menu[]>(() =>
    routeStore.menus.map(menu => {
      const { children: _, ...rest } = menu;

      return rest;
    })
  );

  const childLevelMenus = computed<App.Global.Menu[]>(
    () => routeStore.menus.find(menu => menu.key === activeFirstLevelMenuKey.value)?.children || []
  );

  const isActiveFirstLevelMenuHasChildren = computed(() => {
    if (!activeFirstLevelMenuKey.value) {
      return false;
    }

    const findItem = allMenus.value.find(item => item.key === activeFirstLevelMenuKey.value);

    return Boolean(findItem?.children?.length);
  });

  watch(
    () => route.name,
    () => {
      getActiveFirstLevelMenuKey();
    },
    { immediate: true }
  );

  return {
    allMenus,
    firstLevelMenus,
    childLevelMenus,
    isActiveFirstLevelMenuHasChildren,
    activeFirstLevelMenuKey,
    setActiveFirstLevelMenuKey,
    getActiveFirstLevelMenuKey
  };
}

export function useMenu() {
  const route = useRoute();
  const { routerPushByKey } = useRouterPush();

  const selectedKey = computed(() => {
    const { hideInMenu, activeMenu } = route.meta;
    const name = route.name as string;

    const routeName = (hideInMenu ? activeMenu : name) || name;

    return routeName;
  });

  const selectedKeyDummy = ref(selectedKey.value);

  watch(
    () => selectedKey.value,
    val => {
      selectedKeyDummy.value = val;
    }
  );

  function handleSelect(key: RouteKey) {
    selectedKeyDummy.value = key;

    routerPushByKey(key);
  }

  return {
    selectedKey,
    selectedKeyDummy,
    handleSelect
  };
}
