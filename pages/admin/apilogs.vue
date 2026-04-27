<script setup>
import { Search } from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()
const { isAdmin } = useRouteAccess()

definePageMeta({
  layout: 'admin',
})

// 当前页数
const page = ref(1)
const pageLock = ref(false)
// 总记录
const maxPage = ref(50)
// 页数loading
const pageLoading = ref(false)
// 每页显示条数
const pageSize = ref(100)

// 监听页数变化
watch(
  () => page.value,
  async (newValue) => {
    const currentSearchUserId =
      searchInputUserId.value.trim() || searchUserId.value

    if (pageLock.value === true) {
      pageLock.value = false
      return false
    }
    pageLoading.value = true

    if (
      searchTime.value === undefined &&
      !searchIp.value &&
      !searchAliasValue.value &&
      !searchStatusCode.value &&
      !currentSearchUserId &&
      searchId.value === ''
    ) {
      await getData()
    } else {
      await handleSearch(newValue)
    }
    setTimeout(() => {
      pageLoading.value = false
    }, 300)
  },
)

const loading = ref(false)
const tableData = ref([])

// 统计数据
const callStats = ref({
  day1: 0,
  day3: 0,
  day7: 0,
  month1: 0,
})
const topApis = ref([])

const topApiCards = computed(() => {
  const cards = topApis.value.slice(0, 5).map((api) => ({
    ...api,
    placeholder: false,
  }))

  while (cards.length < 5) {
    cards.push({
      name: '',
      count: '',
      placeholder: true,
    })
  }

  return cards
})

const applyStats = (callStat = {}) => {
  callStats.value = {
    day1: callStat.day_1 || 0,
    day3: callStat.day_3 || 0,
    day7: callStat.day_7 || 0,
    month1: callStat.day_30 || 0,
  }
}

const applyTopApis = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    topApis.value = []
    return
  }

  topApis.value = items.slice(0, 5).map((item) => ({
    name: item.name,
    count: item.count,
  }))
}

const formatPath = (url = '') => {
  const parts = url.split(' ')
  const path = parts[1]?.split('clientIP=')[0] || ''
  return path.replace(/[?&]$/, '')
}

const formatLogs = (logs = []) =>
  logs.map((item, index) => ({
    ...item,
    key: index + 1,
    timestamp: new Date(item.timestamp).toLocaleString(),
    method: item.url?.split(' ')[0] || '',
    path: formatPath(item.url),
  }))

const applyListData = (data = {}) => {
  applyStats(data.call_stat)
  applyTopApis(data.top_apis)
  tableData.value = formatLogs(data.logs || [])
  maxPage.value = data.max_page_count || 1
}

const getData = async () => {
  const res = await $myFetch('ApiLogList', {
    params: {
      page: page.value,
      size: pageSize.value,
    },
  })

  if (res.code !== 200) {
    $msg(res.msg, 'error')
    tableData.value = []
    maxPage.value = 1
    return
  }

  applyListData(res.data)
}

// 禁用时间
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

const handleSearchTime = async (sPage) => {
  const currentSearchUserId = searchInputUserId.value.trim() || searchUserId.value

  // 如果没有任何筛选条件，则返回错误
  if (
    searchTime.value === undefined &&
    !searchIp.value &&
    !searchAliasValue.value &&
    !searchStatusCode.value &&
    !currentSearchUserId
  ) {
    $msg('请至少选择一项筛选条件', 'error')
    return false
  }

  const params = {
    page: sPage,
    size: pageSize.value,
  }

  // 添加时间筛选条件
  if (searchTime.value) {
    params.startTime = searchTime.value[0]
    params.endTime = searchTime.value[1]
  }

  // 添加其他筛选条件
  if (searchIp.value) {
    params.client_ip = searchIp.value
  }

  if (searchAliasValue.value) {
    params.alias = searchAliasValue.value
  }

  if (searchStatusCode.value) {
    params.status_code = searchStatusCode.value
  }

  if (isAdmin.value && currentSearchUserId) {
    params.uid = currentSearchUserId
  }

  const res = await $myFetch('ApiLogList', { params })

  if (res.code !== 200) {
    $msg(res.msg, 'error')
    tableData.value = []
    maxPage.value = 1
    return false
  }

  applyListData(res.data)

  if (page.value !== sPage) {
    pageLock.value = true
    page.value = sPage
  }
}

const handleSearchId = async () => {
  if (searchId.value.length !== 24) {
    $msg('请输入正确的请求ID', 'warning')
    return false
  }
  const res = await $myFetch('ApiLogId', {
    params: {
      id: searchId.value,
    },
  })

  if (res.code !== 200) {
    $msg(res.msg, 'error')
    tableData.value = []
    return false
  }

  pageLock.value = true
  tableData.value = formatLogs([res.data])
  maxPage.value = 1
  page.value = 1
}

const handleSearch = async (currentPage) => {
  if (searchId.value === '') {
    await handleSearchTime(currentPage)
  } else {
    await handleSearchId()
  }
}

onMounted(() => {
  getData()
})

const searchTime = ref()
const searchId = ref('')
const searchIp = ref('')
const searchAlias = ref('')
const searchAliasValue = ref('')
const searchStatusCode = ref('')
const searchUser = ref('')
const searchUserId = ref('')
const searchInputUserId = ref('')
const isUsernameSearchDisabled = computed(() => !!searchInputUserId.value.trim())
const isUserIdSearchDisabled = computed(
  () => !!searchUser.value || !!searchUserId.value,
)

// 接口搜索相关变量
const searchApiData = ref([])
const searchApiOldValue = ref('')
const searchUserData = ref([])
const searchUserOldValue = ref('')

// 接口名称搜索
const querySearchAsync = async (queryString, cb) => {
  if (queryString === '') {
    searchAlias.value = ''
    searchAliasValue.value = ''
    cb([])
    return false
  }

  if (queryString === searchApiOldValue.value) {
    cb(searchApiData.value)
    return false
  }

  const res = await $myFetch('ApiSearch', {
    params: {
      keyword: queryString,
    },
  })

  if (res.code !== 200) {
    $msg(res.msg, 'error')
    cb([])
    return
  }

  // 遍历数据，显示name，但保存alias用于搜索
  const formattedData = res.data.map((item) => ({
    value: item.name,
    alias: item.alias,
  }))

  searchApiOldValue.value = queryString
  searchApiData.value = formattedData
  cb(searchApiData.value)
}

// 处理接口名称选择
const handleSearchSelect = (item) => {
  searchAliasValue.value = item.alias
}

watch(searchAlias, (newValue) => {
  if (!newValue) {
    searchAliasValue.value = ''
    return
  }

  const selectedItem = searchApiData.value.find(
    (item) => item.value === newValue,
  )
  if (!selectedItem) {
    searchAliasValue.value = ''
  }
})

const queryUserSearchAsync = async (queryString, cb) => {
  const keyword = queryString.trim()

  if (!isAdmin.value || keyword === '' || isUsernameSearchDisabled.value) {
    searchUser.value = ''
    searchUserId.value = ''
    cb([])
    return false
  }

  if (queryString === searchUserOldValue.value) {
    cb(searchUserData.value)
    return false
  }

  const res = await $myFetch('UserList', {
    params: {
      page: 1,
      limit: 10,
      keyword,
    },
  })

  if (res.code !== 200) {
    $msg(res.msg, 'error')
    cb([])
    return
  }

  const formattedData = (res.data.userList || []).map((item) => ({
    value: `${item.username} (#${item.id})`,
    id: item.id,
    username: item.username,
  }))

  searchUserOldValue.value = queryString
  searchUserData.value = formattedData
  cb(searchUserData.value)
}

const handleUserSearchSelect = (item) => {
  searchInputUserId.value = ''
  searchUser.value = item.value
  searchUserId.value = item.id
}

watch(searchUser, (newValue) => {
  if (!newValue) {
    searchUserId.value = ''
    return
  }

  const selectedItem = searchUserData.value.find(
    (item) => item.value === newValue,
  )
  if (!selectedItem) {
    searchUserId.value = ''
  }
})

watch(searchInputUserId, (newValue) => {
  const digitsOnly = String(newValue || '').replace(/\D+/g, '')
  if (digitsOnly !== newValue) {
    searchInputUserId.value = digitsOnly
    return
  }

  if (!newValue.trim()) {
    return
  }

  searchUser.value = ''
  searchUserId.value = ''
  searchUserOldValue.value = ''
  searchUserData.value = []
})

const handleReset = () => {
  searchTime.value = undefined
  searchId.value = ''
  searchIp.value = ''
  searchAlias.value = ''
  searchAliasValue.value = ''
  searchStatusCode.value = ''
  searchUser.value = ''
  searchUserId.value = ''
  searchInputUserId.value = ''
  searchApiOldValue.value = ''
  searchApiData.value = []
  searchUserOldValue.value = ''
  searchUserData.value = []
  pageLock.value = true
  page.value = 1
  getData()
}

useHead({
  title: '接口日志',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="apilogs-page" v-loading="loading">
    <section class="overview-panel">
      <div class="panel-heading compact">
        <div class="panel-title">接口日志</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-label">近1天调用</div>
          <div class="stat-card-value">{{ callStats.day1 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">近3天调用</div>
          <div class="stat-card-value">{{ callStats.day3 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">近7天调用</div>
          <div class="stat-card-value">{{ callStats.day7 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">近30天调用</div>
          <div class="stat-card-value">{{ callStats.month1 }}</div>
        </div>
      </div>

      <div class="top-api-panel">
        <div class="top-api-title">前五接口</div>
        <div class="top-api-list">
          <div
            v-for="(api, index) in topApiCards"
            :key="index"
            :class="['top-api-item', { 'is-placeholder': api.placeholder }]"
          >
            <span class="top-api-rank">{{ index + 1 }}</span>
            <div class="top-api-content">
              <template v-if="api.placeholder">
                <div class="top-api-name-placeholder"></div>
                <div class="top-api-count-placeholder"></div>
              </template>
              <template v-else>
                <div class="top-api-name">{{ api.name }}</div>
                <div class="top-api-count">{{ api.count }} 次</div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="filter-panel">
      <div class="panel-heading">
        <div class="panel-title">筛选条件</div>
      </div>

      <div class="search-id-row">
        <div class="search-id-main">
          <div class="filter-label">请求ID</div>
          <el-input v-model="searchId" placeholder="请输入请求ID" clearable>
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="search-id-actions">
          <div class="filter-label filter-label--ghost">操作</div>
          <el-button type="primary" @click="handleSearchId">查询ID</el-button>
        </div>
      </div>

      <div class="filter-grid">
        <div class="filter-item filter-item--time">
          <div class="filter-label">时间范围</div>
          <el-date-picker
            v-model="searchTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="起始时间"
            end-placeholder="结束时间"
            :disabled-date="disabledDate"
            value-format="x"
          />
        </div>

        <div class="filter-item">
          <div class="filter-label">客户端IP</div>
          <el-input v-model="searchIp" placeholder="请输入IP地址" clearable>
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-item">
          <div class="filter-label">接口名称</div>
          <el-autocomplete
            v-model="searchAlias"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入接口名称"
            clearable
            @select="handleSearchSelect"
          >
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-autocomplete>
        </div>

        <div v-if="isAdmin" class="filter-item">
          <div class="filter-label">用户名</div>
          <el-autocomplete
            v-model="searchUser"
            :fetch-suggestions="queryUserSearchAsync"
            placeholder="请输入用户名"
            clearable
            :disabled="isUsernameSearchDisabled"
            @select="handleUserSearchSelect"
          >
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-autocomplete>
        </div>

        <div v-if="isAdmin" class="filter-item">
          <div class="filter-label">用户ID</div>
          <el-input
            v-model="searchInputUserId"
            placeholder="请输入用户ID"
            clearable
            :disabled="isUserIdSearchDisabled"
            inputmode="numeric"
          >
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-item">
          <div class="filter-label">状态码</div>
          <el-input
            v-model="searchStatusCode"
            placeholder="请输入状态码"
            clearable
          >
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-item filter-item--actions">
          <div class="filter-label filter-label--ghost">操作</div>
          <div class="panel-actions">
            <el-button type="primary" @click="handleSearch(1)">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </div>
    </section>

    <section class="table-panel">
      <div class="panel-heading">
        <div class="panel-title">日志明细</div>
        <div class="table-toolbar">
          <span class="toolbar-chip">本页 {{ tableData.length }} 条</span>
          <span class="toolbar-chip">总页数 {{ maxPage }}</span>
        </div>
      </div>

      <div class="table-wrapper">
        <client-only>
          <el-table
            :data="tableData"
            style="width: 100%"
            v-loading="pageLoading"
          >
            <el-table-column prop="key" label="序号" width="60" />
            <el-table-column
              prop="id"
              label="请求ID"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              prop="uid"
              label="用户ID"
              width="100"
              show-overflow-tooltip
            />
            <el-table-column
              prop="username"
              label="用户名"
              width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="alias"
              label="接口名称"
              width="120"
              show-overflow-tooltip
            />
            <el-table-column prop="method" label="请求方法" width="90">
              <template #default="scope">
                <el-tag
                  :type="scope.row.method === 'GET' ? 'success' : 'warning'"
                  size="small"
                >
                  {{ scope.row.method }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="path"
              label="请求路径"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column prop="response_time" label="响应时间" width="90" />
            <el-table-column prop="status_code" label="状态码" width="80">
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
            <el-table-column prop="client_ip" label="IP" width="140" />
            <el-table-column
              prop="address"
              label="归属地"
              width="130"
              show-overflow-tooltip
            />
            <el-table-column prop="timestamp" label="请求时间" width="180" />
            <el-table-column
              prop="ua"
              label="User Agent"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="referer"
              label="来源"
              min-width="180"
              show-overflow-tooltip
            />
          </el-table>
        </client-only>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:page-size="pageSize"
          :page-sizes="[100, 200, 300, 400]"
          :pager-count="5"
          :page-count="maxPage"
          v-model:current-page="page"
          :disabled="pageLoading"
          size="small"
          background
          layout="sizes, prev, pager, next, jumper"
          @size-change="getData"
        />
      </div>
    </section>
  </div>
</template>

<style lang="less" scoped>
.apilogs-page {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.overview-panel,
.filter-panel,
.table-panel {
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-heading.compact {
  margin-bottom: 12px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.3;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  min-width: 0;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #edf1f5;
  background: #fafbfc;
}

.stat-card-label {
  margin-bottom: 8px;
  font-size: 12px;
  color: #6b7280;
}

.stat-card-value {
  color: #111827;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.panel-actions,
.table-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  font-size: 12px;
  font-weight: 500;
}

.top-api-panel {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #eef2f7;
}

.top-api-title {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.top-api-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.top-api-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  border: 1px solid #edf1f5;
  border-radius: 8px;
  background: #fafbfc;
}

.top-api-item.is-placeholder {
  border-style: dashed;
  background: #fbfcfe;
}

.top-api-item.is-placeholder .top-api-rank {
  background: #eef2f7;
  color: #94a3b8;
}

.top-api-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #e5edf9;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.top-api-content {
  flex: 1;
  min-width: 0;
}

.top-api-name {
  color: #111827;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-api-count {
  margin-top: 2px;
  color: #6b7280;
  font-size: 12px;
}

.top-api-name-placeholder,
.top-api-count-placeholder {
  border-radius: 999px;
  background: #e9eef5;
}

.top-api-name-placeholder {
  width: 76%;
  height: 14px;
}

.top-api-count-placeholder {
  width: 42%;
  height: 12px;
  margin-top: 8px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px 12px;
}

.search-id-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eef2f7;
}

.search-id-main {
  min-width: 0;
}

.search-id-actions {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.filter-item {
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
}

.filter-item--time {
  grid-column: span 2;
}

.filter-item--actions {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.filter-label {
  margin-bottom: 6px;
  color: #4b5563;
  font-size: 12px;
  font-weight: 500;
}

.filter-label--ghost {
  opacity: 0;
  pointer-events: none;
}

.filter-item {
  :deep(.el-input),
  :deep(.el-autocomplete),
  :deep(.el-date-editor) {
    width: 100%;
  }
}

.filter-panel {
  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-range-editor.el-input__wrapper) {
    box-shadow: none;
    border: 1px solid #e5e7eb;
    background: #fff;
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-range-editor.el-input__wrapper:hover) {
    border-color: #d1d5db;
  }
}

.filter-panel {
  :deep(.el-input__wrapper) {
    padding: 1px 11px;
  }

  :deep(.el-range-editor.el-input__wrapper) {
    padding: 1px 11px;
  }
}

.table-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

:deep(.el-table) {
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: #f8fbff;
  border: none;
}

:deep(.el-table__inner-wrapper::before) {
  display: none;
}

:deep(.el-table th.el-table__cell) {
  color: #374151;
  font-weight: 600;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

@media screen and (max-width: 1200px) {
  .apilogs-page {
    padding: 20px;
  }

  .panel-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid,
  .filter-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .top-api-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filter-item--time {
    grid-column: span 2;
  }

  .filter-item--actions {
    grid-column: span 4;
  }
}

@media screen and (max-width: 768px) {
  .apilogs-page {
    padding: 12px;
  }

  .overview-panel,
  .filter-panel,
  .table-panel {
    padding: 14px;
  }

  .stats-grid,
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .top-api-list {
    grid-template-columns: 1fr;
  }

  .filter-item--time,
  .filter-item--actions {
    grid-column: span 1;
  }

  .search-id-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .search-id-actions :deep(.el-button) {
    width: 100%;
  }

  .stat-card-value {
    font-size: clamp(20px, 6vw, 28px);
  }

  .panel-actions {
    width: 100%;
    justify-content: stretch;
  }

  .panel-actions :deep(.el-button) {
    flex: 1;
    margin-left: 0;
  }

  .table-toolbar {
    width: 100%;
  }

  .pagination-container {
    justify-content: center;
  }

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 10px;
  }
}
</style>
