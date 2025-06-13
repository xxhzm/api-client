<script setup>
import { User, Menu } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

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

const loading = ref(false)
const tableData = ref([])
const search = ref('')

// 当前页数
const page = ref(1)
// 总页数
const totalPages = ref(1)
// 总记录
const totalRecords = ref(50)
// 页数loading
const pageLoading = ref(false)

// 抽屉显示状态
const createUserStatus = ref(false)
const disabled = ref(false)

const userInfo = ref({
  id: 0,
  username: '',
  password: '',
  mail: '',
  balance: 0,
  status: '',
})

const getData = async () => {
  const res = await $myFetch('UserList', {
    params: {
      page: page.value,
    },
  })

  if (res.code !== 200) {
    return
  }

  res.data.userList.forEach((element, key) => {
    if (element.status === '0') {
      res.data.userList[key].status = '启用'
    } else {
      res.data.userList[key].status = '停用'
    }

    res.data.userList[key].login_time = new Date(
      element.login_time
    ).toLocaleString()
    res.data.userList[key].create_time = new Date(
      element.create_time
    ).toLocaleString()
  })

  tableData.value = res.data.userList
  totalPages.value = res.data.totalPages
  totalRecords.value = res.data.totalRecords
}

onMounted(() => {
  getData()
})

// 搜索框
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.username.toLowerCase().includes(search.value.toLowerCase()) ||
      data.mail.toLowerCase().includes(search.value.toLowerCase())
  )
)
// 当前选择的角色
const bindRoleInfo = ref({})
// 角色列表
const roleList = ref({})
// 修改用户
const handleEdit = async (index, row) => {
  createUserStatus.value = true
  disabled.value = true

  userInfo.value.id = row.id
  userInfo.value.username = row.username
  userInfo.value.password = row.password
  userInfo.value.mail = row.mail
  userInfo.value.balance = row.balance
  userInfo.value.status = row.status

  // 向服务器获取角色列表
  const { data: res } = await $myFetch('RoleList')
  roleList.value = res
}

// 监听修改用户弹窗是否关闭
watch(createUserStatus, (newValue) => {
  if (newValue === false) {
    bindRoleInfo.value = []
  }
})

// 删除用户按钮
const handleDelete = async (index, row) => {
  loading.value = true

  const res = await $myFetch('DeleteUser', {
    params: {
      id: row.id,
    },
  })

  $msg(res.msg, 'success')
  await getData()
  loading.value = false
}

// 显示用户归属地
const getAddress = async () => {
  tableData.value.forEach(async (element, key) => {
    const { data: ip } = await $myFetch('https://v2.xxapi.cn/api/ip', {
      params: {
        ip: element.ip,
      },
    })

    tableData.value[key].address = ip.data.address
  })
}

const submit = () => {
  if (disabled.value === true) {
    updateUser()
  } else {
    createUser()
  }
}

// 创建用户
const createUser = async () => {
  if (
    !userInfo.value.username ||
    !userInfo.value.password ||
    !userInfo.value.mail
  ) {
    $msg('请填写内容', 'error')
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

  createUserStatus.value = false
  getData()

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }
}

// 修改用户
const updateUser = async () => {
  if (!userInfo.value.username || !userInfo.value.mail) {
    $msg('请填写内容', 'error')
    createUserStatus.value = false
    return false
  }

  if (userInfo.value.balance > 4294967295) {
    $msg('余额过大，超出限制', 'error')
    createUserStatus.value = false
    return false
  }

  if (userInfo.value.balance < 0) {
    $msg('余额不能小于0', 'error')
    createUserStatus.value = false
    return false
  }

  // 绑定角色
  if ((Object.keys(bindRoleInfo.value).length !== 0) === true) {
    const res = await $myFetch('UserBindRole', {
      params: {
        info: JSON.stringify(bindRoleInfo.value),
        userId: userInfo.value.id,
      },
    })
    if (res.code !== 200) {
      $msg(res.msg, 'error')
    }

    bindRoleInfo.value = []
  }

  // 修改用户信息
  const apiBodyValue = new URLSearchParams()
  apiBodyValue.append('id', userInfo.value.id)
  if (userInfo.value.password) {
    apiBodyValue.append('password', userInfo.value.password)
  }
  apiBodyValue.append('mail', userInfo.value.mail)
  apiBodyValue.append('balance', userInfo.value.balance)
  apiBodyValue.append('status', userInfo.value.status)

  const res = await $myFetch('UpdateUser', {
    method: 'POST',
    body: apiBodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }

  createUserStatus.value = false
  getData()
}

// 监听抽屉是否关闭
watch(createUserStatus, (newValue) => {
  if (newValue === false) {
    disabled.value = false
    userInfo.value.id = 0
    userInfo.value.username = ''
    userInfo.value.password = ''
    userInfo.value.mail = ''
    userInfo.value.balance = 0
  }
})

// 监听页数变化
watch(
  () => page.value,
  async (newValue) => {
    pageLoading.value = true
    await getData()
    setTimeout(() => {
      pageLoading.value = false
    }, 300)
  }
)

// 查询用户拥有的角色
const userBindRoleListStatus = ref(false)
const userBindRoleList = ref({})

const handleUserBindRoleList = async (index, row) => {
  pageLoading.value = true

  const res = await $myFetch('UserBindRoleList', {
    params: {
      id: row.id,
    },
  })

  if (typeof res.data === 'string') {
    userBindRoleList.value = []
  } else {
    userBindRoleList.value = res.data
  }

  userBindRoleListStatus.value = true
  pageLoading.value = false
}

// 修改用户状态
const handleStatusChange = async (row) => {
  loading.value = true

  const apiBodyValue = new URLSearchParams()
  apiBodyValue.append('id', row.id)
  apiBodyValue.append('mail', row.mail)
  apiBodyValue.append('balance', row.balance)
  apiBodyValue.append('status', row.status === '启用' ? '停用' : '启用')

  const res = await $myFetch('UpdateUser', {
    method: 'POST',
    body: apiBodyValue,
  })

  if (res.code === 200) {
    row.status = row.status === '启用' ? '停用' : '启用'
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }

  loading.value = false
}

// 用户充值记录相关
const rechargeRecordDialogVisible = ref(false)
const rechargeRecords = ref([])
const rechargeLoading = ref(false)
const currentUserId = ref(null)
const rechargePage = ref(1)
const rechargePageSize = ref(10)
const rechargeTotalRecords = ref(0)

// 获取用户充值记录
const fetchUserRechargeRecords = async () => {
  rechargeLoading.value = true
  try {
    const params = {
      page: rechargePage.value,
      limit: rechargePageSize.value,
      uid: currentUserId.value,
    }

    const res = await $myFetch('GetRechargeRecords', { params })
    if (res.code === 200) {
      rechargeRecords.value = res.data.data || []
      rechargeTotalRecords.value = res.data.total_records || 0
    } else {
      $msg(res.msg || '获取充值记录失败', 'error')
    }
  } catch (error) {
    $msg('获取充值记录失败', 'error')
  } finally {
    rechargeLoading.value = false
  }
}

// 处理查看用户充值记录
const handleUserRechargeRecord = (row) => {
  currentUserId.value = row.id
  rechargePage.value = 1
  rechargeRecordDialogVisible.value = true
  fetchUserRechargeRecords()
}

// 监听充值记录页码变化
watch(rechargePage, () => {
  if (rechargeRecordDialogVisible.value) {
    fetchUserRechargeRecords()
  }
})

// 处理充值记录页面切换
const handleRechargePageChange = (newPage) => {
  rechargePage.value = newPage
  fetchUserRechargeRecords()
}

// 处理充值记录每页显示数量变化
const handleRechargeSizeChange = (newSize) => {
  rechargePageSize.value = newSize
  rechargePage.value = 1
  fetchUserRechargeRecords()
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

// 用户购买记录相关
const buyPackageRecordDialogVisible = ref(false)
const buyPackageDetailDialogVisible = ref(false)
const buyPackageRecords = ref([])
const buyPackageLoading = ref(false)
const currentBuyPackageRecord = ref(null)
const buyPackagePage = ref(1)
const buyPackagePageSize = ref(10)
const buyPackageTotalRecords = ref(0)

// 获取用户购买记录
const fetchUserBuyPackageRecords = async () => {
  buyPackageLoading.value = true
  try {
    const params = {
      page: buyPackagePage.value,
      limit: buyPackagePageSize.value,
      uid: currentUserId.value,
    }

    const res = await $myFetch('GetBuyPackageRecords', { params })
    if (res.code === 200) {
      buyPackageRecords.value = res.data.data || []
      buyPackageTotalRecords.value = res.data.total_records || 0
    } else {
      $msg(res.msg || '获取购买记录失败', 'error')
    }
  } catch (error) {
    $msg('获取购买记录失败', 'error')
  } finally {
    buyPackageLoading.value = false
  }
}

// 处理查看用户购买记录
const handleUserBuyPackageRecord = (row) => {
  currentUserId.value = row.id
  buyPackagePage.value = 1
  buyPackageRecordDialogVisible.value = true
  fetchUserBuyPackageRecords()
}

// 监听购买记录页码变化
watch(buyPackagePage, () => {
  if (buyPackageRecordDialogVisible.value) {
    fetchUserBuyPackageRecords()
  }
})

// 处理购买记录页面切换
const handleBuyPackagePageChange = (newPage) => {
  buyPackagePage.value = newPage
  fetchUserBuyPackageRecords()
}

// 处理购买记录每页显示数量变化
const handleBuyPackageSizeChange = (newSize) => {
  buyPackagePageSize.value = newSize
  buyPackagePage.value = 1
  fetchUserBuyPackageRecords()
}

// 显示购买记录详情
const showBuyPackageDetail = (record) => {
  currentBuyPackageRecord.value = record
  buyPackageDetailDialogVisible.value = true
}

useHead({
  title: '用户列表',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

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
      <div class="userlist-container" v-loading="loading">
        <div class="user-card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <User />
              </el-icon>
              <span class="title">用户列表</span>
            </div>
            <div class="header-right">
              <el-button type="primary" @click="createUserStatus = true">
                <span>新增用户</span>
              </el-button>
            </div>
          </div>

          <!-- 表格区域 -->
          <div class="table-container">
            <client-only>
              <el-table
                :data="filterTableData"
                style="width: 100%"
                v-loading="pageLoading"
              >
                <el-table-column width="200" fixed="right">
                  <template #header>
                    <div class="search-wrapper">
                      <el-input v-model="search" placeholder="搜索" clearable>
                      </el-input>
                    </div>
                  </template>
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button
                        type="primary"
                        link
                        @click="handleEdit(scope.$index, scope.row)"
                      >
                        编辑
                      </el-button>
                      <el-button
                        type="info"
                        link
                        @click="handleUserBindRoleList(scope.$index, scope.row)"
                      >
                        角色
                      </el-button>
                      <el-popconfirm
                        confirm-button-text="确定"
                        cancel-button-text="取消"
                        title="确定要删除吗？"
                        @confirm="handleDelete(scope.$index, scope.row)"
                      >
                        <template #reference>
                          <el-button type="danger" link> 删除 </el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="id" label="ID" width="55" />
                <el-table-column prop="username" label="用户名称" width="130" />
                <el-table-column
                  prop="mail"
                  label="邮箱地址"
                  width="200"
                  show-overflow-tooltip
                />
                <el-table-column prop="balance" label="账户余额" width="120">
                  <template #default="scope">
                    <span class="balance">{{ scope.row.balance }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === '启用' ? 'success' : 'danger'"
                      size="small"
                      style="cursor: pointer"
                      @click="handleStatusChange(scope.row)"
                    >
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="充值记录" width="100" align="center">
                  <template #default="scope">
                    <el-button
                      type="success"
                      link
                      @click="handleUserRechargeRecord(scope.row)"
                    >
                      查看记录
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column label="购买记录" width="100" align="center">
                  <template #default="scope">
                    <el-button
                      type="primary"
                      link
                      @click="handleUserBuyPackageRecord(scope.row)"
                    >
                      查看记录
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="create_time"
                  label="注册时间"
                  width="180"
                />
                <el-table-column
                  prop="login_time"
                  label="上次登录时间"
                  width="180"
                />
                <el-table-column prop="ip" label="IP" width="150" />
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

          <!-- 新增/编辑用户对话框 -->
          <el-dialog
            v-model="createUserStatus"
            :title="disabled ? '修改用户' : '新增用户'"
            width="500px"
            destroy-on-close
          >
            <el-form :model="userInfo" label-width="90px">
              <el-form-item label="用户名称" required>
                <el-input
                  v-model="userInfo.username"
                  :disabled="disabled"
                  placeholder="请输入用户名称"
                />
              </el-form-item>
              <el-form-item label="密码" required>
                <el-input
                  type="password"
                  v-model="userInfo.password"
                  show-password
                  placeholder="请输入密码"
                />
              </el-form-item>
              <el-form-item label="邮箱地址" required>
                <el-input
                  v-model="userInfo.mail"
                  placeholder="请输入邮箱地址"
                />
              </el-form-item>
              <el-form-item label="账户余额" v-if="disabled">
                <el-input
                  v-model="userInfo.balance"
                  placeholder="请输入账户余额"
                />
              </el-form-item>
              <el-form-item label="用户状态" v-if="disabled">
                <el-select
                  v-model="userInfo.status"
                  placeholder="请选择用户状态"
                  class="full-width"
                >
                  <el-option label="启用" value="启用" />
                  <el-option label="停用" value="停用" />
                </el-select>
              </el-form-item>
              <el-form-item label="绑定角色" v-if="disabled">
                <el-select
                  v-model="bindRoleInfo"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="请选择要绑定的角色"
                  class="full-width"
                >
                  <el-option
                    v-for="item in roleList"
                    :key="item.role_id"
                    :label="item.role_name"
                    :value="item.role_id"
                  />
                </el-select>
              </el-form-item>
            </el-form>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="createUserStatus = false">取消</el-button>
                <el-button type="primary" @click="submit">{{
                  disabled ? '修改' : '创建'
                }}</el-button>
              </div>
            </template>
          </el-dialog>

          <!-- 用户角色列表对话框 -->
          <el-dialog
            v-model="userBindRoleListStatus"
            title="用户角色"
            width="500px"
            destroy-on-close
          >
            <el-table :data="userBindRoleList">
              <el-table-column prop="role_id" label="ID" width="80" />
              <el-table-column prop="role_name" label="角色名称" width="200" />
              <el-table-column
                prop="description"
                label="描述"
                min-width="200"
                show-overflow-tooltip
              />
            </el-table>
          </el-dialog>

          <!-- 用户充值记录对话框 -->
          <el-dialog
            v-model="rechargeRecordDialogVisible"
            title="用户充值记录"
            width="800px"
            destroy-on-close
          >
            <div v-loading="rechargeLoading">
              <el-table :data="rechargeRecords" style="width: 100%">
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
              </el-table>

              <!-- 分页 -->
              <div class="pagination" style="margin-top: 20px">
                <el-pagination
                  :page-size="rechargePageSize"
                  :pager-count="5"
                  :total="rechargeTotalRecords"
                  v-model:current-page="rechargePage"
                  :disabled="rechargeLoading"
                  background
                  :page-sizes="[10, 20, 30, 50]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @current-change="handleRechargePageChange"
                  @size-change="handleRechargeSizeChange"
                />
              </div>
            </div>
          </el-dialog>

          <!-- 用户购买记录对话框 -->
          <el-dialog
            v-model="buyPackageRecordDialogVisible"
            title="用户购买记录"
            width="800px"
            destroy-on-close
          >
            <div v-loading="buyPackageLoading">
              <el-table :data="buyPackageRecords" style="width: 100%">
                <el-table-column
                  prop="id"
                  label="ID"
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
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button
                        type="primary"
                        link
                        @click="showBuyPackageDetail(scope.row)"
                      >
                        详情
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <div class="pagination" style="margin-top: 20px">
                <el-pagination
                  :page-size="buyPackagePageSize"
                  :pager-count="5"
                  :total="buyPackageTotalRecords"
                  v-model:current-page="buyPackagePage"
                  :disabled="buyPackageLoading"
                  background
                  :page-sizes="[10, 20, 30, 50]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @current-change="handleBuyPackagePageChange"
                  @size-change="handleBuyPackageSizeChange"
                />
              </div>
            </div>
          </el-dialog>

          <!-- 购买记录详情对话框 -->
          <el-dialog
            v-model="buyPackageDetailDialogVisible"
            title="套餐购买详情"
            width="500px"
          >
            <div class="detail-content" v-if="currentBuyPackageRecord">
              <div class="detail-item">
                <span class="label">订单ID：</span>
                <span class="value">{{ currentBuyPackageRecord.id }}</span>
              </div>
              <div class="detail-item">
                <span class="label">用户ID：</span>
                <span class="value">{{ currentBuyPackageRecord.uid }}</span>
              </div>
              <div class="detail-item">
                <span class="label">接口ID：</span>
                <span class="value">{{ currentBuyPackageRecord.aid }}</span>
              </div>
              <div class="detail-item">
                <span class="label">套餐名称：</span>
                <span class="value">{{ currentBuyPackageRecord.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">套餐ID：</span>
                <span class="value">{{
                  currentBuyPackageRecord.package_id
                }}</span>
              </div>
              <div class="detail-item">
                <span class="label">支付金额：</span>
                <span class="value amount"
                  >¥{{ currentBuyPackageRecord.amount }}</span
                >
              </div>
              <div class="detail-item">
                <span class="label">套餐时长：</span>
                <span class="value"
                  >{{ currentBuyPackageRecord.duration }}天</span
                >
              </div>
              <div class="detail-item">
                <span class="label">订单状态：</span>
                <span
                  class="value"
                  :class="`status-${
                    currentBuyPackageRecord.status === 1 ? 'success' : 'pending'
                  }`"
                >
                  {{ currentBuyPackageRecord.status === 1 ? '有效' : '无效' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">套餐类型：</span>
                <span class="value">{{
                  currentBuyPackageRecord.type === 2 ? '按时间' : '按次数'
                }}</span>
              </div>
              <div
                class="detail-item"
                v-if="currentBuyPackageRecord.package_points > 0"
              >
                <span class="label">套餐点数：</span>
                <span class="value">{{
                  currentBuyPackageRecord.package_points
                }}</span>
              </div>
              <div
                class="detail-item"
                v-if="
                  currentBuyPackageRecord.points > 0 ||
                  currentBuyPackageRecord.points_used > 0
                "
              >
                <span class="label">剩余/已用：</span>
                <span class="value"
                  >{{ currentBuyPackageRecord.points }} /
                  {{ currentBuyPackageRecord.points_used }}</span
                >
              </div>
              <div class="detail-item">
                <span class="label">创建时间：</span>
                <span class="value">{{
                  formatTimestamp(currentBuyPackageRecord.create_time)
                }}</span>
              </div>
              <div class="detail-item">
                <span class="label">过期时间：</span>
                <span class="value">{{
                  formatTimestamp(currentBuyPackageRecord.expire_time)
                }}</span>
              </div>
            </div>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="buyPackageDetailDialogVisible = false"
                  >关闭</el-button
                >
              </span>
            </template>
          </el-dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  background: #f5f7fa;

  .right {
    width: 100%;
    min-width: 0;
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
    .userlist-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .user-card {
        width: 100%;
        max-width: 1400px;
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

            .balance {
              color: #0ea5e9;
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
          }
        }
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

@media screen and (max-width: 1200px) {
  .container .right .userlist-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .userlist-container {
    padding: 12px;
  }
}
</style>
