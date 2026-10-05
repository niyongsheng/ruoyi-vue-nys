import { createApp } from 'vue';
import './plugins/assets';
import './plugins/ui';
import Logger from '@/utils/logger';
import { setupAppVersionNotification, setupDayjs, setupIconifyOffline, setupLoading, setupNProgress } from './plugins';
import { setupStore } from './store';
import { setupRouter } from './router';
import { setupI18n } from './locales';
import { setupRuoYiPlugins } from './plugins/ruoyi';
import App from './App.vue';
import { version } from '~/package.json';

async function setupApp() {
  setupLoading();

  setupNProgress();

  setupIconifyOffline();

  setupDayjs();

  const app = createApp(App);

  setupStore(app);

  // RuoYi 全局能力（$modal/$tab/useDict/指令/EP 图标等）
  setupRuoYiPlugins(app);

  await setupRouter(app);

  setupI18n(app);

  setupAppVersionNotification();

  app.mount('#app');

  Logger.prettySuccess('欢迎使用', `${import.meta.env.VITE_APP_TITLE} v${version}`);
  Logger.prettyPrimary('商务合作', 'https://looplooptech.com');
}

setupApp();
