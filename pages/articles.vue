<script setup>
import {
  User,
  Timer,
  Right,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Document,
} from '@element-plus/icons-vue'

const { $myFetch } = useNuxtApp()
const route = useRoute()

const page = computed(() => parseInt(route.query.page) || 1)
const limit = ref(10)
const type = computed(() => route.query.type || '')

const { data, refresh } = await useAsyncData(
  'ArticleListForFrontend',
  () =>
    $myFetch('ArticleListForFrontend', {
      params: {
        page: page.value,
        limit: limit.value,
        type: type.value,
      },
    }),
  {
    watch: [page, limit, type],
  }
)

const list = computed(() => data.value?.data?.list || [])
const total = computed(() => data.value?.data?.total || 0)
const totalPages = computed(() => Math.ceil(total.value / limit.value))

const displayedPages = computed(() => {
  const count = totalPages.value
  const current = page.value

  if (count <= 7) {
    return Array.from({ length: count }, (_, i) => i + 1)
  }

  const pages = []
  if (current <= 4) {
    for (let i = 1; i <= 6; i++) pages.push(i)
    pages.push('...')
    pages.push(count)
  } else if (current >= count - 3) {
    pages.push(1)
    pages.push('...')
    for (let i = count - 5; i <= count; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push('...')
    for (let i = current - 2; i <= current + 2; i++) pages.push(i)
    pages.push('...')
    pages.push(count)
  }
  return pages
})

// 监听页码变化，滚动到顶部
watch(page, () => {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

// 配置项
const options = useState('options')

useHead({
  title: '文章' + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    {
      name: 'description',
      content: options.value.website_name + '-文章',
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: () => `${options.value.site_url}/articles?page=${page.value}`,
    },
    {
      rel: 'prev',
      href: () =>
        page.value > 1
          ? `${options.value.site_url}/articles?page=${page.value - 1}`
          : undefined,
    },
    {
      rel: 'next',
      href: () =>
        page.value < Math.ceil(total.value / limit.value)
          ? `${options.value.site_url}/articles?page=${page.value + 1}`
          : undefined,
    },
  ],
  style: [
    {
      children: options.value.css,
    },
  ],
})

const categoriesMap = {
  1: { name: '公共通知', type: 'danger' },
  2: { name: '行业资讯', type: 'info' },
  3: { name: '产品动态', type: 'primary' },
  4: { name: '解决方案', type: 'success' },
}

const getCategory = (type) => {
  return categoriesMap[type] || categoriesMap[1]
}

const handleCategoryChange = (newType) => {
  navigateTo({
    path: '/articles',
    query: {
      ...route.query,
      type: newType || undefined,
      page: 1,
    },
  })
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
      <div class="section">
        <div class="content-wrapper">
          <div class="category-tabs">
            <div
              class="tab-item"
              :class="{ active: !type }"
              @click="handleCategoryChange('')"
            >
              全部
            </div>
            <div
              v-for="(cat, key) in categoriesMap"
              :key="key"
              class="tab-item"
              :class="{ active: type == key }"
              @click="handleCategoryChange(key)"
            >
              {{ cat.name }}
            </div>
          </div>

          <div class="article-list" v-if="list.length > 0">
            <NuxtLink
              v-for="item in list"
              :key="item.id"
              class="article-item"
              :to="'/article/' + item.id"
            >
              <div class="article-date-box">
                <span class="date-day">{{
                  formatDate(item.create_time).split('-')[2]
                }}</span>
                <span class="date-year-month">{{
                  formatDate(item.create_time).split('-').slice(0, 2).join('-')
                }}</span>
              </div>

              <div class="article-main">
                <div class="article-header">
                  <el-tag
                    :type="getCategory(item.type).type"
                    effect="plain"
                    size="small"
                    class="category-tag"
                    round
                  >
                    {{ getCategory(item.type).name }}
                  </el-tag>
                  <h3 class="article-title">{{ item.title }}</h3>
                </div>
                <p class="article-desc">{{ item.description }}</p>
                <div class="article-meta">
                  <span class="meta-item">
                    <el-icon><User /></el-icon>
                    {{ item.author }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    {{ formatDate(item.create_time) }}
                  </span>
                </div>
              </div>

              <div class="article-action">
                <span class="read-btn">
                  阅读全文 <el-icon><ArrowRight /></el-icon>
                </span>
              </div>
            </NuxtLink>
          </div>
          <div v-else class="empty-state">
            <div class="empty-content">
              <el-icon class="empty-icon"><Document /></el-icon>
              <p class="empty-text">暂无相关内容</p>
            </div>
          </div>

          <div class="pagination-container" v-if="total > 0">
            <div class="seo-pagination">
              <!-- Previous -->
              <NuxtLink
                v-if="page > 1"
                :to="{
                  path: '/articles',
                  query: { ...route.query, page: page - 1 },
                }"
                class="page-btn prev"
                title="上一页"
              >
                <el-icon><ArrowLeft /></el-icon>
              </NuxtLink>
              <span v-else class="page-btn prev disabled">
                <el-icon><ArrowLeft /></el-icon>
              </span>

              <!-- Pages -->
              <template v-for="(p, index) in displayedPages" :key="index">
                <span v-if="p === '...'" class="page-separator">...</span>
                <NuxtLink
                  v-else
                  :to="{
                    path: '/articles',
                    query: { ...route.query, page: p },
                  }"
                  class="page-number"
                  :class="{ active: p === page }"
                >
                  {{ p }}
                </NuxtLink>
              </template>

              <!-- Next -->
              <NuxtLink
                v-if="page < totalPages"
                :to="{
                  path: '/articles',
                  query: { ...route.query, page: page + 1 },
                }"
                class="page-btn next"
                title="下一页"
              >
                <el-icon><ArrowRight /></el-icon>
              </NuxtLink>
              <span v-else class="page-btn next disabled">
                <el-icon><ArrowRight /></el-icon>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less" scoped>
.article-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa;

  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding-bottom: 60px;
    margin-top: -60px;
    position: relative;
    z-index: 10;
  }

  .content-wrapper {
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    padding: 40px;
    min-height: 600px;
  }

  .category-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 30px;
    padding: 4px;
    background: #f5f7fa;
    border-radius: 4px;
    width: fit-content;

    .tab-item {
      font-size: 14px;
      color: #606266;
      cursor: pointer;
      padding: 6px 20px;
      border-radius: 4px;
      transition: all 0.3s;
      font-weight: 500;

      &:hover {
        color: #409eff;
        background: rgba(255, 255, 255, 0.5);
      }

      &.active {
        color: #409eff;
        background: #fff;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
    }
  }

  .article-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .empty-state {
    padding: 120px 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .empty-content {
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      color: #e4e7ed;
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .article-item {
    display: flex;
    gap: 30px;
    padding: 30px 0;
    border-bottom: 1px solid #f0f2f5;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:hover {
      .article-title {
        color: #409eff;
      }

      .read-btn {
        color: #409eff;
        background: rgba(64, 158, 255, 0.1);
      }
    }
  }

  .article-date-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: #f8f9fa;
    border-radius: 4px;
    flex-shrink: 0;
    color: #606266;

    .date-day {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      line-height: 1;
      margin-bottom: 4px;
    }

    .date-year-month {
      font-size: 12px;
      color: #909399;
    }
  }

  .article-main {
    flex: 1;
    min-width: 0;
  }

  .article-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;

    .category-tag {
      border: none;
      padding: 0 12px;
      height: 24px;
      line-height: 24px;
    }

    .article-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0;
      line-height: 1.4;
      transition: color 0.3s;
    }
  }

  .article-desc {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    margin: 0 0 16px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .article-meta {
    display: flex;
    align-items: center;
    gap: 24px;
    color: #909399;
    font-size: 13px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .article-action {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 20px;
    border-left: 1px solid #f0f2f5;

    .read-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      border-radius: 20px;
      color: #909399;
      font-size: 14px;
      transition: all 0.3s;
      white-space: nowrap;
    }
  }

  @media (max-width: 768px) {
    .container {
      margin-top: -30px;
      padding-bottom: 30px;
    }

    .content-wrapper {
      padding: 20px;
    }

    .article-item {
      flex-direction: column;
      gap: 16px;
    }

    .article-date-box {
      display: none;
    }

    .article-action {
      display: none;
    }

    .article-title {
      font-size: 16px;
    }

    .category-tabs {
      width: 100%;
      background: transparent;
      padding: 0;
      overflow-x: auto;
      white-space: nowrap;
      gap: 15px;
      margin-bottom: 20px;
      border-bottom: none;
      padding-bottom: 0;

      &::-webkit-scrollbar {
        display: none;
      }

      .tab-item {
        margin-bottom: 0;
        padding: 6px 16px;
        background: #f5f7fa;
        border-radius: 16px;
        font-size: 13px;
        color: #606266;
        padding-bottom: 6px;

        &.active {
          background: #409eff;
          color: #fff;

          &::after {
            display: none;
          }
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    padding-top: 20px;
  }

  .seo-pagination {
    display: flex;
    align-items: center;
    gap: 8px;

    .page-btn,
    .page-number {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      padding: 0 4px;
      border-radius: 4px;
      background: #f4f4f5;
      color: #606266;
      font-size: 14px;
      text-decoration: none;
      transition: all 0.3s;
      font-weight: 500;

      &:hover:not(.disabled):not(.active) {
        color: #409eff;
      }

      &.active {
        background: #409eff;
        color: #fff;
        cursor: default;
      }

      &.disabled {
        color: #c0c4cc;
        cursor: not-allowed;
        background: #f4f4f5;
      }
    }

    .page-separator {
      color: #606266;
      font-size: 14px;
      margin: 0 4px;
    }
  }
}
</style>
