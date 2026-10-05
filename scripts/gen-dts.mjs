/**
 * 生成 unplugin 的类型声明（src/typings/auto-imports.d.ts、src/typings/components.d.ts）
 *
 * 这两个文件由 AutoImport / Components 插件在 Vite 启动时写入，`vite`（dev）与
 * `vite build` 都会触发；但 `vue-tsc`（typecheck）不经过 Vite，新克隆上直接跑
 * typecheck 会报一堆 “Cannot find name 'ElMessage'”。
 *
 * 这里以编程方式起一次 Vite，仅走到插件 configResolved 写出声明文件即关闭，
 * 让 typecheck 与 IDE 不必依赖“先跑过一次 dev/build”。
 *
 * 说明：本文件产出的声明覆盖**本地组件**（dirs 扫描）与**自动导入的 API**
 * （vue / vue-router / pinia / 项目 utils）；模板里的 Element Plus 组件（<ElTable> 等）
 * 类型由 tsconfig 的 `element-plus/global` 提供，不依赖这里生成的 resolver 条目，
 * 所以轻量生成与完整 build 的产物差异（El* 条目多少）不影响类型检查。
 * 若将来移除 tsconfig 的 element-plus/global，需改为依赖完整 build 的产物。
 */
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  logLevel: 'warn'
});

await server.close();

console.log('已生成 src/typings/auto-imports.d.ts、src/typings/components.d.ts');
