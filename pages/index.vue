<template>
  <div class="index-container">
    <!-- 公告 -->
    <IndexNotice></IndexNotice>
    <!-- header -->
    <!-- <IndexHeader></IndexHeader> -->
    <div class="container">
      <IndexSidebar></IndexSidebar>
      <IndexDefault :options="options"></IndexDefault>
      <IndexWapDefault :options="options"></IndexWapDefault>
    </div>
  </div>

  <IndexFooter></IndexFooter>
</template>

<script setup>
import axios from 'axios'

// 配置项
const options = ref({})

const getData = async () => {
  const { data: res } = await axios.get('Options')
  options.value = res.data
}

await getData()

useHead({
  title: options.value.title + ' - ' + options.value.subheading,
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
  charset: "utf-8",
  meta: [
    { description: options.value.description },
    { keywords: options.value.keywords }
  ]
})
</script>

<style lang="less" scoped>
.index-container {
  width: 100%;
  height: 100%;
  margin-bottom: 60px;
  .container {
    display: flex;
    overflow-x: hidden;
    width: 100%;
    height: 100%;
  }
}
</style>