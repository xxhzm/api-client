<script setup>
const { $msg, $myFetch } = useNuxtApp()
const msg = $msg

definePageMeta({
  layout: 'admin',
})

const searchData = ref({})
const searchOldValue = ref('')

const addparameter = reactive({
  id: 0,
  apiName: '',
  name: '',
  param: '',
  position: '',
  docs: '',
  required: true,
})

// 常用参数名称列表
const commonParamNames = [
  { value: 'return' },
  { value: 'format' },
  { value: 'page' },
  { value: 'limit' },
  { value: 'size' },
  { value: 'offset' },
  { value: 'sort' },
  { value: 'order' },
  { value: 'id' },
  { value: 'name' },
  { value: 'type' },
  { value: 'status' },
  { value: 'keyword' },
  { value: 'search' },
  { value: 'filter' },
  { value: 'category' },
  { value: 'tag' },
  { value: 'date' },
  { value: 'time' },
  { value: 'token' },
]

// 常用可传参数列表
const commonParamValues = [
  { value: 'json' },
  { value: 'xml' },
  { value: 'text' },
  { value: 'html' },
  { value: '302' },
  { value: '301' },
  { value: 'true' },
  { value: 'false' },
  { value: '1' },
  { value: '0' },
  { value: 'asc' },
  { value: 'desc' },
  { value: 'utf-8' },
  { value: 'gbk' },
  { value: 'get' },
  { value: 'post' },
  { value: 'put' },
  { value: 'delete' },
  { value: 'image' },
  { value: 'file' },
]

const position = [
  {
    value: 'query',
    label: 'query',
  },
  {
    value: 'body',
    label: 'body',
  },
  {
    value: 'header',
    label: 'header',
  },
]

// 一键设置 JSON 参数
const setJsonParam = () => {
  addparameter.name = 'json'
  addparameter.param = 'json'
  addparameter.position = 'body'
  addparameter.docs = ''
  addparameter.required = true
  msg('已设置为 JSON 参数配置，请填写 JSON 内容到参数描述中', 'success')
}

const onSubmit = async () => {
  if (
    !addparameter.id ||
    !addparameter.name ||
    !addparameter.param ||
    !addparameter.docs ||
    !addparameter.position
  ) {
    msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('aid', addparameter.id)
  bodyValue.append('name', addparameter.name)
  bodyValue.append('param', addparameter.param)
  bodyValue.append('position', addparameter.position)
  bodyValue.append('docs', addparameter.docs)

  if (addparameter.required) {
    bodyValue.append('required', 1)
  } else {
    bodyValue.append('required', 2)
  }

  const res = await $myFetch('ParamCreate', {
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
  }, 500)
}

// 搜索
const querySearchAsync = async (queryString, cb) => {
  if (queryString === '') {
    addparameter.apiName = ''
    cb([])
    return false
  }

  if (queryString === searchOldValue.value) {
    cb(searchData.value)
    return false
  }
  const res = await $myFetch('ApiSearch', {
    params: {
      keyword: queryString,
    },
  })

  if (res.code !== 200) {
    $msg(res.msg, 'error')
  }

  // 遍历数据，将 name 改为 value
  res.data = res.data.map((item) => {
    item.value = item.name
    delete item.name
    return item
  })

  searchOldValue.value = queryString
  searchData.value = res.data
  cb(searchData.value)
}

const handleSearchSelect = (item) => {
  addparameter.id = item.id
}

// 参数名称自动完成
const queryParamNameAsync = (queryString, cb) => {
  const results = queryString
    ? commonParamNames.filter((item) =>
        item.value.toLowerCase().includes(queryString.toLowerCase()),
      )
    : commonParamNames

  cb(results)
}

// 可传参数自动完成
const queryParamValueAsync = (queryString, cb) => {
  const results = queryString
    ? commonParamValues.filter((item) =>
        item.value.toLowerCase().includes(queryString.toLowerCase()),
      )
    : commonParamValues

  cb(results)
}

useHead({
  title: '添加参数',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="addparam_container">
    <div class="param-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">参数配置</span>
        </div>
        <div class="header-right">
          <el-tag size="small" effect="plain" type="info">必填项</el-tag>
        </div>
      </div>

      <div class="form">
        <client-only>
          <el-alert
            title="JSON 格式展示说明"
            type="info"
            show-icon
            :closable="false"
            style="margin-bottom: 20px"
          >
            <template #default>
              <div>
                若需在文档页以 JSON
                代码块形式展示参数说明，请添加一个参数：参数名称为
                'json'，可传参数为 'json'，传入位置为 'body'，设为'必传'，并将
                JSON 内容填入'参数描述'中。
              </div>
              <div style="margin-top: 10px">
                <el-button type="primary" size="small" @click="setJsonParam">
                  一键设置 JSON 参数
                </el-button>
              </div>
            </template>
          </el-alert>
        </client-only>
        <el-form :model="addparameter" label-position="top" label-width="120px">
          <el-form-item label="接口名称" required>
            <el-autocomplete
              v-model="addparameter.apiName"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入接口名称"
              @select="handleSearchSelect"
              class="full-width"
            />
          </el-form-item>
          <el-form-item label="参数名称" required>
            <el-autocomplete
              v-model="addparameter.name"
              :fetch-suggestions="queryParamNameAsync"
              placeholder="请输入参数名称，或从常用参数中选择"
              class="full-width"
            />
          </el-form-item>
          <el-form-item label="可传参数" required>
            <el-autocomplete
              v-model="addparameter.param"
              :fetch-suggestions="queryParamValueAsync"
              placeholder="请输入可传参数，或从常用值中选择"
              class="full-width"
            />
          </el-form-item>
          <client-only>
            <el-form-item label="传入位置" required>
              <el-select
                v-model="addparameter.position"
                placeholder="传入位置"
                class="full-width"
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
          <el-form-item label="参数描述" required>
            <el-input
              v-model="addparameter.docs"
              type="textarea"
              :rows="3"
              placeholder="返回json数据 | 重定义到图片"
            />
          </el-form-item>
          <el-form-item label="是否必传">
            <el-switch v-model="addparameter.required" />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <AdminSubmitFooter>
      <el-button type="primary" size="large" @click="onSubmit">提交</el-button>
      <el-button plain size="large" @click="navigateTo('/admin/apilist')">
        取消
      </el-button>
    </AdminSubmitFooter>
  </div>
</template>

<style lang="less" scoped>
.addparam_container {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  padding-bottom: 100px;
  background: #f5f7fa;

  .param-card {
    width: 100%;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #ebeef5;
    padding: 16px 20px;
    margin: 0 auto;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .header-left {
        display: flex;
        align-items: flex-start;

        .title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          line-height: 1.3;
        }
      }
    }

    .form {
      width: 100%;
      padding: 8px 0 0;

      :deep(.el-form-item) {
        margin-bottom: 24px;

        &:last-child {
          margin-bottom: 0;
        }

        .el-form-item__label {
          font-weight: 500;
          color: #374151;
          padding-bottom: 8px;
        }

        .el-input__wrapper,
        .el-select__wrapper,
        .el-textarea__inner {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #d1d5db;
          border-radius: 6px;

          &:hover {
            border-color: #9ca3af;
          }

          &.is-focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }

        .full-width {
          width: 100%;
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .addparam_container {
    padding: 20px;
    padding-bottom: 100px;
  }
}

@media screen and (max-width: 768px) {
  .addparam_container {
    padding: 12px;
    padding-bottom: 100px;

    .param-card {
      padding: 14px;

      .card-header {
        flex-direction: column;
        gap: 12px;
      }
    }
  }
}
</style>
