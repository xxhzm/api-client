<template>
  <NuxtPage></NuxtPage>
  <el-backtop :right="100" :bottom="100" />
</template>

<script setup>
const token = useCookie('token')

const authorization = useState('Authorization')
if(token.value !== ''){
  authorization.value = token.value
}

// axios.interceptors.response.use((response) => {
//   if (response.data?.code === -3) {
//     $msg(response.data?.msg, 'error')
//     navigateTo('/error/403')
//   }

//   if (response.data?.code === -2) {
//     $msg(response.data?.msg, 'error')
//   }

//   if (response.config.method === 'post') {
//     if (response.data?.code === 200) {
//       $msg(response.data?.msg, 'success')
//     }
//   }
//   return response
// })

useHead({
  meta: [{ name: 'baidu-site-verification', content: 'codeva-hVOy3sFFbL' }],
  link: [
    { rel: 'icon', type: 'images/png', sizes: '56x56', href: '/favicon.ico' },
  ],
  script: [
    // {
    //   src: 'https://hm.baidu.com/hm.js?39cb8b3fa5f089e47f8069895a32b9f3',
    // }
  ],
})
</script>
