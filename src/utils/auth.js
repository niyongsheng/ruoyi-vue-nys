/**
 * token 存取（由 RuoYi 的 Cookie 方案改为 soybean 的 localStg，与壳的路由守卫统一）
 *
 * RuoYi 原实现用 Cookie('Admin-Token')，soybean 的路由守卫读 localStg('token')，
 * 这里统一到 localStg，保证两边写入/读取的是同一份。
 */
import { localStg } from '@/utils/storage'

export function getToken() {
  return localStg.get('token') || ''
}

export function setToken(token) {
  return localStg.set('token', token)
}

export function removeToken() {
  return localStg.remove('token')
}

/**
 * 认证请求头（el-upload 等绕过 axios 的请求用它携带 token，避免各处重复拼 'Bearer '）
 */
export function getAuthHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}
