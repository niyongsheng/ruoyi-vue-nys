<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { listNoticeTop, markNoticeRead, markNoticeReadAll } from '@/api/system/notice';
import NoticeDetail from '@/components/NoticeDetail/index.vue';
import { $t } from '@/locales';

defineOptions({ name: 'NoticeBell' });

interface NoticeItem {
  noticeId: number;
  noticeTitle: string;
  noticeType: string;
  createTime?: string;
  isRead?: boolean;
}

const notices = ref<NoticeItem[]>([]);
const unreadCount = ref(0);
const loading = ref(false);
const visible = ref(false);

const scrollbarRef = ref<HTMLElement | null>(null);
const detailRef = ref<InstanceType<typeof NoticeDetail>>();

let closeTimer: ReturnType<typeof setTimeout> | undefined;

/** 拉取顶部公告 */
async function loadNotices() {
  loading.value = true;

  try {
    const res: any = await listNoticeTop();
    const list: NoticeItem[] = res.data || [];

    notices.value = list;
    unreadCount.value = res.unreadCount ?? list.filter(item => !item.isRead).length;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function openPanel() {
  clearTimeout(closeTimer);
  visible.value = true;
}

function closePanel(delay = 150) {
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    visible.value = false;
  }, delay);
}

/** 打开公告详情；未读则标记已读 */
async function previewNotice(item: NoticeItem) {
  if (!item.isRead) {
    markNoticeRead(item.noticeId).catch(() => {});

    const index = notices.value.findIndex(notice => notice.noticeId === item.noticeId);
    if (index !== -1) {
      notices.value[index] = { ...item, isRead: true };
    }
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  }

  detailRef.value?.open(item.noticeId);
}

/** 全部标记已读 */
async function markAllRead() {
  const ids = notices.value.map(item => item.noticeId).join(',');

  if (!ids) return;

  markNoticeReadAll(ids).catch(() => {});

  notices.value = notices.value.map(item => ({ ...item, isRead: true }));
  unreadCount.value = 0;
}

onMounted(loadNotices);
</script>

<template>
  <ElPopover
    v-model:visible="visible"
    placement="bottom-end"
    :width="320"
    :trigger="[]"
    popper-class="notice-bell-popper"
    :teleported="true"
  >
    <template #reference>
      <!-- 用原生 div 作为参考元素，自定义组件会让 Popover 取不到定位基准 -->
      <div class="h-full flex-y-center" @mouseenter="openPanel" @mouseleave="closePanel()">
        <!-- 不加 tooltip-content：hover 已经会展开公告面板，再弹提示是多余的 -->
        <ButtonIcon>
          <span class="relative">
            <SvgIcon local-icon="bell" class="text-icon" />
            <span v-if="unreadCount > 0" class="notice-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </span>
        </ButtonIcon>
      </div>
    </template>

    <div class="w-320px" @mouseenter="openPanel" @mouseleave="closePanel()">
      <div class="notice-header">
        <span>{{ $t('common.notice') }}</span>
        <ElButton v-if="unreadCount > 0" link type="primary" size="small" @click="markAllRead">
          {{ $t('common.markAllRead') }}
        </ElButton>
      </div>

      <div v-if="loading" class="notice-tip">{{ $t('common.loading') }}</div>
      <div v-else-if="notices.length === 0" class="notice-tip">{{ $t('common.noNotice') }}</div>
      <div v-else ref="scrollbarRef" class="max-h-320px overflow-y-auto">
        <div
          v-for="item in notices"
          :key="item.noticeId"
          class="notice-item"
          :class="{ 'is-read': item.isRead }"
          @click="previewNotice(item)"
        >
          <ElTag size="small" :type="item.noticeType === '1' ? 'warning' : 'success'" class="shrink-0">
            {{ item.noticeType === '1' ? $t('common.noticeType.notification') : $t('common.noticeType.announcement') }}
          </ElTag>
          <span class="notice-title">{{ item.noticeTitle }}</span>
          <span class="notice-date">{{ item.createTime?.slice(5, 10) }}</span>
        </div>
      </div>
    </div>

    <NoticeDetail ref="detailRef" />
  </ElPopover>
</template>

<style scoped>
.notice-badge {
  position: absolute;
  top: -6px;
  right: -10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 10px;
  background: var(--el-color-danger);
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.notice-tip {
  padding: 24px;
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: background-color 0.15s;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-item:hover {
  background: var(--el-fill-color-light);
}

.notice-item.is-read .notice-title,
.notice-item.is-read .notice-date {
  color: var(--el-text-color-placeholder);
}

.notice-item.is-read :deep(.el-tag) {
  opacity: 0.6;
}

.notice-title {
  flex: 1;
  overflow: hidden;
  font-size: 12px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.notice-date {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
</style>

<style>
/* 弹层被 teleport 到 body，需用非 scoped 样式去掉默认内边距 */
.notice-bell-popper {
  padding: 0 !important;
}
</style>
