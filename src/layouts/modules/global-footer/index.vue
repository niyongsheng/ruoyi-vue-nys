<script setup lang="ts">
defineOptions({
  name: 'GlobalFooter'
});
</script>

<template>
  <DarkModeContainer class="h-full flex-center">
    <span>{{ $t('system.copyright') }}</span>
  </DarkModeContainer>
</template>
