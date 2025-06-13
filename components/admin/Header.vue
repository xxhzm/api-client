<script setup>
const { $logout } = useNuxtApp()

const username = useCookie('username')

const handleSelect = (key) => {
  // 更改密码
  if (key === '0-1') {
    navigateTo('/admin/password')
  }

  // 退出登录
  if (key === '0-2') {
    $logout()
  }
}
</script>

<template>
  <div class="header-container">
    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >
      <ClientOnly>
        <el-sub-menu index="1" style="position: absolute; right: 40px">
          <template #title>{{ username }}</template>
          <el-menu-item @click="navigateTo('/')">首页</el-menu-item>
          <el-menu-item index="0-1">更改密码</el-menu-item>
          <el-menu-item index="0-2">退出登录</el-menu-item>
        </el-sub-menu>
      </ClientOnly>
    </el-menu>
  </div>
</template>

<style lang="less" scoped>
.flex-grow {
  flex-grow: 0.95;
}

.header-container {
  height: 60px;
}
</style>
