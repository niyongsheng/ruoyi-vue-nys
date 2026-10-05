/**
 * RuoYi `$tab` 的兼容实现，接管到 soybean 的 tab store
 *
 * 对应 RuoYi 的 src/plugins/tab.js（原实现基于 tagsView store + /redirect 路由），
 * 这里改为「重置路由缓存 + 重挂载内容区」的刷新方式，页签操作直接落到 soybean 的 tab store。
 */
import { useTabStore } from '@/store/modules/tab'
import { useRouteStore } from '@/store/modules/route'
import { useAppStore } from '@/store/modules/app'
import { router } from '@/router'
import { getTabIdByRoute } from '@/store/modules/tab/shared'

/** 由 RuoYi 的路由对象解析出 soybean 的 tab id */
function resolveTabId(obj) {
  const tabStore = useTabStore()

  if (!obj) return tabStore.activeTabId

  if (typeof obj === 'string') return obj

  // 优先按 routeKey（name）匹配
  if (obj.name) {
    const tab = tabStore.tabs.find(item => item.routeKey === obj.name)
    if (tab) return tab.id
  }

  if (obj.path) {
    try {
      return getTabIdByRoute(obj)
    } catch (e) {
      console.error(e)
    }
  }

  return tabStore.activeTabId
}

export default {
  /** 刷新当前/指定页签 */
  async refreshPage(obj) {
    const name = obj?.name || router.currentRoute.value.name

    if (!name) return

    const routeStore = useRouteStore()
    const appStore = useAppStore()

    // KeepAlive 的 include 变化会触发 pruneCache，再重挂载内容区即完成刷新
    await routeStore.resetRouteCache(name)
    await appStore.reloadPage()
  },

  /** 关闭当前页签并打开新页签 */
  closeOpenPage(obj) {
    const tabStore = useTabStore()

    tabStore.removeActiveTab()

    if (obj !== undefined) {
      return router.push(obj)
    }

    return Promise.resolve()
  },

  /** 关闭页签 */
  closePage(obj) {
    const tabStore = useTabStore()

    return tabStore.removeTab(resolveTabId(obj))
  },

  /** 关闭全部页签 */
  closeAllPage() {
    return useTabStore().clearTabs()
  },

  /** 关闭左侧页签 */
  closeLeftPage(obj) {
    return useTabStore().clearLeftTabs(resolveTabId(obj))
  },

  /** 关闭右侧页签 */
  closeRightPage(obj) {
    return useTabStore().clearRightTabs(resolveTabId(obj))
  },

  /** 关闭其他页签 */
  closeOtherPage(obj) {
    return useTabStore().clearTabs([resolveTabId(obj)])
  },

  /** 打开页签（页签由路由守卫在导航后自动添加） */
  openPage(title, url, params) {
    return router.push({ path: url, query: params })
  },

  /** 修改页签标题 */
  updatePage(obj) {
    const tabStore = useTabStore()

    if (obj?.title) {
      tabStore.setTabLabel(obj.title, resolveTabId(obj))
    }
  }
}
