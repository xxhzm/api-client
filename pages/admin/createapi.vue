<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="createapi-container">
        <div class="createapi-cont">
          <h1 class="title">接口信息</h1>
          <el-divider />
          <el-form :model="createapiInfo" label-width="100px">
            <el-row :gutter="12">
              <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8">
                <el-form-item label="接口名称">
                  <el-input
                    v-model="createapiInfo.name"
                    maxlength="32"
                    show-word-limit
                  /> </el-form-item
              ></el-col>

              <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8">
                <el-form-item label="接口别名">
                  <el-input
                    v-model="createapiInfo.alias"
                    maxlength="32"
                    show-word-limit
                  /> </el-form-item
              ></el-col>

              <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8">
                <el-form-item label="接口描述">
                  <el-input
                    v-model="createapiInfo.description"
                  /> </el-form-item
              ></el-col>

              <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8">
                <el-form-item label="接口关键词">
                  <el-input
                    v-model="createapiInfo.keywords"
                    maxlength="128"
                    show-word-limit
                    placeholder="英文逗号隔开"
                  /> </el-form-item
              ></el-col>

              <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8">
                <el-form-item label="接口地址">
                  <el-input
                    v-model="createapiInfo.url"
                    maxlength="128"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8">
                <el-form-item label="接口示例">
                  <el-input
                    v-model="createapiInfo.exampleUrl"
                    maxlength="128"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
              
              <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
                <el-form-item label="接口前缀URL">
                  <client-only>
                    <el-autocomplete
                      v-model="createapiInfo.prefixValue"
                      :fetch-suggestions="querySearchPrefix"
                      placeholder="请选择服务"
                      @select="handlePrefixSelect"
                    />
                  </client-only>
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
                <el-form-item label="接口分类">
                  <client-only>
                    <el-autocomplete
                      v-model="createapiInfo.category"
                      :fetch-suggestions="querySearch"
                      placeholder="请选择分类"
                      @select="handleSelect"
                    />
                  </client-only>
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8">
                <el-form-item label="请求类型">
                  <el-input
                    v-model="createapiInfo.method"
                    maxlength="12"
                    show-word-limit
                    placeholder="GET 建议使用大写"
                  />
                </el-form-item>
              </el-col>

              <el-col :xs="24" :sm="16" :md="16" :lg="16" :xl="16">
                <el-form-item label="返回示例">
                  <el-input
                    v-model="createapiInfo.example"
                    type="textarea"
                    :rows="8"
                  /> </el-form-item
              ></el-col>
            </el-row>

            <el-form-item label="是否启用">
              <el-switch v-model="createapiInfo.state" />
            </el-form-item>
          </el-form>
        </div>

        <div class="createapi-cont">
          <h1 class="title" style="margin-top: 20px">参数信息</h1>
          <el-divider />

          <el-form :model="addparameter" label-width="120px">
            <el-form-item label="参数名称">
              <el-input v-model="addparameter.name" placeholder="return" />
            </el-form-item>
            <el-form-item label="可传参数">
              <el-input v-model="addparameter.param" placeholder="json | 302" />
            </el-form-item>
            <client-only>
              <el-form-item label="传入位置">
                <el-select
                  v-model="addparameter.position"
                  placeholder="传入位置"
                >
                  <el-option
                    v-for="item in position"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </client-only>
            <el-form-item label="参数描述">
              <el-input
                v-model="addparameter.docs"
                placeholder="返回json数据 | 重定义到图片"
              />
            </el-form-item>
            <el-form-item label="是否必传">
              <el-switch v-model="addparameter.required" />
            </el-form-item>
          </el-form>
        </div>

        <div class="createapi-footer">
          <div class="button">
            <el-button
              size="large"
              color="#626aef"
              type="primary"
              @click="create"
              >提交</el-button
            >

            <el-button
              size="large"
              color="#ff9e08"
              style="color: #fff"
              type="primary"
              @click="navigateTo('/admin')"
              >返回</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const username = useCookie('username')

const { $msg, $myFetch } = useNuxtApp()
const msg = $msg

const createapiInfo = reactive({
  name: '',
  alias: '',
  description: '',
  keywords: '',
  url: '',
  method: '',
  oldCategoryId: '',
  categoryId: '',
  example: '',
  state: true,
  exampleUrl: '',
  prefix: '',
  prefixValue: '',
})

// 参数信息
const addparameter = reactive({
  id: 0,
  name: '',
  param: '',
  position: '',
  docs: '',
  required: true,
})

const position = [
  {
    value: 'query',
    label: 'query',
  },
  {
    value: 'body',
    label: 'body',
  },
]

watch(
  () => addparameter.id,
  (newValue) => {
    addparameter.id = newValue.replace(/[^\d]/g, '')
  }
)

const create = async () => {
  if (
    !createapiInfo.name ||
    !createapiInfo.alias ||
    !createapiInfo.description ||
    !createapiInfo.keywords ||
    !createapiInfo.url ||
    !createapiInfo.method ||
    !createapiInfo.prefix
  ) {
    msg('请填写内容', 'error')
    return false
  }

  if (!createapiInfo.categoryId) {
    msg('请选择分类', 'error')
    return false
  }

  const apiBodyValue = new URLSearchParams()
  apiBodyValue.append('name', createapiInfo.name)
  apiBodyValue.append('alias', createapiInfo.alias)
  apiBodyValue.append('description', createapiInfo.description)
  apiBodyValue.append('keywords', createapiInfo.keywords)
  apiBodyValue.append('url', createapiInfo.url)
  apiBodyValue.append('method', createapiInfo.method)
  apiBodyValue.append('categoryId', createapiInfo.categoryId)
  apiBodyValue.append('example', createapiInfo.example)
  apiBodyValue.append('uname', username.value)
  apiBodyValue.append('exampleUrl', createapiInfo.exampleUrl)
  apiBodyValue.append('prefix', createapiInfo.prefix)

  if (createapiInfo.state === true) {
    apiBodyValue.append('state', '启用')
  } else {
    apiBodyValue.append('state', '禁用')
  }

  const res = await $myFetch('ApiCreate', {
    method: 'POST',
    body: apiBodyValue,
  })

  if (res.code !== 200) {
    msg(res.msg, 'error')
    return false
  }

  msg(res.msg, 'success')

  // 接口添加成功后添加参数
  addparameter.id = res.data
  if (
    !addparameter.id ||
    !addparameter.name ||
    !addparameter.param ||
    !addparameter.docs ||
    !addparameter.position
  ) {
    navigateTo('/admin/apilist')
    return false
  }

  const paramBodyValue = new URLSearchParams()
  paramBodyValue.append('aid', addparameter.id)
  paramBodyValue.append('name', addparameter.name)
  paramBodyValue.append('param', addparameter.param)
  paramBodyValue.append('position', addparameter.position)
  paramBodyValue.append('docs', addparameter.docs)

  if (addparameter.required) {
    paramBodyValue.append('required', 1)
  } else {
    paramBodyValue.append('required', 2)
  }

  const res1 = await $myFetch('ParamCreate', {
    method: 'POST',
    body: paramBodyValue,
  })

  setTimeout(() => {
    navigateTo('/admin/apilist')
  }, 500)
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

const handlePrefixSelect = (item) => {
  createapiInfo.prefix = item.id
}

const handleSelect = (item) => {
  createapiInfo.categoryId = item.id
}

useHead({
  title: '新增接口',
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
    .createapi-container {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 10px;
      background-color: #f7f7f7;
      .createapi-cont {
        width: 100%;
        padding: 20px 20px;
        background: #fff;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        margin-top: 20px;
        .title {
          font-size: 17px;
          font-weight: 500;
          color: rgb(31, 34, 37);
        }
      }

      .createapi-cont:nth-last-child(2) {
        margin-bottom: 40px;
      }

      .createapi-footer {
        position: fixed;
        bottom: 0;
        width: calc(100% - 200px);
        height: 80px;
        background: #fff;
        box-shadow: 2px 2px 2px rgb(0 0 0 / 10%);
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
