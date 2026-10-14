<script setup lang="ts">
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import Logger from '@/utils/logger';
import { $t } from '@/locales';

defineOptions({ name: 'ProjectCommits' });

/**
 * GitHub 公开仓库的提交接口无需鉴权，但未认证限流 60 次/小时/IP。
 * 本项目不做本地缓存：每次打开首页都取最新数据，拉不到就落到占位图。
 */
const COMMITS_API = 'https://api.github.com/repos';
const PER_PAGE = 10;

/** `/commits` 响应中本组件用到的字段 */
interface GithubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { date?: string } | null;
  };
}

const repo = import.meta.env.VITE_GITHUB_REPO;
const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';

const moreCommitsUrl = repo ? `https://github.com/${repo}/commits/${branch}` : '';

/** 最新提交；为空时展示占位图 */
const commits = ref<App.Home.ProjectCommit[]>([]);

function toCommitItem(commit: GithubCommit): App.Home.ProjectCommit {
  return {
    id: commit.sha,
    // 提交信息可能带多行正文，时间线只展示首行
    content: commit.commit.message.split('\n')[0],
    time: commit.commit.author?.date ? dayjs(commit.commit.author.date).format('YYYY-MM-DD HH:mm:ss') : '',
    url: commit.html_url
  };
}

async function fetchCommits() {
  // 不加 Authorization：前端不持有 Token
  const response = await fetch(`${COMMITS_API}/${repo}/commits?sha=${branch}&per_page=${PER_PAGE}`, {
    headers: { Accept: 'application/vnd.github+json' }
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}`);
  }

  const list = (await response.json()) as GithubCommit[];

  return list.map(commit => toCommitItem(commit));
}

async function loadCommits() {
  if (!repo) return;

  try {
    commits.value = await fetchCommits();
  } catch (error) {
    // 内网不通、超时、限流都会走到这里：首页卡片不值得打断用户，落到占位图即可
    Logger.prettyWarn('提交日志', '拉取 GitHub 提交失败，展示占位图', error);
  }
}

onMounted(loadCommits);
</script>

<template>
  <ElCard class="card-wrapper">
    <template #header>
      <ElRow>
        <ElCol :span="18">{{ $t('page.home.projectCommits.title') }}</ElCol>
        <ElCol :span="6" class="text-right">
          <a
            v-if="moreCommitsUrl"
            class="text-primary"
            :href="moreCommitsUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('page.home.projectCommits.more') }}
          </a>
        </ElCol>
      </ElRow>
    </template>
    <ElTimeline v-if="commits.length">
      <ElTimelineItem v-for="item in commits" :key="item.id" :timestamp="item.time" placement="top">
        <ElSpace>
          <NewsAvatar class="size-48px!" />
          <a class="commit-link" :href="item.url" target="_blank" rel="noopener noreferrer">
            {{ item.content }}
          </a>
        </ElSpace>
      </ElTimelineItem>
    </ElTimeline>
    <div v-else class="flex-center">
      <icon-local-banner class="text-400px text-primary sm:text-320px" />
    </div>
  </ElCard>
</template>

<style scoped lang="scss">
/* 提交链接跟随正文颜色，避免浏览器默认的蓝色下划线样式 */
.commit-link {
  color: inherit;

  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
