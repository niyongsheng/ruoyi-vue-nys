<script setup lang="ts">
import { computed } from 'vue';
import { useClipboard } from '@vueuse/core';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';

defineOptions({ name: 'ConfigOperation' });

const themeStore = useThemeStore();

/** 主题设置 JSON（去掉 key 的引号），便于直接粘贴进 src/theme/settings.ts 对照 */
const clipboardText = computed(() => themeStore.settingsJson.replace(/"(\w+)":/g, '$1:'));

const { copy, copied } = useClipboard({ legacy: true });

async function handleCopy() {
  await copy(clipboardText.value);

  if (copied.value) {
    window.$message?.success($t('theme.configOperation.copySuccessMsg'));
  }
}

function handleReset() {
  themeStore.resetStore();

  setTimeout(() => {
    window.$message?.success($t('theme.configOperation.resetSuccessMsg'));
  }, 50);
}
</script>

<template>
  <div class="w-full flex justify-between">
    <ElButton type="danger" plain icon="RefreshLeft" @click="handleReset">
      {{ $t('theme.configOperation.resetConfig') }}
    </ElButton>
    <ElButton type="primary" icon="CopyDocument" @click="handleCopy">
      {{ $t('theme.configOperation.copyConfig') }}
    </ElButton>
  </div>
</template>
