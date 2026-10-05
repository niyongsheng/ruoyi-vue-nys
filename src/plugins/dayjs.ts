import { extend } from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { setDayjsLocale } from '../locales/dayjs';

export function setupDayjs() {
  extend(localeData);
  // 本地化格式（LL / LLL / LT 等），锁屏页日期等地方要用
  extend(localizedFormat);

  setDayjsLocale();
}
