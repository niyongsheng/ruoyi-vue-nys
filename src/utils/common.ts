import { useTitle } from '@vueuse/core';
import { $t } from '@/locales';

/**
 * Transform record to option
 *
 * @example
 *   ```ts
 *   const record = {
 *     key1: 'label1',
 *     key2: 'label2'
 *   };
 *   const options = transformRecordToOption(record);
 *   // [
 *   //   { value: 'key1', label: 'label1' },
 *   //   { value: 'key2', label: 'label2' }
 *   // ]
 *   ```;
 *
 * @param record
 */
export function transformRecordToOption<T extends Record<string, string>>(record: T) {
  return Object.entries(record).map(([value, label]) => ({
    value,
    label
  })) as CommonType.Option<keyof T, T[keyof T]>[];
}

/**
 * Translate options
 *
 * @param options
 */
export function translateOptions(options: CommonType.Option<string, App.I18n.I18nKey>[]) {
  return options.map(option => ({
    ...option,
    label: $t(option.label)
  }));
}

/**
 * Toggle html class
 *
 * @param className
 */
export function toggleHtmlClass(className: string) {
  function add() {
    document.documentElement.classList.add(className);
  }

  function remove() {
    document.documentElement.classList.remove(className);
  }

  return {
    add,
    remove
  };
}

/**
 * 设置浏览器标签页标题
 *
 * 非生产环境会在标题后追加环境标识（如 `首页 [development]`），
 * 便于同时打开多个环境时区分——环境标识来自 `VITE_APP_ENV`（见 .env.development / .env.staging）。
 *
 * @param title 页面标题（一般为路由的 title 或 i18n 文案）
 */
export function setDocumentTitle(title?: string) {
  const { VITE_APP_ENV } = import.meta.env;

  const envTag = VITE_APP_ENV && VITE_APP_ENV !== 'production' ? ` [${VITE_APP_ENV}]` : '';

  useTitle(title ? `${title}${envTag}` : '');
}
