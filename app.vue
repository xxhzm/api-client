<template>
  <NuxtPage></NuxtPage>
  <el-backtop :right="100" :bottom="100" />
</template>

<script setup>
import axios from 'axios'
import { ElNotification } from 'element-plus'

const username = useCookie('username')
const token = useCookie('token')
const grade = useCookie('grade')

// axios初始化
const { $axiosDefault } = useNuxtApp()
$axiosDefault()

axios.interceptors.request.use(
  (config) => {
    if (token.value !== '' && config.url !== 'Token') {
      config.headers.Authorization = token.value
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(response => {
  if (response.data?.code === -3) {
    // delete username and token
    username.value = undefined
    token.value = undefined
    grade.value = undefined

    navigateTo('/login')
  }
  return response
})

useHead({
  meta: [
    { name: 'baidu-site-verification', content: 'codeva-hVOy3sFFbL' },
  ],
  // script: [
  //   {
  //     src: 'https://hm.baidu.com/hm.js?63349d1ce979779b58d4fbcfb881cc41',
  //   }
  // ],
})
</script>