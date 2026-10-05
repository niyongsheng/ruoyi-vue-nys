/** The storage namespace */
declare namespace StorageType {
  interface Session {
    /** The theme color */
    themeColor: string;
    /** 防重复提交的请求快照（utils/request.js） */
    requestObj: { url: string; data: unknown; time: number } | null;
  }

  interface Local {
    /** The i18n language */
    lang: App.I18n.LangType;
    /** The token */
    token: string;
    /** Fixed sider with mix-menu */
    mixSiderFixed: CommonType.YesOrNo;
    /** 锁屏状态（store/modules/lock.js） */
    screenLock: boolean;
    /** 锁屏前的路径 */
    screenLockPath: string;
    /** The theme color */
    themeColor: string;
    /** The dark mode */
    darkMode: boolean;
    /** The theme settings */
    themeSettings: App.Theme.ThemeSetting;
    /**
     * The override theme flags
     *
     * The value is the build time of the project
     */
    overrideThemeFlag: string;
    /** The global tabs */
    globalTabs: App.Global.Tab[];
    /** The backup theme setting before is mobile */
    backupThemeSettingBeforeIsMobile: {
      layout: UnionKey.ThemeLayoutMode;
      siderCollapse: boolean;
    };

    /** The last login user id */
    lastLoginUserId: string;
    /** 登录页「记住密码」保存的账号密码（明文，本地便利功能；清空 = 取消勾选） */
    rememberMe: { username: string; password: string } | null;
  }
}
