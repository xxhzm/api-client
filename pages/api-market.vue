<script setup>
import { Search, ChatDotSquare, Right } from '@element-plus/icons-vue'

const { $myFetch } = useNuxtApp()

// 配置项
const options = useState('options')

// 获取路由信息
const route = useRoute()

// 添加搜索相关的数据和方法
const search = ref('')
const list = useState('list')
const listSearch = useState('listSearch')

// 分类筛选相关
const selectedCategory = ref('全部')
const normalizeCategory = (c) => (!c || c.trim() === '' ? '其他' : c)
const categories = computed(() => {
  if (!list.value || list.value.length === 0) return ['全部']
  const cats = Array.from(
    new Set(list.value.map((i) => normalizeCategory(i.category)))
  )
  const rest = cats
    .filter((c) => c !== '置顶')
    .sort((a, b) => a.localeCompare(b))
  const result = ['全部']
  if (cats.includes('置顶')) result.push('置顶')
  return [...result, ...rest]
})
const categoryCounts = computed(() => {
  const map = {}
  ;(list.value || []).forEach((i) => {
    const c = normalizeCategory(i.category)
    map[c] = (map[c] || 0) + 1
  })
  map['全部'] = list.value ? list.value.length : 0
  return map
})

// 数量显示：统一千分位格式，提升可读性
const formatCount = (n) => {
  const num = Number(n || 0)
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(
    num
  )
}

// 新增：费用与登录状态筛选
const paidFilter = ref('全部') // 全部 / 免费 / 付费
const loginFilter = ref('全部') // 全部 / 需登录 / 无需登录

// 从URL参数中获取搜索关键词
const urlSearchParam = route.query.search
if (urlSearchParam) {
  search.value = decodeURIComponent(urlSearchParam)
}
// 从URL参数中获取分类
const urlCategoryParam = route.query.category
if (urlCategoryParam) {
  selectedCategory.value = decodeURIComponent(urlCategoryParam)
}

// 获取API列表数据
const {
  data: { value: res },
} = await useAsyncData('List', () => $myFetch('List'))

list.value = res.data
listSearch.value = res.data

// 搜索+分类+费用+登录过滤功能
const performSearch = () => {
  if (!list.value || list.value.length === 0) {
    listSearch.value = []
    return
  }
  const keyword = (search.value || '').toLowerCase()
  listSearch.value = list.value.filter((data) => {
    const matchesKeyword =
      !keyword ||
      (data.name && data.name.toLowerCase().includes(keyword)) ||
      (data.desc && data.desc.toLowerCase().includes(keyword)) ||
      (data.description && data.description.toLowerCase().includes(keyword))

    const dataCat = normalizeCategory(data.category)
    const matchesCategory =
      selectedCategory.value === '全部' ||
      dataCat === selectedCategory.value ||
      (selectedCategory.value === '置顶' && data.category === '置顶')

    // 费用过滤
    const isPaid = !!data.isPaid
    const matchesPaid =
      paidFilter.value === '全部' ||
      (paidFilter.value === '免费' ? !isPaid : isPaid)

    // 登录状态过滤（后端 key_state：开启=需登录，其余视为无需登录）
    const needLogin = data.key_state === '开启'
    const matchesLogin =
      loginFilter.value === '全部' ||
      (loginFilter.value === '需登录' ? needLogin : !needLogin)

    return matchesKeyword && matchesCategory && matchesPaid && matchesLogin
  })
}

// 监听搜索关键词、分类、费用、登录变化
watch(
  () => search.value,
  () => {
    performSearch()
  }
)
watch(
  () => selectedCategory.value,
  () => {
    performSearch()
  }
)
watch(
  () => paidFilter.value,
  () => {
    performSearch()
  }
)
watch(
  () => loginFilter.value,
  () => {
    performSearch()
  }
)

// 分类选择处理
const handleCategorySelect = (key) => {
  selectedCategory.value = key
  performSearch()
}

// 在组件挂载后执行筛选（确保IndexApiList组件已经初始化完成）
onMounted(() => {
  performSearch()
})

useHead({
  title: 'API市场 - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    {
      name: 'description',
      content: '免费API接口市场，提供各种实用的API接口服务',
    },
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
        <div class="market-layout">
          <aside class="sidebar">
            <div class="sidebar-card">
              <div class="sidebar-header">
                <div class="sidebar-title">分类</div>
                <div class="sidebar-subtitle">按类型筛选接口</div>
              </div>
              <el-menu
                :default-active="selectedCategory"
                class="category-menu"
                @select="handleCategorySelect"
              >
                <el-menu-item v-for="cat in categories" :key="cat" :index="cat">
                  <span class="category-name">{{ cat }}</span>
                  <span class="category-count">{{
                    formatCount(categoryCounts[cat] || 0)
                  }}</span>
                </el-menu-item>
              </el-menu>

              <!-- 新增：费用与登录状态筛选 -->
              <div class="filters">
                <div class="filter-group">
                  <div class="filter-label">费用</div>
                  <el-radio-group
                    v-model="paidFilter"
                    size="small"
                    class="filter-radios"
                  >
                    <el-radio-button label="全部" />
                    <el-radio-button label="免费" />
                    <el-radio-button label="付费" />
                  </el-radio-group>
                </div>
                <div class="filter-group">
                  <div class="filter-label">登录</div>
                  <el-radio-group
                    v-model="loginFilter"
                    size="small"
                    class="filter-radios"
                  >
                    <el-radio-button label="全部" />
                    <el-radio-button label="需登录" />
                    <el-radio-button label="无需登录" />
                  </el-radio-group>
                </div>
              </div>
            </div>
          </aside>
          <div class="content">
            <IndexApiList />
          </div>
        </div>
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
    max-width: 1500px;
    margin: 0 auto;
    padding: 20px 0;
  }

  .page-header {
    text-align: center;
    padding: 20px 0;

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

  /* 分类布局样式 */
  .market-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }
  .sidebar {
    width: 240px;
    flex-shrink: 0;
    position: sticky;
    top: 16px;
  }
  .content {
    flex: 1;
    min-width: 0;
  }
  .sidebar-card {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }
  .sidebar-header {
    padding: 14px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fff;
  }
  .sidebar-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2f3d;
    letter-spacing: 0.2px;
  }
  .sidebar-subtitle {
    margin-top: 2px;
    font-size: 12px;
    color: #909399;
  }
  .category-menu {
    background: transparent;
    border: none;
    padding: 6px 0;
  }
  .category-menu :deep(.el-menu-item) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    border-left: 2px solid transparent;
    transition: all 0.2s ease;
    color: #303133;
  }
  .category-menu :deep(.el-menu-item:hover) {
    background: #f5f7fa;
    border-left-color: #dcdfe6;
  }
  .category-menu :deep(.el-menu-item.is-active) {
    background: #ecf5ff;
    color: #409eff;
    font-weight: 600;
    border-left-color: #409eff;
  }
  .category-name {
    color: #303133;
    padding: 0;
  }
  .category-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 26px;
    height: 20px;
    padding: 0 8px;
    border-radius: 10px;
    background: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
    font-size: 12px;
    line-height: 20px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .category-menu :deep(.el-menu-item:hover .category-count) {
    border-color: #c0c4cc;
  }
  .category-menu :deep(.el-menu-item.is-active .category-count) {
    color: #409eff;
    background: #ecf5ff;
    border-color: #409eff;
  }

  /* 新增：费用与登录状态筛选样式 */
  .filters {
    padding: 12px 16px 14px;
    border-top: 1px solid #ebeef5;
    background: #fff;
  }
  .filter-group {
    margin-bottom: 10px;
  }
  .filter-group:last-child {
    margin-bottom: 0;
  }
  .filter-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 6px;
  }
  .filter-radios :deep(.el-radio-button__inner) {
    padding: 4px 10px;
    font-size: 12px;
    border-color: #dcdfe6;
  }
  .filter-radios :deep(.el-radio-button.is-active .el-radio-button__inner) {
    color: #409eff;
    background: #ecf5ff;
    border-color: #409eff;
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

    /* 移动端分类布局 */
    .market-layout {
      flex-direction: column;
    }
    .sidebar {
      width: 100%;
      position: relative;
    }
    .category-menu :deep(.el-menu-item) {
      padding: 0 12px;
    }
  }
}
</style>
