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
              <el-table
                :data="filteredData"
                style="width: 100%"
                v-loading="pageLoading"
              >
                <el-table-column
                  prop="id"
                  label="ID"
                  min-width="180"
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
                      :type="
                        scope.row.method === 'alipay' ? 'primary' : 'success'
                      "
                      size="small"
                    >
                      {{ scope.row.method === 'alipay' ? '支付宝' : '微信' }}
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
                <el-table-column label="创建时间" min-width="180">
                  <template #default="scope">
                    {{ formatTimestamp(scope.row.create_time) }}
                  </template>
                </el-table-column>
                <el-table-column label="支付时间" min-width="180">
                  <template #default="scope">
                    {{
                      scope.row.pay_time && scope.row.pay_time !== 0
                        ? formatTimestamp(scope.row.pay_time)
                        : '-'
                    }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button
                        type="primary"
                        link
                        @click="showDetail(scope.row)"
                      >
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
                  :page-sizes="[10, 20, 30, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @current-change="handlePageChange"
                  @size-change="handleSizeChange"
                />
              </div>
            </client-only>
          </div>
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
            <span class="label">订单号：</span>
            <span class="value">{{ currentRecord.id }}</span>
          </div>
          <div class="detail-item">
            <span class="label">充值金额：</span>
            <span class="value amount">¥{{ currentRecord.amount }}</span>
          </div>
          <div class="detail-item">
            <span class="label">支付方式：</span>
            <span class="value">{{
              currentRecord.method === 'alipay' ? '支付宝' : '微信'
            }}</span>
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
    </div>
  </div>
</template>

<script setup>
import { Wallet, Search, Menu } from '@element-plus/icons-vue'

const { $myFetch, $msg } = useNuxtApp()

// 加载状态
const loading = ref(false)
const pageLoading = ref(false)

// 表格数据
const filteredData = ref([]) // 存储记录数据

// 分页相关
const page = ref(1) // 当前页数
const pageSize = ref(20) // 每页显示数量，默认20条
const totalRecords = ref(0) // 总记录数

// 详情对话框
const dialogVisible = ref(false)
const currentRecord = ref(null)

// 上方卡片信息
const recargarInfo = ref({
  total_order: 0,
  total_money: 0,
  recently_order: 0,
  recently_money: 0,
})

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

// 获取充值记录数据
const fetchAllRecords = async () => {
  pageLoading.value = true
  try {
    // 构建查询参数，包含分页参数
    const params = {
      page: page.value,
      limit: pageSize.value, // 添加每页数量参数
    }
    // 发送请求获取充值记录数据
    const res = await $myFetch('GetRechargeRecords', { params })

    if (res.code === 200) {
      // 保存记录
      filteredData.value = res.data.data || []

      // 设置分页信息
      if (res.data && typeof res.data.total_records === 'number') {
        totalRecords.value = res.data.total_records || 0
      }

      // 设置卡片信息
      recargarInfo.value.total_order = res.data.total_order || 0
      recargarInfo.value.total_money = res.data.total_money || 0
      recargarInfo.value.recently_order = res.data.recently_order || 0
      recargarInfo.value.recently_money = res.data.recently_money || 0
    } else {
      $msg(res.msg || '获取充值记录失败', 'error')
    }
  } catch (error) {
    console.error('获取充值记录失败:', error)
    $msg('获取充值记录失败', 'error')
  } finally {
    pageLoading.value = false
  }
}

// 页码变化时获取对应页的数据
watch(
  () => page.value,
  (newValue, oldValue) => {
    pageLoading.value = true
    fetchAllRecords() // 页码变化时重新获取数据
  }
)

// 手动处理页面切换
const handlePageChange = (newPage) => {
  page.value = newPage
  fetchAllRecords()
}

// 处理每页显示数量变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  page.value = 1 // 重置到第一页
  fetchAllRecords()
}

// 显示详情
const showDetail = (row) => {
  currentRecord.value = row
  dialogVisible.value = true
}

// 格式化时间戳为可读日期时间格式
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

// 页面加载时获取数据
onMounted(() => {
  fetchAllRecords()
})

useHead({
  title: '充值记录',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<style lang="less" scoped>
.container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.right {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
}

.rechargerecord-container {
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
