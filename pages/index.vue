<script setup>
import { Connection, View, Star, Search } from '@element-plus/icons-vue'

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

// 初始化热门API数据
await initHotApis()

const adDisplay = ref(true)

const adInfo = (info) => {
  if (info.value.length === 0) {
    adDisplay.value = false
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
      <!-- <client-only>
        <div class="section" v-if="adDisplay">
          <h2 class="section-title">广告商</h2>
          <Ad @adInfo="adInfo"></Ad>
        </div>

        <div class="section">
          <h2 class="section-title" style="margin-bottom: 10px">系统信息</h2>
          <SystemInfo></SystemInfo>
        </div>
      </client-only> -->

      <!-- API搜索与热门推荐 -->
      <div class="section search-section">
        <h2 class="section-title">搜索API</h2>
        <div class="search-container">
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="输入API名称或关键词搜索..."
              class="search-input"
              size="large"
              @keydown="handleEnterSearch"
            >
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
            </el-input>
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
  }

  .search-box {
    margin-bottom: 12px;

    .search-input {
      :deep(.el-input__wrapper) {
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #dcdfe6;
        transition: all 0.3s ease;

        &:hover {
          border-color: #c0c4cc;
        }

        &.is-focus {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }

      :deep(.el-input__inner) {
        font-size: 16px;
        padding-right: 100px;
      }

      :deep(.el-input__suffix) {
        right: 8px;
      }
    }

    .search-btn {
      border-radius: 6px;
      font-size: 14px;
      padding: 8px 16px;
      height: 32px;
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
  margin: 20px 0;

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

  .news-list {
    background: #fff;
    border-radius: 12px;
    padding: 4px 0;
    margin-top: 4px;
  }

  .news-item {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    transition: all 0.3s ease;

    &:hover {
      background: #f5f7fa;
    }

    &__tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 12px;

      &.new {
        background: #ecf5ff;
        color: #409eff;
      }

      &.update {
        background: #f0f9eb;
        color: #67c23a;
      }

      &.notice {
        background: #fdf6ec;
        color: #e6a23c;
      }
    }

    &__title {
      flex: 1;
      font-size: 14px;
      color: #606266;
    }

    &__date {
      font-size: 13px;
      color: #909399;
      margin-left: 16px;
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
    .news-item {
      padding: 12px 16px;

      &__title {
        font-size: 13px;
      }

      &__date {
        font-size: 12px;
      }
    }
  }
}
</style>
