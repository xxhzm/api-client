<script setup>
import { Search } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const tableData = ref([])
const search = ref('')
const previewVisible = ref(false)
const previewLoading = ref(false)
const previewArticle = ref({})
const tableRef = ref(null)
const selectedRows = ref([])
const batchStatus = ref('')
const batchLoading = ref(false)

// 当前页数
const page = ref(1)
// 总页数
const totalPages = ref(1)
// 总记录
const totalRecords = ref(50)
// 每页数量
const pageSize = ref(25)
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
  },
)

const getData = async () => {
  const res = await $myFetch('ArticleList', {
    params: {
      page: page.value,
      limit: pageSize.value,
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
    } else if (element.status === '4') {
      res.data.list[key].status = '待审核'
    } else {
      res.data.list[key].status = '草稿'
    }

    res.data.list[key].create_time = new Date(
      Number(element.create_time),
    ).toLocaleString()

    res.data.list[key].update_time = new Date(
      Number(element.update_time),
    ).toLocaleString()
  })

  tableData.value = res.data.list
  totalPages.value = res.data.totalPages
  totalRecords.value = res.data.totalRecords
}

// 监听每页数量变化
watch(pageSize, async () => {
  page.value = 1
  pageLoading.value = true
  await getData()
  setTimeout(() => {
    pageLoading.value = false
  }, 300)
})

onMounted(() => {
  getData()
})

// 搜索框
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      (data.title || '').toLowerCase().includes(search.value.toLowerCase()) ||
      (data.content || '').toLowerCase().includes(search.value.toLowerCase()),
  ),
)

// 编辑
const handleEdit = async (index, row) => {
  navigateTo('/admin/articleset/' + row.id)
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const batchUpdateStatus = async () => {
  if (selectedRows.value.length === 0) {
    $msg('请选择文章', 'error')
    return
  }
  if (!batchStatus.value) {
    $msg('请选择状态', 'error')
    return
  }

  batchLoading.value = true

  const body = new URLSearchParams()
  body.append('ids', selectedRows.value.map((item) => item.id).join(','))
  body.append('status', batchStatus.value)

  const res = await $myFetch('BatchUpdateArticleStatus', {
    method: 'POST',
    body,
  })

  batchLoading.value = false

  if (res.code !== 200) {
    $msg(res.msg, 'error')
    return
  }

  $msg(res.msg, 'success')
  batchStatus.value = ''
  selectedRows.value = []
  tableRef.value?.clearSelection()
  await getData()
}

// 预览
const handlePreview = async (index, row) => {
  previewVisible.value = true
  previewLoading.value = true
  previewArticle.value = {}

  const res = await $myFetch('ArticleId', {
    params: {
      id: row.id,
    },
  })

  previewLoading.value = false

  if (res.code !== 200) {
    previewVisible.value = false
    $msg(res.msg, 'error')
    return
  }

  previewArticle.value = res.data || {}
}

const previewHtml = computed(() => {
  const article = previewArticle.value || {}
  const content = article.content || ''

  if (/<!doctype|<html[\s>]/i.test(content)) {
    return content
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${article.title || '文章预览'}</title>
  <style>
    body {
      margin: 0;
      padding: 32px;
      color: #1f2937;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.75;
      background: #fff;
    }
    img, video, iframe {
      max-width: 100%;
    }
    table {
      max-width: 100%;
      border-collapse: collapse;
    }
  </style>
</head>
<body>${content}</body>
</html>`
})

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
    case '待审核':
      return 'warning'
    default:
      return 'info'
  }
}

const getStatusLabel = (status) => {
  const map = {
    1: '开启',
    2: '关闭',
    3: '草稿',
    4: '待审核',
  }
  return map[status] || status || '未知'
}

// 获取分类名称
const getCategoryName = (type) => {
  const map = {
    1: '公共通知',
    2: '行业资讯',
    3: '产品动态',
    4: '解决方案',
  }
  return map[type] || '未知'
}

// 获取分类标签类型
const getCategoryTagType = (type) => {
  const map = {
    1: 'danger',
    2: 'info',
    3: 'primary',
    4: 'success',
  }
  return map[type] || ''
}

useHead({
  title: '文章列表',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="articlelist-container">
    <div class="article-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <span class="title">文章列表</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="navigateTo('/admin/createarticle')">
            <span>新增文章</span>
          </el-button>
          <el-button type="success" @click="dialogVisible = true">
            <span>导入文章</span>
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <div class="batch-toolbar">
          <div class="batch-info">已选择 {{ selectedRows.length }} 篇文章</div>
          <div class="batch-actions">
            <el-select
              v-model="batchStatus"
              placeholder="批量设置状态"
              clearable
              :disabled="selectedRows.length === 0 || batchLoading"
            >
              <el-option label="开启" value="1" />
              <el-option label="关闭" value="2" />
              <el-option label="草稿" value="3" />
              <el-option label="待审核" value="4" />
            </el-select>
            <el-button
              type="primary"
              :loading="batchLoading"
              :disabled="selectedRows.length === 0 || !batchStatus"
              @click="batchUpdateStatus"
            >
              批量修改
            </el-button>
          </div>
        </div>

        <client-only>
          <el-table
            ref="tableRef"
            :data="filterTableData"
            style="width: 100%"
            v-loading="pageLoading"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="48" />
            <el-table-column width="210" fixed="right">
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
                  <el-button
                    type="success"
                    link
                    @click="handlePreview(scope.$index, scope.row)"
                  >
                    预览
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
            <el-table-column prop="type" label="分类" width="120">
              <template #default="scope">
                <el-tag
                  :type="getCategoryTagType(scope.row.type)"
                  size="small"
                  effect="plain"
                >
                  {{ getCategoryName(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="keywords"
              label="关键词"
              width="200"
              show-overflow-tooltip
            />
            <el-table-column prop="create_time" label="发布时间" width="180" />
            <el-table-column prop="update_time" label="修改时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:page-size="pageSize"
              :page-sizes="[10, 25, 50, 100]"
              :pager-count="5"
              :total="totalRecords"
              v-model:current-page="page"
              :disabled="pageLoading"
              background
              layout="total, sizes, prev, pager, next, jumper"
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
            <el-input v-model="importArticleUrl" placeholder="请输入文章URL" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="importArticle">确定</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 文章预览对话框 -->
      <el-dialog
        v-model="previewVisible"
        title="文章预览"
        width="80%"
        top="5vh"
        destroy-on-close
        @closed="previewArticle = {}"
      >
        <div v-loading="previewLoading" class="article-preview">
          <template v-if="!previewLoading && previewArticle.id">
            <div class="preview-header">
              <h2>{{ previewArticle.title }}</h2>
              <div class="preview-meta">
                <el-tag
                  :type="getCategoryTagType(previewArticle.type)"
                  size="small"
                  effect="plain"
                >
                  {{ getCategoryName(previewArticle.type) }}
                </el-tag>
                <el-tag
                  :type="getStatusType(getStatusLabel(previewArticle.status))"
                  size="small"
                >
                  {{ getStatusLabel(previewArticle.status) }}
                </el-tag>
              </div>
              <p v-if="previewArticle.description" class="preview-desc">
                {{ previewArticle.description }}
              </p>
            </div>
            <iframe
              class="preview-frame"
              :srcdoc="previewHtml"
              sandbox=""
              title="文章预览"
            ></iframe>
          </template>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="less" scoped>
.articlelist-container {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;

  .article-card {
    width: 100%;
    padding: 16px 20px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    margin: 0 auto;

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
          line-height: 1.3;
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
      padding: 8px 0 0;

      .batch-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px;
        margin-bottom: 12px;
        background: #f8fafc;
        border: 1px solid #ebeef5;
        border-radius: 6px;

        .batch-info {
          color: #606266;
          font-size: 14px;
          white-space: nowrap;
        }

        .batch-actions {
          display: flex;
          align-items: center;
          gap: 10px;

          .el-select {
            width: 160px;
          }
        }
      }

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

      @media screen and (max-width: 768px) {
        .batch-toolbar {
          align-items: stretch;
          flex-direction: column;

          .batch-actions {
            align-items: stretch;
            flex-direction: column;

            .el-select {
              width: 100%;
            }
          }
        }

        .table-actions {
          flex-wrap: wrap;
        }
      }
    }
  }
}

.article-preview {
  min-height: 360px;

  .preview-header {
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    h2 {
      margin: 0 0 12px;
      font-size: 20px;
      line-height: 1.4;
      color: #1f2937;
      font-weight: 600;
    }

    .preview-meta {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .preview-desc {
      margin: 0;
      color: #606266;
      line-height: 1.7;
    }
  }

  .preview-frame {
    display: block;
    width: 100%;
    height: 60vh;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    background: #fff;
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
  .articlelist-container {
    padding: 20px;
  }
}

@media screen and (max-width: 768px) {
  .articlelist-container {
    padding: 12px;

    .article-card {
      padding: 14px;

      .card-header {
        flex-direction: column;
        gap: 12px;
      }
    }
  }
}
</style>
