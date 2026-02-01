<script setup>
import { Money, Search, Refresh } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const { $myFetch, $msg } = useNuxtApp()
const routeInfo = useCookie('routeInfo')

// 判断是否是管理员（通过 /admin/system 路由权限判断）
const isAdmin = computed(() => {
  if (!routeInfo.value) return false
  return routeInfo.value.some((r) => r.path === '/admin/system')
})

// 加载状态
const loading = ref(false)
const pageLoading = ref(false)

// 表格数据
const tableData = ref([])

// 分页相关
const page = ref(1)
const pageSize = ref(15)
const totalRecords = ref(0)

// 详情对话框
const dialogVisible = ref(false)
const currentRecord = ref(null)

// 搜索条件
const searchForm = reactive({
  merchant_id: '',
  user_id: '',
  action: '',
  dateRange: null,
})

// 操作类型选项
const actionOptions = [
  { label: '全部', value: '' },
  { label: '购买', value: 1 },
  { label: '续费', value: 2 },
]

// 获取分成记录数据
const fetchRecords = async () => {
  pageLoading.value = true
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value,
    }
    
    // 添加搜索条件
    if (searchForm.merchant_id) {
      params.merchant_id = Number(searchForm.merchant_id)
    }
    if (searchForm.user_id) {
      params.user_id = Number(searchForm.user_id)
    }
    if (searchForm.action !== '' && searchForm.action !== null) {
      params.action = searchForm.action
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.start_time = Number(searchForm.dateRange[0])
      params.end_time = Number(searchForm.dateRange[1])
    }
    
    const res = await $myFetch('MerchantCommissionLogList', { params })

    if (res.code === 200) {
      tableData.value = res.data.list || []
      totalRecords.value = res.data.total || 0
    } else {
      $msg(res.msg || '获取分成记录失败', 'error')
    }
  } catch (error) {
    $msg('获取分成记录失败', 'error')
  } finally {
    pageLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  page.value = 1
  fetchRecords()
}

// 重置搜索
const handleReset = () => {
  searchForm.merchant_id = ''
  searchForm.user_id = ''
  searchForm.action = ''
  searchForm.dateRange = null
  page.value = 1
  fetchRecords()
}

// 页码变化
const handlePageChange = (newPage) => {
  page.value = newPage
  fetchRecords()
}

// 每页显示数量变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  page.value = 1
  fetchRecords()
}

// 显示详情
const showDetail = (row) => {
  currentRecord.value = row
  dialogVisible.value = true
}

// 格式化时间戳
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(Number(timestamp))
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化操作类型
const formatAction = (action) => {
  const actionMap = {
    1: '购买',
    2: '续费',
  }
  return actionMap[action] || '未知'
}

// 获取操作类型标签类型
const getActionTagType = (action) => {
  const typeMap = {
    1: 'success',
    2: 'primary',
  }
  return typeMap[action] || 'info'
}

// 页面加载时获取数据
onMounted(() => {
  fetchRecords()
})

useHead({
  title: '商户分成记录',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="commission-log-container" v-loading="loading">
    <div class="record-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon">
            <Money />
          </el-icon>
          <span class="title">商户分成记录</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="fetchRecords">
            <el-icon>
              <Refresh />
            </el-icon>
            <span>刷新</span>
          </el-button>
        </div>
      </div>

      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item v-if="isAdmin" label="商户ID">
            <el-input
              v-model="searchForm.merchant_id"
              placeholder="请输入商户ID"
              clearable
              style="width: 140px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item v-if="isAdmin" label="用户ID">
            <el-input
              v-model="searchForm.user_id"
              placeholder="请输入用户ID"
              clearable
              style="width: 140px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="操作类型">
            <el-select
              v-model="searchForm.action"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option
                v-for="item in actionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="x"
              style="width: 340px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <client-only>
          <el-table
            :data="tableData"
            style="width: 100%"
            v-loading="pageLoading"
            border
          >
            <el-table-column
              prop="id"
              label="ID"
              width="80"
              align="center"
            />
            <el-table-column
              v-if="isAdmin"
              prop="merchant_name"
              label="商户名称"
              min-width="140"
              show-overflow-tooltip
            />
            <el-table-column
              v-if="isAdmin"
              prop="user_id"
              label="用户ID"
              width="100"
              align="center"
            />
            <el-table-column
              prop="package_name"
              label="套餐名称"
              min-width="140"
              show-overflow-tooltip
            />
            <el-table-column prop="order_amount" label="订单金额" width="110" align="right">
              <template #default="scope">
                <span style="color: #409eff; font-weight: 500">
                  ¥{{ scope.row.order_amount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="commission_rate" label="分成比例" width="100" align="center">
              <template #default="scope">
                <el-tag type="info" size="small">{{ scope.row.commission_rate }}%</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="commission_amount" label="分成金额" width="110" align="right">
              <template #default="scope">
                <span style="color: #67c23a; font-weight: 600">
                  +¥{{ scope.row.commission_amount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="action" label="类型" width="80" align="center">
              <template #default="scope">
                <el-tag :type="getActionTagType(scope.row.action)" size="small">
                  {{ formatAction(scope.row.action) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="balance_before" label="分成前余额" width="110" align="right">
              <template #default="scope">
                <span style="color: #909399">¥{{ scope.row.balance_before }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="balance_after" label="分成后余额" width="110" align="right">
              <template #default="scope">
                <span style="color: #303133; font-weight: 500">¥{{ scope.row.balance_after }}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" min-width="170">
              <template #default="scope">
                {{ formatTimestamp(scope.row.create_time) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right" align="center">
              <template #default="scope">
                <div class="table-actions">
                  <el-button type="primary" link @click="showDetail(scope.row)">
                    详情
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
              :page-sizes="[10, 15, 20, 30, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>
        </client-only>
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="dialogVisible" title="分成记录详情" width="550px">
      <div class="detail-content" v-if="currentRecord">
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">记录ID：</span>
              <span class="value">{{ currentRecord.id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">操作类型：</span>
              <span class="value">
                <el-tag :type="getActionTagType(currentRecord.action)" size="small">
                  {{ formatAction(currentRecord.action) }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>

        <div v-if="isAdmin" class="detail-section">
          <div class="section-title">商户信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">商户ID：</span>
              <span class="value">{{ currentRecord.merchant_id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">商户名称：</span>
              <span class="value">{{ currentRecord.merchant_name }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">订单信息</div>
          <div class="detail-grid">
            <div v-if="isAdmin" class="detail-item">
              <span class="label">用户ID：</span>
              <span class="value">{{ currentRecord.user_id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">套餐ID：</span>
              <span class="value">{{ currentRecord.package_id }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="label">套餐名称：</span>
              <span class="value">{{ currentRecord.package_name }}</span>
            </div>
            <div class="detail-item">
              <span class="label">订单金额：</span>
              <span class="value order-amount">¥{{ currentRecord.order_amount }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">分成信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">分成比例：</span>
              <span class="value">{{ currentRecord.commission_rate }}%</span>
            </div>
            <div class="detail-item">
              <span class="label">分成金额：</span>
              <span class="value commission-amount">+¥{{ currentRecord.commission_amount }}</span>
            </div>
            <div class="detail-item">
              <span class="label">分成前余额：</span>
              <span class="value">¥{{ currentRecord.balance_before }}</span>
            </div>
            <div class="detail-item">
              <span class="label">分成后余额：</span>
              <span class="value balance-after">¥{{ currentRecord.balance_after }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">时间信息</div>
          <div class="detail-grid">
            <div class="detail-item full-width">
              <span class="label">创建时间：</span>
              <span class="value">{{ formatTimestamp(currentRecord.create_time) }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.commission-log-container {
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
  color: #67c23a;
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

.search-area {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
}

.search-form {
  .el-form-item {
    margin-bottom: 0;
    margin-right: 16px;
  }
}

.table-container {
  padding: 20px;
}

.table-actions {
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 详情对话框样式 */
.detail-content {
  padding: 0;
}

.detail-section {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  
  &.full-width {
    grid-column: span 2;
  }
}

.detail-item .label {
  width: 90px;
  flex-shrink: 0;
  text-align: right;
  color: #606266;
  padding-right: 12px;
  font-size: 13px;
}

.detail-item .value {
  flex: 1;
  color: #303133;
  font-size: 13px;
}

.order-amount {
  color: #409eff;
  font-weight: 500;
}

.commission-amount {
  color: #67c23a;
  font-weight: 600;
}

.balance-after {
  color: #303133;
  font-weight: 600;
}

/* 响应式 */
@media screen and (max-width: 768px) {
  .commission-log-container {
    padding: 12px;
  }
  
  .search-form {
    .el-form-item {
      margin-bottom: 10px;
    }
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-item.full-width {
    grid-column: span 1;
  }
}
</style>
