<template>
  <!-- <ClientOnly> -->
  <div class="header-container">
    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >
      <el-menu-item index="0"
        ><img src="https://cdn.xxhzm.cn/img/title.png" alt="logo" class="logo"
      /></el-menu-item>
      <div class="flex-grow" />
      <ClientOnly>
        <el-sub-menu index="1">
          <template #title>{{ username }}</template>
          <el-menu-item @click="navigateTo('/')">首页</el-menu-item>
          <el-menu-item index="0-1">更改密码</el-menu-item>
          <el-menu-item index="0-2">退出登录</el-menu-item>
        </el-sub-menu>
      </ClientOnly>
    </el-menu>
  </div>
</template>

<script setup>
const username = useCookie('username')
const token = useCookie('token')

const handleSelect = (key) => {
  // 更改密码
  if (key === '0-1') {
    navigateTo('/admin/password')
  }

  // 退出登录
  if (key === '0-2') {
    username.value = undefined
    token.value = undefined

    navigateTo('/login')
  }

}
</script>

<style lang="less" scoped>
.flex-grow {
  flex-grow: 0.95;
}

.header-container {
  .logo {
    margin-left: 15px;
    margin-right: 15px;
    width: 180px;
    height: 60px;
  }
}
</style>