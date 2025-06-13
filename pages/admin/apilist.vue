<script setup>
import { Connection, Plus, Menu } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()
const msg = $msg

// 当前页数
const page = ref(1)
// 总记录
const totalRecords = ref(50)
// 页数loading
const pageLoading = ref(false)

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
    pageLoading.value = true
    await getData()
    setTimeout(() => {
      pageLoading.value = false
    }, 300)
  }
)

const loading = ref(false)
const tableData = ref([])
const search = ref('')

const getData = async () => {
  const res = await $myFetch('ApiList', {
    params: {
      page: page.value,
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
}

onMounted(() => {
  getData()
})

const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.name.toLowerCase().includes(search.value.toLowerCase()) ||
      data.alias.toLowerCase().includes(search.value.toLowerCase())
  )
)

const handleEdit = (index, row) => {
  navigateTo('/admin/apiset/' + row.id)
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

const handleOpen = async (index, row) => {
  loading.value = true

  const { data: res } = await $myFetch('ApiOpen', {
    params: {
      id: row.id,
    },
  })

  await getData()

  loading.value = false
}

// 修改接口状态
const handleStateChange = async (row) => {
  loading.value = true

  const bodyValue = new URLSearchParams()
  bodyValue.append('id', row.id)
  bodyValue.append('name', row.name)
  bodyValue.append('alias', row.alias)
  bodyValue.append('description', row.description)
  bodyValue.append('keywords', row.keywords)
  bodyValue.append('url', row.url)
  bodyValue.append('method', row.method)
  bodyValue.append('categoryId', row.categoryId)
  bodyValue.append('oldCategoryId', row.categoryId)
  bodyValue.append('example', row.example || '')
  bodyValue.append('exampleUrl', row.example_url || '')
  bodyValue.append('prefix', row.prefix)
  bodyValue.append('state', row.state === '启用' ? '关闭' : '启用')
  bodyValue.append('keyState', row.keyState)

  const res = await $myFetch('ApiUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    row.state = row.state === '启用' ? '关闭' : '启用'
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }

  loading.value = false
}

const handleKeyStateChange = async (row) => {
  loading.value = true

  const bodyValue = new URLSearchParams()
  bodyValue.append('id', row.id)
  bodyValue.append('name', row.name)
  bodyValue.append('alias', row.alias)
  bodyValue.append('description', row.description)
  bodyValue.append('keywords', row.keywords)
  bodyValue.append('url', row.url)
  bodyValue.append('method', row.method)
  bodyValue.append('categoryId', row.categoryId)
  bodyValue.append('oldCategoryId', row.categoryId)
  bodyValue.append('example', row.example || '')
  bodyValue.append('exampleUrl', row.example_url || '')
  bodyValue.append('prefix', row.prefix)
  bodyValue.append('state', row.state)
  bodyValue.append('keyState', row.keyState === '开启' ? '关闭' : '开启')

  const res = await $myFetch('ApiUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    row.keyState = row.keyState === '开启' ? '关闭' : '开启'
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
                :data="filterTableData"
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
                      @click="handleStateChange(scope.row)"
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
                <el-table-column prop="category" label="分类" width="100" />
                <el-table-column prop="keyState" label="Key验证" width="90">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.keyState === '开启' ? 'warning' : 'info'"
                      size="small"
                      style="cursor: pointer"
                      @click="handleKeyStateChange(scope.row)"
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
                  :page-size="15"
                  :pager-count="5"
                  :total="totalRecords"
                  v-model:current-page="page"
                  :disabled="pageLoading"
                  background
                  layout="prev, pager, next"
                />
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
        max-width: 1400px;
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
