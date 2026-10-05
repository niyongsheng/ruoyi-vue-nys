<script setup lang="ts">
import { computed } from 'vue';
import { themePageAnimationModeOptions, themeScrollModeOptions, themeTabModeOptions } from '@/constants/app';
import { useThemeStore } from '@/store/modules/theme';
import { translateOptions } from '@/utils/common';
import { $t } from '@/locales';
import SettingItem from '../components/setting-item.vue';

defineOptions({ name: 'PageFun' });

const themeStore = useThemeStore();

const layoutMode = computed(() => themeStore.layout.mode);

const isMixLayoutMode = computed(() => layoutMode.value.includes('mix'));

const isWrapperScrollMode = computed(() => themeStore.layout.scrollMode === 'wrapper');
</script>

<template>
  <ElDivider>{{ $t('theme.pageFunTitle') }}</ElDivider>
  <!--
    设置项按归属分组（通用 / 顶栏 / 标签栏 / 侧边栏 / 页脚 / 水印），组内顺序与视觉层级一致：
    开关在前、尺寸在后。新增设置项请归入对应组的标题下方。
  -->
  <TransitionGroup tag="div" name="setting-list" class="flex-col-stretch gap-12px">
    <div key="group-general" class="setting-group">{{ $t('theme.group.general') }}</div>
    <SettingItem key="general-1" :label="$t('theme.componentSize.title')">
      <ElRadioGroup v-model="themeStore.componentSize" size="small">
        <ElRadioButton value="large">{{ $t('theme.componentSize.large') }}</ElRadioButton>
        <ElRadioButton value="default">{{ $t('theme.componentSize.default') }}</ElRadioButton>
        <ElRadioButton value="small">{{ $t('theme.componentSize.small') }}</ElRadioButton>
      </ElRadioGroup>
    </SettingItem>
    <SettingItem key="general-2" :label="$t('theme.scrollMode.title')">
      <ElSelect v-model="themeStore.layout.scrollMode" size="small" class="w-120px">
        <ElOption
          v-for="{ label, value } in translateOptions(themeScrollModeOptions)"
          :key="value"
          :label="label"
          :value="value"
        />
      </ElSelect>
    </SettingItem>
    <SettingItem key="general-3" :label="$t('theme.page.animate')">
      <ElSwitch v-model="themeStore.page.animate" />
    </SettingItem>
    <SettingItem v-if="themeStore.page.animate" key="general-3-1" :label="$t('theme.page.mode.title')">
      <ElSelect v-model="themeStore.page.animateMode" size="small" class="w-120px">
        <ElOption
          v-for="{ label, value } in translateOptions(themePageAnimationModeOptions)"
          :key="value"
          :label="label"
          :value="value"
        />
      </ElSelect>
    </SettingItem>
    <SettingItem v-if="isWrapperScrollMode" key="general-4" :label="$t('theme.fixedHeaderAndTab')">
      <ElSwitch v-model="themeStore.fixedHeaderAndTab" />
    </SettingItem>

    <div key="group-header" class="setting-group">{{ $t('theme.group.header') }}</div>
    <SettingItem key="header-1" :label="$t('theme.header.height')">
      <ElInputNumber v-model="themeStore.header.height" size="small" :step="1" class="w-120px" />
    </SettingItem>
    <SettingItem key="header-2" :label="$t('theme.header.breadcrumb.visible')">
      <ElSwitch v-model="themeStore.header.breadcrumb.visible" />
    </SettingItem>
    <SettingItem
      v-if="themeStore.header.breadcrumb.visible"
      key="header-2-1"
      :label="$t('theme.header.breadcrumb.showIcon')"
    >
      <ElSwitch v-model="themeStore.header.breadcrumb.showIcon" />
    </SettingItem>
    <SettingItem key="header-3" :label="$t('theme.header.multilingual.visible')">
      <ElSwitch v-model="themeStore.header.multilingual.visible" />
    </SettingItem>
    <SettingItem key="header-4" :label="$t('theme.header.globalSearch.visible')">
      <ElSwitch v-model="themeStore.header.globalSearch.visible" />
    </SettingItem>

    <div key="group-tab" class="setting-group">{{ $t('theme.group.tab') }}</div>
    <SettingItem key="tab-1" :label="$t('theme.tab.visible')">
      <ElSwitch v-model="themeStore.tab.visible" />
    </SettingItem>
    <SettingItem v-if="themeStore.tab.visible" key="tab-2" :label="$t('theme.tab.cache')">
      <ElSwitch v-model="themeStore.tab.cache" />
    </SettingItem>
    <SettingItem v-if="themeStore.tab.visible" key="tab-3" :label="$t('theme.tab.icon')">
      <ElSwitch v-model="themeStore.tab.icon" />
    </SettingItem>
    <SettingItem v-if="themeStore.tab.visible" key="tab-4" :label="$t('theme.tab.mode.title')">
      <ElRadioGroup v-model="themeStore.tab.mode" size="small">
        <ElRadioButton v-for="{ label, value } in translateOptions(themeTabModeOptions)" :key="value" :value="value">
          {{ label }}
        </ElRadioButton>
      </ElRadioGroup>
    </SettingItem>
    <SettingItem v-if="themeStore.tab.visible" key="tab-5" :label="$t('theme.tab.height')">
      <ElInputNumber v-model="themeStore.tab.height" size="small" :step="1" class="w-120px" />
    </SettingItem>

    <template v-if="layoutMode === 'vertical' || isMixLayoutMode">
      <div key="group-sider" class="setting-group">{{ $t('theme.group.sider') }}</div>
      <SettingItem v-if="layoutMode === 'vertical'" key="sider-1" :label="$t('theme.sider.width')">
        <ElInputNumber v-model="themeStore.sider.width" size="small" :step="1" class="w-120px" />
      </SettingItem>
      <SettingItem v-if="layoutMode === 'vertical'" key="sider-2" :label="$t('theme.sider.collapsedWidth')">
        <ElInputNumber v-model="themeStore.sider.collapsedWidth" size="small" :step="1" class="w-120px" />
      </SettingItem>
      <SettingItem v-if="isMixLayoutMode" key="sider-3" :label="$t('theme.sider.mixWidth')">
        <ElInputNumber v-model="themeStore.sider.mixWidth" size="small" :step="1" class="w-120px" />
      </SettingItem>
      <SettingItem v-if="isMixLayoutMode" key="sider-4" :label="$t('theme.sider.mixCollapsedWidth')">
        <ElInputNumber v-model="themeStore.sider.mixCollapsedWidth" size="small" :step="1" class="w-120px" />
      </SettingItem>
      <SettingItem v-if="layoutMode === 'vertical-mix'" key="sider-5" :label="$t('theme.sider.mixChildMenuWidth')">
        <ElInputNumber v-model="themeStore.sider.mixChildMenuWidth" size="small" :step="1" class="w-120px" />
      </SettingItem>
    </template>

    <div key="group-footer" class="setting-group">{{ $t('theme.group.footer') }}</div>
    <SettingItem key="footer-1" :label="$t('theme.footer.visible')">
      <ElSwitch v-model="themeStore.footer.visible" />
    </SettingItem>
    <SettingItem
      v-if="themeStore.footer.visible && isWrapperScrollMode"
      key="footer-2"
      :label="$t('theme.footer.fixed')"
    >
      <ElSwitch v-model="themeStore.footer.fixed" />
    </SettingItem>
    <SettingItem v-if="themeStore.footer.visible" key="footer-3" :label="$t('theme.footer.height')">
      <ElInputNumber v-model="themeStore.footer.height" size="small" :step="1" class="w-120px" />
    </SettingItem>
    <SettingItem
      v-if="themeStore.footer.visible && layoutMode === 'horizontal-mix'"
      key="footer-4"
      :label="$t('theme.footer.right')"
    >
      <ElSwitch v-model="themeStore.footer.right" />
    </SettingItem>

    <div key="group-watermark" class="setting-group">{{ $t('theme.group.watermark') }}</div>
    <SettingItem key="watermark-1" :label="$t('theme.watermark.visible')">
      <ElSwitch v-model="themeStore.watermark.visible" />
    </SettingItem>
    <SettingItem v-if="themeStore.watermark.visible" key="watermark-2" :label="$t('theme.watermark.enableUserName')">
      <ElSwitch v-model="themeStore.watermark.enableUserName" />
    </SettingItem>
    <SettingItem v-if="themeStore.watermark.visible" key="watermark-3" :label="$t('theme.watermark.text')">
      <ElInput
        v-model="themeStore.watermark.text"
        autosize
        type="text"
        size="small"
        class="w-120px"
        placeholder="SoybeanAdmin"
      />
    </SettingItem>
  </TransitionGroup>
</template>

<style scoped>
.setting-list-move,
.setting-list-enter-active,
.setting-list-leave-active {
  --uno: transition-all-300;
}

.setting-list-enter-from,
.setting-list-leave-to {
  --uno: opacity-0 -translate-x-30px;
}

.setting-list-leave-active {
  --uno: absolute;
}

/* 分组标题：比 ElDivider 的模块标题低一级，仅做视觉分隔 */
.setting-group {
  --uno: mt-4px text-13px text-base-text opacity-50 font-500;
}
</style>
