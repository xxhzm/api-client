<script setup>
import { CollectionTag } from '@element-plus/icons-vue'

const { $myFetch } = useNuxtApp()
const route = useRoute()

const info = ref({})
const options = useState('options')

const fetchArticle = (id) => {
  return $myFetch('ArticleIdForFrontend', {
    query: {
      id,
    },
  })
}

const { data } = await useAsyncData(
  `ArticleIdForFrontend-${route.params.id}`,
  () => fetchArticle(route.params.id)
)

if (data.value?.code === 200) {
  info.value = data.value.data
} else {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
  })
}

const latestList = computed(() => {
  return info.value.random_list || []
})

useHead({
  title: computed(
    () =>
      (info.value.title ? `${info.value.title} - ` : '') + options.value.title
  ),
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    { name: 'description', content: computed(() => info.value.description) },
    { name: 'keywords', content: computed(() => info.value.keywords) },
  ],
  style: [
    {
      children: computed(() => options.value.css),
    },
  ],
})

const getCategory = (type) => {
  const categories = {
    1: { name: '公共通知', type: 'danger' },
    2: { name: '行业资讯', type: 'info' },
    3: { name: '产品动态', type: 'primary' },
    4: { name: '解决方案', type: 'success' },
  }
  return categories[type] || categories[1]
}

const formatDate = (time) => {
  if (!time) return '2023-01-01'
  try {
    const date = new Date(Number(time))
    if (isNaN(date.getTime())) return '2023-01-01'
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (e) {
    return '2023-01-01'
  }
}
</script>

<template>
  <div class="article-container">
    <IndexNavbar></IndexNavbar>
    <IndexBanner
      customTitle="新闻中心"
      customSubtitle="洞察行业趋势，发布企业动态"
      :showActions="false"
      verticalAlign="center"
    />
    <div class="container">
      <div class="breadcrumb-section">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/articles' }"
            >新闻中心</el-breadcrumb-item
          >
          <el-breadcrumb-item>正文</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="main-layout">
        <div class="article-wrapper">
          <div class="article-card">
            <div class="article-header">
              <div class="header-content">
                <el-tag
                  :type="getCategory(info.type).type"
                  effect="dark"
                  size="small"
                  class="category-tag"
                >
                  {{ getCategory(info.type).name }}
                </el-tag>
                <h1 class="article-title">{{ info.title }}</h1>
                <div class="meta-row">
                  <span class="meta-item">
                    <span class="label">发布于</span>
                    {{ formatDate(info.create_time) }}
                  </span>
                  <el-divider direction="vertical" />
                  <span class="meta-item">
                    <span class="label">作者</span>
                    {{ info.author || '官方发布' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="article-content">
              <div class="summary-box" v-if="info.description">
                <p class="summary-title">摘要</p>
                <p class="summary-text">{{ info.description }}</p>
              </div>

              <div class="content-wrapper" v-html="info.content"></div>

              <div class="article-statement">
                <p>
                  <strong>版权声明：</strong>本文内容由{{
                    info.author || '官方'
                  }}发布，版权归原作者所有。
                </p>
                <p>
                  <strong>免责声明：</strong>如涉及版权问题，请联系我们删除。
                </p>
              </div>
            </div>

            <div class="article-footer">
              <div class="keywords" v-if="info.keywords">
                <span class="keyword-label">
                  <el-icon><CollectionTag /></el-icon>
                  标签：
                </span>
                <div class="tags-wrapper">
                  <span
                    v-for="keyword in info.keywords.split(',')"
                    :key="keyword"
                    class="keyword-tag"
                  >
                    # {{ keyword.trim() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="sidebar">
          <div class="sidebar-card">
            <h3 class="sidebar-title">
              <span class="title-text">推荐阅读</span>
              <span class="title-en">RECOMMENDED</span>
            </h3>
            <div class="latest-list">
              <NuxtLink
                v-for="(item, index) in latestList"
                :key="item.id"
                :to="'/article/' + item.id"
                class="latest-item"
              >
                <div class="item-index" :class="{ 'top-3': index < 3 }">
                  {{ index + 1 }}
                </div>
                <div class="item-content">
                  <span class="item-title">{{ item.title }}</span>
                  <span class="item-date">{{
                    formatDate(item.create_time).split('-').slice(1).join('-')
                  }}</span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </aside>
      </div>
    </div>
    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less" scoped>
.article-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;

  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding-bottom: 60px;
    margin-top: -40px;
    position: relative;
    z-index: 10;
  }

  .breadcrumb-section {
    margin-bottom: 20px;

    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        color: rgba(255, 255, 255, 0.8);
        font-weight: 400;

        &.is-link:hover {
          color: #fff;
        }
      }

      &:last-child .el-breadcrumb__inner {
        color: #fff;
        font-weight: 500;
      }
    }
  }

  .main-layout {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }

  .article-wrapper {
    flex: 1;
    min-width: 0;
  }

  .sidebar {
    width: 320px;
    flex-shrink: 0;
    position: sticky;
    top: 80px;
  }

  .sidebar-card {
    background: #fff;
    border-radius: 4px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .sidebar-title {
      margin: 0 0 20px 0;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f2f5;
      position: relative;
      display: flex;
      align-items: baseline;
      gap: 8px;

      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 40px;
        height: 2px;
        background: #409eff;
      }

      .title-text {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .title-en {
        font-size: 12px;
        color: #909399;
        font-weight: 400;
        letter-spacing: 0.5px;
      }
    }
  }

  .latest-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .latest-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      text-decoration: none;
      group: hover;
      transition: all 0.3s;

      &:hover {
        .item-title {
          color: #409eff;
        }
      }

      .item-index {
        width: 20px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        background: #f0f2f5;
        color: #909399;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
        margin-top: 2px;

        &.top-3 {
          background: #409eff;
          color: #fff;
        }
      }

      .item-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .item-title {
        font-size: 14px;
        color: #303133;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color 0.3s;
      }

      .item-date {
        font-size: 12px;
        color: #c0c4cc;
      }
    }
  }

  .article-card {
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .article-header {
    padding: 40px 50px 30px;
    background: #fff;
    border-bottom: 1px solid #f0f2f5;

    .category-tag {
      margin-bottom: 16px;
      border-radius: 2px;
    }

    .article-title {
      font-size: 32px;
      font-weight: 700;
      color: #1f2f3d;
      margin: 0 0 24px 0;
      line-height: 1.4;
      letter-spacing: -0.5px;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #606266;
        font-size: 14px;

        .label {
          color: #909399;
        }
      }
    }
  }

  .article-content {
    padding: 40px 50px;
    min-height: 400px;

    .summary-box {
      background: #f8f9fa;
      padding: 24px;
      border-left: 4px solid #409eff;
      border-radius: 0 4px 4px 0;
      margin-bottom: 40px;

      .summary-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
      }

      .summary-text {
        font-size: 14px;
        line-height: 1.8;
        color: #606266;
        margin: 0;
      }
    }

    .content-wrapper {
      :deep(h1) {
        font-size: 24px;
        font-weight: 600;
        color: #1f2f3d;
        margin: 40px 0 24px;
        padding-bottom: 12px;
        border-bottom: 1px solid #ebeef5;
      }

      :deep(h2) {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        margin: 32px 0 20px;
        padding-left: 12px;
        border-left: 4px solid #409eff;
      }

      :deep(p) {
        font-size: 16px;
        line-height: 1.8;
        color: #303133;
        margin: 20px 0;
        text-align: justify;
        letter-spacing: 0.5px;
      }

      :deep(ul),
      :deep(ol) {
        margin: 20px 0;
        padding-left: 24px;
        color: #303133;
      }

      :deep(li) {
        margin-bottom: 10px;
        line-height: 1.8;
        font-size: 16px;
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 24px 0;
        font-size: 14px;
        border: 1px solid #ebeef5;
      }

      :deep(th),
      :deep(td) {
        border: 1px solid #ebeef5;
        padding: 12px 16px;
        text-align: left;
        line-height: 1.6;
      }

      :deep(th) {
        background-color: #f5f7fa;
        font-weight: 600;
        color: #303133;
        white-space: nowrap;
      }

      :deep(tr:hover td) {
        background-color: #f9faac;
      }

      :deep(blockquote) {
        margin: 24px 0;
        padding: 16px 24px;
        background-color: #f8f9fa;
        border-left: 4px solid #409eff;
        border-radius: 0 4px 4px 0;
        color: #606266;
        font-style: italic;

        p {
          margin: 0;
        }
      }

      :deep(pre) {
        background: #282c34;
        color: #abb2bf;
        padding: 20px;
        border-radius: 4px;
        overflow-x: auto;
        margin: 24px 0;
        font-family: 'Fira Code', monospace;
      }

      :deep(code) {
        font-family: 'Fira Code', monospace;
        background: #f0f2f5;
        padding: 2px 6px;
        border-radius: 2px;
        color: #c0392b;
        font-size: 0.9em;
      }

      :deep(pre code) {
        background: transparent;
        padding: 0;
        color: inherit;
        font-size: 14px;
      }

      :deep(img) {
        max-width: 100%;
        border-radius: 4px;
        margin: 24px 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }

    .article-statement {
      margin-top: 60px;
      padding: 24px;
      background: #fdf6ec;
      border-radius: 4px;
      color: #e6a23c;
      font-size: 13px;
      line-height: 1.8;

      p {
        margin: 0;
        & + p {
          margin-top: 4px;
        }
      }
    }
  }

  .article-footer {
    padding: 0 50px 50px;

    .keywords {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding-top: 24px;
      border-top: 1px dashed #ebeef5;

      .keyword-label {
        color: #909399;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        margin-top: 6px;
      }

      .tags-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .keyword-tag {
        padding: 6px 16px;
        background: #f0f2f5;
        color: #606266;
        border-radius: 20px;
        font-size: 13px;
        transition: all 0.3s;
        cursor: pointer;

        &:hover {
          background: #409eff;
          color: #fff;
        }
      }
    }
  }

  @media screen and (max-width: 992px) {
    .main-layout {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
      position: static;
    }
  }

  @media screen and (max-width: 768px) {
    .container {
      width: 94%;
      margin-top: -20px;
    }

    .article-header {
      padding: 30px 20px;

      .article-title {
        font-size: 24px;
      }
    }

    .article-content {
      padding: 30px 20px;
    }

    .article-footer {
      padding: 0 20px 30px;
    }
  }
}
</style>
