/**
 * Namespace Env
 *
 * It is used to declare the type of the import.meta object
 *
 * 注：soybean 原版里与 `@sa/axios` 请求层相关的一批变量
 * （VITE_SERVICE_SUCCESS_CODE / *_LOGOUT_CODES / *_EXPIRED_TOKEN_CODES / VITE_OTHER_SERVICE_BASE_URL /
 * VITE_SERVICE_BASE_URL）随该请求层一并移除，本项目接口前缀统一由 VITE_APP_BASE_API 提供。
 */
declare namespace Env {
  /** The router history mode */
  type RouterHistoryMode = 'hash' | 'history' | 'memory';

  /** Interface for import.meta */
  // eslint-disable-next-line @typescript-eslint/no-shadow
  interface ImportMeta extends ImportMetaEnv {
    /** The base url of the application */
    readonly VITE_BASE_URL: string;
    /** The title of the application */
    readonly VITE_APP_TITLE: string;
    /**
     * 当前环境标识（development / staging / production）
     *
     * 在每个 .env.<mode> 里定义，用于非生产环境的标题标记（见 utils/common.ts 的 setDocumentTitle）
     */
    readonly VITE_APP_ENV?: 'development' | 'staging' | 'production';
    /** The router history mode */
    readonly VITE_ROUTER_HISTORY_MODE?: RouterHistoryMode;
    /** The prefix of the iconify icon */
    readonly VITE_ICON_PREFIX: 'icon';
    /**
     * The prefix of the local icon
     *
     * This prefix is start with the icon prefix
     */
    readonly VITE_ICON_LOCAL_PREFIX: 'icon-local';
    /** 前端调用的接口前缀（dev 走 vite 代理，prod 由 nginx 反代到后端） */
    readonly VITE_APP_BASE_API: string;
    /** vite 代理的后端真实地址（仅 dev 需要，见 .env.development 与 build/config/proxy.ts） */
    readonly VITE_PROXY_TARGET?: string;
    /**
     * Whether to enable the http proxy
     *
     * Only valid in the development environment
     */
    readonly VITE_HTTP_PROXY?: CommonType.YesOrNo;
    /**
     * The home route key
     *
     * It only has effect when the auth route mode is static, if the route mode is dynamic, the home route key is
     * defined in the back-end
     */
    readonly VITE_ROUTE_HOME: import('@elegant-router/types').LastLevelRouteKey;
    /**
     * Default menu icon if menu icon is not set
     *
     * Iconify icon name
     */
    readonly VITE_MENU_ICON: string;
    /** Whether to build with sourcemap */
    readonly VITE_SOURCE_MAP?: CommonType.YesOrNo;
    /**
     * Iconify api provider url
     *
     * 项目内置了实际用到的图标数据（src/plugins/iconify.ts，由 scripts/gen-iconify-offline.mjs 生成），离线可用；
     * 这里仅在需要补拉新图标时用作兜底，内网可指向自建 iconify 服务
     *
     * @link https://docs.iconify.design/api/providers.html
     */
    readonly VITE_ICONIFY_URL?: string;
    /** Used to differentiate storage across different domains */
    readonly VITE_STORAGE_PREFIX?: string;
    /** Whether to automatically detect updates after configuring application packaging */
    readonly VITE_AUTOMATICALLY_DETECT_UPDATE?: CommonType.YesOrNo;
    /** show proxy url log in terminal */
    readonly VITE_PROXY_LOG?: CommonType.YesOrNo;
    /** The launch editor */
    readonly VITE_DEVTOOLS_LAUNCH_EDITOR?: import('vite-plugin-vue-devtools').VitePluginVueDevToolsOptions['launchEditor'];
  }
}

interface ImportMeta {
  readonly env: Env.ImportMeta;
}
