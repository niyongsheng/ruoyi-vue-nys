import unocss from '@unocss/vite';

/**
 * UnoCSS vite 插件
 *
 * 预设、主题、transformers 全部定义在根目录的 `uno.config.ts`（插件会自动加载该文件）。
 *
 * 历史说明：这里原先内联了一个 `presetIcons`（把 `src/assets/svg-icon` 作为本地图标集合，
 * 供 `class="icon-local-xxx"` 这种写法使用），但项目里图标走的是另外两条路——
 * `<icon-local-xxx />` 组件（unplugin-icons）与 `SvgIcon` 的 sprite（`#icon-local-xxx`）——
 * 从来没有用过该 class 写法，属于死配置，已移除（连带 `@unocss/preset-icons` 依赖）。
 */
export function setupUnocss() {
  return unocss();
}
