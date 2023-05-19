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
            <el-form-item label="接口关键词">
              <el-input v-model="apiSetInfo.keywords" />
            </el-form-item>
            <el-form-item label="接口地址">
              <el-input v-model="apiSetInfo.url" />
            </el-form-item>
            <el-form-item label="请求类型">
              <el-input v-model="apiSetInfo.method" />
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

            <el-form-item label="ajax">
              <el-input v-model="apiSetInfo.ajax" type="textarea" />
            </el-form-item>
            <el-form-item label="axios">
              <el-input v-model="apiSetInfo.axios" type="textarea" />
            </el-form-item>
            <el-form-item label="fetch">
              <el-input v-model="apiSetInfo.fetch" type="textarea" />
            </el-form-item>
            <el-form-item label="xhr">
              <el-input v-model="apiSetInfo.xhr" type="textarea" />
            </el-form-item>
            <el-form-item label="php">
              <el-input v-model="apiSetInfo.php" type="textarea" />
            </el-form-item>
            <el-form-item label="python">
              <el-input v-model="apiSetInfo.python" type="textarea" />
            </el-form-item>

            <el-form-item label="是否启用">
              <el-switch v-model="apiSetInfo.state" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">提交</el-button>
            </el-form-item>
          </el-form>

          <el-table
            :data="res.data.params"
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
            <el-table-column prop="aid" label="id" width="60" />
            <el-table-column prop="name" label="接口名称" width="100" />
            <el-table-column prop="param" label="传递参数" width="100" />
            <el-table-column prop="position" label="传入位置" width="100" />
            <el-table-column prop="docs" label="参数描述" width="300" />
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

const route = useRoute()

const token = useCookie('token')

const { $msg } = useNuxtApp()
const msg = $msg

const formOrTable = ref(false)

const apiSetInfo = ref({
  name: '',
  alias: '',
  description: '',
  keywords: '',
  url: '',
  method: '',
  example: '',
  oldCategoryId: '',
  category: '',
  categoryId: '',
  state: true,
  ajax: '',
  axios: '',
  fetch: '',
  xhr: '',
  php: '',
  python: '',
})

const { data: res } = await axios.get('Api', {
  params: {
    id: route.params.id
  }
})

// 判断参数是否必传
res.data.params = res.data.params.map(item => {
  return {
    id: item.id,
    aid: item.aid,
    name: item.name,
    param: item.param,
    position: item.position,
    docs: item.docs,
    create_time: item.create_time,
    required: item.required === 1 ? '必传' : '可选'
  }
})

apiSetInfo.value = res.data
apiSetInfo.value.oldCategoryId = res.data.categoryId

if (res.data.state === '启用') {
  apiSetInfo.value.state = true
} else {
  apiSetInfo.value.state = false
}

const onSubmit = async () => {
  if (apiSetInfo.value.category === '' || apiSetInfo.value.categoryId === '') {
    msg('请选择分类', 'error')
    return false
  }

  if (!apiSetInfo.value.name || !apiSetInfo.value.alias || !apiSetInfo.value.description || !apiSetInfo.value.url || !apiSetInfo.value.keywords || !apiSetInfo.value.method) {
    msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('id', apiSetInfo.value.id)
  bodyValue.append('name', apiSetInfo.value.name)
  bodyValue.append('alias', apiSetInfo.value.alias)
  bodyValue.append('description', apiSetInfo.value.description)
  bodyValue.append('keywords', apiSetInfo.value.keywords)
  bodyValue.append('url', apiSetInfo.value.url)
  bodyValue.append('method', apiSetInfo.value.method)
  bodyValue.append('categoryId', apiSetInfo.value.categoryId)
  bodyValue.append('oldCategoryId', apiSetInfo.value.oldCategoryId)
  bodyValue.append('ajax', apiSetInfo.value.ajax)
  bodyValue.append('axios', apiSetInfo.value.axios)
  bodyValue.append('fetch', apiSetInfo.value.fetch)
  bodyValue.append('xhr', apiSetInfo.value.xhr)
  bodyValue.append('php', apiSetInfo.value.php)
  bodyValue.append('python', apiSetInfo.value.python)
  bodyValue.append('example', apiSetInfo.value.example)


  if (apiSetInfo.value.state) {
    bodyValue.append('state', '启用')
  } else {
    bodyValue.append('state', '关闭')
  }

  const { data: res } = await axios.post('ApiUpdate', bodyValue)

  navigateTo('/admin/apilist')
}

const handleDelete = async (index, row) => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('id', row.id)
  bodyValue.append('aid', apiSetInfo.value.id)

  const { data: res } = await axios.get('ParamDelete', {
    params: {
      pid: row.id,
      aid: apiSetInfo.value.id,
      alias: apiSetInfo.value.alias
    }
  })

  navigateTo('/admin/apilist')

}

// 分类的数据
const categoryData = ref([])

const querySearch = async (queryString, cb) => {
  // 如果没有数据则从服务端获取分类内容
  if (categoryData.value.length === 0) {
    const { data: res } = await axios.get('CategoryList')

    res.data = res.data.map(item => {
      return {
        id: item.id,
        value: item.name,
      }
    })

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