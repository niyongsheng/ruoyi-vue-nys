/** The union key namespace */
declare namespace UnionKey {
  /** Theme scheme */
  type ThemeScheme = 'light' | 'dark' | 'auto';

  /**
   * Element Plus 组件尺寸（对应主题配置里的「布局大小」）
   *
   * - large: 较大
   * - default: 默认
   * - small: 稍小
   */
  type ComponentSize = 'large' | 'default' | 'small';

  /**
   * The layout mode
   *
   * - vertical: the vertical menu in left
   * - horizontal: the horizontal menu in top
   * - vertical-mix: two vertical mixed menus in left
   * - horizontal-mix: the vertical first level menus in left and horizontal child level menus in top
   */
  type ThemeLayoutMode = 'vertical' | 'horizontal' | 'vertical-mix' | 'horizontal-mix';

  /**
   * The scroll mode when content overflow
   *
   * - wrapper: the wrapper component's root element overflow
   * - content: the content component overflow
   */
  type ThemeScrollMode = import('@sa/materials').LayoutScrollMode;

  /** Page animate mode */
  type ThemePageAnimateMode = 'fade' | 'fade-slide' | 'fade-bottom' | 'fade-scale' | 'zoom-fade' | 'zoom-out' | 'none';

  /**
   * Tab mode
   *
   * - chrome: chrome style
   * - button: button style
   */
  type ThemeTabMode = import('@sa/materials').PageTabMode;
}
