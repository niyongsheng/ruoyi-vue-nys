<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core';
import type { RouteKey } from '@elegant-router/types';
import { useThemeStore } from '@/store/modules/theme';
import { useRouteStore } from '@/store/modules/route';
import { useRouterPush } from '@/hooks/common/router';

defineOptions({ name: 'GlobalBreadcrumb' });

const themeStore = useThemeStore();
const routeStore = useRouteStore();
const { routerPushByKey } = useRouterPush();

interface BreadcrumbContentProps {
  breadcrumb: App.Global.Menu;
}

const [DefineBreadcrumbContent, BreadcrumbContent] = createReusableTemplate<BreadcrumbContentProps>();

function handleClickMenu(key: RouteKey) {
  routerPushByKey(key);
}
</script>

<template>
  <ElBreadcrumb v-if="themeStore.header.breadcrumb.visible">
    <!-- define component start: BreadcrumbContent -->
    <DefineBreadcrumbContent v-slot="{ breadcrumb }">
      <div class="i-flex-y-center align-middle">
        <component :is="breadcrumb.icon" v-if="themeStore.header.breadcrumb.showIcon" class="mr-4px text-icon" />
        {{ breadcrumb.label }}
      </div>
    </DefineBreadcrumbContent>

    <!-- define component end: BreadcrumbContent -->
    <ElBreadcrumbItem v-for="item in routeStore.breadcrumbs" :key="item.key">
      <ElDropdown v-if="item.options?.length" @command="handleClickMenu">
        <BreadcrumbContent :breadcrumb="item" />
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem v-for="option in item.options" :key="option.key" :command="option.key">
              {{ option.label }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <BreadcrumbContent v-else :breadcrumb="item" />
    </ElBreadcrumbItem>
  </ElBreadcrumb>
</template>

<style scoped>
/* 层级色差：上级深、当前页浅（EP 只在有 to 时才区分，这里补齐；保持 400 字重，不用 EP 链接态的 700） */
:deep(.el-breadcrumb__item:not(:last-child) .el-breadcrumb__inner) {
  color: var(--el-text-color-primary);
}

/* 面包屑图标比菜单图标小一档（14px，与 14px 文字齐平）
   注意：图标 VNode 与菜单共用（getGlobalMenuByBaseRoute），尺寸是 SvgIconVNode 写的
   内联 style，CSS 类压不过，只能用 !important 覆盖 */
:deep(.el-breadcrumb__inner svg) {
  font-size: 14px !important;
}
</style>
