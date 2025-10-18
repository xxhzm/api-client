<script setup>
import {
  Search,
  ChatDotSquare,
  Right,
} from '@element-plus/icons-vue'

const { $myFetch } = useNuxtApp()

// 配置项
const options = useState('options')

// 获取路由信息
const route = useRoute()

// 添加搜索相关的数据和方法
const search = ref('')
const list = useState('list')
const listSearch = useState('listSearch')

// 从URL参数中获取搜索关键词
const urlSearchParam = route.query.search
if (urlSearchParam) {
  search.value = decodeURIComponent(urlSearchParam)
}

// 获取API列表数据
const {
  data: { value: res },
} = await useAsyncData('List', () => $myFetch('List'))

list.value = res.data
listSearch.value = res.data

// 搜索功能
const performSearch = () => {
  if (!list.value || list.value.length === 0) {
    return
  }
  
  listSearch.value = list.value.filter(
    (data) =>
      !search.value ||
      (data.name && data.name.toLowerCase().includes(search.value.toLowerCase())) ||
      (data.desc && data.desc.toLowerCase().includes(search.value.toLowerCase()))
  )
}

// 监听搜索关键词变化
watch(
  () => search.value,
  () => {
    performSearch()
  }
)

// 在组件挂载后执行搜索（确保IndexApiList组件已经初始化完成）
onMounted(() => {
  if (search.value) {
    performSearch()
  }
})

useHead({
  title: 'API市场 - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    { name: 'description', content: '免费API接口市场，提供各种实用的API接口服务' },
    { name: 'keywords', content: 'API市场,免费API,接口服务,开发者工具' },
  ],
})
</script>

<template>
  <div class="api-market-container">
    <IndexNavbar></IndexNavbar>
    
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">API市场</h1>
        <p class="page-subtitle">发现和使用各种免费的API接口服务</p>
      </div>

      <!-- API搜索区域 -->
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

      <!-- API列表区域 -->
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
    </div>

    <IndexFooter :options="options" />
  </div>
</template>

<style lang="less" scoped>
.api-market-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f7f9fe, #ffffff);

  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 0;
  }

  .page-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 40px 0;

    .page-title {
      font-size: 32px;
      font-weight: 600;
      color: #1f2f3d;
      margin: 0 0 12px;
    }

    .page-subtitle {
      font-size: 16px;
      color: #606266;
      margin: 0;
    }
  }

  .section {
    margin-bottom: 40px;

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
    font-size: 18px;
    font-weight: 500;
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
      height: 18px;
      background: #409eff;
      border-radius: 3px;
    }
  }

  .feedback-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    color: #606266;
    text-decoration: none;
    font-size: 14px;
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

  .search-box {
    background: #fff;
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

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
        height: 44px;
        font-size: 15px;
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

@media screen and (max-width: 768px) {
  .api-market-container {
    .container {
      width: 95%;
    }

    .page-header {
      padding: 20px 0;
      margin-bottom: 30px;

      .page-title {
        font-size: 24px;
      }

      .page-subtitle {
        font-size: 14px;
      }
    }

    .section-title {
      font-size: 16px;

      &::before {
        height: 16px;
      }
    }

    .search-box {
      padding: 16px 20px;

      &__input {
        :deep(.el-input__inner) {
          height: 40px;
          font-size: 14px;
        }
      }
    }

    .section-header {
      margin-bottom: 16px;
    }

    .section {
      margin-bottom: 30px;
    }
  }
}
</style>