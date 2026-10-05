<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { getPaletteColorByNumber, mixColor } from '@sa/color';
import { getCodeImg } from '@/api/login';
import { localStg } from '@/utils/storage';
import { useAuthStore } from '@/store/modules/auth';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';

defineOptions({ name: 'Login' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

/** 背景配色（与 soybean 登录页一致） */
const bgThemeColor = computed(() =>
  themeStore.darkMode ? getPaletteColorByNumber(themeStore.themeColor, 600) : themeStore.themeColor
);

// 浅色模式：白底混主色；深色模式：黑底混主色（soybean 原版深色下仍混白，会得到浅紫底与深色卡片不搭）
const bgColor = computed(() =>
  themeStore.darkMode
    ? mixColor('#000000', themeStore.themeColor, 0.15)
    : mixColor('#ffffff', themeStore.themeColor, 0.2)
);

const loginFormRef = ref<FormInstance>();

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false,
  code: '',
  uuid: ''
});

/** 校验规则（computed：保证切换语言后文案跟着变） */
const loginRules = computed<FormRules>(() => ({
  username: [{ required: true, trigger: 'blur', message: $t('page.login.usernameRequired') }],
  password: [{ required: true, trigger: 'blur', message: $t('page.login.passwordRequired') }],
  code: [{ required: true, trigger: 'change', message: $t('page.login.codeRequired') }]
}));

const codeUrl = ref('');
const loading = ref(false);
/** 验证码开关 */
const captchaEnabled = ref(true);
/** 注册开关 */
const register = ref(false);

const redirect = computed(() => (route.query.redirect as string) || '/');

async function handleLogin() {
  const valid = await loginFormRef.value?.validate().catch(() => false);

  if (!valid) return;

  loading.value = true;

  // 「记住我」：勾选时把账号密码明文存入本地（localStg，与 token 同一存储层）；
  // 不再走 Cookie——Cookie 会随每个请求发给后端，也不再用客户端 RSA 加密（私钥随产物分发，等同明文）
  if (loginForm.rememberMe) {
    localStg.set('rememberMe', { username: loginForm.username, password: loginForm.password });
  } else {
    localStg.remove('rememberMe');
  }

  const success = await authStore.login({ ...loginForm }, false);

  if (success) {
    const query = route.query;
    const otherQueryParams = Object.keys(query).reduce<Record<string, any>>((acc, cur) => {
      if (cur !== 'redirect') {
        acc[cur] = query[cur];
      }

      return acc;
    }, {});

    router.push({ path: redirect.value || '/', query: otherQueryParams });
  } else {
    loading.value = false;
    // 登录失败刷新验证码
    if (captchaEnabled.value) getCode();
  }
}

function getCode() {
  getCodeImg().then((res: any) => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;

    if (captchaEnabled.value) {
      codeUrl.value = `data:image/gif;base64,${res.img}`;
      loginForm.uuid = res.uuid;
    }
  });
}

function restoreRememberMe() {
  const saved = localStg.get('rememberMe');

  if (saved) {
    loginForm.username = saved.username ?? '';
    loginForm.password = saved.password ?? '';
    loginForm.rememberMe = true;
  }
}

/** 一次性迁移：清理旧版存在 Cookie 里的记住密码（含 RSA 加密的 password） */
function clearLegacyRememberCookies() {
  ['username', 'password', 'rememberMe'].forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}

onMounted(() => {
  clearLegacyRememberCookies();
  restoreRememberMe();
  getCode();
});
</script>

<template>
  <div class="relative size-full flex-center overflow-hidden" :style="{ backgroundColor: bgColor }">
    <WaveBg :theme-color="bgThemeColor" />

    <ElCard class="relative z-4 w-auto rd-12px">
      <div class="w-400px lt-sm:w-300px">
        <header class="flex-y-center justify-between">
          <SystemLogo class="size-64px lt-sm:size-48px" />
          <h3 class="text-28px text-primary font-500 lt-sm:text-22px">{{ $t('system.title') }}</h3>
          <div class="i-flex-col">
            <ThemeSchemaSwitch
              :theme-schema="themeStore.themeScheme"
              :show-tooltip="false"
              class="text-20px lt-sm:text-18px"
              @switch="themeStore.toggleThemeScheme"
            />
          </div>
        </header>

        <main class="pt-24px">
          <h3 class="text-18px text-primary font-medium">{{ $t('page.login.pwdLogin.title') }}</h3>

          <ElForm
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            size="large"
            class="pt-24px"
            @keyup.enter="handleLogin"
          >
            <ElFormItem prop="username">
              <ElInput v-model="loginForm.username" :placeholder="$t('page.login.common.usernamePlaceholder')" autocomplete="off">
                <template #prefix>
                  <SvgIcon icon="ph:user" />
                </template>
              </ElInput>
            </ElFormItem>

            <ElFormItem prop="password">
              <ElInput v-model="loginForm.password" type="password" :placeholder="$t('page.login.common.passwordPlaceholder')" show-password autocomplete="off">
                <template #prefix>
                  <SvgIcon icon="ph:lock" />
                </template>
              </ElInput>
            </ElFormItem>

            <ElFormItem v-if="captchaEnabled" prop="code">
              <div class="w-full flex gap-12px">
                <ElInput v-model="loginForm.code" :placeholder="$t('page.login.common.codePlaceholder')" autocomplete="off" class="flex-1">
                  <template #prefix>
                    <SvgIcon icon="ph:shield-check" />
                  </template>
                </ElInput>
                <div
                  class="h-full shrink-0 cursor-pointer overflow-hidden rd-4px bg-[var(--el-fill-color-light)]"
                  :title="$t('page.login.common.refreshCode')"
                  @click="getCode"
                >
                  <img v-if="codeUrl" :src="codeUrl" class="h-full" :alt="$t('page.login.common.captcha')" />
                </div>
              </div>
            </ElFormItem>

            <div class="mb-20px flex-y-center justify-between">
              <ElCheckbox v-model="loginForm.rememberMe">{{ $t('page.login.rememberMe') }}</ElCheckbox>
              <ElButton v-if="register" text type="primary" @click="router.push('/register')">{{ $t('page.login.registerNow') }}</ElButton>
            </div>

            <ElButton
              type="primary"
              size="large"
              round
              class="w-full"
              :loading="loading"
              @click="handleLogin"
            >
              {{ $t('page.login.submit') }}
            </ElButton>
          </ElForm>
        </main>
      </div>
    </ElCard>

    <div class="absolute bottom-16px z-4 text-12px tracking-1px opacity-70">{{ $t('system.copyright') }}</div>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-card__body) {
  padding: 32px 32px 24px;
}

/* 验证码图片高度与 large 尺寸输入框对齐 */
:deep(.el-form-item) .h-full {
  line-height: 0;
}
</style>
