/** Default theme settings */
export const themeSettings: App.Theme.ThemeSetting = {
  themeScheme: 'auto',
  grayscale: false,
  colourWeakness: false,
  recommendColor: false,
  themeColor: '#646cff',
  otherColor: {
    info: '#2080f0',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d'
  },
  isInfoFollowPrimary: true,
  // Element Plus 组件尺寸（主题配置 → 页面功能 → 布局大小）
  componentSize: 'default',
  layout: {
    mode: 'vertical-mix',
    scrollMode: 'content',
    reverseHorizontalMix: false
  },
  page: {
    animate: true,
    animateMode: 'fade-slide'
  },
  header: {
    height: 56,
    breadcrumb: {
      visible: true,
      showIcon: false
    },
    multilingual: {
      visible: true
    },
    globalSearch: {
      visible: true
    }
  },
  tab: {
    visible: true,
    cache: true,
    icon: true,
    height: 38,
    mode: 'chrome'
  },
  fixedHeaderAndTab: true,
  sider: {
    inverted: false,
    width: 220,
    collapsedWidth: 64,
    mixWidth: 90,
    mixCollapsedWidth: 64,
    mixChildMenuWidth: 200
  },
  footer: {
    visible: true,
    fixed: false,
    height: 48,
    right: true
  },
  watermark: {
    visible: true,
    text: 'nys admin',
    enableUserName: false
  },
  tokens: {
    light: {
      colors: {
        container: 'rgb(255, 255, 255)',
        layout: 'rgb(247, 250, 252)',
        inverted: 'rgb(0, 20, 40)',
        'base-text': 'rgb(31, 31, 31)'
      },
      boxShadow: {
        header: '0 1px 2px rgb(0, 21, 41, 0.08)',
        sider: '2px 0 8px 0 rgb(29, 35, 41, 0.05)',
        tab: '0 1px 2px rgb(0, 21, 41, 0.08)'
      }
    },
    dark: {
      colors: {
        container: 'rgb(28, 28, 28)',
        layout: 'rgb(18, 18, 18)',
        'base-text': 'rgb(224, 224, 224)'
      }
    }
  }
};

/**
 * 两级深度的可选类型
 *
 * `Partial<T>` 只让顶层可选，嵌套对象仍要求完整；而覆盖配置需要能只写某个子项的某个字段
 * （如只改 `tab.height`），故这里放宽一层。
 */
type ThemeSettingOverride = {
  [K in keyof App.Theme.ThemeSetting]?: App.Theme.ThemeSetting[K] extends object
    ? Partial<App.Theme.ThemeSetting[K]>
    : App.Theme.ThemeSetting[K];
};

/**
 * 声明覆盖项
 *
 * 入参用 `ThemeSettingOverride` 做形状校验（允许深层部分写法），
 * 出参还原为 `Partial<ThemeSetting>`——因为 `initThemeSettings` 里的 `defu`
 * 是运行时深合并，类型上无法表达"深层可选"。
 */
function createThemeOverride(override: ThemeSettingOverride): Partial<App.Theme.ThemeSetting> {
  return override as Partial<App.Theme.ThemeSetting>;
}

/**
 * Override theme settings
 *
 * If publish new version, use `overrideThemeSettings` to override certain theme settings
 *
 * 注意：生产环境下主题配置会缓存到 localStorage，改 `themeSettings` 的默认值对老用户无效，
 * 需要在这里覆盖一次（机制见 src/store/modules/theme/shared.ts 的 BUILD_TIME 判断）。
 *
 * 这里列出的项会被**强制**写回（覆盖用户自己的调整），所以只放公司统一要求的配置项。
 */
export const overrideThemeSettings = createThemeOverride({
  themeScheme: 'auto',
  layout: { mode: 'vertical-mix' },
  header: { breadcrumb: { visible: true, showIcon: false } },
  tab: { height: 38 },
  watermark: { visible: true, text: 'nys admin', enableUserName: false }
});
