<script setup lang="ts">
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import Logger from '@/utils/logger';
import { $t } from '@/locales';

defineOptions({ name: 'ProjectIssues' });

/**
 * GitHub 公开仓库的 issues 接口无需鉴权，但未认证限流 60 次/小时/IP，
 * 与「提交日志」的提交接口共用同一配额（即每次打开首页消耗 2 次）。
 * 本项目不做本地缓存：每次打开首页都取最新数据，拉不到就落到占位图。
 */
const ISSUES_API = 'https://api.github.com/repos';
/** 该接口会把 PR 也当成 issue 返回（带 pull_request 字段），故多取一些，过滤后按 PER_PAGE 截断 */
const FETCH_SIZE = 20;
const PER_PAGE = 10;

/** `/issues` 响应中本组件用到的字段 */
interface GithubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  created_at: string;
  user: { login: string } | null;
  /** 存在该字段说明这条是 PR 而非 issue */
  pull_request?: unknown;
}

const repo = import.meta.env.VITE_GITHUB_REPO;
const moreIssuesUrl = repo ? `https://github.com/${repo}/issues` : '';

/** 开放问题；为空时展示占位图 */
const issues = ref<App.Home.ProjectIssue[]>([]);

function toIssueItem(issue: GithubIssue): App.Home.ProjectIssue {
  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    user: issue.user?.login || '',
    time: dayjs(issue.created_at).format('YYYY-MM-DD HH:mm'),
    url: issue.html_url
  };
}

async function fetchIssues() {
  // 不加 Authorization：前端不持有 Token
  const response = await fetch(`${ISSUES_API}/${repo}/issues?state=open&per_page=${FETCH_SIZE}`, {
    headers: { Accept: 'application/vnd.github+json' }
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}`);
  }

  const list = (await response.json()) as GithubIssue[];

  return list
    .filter(issue => !issue.pull_request)
    .slice(0, PER_PAGE)
    .map(issue => toIssueItem(issue));
}

async function loadIssues() {
  if (!repo) return;

  try {
    issues.value = await fetchIssues();
  } catch (error) {
    // 内网不通、超时、限流都会走到这里：首页卡片不值得打断用户，落到占位图即可
    Logger.prettyWarn('开放问题', '拉取 GitHub issues 失败，展示占位图', error);
  }
}

onMounted(loadIssues);
</script>

<template>
  <ElCard class="h-full card-wrapper">
    <template #header>
      <ElRow>
        <ElCol :span="18">{{ $t('page.home.projectIssues.title') }}</ElCol>
        <ElCol :span="6" class="text-right">
          <a v-if="moreIssuesUrl" class="text-primary" :href="moreIssuesUrl" target="_blank" rel="noopener noreferrer">
            {{ $t('page.home.projectIssues.more') }}
          </a>
        </ElCol>
      </ElRow>
    </template>
    <ElTimeline v-if="issues.length">
      <ElTimelineItem v-for="issue in issues" :key="issue.id">
        <a class="issue-link" :href="issue.url" target="_blank" rel="noopener noreferrer">
          #{{ issue.number }} {{ issue.title }}
        </a>
        <p class="issue-meta">{{ issue.user }} · {{ issue.time }}</p>
      </ElTimelineItem>
    </ElTimeline>
    <div v-else class="h-full flex-center">
      <icon-local-banner class="text-400px text-primary sm:text-320px" />
    </div>
  </ElCard>
</template>

<style scoped lang="scss">
/* 链接跟随正文颜色，避免浏览器默认的蓝色下划线样式 */
.issue-link {
  color: inherit;

  &:hover {
    color: var(--el-color-primary);
  }
}

.issue-meta {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
