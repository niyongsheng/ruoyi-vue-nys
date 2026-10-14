import type { PluginOption } from 'vite';
import compression from 'vite-plugin-compression';

/**
 * 构建产物预压缩（VITE_BUILD_COMPRESS=gzip → 生成 .gz 供 nginx gzip_static）
 */
export function setupCompression(viteEnv: Env.ImportMeta) {
  const plugins: PluginOption[] = [];
  const { VITE_BUILD_COMPRESS } = viteEnv;

  if (!VITE_BUILD_COMPRESS) return plugins;

  const compressList = VITE_BUILD_COMPRESS.split(',');

  if (compressList.includes('gzip')) {
    plugins.push(compression({ ext: '.gz', deleteOriginFile: false }));
  }
  if (compressList.includes('brotli')) {
    plugins.push(compression({ ext: '.br', algorithm: 'brotliCompress', deleteOriginFile: false }));
  }

  return plugins;
}
