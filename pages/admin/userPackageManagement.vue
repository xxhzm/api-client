<script setup>
import { Wallet, Search } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

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

// 编辑对话框
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref(null)
// 编辑表单数据
const editForm = ref({
  id: '',
  uid: '',
  name: '',
  type: 1, // 套餐类型：1=点数包，2=包月计费
  amount: 0,
  expire_time: null,
})

// 编辑表单验证规则（动态计算）
const editRules = computed(() => {
  const rules = {
    amount: [
      { required: true, message: '请输入金额', trigger: 'blur' },
      { type: 'number', min: 0, message: '金额不能小于0', trigger: 'blur' },
      {
        type: 'number',
        max: 999999.99,
        message: '金额不能超过999999.99',
        trigger: 'blur',
      },
    ],
  }

  // 只有包月计费（type === 2）才需要验证过期时间
  if (editForm.value.type === 2) {
    rules.expire_time = [
      {
        required: true,
        message: '包月计费必须选择过期时间',
        trigger: 'change',
      },
      {
        validator: (rule, value, callback) => {
          if (value && new Date(Number(value)) <= new Date()) {
            callback(new Error('过期时间必须大于当前时间'))
          } else {
            callback()
          }
        },
        trigger: 'change',
      },
    ]
  }

  return rules
})

// 接口筛选相关
const apiList = ref([]) // 接口列表
const selectedApiId = ref('') // 选中的接口ID
const apiSearchKeyword = ref('') // 接口搜索关键词
const apiSearchLoading = ref(false)

// 搜索接口列表
const searchApiList = async (keyword = '') => {
  if (!keyword.trim()) {
    apiList.value = []
    return
  }

  apiSearchLoading.value = true
  try {
    const res = await $myFetch('ApiSearch', {
      params: { keyword: keyword.trim() },
    })
    if (res.code === 200) {
      apiList.value = res.data || []
    } else {
      $msg(res.msg || '搜索接口失败', 'error')
      apiList.value = []
    }
  } catch (error) {
    $msg('搜索接口失败', 'error')
    apiList.value = []
  } finally {
    apiSearchLoading.value = false
  }
}

// 监听搜索关键词变化
watch(apiSearchKeyword, (newValue) => {
  searchApiList(newValue)
})

// 清空接口筛选
const clearApiFilter = () => {
  selectedApiId.value = ''
  apiSearchKeyword.value = ''
  apiList.value = []
  page.value = 1
  fetchAllRecords()
}

// 获取购买套餐记录数据
const fetchAllRecords = async () => {
  pageLoading.value = true
  try {
    // 构建查询参数，包含分页参数
    const params = {
      page: page.value,
      limit: pageSize.value, // 添加每页数量参数
    }

    // 如果选择了接口，添加aid参数
    if (selectedApiId.value) {
      params.aid = selectedApiId.value
    }

    // 发送请求获取购买套餐记录数据
    const res = await $myFetch('GetUserPackageRecords', { params })
    if (res.code === 200) {
      // 保存记录
      filteredData.value = res.data.data || []

      // 设置分页信息
      if (res.data && typeof res.data.total_records === 'number') {
        totalRecords.value = res.data.total_records || 0
      }
    } else {
      $msg(res.msg || '获取记录失败', 'error')
    }
  } catch (error) {
    $msg('获取记录失败', 'error')
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
  },
)

// 监听接口选择变化
watch(selectedApiId, () => {
  page.value = 1 // 重置到第一页
  fetchAllRecords()
})

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

// 显示编辑对话框
const showEdit = (row) => {
  editForm.value = {
    id: row.id,
    uid: row.uid,
    name: row.name,
    type: row.type || 1, // 套餐类型
    amount: parseFloat(row.amount) || 0,
    // 如果是点数包（type !== 2），清空过期时间；如果是包月计费，保留原有时间戳
    expire_time:
      row.type === 2 && row.expire_time ? Number(row.expire_time) : null,
  }
  editDialogVisible.value = true
}

// 取消编辑
const cancelEdit = () => {
  editDialogVisible.value = false
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
  // 重置表单数据
  editForm.value = {
    id: '',
    uid: '',
    name: '',
    type: 1,
    amount: 0,
    expire_time: null,
  }
}

// 保存编辑
const saveEdit = async () => {
  if (!editFormRef.value) {
    $msg('表单引用不存在', 'error')
    return
  }

  try {
    // 验证表单
    await editFormRef.value.validate()

    editLoading.value = true

    // 构建更新参数
    const updateData = {
      id: editForm.value.id,
      amount: Number(editForm.value.amount),
    }

    // 根据套餐类型处理过期时间
    if (editForm.value.type === 2) {
      // 包月计费必须有过期时间
      updateData.expireTime = editForm.value.expire_time
    }
    // 点数包不发送过期时间字段

    // 验证数据有效性
    if (!updateData.id) {
      $msg('订单ID不能为空', 'error')
      return
    }

    if (updateData.amount < 0) {
      $msg('金额不能小于0', 'error')
      return
    }

    // 只有包月计费才验证过期时间
    if (editForm.value.type === 2 && !updateData.expireTime) {
      $msg('包月计费必须设置过期时间', 'error')
      return
    }

    // 调用更新API
    const res = await $myFetch('UpdateBuyPackageRecord', {
      method: 'POST',
      body: new URLSearchParams(updateData),
    })

    if (res.code === 200) {
      $msg('更新成功', 'success')
      editDialogVisible.value = false
      // 重置表单
      editFormRef.value.resetFields()
      // 刷新数据
      await fetchAllRecords()
    } else {
      $msg(res.msg || '更新失败，请稍后重试', 'error')
    }
  } catch (error) {
    // 表单验证错误不显示额外消息
    if (error && typeof error === 'object' && error.message) {
      return
    }

    // 网络或其他错误
    console.error('更新套餐记录失败:', error)
    $msg('网络错误，请检查网络连接后重试', 'error')
  } finally {
    editLoading.value = false
  }
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
  title: '购买记录',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="buypackagerecord-container" v-loading="loading">
    <div class="record-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon">
            <Wallet />
          </el-icon>
          <span class="title">购买记录</span>
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

      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-item">
          <label class="filter-label">接口筛选：</label>
          <div class="api-filter-container">
            <el-select
              v-model="selectedApiId"
              placeholder="搜索并选择接口"
              filterable
              remote
              clearable
              :remote-method="searchApiList"
              :loading="apiSearchLoading"
              style="width: 300px"
              @clear="clearApiFilter"
            >
              <el-option
                v-for="api in apiList"
                :key="api.id"
                :label="`${api.name} (${api.alias})`"
                :value="api.id"
              />
            </el-select>
            <el-button
              v-if="selectedApiId"
              type="info"
              plain
              @click="clearApiFilter"
              style="margin-left: 10px"
            >
              清空筛选
            </el-button>
          </div>
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
              min-width="100"
              show-overflow-tooltip
            />
            <el-table-column
              prop="uid"
              label="uid"
              min-width="100"
              show-overflow-tooltip
            />
            <el-table-column prop="name" label="套餐名称" min-width="150">
              <template #default="scope">
                <span style="font-weight: bold">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="100">
              <template #default="scope">
                <span style="color: #f56c6c; font-weight: bold"
                  >¥{{ scope.row.amount }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="时长" width="100">
              <template #default="scope">
                <span>{{ scope.row.duration }}天</span>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="套餐类型" width="120">
              <template #default="scope">
                <el-tag
                  :type="scope.row.type === 2 ? 'primary' : 'success'"
                  size="small"
                >
                  {{ scope.row.type === 2 ? '包月计费' : '点数包' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === 1 ? 'success' : 'warning'"
                  size="small"
                >
                  {{ scope.row.status === 1 ? '有效' : '无效' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" min-width="180">
              <template #default="scope">
                {{ formatTimestamp(scope.row.create_time) }}
              </template>
            </el-table-column>
            <el-table-column label="过期时间" min-width="180">
              <template #default="scope">
                {{ formatTimestamp(scope.row.expire_time) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="scope">
                <div class="table-actions">
                  <el-button type="primary" link @click="showDetail(scope.row)">
                    详情
                  </el-button>
                  <el-button type="warning" link @click="showEdit(scope.row)">
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
              layout="total, sizes, prev, pager, next"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>
        </client-only>
      </div>
    </div>
  </div>

  <!-- 详情对话框 -->
  <el-dialog v-model="dialogVisible" title="套餐详情" width="500px">
    <div class="detail-content" v-if="currentRecord">
      <div class="detail-item">
        <span class="label">订单ID：</span>
        <span class="value">{{ currentRecord.id }}</span>
      </div>
      <div class="detail-item">
        <span class="label">用户ID：</span>
        <span class="value">{{ currentRecord.uid }}</span>
      </div>
      <div class="detail-item">
        <span class="label">接口ID：</span>
        <span class="value">{{ currentRecord.aid }}</span>
      </div>
      <div class="detail-item">
        <span class="label">套餐名称：</span>
        <span class="value">{{ currentRecord.name }}</span>
      </div>
      <div class="detail-item">
        <span class="label">套餐ID：</span>
        <span class="value">{{ currentRecord.package_id }}</span>
      </div>
      <div class="detail-item">
        <span class="label">支付金额：</span>
        <span class="value amount">¥{{ currentRecord.amount }}</span>
      </div>
      <div class="detail-item">
        <span class="label">套餐时长：</span>
        <span class="value">{{ currentRecord.duration }}天</span>
      </div>
      <div class="detail-item">
        <span class="label">订单状态：</span>
        <span
          class="value"
          :class="`status-${
            currentRecord.status === 1 ? 'success' : 'pending'
          }`"
        >
          {{ currentRecord.status === 1 ? '有效' : '无效' }}
        </span>
      </div>
      <div class="detail-item">
        <span class="label">套餐类型：</span>
        <span class="value">{{
          currentRecord.type === 2 ? '按时间' : '按次数'
        }}</span>
      </div>
      <div class="detail-item" v-if="currentRecord.package_points > 0">
        <span class="label">套餐点数：</span>
        <span class="value">{{ currentRecord.package_points }}</span>
      </div>
      <div
        class="detail-item"
        v-if="currentRecord.points > 0 || currentRecord.points_used > 0"
      >
        <span class="label">剩余/已用：</span>
        <span class="value"
          >{{ currentRecord.points }} / {{ currentRecord.points_used }}</span
        >
      </div>
      <div class="detail-item">
        <span class="label">创建时间：</span>
        <span class="value">{{
          formatTimestamp(currentRecord.create_time)
        }}</span>
      </div>
      <div class="detail-item">
        <span class="label">过期时间：</span>
        <span class="value">{{
          formatTimestamp(currentRecord.expire_time)
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
  <el-dialog
    v-model="editDialogVisible"
    title="编辑套餐记录"
    width="500px"
    :append-to-body="true"
  >
    <el-form
      ref="editFormRef"
      :model="editForm"
      :rules="editRules"
      label-width="100px"
      v-loading="editLoading"
    >
      <el-form-item label="订单ID：">
        <el-input v-model="editForm.id" disabled />
      </el-form-item>
      <el-form-item label="用户ID：">
        <el-input v-model="editForm.uid" disabled />
      </el-form-item>
      <el-form-item label="套餐名称：">
        <el-input v-model="editForm.name" disabled />
      </el-form-item>
      <el-form-item label="套餐类型：">
        <el-tag
          :type="editForm.type === 2 ? 'primary' : 'success'"
          size="large"
        >
          {{ editForm.type === 2 ? '包月计费' : '点数包' }}
        </el-tag>
      </el-form-item>
      <el-form-item label="支付金额：" prop="amount">
        <el-input-number
          v-model="editForm.amount"
          :min="0"
          :precision="2"
          :step="0.01"
          style="width: 100%"
          placeholder="请输入金额"
        />
      </el-form-item>
      <el-form-item label="过期时间：" prop="expire_time">
        <el-date-picker
          v-model="editForm.expire_time"
          type="datetime"
          :placeholder="
            editForm.type === 2 ? '选择过期时间' : '点数包无需设置过期时间'
          "
          format="YYYY-MM-DD HH:mm:ss"
          value-format="x"
          style="width: 100%"
          :disabled="editForm.type !== 2"
        />
        <div
          v-if="editForm.type !== 2"
          style="margin-top: 5px; color: #909399; font-size: 12px"
        >
          点数包类型无需设置过期时间
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelEdit">取消</el-button>
        <el-button type="primary" @click="saveEdit" :loading="editLoading"
          >保存</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.buypackagerecord-container {
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

.filter-section {
  padding: 16px 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 80px;
}

.api-filter-container {
  display: flex;
  align-items: center;
  flex: 1;
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
