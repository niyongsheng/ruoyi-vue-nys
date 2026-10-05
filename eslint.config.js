import { defineConfig } from '@soybeanjs/eslint-config';

export default defineConfig(
  { vue: true, unocss: true },
  {
    // RuoYi 迁移过来的业务代码保持原样，不做风格校验：
    // 自动修复会产生数万行 diff，掩盖真实改动，也不利于后续对照上游。
    ignores: [
      // 业务页面（home 是本项目新写的，保留校验）
      'src/views/monitor/**',
      'src/views/system/**',
      'src/views/tool/**',
      'src/views/lock.vue',
      'src/views/login.vue',
      'src/views/register.vue',
      // RuoYi 的接口层与工具层
      'src/api/**',
      'src/directive/**',
      'src/utils/{auth,dict,errorCode,index,jsencrypt,passwordRule,ruoyi,scroll-to,validate}.js',
      'src/utils/generator/**',
      'src/plugins/{cache,modal,tab}.js',
      'src/store/modules/{dict,lock}.js',
      'src/components/{Crontab,DictTag,Editor,ExcelImportDialog,FileUpload,IconSelect,ImagePreview,ImageUpload,InnerLink,NoticeDetail,Pagination,ParentView,RightToolbar,TreePanel,iFrame}/**',
      // RuoYi 移植的全局样式
      'src/styles/scss/ruoyi-compat.scss',
      // 脚本生成的图标数据（长行无法按 prettier 排版）
      'src/plugins/iconify.ts'
    ]
  },
  {
    rules: {
      'vue/multi-word-component-names': [
        'warn',
        {
          ignores: ['index', 'Index', 'App', 'Register', '[id]', '[url]']
        }
      ],
      'vue/component-name-in-template-casing': [
        'warn',
        'PascalCase',
        {
          registeredComponentsOnly: false,
          ignores: ['/^icon-/']
        }
      ],
      'unocss/order-attributify': 'off'
    }
  }
);
