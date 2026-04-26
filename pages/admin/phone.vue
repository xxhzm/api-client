<script setup>
definePageMeta({
  layout: 'admin',
})

useHead({
  title: '手机号管理',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="phone-page">
    <AdminPhoneBindForm />
  </div>
</template>

<style lang="less" scoped>
.phone-page {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;
}

@media screen and (max-width: 768px) {
  .phone-page {
    padding: 12px;
  }
}
</style>
