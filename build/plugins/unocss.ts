import unocss from '@unocss/vite';

// 预设/主题/transformers 全在根目录 uno.config.ts（插件自动加载）。
// 勿再内联 presetIcons：`class="icon-local-xxx"` 这种写法本项目从未使用（图标走 unplugin-icons 与 SvgIcon sprite）
export function setupUnocss() {
  return unocss();
}
