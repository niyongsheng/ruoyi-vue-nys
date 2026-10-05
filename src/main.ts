import { createApp } from 'vue';
import './plugins/assets';
import './plugins/ui';
import { setupAppVersionNotification, setupDayjs, setupIconifyOffline, setupLoading, setupNProgress } from './plugins';
import { setupStore } from './store';
import { setupRouter } from './router';
import { setupI18n } from './locales';
import { setupRuoYiPlugins } from './plugins/ruoyi';
import App from './App.vue';

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
}

setupApp();
