/**
 * 本地缓存（RuoYi 侧：RightToolbar 用它按 storageKey 保存表格列显隐）
 *
 * 原 RuoYi 版本的 session 部分已由 `@/utils/storage` 的 sessionStg 取代
 * （见 utils/request.js 的防重复提交），这里只保留按动态 key 读写的 local 部分。
 * 新代码请优先使用 `@/utils/storage` 的 localStg（带前缀 + 自动 JSON 序列化）。
 */
const localCache = {
  set (key, value) {
    if (!localStorage) {
      return
    }
    if (key != null && value != null) {
      localStorage.setItem(key, value)
    }
  },
  get (key) {
    if (!localStorage) {
      return null
    }
    if (key == null) {
      return null
    }
    return localStorage.getItem(key)
  },
  setJSON (key, jsonValue) {
    if (jsonValue != null) {
      this.set(key, JSON.stringify(jsonValue))
    }
  },
  getJSON (key) {
    const value = this.get(key)
    if (value != null) {
      return JSON.parse(value)
    }
    return null
  },
  remove (key) {
    localStorage.removeItem(key)
  }
}

export default {
  /**
   * 本地缓存
   */
  local: localCache
}
