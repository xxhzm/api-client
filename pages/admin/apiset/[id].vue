<script setup>
import {
  Tickets,
  Menu,
  InfoFilled,
  SuccessFilled,
  WarningFilled,
} from '@element-plus/icons-vue'

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

// 缓存类型常量
const CACHE_TYPE = {
  NO_CACHE: 'no_cache',
  WITH_PARAMS: 'cache_with_params',
  WITHOUT_PARAMS: 'cache_without_params',
}

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

  // 初始化多分类选中状态
  await initSelectedCategoriesFromApi()
}

onMounted(async () => {
  await getData()
  await getRateLimitSettings()
  await getCacheSettings()
  await getAdvancedSettings()
})

const updateApiInfo = async () => {
  // 至少选择一个分类
  if (!selectedCategories.value || selectedCategories.value.length === 0) {
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
  // 多分类以 | 拼接传递到后端
  const categoryIdsJoined = selectedCategories.value.map((c) => c.id).join('|')
  bodyValue.append('categoryId', categoryIdsJoined)
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
    navigateTo({
      path: '/admin/apilist',
      query: {
        page: Array.isArray(route.query.page)
          ? route.query.page[0]
          : route.query.page,
      },
    })
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

// 多分类选择支持
const selectedCategories = ref([]) // [{ id, name }]
const categoryInput = ref('')

const prepareCategoryData = async () => {
  // 预加载分类数据，用于名称映射
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
}

const initSelectedCategoriesFromApi = async () => {
  await prepareCategoryData()
  // 兼容新的接口返回：categories 为 [{ id, name }]
  const list = Array.isArray(apiSetInfo.value?.categories)
    ? apiSetInfo.value.categories
    : []
  selectedCategories.value = list.map((item) => {
    // 优先使用服务端返回的名称，其次从本地字典匹配
    const found = categoryData.value.find(
      (c) => String(c.id) === String(item.id)
    )
    return {
      id: Number(item.id),
      name: item.name || (found ? found.value : String(item.id)),
    }
  })
}

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
  // 去重添加
  if (!selectedCategories.value.some((c) => c.id === item.id)) {
    selectedCategories.value.push({ id: item.id, name: item.value })
  }
  // 选择后清空输入框
  categoryInput.value = ''
}

const removeSelectedCategory = (index) => {
  selectedCategories.value.splice(index, 1)
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
    4: '直接扣费',
    2: '包月计费',
    3: '点数包',
  }
  return types[type] || '未知'
}

// 获取套餐类型标签样式
const getPackageTypeTag = (type) => {
  const types = {
    4: 'warning',
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

// 缓存相关状态
const cacheInfo = ref({
  cacheType: 'no_cache',
  cacheDuration: 300,
})

const cacheLoading = ref(false)

// 获取缓存设置
const getCacheSettings = async () => {
  try {
    const res = await $myFetch('GetApiCacheSettings', {
      params: {
        id: route.params.id,
      },
    })
    if (res.code === 200 && res.data) {
      cacheInfo.value = {
        cacheType: res.data.cache_strategy || CACHE_TYPE.NO_CACHE,
        cacheDuration: res.data.cache_duration || 300,
      }
    } else {
      // 接口返回空或无数据，默认设置为不使用缓存
      cacheInfo.value = {
        cacheType: CACHE_TYPE.NO_CACHE,
        cacheDuration: 300,
      }
    }
  } catch (error) {
    console.error('获取缓存设置失败:', error)
    // 出错时也默认设置为不使用缓存
    cacheInfo.value = {
      cacheType: CACHE_TYPE.NO_CACHE,
      cacheDuration: 300,
    }
  }
}

// 更新缓存设置
const updateCacheSettings = async () => {
  if (
    cacheInfo.value.cacheType !== CACHE_TYPE.NO_CACHE &&
    (!cacheInfo.value.cacheDuration || cacheInfo.value.cacheDuration < 1)
  ) {
    msg('缓存时间必须大于0秒', 'error')
    return
  }

  cacheLoading.value = true

  const bodyValue = new URLSearchParams()
  bodyValue.append('aid', route.params.id)
  bodyValue.append('cacheStrategy', cacheInfo.value.cacheType)
  bodyValue.append('cacheDuration', cacheInfo.value.cacheDuration)

  try {
    const res = await $myFetch('UpdateApiCacheSettings', {
      method: 'POST',
      body: bodyValue,
    })

    if (res.code === 200) {
      msg(res.msg || '缓存设置更新成功', 'success')
    } else {
      msg(res.msg || '缓存设置更新失败', 'error')
    }
  } catch (error) {
    msg('缓存设置更新失败', 'error')
  } finally {
    cacheLoading.value = false
  }
}

// 验证缓存时间输入
const validateCacheDuration = () => {
  // 移除非数字字符
  cacheInfo.value.cacheDuration = cacheInfo.value.cacheDuration
    .toString()
    .replace(/[^\d]/g, '')

  // 转换为数字，确保不小于1秒
  if (cacheInfo.value.cacheDuration !== '') {
    const duration = parseInt(cacheInfo.value.cacheDuration)
    cacheInfo.value.cacheDuration = Math.max(1, duration)
  } else {
    // 如果为空，设置默认值
    cacheInfo.value.cacheDuration = 300
  }
}

// 高级设置相关状态（与 webset.vue 保持一致的行为与取值样式）
const advancedInfo = ref({
  // 统一使用字符串 'true' / 'false' 以匹配 webset.vue 的选择值
  phoneBinding: 'false',
  sse: 'false',
  // 以下为后期更新项（可保存但当前无实际效果）
  realNameAuth: 'false',
  enterpriseAuth: 'false',
  vipAuth: 'false',
  twoFactorAuth: 'false',
  // HTTP/PHP-FPM 头信息参数（当前可用）
  headers: '',
})

const advancedLoading = ref(false)

// 获取高级设置
const getAdvancedSettings = async () => {
  try {
    const res = await $myFetch('GetApiAdvancedSettings', {
      params: {
        id: route.params.id,
      },
    })

    if (res.code === 200 && res.data) {
      // 按照后端返回的字段映射到前端使用的 advancedInfo 结构
      advancedInfo.value = {
        phoneBinding:
          res.data.phone === true || res.data.phone === 1 ? 'true' : 'false',
        sse: res.data.sse === true || res.data.sse === 1 ? 'true' : 'false',
        realNameAuth:
          res.data.realname === true || res.data.realname === 1
            ? 'true'
            : 'false',
        enterpriseAuth:
          res.data.companyAuth === true || res.data.companyAuth === 1
            ? 'true'
            : 'false',
        vipAuth: res.data.vip === true || res.data.vip === 1 ? 'true' : 'false',
        twoFactorAuth:
          res.data.twoFa === true || res.data.twoFa === 1 ? 'true' : 'false',
        headers: res.data.header ?? '',
      }
    }
  } catch (error) {
    // 获取失败时保留默认值
  }
}

// 更新高级设置
const updateAdvancedSettings = async () => {
  advancedLoading.value = true

  const bodyValue = new URLSearchParams()
  bodyValue.append('aid', route.params.id)
  // 提交时统一使用后端的驼峰命名字段
  bodyValue.append('phone', advancedInfo.value.phoneBinding === 'true' ? 1 : 0)
  bodyValue.append('sse', advancedInfo.value.sse === 'true' ? 1 : 0)
  bodyValue.append(
    'realname',
    advancedInfo.value.realNameAuth === 'true' ? 1 : 0
  )
  bodyValue.append(
    'companyAuth',
    advancedInfo.value.enterpriseAuth === 'true' ? 1 : 0
  )
  bodyValue.append('vip', advancedInfo.value.vipAuth === 'true' ? 1 : 0)
  bodyValue.append('twoFA', advancedInfo.value.twoFactorAuth === 'true' ? 1 : 0)
  bodyValue.append('header', advancedInfo.value.headers || '')

  try {
    const res = await $myFetch('UpdateApiAdvancedSettings', {
      method: 'POST',
      body: bodyValue,
    })

    if (res.code === 200) {
      msg(res.msg || '高级设置更新成功', 'success')
    } else {
      msg(res.msg || '高级设置更新失败', 'error')
    }
  } catch (error) {
    msg('高级设置更新失败', 'error')
  } finally {
    advancedLoading.value = false
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

// 传入位置选项
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

// 一键设置 JSON 参数
const setJsonParam = () => {
  addParamInfo.value = {
    name: 'json',
    param: 'json',
    position: 'body',
    docs: '',
    required: true,
  }
  msg('已设置为 JSON 参数配置，请填写 JSON 内容到参数描述中', 'success')
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
                      <el-form-item label="接口名称" :label-width="90" required
                        ><el-input
                          v-model="apiSetInfo.name"
                          maxlength="25"
                          show-word-limit
                      /></el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口别名" :label-width="90" required>
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
                      <el-form-item label="请求类型" :label-width="90" required>
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
                      <el-form-item label="接口描述" :label-width="90" required>
                        <el-input v-model="apiSetInfo.description" />
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item
                        label="接口关键词"
                        :label-width="95"
                        required
                      >
                        <el-input v-model="apiSetInfo.keywords" />
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口前缀" :label-width="90" required>
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
                      <el-form-item label="接口分类" :label-width="90" required>
                        <el-autocomplete
                          v-model="categoryInput"
                          :fetch-suggestions="querySearch"
                          placeholder="请选择分类（可多选）"
                          @select="handleSelect"
                        />
                        <div
                          v-if="selectedCategories.length > 0"
                          style="margin-top: 8px"
                        >
                          <el-tag
                            v-for="(cat, idx) in selectedCategories"
                            :key="cat.id"
                            closable
                            @close="removeSelectedCategory(idx)"
                            style="margin-right: 6px; margin-bottom: 6px"
                            type="info"
                            effect="plain"
                          >
                            {{ cat.name }}
                          </el-tag>
                        </div>
                      </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                      <el-form-item label="接口状态" :label-width="90" required>
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
                      <el-form-item label="秘钥验证" :label-width="90" required>
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
                      <el-form-item label="返回示例" :label-width="90" required>
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
                  <el-table-column
                    prop="docs"
                    label="参数描述"
                    show-overflow-tooltip
                  />
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
                          'json'，可传参数为 'json'，传入位置为
                          'body'，设为'必传'，并将 JSON 内容填入'参数描述'中。
                        </div>
                        <div style="margin-top: 10px">
                          <el-button
                            type="primary"
                            size="small"
                            @click="setJsonParam"
                          >
                            一键设置 JSON 参数
                          </el-button>
                        </div>
                      </template>
                    </el-alert>
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
                              <el-option
                                v-for="item in position"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
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
                              <el-option
                                v-for="item in position"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
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

              <el-tab-pane label="接口缓存" name="Cache">
                <div class="cache-container">
                  <el-form :model="cacheInfo" label-width="120px">
                    <div class="cache-section">
                      <h3 class="section-title">缓存策略配置</h3>
                      <p class="section-description">
                        选择适合的缓存策略可以显著提高接口响应速度，减少服务器负载。
                      </p>

                      <el-form-item label="缓存类型" required>
                        <el-radio-group
                          v-model="cacheInfo.cacheType"
                          class="cache-radio-group"
                        >
                          <!-- 不使用缓存选项 -->
                          <div class="cache-option">
                            <el-radio value="no_cache" class="cache-radio">
                              <div class="option-content">
                                <div class="option-header">
                                  <span class="option-label">不使用缓存</span>
                                  <el-tag type="info" size="small">默认</el-tag>
                                </div>
                                <div class="option-description">
                                  每次请求都会直接访问后端服务，不使用任何缓存
                                </div>
                              </div>
                            </el-radio>
                          </div>

                          <!-- 基于参数缓存选项 -->
                          <div class="cache-option">
                            <el-radio
                              value="cache_with_params"
                              class="cache-radio"
                            >
                              <div class="option-content">
                                <div class="option-header">
                                  <span class="option-label">基于参数缓存</span>
                                  <el-tag type="success" size="small"
                                    >推荐</el-tag
                                  >
                                </div>
                                <div class="option-description">
                                  根据请求参数的不同组合进行缓存，相同参数返回缓存结果
                                </div>
                              </div>
                            </el-radio>
                          </div>

                          <!-- 忽略参数缓存选项 -->
                          <div class="cache-option">
                            <el-radio
                              value="cache_without_params"
                              class="cache-radio"
                            >
                              <div class="option-content">
                                <div class="option-header">
                                  <span class="option-label">忽略参数缓存</span>
                                  <el-tag type="warning" size="small"
                                    >高效</el-tag
                                  >
                                </div>
                                <div class="option-description">
                                  忽略请求参数，所有请求返回相同的缓存结果，性能最佳
                                </div>
                              </div>
                            </el-radio>
                          </div>
                        </el-radio-group>
                      </el-form-item>

                      <!-- 缓存时间设置 -->
                      <el-form-item
                        v-if="cacheInfo.cacheType !== CACHE_TYPE.NO_CACHE"
                        label="缓存时间"
                        required
                      >
                        <div class="cache-duration-container">
                          <el-input
                            v-model="cacheInfo.cacheDuration"
                            placeholder="请输入缓存时间"
                            class="cache-duration-input"
                            @input="validateCacheDuration"
                          >
                            <template #suffix>秒</template>
                          </el-input>
                          <div class="duration-presets">
                            <span class="preset-label">快速设置：</span>
                            <div class="preset-buttons">
                              <el-button
                                size="small"
                                type="primary"
                                plain
                                @click="cacheInfo.cacheDuration = 60"
                              >
                                1分钟
                              </el-button>
                              <el-button
                                size="small"
                                type="primary"
                                plain
                                @click="cacheInfo.cacheDuration = 300"
                              >
                                5分钟
                              </el-button>
                              <el-button
                                size="small"
                                type="primary"
                                plain
                                @click="cacheInfo.cacheDuration = 600"
                              >
                                10分钟
                              </el-button>
                              <el-button
                                size="small"
                                type="primary"
                                plain
                                @click="cacheInfo.cacheDuration = 1800"
                              >
                                30分钟
                              </el-button>
                              <el-button
                                size="small"
                                type="primary"
                                plain
                                @click="cacheInfo.cacheDuration = 3600"
                              >
                                1小时
                              </el-button>
                            </div>
                          </div>
                          <div class="duration-help">
                            <el-text type="info" size="small">
                              缓存时间建议：数据更新频率高的接口建议设置较短时间（1-5分钟），
                              相对稳定的数据可以设置较长时间（10分钟以上）
                            </el-text>
                          </div>
                        </div>
                      </el-form-item>

                      <!-- 提交按钮 -->
                      <el-form-item>
                        <el-button
                          type="primary"
                          @click="updateCacheSettings"
                          :loading="cacheLoading"
                          size="large"
                        >
                          {{ cacheLoading ? '保存中...' : '保存缓存设置' }}
                        </el-button>
                      </el-form-item>

                      <!-- 缓存说明 -->
                      <div class="cache-explanation">
                        <h4>缓存类型说明：</h4>
                        <div class="explanation-item">
                          <el-icon class="explanation-icon"
                            ><InfoFilled
                          /></el-icon>
                          <div class="explanation-content">
                            <strong>不使用缓存：</strong
                            >适用于数据实时性要求极高的接口，每次请求都会获取最新数据。
                          </div>
                        </div>
                        <div class="explanation-item">
                          <el-icon class="explanation-icon"
                            ><SuccessFilled
                          /></el-icon>
                          <div class="explanation-content">
                            <strong>基于参数缓存：</strong
                            >适用于大多数查询接口，相同参数的请求会返回缓存结果，不同参数会分别缓存。
                          </div>
                        </div>
                        <div class="explanation-item">
                          <el-icon class="explanation-icon"
                            ><WarningFilled
                          /></el-icon>
                          <div class="explanation-content">
                            <strong>忽略参数缓存：</strong
                            >适用于返回固定内容的接口，所有请求都返回相同的缓存结果，性能最佳。
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-form>
                </div>
              </el-tab-pane>

              <!-- 高级设置 -->
              <el-tab-pane label="高级设置" name="Advanced">
                <div class="form">
                  <el-form
                    :model="advancedInfo"
                    label-position="top"
                    label-width="120px"
                  >
                    <!-- 绑定手机号（当前可用） -->
                    <el-form-item label="绑定手机号">
                      <el-select
                        v-model="advancedInfo.phoneBinding"
                        placeholder="请选择是否绑定手机号"
                        style="width: 100%"
                      >
                        <el-option label="是" value="true"></el-option>
                        <el-option label="否" value="false"></el-option>
                      </el-select>
                      <div class="form-help">
                        开启后需要用户绑定手机号才可使用
                      </div>
                    </el-form-item>

                    <el-form-item label="SSE">
                      <el-select
                        v-model="advancedInfo.sse"
                        placeholder="请选择是否启用SSE"
                        style="width: 100%"
                      >
                        <el-option label="是" value="true"></el-option>
                        <el-option label="否" value="false"></el-option>
                      </el-select>
                      <div class="form-help">启用后支持流式传输</div>
                    </el-form-item>

                    <!-- 实名认证（后期更新） -->
                    <el-form-item label="实名认证（暂未实现）">
                      <el-select
                        v-model="advancedInfo.realNameAuth"
                        placeholder="请选择是否启用实名认证"
                        style="width: 100%"
                      >
                        <el-option label="是" value="true"></el-option>
                        <el-option label="否" value="false"></el-option>
                      </el-select>
                      <div class="form-help">该功能暂未实现，保存不生效</div>
                    </el-form-item>

                    <!-- 企业认证（后期更新） -->
                    <el-form-item label="企业认证（暂未实现）">
                      <el-select
                        v-model="advancedInfo.enterpriseAuth"
                        placeholder="请选择是否启用企业认证"
                        style="width: 100%"
                      >
                        <el-option label="是" value="true"></el-option>
                        <el-option label="否" value="false"></el-option>
                      </el-select>
                      <div class="form-help">该功能暂未实现，保存不生效</div>
                    </el-form-item>

                    <!-- VIP认证（后期更新） -->
                    <el-form-item label="VIP认证（暂未实现）">
                      <el-select
                        v-model="advancedInfo.vipAuth"
                        placeholder="请选择是否启用VIP认证"
                        style="width: 100%"
                      >
                        <el-option label="是" value="true"></el-option>
                        <el-option label="否" value="false"></el-option>
                      </el-select>
                      <div class="form-help">该功能暂未实现，保存不生效</div>
                    </el-form-item>

                    <!-- 2FA二次验证（后期更新） -->
                    <el-form-item label="2FA二次验证（暂未实现）">
                      <el-select
                        v-model="advancedInfo.twoFactorAuth"
                        placeholder="请选择是否启用二次验证"
                        style="width: 100%"
                      >
                        <el-option label="是" value="true"></el-option>
                        <el-option label="否" value="false"></el-option>
                      </el-select>
                      <div class="form-help">该功能暂未实现，保存不生效</div>
                    </el-form-item>

                    <!-- HTTP/PHP-FPM 头信息配置（当前可用） -->
                    <el-form-item label="HTTP/PHP-FPM Header">
                      <el-input
                        v-model="advancedInfo.headers"
                        type="textarea"
                        :rows="4"
                        placeholder="示例：Authorization=Bearer sk-token&a=1&b=2"
                        style="width: 100%"
                      />
                      <div class="form-help">
                        保存后用于请求头注入，使用&隔开
                      </div>
                    </el-form-item>

                    <el-form-item>
                      <el-button type="primary" @click="updateAdvancedSettings"
                        >保存设置</el-button
                      >
                    </el-form-item>
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
                                  <el-option label="直接扣费" :value="4" />
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
              <div class="footer-content">
                <div class="left-info">
                  <el-icon>
                    <InfoFilled />
                  </el-icon>
                  <span>请仔细检查信息后再提交</span>
                </div>
                <div class="right-buttons">
                  <el-button
                    size="large"
                    type="primary"
                    :loading="buttonStatus"
                    @click="updateApiInfo"
                    >提交</el-button
                  >

                  <el-button
                    size="large"
                    @click="
                      navigateTo({
                        path: '/admin/apilist',
                        query: {
                          page: Array.isArray(route.query.page)
                            ? route.query.page[0]
                            : route.query.page,
                          limit: Array.isArray(route.query.limit)
                            ? route.query.limit[0]
                            : route.query.limit,
                        },
                      })
                    "
                    >返回</el-button
                  >
                </div>
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

        // 与 webset.vue 保持一致的表单样式
        .form {
          width: 60%;

          :deep(.el-form-item__label) {
            font-weight: 500;
            padding-bottom: 8px;
          }

          :deep(.el-input__wrapper) {
            box-shadow: 0 0 0 1px #dcdfe6 inset;

            &:hover {
              box-shadow: 0 0 0 1px #c0c4cc inset;
            }

            &.is-focus {
              box-shadow: 0 0 0 1px #409eff inset;
            }
          }

          .el-button {
            padding: 12px 24px;
            font-weight: 500;
          }

          :deep(.el-date-editor) {
            width: 100%;

            .el-input__wrapper {
              padding: 0 12px;
            }
          }

          // 表单帮助文本样式
          .form-help {
            margin-top: 8px;
            font-size: 13px;
            color: #6b7280;
            line-height: 1.5;
          }
        }
      }

      .apiset-footer {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: calc(100% - 240px);
        background: #fff;
        border: 1px solid #eaecf0;
        border-radius: 8px;
        padding: 16px 32px;
        z-index: 10;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .left-info {
            display: flex;
            align-items: center;
            color: #606266;
            font-size: 14px;

            :deep(.el-icon) {
              margin-right: 8px;
            }
          }

          .right-buttons {
            display: flex;
            gap: 12px;

            :deep(.el-button) {
              min-width: 100px;
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container {
    .right {
      .apiset-container {
        .apiset-cont {
          .form {
            width: 100%;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .container {
    .right {
      .apiset-container {
        .apiset-footer {
          bottom: 10px;
          right: 10px;
          left: 10px;
          width: auto;
          padding: 12px 16px;

          .footer-content {
            flex-direction: column;
            gap: 12px;

            .right-buttons {
              width: 100%;
              display: flex;
              gap: 10px;

              :deep(.el-button) {
                flex: 1;
              }
            }
          }
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

// 缓存设置样式
.cache-container {
  padding: 0;
  background: transparent;

  .cache-section {
    background: #fff;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e8eaed;

    .section-title {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 700;
      color: #1a202c;
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: '';
        font-size: 22px;
      }
    }

    .section-description {
      margin: 0 0 36px 0;
      font-size: 15px;
      color: #718096;
      line-height: 1.6;
      background: #f7fafc;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #4299e1;
    }

    .cache-radio-group {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;

      .cache-option {
        position: relative;
        padding: 24px;
        border: 2px solid #e2e8f0;
        border-radius: 16px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);

        &:hover {
          border-color: #cbd5e0;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .cache-radio {
          width: 100%;
          height: auto;

          :deep(.el-radio__input) {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 2;

            .el-radio__inner {
              width: 20px;
              height: 20px;
              border-width: 2px;
            }
          }

          :deep(.el-radio__label) {
            color: inherit;
            font-weight: inherit;
            padding-left: 0;
            width: 100%;
          }

          .option-content {
            width: 100%;
            padding-right: 40px;

            .option-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 12px;

              .option-label {
                font-size: 18px;
                font-weight: 700;
                color: #2d3748;
              }

              .el-tag {
                font-size: 12px;
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 6px;
              }
            }

            .option-description {
              font-size: 14px;
              color: #718096;
              line-height: 1.6;
              margin: 0;
            }
          }
        }

        // 选中状态的样式
        &:has(.el-radio.is-checked) {
          border-color: #4299e1;
          background: linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%);
          box-shadow: 0 8px 30px rgba(66, 153, 225, 0.15);
          transform: translateY(-2px);

          .option-label {
            color: #2b6cb0 !important;
          }

          .option-description {
            color: #4a5568 !important;
          }

          &::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #4299e1, #38b2ac);
            border-radius: 18px;
            z-index: -1;
            opacity: 0.1;
          }
        }
      }
    }

    .cache-explanation {
      margin-top: 32px;
      padding: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;

      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }

      .explanation-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .explanation-icon {
          font-size: 18px;
          margin-top: 2px;
          color: #6b7280;
        }

        .explanation-content {
          flex: 1;
          font-size: 14px;
          color: #4b5563;
          line-height: 1.5;

          strong {
            color: #1f2937;
            font-weight: 600;
          }
        }
      }
    }
  }

  // 缓存时间设置样式
  .cache-duration-container {
    width: 100%;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    margin-top: 8px;

    .cache-duration-input {
      max-width: 240px;
      margin-bottom: 20px;

      :deep(.el-input__wrapper) {
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;

        &:hover {
          border-color: #4299e1;
        }

        &.is-focus {
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }
      }
    }

    .duration-presets {
      margin-bottom: 16px;

      .preset-label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #4a5568;
        margin-bottom: 12px;
      }

      .preset-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 8px;

        .el-button {
          font-size: 12px;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #e2e8f0;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
            border-color: #4299e1;
          }

          &:active {
            transform: translateY(0);
          }
        }
      }
    }

    .duration-help {
      padding: 16px;
      background: linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%);
      border: 1px solid #bee3f8;
      border-radius: 8px;
      border-left: 4px solid #4299e1;

      .el-text {
        color: #2c5282;
        line-height: 1.6;
        font-size: 13px;
      }
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 32px;

    .el-form-item__label {
      color: #2d3748;
      font-weight: 600;
      font-size: 15px;
    }

    &:last-child {
      margin-bottom: 0;
      margin-top: 40px;
      text-align: center;

      .el-button {
        padding: 16px 32px;
        font-weight: 600;
        font-size: 16px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(66, 153, 225, 0.4);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}
</style>
