<template>
  <div class="article-container">
    <IndexNotice></IndexNotice>
    <div class="container">
      <div class="section">
        <h2 class="section-title">企业新闻</h2>
        <div class="article-grid">
          <nuxt-link v-for="item in list" :key="item.id" :to="'/article/' + item.id" class="article-card">
            <div class="article-content">
              <div class="article-meta">
                <span class="article-author">
                  <el-icon>
                    <User />
                  </el-icon>
                  {{ item.author }}
                </span>
              </div>
              <h3 class="article-title">{{ item.title }}</h3>
              <p class="article-desc">{{ item.description }}</p>
              <div class="article-footer">
                <span class="read-more">
                  阅读全文
                  <el-icon>
                    <Right />
                  </el-icon>
                </span>
              </div>
            </div>
          </nuxt-link>
        </div>
      </div>
    </div>
    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<script setup>
import { User, Timer, Right } from '@element-plus/icons-vue'

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
    margin: 0 0 24px 0;
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

  .article-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 24px;
  }

  .article-card {
    display: block;
    text-decoration: none;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    border: 1px solid #ebeef5;
    min-height: 200px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #dcdfe6;

      .read-more {
        color: #409eff;

        i {
          transform: translateX(4px);
        }
      }
    }

    .article-content {
      padding: 24px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .article-meta {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      font-size: 13px;
      color: #909399;

      .article-author {
        display: inline-flex;
        align-items: center;

        i {
          margin-right: 6px;
          font-size: 14px;
        }
      }

      .article-author {
        margin-right: 20px;
      }
    }

    .article-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin: 0 0 12px 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
    }

    .article-desc {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      margin: 0 0 16px 0;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      flex: none;
    }

    .article-footer {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid #f0f2f5;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .read-more {
        display: inline-flex;
        align-items: center;
        font-size: 13px;
        color: #909399;
        transition: all 0.3s ease;

        i {
          margin-left: 6px;
          font-size: 12px;
          transition: transform 0.3s ease;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .article-container {
    .container {
      width: 95%;
      padding: 16px 0;
    }

    .article-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .article-card {
      min-height: 180px;

      .article-content {
        padding: 16px;
      }

      .article-meta {
        margin-bottom: 12px;
      }

      .article-title {
        font-size: 15px;
        margin-bottom: 8px;
      }

      .article-desc {
        font-size: 13px;
        -webkit-line-clamp: 2;
        margin-bottom: 12px;
      }

      .article-footer {
        padding-top: 12px;
      }
    }
  }
}
</style>
