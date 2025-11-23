<script setup>
import { Connection, Plus, Menu } from '@element-plus/icons-vue'
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
  }
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
  }
)

const tableData = ref([])
const search = ref('')

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
      Number(element.create_time)
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
        Number(element.create_time)
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

// 修改接口状态
const handleToggle = async (row, field) => {
  loading.value = true

  const nextState =
    field === 'state' ? (row.state === '启用' ? '关闭' : '启用') : row.state
  const nextKeyState =
    field === 'keyState'
      ? row.keyState === '开启'
        ? '关闭'
        : '开启'
      : row.keyState

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
      <div class="apilist-container" v-loading="loading">
        <div class="api-card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Connection />
              </el-icon>
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
                <el-table-column width="160" fixed="right">
                  <template #header>
                    <div class="search-wrapper">
                      <el-input v-model="search" placeholder="搜索" clearable>
                      </el-input>
                    </div>
                  </template>
                  <template #default="scope">
                    <div class="table-actions">
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
                      :type="scope.row.state === '启用' ? 'success' : 'danger'"
                      size="small"
                      style="cursor: pointer"
                      @click="handleToggle(scope.row, 'state')"
                    >
                      {{ scope.row.state }}
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
                <el-table-column prop="uname" label="创建人" width="100" />
                <el-table-column
                  label="分类"
                  min-width="160"
                  show-overflow-tooltip
                >
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
                      :type="scope.row.keyState === '开启' ? 'warning' : 'info'"
                      size="small"
                      style="cursor: pointer"
                      @click="handleToggle(scope.row, 'keyState')"
                    >
                      {{ scope.row.keyState }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="create_time"
                  label="创建时间"
                  width="180"
                />
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
    .apilist-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .api-card {
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

          .header-right {
            .el-button {
              display: flex;
              align-items: center;
              gap: 6px;
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
            gap: 4px;
            margin: 0;
            padding: 0;
          }

          .pagination {
            margin-top: 24px;
            display: flex;
            justify-content: flex-end;

            .search-info {
              display: flex;
              align-items: center;
              color: #606266;
              font-size: 14px;

              .search-count {
                color: #409eff;
                font-weight: bold;
                margin: 0 5px;
              }
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container .right .apilist-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .apilist-container {
    padding: 12px;
  }
}
</style>
