<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { getPaletteColorByNumber, mixColor } from '@sa/color';
import { getCodeImg, register } from '@/api/login';
import { useThemeStore } from '@/store/modules/theme';
import { usePasswordRule } from '@/utils/passwordRule';
import { $t } from '@/locales';

defineOptions({ name: 'Register' });

const router = useRouter();
const themeStore = useThemeStore();
const { registerPwdValidator } = usePasswordRule();

/** 背景配色（与登录页一致） */
const bgThemeColor = computed(() =>
  themeStore.darkMode ? getPaletteColorByNumber(themeStore.themeColor, 600) : themeStore.themeColor
);

// 浅色模式：白底混主色；深色模式：黑底混主色（soybean 原版深色下仍混白，会得到浅紫底与深色卡片不搭）
const bgColor = computed(() =>
  themeStore.darkMode
    ? mixColor('#000000', themeStore.themeColor, 0.15)
    : mixColor('#ffffff', themeStore.themeColor, 0.2)
);

const registerFormRef = ref<FormInstance>();

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
  uuid: ''
});

const equalToPassword = (rule: any, value: string, callback: (error?: Error) => void) => {
  if (registerForm.password !== value) {
    callback(new Error($t('page.register.passwordMismatch')));
  } else {
    callback();
  }
};

/** 校验规则（computed：保证切换语言后文案跟着变；min/max 用插值，避免与规则里的数字两处维护） */
const registerRules = computed<FormRules>(() => {
  const usernameMin = 2;
  const usernameMax = 20;

  return {
    username: [
      { required: true, trigger: 'blur', message: $t('page.login.usernameRequired') },
      {
        min: usernameMin,
        max: usernameMax,
        message: $t('page.register.usernameLength', { min: usernameMin, max: usernameMax }),
        trigger: 'blur'
      }
    ],
    confirmPassword: [
      { required: true, trigger: 'blur', message: $t('page.register.confirmPasswordRequired') },
      { validator: equalToPassword, trigger: 'blur' }
    ],
    code: [{ required: true, trigger: 'change', message: $t('page.login.codeRequired') }]
  };
});

const codeUrl = ref('');
const loading = ref(false);
const captchaEnabled = ref(true);

async function handleRegister() {
  const valid = await registerFormRef.value?.validate().catch(() => false);

  if (!valid) return;

  loading.value = true;

  try {
    await register(registerForm);

    const { username } = registerForm;

    await ElMessageBox.alert($t('page.register.success', { username }), $t('common.tip'), {
      type: 'success'
    });

    router.push('/login');
  } catch {
    loading.value = false;

    if (captchaEnabled.value) getCode();
  }
}

function getCode() {
  getCodeImg().then((res: any) => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;

    if (captchaEnabled.value) {
      codeUrl.value = `data:image/gif;base64,${res.img}`;
      registerForm.uuid = res.uuid;
    }
  });
}

onMounted(getCode);
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
          <h3 class="text-18px text-primary font-medium">{{ $t('page.login.register.title') }}</h3>

          <ElForm
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            size="large"
            class="pt-24px"
            @keyup.enter="handleRegister"
          >
            <ElFormItem prop="username">
              <ElInput v-model="registerForm.username" :placeholder="$t('page.login.common.usernamePlaceholder')" autocomplete="off">
                <template #prefix>
                  <SvgIcon icon="ph:user" />
                </template>
              </ElInput>
            </ElFormItem>

            <ElFormItem prop="password" :rules="registerPwdValidator">
              <ElInput v-model="registerForm.password" type="password" :placeholder="$t('page.login.common.passwordPlaceholder')" autocomplete="off">
                <template #prefix>
                  <SvgIcon icon="ph:lock" />
                </template>
              </ElInput>
            </ElFormItem>

            <ElFormItem prop="confirmPassword">
              <ElInput
                v-model="registerForm.confirmPassword"
                type="password"
                :placeholder="$t('page.register.confirmPasswordPlaceholder')"
                autocomplete="off"
              >
                <template #prefix>
                  <SvgIcon icon="ph:lock-key" />
                </template>
              </ElInput>
            </ElFormItem>

            <ElFormItem v-if="captchaEnabled" prop="code">
              <div class="w-full flex gap-12px">
                <ElInput v-model="registerForm.code" :placeholder="$t('page.login.common.codePlaceholder')" autocomplete="off" class="flex-1">
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

            <div class="mb-20px flex-y-center justify-end">
              <ElButton text type="primary" @click="router.push('/login')">{{ $t('page.register.backToLogin') }}</ElButton>
            </div>

            <ElButton
              type="primary"
              size="large"
              round
              class="w-full"
              :loading="loading"
              @click="handleRegister"
            >
              {{ $t('page.register.submit') }}
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

:deep(.el-form-item) .h-full {
  line-height: 0;
}
</style>
