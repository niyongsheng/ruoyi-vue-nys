<template>
  <div class="app-logo">
    <svg width="100%" height="100%" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!-- 圆环：外圆 R512，内圆 R307.2 -->
      <path
        d="M512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024z m0-204.8a307.2 307.2 0 1 0 0-614.4 307.2 307.2 0 0 0 0 614.4z"
        fill="currentColor"
      />
    </svg>
  </div>
</template>

<style scoped>
.app-logo {
  /* 跟随主题色（主色 500 级），换主题色时 logo 同步变化 */
  color: rgb(var(--primary-500-color));
}
</style>
