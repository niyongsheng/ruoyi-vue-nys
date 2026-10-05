<script setup lang="ts">
import { computed } from 'vue';
import type { WatermarkProps } from 'element-plus';
import { useAppStore } from './store/modules/app';
import { useThemeStore } from './store/modules/theme';
import { useAuthStore } from './store/modules/auth';
import { UILocales } from './locales/ui';

defineOptions({ name: 'App' });

const appStore = useAppStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const locale = computed(() => {
  return UILocales[appStore.locale];
});

const watermarkProps = computed<WatermarkProps>(() => {
  const content =
    themeStore.watermark.enableUserName && authStore.userInfo.userName
      ? authStore.userInfo.userName
      : themeStore.watermark.text;

  return {
    content: themeStore.watermark.visible ? content : '',
    cross: true,
    fontSize: 16,
    lineHeight: 16,
    gap: [100, 120],
    rotate: -15,
    zIndex: 9999,
    // Element Plus 水印默认色是 rgba(0,0,0,0.15)，深色模式下看不见，
    // 这里跟随主题模式切换（深色用白字低透明度）
    font: {
      color: themeStore.darkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.15)'
    }
  };
});
</script>

<template>
  <ElConfigProvider :locale="locale" :size="themeStore.componentSize">
    <AppProvider>
      <ElWatermark class="h-full" v-bind="watermarkProps">
        <RouterView class="bg-layout" />
      </ElWatermark>
    </AppProvider>
  </ElConfigProvider>
</template>
