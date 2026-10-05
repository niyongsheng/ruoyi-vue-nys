import fs from 'node:fs';
import path from 'node:path';

const ICONS = [
  'ph:lock',
  'ph:user-circle',
  'ph:user',
  'ph:shield-check',
  'ph:sign-out',
  'ph:lock-key',
  'ph:caret-double-left-bold',
  'ph:caret-double-right-bold',
  'mdi:format-horizontal-align-right',
  'mdi:format-horizontal-align-left',
  'mdi:menu',
  'mdi:pin',
  'mdi:pin-off',
  'majesticons:color-swatch-line',
  'heroicons:language',
  'line-md:menu-fold-left',
  'line-md:menu-fold-right',
  'material-symbols:sunny',
  'material-symbols:nightlight-rounded',
  'material-symbols:hdr-auto',
  'ant-design:user-outlined',
  'ant-design:team-outlined',
  'ant-design:menu-outlined',
  'ant-design:line-outlined',
  'ant-design:column-width-outlined',
  'ant-design:close-outlined',
  'ant-design:apartment-outlined'
];

const byPrefix = {};
for (const full of ICONS) {
  const [prefix, name] = full.split(':');
  (byPrefix[prefix] ||= []).push(name);
}

const collections = [];
for (const [prefix, names] of Object.entries(byPrefix)) {
  const file = path.join('node_modules/@iconify/json/json', `${prefix}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(
      `缺少图标集: ${file}\n` +
        '提示：@iconify/json 不是常规依赖（体积约 400MB），只在生成离线图标数据时需要。\n' +
        '请先执行：pnpm add -D @iconify/json'
    );
  }
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const icons = {};
  for (const name of names) {
    let data = json.icons?.[name];
    if (!data && json.aliases?.[name]) {
      const parent = json.aliases[name].parent;
      data = { ...json.icons[parent], ...json.aliases[name] };
      delete data.parent;
    }
    if (!data) throw new Error(`${prefix}:${name} 在 ${prefix}.json 中不存在`);
    const { body, width, height, left, top, rotate, hFlip, vFlip } = data;
    const out = { body };
    if (width !== undefined) out.width = width;
    if (height !== undefined) out.height = height;
    if (left !== undefined) out.left = left;
    if (top !== undefined) out.top = top;
    if (rotate !== undefined) out.rotate = rotate;
    if (hFlip) out.hFlip = hFlip;
    if (vFlip) out.vFlip = vFlip;
    icons[name] = out;
  }
  collections.push({ prefix, icons, width: json.width ?? 24, height: json.height ?? 24 });
}

const blocks = collections
  .map(c => {
    const iconLines = Object.entries(c.icons)
      .map(([name, data]) => `      ${JSON.stringify(name)}: ${JSON.stringify(data, null, 0).replace(/"/g, "'")}`)
      .join(',\n');
    return `  addCollection({\n    prefix: '${c.prefix}',\n    width: ${c.width},\n    height: ${c.height},\n    icons: {\n${iconLines}\n    }\n  });`;
  })
  .join('\n\n');

const file = `/**
 * 图标离线化（本文件由脚本从 @iconify/json 生成，请勿手改）
 *
 * 背景：@iconify/vue 默认在运行期向 https://api.iconify.design 拉取图标数据，
 * 内网/无外网部署时图标会缺失（实测单次请求还需 ~7s）。这里把项目实际用到的
 * ${ICONS.length} 个图标的数据内联进来（约 ${(JSON.stringify(collections).length / 1024).toFixed(1)} KB），
 * 保证离线可用；如后续新增图标，重新生成或配置 VITE_ICONIFY_URL 指向自建 iconify 服务。
 *
 * 生成方式：
 *   node scripts/gen-iconify-offline.mjs   （图标清单在脚本顶部 ICONS 中维护）
 */
import { addAPIProvider, addCollection } from '@iconify/vue';

/** 内置图标数据（离线可用） */
function setupOfflineCollections() {
${blocks}
}

/** 可选的在线兜底：设置 VITE_ICONIFY_URL 后，未内置的图标会向该地址拉取 */
function setupAPIProvider() {
  const { VITE_ICONIFY_URL } = import.meta.env;

  if (VITE_ICONIFY_URL) {
    addAPIProvider('', { resources: [VITE_ICONIFY_URL] });
  }
}

/** Setup the iconify offline */
export function setupIconifyOffline() {
  setupOfflineCollections();
  setupAPIProvider();
}
`;

fs.writeFileSync('src/plugins/iconify.ts', file);
console.log(
  `已生成 src/plugins/iconify.ts （${collections.length} 个图标集 / ${ICONS.length} 个图标，${(file.length / 1024).toFixed(1)} KB）`
);
