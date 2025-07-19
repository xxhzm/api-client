<script setup>
import { InfoFilled, Setting, Connection, Menu } from '@element-plus/icons-vue'
const username = useCookie('username')

const { $msg, $myFetch } = useNuxtApp()
const msg = $msg

// 控制左侧边栏显示隐藏
// 获取页面宽度
const screenWidth = ref(0)
const isSidebarShow = ref(true)
const iscontrolShow = ref(false)
const isoverlay = ref(false)
onMounted(() => {
  screenWidth.value = document.body.clientWidth
  document.body.style.overflow = ''

  if (screenWidth.value < 768) {
    iscontrolShow.value = true
    isSidebarShow.value = false
  }
})

const handleSidebarShow = () => {
  isSidebarShow.value = !isSidebarShow.value
  iscontrolShow.value = !iscontrolShow.value
  isoverlay.value = !isoverlay.value
  // 禁止页面滑动
  if (isSidebarShow.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

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

// 请求方法选项
const methodOptions = [
  {
    value: 'GET',
    label: 'GET',
  },
  {
    value: 'POST',
    label: 'POST',
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

  if (createapiInfo.method !== 'GET' && createapiInfo.method !== 'POST') {
    msg('请选择正确的请求类型', 'error')
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

// 参数名称自动完成
const queryParamNameAsync = (queryString, cb) => {
  const results = queryString
    ? commonParamNames.filter((item) =>
        item.value.toLowerCase().includes(queryString.toLowerCase())
      )
    : commonParamNames

  cb(results)
}

// 可传参数自动完成
const queryParamValueAsync = (queryString, cb) => {
  const results = queryString
    ? commonParamValues.filter((item) =>
        item.value.toLowerCase().includes(queryString.toLowerCase())
      )
    : commonParamValues

  cb(results)
}

useHead({
  title: '新增接口',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="container">
    <AdminSidebar v-show="isSidebarShow"></AdminSidebar>

    <div class="right">
      <!-- 遮罩层 -->
      <div class="overlay" v-show="isoverlay" @click="handleSidebarShow"></div>
      <!-- 侧边栏控制按钮 -->
      <div class="control-sidebar" v-show="iscontrolShow">
        <el-icon @click="handleSidebarShow"><Menu /></el-icon>
      </div>
      <AdminHeader></AdminHeader>
      <div class="createapi-container">
        <!-- 接口信息卡片 -->
        <div class="createapi-cont">
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Connection />
              </el-icon>
              <span class="title">接口基础信息</span>
            </div>
            <div class="header-right">
              <el-tag size="small" effect="plain" type="info">必填项</el-tag>
            </div>
          </div>

          <!-- 表单内容保持不变，但调整样式 -->
          <el-form :model="createapiInfo" label-width="120px" class="main-form">
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
                  <div class="form-tip">
                    <el-text type="info" size="small">
                      PHP-FPM 提示：直接填写项目文件夹路径即可，如
                      /www/wwwroot/tcping，系统会自动访问该目录下的 index.php
                      文件
                    </el-text>
                  </div>
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
                  <el-select
                    v-model="createapiInfo.method"
                    placeholder="请选择请求类型"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in methodOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
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

        <!-- 参数信息卡片 -->
        <div class="createapi-cont">
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Setting />
              </el-icon>
              <span class="title">参数配置信息</span>
            </div>
            <div class="header-right">
              <el-tag size="small" effect="plain" type="warning">选填项</el-tag>
            </div>
          </div>

          <!-- 原有参数表单 -->
          <el-form :model="addparameter" label-width="120px" class="param-form">
            <el-form-item label="参数名称">
              <el-autocomplete
                v-model="addparameter.name"
                :fetch-suggestions="queryParamNameAsync"
                placeholder="请输入参数名称，或从常用参数中选择"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="可传参数">
              <el-autocomplete
                v-model="addparameter.param"
                :fetch-suggestions="queryParamValueAsync"
                placeholder="请输入可传参数，或从常用值中选择"
                style="width: 100%"
              />
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

        <!-- 底部操作栏 -->
        <div class="createapi-footer">
          <div class="footer-content">
            <div class="left-info">
              <el-icon>
                <InfoFilled />
              </el-icon>
              <span>请仔细检查信息后再提交</span>
            </div>
            <div class="right-buttons">
              <el-button type="primary" size="large" @click="create"
                >提交</el-button
              >
              <el-button plain size="large" @click="navigateTo('/admin')"
                >取消</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  background: #f5f7fa;

  .right {
    width: 100%;
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 998;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }
    .control-sidebar {
      position: absolute;
      width: 35px;
      height: 35px;
      top: 10px;
      left: 10px;
      z-index: 9999;
      text-align: center;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      .el-icon {
        margin-top: 10px;
        font-size: 16px;
      }
    }

    .createapi-container {
      position: relative;
      min-height: 100vh;
      padding: 24px 32px;

      .createapi-cont {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
        margin-bottom: 24px;
        border: 1px solid #eaecf0;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #eaecf0;

          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;

            .icon {
              font-size: 20px;
              color: #4b5563;
            }

            .title {
              font-size: 16px;
              font-weight: 600;
              color: #1a1f36;
            }
          }
        }

        :deep(.main-form),
        :deep(.param-form) {
          padding: 24px;

          .el-form-item {
            margin-bottom: 24px;

            .el-form-item__label {
              font-weight: 500;
              color: #374151;
            }

            .el-input__wrapper {
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

            .el-select,
            .el-autocomplete {
              width: 100%;
            }
          }
        }
      }

      .createapi-footer {
        position: fixed;
        bottom: 0;
        right: 0;
        width: calc(100% - 200px);
        background: #fff;
        border-top: 1px solid #eaecf0;
        padding: 16px 32px;
        z-index: 10;

        .footer-content {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 24px;

          .left-info {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #6b7280;
            font-size: 14px;
            margin-right: auto;

            .el-icon {
              color: #9ca3af;
            }
          }

          .right-buttons {
            display: flex;
            gap: 12px;

            .el-button {
              padding: 12px 24px;
              font-weight: 500;
              font-size: 14px;

              &.el-button--primary {
                background: #3b82f6;
                border: none;
                min-width: 88px;

                &:hover {
                  background: #2563eb;
                }
              }

              &.el-button--default {
                min-width: 88px;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 1200px) {
  .container .right .createapi-container {
    padding: 20px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .createapi-container {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }
}

// 表单提示样式
.form-tip {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #e0f2fe;
  border-radius: 4px;

  .el-text {
    color: #0369a1;
    line-height: 1.5;
  }
}
</style>
