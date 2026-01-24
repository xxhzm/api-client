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

// 创建/编辑商户相关
const dialogStatus = ref(false)
const isEdit = ref(false)
const merchantForm = ref({
  id: 0,
  name: '',
  enterprise_name: '',
  credit_code: '',
  contact: '',
  phone: '',
  email: '',
  commission_rate: 0,
})

// 重置表单
const resetForm = () => {
  merchantForm.value = {
    id: 0,
    name: '',
    enterprise_name: '',
    credit_code: '',
    contact: '',
    phone: '',
    email: '',
    commission_rate: 0,
  }
}

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false
  resetForm()
  dialogStatus.value = true
}

// 打开编辑弹窗
const handleEdit = (row) => {
  isEdit.value = true
  merchantForm.value = { ...row }
  dialogStatus.value = true
}

// 提交表单
const submitForm = async () => {
  if (
    !merchantForm.value.name ||
    !merchantForm.value.contact ||
    !merchantForm.value.phone
  ) {
    $msg('请填写必填项', 'error')
    return
  }

  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    if (isEdit.value) {
      // 编辑逻辑
      const index = mockList.value.findIndex(
        (item) => item.id === merchantForm.value.id,
      )
      if (index !== -1) {
        mockList.value[index] = {
          ...mockList.value[index],
          ...merchantForm.value,
        }
        $msg('修改成功', 'success')
      }
    } else {
      // 创建逻辑
      const newId = mockList.value.length + 1
      const newMerchant = {
        id: newId,
        ...merchantForm.value,
        status: 1, // 默认启用
        create_time: new Date().toLocaleString(),
      }
      mockList.value.unshift(newMerchant)
      $msg('创建成功', 'success')
    }
    dialogStatus.value = false
    getData()
    loading.value = false
  }, 500)
}

const mockList = ref([
  {
    id: 1,
    name: '测试商户A',
    enterprise_name: '测试科技发展有限公司',
    credit_code: '91110108551234567A',
    contact: '张三',
    phone: '13800138000',
    email: 'test@example.com',
    description: 'API接入测试',
    status: 0,
    commission_rate: 0.6,
    create_time: '2023-10-01 10:00:00',
  },
  {
    id: 2,
    name: '测试商户B',
    enterprise_name: '示例网络科技有限公司',
    credit_code: '91310115667890123B',
    contact: '李四',
    phone: '13900139000',
    email: 'demo@example.com',
    description: '数据合作',
    status: 1,
    commission_rate: 1.2,
    create_time: '2023-10-02 11:30:00',
  },
  {
    id: 3,
    name: '测试商户C',
    enterprise_name: '创新信息技术有限公司',
    credit_code: '91440300773456789C',
    contact: '王五',
    phone: '13700137000',
    email: 'wangwu@example.com',
    description: '支付接口对接',
    status: 2,
    commission_rate: 0.8,
    create_time: '2023-10-03 14:20:00',
  },
  {
    id: 4,
    name: '测试商户D',
    enterprise_name: '未来数据服务有限公司',
    credit_code: '91330106889012345D',
    contact: '赵六',
    phone: '13600136000',
    email: 'zhaoliu@example.com',
    description: '长期合作',
    status: 1,
    commission_rate: 0.5,
    create_time: '2023-10-04 09:15:00',
  },
  {
    id: 5,
    name: '测试商户E',
    enterprise_name: '云端解决方案有限公司',
    credit_code: '91510100995678901E',
    contact: '孙七',
    phone: '13500135000',
    email: 'sunqi@example.com',
    description: '测试申请',
    status: 0,
    commission_rate: 1.0,
    create_time: '2023-10-05 16:45:00',
  },
])

const getData = async () => {
  pageLoading.value = true
  try {
    const res = await $myFetch('MerchantList', {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        keyword: search.value,
      },
    })
    if (res.code === 200) {
      const list = res.data?.list || []
      tableData.value = list.map((item) => ({
        ...item,
        name: item.merchantName || item.name,
        enterprise_name: item.companyName || item.enterprise_name,
        credit_code: item.ceditCode || item.credit_code,
        contact: item.contactName || item.contact,
        phone: item.contactPhone || item.phone,
        email: item.contactEmail || item.email,
        description: item.cooperationIntent || item.description,
      }))
      totalRecords.value = res.data?.total || 0
      totalPages.value = Math.ceil(totalRecords.value / pageSize.value)
    } else {
      tableData.value = []
      totalRecords.value = 0
      totalPages.value = 0
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
  title: '商户管理',
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
          <span class="title">商户管理</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            <span>新增商户</span>
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
            <el-table-column fixed="right" width="200" label="操作">
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
                  <el-button type="primary" link @click="handleEdit(scope.row)">
                    编辑
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
            <el-table-column prop="create_time" label="创建时间" width="160" />
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

    <!-- 创建/编辑商户对话框 -->
    <el-dialog
      v-model="dialogStatus"
      :title="isEdit ? '编辑商户' : '新增商户'"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form :model="merchantForm" label-width="100px">
        <el-form-item label="商户名称" required>
          <el-input v-model="merchantForm.name" placeholder="请输入商户名称" />
        </el-form-item>
        <el-form-item label="企业名称">
          <el-input
            v-model="merchantForm.enterprise_name"
            placeholder="请输入企业名称"
          />
        </el-form-item>
        <el-form-item label="信用代码">
          <el-input
            v-model="merchantForm.credit_code"
            placeholder="请输入统一社会信用代码"
          />
        </el-form-item>
        <el-form-item label="联系人" required>
          <el-input
            v-model="merchantForm.contact"
            placeholder="请输入联系人姓名"
          />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="merchantForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱地址">
          <el-input v-model="merchantForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="佣金比例">
          <el-input-number
            v-model="merchantForm.commission_rate"
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
          <el-button @click="dialogStatus = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="loading">
            确定
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
