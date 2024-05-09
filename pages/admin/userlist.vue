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
            :page-size="15"
            :pager-count="5"
            :total="totalRecords"
            v-model:current-page="page"
            :disabled="pageLoading"
            small
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
            <el-table-column prop="ip" label="ip" width="130" />
            <el-table-column width="250">
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
                  @click="handleRole(scope.$index, scope.row)"
                  >绑定角色</el-button
                >
                <el-button
                  size="small"
                  type="info"
                  @click="handleUserBindRoleList(scope.$index, scope.row)"
                  >拥有角色</el-button
                >
                <el-popconfirm
                  confirm-button-text="Yes"
                  cancel-button-text="No"
                  title="你确定要删除吗?"
                  @confirm="handleDelete(scope.$index, scope.row)"
                >
                  <template #reference>
                    <el-button size="small" type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>

          <el-drawer v-model="createUserStatus" direction="rtl">
            <template #header>
              <h2>{{ disabled ? '修改用户' : '添加用户' }}</h2>
            </template>
            <template #default>
              <el-form
                :model="userInfo"
                label-position="top"
                label-width="120px"
              >
                <el-form-item label="用户名称">
                  <el-input v-model="userInfo.username" :disabled="disabled" />
                </el-form-item>

                <el-form-item label="密码">
                  <el-input
                    type="password"
                    v-model="userInfo.password"
                    show-password
                    :disabled="disabled"
                  />
                </el-form-item>

                <el-form-item label="邮箱地址">
                  <el-input v-model="userInfo.mail" :disabled="disabled" />
                </el-form-item>
              </el-form>
            </template>
            <template #footer>
              <div style="flex: auto">
                <el-button @click="createUserStatus = false">取消</el-button>
                <el-button type="primary" @click="submit">{{
                  disabled ? '修改' : '创建'
                }}</el-button>
              </div>
            </template>
          </el-drawer>

          <!-- 绑定角色对话框 -->
          <el-dialog
            v-model="bindRoleDialogStatus"
            title="绑定角色"
            width="270"
            center
          >
            <el-select
              v-model="bindRoleInfo"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择要绑定的角色"
              style="width: 240px"
            >
              <el-option
                v-for="item in roleList"
                :key="item.role_id"
                :label="item.role_name"
                :value="item.role_id"
              />
            </el-select>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="bindRoleDialogStatus = false"
                  >取消</el-button
                >
                <el-button type="primary" @click="handlebindRoleSubmit">
                  确定
                </el-button>
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
})

const getData = async () => {
  const { data: res } = await $myFetch('UserList', {
    params: {
      page: page.value,
    },
  })

  res.userList.forEach((element, key) => {
    if (element.status === '0') {
      res.userList[key].status = '启用'
    } else {
      res.userList[key].status = '停用'
    }

    res.userList[key].login_time = new Date(element.login_time).toLocaleString()
    res.userList[key].create_time = new Date(
      element.create_time
    ).toLocaleString()
  })

  tableData.value = res.userList
  totalPages.value = res.totalPages
  totalRecords.value = res.totalRecords
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

const handleEdit = (index, row) => {
  createUserStatus.value = true
  disabled.value = true

  userInfo.value.id = row.id
  userInfo.value.username = row.username
  userInfo.value.password = row.password
  userInfo.value.mail = row.mail
}

// 删除用户按钮
const handleDelete = async (index, row) => {
  loading.value = true

  const { data: res } = await $myFetch('DeleteUser', {
    params: {
      id: row.id,
    },
  })

  $msg(res.data, 'success')
  await getData()
  loading.value = false
}

// 显示用户归属地
const getAddress = async () => {
  tableData.value.forEach(async (element, key) => {
    const { data: ip } = await $myFetch('https://v2.api-m.com/api/ip', {
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

  const { data: res } = await $myFetch('CreateUser', {
    method: 'POST',
    body: apiBodyValue,
  })

  createUserStatus.value = false
  getData()
}

// 修改用户
const updateUser = async () => {
  if (
    !userInfo.value.username ||
    !userInfo.value.password ||
    !userInfo.value.mail
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  console.log(userInfo.value.id)
  const apiBodyValue = new URLSearchParams()
  apiBodyValue.append('id', userInfo.value.id)

  const { data: res } = await $myFetch('UpdateUser', {
    method: 'POST',
    body: apiBodyValue,
  })

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
  }
})

// 绑定角色
const bindRoleDialogStatus = ref(false)
const bindRoleInfo = ref({})
const roleList = ref({})
const userId = ref()

// 规则绑定角色表格按钮
const handleRole = async (index, row) => {
  userId.value = row.id
  bindRoleDialogStatus.value = true

  // 向服务器获取角色列表
  const { data: res } = await $myFetch('RoleList')
  roleList.value = res
}

const handlebindRoleSubmit = async () => {
  if (bindRoleInfo.value[0] === undefined) {
    $msg('请选择要绑定的角色', 'error')
    return
  }

  const res = await $myFetch('UserBindRole', {
    params: {
      info: JSON.stringify(bindRoleInfo.value),
      userId: userId.value,
    },
  })

  bindRoleDialogStatus.value = false
  if (res.code === 200) {
    $msg(res.data, 'success')
  } else {
    $msg(res.data, 'error')
  }
}

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
