<script setup>
const { $myFetch } = useNuxtApp()

import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const token = useTokenCookie()

const authorization = useState('Authorization')
if (token.value !== '') {
  authorization.value = token.value
}

const options = useState('options')

const {
  data: { value: res },
} = await useAsyncData('Options', () => $myFetch('Options'))

options.value = res.data

useHead({
  link: [
    {
      rel: 'icon',
      type: 'images/png',
      sizes: '56x56',
      href: options.value.ico,
    },
  ],
  // script: [
  //   {
  //     src: 'https://hm.baidu.com/hm.js?277dc1783564930b9da342049f6ddea9',
  //   },
  // ],
  style: [
    {
      children: options.value.css,
    },
  ],
})

// 自定义css、js
</script>

<template>
  <el-config-provider :locale="zhCn">
    <NuxtLayout>
      <NuxtPage :options="options"></NuxtPage>
    </NuxtLayout>
  </el-config-provider>
  <el-backtop :right="100" :bottom="100" />
</template>

<style>
/* 全局消息提示样式 */
.el-message,
.el-overlay {
  z-index: 999999999999999999999999 !important;
}

.el-popper {
  z-index: 9999999999999999999999999 !important;
}
</style>
