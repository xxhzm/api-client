<script setup>
import { Document, Search, Plus, Edit, Delete } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

// 标签页状态
const activeName = ref('apply')
const applyMethod = ref('detail') // 开票方式：detail(明细), monthly(月度), amount(金额)

// 加载状态
const loading = ref(false)

// === 发票统计数据 ===
const invoiceStats = ref({
  available: 699.0,
  invoiced: 1200.0,
  invoicing: 300.0,
  refunding: 0.0,
})

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

// 按月度数据
const monthlyData = ref([
  { month: '2023-10', amount: 699.0, status: '可开票' },
  { month: '2023-09', amount: 1200.0, status: '可开票' },
])

const selectedApply = ref([])
const selectedMonthly = ref([])
const customAmount = ref('') // 自定义金额
const totalApplyAmount = computed(() => {
  if (applyMethod.value === 'detail') {
    return selectedApply.value
      .reduce((sum, item) => sum + item.amount, 0)
      .toFixed(2)
  } else if (applyMethod.value === 'monthly') {
    return selectedMonthly.value
      .reduce((sum, item) => sum + item.amount, 0)
      .toFixed(2)
  } else {
    return Number(customAmount.value || 0).toFixed(2)
  }
})

const handleSelectionChange = (val) => {
  if (applyMethod.value === 'detail') {
    selectedApply.value = val
  } else if (applyMethod.value === 'monthly') {
    selectedMonthly.value = val
  }
}

// 填充全部可开票金额
const fillAllAmount = () => {
  customAmount.value = invoiceStats.value.available.toFixed(2)
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

// 处理退票重开
const handleRefund = (row) => {
  if (confirm(`确定要将发票 [${row.id}] 退票并重新开具吗？`)) {
    $msg('已提交退票重开申请，请等待处理', 'success')
  }
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
    <!-- 发票统计模块 -->
    <div class="stats-row">
      <div class="stats-col">
        <div class="info-card">
          <div class="info-card__content">
            <h3 class="info-card__title">可开票金额</h3>
            <div class="info-card__value amount">
              ¥{{ invoiceStats.available.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
      <div class="stats-col">
        <div class="info-card">
          <div class="info-card__content">
            <h3 class="info-card__title">已开票</h3>
            <div class="info-card__value amount">
              ¥{{ invoiceStats.invoiced.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
      <div class="stats-col">
        <div class="info-card">
          <div class="info-card__content">
            <h3 class="info-card__title">开票中</h3>
            <div class="info-card__value amount">
              ¥{{ invoiceStats.invoicing.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
      <div class="stats-col">
        <div class="info-card">
          <div class="info-card__content">
            <h3 class="info-card__title">退票中</h3>
            <div class="info-card__value amount">
              ¥{{ invoiceStats.refunding.toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="invoice-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon">
            <Document />
          </el-icon>
          <span class="title">发票管理</span>
        </div>
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
                title="温馨提示：电子发票开具后将发送至您的邮箱，纸质发票将通过快递寄送。开票金额需满100元。"
                type="info"
                show-icon
                :closable="false"
                style="margin-bottom: 20px"
              />

              <div class="apply-method-bar">
                <el-radio-group
                  v-model="applyMethod"
                  style="margin-bottom: 20px"
                >
                  <el-radio-button value="detail"
                    >按消费明细开票</el-radio-button
                  >
                  <el-radio-button value="monthly">按月度开票</el-radio-button>
                  <el-radio-button value="amount">输入金额开票</el-radio-button>
                </el-radio-group>
              </div>

              <!-- 按消费明细开票 -->
              <div v-if="applyMethod === 'detail'">
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
                      >下一步</el-button
                    >
                  </div>
                  <div class="action-right">
                    <el-date-picker
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      style="width: 260px; margin-right: 10px"
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
                  style="width: 100%"
                >
                  <el-table-column type="selection" width="55" />
                  <el-table-column
                    prop="id"
                    label="订单号/流水号"
                    width="180"
                  />
                  <el-table-column prop="type" label="业务类型" width="100" />
                  <el-table-column
                    prop="create_time"
                    label="交易时间"
                    width="180"
                  />
                  <el-table-column prop="amount" label="可开票金额" width="150">
                    <template #default="scope">
                      <span style="color: #f56c6c; font-weight: bold"
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

              <!-- 按月度开票 -->
              <div v-if="applyMethod === 'monthly'">
                <div class="action-bar">
                  <div class="action-left">
                    <span class="selected-info">
                      已选金额：<span class="amount"
                        >¥{{ totalApplyAmount }}</span
                      >
                    </span>
                    <el-button
                      type="primary"
                      :disabled="selectedMonthly.length === 0"
                      >下一步</el-button
                    >
                  </div>
                </div>

                <el-table
                  :data="monthlyData"
                  @selection-change="handleSelectionChange"
                  style="width: 100%"
                >
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="month" label="账单月份" width="180" />
                  <el-table-column prop="amount" label="可开票金额" width="150">
                    <template #default="scope">
                      <span style="color: #f56c6c; font-weight: bold"
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
                    :total="monthlyData.length"
                  />
                </div>
              </div>

              <!-- 输入金额开票 -->
              <div v-if="applyMethod === 'amount'" class="amount-invoice-form">
                <el-form
                  label-width="100px"
                  style="max-width: 600px; margin-top: 30px"
                >
                  <el-form-item label="开票金额" required>
                    <el-input
                      v-model="customAmount"
                      placeholder="0.00"
                      style="width: 320px"
                    >
                      <template #prefix>
                        <span
                          style="color: #333; font-weight: 500; font-size: 16px"
                          >¥</span
                        >
                      </template>
                      <template #suffix>
                        <el-button type="primary" link @click="fillAllAmount"
                          >全部开票</el-button
                        >
                      </template>
                    </el-input>
                    <div
                      style="
                        width: 100%;
                        margin-top: 8px;
                        font-size: 13px;
                        color: #909399;
                        line-height: 1;
                      "
                    >
                      可开票金额：¥{{ invoiceStats.available.toFixed(2) }}
                    </div>
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      type="primary"
                      :disabled="
                        !customAmount ||
                        Number(customAmount) <= 0 ||
                        Number(customAmount) > invoiceStats.available
                      "
                      >下一步</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </el-tab-pane>

          <!-- 开票记录 -->
          <el-tab-pane label="开票记录" name="records">
            <div class="tab-pane-content" v-loading="loading">
              <div class="action-bar" style="justify-content: flex-end">
                <el-input
                  placeholder="请输入发票流水号/抬头"
                  style="width: 250px; margin-right: 10px"
                >
                  <template #append>
                    <el-button :icon="Search" />
                  </template>
                </el-input>
              </div>

              <el-table :data="recordsData" style="width: 100%">
                <el-table-column prop="id" label="发票流水号" width="180" />
                <el-table-column
                  prop="title"
                  label="发票抬头"
                  show-overflow-tooltip
                />
                <el-table-column prop="type" label="发票类型" width="160" />
                <el-table-column prop="amount" label="开票金额" width="120">
                  <template #default="scope">
                    <span style="color: #f56c6c; font-weight: bold"
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
                <el-table-column label="操作" width="180" fixed="right">
                  <template #default="scope">
                    <el-button type="primary" link>查看详情</el-button>
                    <el-button type="primary" link>下载</el-button>
                    <el-button
                      v-if="scope.row.status === '已开具'"
                      type="warning"
                      link
                      @click="handleRefund(scope.row)"
                      >退票重开</el-button
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
              <div class="action-bar" style="justify-content: flex-start">
                <el-button type="primary">
                  <el-icon><Plus /></el-icon>
                  新增发票抬头
                </el-button>
              </div>

              <el-table :data="infoData" style="width: 100%">
                <el-table-column prop="title" label="发票抬头" />
                <el-table-column prop="type" label="抬头类型" width="120">
                  <template #default="scope">
                    <el-tag size="small">{{ scope.row.type }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="tax_id" label="纳税人识别号" />
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
                    <el-button type="primary" link>编辑</el-button>
                    <el-button type="danger" link>删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.invoice-container {
  min-height: 100vh;
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}

/* 统计卡片样式 */
.stats-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
}

.stats-col {
  width: 25%;
  padding: 0 10px;
  margin-bottom: 20px;

  @media screen and (max-width: 1200px) {
    width: 50%;
  }

  @media screen and (max-width: 768px) {
    width: 100%;
  }
}

.info-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  height: 100px;
  padding: 16px;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #ebeef5;
  }

  &__content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__title {
    font-size: 14px;
    font-weight: normal;
    color: #909399;
    margin: 0;
  }

  &__value {
    font-size: 20px;
    color: #303133;
    font-weight: 500;

    &.amount {
      color: #f56c6c;
      font-weight: bold;
    }
  }
}

@media screen and (max-width: 768px) {
  .info-card {
    height: 90px;
    padding: 14px;

    &__title {
      font-size: 13px;
    }

    &__value {
      font-size: 18px;
    }
  }
}

.invoice-card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 80px);
}

.card-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left .icon {
  margin-right: 8px;
  font-size: 18px;
  color: #409eff;
}

.header-left .title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-content {
  padding: 0 20px 20px;
}

.invoice-tabs {
  margin-top: 10px;
}

.tab-pane-content {
  padding-top: 10px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.action-right {
  display: flex;
  align-items: center;
}

.selected-info {
  font-size: 14px;
  color: #606266;

  .amount {
    color: #f56c6c;
    font-size: 18px;
    font-weight: bold;
    margin-left: 5px;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.5;
}

/* 输入金额开票样式 */
.amount-invoice-form {
  padding: 20px 0;
}
</style>
