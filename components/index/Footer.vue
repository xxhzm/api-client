<template>
  <div class="footer-container">
    <div class="footer">
      <p style="text-align: center">
        <span
          ><a href="https://beian.miit.gov.cn/">{{
            props.options.icp
          }}</a> </span
        ><span>{{ props.options.gongan }}</span>
      </p>
    </div>
    <van-tabbar v-model="active">
      <van-tabbar-item name="home" icon="home-o" @click="navigateTo('/')"
        >首页</van-tabbar-item
      >
      <van-tabbar-item icon="friends-o" @click="navigateTo('/links')"
        >友情链接</van-tabbar-item
      >
      <van-tabbar-item icon="info-o" @click="navigateTo('/about')"
        >关于我们</van-tabbar-item
      >
      <van-tabbar-item
        name="setting"
        icon="setting-o"
        @click="navigateTo('/login')"
        >登录</van-tabbar-item
      >
      <van-tabbar-item name="qq" icon="more-o" @click="qq"
        >加入群聊</van-tabbar-item
      >
    </van-tabbar>
  </div>
</template>

<script setup>
const active = ref(0)

const qq = () => {
  window.open('https://jq.qq.com/?_wv=1027&k=92BF8Ndr', '_blank')
}

const props = defineProps(['options'])
</script>

<style lang="less">
.footer{
  padding-bottom: 50px;
  margin-bottom: 20px;
}
</style>