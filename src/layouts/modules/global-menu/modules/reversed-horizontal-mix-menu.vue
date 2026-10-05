<script setup lang="ts">
import type { RouteKey } from '@elegant-router/types';
import { SimpleScrollbar } from '@sa/materials';
import { GLOBAL_HEADER_MENU_ID, GLOBAL_SIDER_MENU_ID } from '@/constants/app';
import { useAppStore } from '@/store/modules/app';
import { useRouterPush } from '@/hooks/common/router';
import { useMenu, useMixMenuContext } from '../../../context';
import MenuItem from '../components/menu-item.vue';

defineOptions({ name: 'ReversedHorizontalMixMenu' });

const appStore = useAppStore();
const { routerPushByKey } = useRouterPush();
const {
  firstLevelMenus,
  childLevelMenus,
  activeFirstLevelMenuKey,
  setActiveFirstLevelMenuKey,
  isActiveFirstLevelMenuHasChildren
} = useMixMenuContext();
const { selectedKeyDummy, handleSelect } = useMenu();

function handleSelectMixMenu(key: RouteKey) {
  setActiveFirstLevelMenuKey(key);

  if (!isActiveFirstLevelMenuHasChildren.value) {
    routerPushByKey(key);
  }
}
</script>

<template>
  <Teleport :to="`#${GLOBAL_HEADER_MENU_ID}`">
    <ElMenu
      ellipsis
      class="w-full"
      mode="horizontal"
      :default-active="activeFirstLevelMenuKey"
      @select="val => handleSelectMixMenu(val as RouteKey)"
    >
      <MenuItem v-for="item in firstLevelMenus" :key="item.key" :item="item" :index="item.key" />
    </ElMenu>
  </Teleport>
  <Teleport :to="`#${GLOBAL_SIDER_MENU_ID}`">
    <SimpleScrollbar>
      <ElMenu
        mode="vertical"
        :default-active="selectedKeyDummy"
        :collapse="appStore.siderCollapse"
        @select="val => handleSelect(val as RouteKey)"
      >
        <MenuItem v-for="item in childLevelMenus" :key="item.key" :item="item" :index="item.key" />
      </ElMenu>
    </SimpleScrollbar>
  </Teleport>
</template>
