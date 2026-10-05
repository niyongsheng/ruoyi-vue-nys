const local: App.I18n.Schema = {
  system: {
    title: 'NYS Admin',
    copyright: 'Copyright © 2026 NYS',
    updateTitle: 'System Version Update Notification',
    updateContent: 'A new version of the system has been detected. Do you want to refresh the page immediately?',
    updateConfirm: 'Refresh immediately',
    updateCancel: 'Later'
  },
  common: {
    backToHome: 'Back to home',
    cancel: 'Cancel',
    closed: 'Closed',
    close: 'Close',
    confirm: 'Confirm',
    keywordSearch: 'Please enter keyword',
    loading: 'Loading...',
    lockScreen: 'Lock Screen',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to log out?',
    markAllRead: 'Mark all as read',
    message: 'Message',
    noData: 'No Data',
    noContent: 'No content',
    noNotice: 'No notices',
    normal: 'Normal',
    notice: 'Notices',
    noticeDetail: 'Notice Detail',
    noticeType: {
      notification: 'Notification',
      announcement: 'Announcement'
    },
    search: 'Search',
    switch: 'Switch',
    tip: 'Tip',
    userCenter: 'User Center'
  },
  theme: {
    themeSchema: {
      title: 'Theme Schema',
      light: 'Light',
      dark: 'Dark',
      auto: 'Follow System'
    },
    grayscale: 'Grayscale',
    colourWeakness: 'Colour Weakness',
    layoutMode: {
      title: 'Layout Mode',
      vertical: 'Vertical Menu Mode',
      horizontal: 'Horizontal Menu Mode',
      'vertical-mix': 'Vertical Mix Menu Mode',
      'horizontal-mix': 'Horizontal Mix menu Mode',
      reverseHorizontalMix: 'Reverse first level menus and child level menus position'
    },
    recommendColor: 'Apply Recommended Color Algorithm',
    recommendColorDesc: 'The recommended color algorithm refers to',
    themeColor: {
      title: 'Theme Color',
      primary: 'Primary',
      info: 'Info',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
      followPrimary: 'Follow Primary'
    },
    scrollMode: {
      title: 'Scroll Mode',
      wrapper: 'Wrapper',
      content: 'Content'
    },
    page: {
      animate: 'Page Animate',
      mode: {
        title: 'Page Animate Mode',
        fade: 'Fade',
        'fade-slide': 'Slide',
        'fade-bottom': 'Fade Zoom',
        'fade-scale': 'Fade Scale',
        'zoom-fade': 'Zoom Fade',
        'zoom-out': 'Zoom Out',
        none: 'None'
      }
    },
    fixedHeaderAndTab: 'Fixed Header And Tab',
    header: {
      height: 'Header Height',
      breadcrumb: {
        visible: 'Breadcrumb Visible',
        showIcon: 'Breadcrumb Icon Visible'
      },
      multilingual: {
        visible: 'Display multilingual button'
      },
      globalSearch: {
        visible: 'Display global search button'
      }
    },
    componentSize: {
      title: 'Layout Size',
      large: 'Large',
      default: 'Default',
      small: 'Small'
    },
    tab: {
      visible: 'Tab Visible',
      cache: 'Persist Tabs',
      icon: 'Display Tab Icon',
      height: 'Tab Height',
      mode: {
        title: 'Tab Mode',
        chrome: 'Chrome',
        button: 'Button'
      }
    },
    sider: {
      inverted: 'Dark Sider',
      width: 'Sider Width',
      collapsedWidth: 'Sider Collapsed Width',
      mixWidth: 'Mix Sider Width',
      mixCollapsedWidth: 'Mix Sider Collapse Width',
      mixChildMenuWidth: 'Mix Child Menu Width'
    },
    footer: {
      visible: 'Footer Visible',
      fixed: 'Fixed Footer',
      height: 'Footer Height',
      right: 'Right Footer'
    },
    watermark: {
      visible: 'Watermark Full Screen Visible',
      text: 'Watermark Text',
      enableUserName: 'Enable User Name Watermark'
    },
    themeDrawerTitle: 'Theme Configuration',
    pageFunTitle: 'Page Function',
    group: {
      general: 'General',
      header: 'Header',
      tab: 'Tab Bar',
      sider: 'Sider',
      footer: 'Footer',
      watermark: 'Watermark'
    },
    configOperation: {
      copyConfig: 'Copy Config',
      copySuccessMsg: 'Copy Success, Please replace the variable "themeSettings" in "src/theme/settings.ts"',
      resetConfig: 'Reset Config',
      resetSuccessMsg: 'Reset Success'
    }
  },
  page: {
    login: {
      common: {
        loginOrRegister: 'Login / Register',
        usernamePlaceholder: 'Please enter username',
        passwordPlaceholder: 'Please enter password',
        codePlaceholder: 'Please enter verification code',
        refreshCode: 'Click to refresh',
        captcha: 'Verification code'
      },
      pwdLogin: {
        title: 'Password Login'
      },
      codeLogin: {
        title: 'Verification Code Login'
      },
      register: {
        title: 'Register'
      },
      resetPwd: {
        title: 'Reset Password'
      },
      bindWeChat: {
        title: 'Bind WeChat'
      },
      usernameRequired: 'Please enter your username',
      passwordRequired: 'Please enter your password',
      codeRequired: 'Please enter the verification code',
      rememberMe: 'Remember me',
      registerNow: 'Register now',
      submit: 'Login'
    },
    register: {
      confirmPasswordPlaceholder: 'Please enter the password again',
      confirmPasswordRequired: 'Please enter the password again',
      passwordMismatch: 'The two passwords do not match',
      usernameLength: 'Username length must be between {min} and {max}',
      passwordLength: 'Password length must be between {min} and {max}',
      passwordInvalidChars: 'Password cannot contain invalid characters: < > " \' \\ \\|',
      success: 'Congratulations, your account {username} has been registered!',
      backToLogin: 'Login with an existing account',
      submit: 'Register'
    },
    lock: {
      hint: 'The screen is locked, please enter your password',
      passwordPlaceholder: 'Please enter your password',
      passwordRequired: 'Please enter your password',
      backToLogin: 'Log out and sign in again'
    },
    exception: {
      '401': 'Sorry, you are not allowed to access this page',
      '403': 'Sorry, you have no permission to access this page',
      '404': 'Sorry, the page you visited does not exist',
      '500': 'Sorry, something went wrong with the server'
    },
    home: {
      downloadCount: 'Download Count',
      registerCount: 'Register Count',
      schedule: 'Work and rest Schedule',
      study: 'Study',
      work: 'Work',
      rest: 'Rest',
      entertainment: 'Entertainment',
      projectNews: {
        title: 'System News',
        moreNews: 'More News',
        desc1: 'Frontend framework optimized & upgraded.',
        desc2: 'Backend menu driven routing is online, menu changes take effect immediately.',
        desc3: 'Multi-tab and KeepAlive caching aligned with the original RuoYi semantics.',
        desc4: 'Request layer adapted, business pages migrated without modification.',
        desc5: 'Dashboard now shows real statistics from the backend.'
      },
      creativity: 'Creativity',
      onlineUsers: 'Online Users',
      scheduledJobs: 'Scheduled Jobs',
      operationLogs: 'Operation Logs',
      userCount: 'Total Users',
      roleCount: 'Total Roles',
      menuCount: 'Total Menus',
      deptCount: 'Total Departments',
      greeting: '{greeting}, {name}',
      greetingEarlyMorning: 'Still awake',
      greetingMorning: 'Good morning',
      greetingForenoon: 'Good morning',
      greetingNoon: 'Good afternoon',
      greetingAfternoon: 'Good afternoon',
      greetingEvening: 'Good evening',
      motto: 'If customers know you are not wasting their time, they will be generous.'
    }
  },
  route: {
    login: 'Login',
    register: 'Register',
    index: 'Home',
    profile: 'User Center',
    lock: 'Lock Screen',
    authRole: 'Assign Roles',
    authUser: 'Assign Users',
    dictData: 'Dictionary Data',
    jobLog: 'Job Log',
    genEdit: 'Edit Gen Config'
  },
  dropdown: {
    closeCurrent: 'Close Current',
    closeOther: 'Close Other',
    closeLeft: 'Close Left',
    closeRight: 'Close Right',
    closeAll: 'Close All'
  },
  icon: {
    themeConfig: 'Theme Configuration',
    themeSchema: 'Theme Schema',
    lang: 'Switch Language',
    fullscreen: 'Fullscreen',
    fullscreenExit: 'Exit Fullscreen',
    reload: 'Reload Page',
    collapse: 'Collapse Menu',
    expand: 'Expand Menu',
    pin: 'Pin',
    unpin: 'Unpin',
    github: 'Source Code'
  }
};

export default local;
