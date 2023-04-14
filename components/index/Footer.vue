<template>
  <div class="footer-container">
    <van-tabbar v-model="active">
      <van-tabbar-item name="home" icon="home-o" @click="navigateTo('/')"
        >首页</van-tabbar-item
      >
      <van-tabbar-item icon="search" @click="show = true"
        >API列表</van-tabbar-item
      >
      <van-tabbar-item icon="friends-o" @click="navigateTo('/links')"
        >友情链接</van-tabbar-item
      >

      <van-tabbar-item
        name="setting"
        icon="setting-o"
        @click="navigateTo('/login')"
        >后台</van-tabbar-item
      >
      <van-tabbar-item name="qq" icon="more-o" @click="qq"
        >加入群聊</van-tabbar-item
      >
      <van-action-sheet
        v-model:show="show"
        :actions="actions"
        cancel-text="取消"
        close-on-click-action
        @select="onSelect"
        @open="onOpen"
      />
    </van-tabbar>
  </div>
</template>

<script setup>
import axios from 'axios'

const active = ref(0)

const show = ref(false)

const request = ref(false)
const actions = ref([{ name: '加载选项', loading: true }])

const onOpen = async () => {
  if (request.value === false) {
    const { data: res } = await axios.get('api/list')
    actions.value = res.data
    request.value = true
  }
}

const onSelect = (item) => {
  navigateTo('/doc/' + item.alias)
}

const qq = () => {
  window.open('https://jq.qq.com/?_wv=1027&k=92BF8Ndr', '_blank')
}
</script>

<style lang="less" scoped>
.footer-container {
  display: none;
}

@media screen and (max-width: 750px) {
  .footer-container {
    display: block;
  }
}
</style>
