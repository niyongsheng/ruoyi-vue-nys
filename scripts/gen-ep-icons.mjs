/**
 * 生成「按需注册的 Element Plus 图标」清单
 *
 * 用法：node scripts/gen-ep-icons.mjs
 *
 * 为什么需要：RuoYi 页面用 `icon="Search"` 这类字符串引用图标，依赖图标被全局注册；
 * 但 `import * as ElIconsVue` + 全量注册会把 294 个图标（约 300 KB）全部打进首屏，
 * 而项目实际用到的只有几十个。这里扫描源码得出实际使用集合，生成 src/plugins/ep-icons.ts。
 */
import fs from 'node:fs';
import path from 'node:path';

const pkgDir = fs.readdirSync('node_modules/.pnpm').find(d => d.startsWith('@element-plus+icons-vue@'));
const componentsDir = path.join(
  'node_modules/.pnpm',
  pkgDir,
  'node_modules/@element-plus/icons-vue/dist/types/components'
);

const ALL = fs
  .readdirSync(componentsDir)
  .filter(f => f.endsWith('.vue.d.ts'))
  .map(f => f.replace('.vue.d.ts', ''));

const pascal = kebab =>
  kebab
    .split('-')
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join('');

let src = '';
const walk = dir => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.(vue|ts|js)$/.test(e.name) && !f.includes('plugins/ep-icons')) src += `${fs.readFileSync(f, 'utf8')}\n`;
  }
};
walk('src');

const used = [];
for (const kebab of ALL) {
  const name = pascal(kebab);
  const hit =
    src.includes(`<${name} `) ||
    src.includes(`<${name}/>`) ||
    src.includes(`<${kebab} `) ||
    src.includes(`<${kebab}/>`) ||
    src.includes(`icon="${name}"`) ||
    src.includes(`:icon="${name}"`) ||
    src.includes(`:icon="'${name}'"`) ||
    src.includes(`icon: '${name}'`) ||
    src.includes(`icon="${kebab}"`);
  if (hit) used.push(name);
}
used.sort();

const lines = used.map(n => `  ${n}`).join(',\n');
fs.writeFileSync(
  'src/plugins/ep-icons.ts',
  `/**
 * 按需注册的 Element Plus 图标（本文件由 scripts/gen-ep-icons.mjs 生成，请勿手改）
 *
 * RuoYi 页面用 \`icon="Search"\` 这类字符串引用图标，依赖全局注册；这里只注册项目
 * 实际用到的 ${used.length} 个（全量 294 个，约 300 KB）。新增图标后请重新执行生成脚本。
 */
import {
${lines}
} from '@element-plus/icons-vue';

export const epIcons = {
${lines}
};
`
);
console.log(`EP 图标：全量 ${ALL.length} → 实际使用 ${used.length}`);
console.log(used.join(', '));
