 /**
 * v-hasPermi 操作权限处理
 * Copyright (c) 2019 ruoyi
 */
import { useAuthStore } from '@/store/modules/auth'
import { ALL_PERMISSION } from '@/constants/app'

export default {
  mounted(el, binding) {
    const { value } = binding
    const permissions = useAuthStore().userInfo.permissions

    // 空值/非数组视为配置错误：按「无权限」处理并提示（fail-closed）。
    // 旧实现的 throw 不会移除元素，反而会把无权限的按钮留在页面上
    if (!Array.isArray(value) || value.length === 0) {
      // eslint-disable-next-line no-console -- 指令配置错误需要提示开发者
      console.warn('[v-hasPermi] 指令值应为非空权限数组，已按无权限处理：', value)
      el.parentNode && el.parentNode.removeChild(el)
      return
    }

    const hasPermissions = permissions.some(permission => {
      return ALL_PERMISSION === permission || value.includes(permission)
    })

    if (!hasPermissions) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
