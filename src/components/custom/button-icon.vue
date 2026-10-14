<script setup lang="ts">
import type { Placement } from 'element-plus';

defineOptions({
  name: 'ButtonIcon',
  inheritAttrs: false
});

interface Props {
  /** Button class */
  class?: string;
  /** Iconify icon name */
  icon?: string;
  /** Tooltip content */
  tooltipContent?: string;
  /** Tooltip placement */
  tooltipPlacement?: Placement;
  zIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  icon: '',
  tooltipContent: '',
  tooltipPlacement: 'bottom',
  zIndex: 98
});

const DEFAULT_CLASS = 'h-[36px] text-icon';
</script>

<template>
  <ElTooltip :placement="tooltipPlacement" :content="tooltipContent" :z-index="zIndex" :disabled="!tooltipContent">
    <!-- 传 class 覆盖默认样式时用 important 后缀（如 h-[32px]!），普通类名不保证覆盖顺序 -->
    <ElButton text quaternary :class="[DEFAULT_CLASS, props.class]" v-bind="$attrs">
      <div class="flex-center gap-8px text-lg">
        <slot>
          <SvgIcon :icon="icon" />
        </slot>
      </div>
    </ElButton>
  </ElTooltip>
</template>
