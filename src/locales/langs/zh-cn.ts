const local: App.I18n.Schema = {
  system: {
    title: 'NYS 管理系统',
    copyright: 'Copyright © 2026 NYS',
    updateTitle: '系统版本更新通知',
    updateContent: '检测到系统有新版本发布，是否立即刷新页面？',
    updateConfirm: '立即刷新',
    updateCancel: '稍后再说'
  },
  common: {
    backToHome: '返回首页',
    cancel: '取消',
    closed: '已关闭',
    close: '关闭',
    confirm: '确认',
    keywordSearch: '请输入关键词搜索',
    loading: '加载中...',
    lockScreen: '锁定屏幕',
    logout: '退出登录',
    logoutConfirm: '确认退出登录吗？',
    markAllRead: '全部已读',
    message: '消息',
    noData: '无数据',
    noContent: '暂无内容',
    noNotice: '暂无公告',
    normal: '正常',
    notice: '通知公告',
    noticeDetail: '公告详情',
    noticeType: {
      notification: '通知',
      announcement: '公告'
    },
    search: '搜索',
    switch: '切换',
    tip: '提示',
    userCenter: '个人中心'
  },
  theme: {
    themeSchema: {
      title: '主题模式',
      light: '亮色模式',
      dark: '暗黑模式',
      auto: '跟随系统'
    },
    grayscale: '灰色模式',
    colourWeakness: '色弱模式',
    layoutMode: {
      title: '布局模式',
      vertical: '左侧菜单模式',
      'vertical-mix': '左侧菜单混合模式',
      horizontal: '顶部菜单模式',
      'horizontal-mix': '顶部菜单混合模式',
      reverseHorizontalMix: '一级菜单与子级菜单位置反转'
    },
    recommendColor: '应用推荐算法的颜色',
    recommendColorDesc: '推荐颜色的算法参照',
    themeColor: {
      title: '主题颜色',
      primary: '主色',
      info: '信息色',
      success: '成功色',
      warning: '警告色',
      error: '错误色',
      followPrimary: '跟随主色'
    },
    scrollMode: {
      title: '滚动模式',
      wrapper: '外层滚动',
      content: '主体滚动'
    },
    page: {
      animate: '页面切换动画',
      mode: {
        title: '页面切换动画类型',
        'fade-slide': '滑动',
        fade: '淡入淡出',
        'fade-bottom': '底部消退',
        'fade-scale': '缩放消退',
        'zoom-fade': '渐变',
        'zoom-out': '闪现',
        none: '无'
      }
    },
    fixedHeaderAndTab: '固定头部和标签栏',
    header: {
      height: '头部高度',
      breadcrumb: {
        visible: '显示面包屑',
        showIcon: '显示面包屑图标'
      },
      multilingual: {
        visible: '显示多语言按钮'
      },
      globalSearch: {
        visible: '显示全局搜索按钮'
      }
    },
    componentSize: {
      title: '布局大小',
      large: '较大',
      default: '默认',
      small: '稍小'
    },
    tab: {
      visible: '显示标签栏',
      cache: '持久化标签页',
      icon: '显示页签图标',
      height: '标签栏高度',
      mode: {
        title: '标签栏风格',
        chrome: '谷歌风格',
        button: '按钮风格'
      }
    },
    sider: {
      inverted: '深色侧边栏',
      width: '侧边栏宽度',
      collapsedWidth: '侧边栏折叠宽度',
      mixWidth: '混合布局侧边栏宽度',
      mixCollapsedWidth: '混合布局侧边栏折叠宽度',
      mixChildMenuWidth: '混合布局子菜单宽度'
    },
    footer: {
      visible: '显示底部',
      fixed: '固定底部',
      height: '底部高度',
      right: '底部局右'
    },
    watermark: {
      visible: '显示全屏水印',
      text: '水印文本',
      enableUserName: '启用用户名水印'
    },
    themeDrawerTitle: '主题配置',
    pageFunTitle: '页面功能',
    group: {
      general: '通用',
      header: '顶栏',
      tab: '标签栏',
      sider: '侧边栏',
      footer: '页脚',
      watermark: '水印'
    },
    configOperation: {
      copyConfig: '复制配置',
      copySuccessMsg: '复制成功，请替换 src/theme/settings.ts 中的变量 themeSettings',
      resetConfig: '重置配置',
      resetSuccessMsg: '重置成功'
    }
  },
  page: {
    login: {
      common: {
        loginOrRegister: '登录 / 注册',
        usernamePlaceholder: '请输入账号',
        passwordPlaceholder: '请输入密码',
        codePlaceholder: '请输入验证码',
        refreshCode: '点击刷新验证码',
        captcha: '验证码'
      },
      pwdLogin: {
        title: '密码登录'
      },
      codeLogin: {
        title: '验证码登录'
      },
      register: {
        title: '注册账号'
      },
      resetPwd: {
        title: '重置密码'
      },
      bindWeChat: {
        title: '绑定微信'
      },
      usernameRequired: '请输入您的账号',
      passwordRequired: '请输入您的密码',
      codeRequired: '请输入验证码',
      rememberMe: '记住密码',
      registerNow: '立即注册',
      submit: '登 录'
    },
    register: {
      confirmPasswordPlaceholder: '请再次输入密码',
      confirmPasswordRequired: '请再次输入密码',
      passwordMismatch: '两次输入的密码不一致',
      usernameLength: '用户账号长度必须介于 {min} 和 {max} 之间',
      passwordLength: '用户密码长度必须介于 {min} 和 {max} 之间',
      passwordInvalidChars: '密码不能包含非法字符：< > " \' \\ \\|',
      success: '恭喜你，您的账号 {username} 注册成功！',
      backToLogin: '使用已有账户登录',
      submit: '注 册'
    },
    lock: {
      hint: '系统已锁定，请输入密码解锁',
      passwordPlaceholder: '请输入登录密码',
      passwordRequired: '请输入密码',
      backToLogin: '退出重新登录'
    },
    exception: {
      '401': '抱歉，你没有访问该页面的权限',
      '403': '抱歉，你无权访问该页面',
      '404': '抱歉，你访问的页面不存在',
      '500': '抱歉，服务器出错了'
    },
    home: {
      downloadCount: '下载量',
      registerCount: '注册量',
      schedule: '作息安排',
      study: '学习',
      work: '工作',
      rest: '休息',
      entertainment: '娱乐',
      projectNews: {
        title: '系统动态',
        moreNews: '更多动态',
        desc1: '前端框架优化升级',
        desc2: '后端菜单驱动路由接入完成，菜单管理改动即时生效。',
        desc3: '多标签页与 KeepAlive 缓存机制已对齐 RuoYi 原有语义。',
        desc4: '请求层契约适配完成，业务页面零改动迁移。',
        desc5: '首页工作台已接入真实统计数据。'
      },
      creativity: '创意',
      onlineUsers: '在线用户',
      scheduledJobs: '定时任务',
      operationLogs: '操作日志',
      userCount: '用户总数',
      roleCount: '角色数',
      menuCount: '菜单数',
      deptCount: '部门数',
      greeting: '{greeting} {name}',
      greetingEarlyMorning: '夜深了',
      greetingMorning: '早安',
      greetingForenoon: '上午好',
      greetingNoon: '午安',
      greetingAfternoon: '下午好',
      greetingEvening: '晚上好',
      motto: '如果客户知道你没有浪费他的时间，他就会很慷慨。'
    }
  },
  route: {
    login: '登录',
    register: '注册',
    index: '首页',
    profile: '个人中心',
    lock: '锁定屏幕',
    authRole: '分配角色',
    authUser: '分配用户',
    dictData: '字典数据',
    jobLog: '调度日志',
    genEdit: '修改生成配置'
  },
  dropdown: {
    closeCurrent: '关闭',
    closeOther: '关闭其它',
    closeLeft: '关闭左侧',
    closeRight: '关闭右侧',
    closeAll: '关闭所有'
  },
  icon: {
    themeConfig: '主题配置',
    themeSchema: '主题模式',
    lang: '切换语言',
    fullscreen: '全屏',
    fullscreenExit: '退出全屏',
    reload: '刷新页面',
    collapse: '折叠菜单',
    expand: '展开菜单',
    pin: '固定',
    unpin: '取消固定',
    github: '源码地址'
  }
};

export default local;
