<template>
  <div class="index-container">
    <!-- 公告 -->
    <IndexNotice></IndexNotice>
    <div class="container">
      <h1 style="color: #1f2d3d; font-size: 24px">广告商</h1>
      <Ad style="margin-bottom: 2rem"></Ad>

      <h1 style="color: #1f2d3d; font-size: 24px">系统信息</h1>
      <SystemInfo style="margin-bottom: 2rem"></SystemInfo>

      <h1 style="color: #1f2d3d; font-size: 24px">API搜索</h1>
      <IndexApiSearch style="margin-bottom: 2rem"></IndexApiSearch>

      <h1 style="color: #1f2d3d; font-size: 24px">API列表</h1>
      <IndexApiList></IndexApiList>
    </div>
    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<script setup>
const { $myFetch } = useNuxtApp()

// 配置项
const options = ref({})

const {
  data: { value: res },
} = await useAsyncData('Options', () => $myFetch('Options'))

options.value = res.data

useHead({
  title: options.value.title + ' - ' + options.value.subheading,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    { description: options.value.description },
    { keywords: options.value.keywords },
  ],
})
</script>

<style lang="less" scoped>
@import '@/assets/css/1.less';

.index-container {
  width: 100%;
  height: 100%;
  background: #f7f9fe;
  .container {
    width: 80%;
    height: 100%;
    margin: 0 auto;
  }
}
</style>
