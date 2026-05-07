<script setup>
import { Check, Close, Refresh, Search, View } from '@element-plus/icons-vue';

definePageMeta({
  layout: 'admin',
});

const { $msg, $myFetch, $decryptPhone } = useNuxtApp();

const loading = ref(false);
const tableData = ref([]);
const search = ref('');
const statusFilter = ref('');
const titleTypeFilter = ref('');
const applyTimeRange = ref([]);
const page = ref(1);
const pageSize = ref(25);
const totalRecords = ref(0);
const searchTimer = ref(null);

const reviewDialogVisible = ref(false);
const reviewSubmitting = ref(false);
const reviewForm = ref({
  id: '',
  title: '',
  action: 'approve',
  status: 1,
});

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待审核', value: 0 },
  { label: '已开具', value: 1 },
  { label: '已驳回', value: 2 },
];
const titleTypeOptions = [
  { label: '全部抬头', value: '' },
  { label: '企业', value: 'company' },
  { label: '个人', value: 'personal' },
];

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

const formatAmount = (amount) => {
  if (amount === undefined || amount === null || amount === '') return '-';

  const amountValue = Number(amount);
  if (Number.isNaN(amountValue)) return '-';

  return `¥${amountValue.toFixed(2)}`;
};

const getStatusLabel = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已开具',
    2: '已驳回',
  };

  return statusMap[Number(status)] || '未知';
};

const getStatusTagType = (status) => {
  const statusMap = {
    0: 'warning',
    1: 'success',
    2: 'danger',
  };

  return statusMap[Number(status)] || 'info';
};

const getTitleTypeLabel = (value) => {
  if (value === 'personal') return '个人';
  if (value === 'company') return '企业';
  return value || '-';
};

const getApplyTimeRangeParams = () => {
  if (!Array.isArray(applyTimeRange.value) || applyTimeRange.value.length !== 2) {
    return {};
  }

  const startTime = Number(applyTimeRange.value[0]);
  const endTime = Number(applyTimeRange.value[1]);
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return {};
  }

  return {
    start_time: startTime,
    end_time: endTime + 24 * 60 * 60 * 1000 - 1,
  };
};

const mapInvoiceApplication = (item, token) => ({
  id: item.id || '-',
  uid: item.uid || '-',
  title: decryptInvoiceValue(item.invoice_title, token),
  title_type: getTitleTypeLabel(item.title_type),
  type: item.invoice_type || '-',
  email: item.email || '-',
  amount: item.invoice_amount,
  status: Number(item.status),
  status_label: getStatusLabel(item.status),
  remark: item.remark || '-',
  create_time: formatTimestamp(item.create_time),
  update_time: formatTimestamp(item.update_time),
});

const fetchInvoiceApplications = async () => {
  loading.value = true;
  try {
    const params = {
      page: page.value,
      limit: pageSize.value,
    };

    if (statusFilter.value !== '') {
      params.status = statusFilter.value;
    }

    if (titleTypeFilter.value) {
      params.title_type = titleTypeFilter.value;
    }

    Object.assign(params, getApplyTimeRangeParams());

    const keyword = search.value.trim();
    if (keyword) {
      params.keyword = keyword;
    }

    const res = await $myFetch('InvoiceApplicationList', { params });

    if (res.code !== 200) {
      tableData.value = [];
      totalRecords.value = 0;
      $msg(res.msg || '获取发票申请失败', 'error');
      return;
    }

    const token = useCookie('token').value;
    const data = res.data || {};
    tableData.value = (data.list || []).map((item) =>
      mapInvoiceApplication(item, token),
    );
    totalRecords.value = data.totalRecords || 0;
  } catch (error) {
    tableData.value = [];
    totalRecords.value = 0;
    $msg('获取发票申请失败', 'error');
  } finally {
    loading.value = false;
  }
};

const refreshList = () => {
  fetchInvoiceApplications();
};

const resetFilters = () => {
  search.value = '';
  statusFilter.value = '';
  titleTypeFilter.value = '';
  applyTimeRange.value = [];
  page.value = 1;
  fetchInvoiceApplications();
};

const handleSearch = () => {
  page.value = 1;
  fetchInvoiceApplications();
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchInvoiceApplications();
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  page.value = 1;
  fetchInvoiceApplications();
};

const showInvoiceDetail = (row) => {
  navigateTo(`/admin/invoicedetail/${row.id}?from=audit`);
};

const showUserDetail = (row) => {
  if (!row.uid || row.uid === '-') return;

  navigateTo(`/admin/userdetail/${row.uid}`);
};

const openReviewDialog = (row, action) => {
  reviewForm.value = {
    id: row.id,
    title: row.title,
    action,
    status: action === 'approve' ? 1 : 2,
  };
  reviewDialogVisible.value = true;
};

const submitReview = async () => {
  reviewSubmitting.value = true;
  try {
    const body = new URLSearchParams();
    body.append('id', reviewForm.value.id);
    body.append('status', String(reviewForm.value.status));

    const res = await $myFetch('ReviewInvoiceApplication', {
      method: 'POST',
      body,
    });

    if (res.code !== 200) {
      $msg(res.msg || '审核操作失败', 'error');
      return;
    }

    $msg(res.msg || '审核操作成功', 'success');
    reviewDialogVisible.value = false;
    fetchInvoiceApplications();
  } catch (error) {
    $msg('审核操作失败', 'error');
  } finally {
    reviewSubmitting.value = false;
  }
};

watch(search, () => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value);
  }
  searchTimer.value = setTimeout(() => {
    handleSearch();
  }, 500);
});

watch(statusFilter, () => {
  handleSearch();
});

watch(titleTypeFilter, () => {
  handleSearch();
});

watch(applyTimeRange, () => {
  handleSearch();
});

onMounted(() => {
  fetchInvoiceApplications();
});

onBeforeUnmount(() => {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value);
  }
});

useHead({
  title: '发票管理',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
});
</script>

<template>
  <div class="invoice-manage-page" v-loading="loading">
    <div class="manage-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">发票管理</span>
          <span class="header-meta">查看和处理用户提交的发票申请</span>
        </div>
        <div class="filter-bar">
          <el-input
            v-model="search"
            class="search-input"
            clearable
            placeholder="搜索发票编号/用户ID/邮箱"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="statusFilter"
            class="status-select"
            placeholder="状态筛选"
          >
            <el-option
              v-for="item in statusOptions"
              :key="String(item.value)"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select
            v-model="titleTypeFilter"
            class="title-type-select"
            placeholder="抬头类型"
          >
            <el-option
              v-for="item in titleTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-date-picker
            v-model="applyTimeRange"
            class="apply-time-picker"
            end-placeholder="结束日期"
            range-separator="至"
            start-placeholder="开始日期"
            type="daterange"
            value-format="x"
          />
          <el-button @click="resetFilters">重置</el-button>
          <el-button :icon="Refresh" @click="refreshList">刷新</el-button>
        </div>
      </div>

      <client-only>
        <el-table
          :data="tableData"
          class="manage-table"
          empty-text="暂无发票申请"
          style="width: 100%"
        >
          <el-table-column prop="id" label="发票编号" min-width="180" />
          <el-table-column label="用户ID" width="100">
            <template #default="scope">
              <el-button link type="primary" @click="showUserDetail(scope.row)">
                {{ scope.row.uid }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column
            prop="title"
            label="发票抬头"
            min-width="180"
            show-overflow-tooltip
          />
          <el-table-column prop="title_type" label="抬头类型" width="100" />
          <el-table-column prop="type" label="发票类型" width="130" />
          <el-table-column
            prop="email"
            label="接收邮箱"
            min-width="180"
            show-overflow-tooltip
          />
          <el-table-column label="开票金额" width="130">
            <template #default="scope">
              {{ formatAmount(scope.row.amount) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                {{ scope.row.status_label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="申请时间" width="170" />
          <el-table-column fixed="right" label="操作" width="210">
            <template #default="scope">
              <div class="table-actions">
                <template v-if="scope.row.status === 0">
                  <el-button
                    :icon="Check"
                    link
                    type="success"
                    @click="openReviewDialog(scope.row, 'approve')"
                  >
                    通过
                  </el-button>
                  <el-button
                    :icon="Close"
                    link
                    type="danger"
                    @click="openReviewDialog(scope.row, 'reject')"
                  >
                    驳回
                  </el-button>
                </template>
                <el-button
                  :icon="View"
                  link
                  type="primary"
                  @click="showInvoiceDetail(scope.row)"
                >
                  详情
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :disabled="loading"
            :page-sizes="[10, 25, 50, 100]"
            :total="totalRecords"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </client-only>
    </div>

    <el-dialog
      v-model="reviewDialogVisible"
      :title="reviewForm.action === 'approve' ? '确认通过' : '确认驳回'"
      append-to-body
      destroy-on-close
      width="480px"
    >
      <el-form :model="reviewForm" label-width="90px">
        <el-form-item label="发票编号">
          <span>{{ reviewForm.id }}</span>
        </el-form-item>
        <el-form-item label="发票抬头">
          <span>{{ reviewForm.title }}</span>
        </el-form-item>
        <el-form-item label="审核操作">
          <el-tag
            :type="reviewForm.action === 'approve' ? 'success' : 'danger'"
            size="large"
          >
            {{ reviewForm.action === 'approve' ? '通过审核' : '驳回申请' }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button
            :loading="reviewSubmitting"
            :type="reviewForm.action === 'approve' ? 'success' : 'danger'"
            @click="submitReview"
          >
            确认{{ reviewForm.action === 'approve' ? '通过' : '驳回' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.invoice-manage-page {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;
}

.manage-card {
  width: 100%;
  padding: 18px 20px 22px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}

.title {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.header-meta {
  color: #909399;
  font-size: 13px;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
}

.search-input {
  width: 260px;
}

.status-select {
  width: 130px;
}

.title-type-select {
  width: 120px;
}

.apply-time-picker {
  width: 260px;
}

.manage-table {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;

  :deep(.el-table__header th) {
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media screen and (max-width: 768px) {
  .invoice-manage-page {
    padding: 12px;
  }

  .manage-card {
    padding: 16px 14px;
  }

  .card-header,
  .filter-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .header-left {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .search-input,
  .status-select,
  .title-type-select,
  .apply-time-picker {
    width: 100%;
  }

  .pagination {
    justify-content: flex-start;
    overflow-x: auto;
  }
}
</style>
