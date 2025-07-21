<script setup>
import {
  ChatDotSquare,
  Search,
  Right,
  Connection,
  View,
  Star,
} from '@element-plus/icons-vue'

const { $myFetch } = useNuxtApp()

// 配置项
const options = useState('options')
const links = ref([])

const {
  data: { value: linkRes },
} = await useAsyncData('LinkList', () => $myFetch('LinkList'))

links.value = linkRes.data

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

// 添加搜索相关的数据和方法
const search = ref('')
const list = useState('list')
const listSearch = useState('listSearch')

// 生成随机数的函数
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 格式化数字为带逗号的字符串
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 从API列表中随机选择4个并添加随机统计数据
const generateHotApis = computed(() => {
  if (!list.value) return []

  // 随机打乱数组并取前4个
  const randomApis = [...list.value].sort(() => Math.random() - 0.5).slice(0, 4)

  // 为每个API添加随机的调用量和收藏数
  return randomApis.map((api) => ({
    name: api.name,
    desc: api.description || '暂无描述',
    views: formatNumber(getRandomNumber(100000, 2000000)), // 10万到200万之间
    stars: formatNumber(getRandomNumber(1000, 5000)), // 1千到5千之间
    alias: api.alias, // 添加alias用于跳转
  }))
})

// 替换静态的hotApis为计算属性
const hotApis = computed(() => generateHotApis.value)

watch(
  () => search.value,
  () => {
    listSearch.value = list.value.filter(
      (data) =>
        !search.value ||
        data.name.toLowerCase().includes(search.value.toLowerCase())
    )
  }
)

const adDisplay = ref(true)

const adInfo = (info) => {
  if (info.value.length === 0) {
    adDisplay.value = false
  }
}

const linksDisplay = ref(true)

if (links.value.length === 0) {
  linksDisplay.value = false
}
</script>

<template>
  <div class="index-container">
    <IndexNotice :content="options.notice"></IndexNotice>
    <div class="container">
      <client-only>
        <div class="section" v-if="adDisplay">
          <h2 class="section-title">广告商</h2>
          <Ad @adInfo="adInfo"></Ad>
        </div>

        <div class="section">
          <h2 class="section-title" style="margin-bottom: 10px">系统信息</h2>
          <SystemInfo></SystemInfo>
        </div>
      </client-only>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">API搜索</h2>
        </div>
        <div class="search-box">
          <el-input
            v-model="search"
            placeholder="请输入搜寻的API关键词..."
            clearable
            class="search-box__input"
          >
            <template #suffix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">API列表</h2>
          <a
            :href="options.feedback || '#'"
            target="_blank"
            class="feedback-btn"
          >
            <el-icon><ChatDotSquare /></el-icon>
            <span>问题反馈</span>
            <el-icon class="feedback-btn__arrow"><Right /></el-icon>
          </a>
        </div>
        <IndexApiList></IndexApiList>
      </div>

      <!-- 热门API推荐 -->
      <div class="section hot-apis" v-if="options.recommend === 'true'">
        <div class="section-header">
          <h2 class="section-title">热门API推荐</h2>
        </div>
        <client-only>
          <div class="hot-apis-grid">
            <div
              v-for="(api, index) in hotApis"
              :key="index"
              class="hot-api-card"
              @click="navigateTo(`/doc/${api.alias}`)"
            >
              <div class="hot-api-card__icon">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="hot-api-card__content">
                <h3>{{ api.name }}</h3>
                <p>{{ api.desc }}</p>
                <div class="hot-api-card__stats">
                  <span>
                    <el-icon><View /></el-icon>
                    {{ api.views }}次调用
                  </span>
                  <span>
                    <el-icon><Star /></el-icon>
                    {{ api.stars }}人收藏
                  </span>
                </div>
              </div>
            </div>
          </div>
        </client-only>
      </div>
      <div class="section seo-section" v-if="options.recommend === 'true'">
        <div class="seo-block">
          <h2 class="section-title">免费API大全</h2>
          <div class="seo-content">
            <div class="seo-item">
              <h3>免费工具API</h3>
              <p>
                海量免费API接口，包括天气查询API、短网址API、二维码生成API等实用工具接口，支持免费调用。
              </p>
            </div>
            <div class="seo-item">
              <h3>免费娱乐API</h3>
              <p>
                丰富的免费娱乐API，提供网易云音乐API、随机壁纸API、随机图片API等，完全免费使用。
              </p>
            </div>
            <div class="seo-item">
              <h3>免费查询API</h3>
              <p>
                各类免费查询API接口，新闻资讯API、每日一句API、历史上的今天API等，永久免费提供。
              </p>
            </div>
          </div>
        </div>

        <div class="seo-block">
          <h2 class="section-title">免费API接口优势</h2>
          <div class="seo-content">
            <div class="seo-item">
              <h3>免费开放接口</h3>
              <p>
                所有API接口均为免费开放接口，无需付费即可使用，支持开发者免费调用测试。
              </p>
            </div>
            <div class="seo-item">
              <h3>免费数据接口</h3>
              <p>
                提供海量免费数据接口，所有API数据实时更新，确保免费API数据的准确性。
              </p>
            </div>
            <div class="seo-item">
              <h3>免费公共API</h3>
              <p>
                完全免费的公共API平台，支持免费API在线测试，提供免费API文档说明。
              </p>
            </div>
          </div>
        </div>

        <div class="seo-item">
          <h3>免费调用保障</h3>
          <p>
            承诺API接口永久免费，无隐藏收费，无调用次数限制，为开发者提供免费服务。
          </p>
        </div>
        <div class="seo-item">
          <h3>稳定性保障</h3>
          <p>
            免费API接口采用高可用架构，确保免费接口7*24小时稳定运行，随时可用。
          </p>
        </div>
        <div class="seo-item">
          <h3>响应速度保障</h3>
          <p>
            优化免费API访问速度，采用多节点部署，让每个免费接口都能快速响应。
          </p>
        </div>
      </div>
    </div>

    <!-- 友情链接 -->
    <div class="section friend-links" v-if="linksDisplay">
      <div class="container">
        <h2 class="section-title">友情链接</h2>
        <div class="links-wrapper">
          <a
            v-for="item in links"
            :key="item.id"
            :href="item.url"
            target="_blank"
            class="link-item"
          >
            {{ item.name }}
          </a>
        </div>
      </div>
    </div>
    <IndexAi></IndexAi>
    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less" scoped>
.index-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f7f9fe, #ffffff);

  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .section {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0 4px;
  }

  .section-title {
    position: relative;
    color: #1f2f3d;
    font-size: 16px;
    font-weight: normal;
    margin: 0;
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

  .feedback-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    color: #606266;
    text-decoration: none;
    font-size: 13px;
    transition: all 0.3s ease;

    i {
      font-size: 14px;
    }

    &__arrow {
      font-size: 12px !important;
      margin-left: 2px;
      transition: transform 0.3s ease;
    }

    &:hover {
      color: #409eff;
      border-color: #409eff;
      background: #fff;

      .feedback-btn__arrow {
        transform: translateX(3px);
      }
    }
  }

  .search-box,
  .api-card,
  .system-info {
    margin-top: 4px;
  }

  .search-box {
    background: #fff;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

    &__input {
      :deep(.el-input__wrapper) {
        background: #f5f7fa;
        border-radius: 8px;
        box-shadow: none;
        transition: all 0.25s ease;

        &.is-focus {
          background: #fff;
          box-shadow: 0 0 0 1px #dcdfe6;
        }
      }

      :deep(.el-input__inner) {
        height: 40px;
        font-size: 14px;
        color: #606266;

        &::placeholder {
          color: #909399;
        }
      }

      :deep(.el-input__suffix) {
        color: #909399;
      }
    }
  }
}

.seo-section {
  margin: 30px 0;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

  .seo-block {
    margin-bottom: 30px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      margin-bottom: 20px;
    }
  }

  .seo-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 0 4px;
  }

  .seo-item {
    h3 {
      font-size: 16px;
      color: #2c3e50;
      margin-bottom: 10px;
      font-weight: 500;
    }

    p {
      color: #606266;
      font-size: 14px;
      line-height: 1.6;
    }
  }
}

.hot-apis {
  margin: 20px 0;

  .hot-apis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 4px;
  }

  .hot-api-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    transition: all 0.3s ease;
    border: 1px solid #ebeef5;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #dcdfe6;
    }

    &__icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #ecf5ff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409eff;
      font-size: 20px;
    }

    &__content {
      flex: 1;

      h3 {
        margin: 0 0 8px;
        font-size: 16px;
        color: #303133;
        font-weight: 500;
      }

      p {
        margin: 0 0 12px;
        font-size: 14px;
        color: #606266;
        line-height: 1.5;
        text-indent: 2em;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }
    }

    &__stats {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #909399;

      span {
        display: flex;
        align-items: center;
        gap: 4px;

        .el-icon {
          font-size: 14px;
        }
      }
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

@media screen and (max-width: 768px) {
  .index-container {
    .container {
      width: 95%;
    }

    .section-title {
      font-size: 15px;

      &::before {
        height: 14px;
      }
    }

    .search-box {
      padding: 12px 16px;
    }

    .section-header {
      margin-bottom: 16px;
    }
  }

  .seo-section {
    margin: 20px 0;
    padding: 15px;

    .seo-content {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .seo-item {
      h3 {
        font-size: 15px;
      }

      p {
        font-size: 13px;
      }
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

.friend-links {
  padding: 20px 0;
  background: #fff;
  margin-top: 20px;

  .links-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 15px;
  }

  .link-item {
    color: #606266;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;

    &:hover {
      color: #409eff;
    }
  }
}
</style>
