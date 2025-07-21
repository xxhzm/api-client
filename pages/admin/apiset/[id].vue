<script setup>
import { Tickets, Menu } from '@element-plus/icons-vue'

const route = useRoute()

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

// 返回示例编辑器类型
const exampleEditorType = ref('basic')

const paramsArr = ref()
const packageList = ref([])

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

const getData = async () => {
  const res = await $myFetch('ApiId', {
    params: {
      id: route.params.id,
    },
  })

  // 获取套餐信息
  const packageRes = await $myFetch('PackageList', {
    params: {
      api_id: route.params.id,
    },
  })
  if (packageRes.code === 200) {
    packageList.value = packageRes.data
  }

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
  await getRateLimitSettings()
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

// 参数编辑相关
const paramDialogStatus = ref(false)
const updateParamStatus = ref(false)
const paramEditInfo = ref({
  id: '',
  aid: '',
  name: '',
  param: '',
  position: 'query',
  docs: '',
  required: true,
})

// 编辑参数
const handleParamEdit = (index, row) => {
  paramDialogStatus.value = true
  updateParamStatus.value = true
  paramEditInfo.value = {
    id: row.id,
    aid: row.aid,
    name: row.name,
    param: row.param,
    position: row.position,
    docs: row.docs,
    required: row.required === '必传',
  }
}

// 更新参数
const updateParam = async () => {
  if (
    !paramEditInfo.value.name ||
    !paramEditInfo.value.param ||
    !paramEditInfo.value.position ||
    !paramEditInfo.value.docs
  ) {
    msg('请填写完整信息', 'error')
    return
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('id', paramEditInfo.value.id)
  bodyValue.append('aid', paramEditInfo.value.aid)
  bodyValue.append('name', paramEditInfo.value.name)
  bodyValue.append('param', paramEditInfo.value.param)
  bodyValue.append('position', paramEditInfo.value.position)
  bodyValue.append('docs', paramEditInfo.value.docs)
  bodyValue.append('required', paramEditInfo.value.required ? 1 : 2)

  const res = await $myFetch('UpdateParam', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    msg(res.msg, 'success')
    paramDialogStatus.value = false
    await getData()
  } else {
    msg(res.msg, 'error')
  }
}

// 监听参数编辑对话框关闭，重置表单
watch(paramDialogStatus, (newValue) => {
  if (!newValue) {
    updateParamStatus.value = false
    paramEditInfo.value = {
      id: '',
      aid: '',
      name: '',
      param: '',
      position: 'query',
      docs: '',
      required: true,
    }
  }
})

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

const packageSearch = ref('')

// 套餐搜索过滤
const filterPackageList = computed(() =>
  packageList.value.filter(
    (data) =>
      !packageSearch.value ||
      data.name.toLowerCase().includes(packageSearch.value.toLowerCase())
  )
)

// 获取套餐类型文字
const getPackageTypeText = (type) => {
  const types = {
    2: '包月计费',
    3: '点数包',
  }
  return types[type] || '未知'
}

// 获取套餐类型标签样式
const getPackageTypeTag = (type) => {
  const types = {
    2: 'success',
    3: 'primary',
  }
  return types[type] || ''
}

// 编辑套餐
const handlePackageEdit = (index, row) => {
  dialogStatus.value = true
  updatePackageStatus.value = true
  packageInfo.value = {
    ...row,
    api_name: apiSetInfo.value.name,
  }
}

// 删除套餐
const handlePackageDelete = async (index, row) => {
  loading.value = true
  const res = await $myFetch('DeletePackage', {
    params: {
      id: row.id,
    },
  })

  if (res.code === 200) {
    msg(res.msg, 'success')
    await getData()
  } else {
    msg(res.msg, 'error')
  }
  loading.value = false
}

// 修改套餐状态
const handlePackageStatusChange = async (row) => {
  loading.value = true
  const body = new URLSearchParams()
  body.append('id', row.id)
  body.append('name', row.name)
  body.append('apiId', row.api_id)
  body.append('type', row.type)
  body.append('price', row.price)
  body.append('duration', row.duration)
  body.append('points', row.points || 0)
  body.append('status', row.status === 1 ? 0 : 1)
  body.append('description', row.description || '')

  const res = await $myFetch('UpdatePackage', {
    method: 'POST',
    body,
  })

  if (res.code === 200) {
    row.status = row.status === 1 ? 0 : 1
    msg(res.msg, 'success')
  } else {
    msg(res.msg, 'error')
  }
  loading.value = false
}

const loading = ref(false)
const dialogStatus = ref(false)
const updatePackageStatus = ref(false)

// 套餐信息
const packageInfo = ref({
  id: 0,
  name: '',
  api_name: '',
  api_id: 0,
  type: 2,
  price: 0,
  duration: 30,
  points: 0,
  status: 1,
  description: '',
})

// 提交套餐
const submitPackage = async () => {
  // 验证必填信息
  if (!packageInfo.value.name) {
    msg('请输入套餐名称', 'error')
    return
  }
  if (packageInfo.value.price < 0.01) {
    msg('价格不能小于0.01', 'error')
    return
  }
  if (packageInfo.value.type === 2 && packageInfo.value.duration < 1) {
    msg('有效期不能小于1天', 'error')
    return
  }
  if (packageInfo.value.type === 3 && packageInfo.value.points <= 0) {
    msg('请输入正确的点数', 'error')
    return
  }

  loading.value = true
  const body = new URLSearchParams()
  body.append('name', packageInfo.value.name)
  body.append('apiId', route.params.id)
  body.append('type', packageInfo.value.type)
  body.append('price', packageInfo.value.price)
  body.append('duration', packageInfo.value.duration)
  body.append('points', packageInfo.value.points || 0)
  body.append('status', packageInfo.value.status)
  body.append('description', packageInfo.value.description || '')

  if (updatePackageStatus.value) {
    body.append('id', packageInfo.value.id)
  }

  const url = updatePackageStatus.value ? 'UpdatePackage' : 'CreatePackage'

  const res = await $myFetch(url, {
    method: 'POST',
    body,
  })

  if (res.code === 200) {
    msg(res.msg, 'success')
    dialogStatus.value = false
    await getData()
  } else {
    msg(res.msg, 'error')
  }
  loading.value = false
}

// 监听弹窗关闭，重置表单
watch(dialogStatus, (newValue) => {
  if (!newValue) {
    updatePackageStatus.value = false
    packageInfo.value = {
      id: 0,
      name: '',
      api_name: '',
      api_id: 0,
      type: 2,
      price: 0,
      duration: 30,
      points: 0,
      status: 1,
      description: '',
    }
  }
})

// 数字验证
// 自定义金额
const handleCustomAmount = (field) => {
  if (packageInfo.value[field]) {
    // 允许输入数字和小数点，但限制只能有一个小数点
    const numVal = packageInfo.value[field]
      .toString()
      .replace(/[^\d.]/g, '')
      .replace(/(\..*)\./g, '$1')
    // 只更新显示值，不立即转换为数字
    packageInfo.value[field] = numVal
  } else {
    // 当输入框为空时，设置金额为0
    packageInfo.value[field] = ''
  }
}

const validateNumber = (field) => {
  // 移除非数字字符
  packageInfo.value[field] = packageInfo.value[field]
    .toString()
    .replace(/[^\d]/g, '')

  // 转换为数字
  if (packageInfo.value[field] !== '') {
    packageInfo.value[field] = parseInt(packageInfo.value[field])
  }
}

// QPS限制相关
const rateLimitInfo = ref({
  requestLimit: '',
  timeFrame: '',
  blacklistDuration: '',
})

const rateLimitLoading = ref(false)
const isRateLimitSet = ref(false)

// 获取QPS限制设置
const getRateLimitSettings = async () => {
  try {
    const res = await $myFetch('GetApiRateLimitSettings', {
      params: {
        id: route.params.id,
      },
    })

    if (res.code === 200 && res.data) {
      rateLimitInfo.value = {
        requestLimit: res.data.request_limit || '',
        timeFrame: res.data.time_frame || '',
        blacklistDuration: res.data.blacklist_duration || '',
      }
      isRateLimitSet.value = !!(
        res.data.request_limit &&
        res.data.time_frame &&
        res.data.blacklist_duration
      )
    } else {
      // 接口返回空或无数据，表示未设置
      isRateLimitSet.value = false
    }
  } catch (error) {
    console.error('获取QPS限制设置失败:', error)
    isRateLimitSet.value = false
  }
}

// 更新QPS限制设置
const updateRateLimitSettings = async () => {
  if (
    !rateLimitInfo.value.requestLimit ||
    rateLimitInfo.value.requestLimit <= 0
  ) {
    msg('请求限制必须大于0', 'error')
    return
  }
  if (!rateLimitInfo.value.timeFrame || rateLimitInfo.value.timeFrame <= 0) {
    msg('时间窗口必须大于0', 'error')
    return
  }
  if (
    rateLimitInfo.value.blacklistDuration === '' ||
    rateLimitInfo.value.blacklistDuration < 0
  ) {
    msg('黑名单时长不能小于0', 'error')
    return
  }

  rateLimitLoading.value = true

  const bodyValue = new URLSearchParams()
  bodyValue.append('apiId', route.params.id)
  bodyValue.append('requestLimit', rateLimitInfo.value.requestLimit)
  bodyValue.append('timeFrame', rateLimitInfo.value.timeFrame)
  bodyValue.append('blacklistDuration', rateLimitInfo.value.blacklistDuration)

  try {
    const res = await $myFetch('UpdateApiRateLimitSettings', {
      method: 'POST',
      body: bodyValue,
    })

    if (res.code === 200) {
      msg(res.msg || 'QPS限制设置更新成功', 'success')
      // 更新设置状态
      isRateLimitSet.value = true
    } else {
      msg(res.msg || 'QPS限制设置更新失败', 'error')
    }
  } catch (error) {
    msg('QPS限制设置更新失败', 'error')
  } finally {
    rateLimitLoading.value = false
  }
}

// 验证QPS限制相关数字输入
const validateRateLimitNumber = (field) => {
  // 移除非数字字符
  rateLimitInfo.value[field] = rateLimitInfo.value[field]
    .toString()
    .replace(/[^\d]/g, '')

  // 转换为数字
  if (rateLimitInfo.value[field] !== '') {
    rateLimitInfo.value[field] = parseInt(rateLimitInfo.value[field])
  }
}

// 新增套餐
const handleAddPackage = () => {
  dialogStatus.value = true
  updatePackageStatus.value = false
  packageInfo.value = {
    id: 0,
    name: '',
    api_name: apiSetInfo.value.name,
    api_id: route.params.id,
    type: 2,
    price: 0,
    duration: 30,
    points: 0,
    status: 1,
    description: '',
  }
}

// 添加参数相关
const addParamDialogStatus = ref(false)
const addParamInfo = ref({
  name: '',
  param: '',
  position: 'query',
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

// 处理添加参数
const handleAddParam = () => {
  addParamDialogStatus.value = true
  addParamInfo.value = {
    name: '',
    param: '',
    position: 'query',
    docs: '',
    required: true,
  }
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

const addParam = async () => {
  if (
    !addParamInfo.value.name ||
    !addParamInfo.value.param ||
    !addParamInfo.value.position ||
    !addParamInfo.value.docs
  ) {
    msg('请填写完整信息', 'error')
    return
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('aid', route.params.id)
  bodyValue.append('name', addParamInfo.value.name)
  bodyValue.append('param', addParamInfo.value.param)
  bodyValue.append('position', addParamInfo.value.position)
  bodyValue.append('docs', addParamInfo.value.docs)
  bodyValue.append('required', addParamInfo.value.required ? 1 : 2)

  const res = await $myFetch('ParamCreate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    msg(res.msg, 'success')
    addParamDialogStatus.value = false
    await getData()
  } else {
    msg(res.msg, 'error')
  }
}

// 监听添加参数对话框关闭，重置表单
watch(addParamDialogStatus, (newValue) => {
  if (!newValue) {
    addParamInfo.value = {
      name: '',
      param: '',
      position: 'query',
      docs: '',
      required: true,
    }
  }
})

useHead({
  title: '编辑接口',
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
        <el-icon @click="handleSidebarShow">
          <Menu />
        </el-icon>
      </div>
      <AdminHeader></AdminHeader>
      <div class="apiset-container">
        <div class="apiset-cont">
          <ClientOnly>
            <el-tabs v-model="activeName">
              <el-tab-pane label="基本信息" name="Base">
                <el-form :model="apiSetInfo">
                  <el-row :gutter="12">
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口名称" :label-width="90"
                        ><el-input
                          v-model="apiSetInfo.name"
                          maxlength="25"
                          show-word-limit
                      /></el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口别名" :label-width="90">
                        <el-input
                          v-model="apiSetInfo.alias"
                          maxlength="25"
                          show-word-limit
                        />
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口地址" :label-width="90">
                        <el-input v-model="apiSetInfo.url" />
                        <div class="form-tip">
                          <el-text type="info" size="small">
                            PHP-FPM 提示：直接填写项目文件夹路径即可，如
                            /www/wwwroot/tcping，系统会自动访问该目录下的
                            index.php 文件
                          </el-text>
                        </div>
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="请求类型" :label-width="90">
                        <el-select
                          v-model="apiSetInfo.method"
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

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口示例" :label-width="90">
                        <el-input v-model="apiSetInfo.example_url" />
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口描述" :label-width="90">
                        <el-input v-model="apiSetInfo.description" />
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口关键词" :label-width="90">
                        <el-input v-model="apiSetInfo.keywords" />
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口前缀" :label-width="90">
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
                      <el-form-item label="接口分类" :label-width="90">
                        <el-autocomplete
                          v-model="apiSetInfo.category"
                          :fetch-suggestions="querySearch"
                          placeholder="请选择分类"
                          @select="handleSelect"
                        />
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口状态" :label-width="90">
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
                      <el-form-item label="秘钥验证" :label-width="90">
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
                      <el-form-item label="返回示例" :label-width="90">
                        <div class="example-editor-container">
                          <div class="editor-type-selector">
                            <el-radio-group
                              v-model="exampleEditorType"
                              size="small"
                            >
                              <el-radio-button value="basic"
                                >基础</el-radio-button
                              >
                              <el-radio-button value="advanced"
                                >高级</el-radio-button
                              >
                            </el-radio-group>
                          </div>

                          <!-- 基础文本框 -->
                          <el-input
                            v-if="exampleEditorType === 'basic'"
                            :rows="10"
                            v-model="apiSetInfo.example"
                            type="textarea"
                            placeholder="请输入返回示例"
                          />

                          <!-- 高级编辑器 -->
                          <div v-else class="advanced-editor">
                            <TinyMCEEditor
                              v-model="apiSetInfo.example"
                              :height="400"
                            />
                          </div>
                        </div>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </el-tab-pane>

              <el-tab-pane label="参数信息" name="Parameter">
                <div class="param-header">
                  <div class="header-left">
                    <span class="param-title">参数列表</span>
                  </div>
                  <div class="header-right">
                    <el-button type="primary" @click="handleAddParam">
                      <span>添加参数</span>
                    </el-button>
                  </div>
                </div>

                <el-table :data="paramsArr">
                  <el-table-column prop="aid" label="id" />
                  <el-table-column prop="name" label="接口名称" />
                  <el-table-column prop="param" label="传递参数" />
                  <el-table-column prop="position" label="传入位置" />
                  <el-table-column prop="docs" label="参数描述" />
                  <el-table-column prop="required" label="是否必传" />
                  <el-table-column prop="create_time" label="创建时间" />
                  <el-table-column width="160" label="操作">
                    <template #default="scope">
                      <div class="table-actions">
                        <el-button
                          size="small"
                          type="primary"
                          @click="handleParamEdit(scope.$index, scope.row)"
                        >
                          编辑
                        </el-button>
                        <el-popconfirm
                          confirm-button-text="确定"
                          cancel-button-text="取消"
                          title="您确定要删除吗?"
                          width="160px"
                          @confirm="handleDelete(scope.$index, scope.row)"
                        >
                          <template #reference>
                            <el-button size="small" type="danger"
                              >删除</el-button
                            >
                          </template>
                        </el-popconfirm>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>

                <!-- 添加参数对话框 -->
                <el-dialog
                  v-model="addParamDialogStatus"
                  title="添加参数"
                  width="600px"
                  destroy-on-close
                  class="param-dialog"
                >
                  <div class="dialog-content">
                    <el-form :model="addParamInfo" label-width="100px">
                      <el-row :gutter="20">
                        <el-col :span="12">
                          <el-form-item label="参数名称" required>
                            <el-autocomplete
                              v-model="addParamInfo.name"
                              :fetch-suggestions="queryParamNameAsync"
                              placeholder="请输入参数名称，或从常用参数中选择"
                              style="width: 100%"
                            />
                          </el-form-item>
                        </el-col>
                        <el-col :span="12">
                          <el-form-item label="可传参数" required>
                            <el-autocomplete
                              v-model="addParamInfo.param"
                              :fetch-suggestions="queryParamValueAsync"
                              placeholder="请输入可传参数，或从常用值中选择"
                              style="width: 100%"
                            />
                          </el-form-item>
                        </el-col>
                      </el-row>

                      <el-row :gutter="20">
                        <el-col :span="12">
                          <el-form-item label="传入位置" required>
                            <el-select
                              v-model="addParamInfo.position"
                              placeholder="请选择传入位置"
                              class="full-width"
                            >
                              <el-option label="query" value="query" />
                              <el-option label="body" value="body" />
                            </el-select>
                          </el-form-item>
                        </el-col>
                        <el-col :span="12">
                          <el-form-item label="是否必传">
                            <el-switch v-model="addParamInfo.required" />
                          </el-form-item>
                        </el-col>
                      </el-row>

                      <el-form-item label="参数描述" required>
                        <el-input
                          v-model="addParamInfo.docs"
                          type="textarea"
                          :rows="3"
                          placeholder="请输入参数描述"
                        />
                      </el-form-item>
                    </el-form>
                  </div>
                  <template #footer>
                    <div class="dialog-footer">
                      <el-button @click="addParamDialogStatus = false">
                        取消
                      </el-button>
                      <el-button type="primary" @click="addParam">
                        添加
                      </el-button>
                    </div>
                  </template>
                </el-dialog>

                <!-- 编辑参数对话框 -->
                <el-dialog
                  v-model="paramDialogStatus"
                  title="编辑参数"
                  width="600px"
                  destroy-on-close
                  class="param-dialog"
                >
                  <div class="dialog-content">
                    <el-form :model="paramEditInfo" label-width="100px">
                      <el-row :gutter="20">
                        <el-col :span="12">
                          <el-form-item label="参数名称" required>
                            <el-input
                              v-model="paramEditInfo.name"
                              placeholder="请输入参数名称"
                            />
                          </el-form-item>
                        </el-col>
                        <el-col :span="12">
                          <el-form-item label="可传参数" required>
                            <el-input
                              v-model="paramEditInfo.param"
                              placeholder="请输入可传参数"
                            />
                          </el-form-item>
                        </el-col>
                      </el-row>

                      <el-row :gutter="20">
                        <el-col :span="12">
                          <el-form-item label="传入位置" required>
                            <el-select
                              v-model="paramEditInfo.position"
                              placeholder="请选择传入位置"
                              class="full-width"
                            >
                              <el-option label="query" value="query" />
                              <el-option label="body" value="body" />
                            </el-select>
                          </el-form-item>
                        </el-col>
                        <el-col :span="12">
                          <el-form-item label="是否必传">
                            <el-switch v-model="paramEditInfo.required" />
                          </el-form-item>
                        </el-col>
                      </el-row>

                      <el-form-item label="参数描述" required>
                        <el-input
                          v-model="paramEditInfo.docs"
                          type="textarea"
                          :rows="3"
                          placeholder="请输入参数描述"
                        />
                      </el-form-item>
                    </el-form>
                  </div>
                  <template #footer>
                    <div class="dialog-footer">
                      <el-button @click="paramDialogStatus = false">
                        取消
                      </el-button>
                      <el-button type="primary" @click="updateParam">
                        更新
                      </el-button>
                    </div>
                  </template>
                </el-dialog>
              </el-tab-pane>

              <el-tab-pane label="QPS限制" name="RateLimit">
                <div class="rate-limit-container">
                  <el-form :model="rateLimitInfo" label-width="120px">
                    <el-row :gutter="24">
                      <el-col :xs="24" :sm="12" :md="8">
                        <el-form-item label="请求限制" required>
                          <el-input
                            v-model="rateLimitInfo.requestLimit"
                            placeholder="请输入每个时间窗口内的最大请求数"
                            @input="validateRateLimitNumber('requestLimit')"
                          >
                            <template #suffix>次</template>
                          </el-input>
                          <div class="form-help">
                            每个时间窗口内允许的最大请求次数
                          </div>
                        </el-form-item>
                      </el-col>

                      <el-col :xs="24" :sm="12" :md="8">
                        <el-form-item label="时间窗口" required>
                          <el-input
                            v-model="rateLimitInfo.timeFrame"
                            placeholder="请输入时间窗口"
                            @input="validateRateLimitNumber('timeFrame')"
                          >
                            <template #suffix>秒</template>
                          </el-input>
                          <div class="form-help">
                            统计请求次数的时间窗口长度
                          </div>
                        </el-form-item>
                      </el-col>

                      <el-col :xs="24" :sm="12" :md="8">
                        <el-form-item label="黑名单时长" required>
                          <el-input
                            v-model="rateLimitInfo.blacklistDuration"
                            placeholder="请输入黑名单时长"
                            @input="
                              validateRateLimitNumber('blacklistDuration')
                            "
                          >
                            <template #suffix>秒</template>
                          </el-input>
                          <div class="form-help">超限后被加入黑名单的时间</div>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row>
                      <el-col :span="24">
                        <div class="rate-limit-example">
                          <h4>当前设置说明：</h4>
                          <p v-if="!isRateLimitSet">
                            <span class="no-setting"
                              >该接口尚未设置QPS限制</span
                            >
                          </p>
                          <p
                            v-else-if="
                              rateLimitInfo.requestLimit &&
                              rateLimitInfo.timeFrame &&
                              rateLimitInfo.blacklistDuration
                            "
                          >
                            用户在
                            <strong>{{ rateLimitInfo.timeFrame }}秒</strong>
                            内最多可以请求
                            <strong>{{ rateLimitInfo.requestLimit }}次</strong
                            >， 超过限制后将被加入黑名单
                            <strong
                              >{{ rateLimitInfo.blacklistDuration }}秒</strong
                            >
                          </p>
                          <p v-else>
                            <span class="incomplete-setting"
                              >请完善所有设置项以启用QPS限制</span
                            >
                          </p>
                        </div>
                      </el-col>
                    </el-row>

                    <el-row>
                      <el-col :span="24">
                        <el-form-item>
                          <el-button
                            type="primary"
                            @click="updateRateLimitSettings"
                            :loading="rateLimitLoading"
                            size="large"
                          >
                            {{ rateLimitLoading ? '保存中...' : '保存QPS设置' }}
                          </el-button>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-form>
                </div>
              </el-tab-pane>

              <el-tab-pane label="套餐信息" name="Package">
                <div class="table-container">
                  <div class="card-header">
                    <div class="header-left">
                      <el-icon class="icon">
                        <Tickets />
                      </el-icon>
                      <span class="title">套餐管理</span>
                    </div>
                    <div class="header-right">
                      <el-button type="primary" @click="handleAddPackage">
                        <span>新增套餐</span>
                      </el-button>
                    </div>
                  </div>
                  <client-only>
                    <el-table :data="filterPackageList" style="width: 100%">
                      <el-table-column width="160" fixed="right">
                        <template #header>
                          <div class="search-wrapper">
                            <el-input
                              v-model="packageSearch"
                              placeholder="搜索"
                              clearable
                            >
                            </el-input>
                          </div>
                        </template>
                        <template #default="scope">
                          <div class="table-actions">
                            <el-button
                              type="primary"
                              link
                              @click="
                                handlePackageEdit(scope.$index, scope.row)
                              "
                            >
                              编辑
                            </el-button>
                            <el-popconfirm
                              confirm-button-text="确定"
                              cancel-button-text="取消"
                              title="确定要删除吗？"
                              @confirm="
                                handlePackageDelete(scope.$index, scope.row)
                              "
                            >
                              <template #reference>
                                <el-button type="danger" link> 删除 </el-button>
                              </template>
                            </el-popconfirm>
                          </div>
                        </template>
                      </el-table-column>
                      <el-table-column prop="id" label="ID" width="80" />
                      <el-table-column
                        prop="name"
                        label="套餐名称"
                        min-width="120"
                      />
                      <el-table-column prop="type" label="类型" width="120">
                        <template #default="scope">
                          <el-tag :type="getPackageTypeTag(scope.row.type)">
                            {{ getPackageTypeText(scope.row.type) }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column prop="price" label="价格" width="100">
                        <template #default="scope">
                          <span class="price">¥{{ scope.row.price }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="duration"
                        label="有效期"
                        width="100"
                      >
                        <template #default="scope">
                          <span class="duration"
                            >{{ scope.row.duration }}天</span
                          >
                        </template>
                      </el-table-column>
                      <el-table-column prop="points" label="点数" width="80">
                        <template #default="scope">
                          <span class="points">{{ scope.row.points }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column prop="status" label="状态" width="100">
                        <template #default="scope">
                          <el-tag
                            :type="
                              scope.row.status === 1 ? 'success' : 'danger'
                            "
                            class="status-tag"
                            @click="handlePackageStatusChange(scope.row)"
                            style="cursor: pointer"
                          >
                            {{ scope.row.status === 1 ? '启用' : '禁用' }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="created_time"
                        label="创建时间"
                        width="180"
                      >
                        <template #default="scope">
                          {{
                            new Date(
                              Number(scope.row.created_time)
                            ).toLocaleString()
                          }}
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="updated_time"
                        label="修改时间"
                        width="180"
                      >
                        <template #default="scope">
                          {{
                            new Date(
                              Number(scope.row.updated_time)
                            ).toLocaleString()
                          }}
                        </template>
                      </el-table-column>
                    </el-table>

                    <!-- 新增/编辑套餐对话框 -->
                    <el-dialog
                      v-model="dialogStatus"
                      :title="updatePackageStatus ? '修改套餐' : '新增套餐'"
                      width="600px"
                      destroy-on-close
                      class="package-dialog"
                    >
                      <div class="dialog-content">
                        <el-form :model="packageInfo" label-width="100px">
                          <el-row :gutter="20">
                            <el-col :span="12">
                              <el-form-item label="套餐名称" required>
                                <el-input
                                  v-model="packageInfo.name"
                                  placeholder="请输入套餐名称"
                                />
                              </el-form-item>
                            </el-col>
                            <el-col :span="12">
                              <el-form-item label="接口名称" required>
                                <el-input
                                  v-model="packageInfo.api_name"
                                  placeholder="请输入接口名称"
                                  disabled
                                />
                              </el-form-item>
                            </el-col>
                          </el-row>

                          <el-row :gutter="20">
                            <el-col :span="12">
                              <el-form-item label="套餐类型" required>
                                <el-select
                                  v-model="packageInfo.type"
                                  placeholder="请选择套餐类型"
                                  class="full-width"
                                >
                                  <el-option label="包月计费" :value="2" />
                                  <el-option label="点数包" :value="3" />
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <el-col :span="12">
                              <el-form-item label="套餐价格" required>
                                <el-input
                                  v-model="packageInfo.price"
                                  placeholder="请输入价格"
                                  class="full-width"
                                  @input="handleCustomAmount('price')"
                                >
                                  <template #suffix>¥</template>
                                </el-input>
                              </el-form-item>
                            </el-col>
                          </el-row>

                          <el-row :gutter="20">
                            <el-col :span="12">
                              <el-form-item
                                label="包含点数"
                                v-if="packageInfo.type === 3"
                                required
                              >
                                <el-input
                                  v-model="packageInfo.points"
                                  placeholder="请输入点数"
                                  class="full-width"
                                  @input="validateNumber('points')"
                                >
                                  <template #suffix>点</template>
                                </el-input>
                              </el-form-item>
                              <el-form-item
                                label="有效期"
                                required
                                v-if="packageInfo.type === 2"
                              >
                                <el-input
                                  v-model="packageInfo.duration"
                                  placeholder="请输入有效期(天)"
                                  class="full-width"
                                  @input="validateNumber('duration')"
                                >
                                  <template #suffix>天</template>
                                </el-input>
                              </el-form-item>
                            </el-col>
                            <el-col :span="12"> </el-col>
                          </el-row>

                          <el-form-item label="状态">
                            <el-switch
                              v-model="packageInfo.status"
                              :active-value="1"
                              :inactive-value="0"
                            />
                          </el-form-item>

                          <el-form-item label="描述">
                            <el-input
                              v-model="packageInfo.description"
                              type="textarea"
                              :rows="3"
                              placeholder="请输入套餐描述"
                            />
                          </el-form-item>
                        </el-form>
                      </div>
                      <template #footer>
                        <div class="dialog-footer">
                          <el-button @click="dialogStatus = false"
                            >取消</el-button
                          >
                          <el-button type="primary" @click="submitPackage">
                            {{ updatePackageStatus ? '修改' : '创建' }}
                          </el-button>
                        </div>
                      </template>
                    </el-dialog>
                  </client-only>
                </div>
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

<style lang="less" scoped>
.container {
  display: flex;
  height: 100vh;

  .right {
    width: 100%;
    background-color: #f7f7f7;
    overflow-x: hidden;

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

// 返回示例编辑器样式
.example-editor-container {
  width: 100%;
  .editor-type-selector {
    margin-bottom: 12px;
    display: flex;
    align-items: center;

    :deep(.el-radio-group) {
      .el-radio-button__inner {
        padding: 8px 16px;
        font-size: 13px;
        border-radius: 6px;
        transition: all 0.3s;
      }

      .el-radio-button:first-child .el-radio-button__inner {
        border-left: 1px solid #dcdfe6;
      }

      .el-radio-button__original-radio:checked + .el-radio-button__inner {
        background-color: #409eff;
        border-color: #409eff;
        color: #fff;
      }
    }
  }

  .advanced-editor {
    margin-top: 8px;

    :deep(.tinymce-editor-container) {
      border-radius: 8px;
      overflow: hidden;
    }
  }

  :deep(.el-textarea) {
    .el-textarea__inner {
      border-radius: 8px;
      line-height: 1.5;
    }
  }
}

// QPS限制样式
.rate-limit-container {
  padding: 24px;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

  .form-help {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
    line-height: 1.4;
  }

  .rate-limit-example {
    margin: 24px 0;
    padding: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #4b5563;
      line-height: 1.5;

      strong {
        color: #1f2937;
        font-weight: 600;
      }

      .no-setting {
        color: #9ca3af;
        font-style: italic;
      }

      .incomplete-setting {
        color: #f59e0b;
        font-weight: 500;
      }
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;

    .el-form-item__label {
      color: #374151;
      font-weight: 500;
    }

    .el-input__suffix-inner {
      color: #6b7280;
    }
  }

  :deep(.el-button) {
    padding: 12px 24px;
    font-weight: 500;
  }
}

// 表格样式
.table-container {
  padding: 24px;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

  :deep(.el-table) {
    border: none;

    .search-wrapper {
      padding: 0;
      margin: 0;
      line-height: 1;
    }

    .el-input {
      width: 140px;
      margin: 0;
    }

    .el-table__header-wrapper {
      th {
        background: #f8fafc;
        color: #1f2937;
        font-weight: 600;
      }
    }
  }

  .table-actions {
    display: flex;
    gap: 8px;
    margin: 0;
    padding: 0;

    .el-button {
      padding: 4px 8px;
      font-size: 12px;
    }
  }
}

// 表格中的价格样式
.price {
  color: #f56c6c;
  font-weight: 500;
}

.duration,
.points {
  color: #67c23a;
  font-weight: 500;
}

.status-tag {
  padding: 4px 12px;
  font-size: 13px;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    opacity: 0.8;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 16px;

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

  .header-right {
    .el-button {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
}

// 参数编辑对话框样式
:deep(.param-dialog) {
  .dialog-content {
    padding: 20px 0;
  }

  .dialog-footer {
    text-align: right;

    .el-button {
      margin-left: 10px;
    }
  }

  .full-width {
    width: 100%;
  }

  .el-form-item {
    margin-bottom: 20px;
  }

  .el-textarea {
    width: 100%;
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

.param-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 16px;
  background: #f8fafc;
  border-radius: 8px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .param-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1f36;
    }
  }

  .header-right {
    .el-button {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
}
</style>
