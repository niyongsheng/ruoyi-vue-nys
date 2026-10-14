<script setup lang="ts">
import { watch } from 'vue';
import type { Ref } from 'vue';
import dayjs from 'dayjs';
import { list as listOperlog } from '@/api/monitor/operlog';
import { useEcharts } from '@/hooks/common/echarts';
import type { ECOption } from '@/hooks/common/echarts';
import Logger from '@/utils/logger';
import { addDateRange } from '@/utils/ruoyi';

defineOptions({ name: 'LineChart' });

const DAYS = 30;
/** 后端没有按天聚合的接口，先取整个区间的明细再在前端聚合（实测 pageSize=2000 不会被截断） */
const PAGE_SIZE = 2000;

/** 堆叠面积配色，取自项目既有图表与统计卡片的色值 */
const SERIES_COLORS = ['#8e9dff', '#26deca', '#5da8ff', '#fedc69', '#b955a4', '#ec4786', '#719de3', '#f68057'];

/** 操作类型字典（sys_oper_type），用于图例文案；字典是异步加载的，到达后需要重绘 */
const { sys_oper_type: operTypes } = useDict('sys_oper_type') as Record<'sys_oper_type', Ref<DictItem[]>>;

interface DictItem {
  label: string;
  value: string;
}

interface OperLogRow {
  businessType: number;
  operTime: string;
}

const days = Array.from({ length: DAYS }, (_, index) => dayjs().subtract(DAYS - 1 - index, 'day'));

/** 接口返回的原始明细；建图与字典到达后的重绘都基于它 */
let records: OperLogRow[] = [];

function dictLabel(businessType: number) {
  const item = operTypes.value.find(dict => Number(dict.value) === businessType);

  return item?.label ?? String(businessType);
}

/** 按「天 × 操作类型」计数，返回按总量倒序的系列 */
function buildSeries() {
  const dayIndex = new Map(days.map((day, index) => [day.format('YYYY-MM-DD'), index]));
  const byType = new Map<number, number[]>();

  records.forEach(row => {
    const index = dayIndex.get((row.operTime || '').slice(0, 10));
    // 区间外的记录直接丢弃（后端按 operTime 过滤，这里是兜底）
    if (index === undefined) return;

    const data = byType.get(row.businessType) ?? Array.from({ length: DAYS }, () => 0);
    data[index] += 1;
    byType.set(row.businessType, data);
  });

  return [...byType.entries()]
    .map(([businessType, data]) => ({
      name: dictLabel(businessType),
      total: data.reduce((sum, count) => sum + count, 0),
      data
    }))
    .sort((a, b) => b.total - a.total);
}

/** 只有出现过的操作类型才建系列，避免图例里挂一堆恒为 0 的空系列 */
function createOptions(): ECOption {
  const list = buildSeries();

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      top: 0,
      left: 'center',
      data: list.map(item => item.name)
    },
    grid: {
      // 必须给 top：图例默认不占布局空间，不留白就会压在 0 值线和 x 轴标签上
      top: 40,
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: days.map(day => day.format('MM-DD'))
    },
    yAxis: {
      type: 'value'
    },
    series: list.map((item, index) => ({
      color: SERIES_COLORS[index % SERIES_COLORS.length],
      name: item.name,
      type: 'line',
      smooth: true,
      stack: 'Total',
      // 堆叠图用半透明填充：渐变到白色会把下层系列盖住，且深色模式下会露出白底
      areaStyle: {
        opacity: 0.4
      },
      emphasis: {
        focus: 'series'
      },
      data: item.data
    }))
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

async function loadOperlogs() {
  try {
    const response = await listOperlog(addDateRange({ pageNum: 1, pageSize: PAGE_SIZE }, dateRange()));

    records = (response as any).rows ?? [];
    updateOptions(createOptions);
  } catch (error) {
    // 图表拉不到数据就留空轴，不打断首页其余卡片
    Logger.prettyWarn('操作日志', '拉取操作日志失败，折线图留空', error);
  }
}

/** 字典（操作类型文案）到达后重绘图例 */
watch(
  () => operTypes.value,
  () => {
    if (records.length) updateOptions(createOptions);
  }
);

loadOperlogs();
</script>

<template>
  <ElCard class="card-wrapper">
    <div ref="domRef" class="h-360px overflow-hidden"></div>
  </ElCard>
</template>
