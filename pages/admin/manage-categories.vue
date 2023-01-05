<template>
  <AdminHeader></AdminHeader>
  <div style="display: flex">
    <AdminSidebar></AdminSidebar>
    <div class="manageCategories-container" v-loading="loading">
      <el-button
        type="primary"
        style="margin-bottom: 20px"
        size="small"
        @click="navigateTo('/admin/addcategory')"
        >新增分类</el-button
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
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)"
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
        <el-table-column prop="name" label="分类名称" width="180" />
        <el-table-column prop="alias" label="别名" width="100" />
        <el-table-column prop="count" label="接口数" width="100" />
        <el-table-column prop="create_time" label="创建时间" width="250" />
        <el-table-column prop="default" label="默认分类" width="250" />
        <el-table-column width="225" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import axios from "axios"
import { ElNotification } from 'element-plus'

const token = useCookie('token')

definePageMeta({
  middleware: ["admin"],
})

const msg = (message, type) => {
  ElNotification({
    message,
    type,
  })
}

const loading = ref(false)

const tableData = ref([

])

const search = ref('')

const getData = async () => {
  const { data: res } = await axios.get('api/categoriesList')

  if (res.code !== '200') {
    msg(res.msg, 'error')
  }

  tableData.value = res.data
}

getData()

const filterTableData = computed(() =>
  tableData.value.filter((data) =>
    !search.value ||
    data.name.toLowerCase().includes(search.value.toLowerCase())
  )
)


const handleEdit = (index, row) => {
  navigateTo('/admin/setcategory/' + row.id)
}

const handleDelete = async (index, row) => {
  loading.value = true

  const bodyValue = new URLSearchParams()
  bodyValue.append('id', row.id)

  const { data: res } = await axios.post('api/deleteCategory?token=' + token.value, bodyValue)

  if (res.code === '200') {
    msg(res.msg, 'success')
  } else {
    msg(res.msg, 'error')
  }

  await getData()

  loading.value = false
}


</script>

<style lang="less" scoped>
.manageCategories-container {
  width: 100%;
  height: calc(100vh - 65px);
  padding-left: 20px;
  padding-top: 15px;
}
</style>