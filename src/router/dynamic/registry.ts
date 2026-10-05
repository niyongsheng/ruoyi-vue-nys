/**
 * 运行期路由注册表
 *
 * 替换 elegant-router 构建期生成的 `routeMap`（原 src/router/elegant/transform.ts 底部常量）。
 * 后端菜单驱动模式下，路由在运行期才确定，因此 name <-> path 的映射必须可写。
 */
const nameToPath = new Map<string, string>();
const pathToName = new Map<string, string>();

/**
 * 注册一条路由的 name/path 映射
 *
 * @param name 路由名称
 * @param path 路由完整路径（以 / 开头）
 */
export function registerRoute(name: string, path: string) {
  if (!name || !path) return;

  const existPath = nameToPath.get(name);

  if (import.meta.env.DEV && existPath && existPath !== path) {
    // eslint-disable-next-line no-console
    console.warn(`[route-registry] 路由名重复注册：${name}（${existPath} → ${path}）`);
  }

  nameToPath.set(name, path);
  pathToName.set(path, name);
}

/** 清空注册表（登出/重置时调用） */
export function resetRegistry() {
  nameToPath.clear();
  pathToName.clear();
}

/** 按路由名取路径（未注册时返回空串，调用方用 `if (path)` 判断） */
export function getRoutePath(name: string): string {
  return nameToPath.get(name) ?? '';
}

/** 按路径取路由名 */
export function getRouteName(path: string) {
  return pathToName.get(path) ?? null;
}

/** 路径是否已注册（精确匹配，或匹配到参数化路径 /xxx/:id） */
export function isRouteExistByPath(path: string) {
  if (pathToName.has(path)) return true;

  // 参数化路径匹配：/system/user-auth/role/3 → /system/user-auth/role/:userId
  const segments = path.split('/').filter(Boolean);

  return Array.from(pathToName.keys()).some(routePath => {
    const routeSegments = routePath.split('/').filter(Boolean);
    if (routeSegments.length !== segments.length) return false;

    return routeSegments.every((seg, index) => seg.startsWith(':') || seg === segments[index]);
  });
}
