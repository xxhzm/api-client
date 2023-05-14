<template>
  <div class="error">
    <img src="@/assets/images/403.svg" />
    <p>抱歉，您无权访问该页面</p>
    <el-button
      type="primary"
      plain
      style="margin-top: 20px"
      @click="navigateTo('/login')"
      >前往登录</el-button
    >
  </div>
</template>

<style lang="less">
.error {
  width: 100%;
  height: 100%;
  text-align: center;
  padding-top: 10%;
  img {
    width: 350px;
    height: 200px;
  }
  p {
    color: #6b7280;
    font-size: 18px;
  }
}
</style>