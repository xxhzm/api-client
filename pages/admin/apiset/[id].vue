<template>
  <AdminHeader></AdminHeader>
  <div style="display: flex">
    <AdminSidebar></AdminSidebar>
    <div class="apiset-container">
      <div class="apiset-form">
        <el-switch
          v-model="formOrTable"
          style="margin-bottom: 20px; margin-left: 50px"
          active-text="参数信息"
          inactive-text="接口信息"
        />
        <div>
          <el-form :model="apiSetInfo" label-width="120px" v-if="!formOrTable">
            <el-form-item label="接口名称">
              <el-input
                v-model="apiSetInfo.name"
                maxlength="25"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="接口别名">
              <el-input
                v-model="apiSetInfo.alias"
                maxlength="25"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="接口描述">
              <el-input v-model="apiSetInfo.description" />
            </el-form-item>
            <el-form-item label="接口地址">
              <el-input
                v-model="apiSetInfo.url"
                maxlength="128"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="接口分类">
              <client-only>
                <el-autocomplete
                  v-model="apiSetInfo.category"
                  :fetch-suggestions="querySearch"
                  placeholder="请选择分类"
                  @select="handleSelect"
                />
              </client-only>
            </el-form-item>

            <el-form-item label="返回示例">
              <el-input v-model="apiSetInfo.example" type="textarea" />
            </el-form-item>
            <el-form-item label="是否启用">
              <el-switch v-model="apiSetInfo.state" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
          </el-form>

          <el-table
            :data="res.data[0].params"
            border
            style="width: 825px; margin-left: 50px"
            v-if="formOrTable"
          >
            <el-table-column width="100" label="操作">
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
            <el-table-column prop="id" label="id" width="60" />
            <el-table-column prop="name" label="Name" width="100" />
            <el-table-column prop="docs" label="docs" width="300" />
            <el-table-column prop="required" label="是否必传" width="100" />
            <el-table-column prop="create_time" label="创建时间" width="165" />
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios"
import { ElNotification } from 'element-plus'

const route = useRoute()

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

const formOrTable = ref(false)

const apiSetInfo = ref({
  name: '',
  alias: '',
  description: '',
  url: '',
  example: '',
  oldCategoryId: '',
  category: '',
  categoryId: '',
  state: true
})

const { data: res } = await axios.get('api/api', {
  params: {
    id: route.params.id
  }

})

apiSetInfo.value = res.data[0]
apiSetInfo.value.oldCategoryId = res.data[0].categoryId

const onSubmit = async () => {
  if (apiSetInfo.value.category === '' || apiSetInfo.value.categoryId === '') {
    msg('请选择分类', 'error')
    return false
  }

  if (!apiSetInfo.value.name || !apiSetInfo.value.alias || !apiSetInfo.value.description || !apiSetInfo.value.url) {
    msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('id', apiSetInfo.value.id)
  bodyValue.append('name', apiSetInfo.value.name)
  bodyValue.append('alias', apiSetInfo.value.alias)
  bodyValue.append('description', apiSetInfo.value.description)
  bodyValue.append('url', apiSetInfo.value.url)
  bodyValue.append('categoryId', apiSetInfo.value.categoryId)
  bodyValue.append('oldCategoryId', apiSetInfo.value.oldCategoryId)


  if (apiSetInfo.value.example) {
    bodyValue.append('example', apiSetInfo.value.example)
  }

  if (!apiSetInfo.value.state) {
    bodyValue.append('state', apiSetInfo.value.state)
  }

  const { data: res } = await axios.post('api/addapi?type=update&token=' + token.value, bodyValue)
  if (res.code === '200') {
    msg(res.msg, 'success')
    navigateTo('/admin/apilist')
  } else {
    msg(res.msg, 'error')
  }

}

const handleDelete = async (index, row) => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('id', row.id)

  const { data: res } = await axios.post('api/deleteParams?token=' + token.value, bodyValue)

  if (res.code === '200') {
    msg(res.msg, 'success')
    navigateTo('/admin/apilist')
  } else {
    msg(res.msg, 'error')
  }
}

// 分类的数据
const categoryData = ref([])

const querySearch = async (queryString, cb) => {
  // 如果没有数据则从服务端获取分类内容
  if (categoryData.value.length === 0) {
    const { data: res } = await axios.get('api/categoriesList?name=true')
    categoryData.value = res.data
  }

  const results = queryString
    ? categoryData.value.filter(createFilter(queryString))
    : categoryData.value

  // call callback function to return suggestions
  cb(results)
}

const createFilter = (queryString) => {
  return (restaurant) => {
    return (
      restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

const handleSelect = (item) => {
  apiSetInfo.value.categoryId = item.id
}


</script>

<style  lang="less" scoped>
.apiset-container {
  width: 100%;
  height: calc(100vh - 65px);
  padding-left: 20px;
  padding-top: 35px;
  .apiset-form {
    width: 90%;
    height: 100%;
  }
}
</style>