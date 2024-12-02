<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="userlist-container" v-loading="loading">
        <client-only>
          <el-button
            type="primary"
            style="margin-bottom: 20px; float: left"
            size="small"
            @click="createUserStatus = true"
            >新增用户</el-button
          >
          <el-pagination
            :page-size="25"
            :pager-count="5"
            :total="totalRecords"
            v-model:current-page="page"
            :disabled="pageLoading"
            size="small"
            background
            layout="prev, pager, next"
            style="float: right; margin-right: 100px"
          />
          <!-- <el-button
            type="success"
            style="margin-bottom: 20px"
            size="small"
            @click="getAddress"
            >显示用户归属地</el-button
          > -->
          <el-table
            v-loading="pageLoading"
            :data="filterTableData"
            style="width: 100%"
            height="96%"
          >
            <el-table-column prop="id" label="id" width="100" />
            <el-table-column prop="username" label="用户名称" width="130" />
            <el-table-column prop="mail" label="邮箱地址" width="200" />
            <el-table-column prop="create_time" label="注册时间" width="180" />
            <el-table-column
              prop="login_time"
              label="上次登录时间"
              width="180"
            />
            <el-table-column prop="status" label="状态" width="80" />
            <el-table-column prop="ip" label="ip" width="150" />
            <el-table-column prop="balance" label="账户余额" width="150" />
            <el-table-column width="300">
              <template #header>
                <el-input
                  v-model="search"
                  size="small"
                  placeholder="Type to search"
                />
              </template>
              <template #default="scope">
                <el-button
                  size="small"
                  type="info"
                  @click="handleUserBindRoleList(scope.$index, scope.row)"
                  >查看用户拥有角色</el-button
                >
                <el-button
                  size="small"
                  @click="handleEdit(scope.$index, scope.row)"
                  >编辑</el-button
                >
                <el-popconfirm
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                  title="您确定要删除吗?"
                  width="160px"
                  @confirm="handleDelete(scope.$index, scope.row)"
                >
                  <template #reference>
                    <el-button size="small" type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>

          <el-dialog
            v-model="createUserStatus"
            :title="disabled ? '修改用户' : '添加用户'"
            width="500"
            center
          >
            <el-form :model="userInfo" label-position="top" label-width="120px">
              <el-form-item label="用户名称">
                <el-input v-model="userInfo.username" :disabled="disabled" />
              </el-form-item>

              <el-form-item label="密码">
                <el-input
                  type="password"
                  v-model="userInfo.password"
                  show-password
                />
              </el-form-item>

              <el-form-item label="邮箱地址">
                <el-input v-model="userInfo.mail" />
              </el-form-item>

              <el-form-item label="账户余额" v-if="disabled">
                <el-input v-model="userInfo.balance" />
              </el-form-item>

              <el-form-item label="用户状态" v-if="disabled">
                <el-select v-model="userInfo.status" placeholder="用户状态">
                  <el-option label="启用" value="启用" />
                  <el-option label="停用" value="停用" />
                </el-select>
              </el-form-item>

              <el-select
                v-model="bindRoleInfo"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择要绑定的角色"
                v-if="disabled"
              >
                <el-option
                  v-for="item in roleList"
                  :key="item.role_id"
                  :label="item.role_name"
                  :value="item.role_id"
                />
              </el-select>
            </el-form>
            <template #footer>
              <div style="flex: auto">
                <el-button @click="createUserStatus = false">取消</el-button>
                <el-button type="primary" @click="submit">{{
                  disabled ? '修改' : '创建'
                }}</el-button>
              </div>
            </template>
          </el-dialog>

          <!-- 查看用户拥有角色弹窗 -->
          <el-dialog
            v-model="userBindRoleListStatus"
            title="角色列表"
            width="500"
            center
            destroy-on-close
          >
            <el-table :data="userBindRoleList">
              <el-table-column prop="role_id" label="ID" width="80" />
              <el-table-column prop="role_name" label="角色名称" width="200" />
              <el-table-column prop="description" label="描述" width="200" />
            </el-table>
          </el-dialog>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $msg, $myFetch } = useNuxtApp()

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

useHead({
  title: '用户列表',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<style lang="less" scoped>
.container {
  display: flex;
  .right {
    width: 100%;
    overflow-x: hidden;
    .userlist-container {
      width: 100%;
      height: calc(100vh - 65px);
      padding-left: 20px;
      padding-top: 15px;
    }
  }
}
</style>
