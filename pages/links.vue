<template>
  <div class="links-container">
    <!-- 公告 -->
    <IndexNotice></IndexNotice>
    <div class="container">
      <h1 style="color: #1f2d3d; font-size: 24px">友情链接</h1>
      <div class="link-cont">
        <div class="link-box" v-for="item in links" :key="item.id">
          <a :href="item.url + '?ref=xxapi.cn'" target="_blank">
            <img :src="item.image" :alt="item.name" />
            <div>
              <p>{{ item.name }}</p>
              <span>{{ item.description }}</span>
            </div>
          </a>
        </div>
      </div>
    </div>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<script setup>
const { $myFetch } = useNuxtApp()

const links = ref()
const {
  data: { value: res },
} = await useAsyncData('LinkList', () => $myFetch('LinkList'))

links.value = res.data

// 配置项
const options = ref({})

const {
  data: { value: res1 },
} = await useAsyncData('Options', () => $myFetch('Options'))

options.value = res1.data

useHead({
  title: '友情链接' + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [{ name: 'description', content: '小小API-友情链接' }],
})
</script>

<style lang="less" scoped>
.links-container {
  width: 100%;
  min-height: 100vh;
  background: #f7f9fe;
  .container {
    width: 80%;
    margin: 0 auto;
    .link-cont {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .link-box {
      overflow: hidden;
      width: 260px;
      height: 80px;
      padding: 10px;
      border-radius: 15px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.5s;
      margin-bottom: 30px;
      margin-left: 12px;
      a {
        width: 100%;
        display: flex;
        color: #555;
        img {
          width: 60px;
          height: 60px;
          border-radius: 15px;
        }
        div {
          margin-left: 20px;
          padding-right: 20px;
          p {
            font-size: 18px;
            color: #555;
            margin-bottom: 5px;
          }
          span {
            overflow: hidden;
            font-size: 12px;
            color: #777;
            line-height: 20px;
          }
        }
      }
    }

    .link-box:hover {
      transform: translateY(-5px);
    }
  }
}

@media screen and (max-width: 650px) {
  .links-container {
    .container {
      height: 100%;
      h1 {
        margin-bottom: 15px;
      }

      .link-cont {
        justify-content: center;
        .link-box {
          width: 100%;
        }
      }
    }
  }
}
</style>
