<template>
  <NuxtPage></NuxtPage>
  <el-backtop :right="100" :bottom="100" />
</template>

<script setup>
const token = useCookie('token')

const authorization = useState('Authorization')
if (token.value !== '') {
  authorization.value = token.value
}

useHead({
  meta: [{ name: 'baidu-site-verification', content: 'codeva-hVOy3sFFbL' }],
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
