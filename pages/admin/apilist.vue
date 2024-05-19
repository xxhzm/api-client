<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="apilist-container" v-loading="loading">
        <client-only>
          <el-button
            type="primary"
            style="margin-bottom: 20px"
            size="small"
            @click="navigateTo('/admin/createapi')"
            >新增接口</el-button
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

          <el-table
            :data="filterTableData"
            style="width: 100%"
            height="96%"
            v-loading="pageLoading"
          >
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
                  >编辑</el-button
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
            <el-table-column prop="id" label="id" width="50" />
            <el-table-column prop="name" label="接口名称" width="150" />
            <el-table-column prop="alias" label="别名" width="100" />
            <el-table-column prop="state" label="状态" width="80" />
            <el-table-column prop="prefixUrl" label="前缀地址" width="200" />
            <el-table-column prop="url" label="地址" width="150" />
            <el-table-column prop="method" label="请求方法" width="100" />
            <el-table-column prop="uname" label="创建人" width="80" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="create_time" label="创建时间" width="165" />
            <el-table-column prop="count" label="调用次数" width="100" />
            <el-table-column prop="description" label="描述" width="250" />
            <el-table-column prop="keywords" label="接口关键词" width="300" />
          </el-table>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $msg, $myFetch } = useNuxtApp()
const msg = $msg

// 当前页数
const page = ref(1)
// 总页数
const totalPages = ref(1)
// 总记录
const totalRecords = ref(50)
// 页数loading
const pageLoading = ref(false)

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

const loading = ref(false)
const tableData = ref([])
const search = ref('')

const getData = async () => {
  const res = await $myFetch('ApiList', {
    params: {
      page: page.value,
    },
  })

  if(res.code !== 200){
    return
  }
  
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

useHead({
  title: '接口列表',
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
    .apilist-container {
      width: 100%;
      height: calc(100vh - 65px);
      padding-left: 20px;
      padding-top: 15px;
    }
  }
}
</style>
