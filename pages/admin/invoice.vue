<script setup>
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const { $msg } = useNuxtApp()

// 标签页状态
const activeName = ref('apply')

// 加载状态
const loading = ref(false)

// === 索取发票数据 ===
// 按明细数据
const applyData = ref([
  {
    id: 'ORD202310010001',
    amount: 199.0,
    create_time: '2023-10-01 10:23:00',
    type: '消费',
    status: '可开票',
  },
  {
    id: 'ORD202310150002',
    amount: 500.0,
    create_time: '2023-10-15 14:30:00',
    type: '充值',
    status: '可开票',
  },
])

const selectedApply = ref([])
const totalApplyAmount = computed(() => {
  return selectedApply.value
    .reduce((sum, item) => sum + item.amount, 0)
    .toFixed(2)
})

const handleSelectionChange = (val) => {
  selectedApply.value = val
}

// === 开票记录数据 ===
const recordsData = ref([
  {
    id: 'INV202310200001',
    amount: 699.0,
    title: '广州某某科技有限公司',
    type: '增值税电子普通发票',
    status: '已开具',
    create_time: '2023-10-20 16:00:00',
  },
])

const showInvoiceRecordDetail = (row) => {
  navigateTo(`/admin/invoicedetail/${row.id}`)
}

// === 发票抬头数据 ===
const infoData = ref([
  {
    id: 1,
    title: '广州某某科技有限公司',
    tax_id: '91440101MA59XXXXXX',
    type: '企业',
    is_default: true,
  },
])

const invoiceTitleDialogVisible = ref(false)
const invoiceTitleSubmitting = ref(false)
const invoiceTitleFormRef = ref()
const invoiceTitleForm = reactive({
  title: '',
  type: '企业',
  tax_id: '',
  is_default: false,
})

const validateTaxId = (rule, value, callback) => {
  if (invoiceTitleForm.type === '企业' && !String(value || '').trim()) {
    callback(new Error('请输入纳税人识别号'))
    return
  }
  callback()
}

const invoiceTitleRules = {
  title: [{ required: true, message: '请输入发票抬头', trigger: 'blur' }],
  type: [{ required: true, message: '请选择抬头类型', trigger: 'change' }],
  tax_id: [{ validator: validateTaxId, trigger: 'blur' }],
}

const resetInvoiceTitleForm = () => {
  invoiceTitleForm.title = ''
  invoiceTitleForm.type = '企业'
  invoiceTitleForm.tax_id = ''
  invoiceTitleForm.is_default = false
  invoiceTitleFormRef.value?.clearValidate?.()
}

const openInvoiceTitleDialog = () => {
  resetInvoiceTitleForm()
  invoiceTitleDialogVisible.value = true
}

const handleInvoiceTitleTypeChange = () => {
  if (invoiceTitleForm.type === '个人') {
    invoiceTitleForm.tax_id = ''
  }
  invoiceTitleFormRef.value?.clearValidate?.('tax_id')
}

const submitInvoiceTitle = async () => {
  if (!invoiceTitleFormRef.value) return

  try {
    await invoiceTitleFormRef.value.validate()
  } catch {
    return
  }

  invoiceTitleSubmitting.value = true
  try {
    if (invoiceTitleForm.is_default) {
      infoData.value.forEach((item) => {
        item.is_default = false
      })
    }

    const nextId = Math.max(0, ...infoData.value.map((item) => item.id)) + 1
    infoData.value.push({
      id: nextId,
      title: invoiceTitleForm.title.trim(),
      type: invoiceTitleForm.type,
      tax_id:
        invoiceTitleForm.type === '企业' ? invoiceTitleForm.tax_id.trim() : '',
      is_default: invoiceTitleForm.is_default,
    })

    invoiceTitleDialogVisible.value = false
    $msg('发票抬头新增成功', 'success')
  } finally {
    invoiceTitleSubmitting.value = false
  }
}

// 模拟获取数据
const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

onMounted(() => {
  fetchData()
})

useHead({
  title: '发票管理',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="invoice-container">
    <div class="invoice-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <span class="title">发票管理</span>
        </div>
        <span class="header-meta">开票金额需满 100 元</span>
      </div>

      <!-- 内容区域 -->
      <div class="card-content">
        <el-tabs
          v-model="activeName"
          class="invoice-tabs"
          @tab-change="fetchData"
        >
          <!-- 索取发票 -->
          <el-tab-pane label="索取发票" name="apply">
            <div class="tab-pane-content" v-loading="loading">
              <el-alert
                title="温馨提示：当前仅支持按消费明细申请发票。电子发票开具后将发送至您的邮箱，纸质发票将通过快递寄送。开票金额需满100元。"
                type="info"
                show-icon
                :closable="false"
                class="invoice-alert"
              />

              <div class="action-bar">
                <div class="action-left">
                  <span class="selected-info">
                    已选金额：<span class="amount"
                      >¥{{ totalApplyAmount }}</span
                    >
                  </span>
                  <el-button
                    type="primary"
                    :disabled="selectedApply.length === 0"
                  >
                    下一步
                  </el-button>
                </div>
                <div class="action-right">
                  <el-date-picker
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    class="date-range"
                  />
                  <el-button type="primary">
                    <el-icon><Search /></el-icon>
                    查询
                  </el-button>
                </div>
              </div>

              <el-table
                :data="applyData"
                @selection-change="handleSelectionChange"
                class="invoice-table"
                style="width: 100%"
                empty-text="暂无可开票明细"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="订单号/流水号" width="180" />
                <el-table-column prop="type" label="业务类型" width="100" />
                <el-table-column
                  prop="create_time"
                  label="交易时间"
                  width="180"
                />
                <el-table-column prop="amount" label="可开票金额" width="150">
                  <template #default="scope">
                    <span class="table-amount"
                      >¥{{ scope.row.amount.toFixed(2) }}</span
                    >
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态">
                  <template #default="scope">
                    <el-tag type="success" size="small">{{
                      scope.row.status
                    }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination">
                <el-pagination
                  background
                  layout="total, prev, pager, next"
                  :total="applyData.length"
                />
              </div>
            </div>
          </el-tab-pane>

          <!-- 开票记录 -->
          <el-tab-pane label="开票记录" name="records">
            <div class="tab-pane-content" v-loading="loading">
              <div class="action-bar action-bar--right">
                <el-input
                  placeholder="请输入发票流水号/抬头"
                  class="search-input"
                >
                  <template #append>
                    <el-button :icon="Search" />
                  </template>
                </el-input>
              </div>

              <el-table
                :data="recordsData"
                class="invoice-table"
                style="width: 100%"
                empty-text="暂无开票记录"
              >
                <el-table-column prop="id" label="发票流水号" width="180" />
                <el-table-column
                  prop="title"
                  label="发票抬头"
                  show-overflow-tooltip
                />
                <el-table-column prop="type" label="发票类型" width="160" />
                <el-table-column prop="amount" label="开票金额" width="120">
                  <template #default="scope">
                    <span class="table-amount"
                      >¥{{ scope.row.amount.toFixed(2) }}</span
                    >
                  </template>
                </el-table-column>
                <el-table-column
                  prop="create_time"
                  label="申请时间"
                  width="180"
                />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag type="success" size="small">{{
                      scope.row.status
                    }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="scope">
                    <el-button
                      type="primary"
                      link
                      @click="showInvoiceRecordDetail(scope.row)"
                      >查看详情</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination">
                <el-pagination
                  background
                  layout="total, prev, pager, next"
                  :total="recordsData.length"
                />
              </div>
            </div>
          </el-tab-pane>

          <!-- 发票信息管理 -->
          <el-tab-pane label="发票信息管理" name="info">
            <div class="tab-pane-content" v-loading="loading">
              <div class="action-bar action-bar--left">
                <el-button type="primary" @click="openInvoiceTitleDialog">
                  <el-icon><Plus /></el-icon>
                  新增发票抬头
                </el-button>
              </div>

              <el-table
                :data="infoData"
                class="invoice-table"
                style="width: 100%"
                empty-text="暂无发票抬头"
              >
                <el-table-column prop="title" label="发票抬头" />
                <el-table-column prop="type" label="抬头类型" width="120">
                  <template #default="scope">
                    <el-tag size="small">{{ scope.row.type }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="tax_id" label="纳税人识别号">
                  <template #default="scope">
                    {{ scope.row.tax_id || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="默认抬头" width="100">
                  <template #default="scope">
                    <el-tag
                      v-if="scope.row.is_default"
                      type="warning"
                      size="small"
                      >默认</el-tag
                    >
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default>
                    <el-button type="primary" link :icon="Edit">编辑</el-button>
                    <el-button type="danger" link :icon="Delete"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-dialog
      v-model="invoiceTitleDialogVisible"
      title="新增发票抬头"
      width="520px"
      class="invoice-title-dialog"
      @closed="resetInvoiceTitleForm"
    >
      <el-form
        ref="invoiceTitleFormRef"
        :model="invoiceTitleForm"
        :rules="invoiceTitleRules"
        label-width="110px"
        class="invoice-title-form"
      >
        <el-form-item label="抬头类型" prop="type">
          <el-radio-group
            v-model="invoiceTitleForm.type"
            @change="handleInvoiceTitleTypeChange"
          >
            <el-radio-button value="企业">企业</el-radio-button>
            <el-radio-button value="个人">个人</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发票抬头" prop="title">
          <el-input
            v-model="invoiceTitleForm.title"
            maxlength="80"
            show-word-limit
            placeholder="请输入发票抬头"
          />
        </el-form-item>
        <el-form-item
          v-if="invoiceTitleForm.type === '企业'"
          label="纳税人识别号"
          prop="tax_id"
        >
          <el-input
            v-model="invoiceTitleForm.tax_id"
            maxlength="32"
            placeholder="请输入纳税人识别号"
          />
        </el-form-item>
        <el-form-item label="默认抬头">
          <el-switch v-model="invoiceTitleForm.is_default" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="invoiceTitleDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="invoiceTitleSubmitting"
            @click="submitInvoiceTitle"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.invoice-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.invoice-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 16px 20px;
}

.card-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: flex-start;
}

.header-left .title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.header-meta {
  position: absolute;
  top: 0;
  right: 0;
  padding: 3px 8px;
  background: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 4px;
  font-size: 12px;
  color: #e6a23c;
  white-space: nowrap;
}

.card-content {
  min-width: 0;
}

.invoice-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tabs__item) {
    color: #606266;
    font-weight: 500;
  }

  :deep(.el-tabs__item.is-active) {
    color: #409eff;
  }
}

.tab-pane-content {
  min-height: 260px;
}

.invoice-alert {
  margin-bottom: 16px;
  border-radius: 8px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.action-bar--left {
  justify-content: flex-start;
}

.action-bar--right {
  justify-content: flex-end;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.selected-info {
  font-size: 14px;
  color: #606266;

  .amount {
    color: #f56c6c;
    font-size: 18px;
    font-weight: 600;
    margin-left: 5px;
  }
}

.date-range {
  width: 260px;
}

.search-input {
  width: 280px;
}

.invoice-table {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;

  :deep(.el-table__header th) {
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }

  :deep(.el-table__row:hover > td.el-table__cell) {
    background: #f5f7fa;
  }
}

.table-amount {
  color: #f56c6c;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.invoice-title-form {
  padding: 4px 4px 0 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.invoice-title-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    margin-right: 0;
    padding: 18px 20px 14px;
    border-bottom: 1px solid #ebeef5;
  }

  .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .el-dialog__body {
    padding: 20px 20px 8px;
  }

  .el-dialog__footer {
    padding: 12px 20px 18px;
  }
}

@media screen and (max-width: 768px) {
  .invoice-container {
    padding: 12px;
  }

  .invoice-card {
    padding: 14px;
  }

  .card-header {
    position: static;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .header-meta {
    position: static;
    white-space: normal;
  }

  .action-bar,
  .action-left,
  .action-right {
    align-items: stretch;
    flex-direction: column;
  }

  .date-range,
  .search-input {
    width: 100%;
  }

  .pagination {
    justify-content: flex-start;
    overflow-x: auto;
  }

  :deep(.invoice-title-dialog) {
    width: calc(100vw - 24px) !important;

    .el-dialog__body {
      padding: 16px 16px 4px;
    }
  }

  .invoice-title-form {
    :deep(.el-form-item) {
      display: block;
    }

    :deep(.el-form-item__label) {
      justify-content: flex-start;
      width: 100% !important;
      margin-bottom: 6px;
    }

    :deep(.el-form-item__content) {
      margin-left: 0 !important;
    }
  }
}
</style>
