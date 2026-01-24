<script setup>
import { Wallet } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const loading = ref(false)
const tableData = ref([])
const search = ref('')
const statusFilter = ref('') // 状态筛选

// 当前页数
const page = ref(1)
// 总页数
const totalPages = ref(1)
// 总记录
const totalRecords = ref(0)
// 页数loading
const pageLoading = ref(false)

// 充值卡生成对话框
const createCardDialogVisible = ref(false)
const batchCreateDialogVisible = ref(false)

// 单个充值卡表单
const cardForm = ref({
  amount: 10, // 默认金额
  expiredAt: '', // 过期时间
})

// 批量充值卡表单
const batchCardForm = ref({
  amount: 10, // 默认金额
  expiredAt: '', // 过期时间
  count: 1, // 默认生成数量
})

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

// 获取充值卡列表数据
const getData = async () => {
  pageLoading.value = true
  try {
    const params = {
      page: page.value,
    }

    // 添加状态筛选
    if (statusFilter.value) {
      params.status = statusFilter.value
    }

    // 添加卡号搜索
    if (search.value.trim()) {
      params.card_code = search.value.trim()
    }

    const res = await $myFetch('GetRechargeCardList', {
      params,
    })

    if (res.code !== 200) {
      $msg(res.msg || '获取数据失败', 'error')
      return
    }

    // 根据实际接口返回格式调整
    tableData.value = res.data.list || []
    totalPages.value = res.data.totalPages || 1
    totalRecords.value = res.data.count || 0
  } catch (error) {
    $msg('获取数据失败', 'error')
  } finally {
    pageLoading.value = false
  }
}

// 生成单个充值卡
const generateCard = async () => {
  if (cardForm.value.amount <= 0) {
    $msg('金额必须大于0', 'error')
    return
  }

  loading.value = true
  try {
    const apiBodyValue = new URLSearchParams()
    apiBodyValue.append('amount', cardForm.value.amount)

    if (cardForm.value.expiredAt) {
      // 将日期转换为时间戳
      const expireTimestamp = new Date(cardForm.value.expiredAt).getTime()
      apiBodyValue.append('expiredAt', expireTimestamp)
    }

    const res = await $myFetch('CreateRechargeCard', {
      method: 'POST',
      body: apiBodyValue,
    })

    if (res.code === 200) {
      $msg(res.msg || '充值卡生成成功', 'success')
      createCardDialogVisible.value = false
      await getData()
    } else {
      $msg(res.msg || '充值卡生成失败', 'error')
    }
  } catch (error) {
    $msg('充值卡生成失败', 'error')
  } finally {
    loading.value = false
  }
}

// 批量生成充值卡
const batchGenerateCards = async () => {
  if (batchCardForm.value.amount <= 0) {
    $msg('金额必须大于0', 'error')
    return
  }

  if (batchCardForm.value.count <= 0 || batchCardForm.value.count > 100) {
    $msg('生成数量必须在1-100之间', 'error')
    return
  }

  loading.value = true
  try {
    const apiBodyValue = new URLSearchParams()
    apiBodyValue.append('amount', batchCardForm.value.amount)
    apiBodyValue.append('count', batchCardForm.value.count)

    if (batchCardForm.value.expiredAt) {
      // 将日期转换为时间戳
      const expireTimestamp = new Date(batchCardForm.value.expiredAt).getTime()
      apiBodyValue.append('expiredAt', expireTimestamp)
    }

    const res = await $myFetch('BatchCreateRechargeCards', {
      method: 'POST',
      body: apiBodyValue,
    })

    if (res.code === 200) {
      $msg(res.msg || '充值卡批量生成成功', 'success')
      batchCreateDialogVisible.value = false
      await getData()
    } else {
      $msg(res.msg || '充值卡批量生成失败', 'error')
    }
  } catch (error) {
    $msg('充值卡批量生成失败', 'error')
  } finally {
    loading.value = false
  }
}

// 删除充值卡
const handleDelete = async (row) => {
  loading.value = true
  try {
    const res = await $myFetch('DeleteRechargeCard', {
      params: {
        id: row.id,
      },
    })

    if (res.code === 200) {
      $msg(res.msg || '删除成功', 'success')
      await getData()
    } else {
      $msg(res.msg || '删除失败', 'error')
    }
  } catch (error) {
    $msg('删除失败', 'error')
  } finally {
    loading.value = false
  }
}

// 监听搜索输入
const debouncedSearch = ref(null)
watch(search, (newValue) => {
  if (debouncedSearch.value) {
    clearTimeout(debouncedSearch.value)
  }

  debouncedSearch.value = setTimeout(() => {
    getData()
  }, 500)
})

// 监听状态筛选变化
watch(statusFilter, () => {
  getData()
})

// 监听页数变化
watch(
  () => page.value,
  async () => {
    pageLoading.value = true
    await getData()
    setTimeout(() => {
      pageLoading.value = false
    }, 300)
  },
)

// 清除筛选
const clearFilters = () => {
  search.value = ''
  statusFilter.value = ''
  getData()
}

// 复制充值卡号
const copyCardCode = (code) => {
  navigator.clipboard
    .writeText(code)
    .then(() => {
      $msg('复制成功', 'success')
    })
    .catch(() => {
      $msg('复制失败，请手动复制', 'error')
    })
}

// 导出选中的充值卡
const multipleSelection = ref([])
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const exportSelectedCards = () => {
  if (multipleSelection.value.length === 0) {
    $msg('请先选择要导出的充值卡', 'warning')
    return
  }

  // 仅提取充值卡号，每行一个
  const cardCodes = multipleSelection.value
    .map((item) => item.card_code)
    .join('\n')

  // 创建下载链接
  const blob = new Blob([cardCodes], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `充值卡号_${new Date().getTime()}.txt`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  getData()
})

useHead({
  title: '充值卡管理',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="rechargecard-container" v-loading="loading">
    <div class="card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon">
            <Wallet />
          </el-icon>
          <span class="title">充值卡管理</span>
        </div>
        <div class="header-right">
          <el-button-group>
            <el-button
              type="primary"
              @click="createCardDialogVisible = true"
              style="margin-right: 10px"
            >
              生成单个充值卡
            </el-button>
            <el-button
              type="primary"
              @click="batchCreateDialogVisible = true"
              style="margin-right: 10px"
            >
              批量生成充值卡
            </el-button>
            <el-button type="success" @click="exportSelectedCards">
              导出选中
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <client-only>
          <!-- 筛选区域 -->
          <div class="filter-container">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-input
                  v-model="search"
                  placeholder="搜索卡号"
                  clearable
                  style="width: 100%"
                >
                </el-input>
              </el-col>
              <el-col :span="6">
                <el-select
                  v-model="statusFilter"
                  placeholder="状态筛选"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="未使用" value="2" />
                  <el-option label="已使用" value="3" />
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-button type="primary" @click="getData">筛选</el-button>
                <el-button @click="clearFilters">重置</el-button>
              </el-col>
            </el-row>
          </div>

          <el-table
            :data="tableData"
            style="width: 100%; margin-top: 15px"
            v-loading="pageLoading"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column fixed="right" width="150">
              <template #default="scope">
                <div class="table-actions">
                  <el-button
                    type="primary"
                    link
                    @click="copyCardCode(scope.row.card_code)"
                  >
                    复制
                  </el-button>
                  <el-popconfirm
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    title="确定要删除吗？"
                    @confirm="handleDelete(scope.row)"
                  >
                    <template #reference>
                      <el-button type="danger" link> 删除 </el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column
              prop="card_code"
              label="充值卡号"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column prop="amount" label="金额" width="100">
              <template #default="scope">
                <span class="amount">¥{{ scope.row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="is_used" label="状态" width="100">
              <template #default="scope">
                <el-tag
                  :type="scope.row.is_used === 2 ? 'success' : 'info'"
                  size="small"
                >
                  {{ scope.row.is_used === 2 ? '未使用' : '已使用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="uid" label="使用用户" width="100">
              <template #default="scope">
                {{ scope.row.uid && scope.row.uid !== 0 ? scope.row.uid : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" min-width="180">
              <template #default="scope">
                {{ formatTimestamp(scope.row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="使用时间" min-width="180">
              <template #default="scope">
                {{
                  scope.row.used_at && scope.row.used_at !== 0
                    ? formatTimestamp(scope.row.used_at)
                    : '-'
                }}
              </template>
            </el-table-column>
            <el-table-column label="过期时间" min-width="180">
              <template #default="scope">
                {{
                  scope.row.expired_at
                    ? formatTimestamp(scope.row.expired_at)
                    : '永不过期'
                }}
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              :page-size="25"
              :pager-count="5"
              :total="totalRecords"
              v-model:current-page="page"
              :disabled="pageLoading"
              background
              layout="total, prev, pager, next, jumper"
            />
          </div>
        </client-only>
      </div>
    </div>
    <!-- 生成单个充值卡对话框 -->
    <el-dialog
      v-model="createCardDialogVisible"
      title="生成充值卡"
      width="500px"
      destroy-on-close
    >
      <el-form :model="cardForm" label-width="100px">
        <el-form-item label="充值金额" required>
          <el-input-number
            v-model="cardForm.amount"
            :min="1"
            :max="10000"
            :precision="2"
            :step="10"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="cardForm.expiredAt"
            type="datetime"
            placeholder="选择过期时间，不选择默认一年后过期"
            style="width: 100%"
            :disabled-date="(time) => time.getTime() < Date.now()"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createCardDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="generateCard" :loading="loading">
            生成
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 批量生成充值卡对话框 -->
    <el-dialog
      v-model="batchCreateDialogVisible"
      title="批量生成充值卡"
      width="500px"
      destroy-on-close
    >
      <el-form :model="batchCardForm" label-width="100px">
        <el-form-item label="充值金额" required>
          <el-input-number
            v-model="batchCardForm.amount"
            :min="1"
            :max="10000"
            :precision="2"
            :step="10"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="生成数量" required>
          <el-input-number
            v-model="batchCardForm.count"
            :min="1"
            :max="100"
            :step="1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="batchCardForm.expiredAt"
            type="datetime"
            placeholder="选择过期时间，不选择默认一年后过期"
            style="width: 100%"
            :disabled-date="(time) => time.getTime() < Date.now()"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchCreateDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="batchGenerateCards"
            :loading="loading"
          >
            批量生成
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.rechargecard-container {
  position: relative;
  min-height: 100vh;
  padding: 24px;
  display: flex;
  justify-content: center;
  background: #f5f7fa;

  .card {
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
        .el-button {
          display: flex;
          align-items: center;
          gap: 6px;
        }
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

        .search-wrapper {
          padding: 0;
          margin: 0;
          line-height: 1;
        }

        .el-input {
          margin: 0;
        }

        .el-table__header-wrapper {
          th {
            background: #f8fafc;
            color: #1f2937;
            font-weight: 600;
          }
        }

        .amount {
          color: #f56c6c;
          font-weight: 500;
        }
      }

      .table-actions {
        display: flex;
        gap: 4px;
        margin: 0;
        padding: 0;
      }

      .pagination {
        margin-top: 24px;
        display: flex;
        justify-content: flex-end;

        .search-info {
          display: flex;
          align-items: center;
          color: #606266;
          font-size: 14px;

          .search-count {
            color: #409eff;
            font-weight: bold;
            margin: 0 5px;
          }
        }
      }

      .filter-container {
        margin-bottom: 15px;
      }
    }
  }
}

/* 对话框样式 */
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

    .full-width {
      width: 100%;
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
  .rechargecard-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .rechargecard-container {
    padding: 12px;
  }
}
</style>
