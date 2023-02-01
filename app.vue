<template>
  <NuxtPage></NuxtPage>
</template>

<script setup>
import axios from 'axios'
import { ElNotification } from 'element-plus'

axios.defaults.baseURL = 'https://www.api-m.com/'

// 响应拦截器
axios.interceptors.response.use(response => {
  const { data: res } = response
  if (res.code === '-5' || res.code === '-6') {
    ElNotification({
      type: 'error',
      message: res.msg
    })

    const username = useCookie('username')
    const token = useCookie('token')
    const grade = useCookie('grade')

    username.value = undefined
    token.value = undefined
    grade.value = undefined

    navigateTo('/login')
    return false
  }

  if (res.code === '-3') {
    ElNotification({
      type: 'error',
      message: res.msg
    })

    return false
  }
  return response
})

const show = ref(true)

onMounted(() => {
  if (document.body.clientWidth < 1100) {
    alert('为了更好的体验，请您使用电脑端访问本网站')
  }
})

useHead({
  meta: [
    { name: 'baidu-site-verification', content: 'codeva-hVOy3sFFbL' },
  ],
  script: [
    {
      src: 'https://hm.baidu.com/hm.js?63349d1ce979779b58d4fbcfb881cc41',
    }
  ],
})
</script>