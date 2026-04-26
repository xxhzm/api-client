<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const invoiceId = computed(() => String(route.params.id || '-'))

const invoiceDetail = computed(() => ({
  id: invoiceId.value,
  status: '已开具',
  audit_result: '通过',
  amount: 699.0,
  type: '增值税电子普通发票',
  content: '技术服务费',
  email: '2595557857@qq.com',
  title: '广州某某科技有限公司',
  tax_id: '91440101MA59XXXXXX',
  apply_time: '2023-10-20 16:00:00',
  remark: '-',
}))

const invoiceOrders = computed(() => [
  {
    id: 'ORD202310010001',
    amount: 199.0,
    pay_method: '余额支付',
    payee: '广州某某科技有限公司',
    create_time: '2023-10-01 10:23:00',
  },
  {
    id: 'ORD202310150002',
    amount: 500.0,
    pay_method: '余额支付',
    payee: '广州某某科技有限公司',
    create_time: '2023-10-15 14:30:00',
  },
])

const steps = [{ title: '审核中' }, { title: '已开具' }, { title: '已完成' }]

const goBack = () => {
  navigateTo('/admin/invoice')
}

useHead({
  title: '开票详情',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="invoice-detail-page">
    <div class="detail-card">
      <div class="page-header">
        <el-button
          :icon="ArrowLeft"
          class="back-button"
          @click="goBack"
          >返回</el-button
        >
      </div>

      <div class="step-bar">
        <div
          v-for="(step, index) in steps"
          :key="step.title"
          class="step-item"
          :class="{ 'is-last': index === steps.length - 1 }"
        >
          <span>{{ index + 1 }}、{{ step.title }}</span>
        </div>
      </div>

      <div class="summary-row">
        <div class="summary-item">
          发票编号：<span>{{ invoiceDetail.id }}</span>
        </div>
        <div class="summary-item">
          发票状态：<span class="primary-text">{{ invoiceDetail.status }}</span>
        </div>
        <div class="summary-item">
          审核结果：<span class="primary-text">{{
            invoiceDetail.audit_result
          }}</span>
        </div>
      </div>

      <section class="detail-section">
        <div class="section-title">发票信息</div>
        <div class="info-box">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">发票金额：</span>
              <span class="value">{{ invoiceDetail.amount.toFixed(2) }}元</span>
            </div>
            <div class="info-item">
              <span class="label">发票抬头：</span>
              <span class="value">{{ invoiceDetail.title }}</span>
            </div>
            <div class="info-item">
              <span class="label">发票类型：</span>
              <span class="value">{{ invoiceDetail.type }}</span>
            </div>
            <div class="info-item">
              <span class="label">纳税人识别号：</span>
              <span class="value">{{ invoiceDetail.tax_id }}</span>
            </div>
            <div class="info-item">
              <span class="label">开具内容：</span>
              <span class="value">{{ invoiceDetail.content }}</span>
            </div>
            <div class="info-item">
              <span class="label">申请日期：</span>
              <span class="value">{{ invoiceDetail.apply_time }}</span>
            </div>
            <div class="info-item">
              <span class="label">邮箱：</span>
              <span class="value">{{ invoiceDetail.email }}</span>
            </div>
            <div class="info-item">
              <span class="label">备注：</span>
              <span class="value">{{ invoiceDetail.remark }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <div class="section-title">开票订单</div>
        <el-table
          :data="invoiceOrders"
          class="orders-table"
          style="width: 100%"
          empty-text="暂无开票订单"
        >
          <el-table-column prop="id" label="订单编号" min-width="180" />
          <el-table-column prop="amount" label="订单费用(元)" width="160">
            <template #default="scope">
              {{ scope.row.amount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="pay_method" label="支付方式" width="160" />
          <el-table-column prop="payee" label="收款主体" min-width="220" />
          <el-table-column prop="create_time" label="订单时间" width="180" />
        </el-table>
      </section>
    </div>
  </div>
</template>

<style lang="less" scoped>
.invoice-detail-page {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;
}

.detail-card {
  padding: 24px 26px 28px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 18px;
}

.back-button {
  color: #606266;
  border: none;
  background: transparent;

  &:hover,
  &:focus {
    color: #409eff;
    background: #ecf5ff;
  }
}

.step-bar {
  display: flex;
  overflow: hidden;
  margin-bottom: 20px;
  color: #fff;
  background: #409eff;
}

.step-item {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 9px 24px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;

  &::after {
    position: absolute;
    top: 0;
    right: -14px;
    z-index: 1;
    width: 28px;
    height: 100%;
    border-top: 17px solid transparent;
    border-bottom: 17px solid transparent;
    border-left: 14px solid #409eff;
    content: '';
  }

  &::before {
    position: absolute;
    top: 0;
    right: -16px;
    z-index: 1;
    width: 28px;
    height: 100%;
    border-top: 17px solid transparent;
    border-bottom: 17px solid transparent;
    border-left: 14px solid #fff;
    content: '';
  }

  &.is-last::before,
  &.is-last::after {
    display: none;
  }
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
  color: #606266;
  font-size: 14px;
}

.summary-item {
  min-width: 0;
  word-break: break-all;
}

.primary-text {
  color: #409eff;
}

.detail-section {
  margin-top: 18px;
}

.section-title {
  margin-bottom: 10px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.info-box {
  padding: 22px 28px;
  border: 1px solid #dcdfe6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 90px;
}

.info-item {
  display: flex;
  min-width: 0;
  color: #606266;
  font-size: 14px;
}

.label {
  width: 120px;
  flex-shrink: 0;
  text-align: right;
}

.value {
  min-width: 0;
  color: #303133;
  word-break: break-all;
}

.orders-table {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;

  :deep(.el-table__header th) {
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }
}

@media screen and (max-width: 768px) {
  .invoice-detail-page {
    padding: 12px;
  }

  .detail-card {
    padding: 16px 14px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .step-bar,
  .summary-row,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .step-bar {
    display: block;
  }

  .step-item {
    padding: 10px 12px;

    &::before,
    &::after {
      display: none;
    }
  }

  .summary-row {
    display: grid;
    gap: 8px;
  }

  .info-box {
    padding: 14px;
  }

  .info-grid {
    gap: 12px;
  }

  .info-item {
    flex-direction: column;
    gap: 4px;
  }

  .label {
    width: auto;
    text-align: left;
  }
}
</style>
