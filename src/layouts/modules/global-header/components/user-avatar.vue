<script setup lang="ts">
import { computed } from 'vue';
import type { VNode } from 'vue';
import { useRoute } from 'vue-router';
import { router } from '@/router';
import { useAuthStore } from '@/store/modules/auth';
import { useLockStore } from '@/store/modules/lock';
import { useRouterPush } from '@/hooks/common/router';
import { useSvgIcon } from '@/hooks/common/icon';
import { $t } from '@/locales';

defineOptions({ name: 'UserAvatar' });

const route = useRoute();
const authStore = useAuthStore();
const lockStore = useLockStore();
const { toLogin } = useRouterPush();
const { SvgIconVNode } = useSvgIcon();

type DropdownKey = 'user-center' | 'lock-screen' | 'logout';

type DropdownOption = {
  key: DropdownKey;
  label: string;
  icon?: () => VNode;
};

const options = computed(() => {
  const opts: DropdownOption[] = [
    {
      label: $t('common.userCenter'),
      key: 'user-center',
      icon: SvgIconVNode({ icon: 'ph:user-circle', fontSize: 18 })
    },
    {
      label: $t('common.lockScreen'),
      key: 'lock-screen',
      icon: SvgIconVNode({ icon: 'ph:lock', fontSize: 18 })
    },
    {
      label: $t('common.logout'),
      key: 'logout',
      icon: SvgIconVNode({ icon: 'ph:sign-out', fontSize: 18 })
    }
  ];

  return opts;
});

/** 锁定屏幕（记录当前路径，解锁后回到这里） */
function lockScreen() {
  lockStore.lockScreen(route.fullPath);
  router.push('/lock');
}

function logout() {
  window.$messageBox
    ?.confirm($t('common.logoutConfirm'), $t('common.tip'), {
      confirmButtonText: $t('common.confirm'),
      cancelButtonText: $t('common.cancel'),
      type: 'warning'
    })
    .then(() => {
      authStore.resetStore();
    });
}

function handleDropdown(key: DropdownKey) {
  if (key === 'logout') {
    logout();

    return;
  }

  // 个人中心走 RuoYi 的 Profile 路由
  if (key === 'user-center') {
    router.push('/user/profile');

    return;
  }

  lockScreen();
}
</script>

<template>
  <ElButton v-if="!authStore.isLogin" text @click="toLogin()">
    {{ $t('page.login.common.loginOrRegister') }}
  </ElButton>

  <ElDropdown class="px-14px" trigger="click" @command="handleDropdown">
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          v-for="{ key, label, icon } in options"
          :key="key"
          class="mx-4px my-1px rounded-6px"
          :icon="icon"
          :command="key"
        >
          {{ label }}
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
    <div class="flex items-center">
      <SvgIcon icon="ph:user-circle" class="mr-5px text-icon-large" />
      <span class="text-16px font-medium">{{ authStore.userInfo.userName }}</span>
    </div>
  </ElDropdown>
</template>
