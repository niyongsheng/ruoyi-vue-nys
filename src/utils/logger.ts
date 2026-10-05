/**
 * 控制台彩色日志工具
 *
 * 移植自 nys_lims_admin/src/utils/logger.js，保持 API 一致，
 * 便于后续两端代码互通。
 */

/* eslint-disable no-console, default-param-last -- 日志工具，输出到控制台即其职责；可选参数位置与源实现保持一致 */

type LoggerType = 'primary' | 'success' | 'info' | 'warn' | 'error' | 'default';

const typeColors: Record<LoggerType, string> = {
  primary: '#2d8cf0',
  success: '#19be6b',
  info: '#909399',
  warn: '#ff9900',
  error: '#f03f14',
  default: '#35495E'
};

function isArray(obj: unknown): obj is unknown[] {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

function typeColor(type: LoggerType) {
  return typeColors[type];
}

function print(type: LoggerType = 'default', text: unknown, back = false) {
  if (typeof text === 'object') {
    // 如果是对象则调用打印对象方式
    if (isArray(text)) {
      console.table(text);
    } else {
      console.dir(text);
    }
    return;
  }

  if (back) {
    // 打印带背景色的
    console.log(`%c ${text} `, `background:${typeColor(type)}; padding: 2px; border-radius: 4px; color: #fff;`);
    return;
  }

  console.log(
    `%c ${text} `,
    `border: 1px solid ${typeColor(type)};
      padding: 2px; border-radius: 4px;
      color: ${typeColor(type)};`
  );
}

function pretty(type: LoggerType = 'primary', title: string, text: unknown) {
  if (typeof text === 'object') {
    console.group('Console Group', title);
    console.log(
      `%c ${title}`,
      `background:${typeColor(type)};border:1px solid ${typeColor(type)};
        padding: 1px; border-radius: 4px; color: #fff;`
    );
    if (isArray(text)) {
      console.table(text);
    } else {
      console.dir(text);
    }
    console.groupEnd();
    return;
  }

  console.log(
    `%c ${title} %c ${text} %c`,
    `background:${typeColor(type)};border:1px solid ${typeColor(type)};
      padding: 1px; border-radius: 4px 0 0 4px; color: #fff;`,
    `border:1px solid ${typeColor(type)};
      padding: 1px; border-radius: 0 4px 4px 0; color: ${typeColor(type)};`,
    'background:transparent'
  );
}

const Logger = {
  typeColor,
  print,
  printBack(type: LoggerType = 'primary', text: unknown) {
    print(type, text, true);
  },
  pretty,
  prettyPrimary(title: string, ...text: unknown[]) {
    text.forEach(t => pretty('primary', title, t));
  },
  prettySuccess(title: string, ...text: unknown[]) {
    text.forEach(t => pretty('success', title, t));
  },
  prettyWarn(title: string, ...text: unknown[]) {
    text.forEach(t => pretty('warn', title, t));
  },
  prettyError(title: string, ...text: unknown[]) {
    text.forEach(t => pretty('error', title, t));
  },
  prettyInfo(title: string, ...text: unknown[]) {
    text.forEach(t => pretty('info', title, t));
  }
};

export default Logger;
