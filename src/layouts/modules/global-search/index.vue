<script lang="ts" setup>
import { onKeyStroke } from '@vueuse/core';
import { useBoolean } from '@sa/hooks';
import { $t } from '@/locales';
import SearchModal from './components/search-modal.vue';

defineOptions({ name: 'GlobalSearch' });

const { bool: show, toggle } = useBoolean();

/** macOS 上唤起键是 ⌘，提示文案要与实际按键一致（处理器两者都接受） */
const shortcutKey = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘ + K' : 'Ctrl + K';

/** Ctrl/⌘ + K 唤起搜索，与触发器上的提示保持一致 */
onKeyStroke('k', event => {
  if (!event.ctrlKey && !event.metaKey) return;

  event.preventDefault();
  show.value = true;
});
</script>

<template>
  <div class="search-trigger" @click="toggle">
    <icon-uil-search class="text-15px" />
    <span class="search-text">{{ $t('common.search') }}</span>
    <span class="shortcut-key">{{ shortcutKey }}</span>
  </div>
  <SearchModal v-model:show="show" />
</template>

<style scoped lang="scss">
/* 配色统一走 Element Plus 变量，暗黑模式下自动跟随 */
.search-trigger {
  display: flex;
  align-items: center;
  height: 36px;
  margin-right: 12px;
  padding: 0 16px;
  border-radius: 8px;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color);
  }
}

.search-text {
  margin-left: 4px;
  line-height: 1;
}

.shortcut-key {
  margin-left: 16px;
  padding: 2px 6px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background-color: var(--el-bg-color);
  font-size: 10px;
  line-height: 1.5;
}
</style>
