<script setup>
const props = defineProps({
  error: Object,
})

// 获取运行环境
const runtimeConfig = useRuntimeConfig()
const isDev = process.dev // Nuxt 3 提供的环境变量

// 只在生产环境中进行错误重定向
if (!isDev) {
  if (props.error.statusCode === 404) {
    clearError({ redirect: '/error/404' })
  } else if (props.error.statusCode === 403) {
    clearError({ redirect: '/error/403' })
  } else {
    clearError({ redirect: '/error/500' })
  }
}
</script>

<template>
  <!-- 开发环境下显示详细错误信息 -->
  <div v-if="isDev" class="dev-error">
    <h1>错误信息 (仅开发环境可见)</h1>
    <pre>{{ error }}</pre>
  </div>
  <!-- 生产环境下显示加载中，因为会被重定向 -->
  <div v-else>
    加载中...
  </div>
</template>

<style scoped>
.dev-error {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.dev-error pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
