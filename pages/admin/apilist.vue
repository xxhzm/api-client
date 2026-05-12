<script setup>
import { Plus, View } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()
const msg = $msg
const route = useRoute()

// 当前页数
const page = ref(1)
// 每页条数
const pageSize = ref(50)
// 总页数
const totalPages = ref(1)
// 总记录
const totalRecords = ref(50)
// 页数loading
const pageLoading = ref(false)
// 搜索状态
const isSearching = ref(false)
// 初始化阶段标记，避免初次赋值触发不必要刷新
const initializing = ref(true)

definePageMeta({
  layout: 'admin',
})

// 监听页数变化
watch(
  () => page.value,
  async (newValue) => {
    // 初始化阶段或搜索中不刷新
    if (initializing.value) {
      return
    }
    // 如果是搜索状态，不需要重新请求，因为搜索结果没有分页
    if (isSearching.value) {
      return
    }

    pageLoading.value = true
    await getData()
    setTimeout(() => {
      pageLoading.value = false
    }, 300)
  },
)

const loading = ref(false)
// 监听每页条数变化：重置到第一页并刷新数据
watch(
  () => pageSize.value,
  async () => {
    // 初始化阶段或搜索中不刷新
    if (initializing.value) {
      return
    }
    if (isSearching.value) {
      return
    }
    // 显示分页loading
    pageLoading.value = true
    if (page.value !== 1) {
      // 非第一页，修改页码触发页数watch来请求数据
      page.value = 1
    } else {
      // 已是第一页，直接刷新数据
      await getData()
      setTimeout(() => {
        pageLoading.value = false
      }, 300)
    }
  },
)

const tableData = ref([])
const search = ref('')

const createDefaultCallStats = () => ({
  hour_1: 0,
  hour_3: 0,
  hour_24: 0,
  day_7: 0,
  day_30: 0,
  day_90: 0,
  year_1: 0,
})

const callDialogVisible = ref(false)
const callDialogLoading = ref(false)
const currentCallApi = ref(null)
const customCallTime = ref()
const callStatsData = ref({
  fixed: createDefaultCallStats(),
  custom: null,
})
const callLogLoading = ref(false)
const callLogData = ref([])
const callLogPage = ref(1)
const callLogPageSize = ref(10)
const callLogMaxPage = ref(1)
const activeCallLogRange = ref(null)

const callStatCards = computed(() => [
  { label: '近1小时', value: callStatsData.value.fixed?.hour_1 || 0 },
  { label: '近3小时', value: callStatsData.value.fixed?.hour_3 || 0 },
  { label: '近24小时', value: callStatsData.value.fixed?.hour_24 || 0 },
  { label: '近7天', value: callStatsData.value.fixed?.day_7 || 0 },
  { label: '近30天', value: callStatsData.value.fixed?.day_30 || 0 },
  { label: '近90天', value: callStatsData.value.fixed?.day_90 || 0 },
  { label: '近1年', value: callStatsData.value.fixed?.year_1 || 0 },
])

const disabledFutureDate = (time) => time.getTime() > Date.now()

const formatCallCount = (value) => Number(value || 0).toLocaleString()

const formatLogPath = (url = '') => {
  const parts = url.split(' ')
  const path = parts[1]?.split('clientIP=')[0] || ''
  return path.replace(/[?&]$/, '')
}

const formatCallLogs = (logs = []) =>
  logs.map((item, index) => ({
    ...item,
    key: (callLogPage.value - 1) * callLogPageSize.value + index + 1,
    timestamp: item.timestamp
      ? new Date(item.timestamp).toLocaleString()
      : '-',
    method: item.url?.split(' ')[0] || '',
    path: formatLogPath(item.url),
  }))

const formatCustomRange = (custom) => {
  if (!custom?.start_time || !custom?.end_time) {
    return ''
  }

  return `${new Date(custom.start_time).toLocaleString()} 至 ${new Date(
    custom.end_time,
  ).toLocaleString()}`
}

const getMethodList = (method) => {
  return [...new Set(String(method || '')
    .split('|')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean))]
}

const getMethodTagType = (method) => {
  return method === 'GET' ? 'success' : 'warning'
}

const getData = async () => {
  const res = await $myFetch('ApiList', {
    params: {
      page: page.value,
      limit: pageSize.value,
    },
  })

  if (res.code !== 200) {
    return
  }

  res.data.list.forEach((element, key) => {
    res.data.list[key].create_time = new Date(
      Number(element.create_time),
    ).toLocaleString()
  })

  tableData.value = res.data.list
  totalRecords.value = res.data.count
  totalPages.value = Math.ceil(res.data.count / pageSize.value)
}

onMounted(async () => {
  const qp = Array.isArray(route.query.page)
    ? route.query.page[0]
    : route.query.page
  const p = parseInt(qp || '', 10)
  if (!isNaN(p) && p > 0) {
    page.value = p
  }
  const ql = Array.isArray(route.query.limit)
    ? route.query.limit[0]
    : route.query.limit
  const l = parseInt(ql || '', 10)
  if (!isNaN(l) && l > 0) {
    pageSize.value = l
  }
  await getData()
  initializing.value = false
})

// 搜索接口
const searchApi = async () => {
  if (!search.value.trim()) {
    isSearching.value = false
    await getData()
    return
  }

  pageLoading.value = true
  isSearching.value = true
  try {
    const res = await $myFetch('SearchAPI', {
      params: {
        keyword: search.value.trim(),
      },
    })

    if (res.code !== 200) {
      $msg(res.msg || '搜索失败', 'error')
      return
    }

    // 搜索结果是一个数组，不是对象
    const apiList = Array.isArray(res.data) ? res.data : []

    apiList.forEach((element, key) => {
      apiList[key].create_time = new Date(
        Number(element.create_time),
      ).toLocaleString()
    })

    tableData.value = apiList
    totalRecords.value = apiList.length
    totalPages.value = 1 // 搜索结果没有分页
    page.value = 1 // 重置到第一页
  } catch (error) {
    $msg('搜索失败', 'error')
  } finally {
    pageLoading.value = false
  }
}

// 监听搜索输入
const debouncedSearch = ref(null)
watch(search, (newValue) => {
  if (debouncedSearch.value) {
    clearTimeout(debouncedSearch.value)
  }

  if (!newValue.trim() && isSearching.value) {
    isSearching.value = false
    getData()
    return
  }

  debouncedSearch.value = setTimeout(() => {
    if (newValue.trim()) {
      searchApi()
    }
  }, 500)
})

// 清除搜索
const clearSearch = () => {
  search.value = ''
  isSearching.value = false
  getData()
}

const handleEdit = (index, row) => {
  navigateTo({
    path: '/admin/apiset/' + row.id,
    query: { page: page.value, limit: pageSize.value },
  })
}

const handleDelete = async (index, row) => {
  loading.value = true

  const res = await $myFetch('ApiDelete', {
    params: {
      id: row.id,
    },
  })

  await getData()

  loading.value = false
  msg('删除成功', 'success')
}

const fetchCallStats = async (row, range) => {
  if (!row?.id) {
    return
  }

  callDialogLoading.value = true
  const params = { id: row.id }
  if (Array.isArray(range) && range.length === 2) {
    params.startTime = range[0]
    params.endTime = range[1]
  }

  try {
    const res = await $myFetch('ApiCallStats', { params })
    if (res.code !== 200) {
      $msg(res.msg || '查询调用统计失败', 'error')
      return
    }

    callStatsData.value = {
      ...res.data,
      fixed: res.data?.fixed || createDefaultCallStats(),
      custom: res.data?.custom || null,
    }
  } catch (error) {
    $msg('查询调用统计失败', 'error')
  } finally {
    callDialogLoading.value = false
  }
}

const fetchCallLogs = async (row, range, pageNumber = callLogPage.value) => {
  if (!row?.alias) {
    callLogData.value = []
    callLogMaxPage.value = 1
    return
  }

  callLogLoading.value = true
  const params = {
    page: pageNumber,
    size: callLogPageSize.value,
    alias: row.alias,
  }

  if (Array.isArray(range) && range.length === 2) {
    params.startTime = range[0]
    params.endTime = range[1]
  }

  try {
    const res = await $myFetch('ApiLogList', { params })
    if (res.code !== 200) {
      callLogData.value = []
      callLogMaxPage.value = 1
      return
    }

    callLogPage.value = pageNumber
    callLogData.value = formatCallLogs(res.data?.logs || [])
    callLogMaxPage.value = res.data?.max_page_count || 1
  } catch (error) {
    callLogData.value = []
    callLogMaxPage.value = 1
  } finally {
    callLogLoading.value = false
  }
}

const handleViewCalls = async (index, row) => {
  currentCallApi.value = row
  customCallTime.value = undefined
  activeCallLogRange.value = null
  callLogPage.value = 1
  callLogPageSize.value = 10
  callLogMaxPage.value = 1
  callLogData.value = []
  callStatsData.value = {
    fixed: createDefaultCallStats(),
    custom: null,
  }
  callDialogVisible.value = true
  await Promise.all([fetchCallStats(row), fetchCallLogs(row, null, 1)])
}

const handleCustomCallSearch = async () => {
  if (!Array.isArray(customCallTime.value) || customCallTime.value.length !== 2) {
    $msg('请选择自定义时间范围', 'warning')
    return
  }

  activeCallLogRange.value = [...customCallTime.value]
  callLogPage.value = 1
  await Promise.all([
    fetchCallStats(currentCallApi.value, customCallTime.value),
    fetchCallLogs(currentCallApi.value, customCallTime.value, 1),
  ])
}

const clearCustomCallSearch = async () => {
  customCallTime.value = undefined
  activeCallLogRange.value = null
  callLogPage.value = 1
  await Promise.all([
    fetchCallStats(currentCallApi.value),
    fetchCallLogs(currentCallApi.value, null, 1),
  ])
}

const handleCallLogPageChange = async (currentPage) => {
  await fetchCallLogs(
    currentCallApi.value,
    activeCallLogRange.value,
    currentPage,
  )
}

const handleCallLogSizeChange = async (size) => {
  callLogPageSize.value = size
  callLogPage.value = 1
  await fetchCallLogs(currentCallApi.value, activeCallLogRange.value, 1)
}

// 修改接口状态
const handleToggle = async (row, field) => {
  loading.value = true

  const nextState = field === 'state' ? (row.state === 1 ? 0 : 1) : row.state
  const nextKeyState =
    field === 'keyState' ? (row.keyState === 1 ? 0 : 1) : row.keyState

  const bodyValue = new URLSearchParams()
  bodyValue.append('id', row.id)
  bodyValue.append('name', row.name)
  bodyValue.append('alias', row.alias)
  bodyValue.append('description', row.description)
  bodyValue.append('keywords', row.keywords)
  bodyValue.append('url', row.url)
  bodyValue.append('method', row.method)
  bodyValue.append('example', row.example || '')
  bodyValue.append('exampleUrl', row.example_url || '')
  bodyValue.append('prefix', row.prefix)
  bodyValue.append('state', nextState)
  bodyValue.append('keyState', nextKeyState)
  const categoryIds = Array.isArray(row.categories)
    ? row.categories.map((c) => c?.id).filter(Boolean)
    : []
  bodyValue.append('categoryId', categoryIds.join('|'))

  const res = await $myFetch('ApiUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    if (field === 'state') {
      row.state = nextState
    } else if (field === 'keyState') {
      row.keyState = nextKeyState
    }
    await (isSearching.value ? searchApi() : getData())
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }

  loading.value = false
}

useHead({
  title: '接口列表',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="apilist-container" v-loading="loading">
    <div class="api-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <span class="title">接口列表</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="navigateTo('/admin/createapi')">
            <el-icon>
              <Plus />
            </el-icon>
            <span>新增接口</span>
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <client-only>
          <el-table
            :data="tableData"
            style="width: 100%"
            v-loading="pageLoading"
          >
            <el-table-column width="200" fixed="right">
              <template #header>
                <div class="search-wrapper">
                  <el-input v-model="search" placeholder="搜索" clearable>
                  </el-input>
                </div>
              </template>
              <template #default="scope">
                <div class="table-actions">
                  <el-button
                    type="info"
                    link
                    @click="handleViewCalls(scope.$index, scope.row)"
                  >
                    <el-icon>
                      <View />
                    </el-icon>
                    查看调用
                  </el-button>
                  <el-button
                    type="primary"
                    link
                    @click="handleEdit(scope.$index, scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-popconfirm
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    title="确定要删除吗？"
                    @confirm="handleDelete(scope.$index, scope.row)"
                  >
                    <template #reference>
                      <el-button type="danger" link> 删除 </el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" width="50" />
            <el-table-column
              prop="name"
              label="接口名称"
              width="150"
              show-overflow-tooltip
            />
            <el-table-column
              prop="alias"
              label="别名"
              width="120"
              show-overflow-tooltip
            />
            <el-table-column prop="state" label="状态" width="80">
              <template #default="scope">
                <el-tag
                  :type="
                    scope.row.state === 1
                      ? 'success'
                      : scope.row.state === 2
                      ? 'info'
                      : 'danger'
                  "
                  size="small"
                  style="cursor: pointer"
                  @click="handleToggle(scope.row, 'state')"
                >
                  {{
                    scope.row.state === 1
                      ? '启用'
                      : scope.row.state === 2
                      ? '隐藏'
                      : '关闭'
                  }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="prefixUrl"
              label="前缀地址"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              prop="url"
              label="地址"
              width="80"
              show-overflow-tooltip
            />
            <el-table-column prop="method" label="请求方法" width="140">
              <template #default="scope">
                <div class="method-tags">
                  <el-tag
                    v-for="method in getMethodList(scope.row.method)"
                    :key="method"
                    :type="getMethodTagType(method)"
                    size="small"
                  >
                    {{ method }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="uname" label="创建人" width="100" />
            <el-table-column label="分类" min-width="160" show-overflow-tooltip>
              <template #default="scope">
                <span>
                  {{
                    Array.isArray(scope.row.categories)
                      ? scope.row.categories
                          .map((c) => c?.name)
                          .filter(Boolean)
                          .join('、')
                      : scope.row.category || '未分类'
                  }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="keyState" label="Key验证" width="90">
              <template #default="scope">
                <el-tag
                  :type="scope.row.keyState === 1 ? 'warning' : 'info'"
                  size="small"
                  style="cursor: pointer"
                  @click="handleToggle(scope.row, 'keyState')"
                >
                  {{ scope.row.keyState === 1 ? '开启' : '关闭' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="create_time" label="创建时间" width="180" />
            <el-table-column prop="count" label="调用次数" width="100" />
            <el-table-column
              prop="description"
              label="描述"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="keywords"
              label="接口关键词"
              min-width="200"
              show-overflow-tooltip
            />
          </el-table>

          <div class="pagination">
            <el-pagination
              v-if="!isSearching"
              v-model:page-size="pageSize"
              :page-sizes="[10, 15, 20, 50, 100]"
              :pager-count="5"
              :total="totalRecords"
              v-model:current-page="page"
              :disabled="pageLoading"
              background
              layout="total, sizes, prev, pager, next"
            />
            <div v-else class="search-info">
              共找到
              <span class="search-count">{{ totalRecords }}</span> 条结果
              <el-button type="primary" link @click="clearSearch"
                >返回全部</el-button
              >
            </div>
          </div>
        </client-only>
      </div>
    </div>

    <el-dialog
      v-model="callDialogVisible"
      :title="`调用统计 - ${currentCallApi?.name || ''}`"
      width="960px"
      class="api-call-dialog"
      destroy-on-close
    >
      <div class="api-call-dialog-body" v-loading="callDialogLoading">
        <div class="api-call-meta">
          <span>接口ID：{{ currentCallApi?.id || '-' }}</span>
          <span>别名：{{ currentCallApi?.alias || '-' }}</span>
        </div>

        <div class="api-call-stats-grid">
          <div
            v-for="item in callStatCards"
            :key="item.label"
            class="api-call-stat"
          >
            <div class="api-call-stat-label">{{ item.label }}</div>
            <div class="api-call-stat-value">
              {{ formatCallCount(item.value) }}
            </div>
          </div>
        </div>

        <div class="custom-call-panel">
          <div class="custom-call-header">
            <span>自定义时间</span>
            <span v-if="callStatsData.custom" class="custom-call-range">
              {{ formatCustomRange(callStatsData.custom) }}
            </span>
          </div>

          <div class="custom-call-controls">
            <el-date-picker
              v-model="customCallTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="起始时间"
              end-placeholder="结束时间"
              :disabled-date="disabledFutureDate"
              value-format="x"
            />
            <el-button type="primary" @click="handleCustomCallSearch">
              查询
            </el-button>
            <el-button @click="clearCustomCallSearch">清空</el-button>
          </div>

          <div v-if="callStatsData.custom" class="custom-call-result">
            <span>自定义时间调用次数</span>
            <strong>{{ formatCallCount(callStatsData.custom.count) }}</strong>
          </div>
        </div>

        <div class="call-log-panel">
          <div class="call-log-header">
            <div>
              <div class="call-log-title">日志明细</div>
              <div class="call-log-desc">
                {{ activeCallLogRange ? '当前自定义时间范围' : '最新调用记录' }}
              </div>
            </div>
            <span class="call-log-count">本页 {{ callLogData.length }} 条</span>
          </div>

          <div class="call-log-table">
            <el-table
              :data="callLogData"
              style="width: 100%"
              size="small"
              v-loading="callLogLoading"
              empty-text="暂无调用日志"
            >
              <el-table-column prop="key" label="序号" width="60" />
              <el-table-column
                prop="id"
                label="请求ID"
                min-width="170"
                show-overflow-tooltip
              />
              <el-table-column prop="uid" label="用户ID" width="82" />
              <el-table-column
                prop="username"
                label="用户名"
                width="110"
                show-overflow-tooltip
              />
              <el-table-column prop="method" label="方法" width="76">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.method === 'GET' ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ scope.row.method || '-' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="path"
                label="请求路径"
                min-width="180"
                show-overflow-tooltip
              />
              <el-table-column prop="response_time" label="响应" width="82" />
              <el-table-column prop="status_code" label="状态" width="76">
                <template #default="scope">
                  <el-tag
                    :type="
                      scope.row.status_code === 200
                        ? 'success'
                        : scope.row.status_code === 302 ||
                          scope.row.status_code === 301
                          ? 'primary'
                          : 'danger'
                    "
                    size="small"
                  >
                    {{ scope.row.status_code }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="client_ip" label="IP" width="130" />
              <el-table-column
                prop="timestamp"
                label="请求时间"
                width="170"
              />
            </el-table>
          </div>

          <div class="call-log-pagination">
            <el-pagination
              v-model:page-size="callLogPageSize"
              v-model:current-page="callLogPage"
              :page-sizes="[10, 20, 50]"
              :pager-count="5"
              :page-count="callLogMaxPage"
              :disabled="callLogLoading"
              size="small"
              background
              layout="sizes, prev, pager, next"
              @current-change="handleCallLogPageChange"
              @size-change="handleCallLogSizeChange"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="callDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.apilist-container {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;

  .api-card {
    width: 100%;
    padding: 16px 20px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .header-left {
        display: flex;
        align-items: flex-start;

        .title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }
      }

      .header-right {
        .el-button {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }

    .table-container {
      padding: 8px 0 0;

      :deep(.el-table) {
        border: none;

        .search-wrapper {
          padding: 0;
          margin: 0;
          line-height: 1;
        }

        .el-input {
          width: 140px;
          margin: 0;
        }

        .el-table__header-wrapper {
          th {
            background: #f8fafc;
            color: #1f2937;
            font-weight: 600;
          }
        }
      }

      .table-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        margin: 0;
        padding: 0;
        white-space: nowrap;

        .el-button {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: 0;
        }
      }

      .method-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .pagination {
        margin-top: 24px;
        display: flex;
        justify-content: flex-end;

        .search-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #606266;
          font-size: 14px;

          .search-count {
            color: #409eff;
            font-weight: 600;
          }
        }
      }
    }
  }
}

:global(.api-call-dialog) {
  border-radius: 8px;
  overflow: hidden;
  max-width: 92vw;
}

:global(.api-call-dialog .el-dialog__header) {
  margin: 0;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #ebeef5;
}

:global(.api-call-dialog .el-dialog__body) {
  padding: 20px;
  max-height: 78vh;
  overflow-y: auto;
}

:global(.api-call-dialog .el-dialog__footer) {
  padding: 12px 20px;
  background: #f8fafc;
  border-top: 1px solid #ebeef5;
}

.api-call-dialog-body {
  min-height: 240px;
}

.api-call-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 16px;
  color: #606266;
  font-size: 13px;
}

.api-call-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.api-call-stat {
  min-width: 0;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.api-call-stat-label {
  margin-bottom: 8px;
  color: #606266;
  font-size: 13px;
  line-height: 1.3;
}

.api-call-stat-value {
  color: #303133;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  word-break: break-all;
}

.custom-call-panel {
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.custom-call-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.custom-call-range {
  color: #909399;
  font-size: 12px;
  font-weight: 400;
  text-align: right;
}

.custom-call-controls {
  display: flex;
  align-items: center;
  gap: 10px;

  :deep(.el-date-editor) {
    flex: 1;
    min-width: 320px;
  }
}

.custom-call-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  color: #606266;

  strong {
    color: #303133;
    font-size: 20px;
  }
}

.call-log-panel {
  padding-top: 18px;
  margin-top: 18px;
  border-top: 1px solid #ebeef5;
}

.call-log-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.call-log-title {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.call-log-desc {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
  line-height: 1.3;
}

.call-log-count {
  flex: 0 0 auto;
  padding: 3px 8px;
  color: #606266;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.3;
}

.call-log-table {
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 8px;

  :deep(.el-table) {
    border: none;
  }

  :deep(.el-table__header-wrapper th) {
    background: #f8fafc;
    color: #1f2937;
    font-weight: 600;
  }
}

.call-log-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

@media screen and (max-width: 1200px) {
  .apilist-container {
    padding: 20px;
  }
}

@media screen and (max-width: 768px) {
  .apilist-container {
    padding: 12px;

    .api-card {
      padding: 14px;

      .card-header {
        flex-direction: column;
        gap: 12px;
      }
    }
  }

  .api-call-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .custom-call-header,
  .custom-call-controls {
    align-items: stretch;
    flex-direction: column;
  }

  .custom-call-range {
    text-align: left;
  }

  .custom-call-controls {
    :deep(.el-date-editor) {
      min-width: 0;
      width: 100%;
    }
  }

  .call-log-header {
    flex-direction: column;
  }

  .call-log-pagination {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 2px;
  }
}
</style>
