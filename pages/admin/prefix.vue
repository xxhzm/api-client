<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="prefix_container">
        <div class="cont">
          <ClientOnly>
            <el-button
              type="primary"
              style="margin-bottom: 20px; float: left"
              size="small"
              @click="createStatus = true"
              >新增前缀</el-button
            >
            <el-table :data="filterTableData" style="width: 100%" height="100%"
              ><el-table-column width="200">
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
              <el-table-column prop="id" label="id" width="100" />
              <el-table-column prop="name" label="前缀名称" width="180" />
              <el-table-column
                prop="prefix"
                label="前缀地址"
                width="250"
                show-overflow-tooltip
              />
              <el-table-column
                prop="request_type"
                label="接口类型"
                width="100"
              />
            </el-table>
          </ClientOnly>

          <el-dialog
            v-model="createStatus"
            :title="disabled ? '修改前缀' : '新增前缀'"
            width="480"
            center
          >
            <el-form :model="prefixInfo" label-width="75px">
              <el-form-item label="前缀名称">
                <el-input
                  v-model="prefixInfo.name"
                  maxlength="32"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="前缀地址">
                <el-input v-model="prefixInfo.prefix" show-word-limit />
              </el-form-item>
              <el-form-item label="接口类型">
                <el-select
                  v-model="prefixInfo.requestType"
                  placeholder="请选择接口类型"
                >
                  <el-option label="http" value="http" />
                  <el-option label="grpc" value="grpc" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="createPrefix" v-if="!disabled"
                  >提交</el-button
                >
                <el-button type="primary" @click="updatePrefix" v-if="disabled"
                  >提交</el-button
                >
              </el-form-item>
            </el-form>
          </el-dialog>
        </div>
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
  const res = await $myFetch('PrefixList')

  if (res.code !== 200) {
    msg(res.msg, 'error')
    return false
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
      data.name.toLowerCase().includes(search.value.toLowerCase()) ||
      data.prefix.toLowerCase().includes(search.value.toLowerCase()) ||
      data.request_type.toLowerCase().includes(search.value.toLowerCase())
  )
)

const handleDelete = async (index, row) => {
  loading.value = true

  const res = await $myFetch('DeletePrefix', {
    params: {
      id: row.id,
    },
  })

  if (res.code !== 200) {
    msg(res.msg, 'error')
    loading.value = false
    return false
  }

  msg(res.msg, 'success')
  await getData()

  loading.value = false
}

const prefixInfo = ref({
  id: 0,
  name: '',
  prefix: '',
  requestType: '',
})

const createPrefix = async () => {
  disabled.value = false
  console.log(123)
  if (!prefixInfo.value.name || !prefixInfo.value.requestType) {
    msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('name', prefixInfo.value.name)
  bodyValue.append('prefix', prefixInfo.value.prefix)
  bodyValue.append('requestType', prefixInfo.value.requestType)

  const res = await $myFetch('CreatePrefix', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code !== 200) {
    msg(res.msg, 'error')
    handleClose()
    return false
  }

  handleClose()
  msg(res.msg, 'success')
  await getData()

  createStatus.value = false
}

const updatePrefix = async () => {
  disabled.value = true
  if (
    prefixInfo.value.id === 0 ||
    !prefixInfo.value.name ||
    !prefixInfo.value.requestType
  ) {
    msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('id', prefixInfo.value.id)
  bodyValue.append('name', prefixInfo.value.name)
  bodyValue.append('prefix', prefixInfo.value.prefix)
  bodyValue.append('requestType', prefixInfo.value.requestType)

  const res = await $myFetch('UpdatePrefix', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code !== 200) {
    msg(res.msg, 'error')
    handleClose()
    return false
  }

  handleClose()
  msg(res.msg, 'success')
  await getData()

  createStatus.value = false
}

// 弹窗当前状态,判断新增还是编辑，false为新增，true为编辑
const disabled = ref(false)

// 新增前缀弹窗状态
const createStatus = ref(false)

const handleClose = () => {
  // 初始化值
  prefixInfo.value.id = 0
  prefixInfo.value.name = ''
  prefixInfo.value.prefix = ''
  prefixInfo.value.requestType = ''
}

// 编辑前缀
const handleEdit = (index, row) => {
  disabled.value = true
  createStatus.value = true

  prefixInfo.value.id = row.id
  prefixInfo.value.name = row.name
  prefixInfo.value.prefix = row.prefix
  prefixInfo.value.requestType = row.request_type
}

useHead({
  title: '管理分类',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<style lang="less" scoped>
.container {
  display: flex;
  height: 100%;
  .right {
    width: 100%;
    .prefix_container {
      width: 100%;
      min-height: 100vh;
      padding: 10px;
      background-color: #f7f7f7;
      .cont {
        width: 100%;
        height: 100%;
        padding: 20px 20px;
        background: #fff;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
      }
    }
  }
}
</style>
