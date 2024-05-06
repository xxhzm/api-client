<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="apilist-container" v-loading="loading">
        <el-button
          type="primary"
          style="margin-bottom: 20px"
          size="small"
          @click="navigateTo('/admin/addapi')"
          >新增接口</el-button
        >
        <client-only>
          <el-table :data="filterTableData" style="width: 100%" height="96%">
            <el-table-column width="200">
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

                <el-popconfirm
                  confirm-button-text="Yes"
                  cancel-button-text="No"
                  title="你确定要启用吗?"
                  @confirm="handleOpen(scope.$index, scope.row)"
                >
                  <template #reference>
                    <el-button size="small" type="danger" color="#626aef"
                      >启用</el-button
                    >
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="id" width="50" />
            <el-table-column prop="name" label="接口名称" width="150" />
            <el-table-column prop="alias" label="别名" width="100" />
            <el-table-column prop="state" label="状态" width="80" />
            <el-table-column prop="description" label="描述" width="250" />
            <el-table-column prop="keywords" label="接口关键词" width="300" />
            <el-table-column prop="url" label="地址" width="280" />
            <el-table-column prop="method" label="请求方法" width="100" />
            <el-table-column prop="uname" label="创建人" width="80" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="create_time" label="创建时间" width="165" />
            <el-table-column prop="count" label="调用次数" width="100" />
          </el-table>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $msg, $myFetch } = useNuxtApp()
const msg = $msg

const loading = ref(false)
const tableData = ref([])
const search = ref('')

const getData = async () => {
  const { data: res } = await $myFetch('ApiList')
  tableData.value = res.data
}

onMounted(() => {
  getData()
})

const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

const handleEdit = (index, row) => {
  navigateTo('/admin/apiset/' + row.id)
}

const handleDelete = async (index, row) => {
  loading.value = true

  const { data: res } = await $myFetch('ApiDelete', {
    params: {
      id: row.id,
    },
  })

  await getData()

  loading.value = false
}

const handleOpen = async (index, row) => {
  loading.value = true

  const { data: res } = await $myFetch('ApiOpen', {
    params: {
      id: row.id,
    },
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
    .apilist-container {
      width: 100%;
      height: calc(100vh - 65px);
      padding-left: 20px;
      padding-top: 15px;
    }
  }
}
</style>
