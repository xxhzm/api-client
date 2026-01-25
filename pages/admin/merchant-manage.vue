<script setup>
import { Shop, Search, User, Phone, Message, Picture, OfficeBuilding, Monitor, Clock } from '@element-plus/icons-vue'
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

// 详情弹窗
const detailDialogVisible = ref(false)
const currentMerchant = ref(null)

// 编辑佣金弹窗
const commissionDialogVisible = ref(false)
const commissionForm = ref({
  id: 0,
  commission_rate: 0,
})

// 编辑商户弹窗
const editDialogVisible = ref(false)
const editForm = ref({
  id: 0,
  merchant_name: '',
  company_name: '',
  credit_code: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  description: '',
  commission_rate: 0,
  logo: '',
  is_display: 0,
  is_verified: 0,
})

// 查看详情
const handleViewDetail = (row) => {
  currentMerchant.value = row
  detailDialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (row) => {
  editForm.value = {
    id: row.id,
    merchant_name: row.merchant_name || '',
    company_name: row.company_name || '',
    credit_code: row.credit_code || '',
    contact_name: row.contact_name || '',
    contact_phone: row.contact_phone || '',
    contact_email: row.contact_email || '',
    description: row.description || '',
    commission_rate: row.commission_rate || 0,
    logo: row.logo || '',
    is_display: row.is_display || 0,
    is_verified: row.is_verified || 0,
  }
  editDialogVisible.value = true
}

// 提交编辑
const submitEdit = async () => {
  if (!editForm.value.merchant_name) {
    $msg('请填写商户名称', 'error')
    return
  }
  if (!editForm.value.contact_name) {
    $msg('请填写联系人', 'error')
    return
  }
  if (!editForm.value.contact_phone) {
    $msg('请填写联系电话', 'error')
    return
  }

  loading.value = true
  try {
    const apiBodyValue = new URLSearchParams()
    apiBodyValue.append('id', editForm.value.id)
    apiBodyValue.append('merchant_name', editForm.value.merchant_name)
    apiBodyValue.append('company_name', editForm.value.company_name)
    apiBodyValue.append('credit_code', editForm.value.credit_code)
    apiBodyValue.append('contact_name', editForm.value.contact_name)
    apiBodyValue.append('contact_phone', editForm.value.contact_phone)
    apiBodyValue.append('contact_email', editForm.value.contact_email)
    apiBodyValue.append('description', editForm.value.description)
    apiBodyValue.append('commission_rate', editForm.value.commission_rate)
    apiBodyValue.append('logo', editForm.value.logo)
    apiBodyValue.append('is_display', editForm.value.is_display)
    apiBodyValue.append('is_verified', editForm.value.is_verified)

    const res = await $myFetch('MerchantUpdate', {
      method: 'POST',
      body: apiBodyValue,
    })

    if (res.code === 200) {
      $msg(res.msg || '修改成功', 'success')
      editDialogVisible.value = false
      getData()
    } else {
      $msg(res.msg || '修改失败', 'error')
    }
  } catch (error) {
    $msg('修改失败', 'error')
  } finally {
    loading.value = false
  }
}

// 打开修改佣金弹窗
const handleEditCommission = (row) => {
  commissionForm.value = {
    id: row.id,
    commission_rate: row.commission_rate,
  }
  commissionDialogVisible.value = true
}

// 提交佣金修改
const submitCommission = async () => {
  loading.value = true
  try {
    const apiBodyValue = new URLSearchParams()
    apiBodyValue.append('id', commissionForm.value.id)
    apiBodyValue.append('commission_rate', commissionForm.value.commission_rate)

    const res = await $myFetch('MerchantUpdateCommission', {
      method: 'POST',
      body: apiBodyValue,
    })

    if (res.code === 200) {
      $msg(res.msg || '修改成功', 'success')
      commissionDialogVisible.value = false
      getData()
    } else {
      $msg(res.msg || '修改失败', 'error')
    }
  } catch (error) {
    $msg('修改失败', 'error')
  } finally {
    loading.value = false
  }
}

const getData = async () => {
  pageLoading.value = true
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value,
      status: 1, // 只获取已审核通过的商户
    }
    if (search.value) {
      params.keyword = search.value
    }

    const res = await $myFetch('MerchantList', { params })

    if (res.code === 200) {
      const list = res.data?.list || []
      tableData.value = list.map((item) => ({
        id: item.id,
        merchant_name: item.merchant_name,
        company_name: item.company_name,
        credit_code: item.credit_code,
        contact_name: item.contact_name,
        contact_phone: item.contact_phone,
        contact_email: item.contact_email,
        description: item.description,
        commission_rate: item.commission_rate,
        logo: item.logo,
        ip: item.ip,
        is_display: item.is_display,
        is_verified: item.is_verified,
        status: item.status,
        user_id: item.user_id,
        review_by: item.review_by,
        review_by_username: item.review_by_username,
        review_remark: item.review_remark,
        review_time: item.review_time
          ? new Date(item.review_time).toLocaleString()
          : '-',
        created_at: item.created_at
          ? new Date(item.created_at).toLocaleString()
          : '-',
        updated_at: item.updated_at
          ? new Date(item.updated_at).toLocaleString()
          : '-',
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

// 前台显示状态文本
const getDisplayText = (isDisplay) => {
  return isDisplay === 1 ? '前台显示' : '前台隐藏'
}

// 前台显示状态类型
const getDisplayType = (isDisplay) => {
  return isDisplay === 1 ? 'success' : 'info'
}

// 企业认证状态文本
const getVerifiedText = (isVerified) => {
  return isVerified === 1 ? '已认证' : '未认证'
}

// 企业认证状态类型
const getVerifiedType = (isVerified) => {
  return isVerified === 1 ? 'success' : 'warning'
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
          <el-tag type="success" size="small">已审核通过</el-tag>
        </div>
        <div class="header-right">
          <el-input
            v-model="search"
            placeholder="搜索商户/企业/联系人/电话/邮箱"
            clearable
            style="width: 280px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
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
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column
              prop="merchant_name"
              label="商户名称"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="company_name"
              label="企业名称"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column
              prop="credit_code"
              label="信用代码"
              min-width="180"
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
            <el-table-column prop="contact_name" label="联系人" width="100" />
            <el-table-column
              prop="contact_phone"
              label="联系电话"
              width="130"
            />
            <el-table-column
              prop="contact_email"
              label="联系邮箱"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              prop="description"
              label="描述"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column prop="logo" label="Logo" width="80">
              <template #default="scope">
                <el-image
                  v-if="scope.row.logo"
                  :src="scope.row.logo"
                  :preview-src-list="[scope.row.logo]"
                  fit="cover"
                  style="width: 40px; height: 40px; border-radius: 4px"
                />
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="ip" label="申请IP" width="130" />
            <el-table-column prop="is_display" label="前台显示" width="100">
              <template #default="scope">
                <el-tag
                  :type="getDisplayType(scope.row.is_display)"
                  size="small"
                >
                  {{ getDisplayText(scope.row.is_display) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="is_verified" label="企业认证" width="90">
              <template #default="scope">
                <el-tag
                  :type="getVerifiedType(scope.row.is_verified)"
                  size="small"
                >
                  {{ getVerifiedText(scope.row.is_verified) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="审核状态" width="90">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="user_id" label="用户ID" width="80" />
            <el-table-column prop="review_by_username" label="审核人" width="100">
              <template #default="scope">
                {{ scope.row.review_by_username || scope.row.review_by || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="review_remark"
              label="审核备注"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column prop="review_time" label="审核时间" width="170" />
            <el-table-column prop="created_at" label="创建时间" width="170" />
            <el-table-column prop="updated_at" label="更新时间" width="170" />
            <el-table-column fixed="right" width="180" label="操作">
              <template #default="scope">
                <div class="table-actions">
                  <el-button
                    type="primary"
                    link
                    @click="handleViewDetail(scope.row)"
                  >
                    详情
                  </el-button>
                  <el-button type="warning" link @click="handleEdit(scope.row)">
                    编辑
                  </el-button>
                  <el-popconfirm
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    title="确定要删除此商户吗？"
                    @confirm="handleDelete(scope.row)"
                  >
                    <template #reference>
                      <el-button type="danger" link>删除</el-button>
                    </template>
                  </el-popconfirm>
                </div>
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="商户详情"
      width="700px"
      append-to-body
      destroy-on-close
      class="detail-dialog"
    >
      <div class="detail-body" v-if="currentMerchant">
        <!-- 基本信息卡片 -->
        <div class="info-card">
          <div class="card-title">
            <el-icon><OfficeBuilding /></el-icon>
            <span>企业信息</span>
          </div>
          <div class="card-content">
            <div class="info-row">
              <div class="info-col">
                <label>信用代码</label>
                <p class="mono">{{ currentMerchant.credit_code || '-' }}</p>
              </div>
              <div class="info-col">
                <label>佣金比例</label>
                <p><span class="highlight-value">{{ currentMerchant.commission_rate }}%</span></p>
              </div>
            </div>
            <div class="info-row" v-if="currentMerchant.description">
              <div class="info-col full">
                <label>商户描述</label>
                <p>{{ currentMerchant.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 联系方式卡片 -->
        <div class="info-card">
          <div class="card-title">
            <el-icon><User /></el-icon>
            <span>联系方式</span>
          </div>
          <div class="card-content">
            <div class="contact-grid">
              <div class="contact-item">
                <div class="contact-icon"><el-icon><User /></el-icon></div>
                <div class="contact-info">
                  <label>联系人</label>
                  <p>{{ currentMerchant.contact_name }}</p>
                </div>
              </div>
              <div class="contact-item">
                <div class="contact-icon"><el-icon><Phone /></el-icon></div>
                <div class="contact-info">
                  <label>联系电话</label>
                  <p class="mono">{{ currentMerchant.contact_phone }}</p>
                </div>
              </div>
              <div class="contact-item">
                <div class="contact-icon"><el-icon><Message /></el-icon></div>
                <div class="contact-info">
                  <label>联系邮箱</label>
                  <p class="mono">{{ currentMerchant.contact_email }}</p>
                </div>
              </div>
              <div class="contact-item">
                <div class="contact-icon"><el-icon><Monitor /></el-icon></div>
                <div class="contact-info">
                  <label>申请IP</label>
                  <p class="mono">{{ currentMerchant.ip }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 审核与时间 -->
        <div class="info-card">
          <div class="card-title">
            <el-icon><Clock /></el-icon>
            <span>审核记录</span>
          </div>
          <div class="card-content">
            <div class="info-row three-col">
              <div class="info-col">
                <label>审核人</label>
                <p>{{ currentMerchant.review_by_username || currentMerchant.review_by || '-' }}</p>
              </div>
              <div class="info-col">
                <label>审核时间</label>
                <p>{{ currentMerchant.review_time }}</p>
              </div>
              <div class="info-col">
                <label>用户ID</label>
                <p>{{ currentMerchant.user_id || '-' }}</p>
              </div>
            </div>
            <div class="info-row" v-if="currentMerchant.review_remark">
              <div class="info-col full">
                <label>审核备注</label>
                <p>{{ currentMerchant.review_remark }}</p>
              </div>
            </div>
            <div class="time-footer">
              <span>创建: {{ currentMerchant.created_at }}</span>
              <span>更新: {{ currentMerchant.updated_at }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="detailDialogVisible = false; handleEdit(currentMerchant)">
            编辑信息
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改佣金对话框 -->
    <el-dialog
      v-model="commissionDialogVisible"
      title="修改佣金比例"
      width="400px"
      append-to-body
      destroy-on-close
    >
      <el-form :model="commissionForm" label-width="90px">
        <el-form-item label="佣金比例">
          <el-input-number
            v-model="commissionForm.commission_rate"
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
          <el-button @click="commissionDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitCommission"
            :loading="loading"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑商户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑商户信息"
      width="720px"
      append-to-body
      destroy-on-close
      class="edit-dialog"
    >
      <el-form :model="editForm" label-width="90px" class="edit-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="form-section-title">基本信息</div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="商户名称" required>
                <el-input
                  v-model="editForm.merchant_name"
                  placeholder="请输入商户名称"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="企业名称">
                <el-input
                  v-model="editForm.company_name"
                  placeholder="请输入企业名称"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="信用代码">
                <el-input
                  v-model="editForm.credit_code"
                  placeholder="请输入统一社会信用代码"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="佣金比例">
                <el-input-number
                  v-model="editForm.commission_rate"
                  :precision="2"
                  :step="0.1"
                  :min="0"
                  :max="100"
                  style="width: 100%"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="Logo地址">
                <el-input
                  v-model="editForm.logo"
                  placeholder="请输入Logo图片URL地址"
                >
                  <template #prefix>
                    <el-icon><Picture /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="描述">
                <el-input
                  v-model="editForm.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入商户描述信息"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 联系信息 -->
        <div class="form-section">
          <div class="form-section-title">联系信息</div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="联系人" required>
                <el-input
                  v-model="editForm.contact_name"
                  placeholder="请输入联系人姓名"
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" required>
                <el-input
                  v-model="editForm.contact_phone"
                  placeholder="请输入联系电话"
                >
                  <template #prefix>
                    <el-icon><Phone /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="联系邮箱">
                <el-input
                  v-model="editForm.contact_email"
                  placeholder="请输入联系邮箱"
                >
                  <template #prefix>
                    <el-icon><Message /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 状态设置 -->
        <div class="form-section">
          <div class="form-section-title">状态设置</div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="前台显示">
                <div class="switch-wrapper">
                  <el-switch
                    v-model="editForm.is_display"
                    :active-value="1"
                    :inactive-value="0"
                  />
                  <span class="switch-text">{{ editForm.is_display === 1 ? '前台显示' : '前台隐藏' }}</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="企业认证">
                <div class="switch-wrapper">
                  <el-switch
                    v-model="editForm.is_verified"
                    :active-value="1"
                    :inactive-value="0"
                  />
                  <span class="switch-text">{{ editForm.is_verified === 1 ? '已认证' : '未认证' }}</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="loading">
            保存修改
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
        display: flex;
        align-items: center;
        gap: 12px;
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
        flex-wrap: wrap;
      }

      .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

// 对话框通用样式
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;

  .el-dialog__header {
    margin: 0;
    padding: 16px 20px;
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;

    .el-dialog__title {
      font-size: 15px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 12px 20px;
    background: #f8fafc;
    border-top: 1px solid #e5e7eb;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;

      .el-button {
        padding: 8px 20px;
        font-weight: 500;
        font-size: 13px;
        border-radius: 6px;
      }
    }
  }
}

// 详情弹窗样式
.detail-body {
  padding: 20px;
  background: #f5f7fa;
  max-height: 50vh;
  overflow-y: auto;

  .info-card {
    background: #fff;
    border-radius: 10px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 18px;
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      border-bottom: 1px solid #f0f0f0;

      .el-icon {
        font-size: 16px;
        color: #3b82f6;
      }
    }

    .card-content {
      padding: 16px 18px;

      .info-row {
        display: flex;
        gap: 24px;
        margin-bottom: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        &.three-col {
          .info-col {
            flex: 1;
          }
        }

        .info-col {
          flex: 1;

          &.full {
            flex: none;
            width: 100%;
          }

          label {
            display: block;
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
            font-weight: 500;
          }

          p {
            font-size: 14px;
            color: #1f2937;
            margin: 0;
            word-break: break-all;

            &.mono {
              font-family: 'SF Mono', Monaco, Consolas, monospace;
              font-size: 13px;
              color: #374151;
            }

            .highlight-value {
              color: #1e40af;
              font-weight: 600;
              background: #eff6ff;
              padding: 2px 8px;
              border-radius: 4px;
            }
          }
        }
      }

      .contact-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;

          .contact-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: #eff6ff;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            .el-icon {
              font-size: 16px;
              color: #3b82f6;
            }
          }

          .contact-info {
            flex: 1;
            min-width: 0;

            label {
              display: block;
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 2px;
            }

            p {
              font-size: 14px;
              color: #1f2937;
              margin: 0;
              word-break: break-all;

              &.mono {
                font-family: 'SF Mono', Monaco, Consolas, monospace;
                font-size: 13px;
              }
            }
          }
        }
      }

      .time-footer {
        display: flex;
        justify-content: space-between;
        padding-top: 14px;
        margin-top: 14px;
        border-top: 1px dashed #e5e7eb;
        font-size: 12px;
        color: #9ca3af;
      }
    }
  }
}

// 编辑弹窗样式
.edit-form {
  padding: 20px;
  max-height: 65vh;
  overflow-y: auto;

  .form-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .form-section-title {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
      padding-left: 10px;
      border-left: 3px solid #3b82f6;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;

    .el-form-item__label {
      font-size: 13px;
      font-weight: 500;
      color: #4b5563;
    }

    .el-input__wrapper {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      box-shadow: none;
      transition: all 0.2s;

      &:hover {
        border-color: #d1d5db;
      }

      &.is-focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }
    }

    .el-textarea__inner {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      box-shadow: none;
      transition: all 0.2s;

      &:hover {
        border-color: #d1d5db;
      }

      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }
    }

    .el-input-number {
      .el-input__wrapper {
        padding-right: 40px;
      }
    }
  }

  .switch-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;

    .switch-text {
      font-size: 13px;
      color: #6b7280;
    }
  }

  :deep(.el-switch.is-checked) {
    .el-switch__core {
      background-color: #3b82f6;
      border-color: #3b82f6;
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
