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
  script: options.value.js
    ? [
        {
          innerHTML: options.value.js,
        },
      ]
    : [],
  style: [
    {
      children: options.value.css,
    },
  ],
})
</script>

<template>
  <el-config-provider :locale="zhCn" :z-index="3000">
    <NuxtLayout>
      <NuxtPage :options="options"></NuxtPage>
    </NuxtLayout>
  </el-config-provider>
  <el-backtop :right="100" :bottom="100" />
</template>
