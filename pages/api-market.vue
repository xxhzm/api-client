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
const getCategoryNames = (item) => {
  const names = Array.isArray(item?.categories)
    ? item.categories.map((c) => normalizeCategory(c?.name)).filter((n) => !!n)
    : []
  if (!names.length && item?.category) {
    names.push(normalizeCategory(item.category))
  }
  return names.length ? names : ['其他']
}
const categories = computed(() => {
  if (!list.value || list.value.length === 0) return ['全部']
  const set = new Set()
  list.value.forEach((item) => {
    getCategoryNames(item).forEach((n) => set.add(n))
  })
  const cats = Array.from(set)
  const rest = cats
    .filter((c) => c !== '置顶')
    .sort((a, b) => a.localeCompare(b))
  const result = ['全部']
  if (cats.includes('置顶')) result.push('置顶')
  return [...result, ...rest]
})
const categoryCounts = computed(() => {
  const map = {}
  ;(list.value || []).forEach((item) => {
    getCategoryNames(item).forEach((n) => {
      map[n] = (map[n] || 0) + 1
    })
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

    const itemCats = getCategoryNames(data)
    const matchesCategory =
      selectedCategory.value === '全部' ||
      itemCats.includes(selectedCategory.value)

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

    <!-- 顶部 Hero 区域：标题 + 搜索 -->
    <div class="market-hero">
      <div class="hero-content">
        <h1 class="page-title">API 市场</h1>
        <p class="page-subtitle">发现和使用各种优质的 API 接口服务</p>

        <div class="search-wrapper">
          <el-input
            v-model="search"
            placeholder="搜索 API 名称、描述..."
            class="hero-search-input"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon class="search-icon"><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="market-layout">
        <!-- 左侧分类侧边栏 -->
        <aside class="sidebar">
          <div class="sidebar-card">
            <div class="sidebar-header">
              <span class="sidebar-title">全部分类</span>
            </div>
            <div class="category-list">
              <div
                v-for="cat in categories"
                :key="cat"
                class="category-item"
                :class="{ active: selectedCategory === cat }"
                @click="handleCategorySelect(cat)"
              >
                <span class="cat-name">{{ cat }}</span>
                <span class="cat-count">{{
                  formatCount(categoryCounts[cat] || 0)
                }}</span>
              </div>
            </div>
          </div>

          <!-- 反馈按钮 -->
          <a
            :href="options.feedback || '#'"
            target="_blank"
            class="feedback-card"
          >
            <div class="feedback-content">
              <el-icon><ChatDotSquare /></el-icon>
              <span>提交反馈 / 需求</span>
            </div>
            <el-icon><Right /></el-icon>
          </a>
        </aside>

        <!-- 右侧内容区域 -->
        <div class="content">
          <!-- 顶部筛选栏 -->
          <div class="filter-bar">
            <div class="filter-left">
              <span class="result-count"
                >共找到 <b>{{ listSearch.length }}</b> 个接口</span
              >
            </div>
            <div class="filter-right">
              <div class="filter-group">
                <span class="filter-label">费用：</span>
                <el-radio-group v-model="paidFilter" size="default">
                  <el-radio-button label="全部" />
                  <el-radio-button label="免费" />
                  <el-radio-button label="付费" />
                </el-radio-group>
              </div>
              <div class="filter-group">
                <span class="filter-label">权限：</span>
                <el-radio-group v-model="loginFilter" size="default">
                  <el-radio-button label="全部" />
                  <el-radio-button label="需登录" />
                  <el-radio-button label="无需登录" />
                </el-radio-group>
              </div>
            </div>
          </div>

          <!-- API 列表 -->
          <div class="api-list-wrapper">
            <IndexApiList />
          </div>

          <!-- 空状态提示 -->
          <div v-if="listSearch.length === 0" class="empty-state">
            <el-empty description="暂无符合条件的 API" />
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
  background-color: #f8fafc;
}

/* Hero 区域 */
.market-hero {
  background: linear-gradient(135deg, #fff 0%, #f0f4ff 100%);
  padding: 60px 0 80px;
  text-align: center;
  position: relative;
  border-bottom: 1px solid #eef2f6;

  .hero-content {
    width: 90%;
    max-width: 800px;
    margin: 0 auto;
  }

  .page-title {
    font-size: 36px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 16px;
    letter-spacing: -0.5px;
  }

  .page-subtitle {
    font-size: 16px;
    color: #64748b;
    margin: 0 0 40px;
  }

  .search-wrapper {
    max-width: 600px;
    margin: 0 auto;

    .hero-search-input {
      :deep(.el-input__wrapper) {
        border-radius: 12px;
        padding: 4px 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;

        &:hover,
        &.is-focus {
          box-shadow: 0 8px 30px rgba(64, 158, 255, 0.12);
          border-color: #409eff;
        }
      }

      :deep(.el-input__inner) {
        height: 50px;
        font-size: 16px;
      }

      .search-icon {
        font-size: 20px;
        color: #94a3b8;
      }
    }
  }
}

.container {
  width: 90%;
  max-width: 1440px;
  margin: -40px auto 40px; // 向上负边距，产生层叠感
  position: relative;
  z-index: 10;
}

.market-layout {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

/* 侧边栏 */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;

  .sidebar-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
      0 2px 4px -1px rgba(0, 0, 0, 0.03);
    overflow: hidden;
    margin-bottom: 20px;
  }

  .sidebar-header {
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;

    .sidebar-title {
      font-size: 16px;
      font-weight: 600;
      color: #334155;
    }
  }

  .category-list {
    padding: 12px;
  }

  .category-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    margin-bottom: 4px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: #64748b;

    &:hover {
      background-color: #f8fafc;
      color: #409eff;
    }

    &.active {
      background-color: #eff6ff;
      color: #409eff;
      font-weight: 500;

      .cat-count {
        background-color: #fff;
        color: #409eff;
      }
    }

    .cat-name {
      font-size: 14px;
    }

    .cat-count {
      font-size: 12px;
      background-color: #f1f5f9;
      padding: 2px 8px;
      border-radius: 12px;
      color: #94a3b8;
      transition: all 0.2s;
    }
  }

  .feedback-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    padding: 16px 20px;
    border-radius: 16px;
    text-decoration: none;
    color: #64748b;
    font-size: 14px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    border: 1px solid transparent;

    &:hover {
      color: #409eff;
      border-color: #bfdbfe;
      transform: translateY(-2px);
    }

    .feedback-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

/* 内容区域 */
.content {
  flex: 1;
  min-width: 0;
}

.filter-bar {
  background: #fff;
  border-radius: 16px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 16px;

  .filter-left {
    .result-count {
      font-size: 14px;
      color: #64748b;

      b {
        color: #0f172a;
        font-weight: 600;
      }
    }
  }

  .filter-right {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;

    .filter-group {
      display: flex;
      align-items: center;
      gap: 12px;

      .filter-label {
        font-size: 14px;
        color: #64748b;
      }
    }
  }
}

.empty-state {
  background: #fff;
  border-radius: 16px;
  padding: 60px 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Element Plus 覆盖样式 */
:deep(.el-radio-button__inner) {
  border: none;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 6px;
  padding: 6px 16px;
  margin-right: 8px;
  font-size: 13px;
  box-shadow: none !important;
  transition: all 0.2s;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: none;
  border-radius: 6px;
}
:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 6px;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #409eff;
  color: #fff;
  box-shadow: 0 2px 5px rgba(64, 158, 255, 0.3) !important;
}

/* 移动端适配 */
@media screen and (max-width: 992px) {
  .container {
    margin-top: 20px;
  }

  .market-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    position: relative;
    top: 0;

    .category-list {
      display: flex;
      overflow-x: auto;
      padding-bottom: 12px;

      .category-item {
        flex-shrink: 0;
        margin-right: 8px;
        margin-bottom: 0;
        background: #f8fafc;
        border: 1px solid #f1f5f9;

        &.active {
          background: #eff6ff;
          border-color: #bfdbfe;
        }
      }
    }
  }

  .filter-bar {
    flex-direction: column;
    align-items: flex-start;

    .filter-right {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }
}
</style>
