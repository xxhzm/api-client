<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="userlist-container" v-loading="loading">
        <client-only>
          <el-button
            type="primary"
            style="margin-bottom: 20px"
            size="small"
            @click="createUserStatus = true"
            >新增用户</el-button
          >
          <el-button
            type="success"
            style="margin-bottom: 20px"
            size="small"
            @click="getAddress"
            >显示用户归属地</el-button
          >

          <el-table :data="filterTableData" style="width: 100%" height="96%">
            <el-table-column width="120">
              <template #header>
                <el-input
                  v-model="search"
                  size="small"
                  placeholder="Type to search"
                />
              </template>
              <template #default="scope">
                <el-popconfirm
                  confirm-button-text="Yes"
                  cancel-button-text="No"
                  title="你确定要删除吗?"
                  @confirm="handleDelete(scope.$index, scope.row)"
                >
                  <template #reference>
                    <el-button size="small" type="danger">Delete</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="id" width="100" />
            <el-table-column prop="username" label="用户名称" width="130" />
            <el-table-column prop="group" label="用户组" width="80" />
            <el-table-column prop="mail" label="邮箱地址" width="200" />
            <el-table-column prop="create_time" label="注册时间" width="180" />
            <el-table-column
              prop="login_time"
              label="上次登录时间"
              width="180"
            />
            <el-table-column prop="address" label="归属地" width="200" />
            <el-table-column prop="ip" label="ip" width="130" />
            <el-table-column prop="token" label="token" width="200" />
            <el-table-column prop="password" label="密码" width="200" />
          </el-table>

          <el-drawer v-model="createUserStatus" direction="rtl">
            <template #header>
              <h2>添加用户</h2>
            </template>
            <template #default>
              <el-form
                :model="userInfo"
                label-position="top"
                label-width="120px"
              >
                <el-form-item label="用户名称">
                  <el-input v-model="userInfo.username" />
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

                <el-form-item label="用户等级">
                  <el-select v-model="userInfo.group" placeholder="请选择">
                    <el-option label="管理员" value="administrator" />
                    <el-option label="贡献者" value="contributor" />
                    <el-option label="关注者" value="subscriber" />
                  </el-select>
                </el-form-item>
              </el-form>
            </template>
            <template #footer>
              <div style="flex: auto">
                <el-button @click="createUserStatus = false">取消</el-button>
                <el-button type="primary" @click="createUser">创建</el-button>
              </div>
            </template>
          </el-drawer>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios"

const token = useCookie('token')

const { $msg } = useNuxtApp()

const loading = ref(false)
const tableData = ref([])
const search = ref('')

const getData = async () => {
  const { data: res } = await axios.get('UserList')

  res.data.forEach((element, key) => {
    res.data[key].login_time = new Date(element.login_time).toLocaleString()
    res.data[key].create_time = new Date(element.create_time).toLocaleString()

    if (res.data[key].group === 'administrator') {
      res.data[key].group = '管理员'
    } else if (res.data[key].group === 'contributor') {
      res.data[key].group = '贡献者'
    } else if (res.data[key].group === 'subscriber') {
      res.data[key].group = '关注者'
    }
  })

  tableData.value = res.data
}

onMounted(() => {
  getData()
})

const filterTableData = computed(() =>
  tableData.value.filter((data) =>
    !search.value ||
    data.username.toLowerCase().includes(search.value.toLowerCase()) || data.mail.toLowerCase().includes(search.value.toLowerCase())
  )
)

const handleDelete = async (index, row) => {
  loading.value = true

  const { data: res } = await axios.get('DeleteUser', {
    params: {
      id: row.id
    }
  })

  $msg(res.data, 'success')

  await getData()

  loading.value = false
}

const getAddress = async () => {
  tableData.value.forEach(async (element, key) => {
    const { data: ip } = await axios.get('https://v2.api-m.com/api/ip', {
      params: {
        ip: element.ip
      }
    })

    tableData.value[key].address = ip.data.address
  })
}

const createUserStatus = ref(false)

const userInfo = ref({
  username: '',
  password: '',
  mail: '',
  group: '',
})

const createUser = async () => {
  if (!userInfo.value.username || !userInfo.value.password || !userInfo.value.mail || userInfo.value.group === '') {
    $msg('请填写内容', 'error')
    return false
  }

  const apiBodyValue = new URLSearchParams()
  apiBodyValue.append('username', userInfo.value.username)
  apiBodyValue.append('password', userInfo.value.password)
  apiBodyValue.append('mail', userInfo.value.mail)
  apiBodyValue.append('group', userInfo.value.group)

  const { data: res } = await axios.post('CreateUser', apiBodyValue)

  createUserStatus.value = false
  userInfo.value.username = ''
  userInfo.value.password = ''
  userInfo.value.mail = ''
  userInfo.value.group = ''

  getData()
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