<script setup>
import { Shop, Plus } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const loading = ref(false)
const tableData = ref([])
const search = ref('')

// 分页相关
const page = ref(1)
const totalPages = ref(1)
const totalRecords = ref(0)
const pageLoading = ref(false)
const pageSize = ref(25)

// 创建商户相关
const createUserStatus = ref(false)
const userInfo = ref({
  username: '',
  password: '',
  mail: '',
})

// 创建商户
const createUser = async () => {
  if (
    !userInfo.value.username ||
    !userInfo.value.password ||
    !userInfo.value.mail
  ) {
    $msg('请填写所有必填项', 'error')
    return false
  }

  const apiBodyValue = new URLSearchParams()
  apiBodyValue.append('username', userInfo.value.username)
  apiBodyValue.append('password', userInfo.value.password)
  apiBodyValue.append('mail', userInfo.value.mail)

  const res = await $myFetch('CreateUser', {
    method: 'POST',
    body: apiBodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg || '用户创建成功', 'success')
    createUserStatus.value = false
  } else {
    $msg(res.msg || '创建失败', 'error')
  }
}

// 随机生成密码
const generateRandomPassword = () => {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  userInfo.value.password = password
}

// 监听创建商户弹窗关闭
watch(createUserStatus, (newValue) => {
  if (newValue === false) {
    userInfo.value = {
      username: '',
      password: '',
      mail: '',
    }
  }
})

// 商户设置相关
const settingsDialogVisible = ref(false)
const currentSettings = ref({
  id: 0,
  name: '',
  commission_rate: 0,
})

// 打开设置弹窗
const handleSettings = (row) => {
  currentSettings.value = {
    id: row.id,
    name: row.name,
    commission_rate: row.commission_rate || 0,
  }
  settingsDialogVisible.value = true
}

// 保存设置
const saveSettings = async () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    // 同时更新 tableData
    const tableIndex = tableData.value.findIndex(
      (item) => item.id === currentSettings.value.id,
    )
    if (tableIndex !== -1) {
      tableData.value[tableIndex].commission_rate =
        currentSettings.value.commission_rate
    }
    $msg('设置保存成功', 'success')
    settingsDialogVisible.value = false
    loading.value = false
  }, 500)
}

const getData = async () => {
  pageLoading.value = true
  try {
    const res = await $myFetch('MerchantList', {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        keyword: search.value,
        type: 'review',
      },
    })

    if (res.code === 200) {
      const list = res.data?.list || []
      tableData.value = list.map((item) => ({
        id: item.id,
        name: item.merchant_name,
        enterprise_name: item.company_name,
        credit_code: item.credit_code,
        commission_rate: 0, // 接口暂无此字段
        contact: item.contact_name,
        phone: item.contact_phone,
        email: item.contact_email,
        description: item.cooperation_intent,
        status: item.status,
        create_time: new Date(item.created_at).toLocaleString(),
      }))
      totalRecords.value = res.data?.total || 0
      totalPages.value = Math.ceil(totalRecords.value / pageSize.value)
    } else {
      tableData.value = []
      totalRecords.value = 0
    }
  } catch (error) {
    console.error(error)
    $msg('获取数据失败', 'error')
  } finally {
    pageLoading.value = false
  }
}

onMounted(() => {
  getData()
})

// 搜索
const handleSearch = () => {
  page.value = 1
  getData()
}

// 监听搜索输入防抖
const debouncedSearch = ref(null)
watch(search, () => {
  if (debouncedSearch.value) clearTimeout(debouncedSearch.value)
  debouncedSearch.value = setTimeout(() => {
    handleSearch()
  }, 500)
})

// 快捷创建商户
const handleQuickCreate = (row) => {
  userInfo.value.username = row.contact || row.name
  userInfo.value.mail = row.email
  userInfo.value.password = '123456' // 默认密码
  createUserStatus.value = true
}

// 删除商户
const handleDelete = async (row) => {
  loading.value = true
  try {
    const res = await $myFetch('MerchantDelete', {
      params: { id: row.id },
    })

    if (res.code === 200) {
      $msg(res.msg || '删除成功', 'success')
      getData()
    } else {
      $msg(res.msg || '删除失败', 'error')
    }
  } catch (error) {
    $msg('删除失败', 'error')
  } finally {
    loading.value = false
  }
}

// 状态文本转换
const getStatusText = (status) => {
  switch (Number(status)) {
    case 0:
      return '待审核'
    case 1:
      return '已通过'
    case 2:
      return '已拒绝'
    default:
      return '未知'
  }
}

// 状态标签类型
const getStatusType = (status) => {
  switch (Number(status)) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return 'info'
  }
}

// 监听页码变化
watch(page, () => {
  getData()
})

watch(pageSize, () => {
  page.value = 1
  getData()
})

useHead({
  title: '商户审核',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="merchant-container" v-loading="loading">
    <div class="merchant-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon"><Shop /></el-icon>
          <span class="title">商户审核</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="createUserStatus = true">
            <el-icon><Plus /></el-icon>
            <span>创建商户</span>
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <client-only>
          <el-table
            :data="tableData"
            style="width: 100%"
            v-loading="pageLoading"
          >
            <el-table-column fixed="right" width="150" label="操作">
              <template #header>
                <div class="search-wrapper">
                  <el-input
                    v-model="search"
                    placeholder="搜索商户/联系人"
                    clearable
                  >
                  </el-input>
                </div>
              </template>
              <template #default="scope">
                <div class="table-actions">
                  <el-button
                    type="primary"
                    link
                    @click="handleSettings(scope.row)"
                  >
                    设置
                  </el-button>
                  <el-button
                    type="primary"
                    link
                    @click="handleQuickCreate(scope.row)"
                  >
                    创建用户
                  </el-button>
                  <el-popconfirm
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    title="确定要删除吗？"
                    @confirm="handleDelete(scope.row)"
                  >
                    <template #reference>
                      <el-button type="danger" link>删除</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column
              prop="name"
              label="商户名称"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="enterprise_name"
              label="企业名称"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column
              prop="credit_code"
              label="信用代码"
              width="180"
              show-overflow-tooltip
            />
            <el-table-column
              prop="commission_rate"
              label="佣金比例"
              width="100"
            >
              <template #default="scope">
                {{ scope.row.commission_rate }}%
              </template>
            </el-table-column>
            <el-table-column prop="contact" label="联系人" width="100" />
            <el-table-column prop="phone" label="联系电话" width="120" />
            <el-table-column
              prop="email"
              label="邮箱"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column
              prop="description"
              label="合作意向"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column prop="create_time" label="申请时间" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="page"
              v-model:page-size="pageSize"
              :page-sizes="[10, 25, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalRecords"
              :disabled="pageLoading"
              background
            />
          </div>
        </client-only>
      </div>
    </div>
    <!-- 创建商户对话框 -->
    <el-dialog
      v-model="createUserStatus"
      title="新增用户"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form :model="userInfo" label-width="90px">
        <el-form-item label="用户名称" required>
          <el-input v-model="userInfo.username" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="密码" required>
          <div style="display: flex; gap: 10px; width: 100%">
            <el-input
              type="password"
              v-model="userInfo.password"
              show-password
              placeholder="请输入密码"
            />
            <el-button @click="generateRandomPassword">随机生成</el-button>
          </div>
        </el-form-item>
        <el-form-item label="邮箱地址" required>
          <el-input v-model="userInfo.mail" placeholder="请输入邮箱地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createUserStatus = false">取消</el-button>
          <el-button type="primary" @click="createUser">创建</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 商户设置对话框 -->
    <el-dialog
      v-model="settingsDialogVisible"
      title="商户设置"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form :model="currentSettings" label-width="100px">
        <el-form-item label="商户名称">
          <span>{{ currentSettings.name }}</span>
        </el-form-item>
        <el-form-item label="佣金比例">
          <el-input-number
            v-model="currentSettings.commission_rate"
            :precision="2"
            :step="0.1"
            :min="0"
            :max="100"
          />
          <span style="margin-left: 10px">%</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="settingsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSettings" :loading="loading">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.merchant-container {
  position: relative;
  min-height: 100vh;
  padding: 24px;
  display: flex;
  justify-content: center;
  background: #f5f7fa;

  .merchant-card {
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
          width: 140px;
          margin: 0;
        }

        .el-table__header-wrapper {
          th {
            background: #f8fafc;
            color: #1f2937;
            font-weight: 600;
          }
        }
      }

      .table-actions {
        display: flex;
        gap: 4px;
        margin: 0;
        padding: 0;
      }

      .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

// 对话框样式
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
  .merchant-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .merchant-container {
    padding: 12px;
  }
}
</style>
