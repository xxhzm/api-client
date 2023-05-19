<template>
  <div class="index-container">
    <!-- 公告 -->
    <IndexNotice></IndexNotice>
    <!-- header -->
    <!-- <IndexHeader></IndexHeader> -->
    <div class="container">
      <IndexSidebar :list="list"></IndexSidebar>
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
const list = ref({})


const GetData = async () => {
  const { data: res } = await axios.get('Api', {
    params: {
      alias: route.params.alias
    }
  })

  // 判断参数是否必传
  res.data.params = res.data.params.map(item => {
    return {
      id: item.id,
      aid: item.aid,
      name: item.name,
      param: item.param,
      position: item.position,
      docs: item.docs,
      required: item.required === 1 ? '必传' : '可选'
    }
  })
  apiInfo.value = res.data

  const { data: res1 } = await axios.get('Options')
  options.value = res1.data

  const { data: res2 } = await axios.get('List')
  list.value = res2.data
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