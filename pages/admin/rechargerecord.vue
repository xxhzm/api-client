<script setup>
import { Wallet, Search, Edit } from '@element-plus/icons-vue';

definePageMeta({
  layout: 'admin',
});

const { $myFetch, $msg } = useNuxtApp();
const { isAdmin } = useRouteAccess();

// 加载状态
const loading = ref(false);
const pageLoading = ref(false);

// 表格数据
const filteredData = ref([]); // 存储记录数据

// 分页相关
const page = ref(1); // 当前页数
const pageSize = ref(20); // 每页显示数量，默认20条
const totalRecords = ref(0); // 总记录数

// 筛选条件
const statusFilter = ref('');
const invoiceFilter = ref('');

// 详情对话框
const dialogVisible = ref(false);
const currentRecord = ref(null);

// 编辑对话框
const editDialogVisible = ref(false);
const editLoading = ref(false);
const editForm = ref({
  id: '',
  amount: '',
  status: '',
});

const rechargeStatusOptions = [
  { label: '未支付', value: '1' },
  { label: '已支付', value: '2' },
];

const invoiceStatusOptions = [
  { label: '未开具', value: '0' },
  { label: '已开具', value: '1' },
];

// 上方卡片信息
const recargarInfo = ref({
  total_order: 0,
  total_money: 0,
  recently_order: 0,
  recently_money: 0,
});

// 获取充值记录数据
const fetchAllRecords = async () => {
  pageLoading.value = true;
  try {
    // 构建查询参数，包含分页参数
    const params = {
      page: page.value,
      limit: pageSize.value, // 添加每页数量参数
    };

    if (statusFilter.value !== '') {
      params.status = statusFilter.value;
    }

    if (invoiceFilter.value !== '') {
      params.is_invoiced = invoiceFilter.value;
    }

    // 发送请求获取充值记录数据
    const res = await $myFetch('GetRechargeRecords', { params });

    if (res.code === 200) {
      const data = res.data || {};

      // 保存记录
      filteredData.value = data.data || [];

      // 设置分页信息
      if (typeof data.total_records === 'number') {
        totalRecords.value = data.total_records || 0;
      }

      // 设置卡片信息
      recargarInfo.value = {
        total_order: data.total_order || 0,
        total_money: data.total_money || 0,
        recently_order: data.recently_order || 0,
        recently_money: data.recently_money || 0,
      };
    } else {
      $msg(res.msg || '获取充值记录失败', 'error');
    }
  } catch (error) {
    $msg('获取充值记录失败', 'error');
  } finally {
    pageLoading.value = false;
  }
};

// 手动处理页面切换
const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchAllRecords();
};

// 处理每页显示数量变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  page.value = 1; // 重置到第一页
  fetchAllRecords();
};

const handleFilterSearch = () => {
  page.value = 1;
  fetchAllRecords();
};

const clearFilters = () => {
  statusFilter.value = '';
  invoiceFilter.value = '';
  page.value = 1;
  fetchAllRecords();
};

// 显示详情
const showDetail = (row) => {
  currentRecord.value = row;
  dialogVisible.value = true;
};

// 显示编辑
const showEdit = (row) => {
  editForm.value = {
    id: row.id,
    amount:
      row.amount == null || row.amount === '' ? undefined : Number(row.amount),
    status: String(row.status) === '2' ? '2' : '1',
  };
  editDialogVisible.value = true;
};

const submitEdit = async () => {
  if (!editForm.value.id) {
    $msg('充值ID不能为空', 'error');
    return;
  }

  const amountValue = String(editForm.value.amount ?? '').trim();
  if (amountValue && Number(amountValue) < 0) {
    $msg('充值金额不能小于0', 'error');
    return;
  }

  const body = new URLSearchParams();
  body.append('id', editForm.value.id);

  if (amountValue) {
    body.append('amount', amountValue);
  }

  if (editForm.value.status !== '') {
    body.append('status', editForm.value.status);
  }

  editLoading.value = true;
  try {
    const res = await $myFetch('UpdateRechargeRecord', {
      method: 'POST',
      body,
    });

    if (res.code === 200) {
      $msg(res.msg || '修改充值记录成功', 'success');
      editDialogVisible.value = false;
      await fetchAllRecords();
    } else {
      $msg(res.msg || '修改充值记录失败', 'error');
    }
  } catch (error) {
    $msg('修改充值记录失败', 'error');
  } finally {
    editLoading.value = false;
  }
};

const getPaymentMethodLabel = (method) => {
  const methodLabelMap = {
    alipay: '支付宝',
    mpay: '易支付',
    epay: '易支付',
    weixin: '微信',
    bank_transfer: '对公转账',
  };

  return methodLabelMap[method] || method || '-';
};

const getPaymentMethodTagType = (method) => {
  const methodTagTypeMap = {
    alipay: 'primary',
    mpay: 'success',
    epay: 'success',
    wechat: 'success',
    bank_transfer: 'danger',
  };

  return methodTagTypeMap[method] || 'info';
};

const isInvoiced = (value) =>
  value === true || value === 1 || value === '1' || value === 'true';

const getInvoiceStatusLabel = (value) =>
  isInvoiced(value) ? '已开具' : '未开具';

const getInvoiceStatusTagType = (value) =>
  isInvoiced(value) ? 'success' : 'info';

// 格式化时间戳为可读日期时间格式
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(Number(timestamp));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 页面加载时获取数据
onMounted(() => {
  fetchAllRecords();
});

useHead({
  title: '充值记录',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
});
</script>

<template>
  <div class="rechargerecord-container" v-loading="loading">
    <SystemRecargar :info="recargarInfo"></SystemRecargar>
    <div class="record-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon">
            <Wallet />
          </el-icon>
          <span class="title">充值记录</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="fetchAllRecords">
            <el-icon>
              <Search />
            </el-icon>
            <span>刷新</span>
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <client-only>
          <div class="filter-container">
            <el-select
              v-model="statusFilter"
              placeholder="支付状态筛选"
              clearable
              class="filter-select"
            >
              <el-option
                v-for="item in rechargeStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-select
              v-model="invoiceFilter"
              placeholder="发票状态筛选"
              clearable
              class="filter-select"
            >
              <el-option
                v-for="item in invoiceStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button type="primary" @click="handleFilterSearch">
              筛选
            </el-button>
            <el-button @click="clearFilters">重置</el-button>
          </div>

          <el-table
            :data="filteredData"
            style="width: 100%"
            v-loading="pageLoading"
          >
            <el-table-column prop="id" label="ID" show-overflow-tooltip />
            <el-table-column
              prop="username"
              label="用户名"
              show-overflow-tooltip
            />
            <el-table-column prop="amount" label="充值金额" width="120">
              <template #default="scope">
                <span style="color: #f56c6c; font-weight: bold"
                  >¥{{ scope.row.amount }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="method" label="支付方式" width="120">
              <template #default="scope">
                <el-tag
                  :type="getPaymentMethodTagType(scope.row.method)"
                  size="small"
                >
                  {{ getPaymentMethodLabel(scope.row.method) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === '2' ? 'success' : 'warning'"
                  size="small"
                >
                  {{ scope.row.status === '2' ? '已支付' : '未支付' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="是否已开具发票" width="150">
              <template #default="scope">
                <el-tag
                  :type="getInvoiceStatusTagType(scope.row.is_invoiced)"
                  size="small"
                >
                  {{ getInvoiceStatusLabel(scope.row.is_invoiced) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间">
              <template #default="scope">
                {{ formatTimestamp(scope.row.create_time) }}
              </template>
            </el-table-column>
            <el-table-column label="支付时间">
              <template #default="scope">
                {{
                  scope.row.pay_time && scope.row.pay_time !== 0
                    ? formatTimestamp(scope.row.pay_time)
                    : '-'
                }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              :width="isAdmin ? 110 : 60"
              fixed="right"
            >
              <template #default="scope">
                <div class="table-actions">
                  <el-button type="primary" link @click="showDetail(scope.row)">
                    详情
                  </el-button>
                  <el-button
                    v-if="isAdmin"
                    type="warning"
                    link
                    @click="showEdit(scope.row)"
                  >
                    编辑
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              :page-size="pageSize"
              :pager-count="5"
              :total="totalRecords"
              v-model:current-page="page"
              :disabled="pageLoading"
              background
              :page-sizes="[10, 20, 30, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>
        </client-only>
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="dialogVisible" title="充值详情" width="500px">
      <div class="detail-content" v-if="currentRecord">
        <div class="detail-item">
          <span class="label">用户ID：</span>
          <span class="value">{{ currentRecord.uid }}</span>
        </div>
        <div class="detail-item">
          <span class="label">用户名：</span>
          <span class="value">{{ currentRecord.username }}</span>
        </div>
        <div class="detail-item">
          <span class="label">订单号：</span>
          <span class="value">{{ currentRecord.id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">充值金额：</span>
          <span class="value amount">¥{{ currentRecord.amount }}</span>
        </div>
        <div class="detail-item">
          <span class="label">支付方式：</span>
          <span class="value">
            {{ getPaymentMethodLabel(currentRecord.method) }}
          </span>
        </div>
        <div class="detail-item">
          <span class="label">订单状态：</span>
          <span
            class="value"
            :class="`status-${
              currentRecord.status === '2' ? 'success' : 'pending'
            }`"
          >
            {{ currentRecord.status === '2' ? '已支付' : '未支付' }}
          </span>
        </div>
        <div class="detail-item">
          <span class="label">是否已开具发票：</span>
          <span class="value">
            {{ getInvoiceStatusLabel(currentRecord.is_invoiced) }}
          </span>
        </div>
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span class="value">{{
            formatTimestamp(currentRecord.create_time)
          }}</span>
        </div>
        <div class="detail-item">
          <span class="label">支付时间：</span>
          <span class="value">{{
            currentRecord.pay_time && currentRecord.pay_time !== 0
              ? formatTimestamp(currentRecord.pay_time)
              : '-'
          }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑充值记录" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="充值ID">
          <el-input v-model="editForm.id" disabled />
        </el-form-item>
        <el-form-item label="充值金额">
          <el-input-number
            v-model="editForm.amount"
            :min="0"
            :precision="2"
            :step="1"
            controls-position="right"
            style="width: 100%"
            placeholder="不修改可留空"
          />
        </el-form-item>
        <el-form-item label="账单状态">
          <el-select
            v-model="editForm.status"
            clearable
            placeholder="不修改可留空"
            style="width: 100%"
          >
            <el-option
              v-for="item in rechargeStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="editLoading" @click="submitEdit">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.rechargerecord-container {
  min-height: 100vh;
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}

.record-card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
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

.header-right {
  display: flex;
  gap: 10px;
}

.table-container {
  padding: 20px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 15px;
}

.filter-select {
  width: 180px;
}

.table-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 详情对话框样式 */
.detail-content {
  padding: 10px 0;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
}

.detail-item .label {
  width: 100px;
  text-align: right;
  color: #606266;
  padding-right: 12px;
}

.detail-item .value {
  flex: 1;
  color: #303133;
}

.detail-item .amount {
  color: #f56c6c;
  font-weight: bold;
}

.status-success {
  color: #67c23a;
}

.status-pending {
  color: #e6a23c;
}

.status-failed {
  color: #f56c6c;
}
</style>
