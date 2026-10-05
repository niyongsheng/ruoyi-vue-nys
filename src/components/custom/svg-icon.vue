<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { Icon } from '@iconify/vue';

defineOptions({ name: 'SvgIcon', inheritAttrs: false });

/**
 * Props
 *
 * - Support iconify and local svg icon
 * - If icon and localIcon are passed at the same time, localIcon will be rendered first
 * - `iconClass` / `className` / `color` 是 RuoYi `<svg-icon>` 的兼容写法
 */
interface Props {
  /** Iconify icon name */
  icon?: string;
  /** Local svg icon name */
  localIcon?: string;
  /** RuoYi 写法：本地 svg 图标名 */
  iconClass?: string;
  /** RuoYi 写法：附加 class */
  className?: string;
  /** RuoYi 写法：填充色 */
  color?: string;
}

const props = defineProps<Props>();

const attrs = useAttrs();

const localIconName = computed(() => props.localIcon || props.iconClass);

const bindAttrs = computed(() => {
  const cls = [attrs.class as string, props.className, 'svg-icon'].filter(Boolean).join(' ');

  return {
    class: cls,
    style: (attrs.style as string) || ''
  };
});

const symbolId = computed(() => {
  const { VITE_ICON_LOCAL_PREFIX: prefix } = import.meta.env;

  const defaultLocalIcon = 'no-icon';

  const icon = localIconName.value || defaultLocalIcon;

  return `#${prefix}-${icon}`;
});

/** If localIcon/iconClass is passed, render localIcon first */
const renderLocalIcon = computed(() => localIconName.value || !props.icon);
</script>

<template>
  <template v-if="renderLocalIcon">
    <svg aria-hidden="true" width="1em" height="1em" v-bind="bindAttrs">
      <use :xlink:href="symbolId" :fill="color || 'currentColor'" />
    </svg>
  </template>
  <template v-else>
    <Icon v-if="icon" :icon="icon" v-bind="bindAttrs" />
  </template>
</template>
