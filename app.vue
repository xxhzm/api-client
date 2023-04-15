<template>
  <NuxtPage></NuxtPage>
  <el-backtop :right="100" :bottom="100" />
</template>

<script setup>
import axios from 'axios'
import { ElNotification } from 'element-plus'

// axios初始化
const { $axiosDefault } = useNuxtApp()
$axiosDefault()

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