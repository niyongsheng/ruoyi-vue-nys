<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({ name: 'GithubLink' });

/** 项目源码地址（对应 nys_fast_admin 顶栏的「源码地址」入口） */
const GITHUB_URL = 'https://github.com/niyongsheng/ruoyi-vue-nys';

function gotoGithub() {
  window.open(GITHUB_URL, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <ButtonIcon :tooltip-content="$t('icon.github')" @click="gotoGithub">
    <SvgIcon local-icon="github" class="text-icon" />
  </ButtonIcon>
</template>
