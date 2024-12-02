<template>
  <div class="about-container">
    <!-- 公告 -->
    <IndexNotice></IndexNotice>
    <div class="container">
      <h1
        style="color: #1f2d3d; font-size: 18px; text-align: center"
        class="title"
      >
        {{ info.title }}
      </h1>
      <div class="content" v-html="info.content"></div>
    </div>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<script setup>
const { $myFetch } = useNuxtApp()
const route = useRoute()
const info = ref({})

const {
  data: { value: res },
} = await useAsyncData('ArticleIdForFrontend', () =>
  $myFetch('ArticleIdForFrontend', {
    query: {
      id: route.params.id,
    },
  })
)

if (res.code !== 200) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
  })
}

info.value = res.data

// 配置项
const options = ref({})

const {
  data: { value: res1 },
} = await useAsyncData('Options', () => $myFetch('Options'))

options.value = res1.data

useHead({
  title: info.value.title + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    { name: 'description', content: info.value.description },
    { name: 'keywords', content: info.value.keywords },
  ],
})
</script>

<style lang="less">
.about-container {
  width: 100%;
  min-height: 100vh;
  background: #f7f9fe;
  .container {
    width: 80%;
    height: 100%;
    margin: 0 auto;
    .content {
      color: #777;
      margin-top: 30px;
      p {
        font-size: 14px;
        margin-bottom: 15px;
        line-height: 18px;
      }
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin-bottom: 5px;
      }
    }
    a {
      color: #9999ff;
    }
  }
}
</style>
