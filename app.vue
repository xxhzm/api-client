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
    // {
    //   src: 'https://hm.baidu.com/hm.js?277dc1783564930b9da342049f6ddea9',
    // },
    // {
    //   innerHTML: `(function(c,l,a,r,i,t,y){
    //     c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    //     t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    //     y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    //   })(window, document, "clarity", "script", "r4z11oqarg");`,
    // },
  ],
})
</script>

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
