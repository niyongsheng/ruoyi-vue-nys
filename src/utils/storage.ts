import { createStorage } from '@sa/utils';

const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || '';

/** 本地缓存（带 VITE_STORAGE_PREFIX 前缀，值自动 JSON 序列化） */
export const localStg = createStorage<StorageType.Local>('local', storagePrefix);

/** 会话缓存 —— RuoYi 侧原先用 plugins/cache.js 的 session 实现，现已统一到这里 */
export const sessionStg = createStorage<StorageType.Session>('session', storagePrefix);
