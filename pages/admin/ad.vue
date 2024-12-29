<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="ad-container">
        <client-only>
          <el-button
            type="primary"
            style="margin-bottom: 20px; float: left"
            size="small"
            @click="dialogStatus = true"
            >新增广告位</el-button
          >
          <el-table
            :data="filterTableData"
            :v-loadding="loading"
            style="width: 100%"
            height="90%"
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
            <el-table-column prop="id" label="id" width="50" />
            <el-table-column prop="url" label="广告地址" width="190" />
            <el-table-column prop="image" label="图像地址" width="180" />
            <el-table-column prop="create_time" label="添加时间" width="170" />
            <el-table-column
              prop="expiration_time"
              label="到期时间"
              width="170"
            />
          </el-table>

          <el-dialog
            v-model="dialogStatus"
            :title="updateAdStatus ? '修改广告' : '添加广告'"
            width="400"
            center
          >
            <template #default>
              <el-form :model="adInfo" label-position="top" label-width="120px">
                <el-form-item label="广告地址">
                  <el-input v-model="adInfo.url" />
                </el-form-item>

                <el-form-item label="广告图像">
                  <el-input v-model="adInfo.image" />
                </el-form-item>

                <el-form-item label="广告到期时间">
                  <el-date-picker
                    v-model="adInfo.expiration_time"
                    type="date"
                    format="YYYY/MM/DD"
                    value-format="x"
                    placeholder="请选择日期"
                  />
                </el-form-item>
              </el-form>
            </template>
            <template #footer>
              <div style="flex: auto">
                <el-button @click="dialogStatus = false">取消</el-button>
                <el-button type="primary" @click="submit">{{
                  updateAdStatus ? '修改' : '创建'
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
const updateAdStatus = ref(false)

const adInfo = ref({
  id: 0,
  url: '',
  image: '',
  create_time: '',
  expiration_time: '',
})

// 获取数据信息
const getData = async () => {
  const res = await $myFetch('AdList')

  res.data.forEach((element, key) => {
    res.data[key].create_time = new Date(
      Number(element.create_time)
    ).toLocaleString()
    res.data[key].expiration_time = new Date(
      Number(element.expiration_time)
    ).toLocaleString()
  })

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
      data.url.toLowerCase().includes(search.value.toLowerCase())
  )
)

// 编辑广告
const handleEdit = (index, row) => {
  dialogStatus.value = true
  updateAdStatus.value = true

  adInfo.value.id = row.id
  adInfo.value.url = row.url
  adInfo.value.image = row.image
  adInfo.value.expiration_time = new Date(row.expiration_time).getTime()
}

// 删除广告
const handleDelete = async (index, row) => {
  loading.value = true
  const res = await $myFetch('DeleteAd', {
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
    adInfo.value.url === '' ||
    adInfo.value.image === '' ||
    adInfo.value.expiration_time === ''
  ) {
    $msg('请填写完整信息', 'error')
    return
  }

  loading.value = true
  const body = new URLSearchParams()
  body.append('url', adInfo.value.url)
  body.append('image', adInfo.value.image)
  body.append('expirationTime', adInfo.value.expiration_time)

  const url = ref('')

  // 判断是添加广告还是修改广告
  if (updateAdStatus.value === true) {
    url.value = 'UpdateAd'

    // 判断id是否存在
    if (adInfo.value.id === 0) {
      $msg('请填写完整信息', 'error')
      return
    }

    body.append('id', adInfo.value.id)
  } else {
    url.value = 'CreateAd'
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
    updateAdStatus.value = false

    adInfo.value.id = 0
    adInfo.value.url = ''
    adInfo.value.image = ''
    adInfo.value.expiration_time = ''
  }
})

useHead({
  title: '广告位列表',
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
    .ad-container {
      width: 100%;
      height: calc(100vh - 65px);
      padding-left: 20px;
      padding-top: 15px;
    }
  }
}
</style>
