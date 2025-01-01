<template>
  <div class="article-container">
    <IndexNotice></IndexNotice>
    <div class="container">
      <div class="article-card">
        <div class="article-header">
          <div class="title-section">
            <h1 class="article-title">{{ info.title }}</h1>
          </div>
          <div class="meta-section">
            <div class="meta-left">
              <span class="meta-item">
                <i class="el-icon-user"></i>
                {{ info.author }}
              </span>
              <span class="meta-item">
                <i class="el-icon-date"></i>
                {{ info.created_at }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="article-divider"></div>
        
        <div class="article-content">
          <div class="content-wrapper" v-html="info.content"></div>
        </div>

        <div class="article-divider"></div>

        <div class="article-footer">
          <div class="keywords" v-if="info.keywords">
            <span class="keyword-label">
              <i class="el-icon-collection-tag"></i>
              关键词：
            </span>
            <span 
              v-for="keyword in info.keywords.split(',')" 
              :key="keyword" 
              class="keyword-tag"
            >
              {{ keyword.trim() }}
            </span>
          </div>
        </div>
      </div>
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

<style lang="less" scoped>
.article-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f7f9fe, #ffffff);

  .container {
    width: 90%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 0;
  }

  .article-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    border: 1px solid #ebeef5;
  }

  .article-header {
    padding: 32px 40px;

    .title-section {
      margin-bottom: 20px;

      .article-title {
        font-size: 32px;
        font-weight: 600;
        color: #1f2f3d;
        margin: 0;
        line-height: 1.4;
        letter-spacing: 0.5px;
      }
    }

    .meta-section {
      display: flex;
      align-items: center;

      .meta-left {
        display: flex;
        align-items: center;
        gap: 24px;

        .meta-item {
          display: flex;
          align-items: center;
          color: #909399;
          font-size: 14px;

          i {
            margin-right: 8px;
            font-size: 16px;
          }
        }
      }
    }
  }

  .article-divider {
    height: 1px;
    background: #ebeef5;
    margin: 0 40px;
  }

  .article-content {
    padding: 32px 40px;
    
    .content-wrapper {
      :deep(h1) {
        font-size: 24px;
        font-weight: 500;
        color: #1f2f3d;
        margin: 32px 0 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #ebeef5;
      }

      :deep(h2) {
        font-size: 20px;
        font-weight: 500;
        color: #2c3e50;
        margin: 28px 0 20px;
      }

      :deep(h3) {
        font-size: 18px;
        font-weight: 500;
        color: #2c3e50;
        margin: 24px 0 16px;
      }

      :deep(p) {
        font-size: 15px;
        line-height: 1.8;
        color: #3f536e;
        margin: 16px 0;
        letter-spacing: 0.2px;
      }

      :deep(ul), :deep(ol) {
        padding-left: 24px;
        margin: 16px 0;

        li {
          font-size: 15px;
          line-height: 1.8;
          color: #3f536e;
          margin-bottom: 8px;
        }
      }

      :deep(code) {
        background: #f5f7fa;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
        font-size: 14px;
        color: #476582;
      }

      :deep(pre) {
        background: #282c34;
        padding: 20px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 20px 0;

        code {
          background: none;
          color: #abb2bf;
          padding: 0;
        }
      }

      :deep(blockquote) {
        margin: 20px 0;
        padding: 16px 24px;
        color: #454d64;
        border-left: 4px solid #409eff;
        background: #ecf5ff;
        border-radius: 0 4px 4px 0;
      }

      :deep(img) {
        max-width: 100%;
        border-radius: 8px;
        margin: 24px 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      :deep(a) {
        color: #409eff;
        text-decoration: none;
        transition: color 0.3s;
        border-bottom: 1px solid transparent;

        &:hover {
          color: #66b1ff;
          border-bottom-color: #66b1ff;
        }
      }
    }
  }

  .article-footer {
    padding: 32px 40px;

    .keywords {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;

      .keyword-label {
        color: #606266;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;

        i {
          margin-right: 6px;
          font-size: 16px;
          color: #409eff;
        }
      }

      .keyword-tag {
        padding: 6px 16px;
        background: #f5f7fa;
        color: #606266;
        border-radius: 20px;
        font-size: 13px;
        transition: all 0.3s ease;
        border: 1px solid #ebeef5;
        cursor: pointer;

        &:hover {
          background: #ecf5ff;
          color: #409eff;
          border-color: #409eff;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .article-container {
    .container {
      width: 95%;
      padding: 20px 0;
    }

    .article-header {
      padding: 24px 20px;

      .title-section {
        margin-bottom: 16px;

        .article-title {
          font-size: 24px;
        }
      }

      .meta-section {
        .meta-left {
          gap: 16px;
          
          .meta-item {
            font-size: 13px;
          }
        }
      }
    }

    .article-divider {
      margin: 0 20px;
    }

    .article-content {
      padding: 20px;
    }

    .article-footer {
      padding: 20px;
    }

    .article-header {
      .title-section {
        margin-bottom: 20px;
        padding-bottom: 20px;

        .article-title {
          font-size: 24px;
          margin-bottom: 12px;
        }

        .article-desc {
          font-size: 14px;
        }
      }

      .meta-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        .meta-left {
          gap: 16px;
          
          .meta-item {
            font-size: 13px;
          }
        }

        .category-tag {
          padding: 4px 12px;
          font-size: 12px;
        }
      }
    }

    .article-content {
      .content-wrapper {
        padding: 24px;
      }
    }

    .article-footer {
      padding: 20px;

      .keywords {
        gap: 8px;

        .keyword-tag {
          padding: 4px 12px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
