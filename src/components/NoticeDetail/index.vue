<template>
  <el-drawer v-model="visible" :title="$t('common.noticeDetail')" direction="rtl" size="50%" append-to-body :before-close="handleClose" class="notice-detail-drawer">
    <div v-loading="loading" class="notice-detail-drawer__body">
      <div v-if="!detail" class="notice-empty">
        <el-icon><Document /></el-icon>
        <span>{{ $t('common.noData') }}</span>
      </div>
      <div v-else class="notice-page">
        <div class="notice-type-wrap">
          <span v-if="detail.noticeType === '1'" class="notice-type-tag type-notify">
            <el-icon><Bell /></el-icon> {{ $t('common.noticeType.notification') }}
          </span>
          <span v-else-if="detail.noticeType === '2'" class="notice-type-tag type-announce">
            <el-icon><Message /></el-icon> {{ $t('common.noticeType.announcement') }}
          </span>
          <span v-else class="notice-type-tag type-notify">
            <el-icon><Document /></el-icon> {{ $t('common.message') }}
          </span>
        </div>

        <h1 class="notice-title">{{ detail.noticeTitle }}</h1>

        <div class="notice-meta">
          <span class="meta-item">
            <el-icon><User /></el-icon>
            <span>{{ detail.createBy || '—' }}</span>
          </span>
          <span class="meta-item">
            <el-icon><Clock /></el-icon>
            <span>{{ detail.createTime || '—' }}</span>
          </span>
          <span class="meta-item">
            <span :class="['status-dot', isStatusNormal ? 'status-ok' : 'status-off']"></span>
            <span>{{ isStatusNormal ? $t('common.normal') : $t('common.closed') }}</span>
          </span>
        </div>

        <div class="notice-divider">
          <span class="notice-divider-dot"></span>
          <span class="notice-divider-dot"></span>
          <span class="notice-divider-dot"></span>
        </div>

        <div class="notice-body">
          <div v-if="hasContent" class="notice-content" v-html="safeContent" />
          <div v-else class="notice-empty notice-empty--inner">
            <el-icon><Document /></el-icon> {{ $t('common.noContent') }}
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import DOMPurify from 'dompurify'
import { getNotice } from '@/api/system/notice'
import { $t } from '@/locales'

const visible = ref(false)
const loading = ref(false)
const detail = ref(null)

const isStatusNormal = computed(() => {
  const status = detail.value && detail.value.status
  return status === '0' || status === 0
})

const hasContent = computed(() => {
  const content = detail.value && detail.value.noticeContent
  return content != null && String(content).trim() !== ''
})

/**
 * 公告正文来自 Quill 富文本（提交者可持有 system:notice:edit）：
 * 渲染前必须净化，否则任何编辑者都能对全体用户注入脚本（配合 localStorage 里的 token 即完全接管）。
 * 保留常规排版标签；script/事件属性等一律剥除。
 */
const safeContent = computed(() => DOMPurify.sanitize(String(detail.value?.noticeContent ?? '')))

function open(payload) {
  let id = null
  let preset = null
  if (payload != null && typeof payload === 'object') {
    id = payload.noticeId
    if (payload.noticeContent != null) {
      preset = payload
    }
  } else {
    id = payload
  }
  visible.value = true
  if (preset) {
    detail.value = preset
    return
  }
  if (id == null || id === '') {
    detail.value = null
    return
  }
  loading.value = true
  detail.value = null
  getNotice(id).then(res => {
    detail.value = res.data
  }).catch(() => {
    detail.value = null
  }).finally(() => {
    loading.value = false
  })
}

function handleClose() {
  visible.value = false
  detail.value = null
  loading.value = false
}

defineExpose({
  open
})
</script>

<style lang="scss" scoped>
.notice-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 8px 8px 20px;
  animation: notice-fade-up 0.28s ease both;
}

@keyframes notice-fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.notice-type-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 12px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.type-notify {
  background: var(--notice-tag-notify-bg, #fff8e6);
  color: var(--notice-tag-notify-color, #b7791f);
  border-left: 3px solid #d97706;
}

.type-announce {
  background: var(--notice-tag-announce-bg, #e8f5e9);
  color: var(--notice-tag-announce-color, #276749);
  border-left: 3px solid #38a169;
}

.notice-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--notice-title-color, #1a202c);
  line-height: 1.45;
  margin: 0 0 16px;
  letter-spacing: -0.2px;
}

.notice-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--notice-border-color, #e9ecef);
  border-bottom: 1px solid var(--notice-border-color, #e9ecef);
  margin-bottom: 28px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--notice-meta-color, #718096);
}

.meta-item .el-icon {
  font-size: 12px;
  color: var(--notice-meta-icon-color, #a0aec0);
}

.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 4px;
}

.status-ok  { background: #38a169; }
.status-off { background: #e53e3e; }

.notice-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.notice-divider::before,
.notice-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--notice-divider-gradient, linear-gradient(to right, transparent, #dee2e6, transparent));
}

.notice-divider-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--notice-divider-dot-color, #cbd5e0);
}

.notice-body {
  background: var(--notice-body-bg, #fff);
  border-radius: 6px;
  padding: 28px 32px;
  box-shadow: var(--notice-body-shadow, 0 1px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04));
  min-height: 120px;
}

.notice-content {
  font-size: 14px;
  line-height: 1.85;
  color: var(--notice-content-color, #2d3748);
  word-break: break-word;
}

.notice-content :deep(p) { margin: 0 0 1em; }

.notice-content :deep(h1),
.notice-content :deep(h2),
.notice-content :deep(h3) {
  font-weight: 700;
  color: var(--notice-title-color, #1a202c);
  margin: 1.4em 0 0.6em;
}

.notice-content :deep(h1) { font-size: 18px; }
.notice-content :deep(h2) { font-size: 16px; }
.notice-content :deep(h3) { font-size: 14px; }

.notice-content :deep(a) {
  color: #3182ce;
  text-decoration: underline;
}
.notice-content :deep(a:hover) { color: #2b6cb0; }

.notice-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
  margin: 8px 0;
}

.notice-content :deep(ul),
.notice-content :deep(ol) {
  padding-left: 20px;
  margin: 0 0 1em;
}
.notice-content :deep(li) { margin-bottom: 4px; }

.notice-content :deep(blockquote) {
  border-left: 3px solid var(--notice-blockquote-border, #cbd5e0);
  margin: 1em 0;
  padding: 6px 16px;
  color: var(--notice-meta-color, #718096);
  background: var(--notice-blockquote-bg, #f7fafc);
}

.notice-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  font-size: 13px;
}
.notice-content :deep(table th),
.notice-content :deep(table td) {
  border: 1px solid var(--notice-table-border, #e2e8f0);
  padding: 7px 12px;
}
.notice-content :deep(table th) {
  background: var(--notice-table-header-bg, #f7fafc);
  font-weight: 600;
}

.notice-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--notice-meta-icon-color, #a0aec0);
  font-size: 13px;
}
.notice-empty .el-icon {
  font-size: 28px;
  display: inline-flex;
  margin-bottom: 10px;
}
.notice-empty--inner { padding: 32px 0; }

.notice-detail-drawer__body {
  height: 100%;
  overflow: auto;
  padding: 10px 16px 22px;
}
</style>

<style lang="scss">
.notice-detail-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px;
    border-bottom: 1px solid var(--notice-border-color, #ebeef5);
    font-size: 16px;
    font-weight: 600;
    color: var(--notice-title-color, #303133);
  }

  .el-drawer__body {
    background: var(--notice-drawer-body-bg, #f5f6f8);
    padding: 0;
  }
}

/* 暗色模式下补上变量定义（亮色走组件内兜底值，视觉不变） */
html.dark {
  /* 通知公告详情抽屉的暗色变量（迁移自 nys_fast_admin 的 variables.module.scss；
     引用点全在本组件内，故随本组件的非 scoped 块一起加载） */
  --notice-title-color: var(--el-text-color-primary);
  --notice-meta-color: var(--el-text-color-secondary);
  --notice-meta-icon-color: var(--el-text-color-placeholder, #606266);
  --notice-border-color: var(--el-border-color);
  --notice-body-bg: var(--el-bg-color-overlay);
  --notice-body-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.04);
  --notice-content-color: var(--el-text-color-regular);
  --notice-drawer-body-bg: var(--el-bg-color);
  --notice-divider-gradient: linear-gradient(to right, transparent, var(--el-border-color), transparent);
  --notice-divider-dot-color: var(--el-border-color-light, #434343);
  --notice-blockquote-bg: var(--el-bg-color);
  --notice-blockquote-border: var(--el-border-color);
  --notice-table-border: var(--el-border-color);
  --notice-table-header-bg: var(--el-bg-color);
  --notice-tag-notify-bg: rgba(217, 119, 6, 0.15);
  --notice-tag-notify-color: #f6ad55;
  --notice-tag-announce-bg: rgba(56, 161, 105, 0.15);
  --notice-tag-announce-color: #68d391;
}
</style>
