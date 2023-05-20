<template>
  <NuxtPage></NuxtPage>
  <el-backtop :right="100" :bottom="100" />
</template>

<script setup>
import axios from 'axios'

const { $msg } = useNuxtApp()

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

    navigateTo('/error/403')
  }

  if (response.data?.code === -2) {
    $msg(response.data?.msg, 'error')
  }

  if (response.config.method === 'post') {
    if (response.data?.code === 200) {
      $msg(response.data?.msg, 'success')
    }
  }
  return response
})

useHead({
  meta: [
    { name: 'baidu-site-verification', content: 'codeva-hVOy3sFFbL' },
  ],
  // script: [
  //   {
  //     src: 'https://hm.baidu.com/hm.js?39cb8b3fa5f089e47f8069895a32b9f3',
  //   }
  // ],
})
</script>