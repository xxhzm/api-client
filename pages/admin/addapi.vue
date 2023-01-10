<template>
  <AdminHeader></AdminHeader>
  <div style="display: flex">
    <AdminSidebar></AdminSidebar>
    <div class="addapi-container">
      <div class="addapi-form">
        <el-form :model="addapiInfo" label-width="120px">
          <el-form-item label="接口名称">
            <el-input
              v-model="addapiInfo.name"
              maxlength="32"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="接口别名">
            <el-input
              v-model="addapiInfo.alias"
              maxlength="32"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="接口描述">
            <el-input v-model="addapiInfo.description" />
          </el-form-item>
          <el-form-item label="接口地址">
            <el-input
              v-model="addapiInfo.url"
              maxlength="128"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="接口分类">
            <client-only>
              <el-autocomplete
                v-model="addapiInfo.category"
                :fetch-suggestions="querySearch"
                placeholder="请选择分类"
                @select="handleSelect"
              />
            </client-only>
          </el-form-item>

          <el-form-item label="返回示例">
            <el-input v-model="addapiInfo.example" type="textarea" />
          </el-form-item>
          <el-form-item label="是否启用">
            <el-switch v-model="addapiInfo.state" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
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

const addapiInfo = reactive({
  name: '',
  alias: '',
  description: '',
  url: '',
  oldCategoryId: '',
  categoryId: '',
  example: '',
  state: true
})

const onSubmit = async () => {
  if (!addapiInfo.name || !addapiInfo.alias || !addapiInfo.description || !addapiInfo.url) {
    msg('请填写内容', 'error')
    return false
  }

  if (!addapiInfo.categoryId) {
    msg('请选择分类', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('name', addapiInfo.name)
  bodyValue.append('alias', addapiInfo.alias)
  bodyValue.append('description', addapiInfo.description)
  bodyValue.append('url', addapiInfo.url)
  bodyValue.append('categoryId', addapiInfo.categoryId)

  if (addapiInfo.example) {
    bodyValue.append('example', addapiInfo.example)
  }

  if (!addapiInfo.state) {
    bodyValue.append('state', addapiInfo.state)
  }

  const { data: res } = await axios.post('api?type=insertApi&token=' + token.value, bodyValue)
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
  addapiInfo.categoryId = item.id
}
</script>

<style  lang="less" scoped>
.addapi-container {
  width: 100%;
  height: calc(100vh - 65px);
  padding: 20px 40px;
  background-color: #f7f7f7;
  .addapi-form {
    width: 100%;
    height: 100%;
    padding: 40px 50px;
    background: #fff;
    box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
  }
}
</style>