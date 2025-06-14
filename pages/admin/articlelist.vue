<script setup>
import { Search, Menu } from '@element-plus/icons-vue'
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

const tableData = ref([])
const search = ref('')

// 当前页数
const page = ref(1)
// 总页数
const totalPages = ref(1)
// 总记录
const totalRecords = ref(50)
// 页数loading
const pageLoading = ref(false)

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

const getData = async () => {
  const res = await $myFetch('ArticleList', {
    params: {
      page: page.value,
    },
  })

  if (res.code !== 200) {
    return
  }

  res.data.list.forEach((element, key) => {
    if (element.status === '1') {
      res.data.list[key].status = '开启'
    } else if (element.status === '2') {
      res.data.list[key].status = '关闭'
    } else {
      res.data.list[key].status = '草稿'
    }

    res.data.list[key].create_time = new Date(
      Number(element.create_time)
    ).toLocaleString()

    res.data.list[key].update_time = new Date(
      Number(element.update_time)
    ).toLocaleString()
  })

  tableData.value = res.data.list
  totalPages.value = res.data.totalPages
  totalRecords.value = res.data.totalRecords
}

onMounted(() => {
  getData()
})

// 搜索框
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.title.toLowerCase().includes(search.value.toLowerCase()) ||
      data.content.toLowerCase().includes(search.value.toLowerCase())
  )
)

// 编辑
const handleEdit = async (index, row) => {
  navigateTo('/admin/articleset/' + row.id)
}

// 删除用户按钮
const handleDelete = async (index, row) => {
  const res = await $myFetch('DeleteArticle', {
    params: {
      id: row.id,
    },
  })

  $msg(res.msg, 'success')
  await getData()
}

// 导入文章
const importArticleUrl = ref('')
const dialogVisible = ref(false)
const username = useCookie('username')

const importArticle = async () => {
  dialogVisible.value = false

  const res = await $myFetch('ImportArticle', {
    params: {
      url: importArticleUrl.value,
      username: username.value,
    },
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }

  await getData()
}

// 添加状态标签类型判断函数
const getStatusType = (status) => {
  switch (status) {
    case '开启':
      return 'success'
    case '关闭':
      return 'danger'
    default:
      return 'info'
  }
}

useHead({
  title: '文章列表',
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
      <div class="articlelist-container">
        <div class="article-card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <span class="title">文章列表</span>
            </div>
            <div class="header-right">
              <el-button
                type="primary"
                @click="navigateTo('/admin/createarticle')"
              >
                <span>新增文章</span>
              </el-button>
              <el-button type="success" @click="dialogVisible = true">
                <span>导入文章</span>
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
                        <template #prefix>
                          <el-icon>
                            <Search />
                          </el-icon>
                        </template>
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
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="author" label="作者" width="100" />
                <el-table-column
                  prop="title"
                  label="文章标题"
                  min-width="200"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="keywords"
                  label="关键词"
                  width="200"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="create_time"
                  label="发布时间"
                  width="180"
                />
                <el-table-column
                  prop="update_time"
                  label="修改时间"
                  width="180"
                />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="getStatusType(scope.row.status)"
                      size="small"
                    >
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination">
                <el-pagination
                  :page-size="25"
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

          <!-- 导入文章对话框 -->
          <el-dialog
            v-model="dialogVisible"
            title="导入文章"
            width="500px"
            destroy-on-close
          >
            <el-form label-width="90px">
              <el-form-item label="文章URL" required>
                <el-input
                  v-model="importArticleUrl"
                  placeholder="请输入文章URL"
                />
              </el-form-item>
            </el-form>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="importArticle"
                  >确定</el-button
                >
              </div>
            </template>
          </el-dialog>
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
    .articlelist-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .article-card {
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
            display: flex;
            gap: 12px;

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

// 对话框样式
:deep(.el-dialog) {
  border-radius: 12px;

  .el-dialog__header {
    margin: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #eaecf0;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1f36;
    }
  }

  .el-dialog__body {
    padding: 24px;

    .el-form-item__label {
      font-weight: 500;
      color: #374151;
    }

    .el-input__wrapper {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      border: 1px solid #d1d5db;
      border-radius: 6px;

      &:hover {
        border-color: #9ca3af;
      }

      &.is-focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #eaecf0;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        padding: 8px 16px;
        font-weight: 500;
        min-width: 80px;
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container .right .articlelist-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .articlelist-container {
    padding: 12px;
  }
}
</style>
