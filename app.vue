<template>
  <el-config-provider :locale="zhCn">
    <NuxtPage></NuxtPage>
  </el-config-provider>
  <el-backtop :right="100" :bottom="100" />
</template>

<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// 添加全局配置，设置中文
const locale = ref(zhCn)

const token = useCookie('token')

const authorization = useState('Authorization')
if (token.value !== '') {
  authorization.value = token.value
}

useHead({
  link: [
    { rel: 'icon', type: 'images/png', sizes: '56x56', href: '/favicon.ico' },
  ],
  script: [
    {
      src: 'https://hm.baidu.com/hm.js?277dc1783564930b9da342049f6ddea9',
    },
  ],
})
</script>
