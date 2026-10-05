/**
 * RuoYi 全局能力注入
 *
 * 把 RuoYi 侧依赖的 globalProperties / 指令 / EP 图标注册到 soybean 的应用实例上，
 * 使 50 个业务页面与公共组件无需改造（proxy.$modal、proxy.addDateRange 等 250+ 调用点）。
 *
 * 注意：soybean 不执行 `app.use(ElementPlus)`（按需引入 + 自定义样式），
 * 因此 RuoYi 用到的 `$alert/$confirm/$prompt/$msgbox/$notify` 与全部 EP 图标需要在此补齐。
 */
import type { App } from 'vue';
import { ElMessageBox, ElNotification } from 'element-plus';
import { epIcons } from '@/plugins/ep-icons';
import cache from '@/plugins/cache';
import modal from '@/plugins/modal';
import ruoyiTab from '@/plugins/tab';
import { getConfigKey } from '@/api/system/config';
import { useDict } from '@/utils/dict';
import { download } from '@/utils/request';
import { addDateRange, handleTree, parseTime, resetForm, selectDictLabel, selectDictLabels } from '@/utils/ruoyi';
import directive from '@/directive';

export function setupRuoYiPlugins(app: App) {
  // ---- RuoYi 全局方法 ----
  app.config.globalProperties.useDict = useDict;
  app.config.globalProperties.download = download;
  app.config.globalProperties.parseTime = parseTime;
  app.config.globalProperties.resetForm = resetForm;
  app.config.globalProperties.handleTree = handleTree;
  app.config.globalProperties.addDateRange = addDateRange;
  app.config.globalProperties.getConfigKey = getConfigKey;
  app.config.globalProperties.selectDictLabel = selectDictLabel;
  app.config.globalProperties.selectDictLabels = selectDictLabels;

  // ---- RuoYi 插件对象 ----
  app.config.globalProperties.$modal = modal;
  app.config.globalProperties.$tab = ruoyiTab;
  app.config.globalProperties.$cache = cache;

  // ---- Element Plus 全局方法（soybean 未全量注册，这里补齐 RuoYi 用到的） ----
  app.config.globalProperties.$alert = ElMessageBox.alert;
  app.config.globalProperties.$confirm = ElMessageBox.confirm;
  app.config.globalProperties.$prompt = ElMessageBox.prompt;
  app.config.globalProperties.$msgbox = ElMessageBox;
  app.config.globalProperties.$notify = ElNotification;

  // ---- Element Plus 图标注册（RuoYi 视图里 `icon="Search"` 这类字符串依赖全局注册） ----
  // 清单由 scripts/gen-ep-icons.mjs 扫描源码生成，只注册实际用到的图标
  // （全量注册会把 294 个图标约 300KB 全部打进首屏）。
  Object.entries(epIcons).forEach(([name, component]) => {
    app.component(name, component as any);
  });

  // ---- RuoYi 指令（v-hasPermi / v-hasRole / v-copyText） ----
  directive(app);

  // 注意：表单构建（tool/build）画布的动态组件（'el-input' 等字符串 tag）由
  // src/utils/generator/render.js 自行映射，不要在此全局注册——否则整套 EP 组件
  // 会跟着本文件进入首屏入口 chunk（只有表单构建页用得到它们）。
}
