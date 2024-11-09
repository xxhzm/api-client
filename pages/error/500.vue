<template>
  <div class="error">
    <img src="@/assets/images/500.svg" />
    <h1>抱歉，服务器出错了</h1>
    <el-button
      type="primary"
      plain
      style="margin-top: 20px"
      @click="navigateTo('/')"
      >回到首页</el-button
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
  h1 {
    color: #6b7280;
    font-size: 18px;
    font-weight: normal;
  }
}
</style>
