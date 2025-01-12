<template>
  <div class="index-container">
    <IndexNotice></IndexNotice>
    <div class="container">
      <client-only>
        <div class="section">
          <h2 class="section-title">广告商</h2>
          <Ad></Ad>
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
            href="https://jq.qq.com/?_wv=1027&k=92BF8Ndr"
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

      <div class="section seo-section">
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

        <div class="seo-block">
          <h2 class="section-title">免费API服务保障</h2>
          <div class="seo-content">
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
      </div>
    </div>
    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<script setup>
import { ChatDotSquare, Search, Right } from '@element-plus/icons-vue'

const { $myFetch } = useNuxtApp()

// 配置项
const options = ref({})

const {
  data: { value: res },
} = await useAsyncData('Options', () => $myFetch('Options'))

options.value = res.data

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
</script>

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
}
</style>
