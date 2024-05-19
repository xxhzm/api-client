<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="userlist-container">
        <client-only>
          <el-button
            type="primary"
            style="margin-bottom: 20px; float: left"
            size="small"
            @click="dialogStatus = true"
            >新增链接</el-button
          >
          <el-table
            :data="filterTableData"
            :v-loadding="loading"
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
            <el-table-column prop="name" label="链接名称" width="130" />
            <el-table-column prop="url" label="链接地址" width="250" />
            <el-table-column prop="image" label="头像地址" width="180" />
            <el-table-column prop="description" label="描述" width="280" />
          </el-table>

          <el-dialog
            v-model="dialogStatus"
            :title="updateLinkStatus ? '修改链接' : '添加链接'"
            width="400"
            center
          >
            <template #default>
              <el-form
                :model="linkInfo"
                label-position="top"
                label-width="120px"
              >
                <el-form-item label="链接名称">
                  <el-input v-model="linkInfo.name" />
                </el-form-item>

                <el-form-item label="链接地址">
                  <el-input v-model="linkInfo.url" />
                </el-form-item>

                <el-form-item label="链接图像">
                  <el-input v-model="linkInfo.image" />
                </el-form-item>

                <el-form-item label="链接描述">
                  <el-input v-model="linkInfo.description" />
                </el-form-item>
              </el-form>
            </template>
            <template #footer>
              <div style="flex: auto">
                <el-button @click="dialogStatus = false">取消</el-button>
                <el-button type="primary" @click="submit">{{
                  updateLinkStatus ? '修改' : '创建'
                }}</el-button>
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

const loading = ref(false)

// 弹窗显示状态
const dialogStatus = ref(false)
const updateLinkStatus = ref(false)

const linkInfo = ref({
  id: 0,
  name: '',
  description: '',
  url: '',
  image: '',
})

// 获取数据信息
const getData = async () => {
  const res = await $myFetch('LinkList')
  tableData.value = res.data
}

onMounted(() => {
  getData()
})

// 搜索框
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

// 编辑链接
const handleEdit = (index, row) => {
  dialogStatus.value = true
  updateLinkStatus.value = true

  linkInfo.value.id = row.id
  linkInfo.value.name = row.name
  linkInfo.value.description = row.description
  linkInfo.value.url = row.url
  linkInfo.value.image = row.image
}

// 删除链接
const handleDelete = async (index, row) => {
  loading.value = true
  const res = await $myFetch('DeleteLink', {
    params: {
      id: row.id,
    },
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }

  await getData()
  loading.value = false
}

const submit = async () => {
  // 判断信息是否填写
  if (
    linkInfo.value.name === '' ||
    linkInfo.value.url === '' ||
    linkInfo.value.image === '' ||
    linkInfo.value.description === ''
  ) {
    $msg('请填写完整信息', 'error')
    return
  }

  loading.value = true
  const body = new URLSearchParams()
  body.append('name', linkInfo.value.name)
  body.append('description', linkInfo.value.description)
  body.append('url', linkInfo.value.url)
  body.append('image', linkInfo.value.image)

  const url = ref('')

  // 判断是添加链接还是修改链接
  if (updateLinkStatus.value === true) {
    url.value = 'UpdateLink'

    // 判断id是否存在
    if (linkInfo.value.id === 0) {
      $msg('请填写完整信息', 'error')
      return
    }

    body.append('id', linkInfo.value.id)
  } else {
    url.value = 'CreateLink'
  }

  const res = await $myFetch(url.value, {
    method: 'POST',
    body,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }

  await getData()
  dialogStatus.value = false
  loading.value = false
}

// 监听弹窗是否关闭，将信息设置为默认
watch(dialogStatus, (newValue) => {
  if (newValue === false) {
    updateLinkStatus.value = false

    linkInfo.value.id = 0
    linkInfo.value.name = ''
    linkInfo.value.description = ''
    linkInfo.value.url = ''
    linkInfo.value.image = ''
  }
})

useHead({
  title: '友情链接',
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
