import { localStg } from '@/utils/storage'

export const useLockStore = defineStore('lock', {
  state: () => ({
    isLock: localStg.get('screenLock') || false,
    lockPath: localStg.get('screenLockPath') || '/index'
  }),
  actions: {
    /** 锁定屏幕，记录当前路径 */
    lockScreen(currentPath) {
      this.lockPath = currentPath || '/index'
      this.isLock = true
      localStg.set('screenLock', true)
      localStg.set('screenLockPath', this.lockPath)
    },
    /** 解锁屏幕 */
    unlockScreen() {
      this.isLock = false
      this.lockPath = '/index'
      localStg.set('screenLock', false)
      localStg.set('screenLockPath', '/index')
    }
  }
})

export default useLockStore
