<script setup>
import { Search, ArrowRight } from '@element-plus/icons-vue'

const { $myFetch } = useNuxtApp()

// 配置项
const options = useState('options')

useHead({
  title: options.value.title + ' - ' + options.value.subheading,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    { name: 'description', content: options.value.description },
    { name: 'keywords', content: options.value.keywords },
  ],
})

// 使用热门API composable，获取8个热门API用于标签显示
const { hotApis, initHotApis } = useHotApis(8)

// 全局状态存储API列表
const apiList = useState('globalApiList')

// 初始化热门API数据
await initHotApis()

// 获取新闻列表
const { data: articleData } = await useAsyncData('HomeArticleList', () =>
  $myFetch('ArticleListForFrontend', {
    params: {
      page: 1,
      limit: 5,
      type: '',
    },
  })
)

const articleList = computed(() => articleData.value?.data?.list || [])

const categoriesMap = {
  1: { name: '公共通知', type: 'danger' },
  2: { name: '行业资讯', type: 'info' },
  3: { name: '产品动态', type: 'primary' },
  4: { name: '解决方案', type: 'success' },
}

const getCategory = (type) => {
  return categoriesMap[type] || categoriesMap[1]
}

const formatDate = (time) => {
  if (!time) return ''
  try {
    const date = new Date(Number(time))
    if (isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (e) {
    return ''
  }
}

// 搜索功能
const searchKeyword = ref('')

// 快速选择热门API
const selectHotApi = (apiName) => {
  searchKeyword.value = apiName
  searchAPI()
}

// 搜索API函数
const searchAPI = () => {
  if (searchKeyword.value.trim()) {
    // 跳转到市场页面并传递搜索关键词
    navigateTo(
      `/api-market?search=${encodeURIComponent(searchKeyword.value.trim())}`
    )
  } else {
    // 如果没有输入关键词，直接跳转到市场页面
    navigateTo('/api-market')
  }
}

// 搜索建议过滤
const querySearch = (queryString, cb) => {
  const results = queryString
    ? (apiList.value || []).filter(createFilter(queryString))
    : apiList.value || []
  // 限制显示前10条建议
  cb(results.slice(0, 10))
}

const createFilter = (queryString) => {
  return (api) => {
    return (
      api.name.toLowerCase().includes(queryString.toLowerCase()) ||
      (api.description &&
        api.description.toLowerCase().includes(queryString.toLowerCase()))
    )
  }
}

// 处理搜索建议选择
const handleSelect = (item) => {
  if (item.alias) {
    navigateTo('/doc/' + item.alias)
  }
}

// 处理回车键搜索
const handleEnterSearch = (event) => {
  if (event.key === 'Enter') {
    searchAPI()
  }
}
</script>

<template>
  <div class="index-container">
    <IndexNavbar></IndexNavbar>
    <IndexBanner></IndexBanner>
    <div class="container">
      <IndexNotice :content="options.notice"></IndexNotice>

      <!-- API搜索与热门推荐 -->
      <div class="section search-section">
        <h2 class="section-title">搜索API</h2>
        <div class="search-container">
          <div class="search-box">
            <el-autocomplete
              v-model="searchKeyword"
              :fetch-suggestions="querySearch"
              placeholder="输入API名称或关键词搜索..."
              class="search-input"
              size="large"
              :trigger-on-focus="false"
              @select="handleSelect"
              @keydown.enter="searchAPI"
            >
              <template #default="{ item }">
                <div class="search-suggestion-item">
                  <span class="suggestion-name">{{ item.name }}</span>
                  <span class="suggestion-desc" v-if="item.description">
                    {{ item.description }}
                  </span>
                </div>
              </template>
              <template #suffix>
                <el-button
                  type="primary"
                  :icon="Search"
                  @click="searchAPI"
                  class="search-btn"
                >
                  搜索
                </el-button>
              </template>
            </el-autocomplete>
          </div>
          <!-- 热门API快速选择标签 -->
          <div
            class="hot-tags-section"
            v-if="options.recommend === 'true' && hotApis && hotApis.length > 0"
          >
            <span class="hot-tags-label">热门搜索：</span>
            <client-only>
              <div class="hot-tags-container">
                <el-tag
                  v-for="(api, index) in hotApis.slice(0, 8)"
                  :key="index"
                  class="hot-tag"
                  type="info"
                  effect="plain"
                  @click="selectHotApi(api.name)"
                >
                  {{ api.name }}
                </el-tag>
              </div>
            </client-only>
          </div>
        </div>
      </div>
    </div>

    <IndexWhyChooseUs />
    <IndexGlobalNetwork />

    <div class="container" v-if="articleList && articleList.length > 0">
      <!-- 新闻动态 -->
      <div class="section news-section">
        <div class="section-header">
          <h2 class="section-title">新闻动态</h2>
          <NuxtLink to="/articles" class="more-link">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </NuxtLink>
        </div>

        <div class="news-content">
          <!-- 左侧：最新一条 -->
          <NuxtLink
            :to="'/article/' + articleList[0].id"
            class="news-featured"
            v-if="articleList[0]"
          >
            <div class="featured-date">
              <span class="day">{{
                formatDate(articleList[0].create_time).split('-')[2]
              }}</span>
              <span class="year-month">{{
                formatDate(articleList[0].create_time)
                  .split('-')
                  .slice(0, 2)
                  .join('-')
              }}</span>
            </div>
            <div class="featured-info">
              <el-tag
                :type="getCategory(articleList[0].type).type"
                effect="dark"
                size="small"
                class="category-tag"
              >
                {{ getCategory(articleList[0].type).name }}
              </el-tag>
              <h3 class="featured-title">{{ articleList[0].title }}</h3>
              <p class="featured-desc">{{ articleList[0].description }}</p>
              <div class="read-more">
                阅读详情 <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </NuxtLink>

          <!-- 右侧：新闻列表 -->
          <div class="news-list-wrapper" v-if="articleList.length > 1">
            <NuxtLink
              v-for="item in articleList.slice(1)"
              :key="item.id"
              :to="'/article/' + item.id"
              class="news-list-item"
            >
              <div class="item-content">
                <div class="item-header">
                  <el-tag
                    :type="getCategory(item.type).type"
                    effect="plain"
                    size="small"
                    class="item-tag"
                  >
                    {{ getCategory(item.type).name }}
                  </el-tag>
                  <span class="item-date">{{
                    formatDate(item.create_time)
                  }}</span>
                </div>
                <h4 class="item-title">{{ item.title }}</h4>
              </div>
              <el-icon class="item-arrow"><ArrowRight /></el-icon>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <IndexPartners />
    <IndexFooter :options="options" />
    <IndexAi />
  </div>
</template>

<style lang="less" scoped>
.index-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f7f9fe, #ffffff);

  .container {
    width: 95%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 0;
  }

  .section {
    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    padding: 0 8px;
  }

  .section-title {
    position: relative;
    color: #1f2f3d;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    padding-left: 16px;
    line-height: 1.4;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background: #409eff;
      border-radius: 4px;
    }
  }

  .system-info {
    margin-top: 4px;
  }
}

.search-section {
  margin: 32px 0;

  .search-container {
    background: #fff;
    padding: 40px;
    border: 1px solid #ebeef5;
    margin-top: 8px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }

  .search-box {
    margin-bottom: 20px;

    .search-input {
      width: 100%;

      :deep(.el-input__wrapper) {
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        border: 1px solid #e2e8f0;
        padding: 4px 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background-color: #f8fafc;

        &:hover {
          border-color: #c0c4cc;
          background-color: #fff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        &.is-focus {
          border-color: #409eff;
          background-color: #fff;
          box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.15);
        }
      }

      :deep(.el-input__inner) {
        height: 52px;
        font-size: 16px;
        color: #1e293b;
        padding-left: 8px;

        &::placeholder {
          color: #94a3b8;
        }
      }

      :deep(.el-input__suffix) {
        right: 8px;
      }
    }

    .search-btn {
      border-radius: 8px;
      font-size: 15px;
      padding: 10px 24px;
      height: 40px;
      font-weight: 500;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
      }

      &:active {
        transform: translateY(1px);
      }
    }
  }

  /* 热门API快速选择标签样式 */
  .hot-tags-section {
    margin-top: 16px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .hot-tags-label {
    color: #666;
    font-size: 14px;
    margin-right: 8px;
    flex-shrink: 0;
  }

  .hot-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .hot-tag {
    cursor: pointer;
    background: #f5f7fa;
    color: #606266;
    font-size: 13px;
    padding: 4px 8px;
    border-radius: 4px;
    border: none;
  }

  .hot-tag:hover {
    background: #409eff;
    color: #ffffff;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .hot-tags-container {
      gap: 6px;
    }

    .hot-tag {
      font-size: 12px;
      padding: 3px 6px;
    }
  }
}

.news-section {
  margin: 40px 0;

  .more-link {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #606266;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      color: #409eff;
    }

    .el-icon {
      font-size: 12px;
      transition: transform 0.3s ease;
    }

    &:hover .el-icon {
      transform: translateX(3px);
    }
  }

  .news-content {
    display: flex;
    gap: 24px;
    margin-top: 16px;
  }

  /* 左侧推荐新闻样式 */
  .news-featured {
    flex: 0 0 45%;
    display: flex;
    gap: 24px;
    background: #fff;
    padding: 32px;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.3s ease;
    border: 1px solid #ebeef5;
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
      border-color: #dcdfe6;

      .read-more {
        color: #409eff;

        .el-icon {
          transform: translateX(4px);
        }
      }
    }

    .featured-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: #f0f2f5;
      border-radius: 8px;
      flex-shrink: 0;
      color: #303133;

      .day {
        font-size: 28px;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 4px;
        color: #409eff;
      }

      .year-month {
        font-size: 12px;
        color: #909399;
      }
    }

    .featured-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;

      .category-tag {
        width: fit-content;
        margin-bottom: 12px;
      }

      .featured-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 12px 0;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .featured-desc {
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
        margin: 0 0 20px 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex: 1;
      }

      .read-more {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: #909399;
        margin-top: auto;
        transition: all 0.3s;

        .el-icon {
          transition: transform 0.3s;
        }
      }
    }
  }

  /* 右侧新闻列表样式 */
  .news-list-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .news-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    background: #fff;
    border-radius: 12px;
    text-decoration: none;
    border: 1px solid #ebeef5;
    transition: all 0.3s ease;

    &:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border-color: #dcdfe6;

      .item-title {
        color: #409eff;
      }

      .item-arrow {
        opacity: 1;
        transform: translateX(0);
        color: #409eff;
      }
    }

    .item-content {
      flex: 1;
      min-width: 0;
      margin-right: 20px;
    }

    .item-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .item-date {
      font-size: 13px;
      color: #909399;
    }

    .item-title {
      font-size: 15px;
      color: #303133;
      margin: 0;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.3s;
    }

    .item-arrow {
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s;
      color: #909399;
    }
  }
}

// 大屏幕优化
@media screen and (max-width: 1400px) {
  .index-container {
    .container {
      width: 92%;
      padding: 28px 0;
    }

    .section-title {
      font-size: 18px;
    }

    .search-container {
      padding: 36px;
    }
  }
}

// 中等屏幕优化
@media screen and (max-width: 1200px) {
  .index-container {
    .container {
      width: 90%;
      padding: 24px 0;
    }

    .section {
      margin-bottom: 32px;
    }

    .section-header {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 17px;
      padding-left: 14px;

      &::before {
        width: 3px;
        height: 18px;
      }
    }
  }

  .search-section {
    margin: 24px 0;

    .search-container {
      padding: 32px;
      border-radius: 14px;
    }
  }
}

@media screen and (max-width: 768px) {
  .index-container {
    .container {
      width: 95%;
      padding: 16px 0;
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 16px;
      padding-left: 12px;

      &::before {
        width: 3px;
        height: 16px;
      }
    }

    .search-box {
      padding: 12px 16px;
    }

    .section-header {
      margin-bottom: 20px;
      padding: 0 4px;
    }
  }

  .search-section {
    margin: 20px 0;

    .search-container {
      padding: 24px 20px;
      border-radius: 12px;
    }

    .search-box {
      .search-input {
        :deep(.el-input__inner) {
          font-size: 15px;
          padding-right: 90px;
        }
      }

      .search-btn {
        font-size: 13px;
        padding: 6px 12px;
        height: 28px;
      }
    }

    .search-tip {
      font-size: 13px;
    }
  }

  .hot-apis {
    .hot-apis-grid {
      gap: 12px;
    }

    .hot-api-card {
      padding: 16px;
      gap: 12px;

      &__icon {
        width: 36px;
        height: 36px;
        font-size: 18px;
      }

      &__content {
        h3 {
          font-size: 15px;
        }

        p {
          font-size: 13px;
        }
      }

      &__stats {
        font-size: 12px;
      }
    }
  }

  .news-section {
    .news-content {
      flex-direction: column;
      gap: 16px;
    }

    .news-featured {
      padding: 20px;
      flex: none;
      width: auto;

      .featured-date {
        width: 60px;
        height: 60px;
        margin-right: 16px;

        .day {
          font-size: 20px;
        }
      }

      .featured-title {
        font-size: 16px;
        margin-bottom: 8px;
      }

      .featured-desc {
        -webkit-line-clamp: 2;
        margin-bottom: 12px;
        font-size: 13px;
      }
    }

    .news-list-item {
      padding: 16px;

      .item-content {
        margin-right: 12px;
      }

      .item-title {
        font-size: 14px;
      }

      .item-date {
        font-size: 12px;
      }
    }
  }
}

.search-suggestion-item {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  line-height: 1.4;

  .suggestion-name {
    font-weight: 500;
    color: #303133;
  }

  .suggestion-desc {
    font-size: 12px;
    color: #909399;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
}
</style>
