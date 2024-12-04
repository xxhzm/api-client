<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="articlelist-container">
        <client-only>
          <el-button
            type="primary"
            style="margin-bottom: 20px; float: left"
            size="small"
            @click="navigateTo('/admin/createarticle')"
            >新增文章</el-button
          >
          <el-button
            type="primary"
            style="margin-bottom: 20px; float: left"
            size="small"
            @click="dialogVisible = true"
            >导入文章</el-button
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
          <el-table
            v-loading="pageLoading"
            :data="filterTableData"
            style="width: 100%"
            height="96%"
          >
            <el-table-column width="150">
              <template #header>
                <el-input v-model="search" size="small" placeholder="搜索" />
              </template>
              <template #default="scope">
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
            <el-table-column prop="id" label="id" width="80" />
            <el-table-column prop="author" label="作者" width="80" />
            <el-table-column prop="title" label="文章标题" width="200" />
            <el-table-column prop="keywords" label="关键词" width="200" />
            <el-table-column prop="create_time" label="发布时间" width="180" />
            <el-table-column prop="update_time" label="修改时间" width="180" />
            <el-table-column prop="status" label="状态" width="80" />
          </el-table>

          <el-dialog v-model="dialogVisible" title="导入文章" width="500">
            <el-form>
              <el-form-item label="文章URL" label-width="80px">
                <el-input v-model="importArticleUrl" autocomplete="off" />
              </el-form-item>
            </el-form>

            <template #footer>
              <div class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="importArticle()">
                  确定
                </el-button>
              </div>
            </template>
          </el-dialog>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $msg, $myFetch } = useNuxtApp()

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

// 监听页数变化
watch(
  () => page.value,
  async (newValue) => {
    pageLoading.value = true
    await getData()
    console.log(newValue)
    setTimeout(() => {
      pageLoading.value = false
    }, 300)
  }
)

const getData = async () => {
  const res = await $myFetch('ArticleList', {
    params: {
      page: page.value,
    },
  })

  if (res.code !== 200) {
    return
  }

  res.data.list.forEach((element, key) => {
    if (element.status === '1') {
      res.data.list[key].status = '开启'
    } else if (element.status === '2') {
      res.data.list[key].status = '关闭'
    } else {
      res.data.list[key].status = '草稿'
    }

    res.data.list[key].create_time = new Date(
      Number(element.create_time)
    ).toLocaleString()

    res.data.list[key].update_time = new Date(
      Number(element.update_time)
    ).toLocaleString()
  })

  tableData.value = res.data.list
  totalPages.value = res.data.totalPages
}

onMounted(() => {
  getData()
})

// 搜索框
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.title.toLowerCase().includes(search.value.toLowerCase()) ||
      data.content.toLowerCase().includes(search.value.toLowerCase())
  )
)

// 编辑
const handleEdit = async (index, row) => {
  navigateTo('/admin/articleset/' + row.id)
}

// 删除用户按钮
const handleDelete = async (index, row) => {
  const res = await $myFetch('DeleteArticle', {
    params: {
      id: row.id,
    },
  })

  $msg(res.msg, 'success')
  await getData()
}

// 导入文章
const importArticleUrl = ref('')
const dialogVisible = ref(false)
const username = useCookie('username')

const importArticle = async () => {
  dialogVisible.value = false

  const res = await $myFetch('ImportArticle', {
    params: {
      url: importArticleUrl.value,
      username: username.value,
    },
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }

  await getData()
}

useHead({
  title: '文章列表',
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
    .articlelist-container {
      width: 100%;
      height: calc(100vh - 65px);
      padding-left: 20px;
      padding-top: 15px;
    }
  }
}
</style>
