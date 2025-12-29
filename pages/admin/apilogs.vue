<script setup>
import { Search, Document, Menu } from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()

// 控制左侧边栏显示隐藏
// 获取页面宽度
const screenWidth = ref(0)
const isSidebarShow = ref(true)
const iscontrolShow = ref(false)
const isoverlay = ref(false)
onMounted(() => {
  screenWidth.value = document.body.clientWidth
  document.body.style.overflow = ''

  if (screenWidth.value < 768) {
    iscontrolShow.value = true
    isSidebarShow.value = false
  }
})

const handleSidebarShow = () => {
  isSidebarShow.value = !isSidebarShow.value
  iscontrolShow.value = !iscontrolShow.value
  isoverlay.value = !isoverlay.value
  // 禁止页面滑动
  if (isSidebarShow.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

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
  async (newValue, oldValue) => {
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
      searchId.value === ''
    ) {
      await getData()
    } else {
      await handleSearch(newValue)
    }
    setTimeout(() => {
      pageLoading.value = false
    }, 300)
  }
)

const loading = ref(false)
const tableData = ref([])

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

  res.data.logs.forEach((element, key) => {
    res.data.logs[key].key = key + 1
    res.data.logs[key].timestamp = new Date(element.timestamp).toLocaleString()
    // 提取URL中的信息
    const parts = res.data.logs[key].url.split(' ')
    res.data.logs[key].method = parts[0]

    const pathAndParams = parts[1].split('clientIP=')
    // 如果最右侧为?则移除
    if (pathAndParams[0].endsWith('?')) {
      pathAndParams[0] = pathAndParams[0].slice(0, -1)
    }
    // 如果最右侧为&则移除
    if (pathAndParams[0].endsWith('&')) {
      pathAndParams[0] = pathAndParams[0].slice(0, -1)
    }
    res.data.logs[key].path = pathAndParams[0]
  })

  tableData.value = res.data.logs
  maxPage.value = res.data.max_page_count
}

// 禁用时间
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

const handleSearchTime = async (sPage) => {
  // 如果没有任何筛选条件，则返回错误
  if (
    searchTime.value === undefined &&
    !searchIp.value &&
    !searchAliasValue.value &&
    !searchStatusCode.value
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

  const res = await $myFetch('ApiLogList', { params })

  if (res.code !== 200) {
    $msg(res.msg, 'error')
    tableData.value = []
    maxPage.value = 1
    return false
  }

  res.data.logs.forEach((element, key) => {
    res.data.logs[key].key = key + 1
    res.data.logs[key].timestamp = new Date(element.timestamp).toLocaleString()
    // 提取URL中的信息
    const parts = res.data.logs[key].url.split(' ')
    res.data.logs[key].method = parts[0]

    const pathAndParams = parts[1].split('clientIP=')
    // 移除右侧字符串
    res.data.logs[key].path = pathAndParams[0].slice(0, -1)

    // 直接使用API返回的ua字段，不再从URL中解析
    // const uaArr = res.data.logs[key].url.split('=')
    // res.data.logs[key].ua = uaArr[uaArr.length - 1]
  })

  tableData.value = res.data.logs
  maxPage.value = res.data.max_page_count
  if (page.value != sPage) {
    pageLock.value = true
    page.value = sPage
  }
}

const handleSearchId = async () => {
  if (searchId.value.length != 24) {
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
    tableData.value = []
    return false
  }

  res.data.key = 1
  res.data.timestamp = new Date(res.data.timestamp).toLocaleString()
  // 提取URL中的信息
  const parts = res.data.url.split(' ')
  res.data.method = parts[0]

  const pathAndParams = parts[1].split('clientIP=')
  // 移除右侧字符串
  res.data.path = pathAndParams[0].slice(0, -1)

  // 直接使用API返回的ua字段，不再从URL中解析
  // const uaArr = res.data.url.split('=')
  // res.data.ua = uaArr[uaArr.length - 1]

  pageLock.value = true
  tableData.value = [res.data]
  maxPage.value = 1
  page.value = 1
}

const handleSearch = async (page) => {
  if (searchId.value == '') {
    handleSearchTime(page)
  } else {
    handleSearchId()
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

// 接口搜索相关变量
const searchApiData = ref([])
const searchApiOldValue = ref('')

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
  const formattedData = res.data.map((item) => {
    return {
      value: item.name, // 显示名称
      alias: item.alias, // 保存真实的alias值用于搜索
    }
  })

  searchApiOldValue.value = queryString
  searchApiData.value = formattedData
  cb(searchApiData.value)
}

// 处理接口名称选择
const handleSearchSelect = (item) => {
  searchAliasValue.value = item.alias // 保存选中项的alias值用于搜索
}

const handleReset = () => {
  getData()
  searchTime.value = undefined
  searchId.value = ''
  searchIp.value = ''
  searchAlias.value = ''
  searchAliasValue.value = ''
  searchStatusCode.value = ''
  searchApiOldValue.value = ''
}
useHead({
  title: '接口日志',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="container">
    <AdminSidebar v-show="isSidebarShow"></AdminSidebar>

    <div class="right">
      <!-- 遮罩层 -->
      <div class="overlay" v-show="isoverlay" @click="handleSidebarShow"></div>
      <!-- 侧边栏控制按钮 -->
      <div class="control-sidebar" v-show="iscontrolShow">
        <el-icon @click="handleSidebarShow"><Menu /></el-icon>
      </div>
      <AdminHeader></AdminHeader>
      <div class="apilogs-container" v-loading="loading">
        <div class="logs-card">
          <!-- 搜索区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Document />
              </el-icon>
              <span class="title">接口日志</span>
            </div>
            <div class="header-right">
              <el-pagination
                v-model:page-size="pageSize"
                :page-sizes="[100, 200, 300, 400]"
                :pager-count="11"
                :page-count="maxPage"
                v-model:current-page="page"
                :disabled="pageLoading"
                size="small"
                background
                layout="sizes, prev, pager, next, jumper"
                @size-change="getData"
              />
            </div>
          </div>

          <!-- 搜索工具栏 -->
          <div class="search-toolbar">
            <div class="search-row">
              <div class="search-input id-search">
                <span class="label">请求ID：</span>
                <el-input
                  v-model="searchId"
                  placeholder="请输入请求ID"
                  clearable
                >
                  <template #prefix>
                    <el-icon>
                      <Search />
                    </el-icon>
                  </template>
                </el-input>
              </div>
            </div>
            <div class="search-items">
              <div class="date-picker">
                <span class="label">选择时间：</span>
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
              <div class="search-input">
                <el-input
                  v-model="searchIp"
                  placeholder="请输入IP地址"
                  clearable
                >
                  <template #prefix>
                    <el-icon>
                      <Search />
                    </el-icon>
                  </template>
                </el-input>
              </div>
              <div class="search-input">
                <el-autocomplete
                  v-model="searchAlias"
                  :fetch-suggestions="querySearchAsync"
                  placeholder="请输入接口名称"
                  clearable
                  class="full-width"
                  @select="handleSearchSelect"
                >
                  <template #prefix>
                    <el-icon>
                      <Search />
                    </el-icon>
                  </template>
                </el-autocomplete>
              </div>
              <div class="search-input">
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
              <div class="search-buttons">
                <el-button type="primary" @click="handleSearch(1)"
                  >查询</el-button
                >
                <el-button @click="handleReset">重置</el-button>
              </div>
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
                <el-table-column
                  prop="response_time"
                  label="响应时间"
                  width="90"
                />
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
                <el-table-column
                  prop="timestamp"
                  label="请求时间"
                  width="180"
                />
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
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  background: #f5f7fa;

  .right {
    width: 100%;
    min-width: 0;
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 998;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }
    .control-sidebar {
      position: absolute;
      width: 35px;
      height: 35px;
      top: 10px;
      left: 10px;
      z-index: 9999;
      text-align: center;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      .el-icon {
        margin-top: 10px;
        font-size: 16px;
      }
    }
    .apilogs-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .logs-card {
        width: 100%;
        border-radius: 12px;
        margin: 0 auto;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
          margin-bottom: 16px;

          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;

            .icon {
              font-size: 20px;
              color: #4b5563;
            }

            .title {
              font-size: 16px;
              font-weight: 600;
              color: #1a1f36;
            }
          }
        }

        .search-toolbar {
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
          padding: 20px 24px;
          margin-bottom: 16px;

          .search-row {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px dashed #e2e8f0;

            .id-search {
              display: flex;
              align-items: center;
              width: 100%;

              .label {
                color: #374151;
                font-size: 14px;
                margin-right: 8px;
                white-space: nowrap;
              }

              .el-input {
                flex: 1;
              }
            }
          }

          .search-items {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;

            .date-picker {
              display: flex;
              align-items: center;
              gap: 8px;

              .label {
                color: #374151;
                font-size: 14px;
              }
            }

            .search-input {
              width: 220px;

              :deep(.el-autocomplete) {
                width: 100%;
              }

              .full-width {
                width: 100%;
              }
            }

            .search-buttons {
              display: flex;
              gap: 8px;
            }
          }
        }

        .table-container {
          padding: 24px;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

          :deep(.el-table) {
            border: none;

            .el-table__header-wrapper {
              th {
                background: #f8fafc;
                color: #1f2937;
                font-weight: 600;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 1200px) {
  .container .right .apilogs-container {
    padding: 16px;

    .logs-card {
      .search-toolbar {
        .search-items {
          gap: 12px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .container .right .apilogs-container {
    padding: 12px;

    .logs-card {
      .search-toolbar {
        padding: 16px;

        .search-items {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;

          .search-input {
            width: 100%;
          }

          .search-buttons {
            justify-content: flex-end;
          }
        }
      }
    }
  }
}
</style>
