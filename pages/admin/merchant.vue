<script setup>
import { Shop, Search, Filter } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const loading = ref(false)
const tableData = ref([])
const search = ref('')
const statusFilter = ref('') // 状态筛选：空字符串表示全部

// 状态选项（审核页面只显示待审核和已拒绝）
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待审核', value: 0 },
  { label: '已拒绝', value: 2 },
]

// 分页相关
const page = ref(1)
const totalPages = ref(1)
const totalRecords = ref(0)
const pageLoading = ref(false)
const pageSize = ref(25)

// 审核弹窗相关
const reviewDialogVisible = ref(false)
const reviewForm = ref({
  id: 0,
  name: '',
  action: '', // approve 或 reject
  remark: '',
})

// 打开审核弹窗
const handleReview = (row, action) => {
  reviewForm.value = {
    id: row.id,
    name: row.name,
    action: action,
    remark: '',
  }
  reviewDialogVisible.value = true
}

// 提交审核
const submitReview = async () => {
  loading.value = true
  try {
    const apiBodyValue = new URLSearchParams()
    apiBodyValue.append('id', reviewForm.value.id)
    apiBodyValue.append('status', reviewForm.value.action === 'approve' ? 1 : 2)
    apiBodyValue.append('remark', reviewForm.value.remark)

    const res = await $myFetch('ReviewMerchant', {
      method: 'POST',
      body: apiBodyValue,
    })

    if (res.code === 200) {
      $msg(res.msg || '审核操作成功', 'success')
      reviewDialogVisible.value = false
      getData()
    } else {
      $msg(res.msg || '审核操作失败', 'error')
    }
  } catch (error) {
    $msg('审核操作失败', 'error')
  } finally {
    loading.value = false
  }
}

const getData = async () => {
  pageLoading.value = true
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value,
    }
    // 只在有值时添加参数
    if (search.value) {
      params.keyword = search.value
    }
    if (statusFilter.value !== '') {
      params.status = statusFilter.value
    }

    const res = await $myFetch('MerchantList', { params })

    if (res.code === 200) {
      const list = res.data?.list || []
      // 审核页面只显示待审核(0)和已拒绝(2)状态
      const filteredList = list.filter(
        (item) => item.status === 0 || item.status === 2
      )
      tableData.value = filteredList.map((item) => ({
        id: item.id,
        name: item.merchant_name,
        enterprise_name: item.company_name,
        credit_code: item.credit_code,
        contact: item.contact_name,
        phone: item.contact_phone,
        email: item.contact_email,
        description: item.description,
        status: item.status,
        ip: item.ip,
        create_time: new Date(item.created_at).toLocaleString(),
      }))
      totalRecords.value = res.data?.total || 0
      totalPages.value = Math.ceil(totalRecords.value / pageSize.value)
    } else {
      tableData.value = []
      totalRecords.value = 0
    }
  } catch (error) {
    console.error(error)
    $msg('获取数据失败', 'error')
  } finally {
    pageLoading.value = false
  }
}

onMounted(() => {
  getData()
})

// 搜索
const handleSearch = () => {
  page.value = 1
  getData()
}

// 监听搜索输入防抖
const debouncedSearch = ref(null)
watch(search, () => {
  if (debouncedSearch.value) clearTimeout(debouncedSearch.value)
  debouncedSearch.value = setTimeout(() => {
    handleSearch()
  }, 500)
})

// 监听状态筛选变化
watch(statusFilter, () => {
  page.value = 1
  getData()
})

// 删除商户
const handleDelete = async (row) => {
  loading.value = true
  try {
    const res = await $myFetch('MerchantDelete', {
      params: { id: row.id },
    })

    if (res.code === 200) {
      $msg(res.msg || '删除成功', 'success')
      getData()
    } else {
      $msg(res.msg || '删除失败', 'error')
    }
  } catch (error) {
    $msg('删除失败', 'error')
  } finally {
    loading.value = false
  }
}

// 状态文本转换
const getStatusText = (status) => {
  switch (Number(status)) {
    case 0:
      return '待审核'
    case 1:
      return '已通过'
    case 2:
      return '已拒绝'
    default:
      return '未知'
  }
}

// 状态标签类型
const getStatusType = (status) => {
  switch (Number(status)) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return 'info'
  }
}

// 监听页码变化
watch(page, () => {
  getData()
})

watch(pageSize, () => {
  page.value = 1
  getData()
})

useHead({
  title: '商户审核',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="merchant-container" v-loading="loading">
    <div class="merchant-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon"><Shop /></el-icon>
          <span class="title">商户审核</span>
        </div>
        <div class="header-right">
          <el-input
            v-model="search"
            placeholder="搜索商户/企业/联系人/电话/邮箱"
            clearable
            style="width: 280px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="statusFilter"
            placeholder="状态筛选"
            style="width: 120px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column
              prop="name"
              label="商户名称"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="enterprise_name"
              label="企业名称"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column
              prop="credit_code"
              label="信用代码"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column prop="contact" label="联系人" width="100" />
            <el-table-column prop="phone" label="联系电话" width="130" />
            <el-table-column
              prop="email"
              label="邮箱"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              prop="description"
              label="合作意向"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column prop="ip" label="申请IP" width="130" />
            <el-table-column prop="create_time" label="申请时间" width="170" />
            <el-table-column
              prop="status"
              label="状态"
              width="90"
              fixed="right"
            >
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" width="180" label="操作">
              <template #default="scope">
                <div class="table-actions">
                  <template v-if="scope.row.status === 0">
                    <el-button
                      type="success"
                      link
                      @click="handleReview(scope.row, 'approve')"
                    >
                      通过
                    </el-button>
                    <el-button
                      type="warning"
                      link
                      @click="handleReview(scope.row, 'reject')"
                    >
                      拒绝
                    </el-button>
                  </template>
                  <el-popconfirm
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    title="确定要删除此申请吗？"
                    @confirm="handleDelete(scope.row)"
                  >
                    <template #reference>
                      <el-button type="danger" link>删除</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="page"
              v-model:page-size="pageSize"
              :page-sizes="[10, 25, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalRecords"
              :disabled="pageLoading"
              background
            />
          </div>
        </client-only>
      </div>
    </div>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      :title="reviewForm.action === 'approve' ? '审核通过' : '审核拒绝'"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form :model="reviewForm" label-width="90px">
        <el-form-item label="商户名称">
          <span>{{ reviewForm.name }}</span>
        </el-form-item>
        <el-form-item label="审核操作">
          <el-tag
            :type="reviewForm.action === 'approve' ? 'success' : 'danger'"
            size="large"
          >
            {{ reviewForm.action === 'approve' ? '通过审核' : '拒绝申请' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="审核备注" v-if="reviewForm.action === 'reject'">
          <el-input
            v-model="reviewForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请填写拒绝原因..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button
            :type="reviewForm.action === 'approve' ? 'success' : 'danger'"
            @click="submitReview"
            :loading="loading"
          >
            确认{{ reviewForm.action === 'approve' ? '通过' : '拒绝' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.merchant-container {
  position: relative;
  min-height: 100vh;
  padding: 24px;
  display: flex;
  justify-content: center;
  background: #f5f7fa;

  .merchant-card {
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
        display: flex;
        align-items: center;
        gap: 12px;
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

      .table-actions {
        display: flex;
        gap: 4px;
        margin: 0;
        padding: 0;
      }

      .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
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

    .el-input__wrapper,
    .el-textarea__inner {
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
  .merchant-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .merchant-container {
    padding: 12px;
  }
}
</style>
