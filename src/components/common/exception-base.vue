<script setup lang="ts">
import { computed } from 'vue';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';

defineOptions({ name: 'ExceptionBase' });

type ExceptionType = '401' | '403' | '404' | '500';

interface Props {
  /**
   * Exception type
   *
   * - 401: 未授权（RuoYi 语义：没有访问权限）
   * - 403: no permission
   * - 404: not found
   * - 500: service error
   */
  type: ExceptionType;
  /** 自定义描述文案（默认按 type 取内置文案） */
  description?: string;
}

const props = defineProps<Props>();

const { routerPushByKey } = useRouterPush();

/**
 * 插图（取自 vue-pure-admin 的 status 插图）
 *
 * 401 与 403 同属「无权限」，复用同一张锁形插图。
 */
const illustrationMap: Record<ExceptionType, string> = {
  401: 'status-403',
  403: 'status-403',
  404: 'status-404',
  500: 'status-500'
};

/** 描述文案的 i18n key（在 computed 里取，保证切换语言后跟着变） */
const descriptionKeyMap: Record<ExceptionType, App.I18n.I18nKey> = {
  401: 'page.exception.401',
  403: 'page.exception.403',
  404: 'page.exception.404',
  500: 'page.exception.500'
};

const illustration = computed(() => illustrationMap[props.type]);
const description = computed(() => props.description || $t(descriptionKeyMap[props.type]));
</script>

<template>
  <div class="exception-page">
    <SvgIcon :local-icon="illustration" class="exception-illustration" />
    <div class="exception-info">
      <p class="exception-code">{{ type }}</p>
      <p class="exception-desc">{{ description }}</p>
      <ElButton type="primary" @click="routerPushByKey('root')">{{ $t('common.backToHome') }}</ElButton>
    </div>
  </div>
</template>

<style scoped>
/*
 * 布局参照 vue-pure-admin 的异常页：窄屏上下排列、宽屏左右排列，
 * 右侧依次是「状态码 / 描述 / 返回首页」，三者带错峰上浮入场动画。
 * （原版用 v-motion，这里用 CSS keyframes 实现，不额外引入动效依赖）
 */
.exception-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  padding: 16px;
  gap: 32px;
  overflow: hidden;
}

.exception-illustration {
  height: 220px;
  width: auto;
  flex-shrink: 0;
}

.exception-info {
  text-align: center;
}

.exception-code {
  margin: 0 0 16px;
  font-size: 36px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--el-text-color-primary);
}

.exception-desc {
  margin: 0 0 24px;
  font-size: 20px;
  line-height: 1.4;
  color: #6b7280;
}

/* 入场动画：与 vue-pure-admin 的 v-motion（y 100 → 0，delay 80/120/160ms）一致 */
@keyframes exception-fade-up {
  from {
    opacity: 0;
    transform: translateY(60px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.exception-code {
  animation: exception-fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
}

.exception-desc {
  animation: exception-fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
}

.exception-info .el-button {
  animation: exception-fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.16s both;
}

/* 宽屏：左右排列，文案左对齐 */
@media (min-width: 768px) {
  .exception-page {
    flex-direction: row;
    gap: 56px;
  }

  .exception-illustration {
    height: 260px;
  }

  .exception-info {
    text-align: left;
  }
}
</style>
