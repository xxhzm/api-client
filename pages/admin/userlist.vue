<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="userlist-container" v-loading="loading">
        <el-button
          type="primary"
          style="margin-bottom: 20px"
          size="small"
          @click="navigateTo('/admin/addapi')"
          >新增接口</el-button
        >
        <el-table :data="filterTableData" style="width: 100%" height="96%">
          <el-table-column width="150">
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
                @click="handleEdit(scope.$index, scope.row)"
                >Edit</el-button
              >
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
          <el-table-column prop="grade" label="权限" width="60" />
          <el-table-column prop="mail" label="邮箱地址" width="200" />
          <el-table-column prop="create_time" label="注册时间" width="180" />
          <el-table-column prop="login_time" label="上次登录时间" width="180" />
          <el-table-column prop="address" label="归属地" width="200" />
          <el-table-column prop="ip" label="ip" width="130" />
          <el-table-column prop="token" label="token" width="200" />
          <el-table-column prop="password" label="密码" width="200" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios"

const token = useCookie('token')

const { $msg } = useNuxtApp()
const msg = $msg

const loading = ref(false)

const tableData = ref([])

const search = ref('')

const getData = async () => {
  const { data: res } = await axios.get('UserList')

  if (res.code !== 200) {
    return false
  }

  res.data.forEach(async (element, key) => {
    res.data[key].login_time = new Date(element.login_time).toLocaleString()
    res.data[key].create_time = new Date(element.create_time).toLocaleString()

    const { data: ip } = await axios.get('https://v2.api-m.com/api/ip', {
      params: {
        ip: element.ip
      }
    })

    tableData.value[key].address = ip.data.address
  })

  tableData.value = res.data
}

getData()

const filterTableData = computed(() =>
  tableData.value.filter((data) =>
    !search.value ||
    data.username.toLowerCase().includes(search.value.toLowerCase()) || data.mail.toLowerCase().includes(search.value.toLowerCase())
  )
)

const handleEdit = (index, row) => {
  navigateTo('/admin/apiset/' + row.id)
}

const handleDelete = async (index, row) => {
  loading.value = true

  const { data: res } = await axios.get('ApiDelete', {
    params: {
      id: row.id
    }
  })

  await getData()

  loading.value = false
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