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
  padding: 0;
}
</style>
