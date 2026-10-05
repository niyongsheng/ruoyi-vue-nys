<script setup lang="ts">
defineOptions({ name: 'DarkModeContainer' });

interface Props {
  inverted?: boolean;
}

defineProps<Props>();
</script>

<template>
  <!-- `sider-inverted` 是语义钩子（element-plus.scss 据此设置反色菜单主题），
       与背景色工具类 `bg-inverted` 分开，避免改工具类名时静默切断主题契约 -->
  <div
    class="bg-container text-base-text transition-300"
    :class="{ 'bg-inverted sider-inverted text-#1f1f1f': inverted }"
  >
    <slot></slot>
  </div>
</template>
