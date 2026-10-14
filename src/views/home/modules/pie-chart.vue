<script setup lang="ts">
import { watch } from 'vue';
import dayjs from 'dayjs';
import { list as listLogininfor } from '@/api/monitor/logininfor';
import { useAppStore } from '@/store/modules/app';
import { useEcharts } from '@/hooks/common/echarts';
import type { ECOption } from '@/hooks/common/echarts';
import Logger from '@/utils/logger';
import { addDateRange } from '@/utils/ruoyi';
import { $t } from '@/locales';

defineOptions({ name: 'PieChart' });

const appStore = useAppStore();

const DAYS = 30;
/** 同折线图：后端无聚合接口，取明细在前端归并（实测 pageSize=2000 不会被截断） */
const PAGE_SIZE = 2000;
/** 扇区上限：browser 字段带着版本号，30 天内可达上百种取值，取前 N 再把其余归为「其它」 */
const TOP_N = 6;

const SERIES_COLORS = ['#5da8ff', '#8e9dff', '#fedc69', '#26deca', '#b955a4', '#ec4786', '#719de3', '#f68057'];

/**
 * 同一浏览器的不同 UA 别名。
 * RuoYi 存的是 UA 里的原始 token，Edge 是 `Edg`、微信内置浏览器是 `MicroMessenger`。
 */
const BROWSER_ALIAS: Record<string, string> = {
  Edg: 'Edge',
  MicroMessenger: 'WeChat'
};

interface LoginRow {
  browser?: string;
  loginTime: string;
}

/** 接口返回的原始明细；建图与语言切换后的重绘都基于它 */
let records: LoginRow[] = [];

const days = Array.from({ length: DAYS }, (_, index) => dayjs().subtract(DAYS - 1 - index, 'day'));

/** 去掉版本号，把「Chrome 148 / Chrome 154 / Chrome 151」这类原始值归并成浏览器大类 */
function browserFamily(browser?: string) {
  const text = (browser || '').trim();
  if (!text) return '';

  // 形如 `Chrome Webview 101.0.4951.61` / `Edge 155`：截到第一个数字之前
  const name = text.replace(/\s*[\d.].*$/, '').trim() || text;

  return BROWSER_ALIAS[name] || name;
}

function buildPieData() {
  const counts = new Map<string, number>();

  records.forEach(row => {
    const name = browserFamily(row.browser) || $t('page.home.unknown');
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const data = sorted.slice(0, TOP_N).map(([name, value]) => ({ name, value }));
  const rest = sorted.slice(TOP_N).reduce((sum, [, value]) => sum + value, 0);

  if (rest > 0) {
    data.push({ name: $t('page.home.other'), value: rest });
  }

  return data;
}

function createOptions(): ECOption {
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      // 归并后仍可能有 7 个扇区且类名较长，超出宽度时允许翻页
      type: 'scroll',
      bottom: '1%',
      left: 'center',
      itemStyle: {
        borderWidth: 0
      }
    },
    series: [
      {
        color: SERIES_COLORS,
        name: $t('page.home.browser'),
        type: 'pie',
        radius: ['45%', '75%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 1
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '12'
          }
        },
        labelLine: {
          show: false
        },
        data: buildPieData()
      }
    ]
  };
}

const { domRef, updateOptions } = useEcharts(createOptions);

/** 近 30 天区间，含今天 */
function dateRange() {
  return [
    days[0].startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    days[DAYS - 1].endOf('day').format('YYYY-MM-DD HH:mm:ss')
  ];
}

async function loadLogininfors() {
  try {
    const response = await listLogininfor(addDateRange({ pageNum: 1, pageSize: PAGE_SIZE }, dateRange()));

    records = (response as any).rows ?? [];
    updateOptions(createOptions);
  } catch (error) {
    // 图表拉不到数据就留空，不打断首页其余卡片
    Logger.prettyWarn('登录日志', '拉取登录日志失败，饼图留空', error);
  }
}

/** 「其它」「未知」来自 i18n，切换语言后需要重绘 */
watch(
  () => appStore.locale,
  () => {
    if (records.length) updateOptions(createOptions);
  }
);

loadLogininfors();
</script>

<template>
  <ElCard class="card-wrapper">
    <div ref="domRef" class="h-360px overflow-hidden"></div>
  </ElCard>
</template>
