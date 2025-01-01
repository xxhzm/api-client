<template>
  <div class="links-container">
    <IndexNotice></IndexNotice>
    <div class="container">
      <div class="section">
        <h2 class="section-title">友情链接</h2>
        <div class="link-grid">
          <div class="link-card" v-for="item in links" :key="item.id">
            <a :href="item.url + '?ref=xxapi.cn'" target="_blank">
              <div class="link-card__image-wrapper">
                <img 
                  :src="item.image" 
                  :alt="item.name" 
                  class="link-card__image"
                  @error="handleImageError"
                />
              </div>
              <div class="link-card__content">
                <h3 class="link-card__title">{{ item.name }}</h3>
                <p class="link-card__desc">{{ item.description }}</p>
              </div>
            </a>
          </div>
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

// 图片加载失败时的处理
const handleImageError = (e) => {
  e.target.src = '/default-avatar.png' // 设置一个默认图片
}
</script>

<style lang="less" scoped>
.links-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f7f9fe, #ffffff);
  
  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 0;
  }

  .section-title {
    position: relative;
    color: #1f2f3d;
    font-size: 16px;
    font-weight: normal;
    margin: 0 0 20px 0;
    padding-left: 12px;
    line-height: 1.4;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 16px;
      background: #409eff;
      border-radius: 3px;
    }
  }

  .link-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .link-card {
    background: #fff;
    border-radius: 8px;
    transition: all 0.3s ease;
    border: 1px solid #ebeef5;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #dcdfe6;
    }

    a {
      display: flex;
      align-items: center;
      padding: 16px;
      text-decoration: none;
    }

    &__image-wrapper {
      flex: none;  // 防止图片容器被压缩
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: #f5f7fa;  // 添加背景色作为占位
      overflow: hidden;
    }

    &__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }

    &__content {
      flex: 1;  // 让内容区域占据剩余空间
      min-width: 0;  // 防止文字溢出
      margin-left: 16px;
      overflow: hidden;
    }

    &__title {
      font-size: 15px;
      font-weight: 500;
      color: #303133;
      margin: 0 0 4px 0;
    }

    &__desc {
      font-size: 13px;
      color: #909399;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.5;
    }
  }
}

@media screen and (max-width: 768px) {
  .links-container {
    .container {
      width: 95%;
    }

    .section-title {
      font-size: 15px;
      margin-bottom: 16px;

      &::before {
        height: 14px;
      }
    }

    .link-grid {
      gap: 12px;
    }

    .link-card {
      a {
        padding: 12px;
      }

      &__image-wrapper {
        width: 40px;
        height: 40px;
      }

      &__content {
        margin-left: 12px;
      }

      &__title {
        font-size: 14px;
      }

      &__desc {
        font-size: 12px;
      }
    }
  }
}
</style>
