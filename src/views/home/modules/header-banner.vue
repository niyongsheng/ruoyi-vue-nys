<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { list as listOnline } from '@/api/monitor/online';
import { listJob } from '@/api/monitor/job';
import { list as listOperlog } from '@/api/monitor/operlog';
import { useAuthStore } from '@/store/modules/auth';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';

defineOptions({ name: 'HeaderBanner' });

const appStore = useAppStore();
const authStore = useAuthStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));

/** 运行态统计（取后端真实数据） */
const counts = reactive({
  online: 0,
  job: 0,
  operlog: 0
});

interface StatisticData {
  id: number;
  title: string;
  value: number;
  formatter?: (val: number) => string;
}

const statisticData = computed<StatisticData[]>(() => [
  { id: 0, title: $t('page.home.onlineUsers'), value: counts.online },
  { id: 1, title: $t('page.home.scheduledJobs'), value: counts.job },
  { id: 2, title: $t('page.home.operationLogs'), value: counts.operlog }
]);

/** 按时段取问候语 key（比在字符串里判断更利于英文语序） */
const greetingKey = computed<App.I18n.I18nKey>(() => {
  const hour = new Date().getHours();

  if (hour < 6) return 'page.home.greetingEarlyMorning';
  if (hour < 9) return 'page.home.greetingMorning';
  if (hour < 12) return 'page.home.greetingForenoon';
  if (hour < 14) return 'page.home.greetingNoon';
  if (hour < 18) return 'page.home.greetingAfternoon';

  return 'page.home.greetingEvening';
});

/** 问候语：语序交给 i18n 模板（中文「下午好 Nico」/ 英文「Good afternoon, Nico」） */
const greeting = computed(() => {
  const name = authStore.userInfo.nickName || authStore.userInfo.userName || '';

  return $t('page.home.greeting', { greeting: $t(greetingKey.value), name });
});

/** 头像：优先用后端返回的头像，回退到本地默认图 */
const avatarUrl = computed(() => {
  const { avatar } = authStore.userInfo;

  if (!avatar) return new URL('@/assets/imgs/avatar.jpeg', import.meta.url).href;

  return avatar.startsWith('http') ? avatar : `${import.meta.env.VITE_APP_BASE_API}${avatar}`;
});

async function loadCounts() {
  const pageQuery = { pageNum: 1, pageSize: 1 };

  const [onlineRes, jobRes, operlogRes] = await Promise.all([
    listOnline(pageQuery).catch(() => null),
    listJob(pageQuery).catch(() => null),
    listOperlog(pageQuery).catch(() => null)
  ]);

  counts.online = (onlineRes as any)?.total ?? 0;
  counts.job = (jobRes as any)?.total ?? 0;
  counts.operlog = (operlogRes as any)?.total ?? 0;
}

onMounted(loadCounts);
</script>

<template>
  <ElCard class="card-wrapper">
    <ElRow :gutter="gap" class="px-8px">
      <ElCol :md="18" :sm="24">
        <div class="flex-y-center">
          <div class="size-72px shrink-0 overflow-hidden rd-1/2">
            <img :src="avatarUrl" class="size-full" />
          </div>
          <div class="pl-12px">
            <h3 class="text-18px font-semibold">{{ greeting }}</h3>
            <p class="text-#999 leading-30px">{{ $t('page.home.motto') }}</p>
          </div>
        </div>
      </ElCol>
      <ElCol :md="6" :sm="24">
        <ElSpace direction="horizontal" class="w-full justify-end" :size="24">
          <ElStatistic v-for="item in statisticData" :key="item.id" class="whitespace-nowrap" v-bind="item" />
        </ElSpace>
      </ElCol>
    </ElRow>
  </ElCard>
</template>
