import { defineConfig } from '@unocss/vite';
import transformerDirectives from '@unocss/transformer-directives';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import presetWind3 from '@unocss/preset-wind3';
import type { Theme } from '@unocss/preset-uno';
import { presetSoybeanAdmin } from '@sa/uno-preset';
import { themeVars } from './src/theme/vars';

export default defineConfig<Theme>({
  /**
   * 关闭与 RuoYi 全局样式撞名的工具类：
   *  - `container`：RuoYi 复制来的页面常用它作根类名，UnoCSS 的容器类会给它加
   *    `@media (min-width:1536px){max-width:1536px}`，宽屏时页面右侧出现留白
   *    （表单构建页自己的根类已改名 .form-gen，见 views/tool/build/index.vue）
   *  - `h1`~`h6`：RuoYi 把 `.h1`~`.h6` 当标题样式类用（如 `class="form-header h4"`），
   *    而 UnoCSS 会把同名 class 生成成高度类（`.h4{height:1rem}`），两者叠加
   */
  blocklist: ['container', /^h[1-6]$/],
  theme: {
    ...themeVars,
    fontSize: {
      'icon-xs': '0.875rem',
      'icon-small': '1rem',
      icon: '1.125rem',
      'icon-large': '1.5rem',
      'icon-xl': '2rem'
    }
  },
  shortcuts: {
    'card-wrapper': 'rd-8px shadow-sm'
  },
  /**
   * 两个 transformer 都在用，勿删：
   *  - directives：处理 `--uno: <utilities>` 指令（主题抽屉的布局模式卡片、过渡动画等 12 处；
   *    注意它同时负责 @apply/@screen，只 grep 后者会误判为无消费者——2026-10-05 曾因此误删，
   *    表现为「主题配置 → 布局模式」选项变空白）
   *  - variantGroup：处理 `lt-sm:(...)` 之类的变体组
   */
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [presetWind3({ dark: 'class' }), presetSoybeanAdmin()]
});
