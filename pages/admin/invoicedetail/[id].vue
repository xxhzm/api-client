<script setup>
import { ArrowLeft } from '@element-plus/icons-vue';

definePageMeta({
  layout: 'admin',
});

const { $msg, $myFetch, $decryptPhone } = useNuxtApp();
const route = useRoute();
const invoiceId = computed(() => String(route.params.id || '-'));
const loading = ref(false);
const invoiceDetail = ref({
  id: '-',
  status: '-',
  status_code: null,
  audit_result: '-',
  amount: null,
  type: '-',
  content: '软件服务费',
  email: '-',
  title: '-',
  tax_id: '-',
  specification_model: '-',
  apply_time: '-',
  update_time: '-',
  remark: '-',
  title_type: '-',
  bank_name: '-',
  bank_account: '-',
  company_address: '-',
  company_phone: '-',
  review_time: '-',
  review_by: '',
  review_by_username: '',
  review_remark: '-',
});
const invoiceOrders = ref([]);

const decryptInvoiceValue = (value, token) => {
  if (!value || !token) return value || '-';

  try {
    return $decryptPhone(value, token) || '-';
  } catch {
    return value || '-';
  }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-';

  const date = new Date(Number(timestamp));
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const getStatusLabel = (status) => {
  const statusMap = {
    0: '审核中',
    1: '已开具',
    2: '已驳回',
  };

  return statusMap[Number(status)] || '未知';
};

const getAuditResultLabel = (status) => {
  const resultMap = {
    0: '待审核',
    1: '通过',
    2: '驳回',
  };

  return resultMap[Number(status)] || '-';
};

const getSpecificationModelLabel = (value) => {
  return String(value) === '2' ? '无' : '空白';
};

const formatAmount = (amount) => {
  if (amount === undefined || amount === null || amount === '') return '-';

  const amountValue = Number(amount);
  if (Number.isNaN(amountValue)) return '-';

  return `${amountValue.toFixed(2)}元`;
};

const getPaymentMethodLabel = (method) => {
  const methodLabelMap = {
    alipay: '支付宝',
    mpay: '易支付',
    epay: '易支付',
    weixin: '微信',
    wechat: '微信',
    bank_transfer: '对公转账',
  };

  return methodLabelMap[method] || method || '-';
};

const mapInvoiceOrders = (orders) => {
  return (orders || []).map((item) => ({
    id: item.id || '-',
    amount: item.amount,
    pay_method: getPaymentMethodLabel(item.method),
    pay_time: formatTimestamp(item.pay_time),
  }));
};

const fetchInvoiceDetail = async () => {
  if (!invoiceId.value || invoiceId.value === '-') return;

  loading.value = true;
  try {
    const res = await $myFetch('InvoiceApplicationDetail', {
      params: {
        id: invoiceId.value,
      },
    });

    if (res.code !== 200) {
      $msg(res.msg || '获取开票详情失败', 'error');
      return;
    }

    const detail = res.data?.detail || {};
    const token = useCookie('token').value;
    invoiceDetail.value = {
      id: detail.id || invoiceId.value,
      status: getStatusLabel(detail.status),
      status_code: Number(detail.status),
      audit_result: getAuditResultLabel(detail.status),
      amount: detail.invoice_amount,
      type: detail.invoice_type || '-',
      content: '软件服务费',
      email: detail.email || '-',
      title_type: detail.title_type
        ? detail.title_type === 'personal'
          ? '个人'
          : '企业'
        : '-',
      title: decryptInvoiceValue(detail.invoice_title, token),
      tax_id: decryptInvoiceValue(detail.tax_number, token),
      specification_model: getSpecificationModelLabel(
        detail.specification_model,
      ),
      apply_time: formatTimestamp(detail.create_time),
      update_time: formatTimestamp(detail.update_time),
      remark: detail.remark || '-',
      bank_name: decryptInvoiceValue(detail.bank_name, token),
      bank_account: decryptInvoiceValue(detail.bank_account, token),
      company_address: decryptInvoiceValue(detail.company_address, token),
      company_phone: decryptInvoiceValue(detail.company_phone, token),
      review_time: formatTimestamp(detail.review_time),
      review_by: detail.review_by || '',
      review_by_username: detail.review_by_username || '',
      review_remark: detail.review_remark || '-',
    };
    invoiceOrders.value = mapInvoiceOrders(detail.orders);
  } catch (error) {
    $msg('获取开票详情失败', 'error');
  } finally {
    loading.value = false;
  }
};

const steps = computed(() => {
  if (invoiceDetail.value.status_code === 2) {
    return [
      { title: '审核中', status: 0 },
      { title: '已驳回', status: 2 },
    ];
  }

  return [
    { title: '审核中', status: 0 },
    { title: '已开具', status: 1 },
  ];
});
const currentStepIndex = computed(() => {
  const index = steps.value.findIndex(
    (step) => step.status === invoiceDetail.value.status_code,
  );
  return index === -1 ? 0 : index;
});
const isPersonalInvoiceTitle = computed(() => {
  return invoiceDetail.value.title_type === '个人';
});
const isIssuedInvoice = computed(() => {
  return invoiceDetail.value.status_code === 1;
});
const isRejectedInvoice = computed(() => {
  return invoiceDetail.value.status_code === 2;
});
const reviewerName = computed(() => {
  return (
    invoiceDetail.value.review_by_username ||
    invoiceDetail.value.review_by ||
    '-'
  );
});
const hasReviewer = computed(() => reviewerName.value !== '-');
const backPath = computed(() => {
  return route.query.from === 'audit'
    ? '/admin/invoice-audit'
    : '/admin/invoice';
});

const isStepActive = (index) => {
  if (invoiceDetail.value.status_code === 2) {
    return steps.value[index].status === 0 || steps.value[index].status === 2;
  }

  return index <= currentStepIndex.value;
};

const getStepItemClass = (index) => ({
  'is-active': isStepActive(index),
  'is-current': index === currentStepIndex.value,
  'is-last': index === steps.value.length - 1,
  'is-rejected':
    invoiceDetail.value.status_code === 2 && steps.value[index].status === 2,
});

const goBack = () => {
  navigateTo(backPath.value);
};

onMounted(() => {
  fetchInvoiceDetail();
});

watch(invoiceId, () => {
  fetchInvoiceDetail();
});

useHead({
  title: '开票详情',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
});
</script>

<template>
  <div class="invoice-detail-page" v-loading="loading">
    <div class="detail-card">
      <div class="page-header">
        <el-button :icon="ArrowLeft" class="back-button" @click="goBack"
          >返回</el-button
        >
      </div>

      <div class="step-bar">
        <div
          v-for="(step, index) in steps"
          :key="step.title"
          class="step-item"
          :class="getStepItemClass(index)"
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

      <el-alert
        v-if="isIssuedInvoice"
        class="invoice-sent-alert"
        title="发票已发送到您填写的邮箱中，请前往邮箱查看。"
        type="success"
        show-icon
        :closable="false"
      />

      <el-alert
        v-if="isRejectedInvoice"
        class="invoice-reject-alert"
        :title="`驳回说明：${invoiceDetail.review_remark}`"
        type="error"
        show-icon
        :closable="false"
      />

      <section class="detail-section">
        <div class="section-title">发票信息</div>
        <div class="info-box">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">发票金额：</span>
              <span class="value">{{
                formatAmount(invoiceDetail.amount)
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">发票抬头：</span>
              <span class="value">{{ invoiceDetail.title }}</span>
            </div>
            <div class="info-item">
              <span class="label">抬头类型：</span>
              <span class="value">{{ invoiceDetail.title_type }}</span>
            </div>
            <div class="info-item">
              <span class="label">发票类型：</span>
              <span class="value">{{ invoiceDetail.type }}</span>
            </div>
            <div v-if="!isPersonalInvoiceTitle" class="info-item">
              <span class="label">纳税人识别号：</span>
              <span class="value">{{ invoiceDetail.tax_id }}</span>
            </div>
            <div class="info-item">
              <span class="label">开具内容：</span>
              <span class="value">{{ invoiceDetail.content }}</span>
            </div>
            <div class="info-item">
              <span class="label">规格型号：</span>
              <span class="value">{{ invoiceDetail.specification_model }}</span>
            </div>
            <div class="info-item">
              <span class="label">申请日期：</span>
              <span class="value">{{ invoiceDetail.apply_time }}</span>
            </div>
            <div class="info-item">
              <span class="label">邮箱：</span>
              <span class="value">{{ invoiceDetail.email }}</span>
            </div>
            <div v-if="!isPersonalInvoiceTitle" class="info-item">
              <span class="label">企业地址：</span>
              <span class="value">{{ invoiceDetail.company_address }}</span>
            </div>
            <div v-if="!isPersonalInvoiceTitle" class="info-item">
              <span class="label">企业电话：</span>
              <span class="value">{{ invoiceDetail.company_phone }}</span>
            </div>
            <div v-if="!isPersonalInvoiceTitle" class="info-item">
              <span class="label">开户银行：</span>
              <span class="value">{{ invoiceDetail.bank_name }}</span>
            </div>
            <div v-if="!isPersonalInvoiceTitle" class="info-item">
              <span class="label">银行账号：</span>
              <span class="value">{{ invoiceDetail.bank_account }}</span>
            </div>
            <div class="info-item">
              <span class="label">更新时间：</span>
              <span class="value">{{ invoiceDetail.update_time }}</span>
            </div>
            <div v-if="invoiceDetail.review_time !== '-'" class="info-item">
              <span class="label">审核时间：</span>
              <span class="value">{{ invoiceDetail.review_time }}</span>
            </div>
            <div v-if="hasReviewer" class="info-item">
              <span class="label">审核人：</span>
              <span class="value">{{ reviewerName }}</span>
            </div>
            <div v-if="isRejectedInvoice" class="info-item">
              <span class="label">驳回说明：</span>
              <span class="value">{{ invoiceDetail.review_remark }}</span>
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
          <el-table-column prop="amount" label="订单金额" width="160">
            <template #default="scope">
              {{ formatAmount(scope.row.amount) }}
            </template>
          </el-table-column>
          <el-table-column prop="pay_method" label="支付方式" width="160" />
          <el-table-column prop="pay_time" label="支付时间" width="180" />
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
  color: #909399;
  background: #f5f7fa;
}

.step-item {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 9px 24px;
  background: #f5f7fa;
  text-align: center;
  font-size: 13px;
  font-weight: 500;

  &.is-active {
    color: #fff;
    background: #409eff;
  }

  &.is-rejected {
    background: #f56c6c;
  }

  &.is-current {
    font-weight: 600;
  }

  &::after {
    position: absolute;
    top: 0;
    right: -14px;
    z-index: 1;
    width: 28px;
    height: 100%;
    border-top: 17px solid transparent;
    border-bottom: 17px solid transparent;
    border-left: 14px solid #f5f7fa;
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

  &.is-active::after {
    border-left-color: #409eff;
  }

  &.is-rejected::after {
    border-left-color: #f56c6c;
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

.invoice-sent-alert {
  margin-bottom: 18px;
}

.invoice-reject-alert {
  margin-bottom: 18px;
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
