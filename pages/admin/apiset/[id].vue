<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="apiset-container">
        <div class="apiset-cont">
          <ClientOnly>
            <el-tabs v-model="activeName">
              <el-tab-pane label="基本信息" name="Base">
                <el-form :model="apiSetInfo">
                  <el-row :gutter="12">
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口名称"
                        ><el-input
                          v-model="apiSetInfo.name"
                          maxlength="25"
                          show-word-limit
                      /></el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口别名">
                        <el-input
                          v-model="apiSetInfo.alias"
                          maxlength="25"
                          show-word-limit
                        />
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口地址">
                        <el-input v-model="apiSetInfo.url" />
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="请求类型">
                        <el-input v-model="apiSetInfo.method" />
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口示例">
                        <el-input v-model="apiSetInfo.example_url" />
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口前缀">
                        <client-only>
                          <el-autocomplete
                            v-model="apiSetInfo.prefixValue"
                            :fetch-suggestions="querySearchPrefix"
                            placeholder="请选择服务"
                            @select="handlePrefixSelect"
                          />
                        </client-only>
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口分类">
                        <el-autocomplete
                          v-model="apiSetInfo.category"
                          :fetch-suggestions="querySearch"
                          placeholder="请选择分类"
                          @select="handleSelect"
                        />
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口状态">
                        <el-select
                          v-model="apiSetInfo.state"
                          placeholder="请选择状态"
                        >
                          <el-option label="启用" :value="true"></el-option>
                          <el-option label="停用" :value="false"></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="秘钥验证">
                        <el-select
                          v-model="apiSetInfo.keyState"
                          placeholder="请选择状态"
                        >
                          <el-option label="开启" :value="true"></el-option>
                          <el-option label="关闭" :value="false"></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="返回示例">
                        <el-input
                          :rows="10"
                          v-model="apiSetInfo.example"
                          type="textarea"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </el-tab-pane>

              <el-tab-pane label="参数信息" name="Parameter">
                <el-table :data="paramsArr">
                  <el-table-column prop="aid" label="id" width="60" />
                  <el-table-column prop="name" label="接口名称" width="100" />
                  <el-table-column prop="param" label="传递参数" width="100" />
                  <el-table-column
                    prop="position"
                    label="传入位置"
                    width="100"
                  />
                  <el-table-column prop="docs" label="参数描述" width="300" />
                  <el-table-column
                    prop="required"
                    label="是否必传"
                    width="100"
                  />
                  <el-table-column
                    prop="create_time"
                    label="创建时间"
                    width="165"
                  />
                  <el-table-column width="100" label="操作">
                    <template #default="scope">
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
                </el-table>
              </el-tab-pane>
            </el-tabs>
            <div class="apiset-footer">
              <div class="button">
                <el-button
                  size="large"
                  color="#626aef"
                  type="primary"
                  :loading="buttonStatus"
                  @click="updateApiInfo"
                  >提交</el-button
                >

                <el-button
                  size="large"
                  color="#ff9e08"
                  style="color: #fff"
                  type="primary"
                  @click="navigateTo('/admin/apilist')"
                  >返回</el-button
                >
              </div>
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()

const { $msg, $myFetch } = useNuxtApp()
const msg = $msg

// 标签页
const activeName = ref('Base')

const buttonStatus = ref(false)

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
  example_url: '',
  prefix: '',
  prefixValue: '',
  keyState: '',
})

const paramsArr = ref()
const getData = async () => {
  const res = await $myFetch('ApiId', {
    params: {
      id: route.params.id,
    },
  })

  // 判断参数是否必传
  paramsArr.value = res.data.params.map((item) => {
    return {
      id: item.id,
      aid: item.aid,
      name: item.name,
      param: item.param,
      position: item.position,
      docs: item.docs,
      create_time: new Date(Number(item.create_time)).toLocaleString(),
      required: item.required === 1 ? '必传' : '可选',
    }
  })

  apiSetInfo.value = res.data

  apiSetInfo.value.prefixValue = res.data.prefixName
  apiSetInfo.value.prefix = res.data.prefix

  apiSetInfo.value.oldCategoryId = res.data.categoryId

  if (res.data.state === '启用') {
    apiSetInfo.value.state = true
  } else {
    apiSetInfo.value.state = false
  }

  if (res.data.keyState === '开启') {
    apiSetInfo.value.keyState = true
  } else {
    apiSetInfo.value.keyState = false
  }
}

onMounted(async () => {
  await getData()
})

const updateApiInfo = async () => {
  if (apiSetInfo.value.category === '' || apiSetInfo.value.categoryId === '') {
    msg('请选择分类', 'error')
    return false
  }

  if (
    !apiSetInfo.value.name ||
    !apiSetInfo.value.alias ||
    !apiSetInfo.value.description ||
    !apiSetInfo.value.keywords ||
    !apiSetInfo.value.method ||
    !apiSetInfo.value.prefix
  ) {
    msg('请填写内容', 'error')
    return false
  }

  // 将按钮禁用
  buttonStatus.value = true

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
  bodyValue.append('example', apiSetInfo.value.example)
  bodyValue.append('exampleUrl', apiSetInfo.value.example_url)
  bodyValue.append('prefix', apiSetInfo.value.prefix)

  if (apiSetInfo.value.state) {
    bodyValue.append('state', '启用')
  } else {
    bodyValue.append('state', '关闭')
  }

  if (apiSetInfo.value.keyState) {
    bodyValue.append('keyState', '开启')
  } else {
    bodyValue.append('keyState', '关闭')
  }

  const res = await $myFetch('ApiUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    msg(res.msg, 'success')
  } else {
    msg(res.msg, 'error')
  }

  setTimeout(() => {
    navigateTo('/admin/apilist')
  }, 1000)
}

const handleDelete = async (index, row) => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('id', row.id)
  bodyValue.append('aid', apiSetInfo.value.id)

  const res = await $myFetch('ParamDelete', {
    params: {
      pid: row.id,
      aid: apiSetInfo.value.id,
      alias: apiSetInfo.value.alias,
    },
  })

  if (res.code === 200) {
    msg(res.msg, 'success')
  } else {
    msg(res.msg, 'error')
  }

  getData()
}

// 分类的数据
const categoryData = ref([])

const querySearch = async (queryString, cb) => {
  // 如果没有数据则从服务端获取分类内容
  if (categoryData.value.length === 0) {
    const res = await $myFetch('CategoryList')

    res.data = res.data.map((item) => {
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

// 接口前缀数据的数据
const PrefixList = ref([])

const querySearchPrefix = async (queryString, cb) => {
  // 如果没有数据则从服务端获取分类内容
  if (PrefixList.value.length === 0) {
    const res = await $myFetch('PrefixList')

    res.data = res.data.map((item) => {
      return {
        id: item.id,
        value: item.name,
      }
    })

    PrefixList.value = res.data
  }

  const results = queryString
    ? PrefixList.value.filter(createFilter(queryString))
    : PrefixList.value

  // call callback function to return suggestions
  cb(results)
}

const handlePrefixSelect = (item) => {
  apiSetInfo.value.prefix = item.id
}

useHead({
  title: '编辑接口',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<style lang="less" scoped>
.container {
  display: flex;
  height: 100vh;
  .right {
    width: 100%;
    background-color: #f7f7f7;
    overflow-x: hidden;
    .apiset-container {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 10px;
      .apiset-cont {
        width: 100%;
        padding: 20px 20px;
        background: #fff;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        margin-top: 20px;
        padding-bottom: 100px;
      }

      .apiset-footer {
        position: fixed;
        bottom: 0;
        right: 0;
        width: calc(100% - 200px);
        height: 80px;
        background: #fff;
        box-shadow: 0 2px 2px rgb(0 0 0 / 30%);
        .button {
          position: absolute;
          right: 50px;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }
  }
}
</style>
