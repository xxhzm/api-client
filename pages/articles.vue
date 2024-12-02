<template>
  <div class="article-container">
    <!-- 公告 -->
    <IndexNotice></IndexNotice>
    <div class="container">
      <el-row :gutter="12">
        <el-col
          :xs="24"
          :sm="12"
          :md="12"
          :lg="12"
          :xl="12"
          v-for="item in list"
          :key="item.id"
          ><nuxt-link :to="'/article/' + item.id" class="item">
            <div class="article_box">
              <div class="article_author">{{ item.author }}</div>
              <h2>{{ item.title }}</h2>
              <span>{{ item.description }}</span>
            </div>
          </nuxt-link>
        </el-col>
      </el-row>
    </div>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<script setup>
const { $myFetch } = useNuxtApp()

const list = ref()

const {
  data: { value: res },
} = await useAsyncData('ArticleListForFrontend', () =>
  $myFetch('ArticleListForFrontend')
)
list.value = res.data

// 配置项
const options = ref({})

const {
  data: { value: res1 },
} = await useAsyncData('Options', () => $myFetch('Options'))

options.value = res1.data

useHead({
  title: '文章' + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [{ name: 'description', content: '小小API-关于我们' }],
})
</script>

<style lang="less" scoped>
.article-container {
  width: 100%;
  min-height: 100vh;
  background: #f7f9fe;
  .container {
    width: 80%;
    height: 100%;
    margin: 50px auto;
    .item {
      width: 100%;
      display: flex;
      color: #555;
      text-decoration: none;
      .article_author {
        position: absolute;
        right: 0;
        top: 0;
        width: 90px;
        height: 25px;
        padding-top: 2px;
        padding-left: 15px;
        background: #faecd8;
        color: #e6a23c;
        border-radius: 0 0 0 12px;
        font-size: 13px;
      }
      .article_box {
        overflow: hidden;
        position: relative;
        width: 100%;
        height: 100px;
        padding-top: 15px;
        margin-bottom: 20px;
        border-radius: 15px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        background: #fff;
        transition: all 0.3s;
        h2 {
          color: #555;
          font-size: 18px;
          font-weight: bold;
          margin-left: 20px;
          padding-right: 100px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        span {
          position: absolute;
          bottom: 10px;
          margin-left: 20px;
          padding-right: 15px;
          overflow: hidden;
          font-size: 13px;
          color: #777;
          line-height: 15px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
  a:hover {
    .article_box {
      transform: translateY(-5px);
    }
  }
}
</style>
