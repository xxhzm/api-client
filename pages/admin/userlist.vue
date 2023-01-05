<template>
  <AdminHeader></AdminHeader>
  <div style="display: flex">
    <AdminSidebar></AdminSidebar>
    <div class="password-container">用户列表</div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["admin"],
})
</script>

<style scoped>
</style>