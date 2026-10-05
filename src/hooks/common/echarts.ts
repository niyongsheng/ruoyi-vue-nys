import { computed, effectScope, nextTick, onScopeDispose, ref, watch } from 'vue';
import { useElementSize } from '@vueuse/core';
import * as echarts from 'echarts/core';
import { GaugeChart, LineChart, PieChart } from 'echarts/charts';
import type { GaugeSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import type { GridComponentOption, LegendComponentOption, TooltipComponentOption } from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useThemeStore } from '@/store/modules/theme';

export type ECOption = echarts.ComposeOption<
  | LineSeriesOption
  | PieSeriesOption
  | GaugeSeriesOption
  | LegendComponentOption
  | TooltipComponentOption
  | GridComponentOption
>;

/**
 * 按需注册 echarts 模块
 *
 * 只注册项目实际用到的图表（折线/饼图/仪表盘）与组件，其余（柱状/散点/雷达/地图、
 * dataset/toolbox 等）不注册 —— 相比 `import * as echarts from 'echarts'` 全量引入
 * 可显著减小 chunk 体积。新增图表类型时在这里补充。
 */
echarts.use([
  LineChart,
  PieChart,
  GaugeChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  LabelLayout,
  CanvasRenderer
]);

/** 需要自定义 option 的页面可直接用这份已注册的 echarts */
export { echarts };

interface ChartHooks {
  onRender?: (chart: echarts.ECharts) => void | Promise<void>;
  onUpdated?: (chart: echarts.ECharts) => void | Promise<void>;
  onDestroy?: (chart: echarts.ECharts) => void | Promise<void>;
}

/**
 * use echarts
 *
 * @param optionsFactory echarts options factory function
 * @param darkMode dark mode
 */
export function useEcharts<T extends ECOption>(optionsFactory: () => T, hooks: ChartHooks = {}) {
  const scope = effectScope();

  const themeStore = useThemeStore();
  const darkMode = computed(() => themeStore.darkMode);

  const domRef = ref<HTMLElement | null>(null);
  const initialSize = { width: 0, height: 0 };
  const { width, height } = useElementSize(domRef, initialSize);

  let chart: echarts.ECharts | null = null;
  const chartOptions: T = optionsFactory();

  const {
    onRender = instance => {
      const textColor = darkMode.value ? 'rgb(224, 224, 224)' : 'rgb(31, 31, 31)';
      const maskColor = darkMode.value ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)';

      instance.showLoading({
        color: themeStore.themeColor,
        textColor,
        fontSize: 14,
        maskColor
      });
    },
    onUpdated = instance => {
      instance.hideLoading();
    },
    onDestroy
  } = hooks;

  /**
   * whether can render chart
   *
   * when domRef is ready and initialSize is valid
   */
  function canRender() {
    return domRef.value && initialSize.width > 0 && initialSize.height > 0;
  }

  /** is chart rendered */
  function isRendered() {
    return Boolean(domRef.value && chart);
  }

  /**
   * update chart options
   *
   * @param callback callback function
   */
  async function updateOptions(callback: (opts: T, optsFactory: () => T) => ECOption = () => chartOptions) {
    if (!isRendered()) return;

    const updatedOpts = callback(chartOptions, optionsFactory);

    Object.assign(chartOptions, updatedOpts);

    if (isRendered()) {
      chart?.clear();
    }

    chart?.setOption({ ...updatedOpts, backgroundColor: 'transparent' });

    await onUpdated?.(chart!);
  }

  function setOptions(options: T) {
    chart?.setOption(options);
  }

  /** render chart */
  async function render() {
    if (!isRendered()) {
      const chartTheme = darkMode.value ? 'dark' : 'light';

      await nextTick();

      chart = echarts.init(domRef.value, chartTheme);

      chart.setOption({ ...chartOptions, backgroundColor: 'transparent' });

      await onRender?.(chart);
    }
  }

  /** resize chart */
  function resize() {
    chart?.resize();
  }

  /** destroy chart */
  async function destroy() {
    if (!chart) return;

    await onDestroy?.(chart);
    chart?.dispose();
    chart = null;
  }

  /** change chart theme */
  async function changeTheme() {
    await destroy();
    await render();
    await onUpdated?.(chart!);
  }

  /**
   * render chart by size
   *
   * @param w width
   * @param h height
   */
  async function renderChartBySize(w: number, h: number) {
    initialSize.width = w;
    initialSize.height = h;

    // size is abnormal, destroy chart
    if (!canRender()) {
      await destroy();

      return;
    }

    // resize chart
    if (isRendered()) {
      resize();
    }

    // render chart
    await render();

    if (chart) {
      await onUpdated?.(chart);
    }
  }

  scope.run(() => {
    watch([width, height], ([newWidth, newHeight]) => {
      renderChartBySize(newWidth, newHeight);
    });

    watch(darkMode, () => {
      changeTheme();
    });
  });

  onScopeDispose(() => {
    destroy();
    scope.stop();
  });

  return {
    domRef,
    updateOptions,
    setOptions
  };
}
