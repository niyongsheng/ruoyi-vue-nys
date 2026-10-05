/**
 * 密码强度规则
 * 根据参数 chrtype 动态生成校验规则
 *
 * i18n 边界（2026-10 静态页面国际化时确定）：
 *  - `registerPwdValidator` 用于**注册页**（前端静态页面），文案走 $t()
 *  - `pwdValidator` / `infoPwdValidator` / `pwdPromptValidator` 用于**业务页面**（系统管理 → 用户/个人中心），
 *    业务页面整体不国际化，故这些文案与共享常量 `PWD_RULES` 一律保持中文
 *  - 因此注册页要用的"非法字符"提示单独取 `page.register.passwordInvalidChars`，不要动 PWD_RULES
 *
 * chrtype 说明：
 *   0 - 任意字符（默认）
 *   1 - 纯数字（0-9）
 *   2 - 纯字母（a-z / A-Z）
 *   3 - 字母 + 数字（必须同时包含）
 *   4 - 字母 + 数字 + 特殊字符（必须同时包含，特殊字符：~!@#$%^&*()-=_+）
 */

import { $t } from '@/locales'
import { useAuthStore } from '@/store/modules/auth'

// 密码限制类型：后端配置 sys.account.chrtype，由 /getInfo 的 pwdChrtype 下发。
// RuoYi 原版写/读 sessionStorage（本项目的迁移版把写入点丢了，导致规则永远是 0），
// 这里改为直接读 auth store —— 顺带修好了「后端配了强度规则、前端不校验」的问题。
const pwdChrType = computed(() => useAuthStore().userInfo.pwdChrtype || '0')

// 各类型对应的正则、错误提示
const PWD_RULES = {
  '0': { pattern: /^[^<>"'|\\]+$/, message: '密码不能包含非法字符：< > " \' \\ |' },
  '1': { pattern: /^[0-9]+$/, message: '密码只能为数字（0-9）' },
  '2': { pattern: /^[a-zA-Z]+$/, message: '密码只能为英文字母（a-z、A-Z）' },
  '3': { pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/, message: '密码必须同时包含字母和数字' },
  '4': { pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()\-=_+])[A-Za-z\d~!@#$%^&*()\-=_+]+$/, message: '密码必须同时包含字母、数字和特殊字符（~!@#$%^&*()-=_+）' }
}

export function usePasswordRule() {
  // 默认密码校验
  const pwdValidator = computed(() => {
    const rule = PWD_RULES[pwdChrType.value] || PWD_RULES['0']
    return [
      { required: true, message: '密码不能为空', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度必须介于 6 和 20 之间', trigger: 'blur' },
      { pattern: rule.pattern, message: rule.message, trigger: 'blur' }
    ]
  })
  // 校验prompt的inputValidator函数
  const pwdPromptValidator = (value) => {
    const rule = PWD_RULES['0']
    if (!value || value.length < 6 || value.length > 20) {
      return '密码长度必须介于 6 和 20 之间'
    }
    if (!rule.pattern.test(value)) {
      return rule.message
    }
  }
  // 个人中心密码校验
  const infoPwdValidator = computed(() => {
    const rule = PWD_RULES[pwdChrType.value] || PWD_RULES['0']
    return [
      { required: true, message: '新密码不能为空', trigger: 'blur' },
      { min: 6, max: 20, message: '新密码长度必须介于 6 和 20 之间', trigger: 'blur' },
      { pattern: rule.pattern, message: rule.message, trigger: 'blur' }
    ]
  })
  // 注册页面密码校验（静态页面 → 文案走 i18n）
  const registerPwdValidator = computed(() => {
    const min = 6
    const max = 20
    return [
      { required: true, message: $t('page.login.passwordRequired'), trigger: 'blur' },
      { min, max, message: $t('page.register.passwordLength', { min, max }), trigger: 'blur' },
      { pattern: PWD_RULES['0'].pattern, message: $t('page.register.passwordInvalidChars'), trigger: 'blur' }
    ]
  })

  return {
    pwdChrType,
    pwdValidator,
    infoPwdValidator,
    pwdPromptValidator,
    registerPwdValidator
  }
}
