<template>
  <div class="index-container">
    <!-- 公告 -->
    <IndexNotice></IndexNotice>
    <!-- header -->
    <!-- <IndexHeader></IndexHeader> -->
    <div class="container">
      <IndexSidebar></IndexSidebar>
      <IndexApiInfo :apiInfo="apiInfo.value"></IndexApiInfo>
    </div>

    <IndexFooter></IndexFooter>
  </div>
</template>

<script setup>
import axios from 'axios'

const route = useRoute()

const apiInfo = reactive({})
const options = reactive({})

const GetData = async () => {
  const { data: res } = await axios.get('api', {
    params: {
      type: 'apiAlias',
      alias: route.params.alias
    }
  })

  apiInfo.value = res.data[0]

  const { data: res1 } = await axios.get('Options')
  options.value = res1.data
}

await GetData()

useHead({
  title: apiInfo.value.name + ' - ' + options.value.title + ' - ' + options.value.subheading,
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
  charset: "utf-8",
  meta: [
    { description: apiInfo.value.description },
    { keywords: apiInfo.value.keywords }
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
    width: 100%;
    height: 100%;
  }
}
</style>