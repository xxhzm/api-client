<template>
  <div class="ad">
    <el-row :gutter="12">
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <a href="https://www.amuyun.cn/">
          <img
            src="https://cdn.xxhzm.cn/adpic/20231015203646.gif"
            class="adPic" /></a
      ></el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <a href="https://www.kdun.cn/"
          ><img src="https://cdn.xxhzm.cn/adpic/KDun-2.gif" class="adPic" /></a
      ></el-col>
    </el-row>
    <el-row :gutter="12">
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <a href="http://app.otioi.cn/">
          <img
            src="@/assets/images/F0EC3BF20996C6CBB6FBC17FF02FD94A.jpg"
            class="adPic" /></a
      ></el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <a href="#">
          <img
            src="@/assets/images/banner.jpg"
            class="adPic" /></a
      ></el-col>
    </el-row>
  </div>
</template>

<style lang="less">
.ad {
  overflow: hidden;
  width: 100%;
}

.adPic {
  width: 100%;
  height: 60px;
}
</style>
