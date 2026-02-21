<script setup>
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { watch } from 'vue'

definePageMeta({
  layout: 'admin',
})

const { $msg, $myFetch } = useNuxtApp()
const activeTab = ref('basic')
const activeSubTab = ref('website')

// 数据加载状态追踪
const loadedData = ref({
  website: false,
  mail: false,
  topApi: false,
  partners: false,
  alipay: false,
  wechatpay: false,
  mpay: false,
  hupi: false,
  ai: false,
  about: false,
  advanced: false,
  login: false,
  captcha: false,
  responseParams: false,
})

// 网站设置相关
const websetInfo = ref({
  title: '',
  subheading: '',
  keywords: '',
  description: '',
  create_time: '',
  icp: '',
  gongan: '',
  website_name: '',
  recommend: 'true',
  notice: '',
  feedback: '',
  css: '',
  js: '',
  valueAddedTelecomLicense: '',
  company_name: '',
  slogan: '',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  working_hours: '',
  ico: '',
  logo: '',
})

// 邮件设置相关
const mailInfo = ref({
  smtp: '',
  user: '',
  password: '',
  setfrom: '',
  port: '',
  name: '',
  template: '',
})

// 支付宝配置相关
const alipayInfo = ref({
  Appid: '',
  PrivateKey: '',
  PublicKey: '',
})

// 新增：微信支付配置相关
const wechatPayInfo = ref({
  apiV3Key: '',
  appid: '',
  mchid: '',
  privateKey: '',
  serialNo: '',
  wxPublicKeyContent: '',
  wxPublicKeyID: '',
})

// 新增：易支付配置相关
const mpayInfo = ref({
  key: '',
  pid: '',
  type: '',
  url: '',
})

// 新增：虎皮椒支付配置相关
const hupiInfo = ref({
  app_id: '',
  app_secret: '',
  host: '',
  method: '',
})

// AI配置相关
const aiInfo = ref({
  key: '',
  model: '',
  system_message: '',
  url: '',
})

// 高级设置相关
const advancedInfo = ref({
  request_id: 'true',
  clickhouse: 'true',
  server_ip: '',
  clickhouse_retention_days: '',
  api_logs_map_virtual: 'false',
  cdn_header: '',
  wechat_webhook_url: '',
  force_bind_phone: 'false',
})

const refreshKeysLoading = ref(false)

// 登录设置相关
const loginInfo = ref({
  method: ['email'], // 支持多选：email 和/或 sms
  provider: '', // aliyun 或 tencent
  sdkAppId: '',
  secretId: '',
  secretKey: '',
  signName: '',
  templateCode: '',
})

// 验证码配置相关
const captchaInfo = ref({
  difficulty: 'medium',
  expire_time: 60,
  length: 4,
  type: 'math',
})

// 新增：关于我们页面信息相关
const aboutInfo = ref({
  companyInfo: {
    name: '',
    slogan: '',
    description: '',
    contact: '',
  },
  features: [
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
  ],
  serviceTerms: {
    serviceDescription: {
      title: '',
      content: '',
    },
    apiAgreement: {
      title: '',
      content: '',
    },
    privacyPolicy: {
      title: '',
      content: '',
    },
  },
  timeline: [{ year: '', events: [''] }],
  techStack: [
    { title: '', items: [''] },
    { title: '', items: [''] },
    { title: '', items: [''] },
    { title: '', items: [''] },
  ],
  apiTypes: [
    { title: '', description: '', features: '' },
    { title: '', description: '', features: '' },
    { title: '', description: '', features: '' },
  ],
  devSupport: [
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
  ],
  statistics: [
    { number: '', label: '' },
    { number: '', label: '' },
    { number: '', label: '' },
  ],
  testimonials: [
    { quote: '', author: { name: '', company: '' }, rating: '', date: '' },
    { quote: '', author: { name: '', company: '' }, rating: '', date: '' },
    { quote: '', author: { name: '', company: '' }, rating: '', date: '' },
    { quote: '', author: { name: '', company: '' }, rating: '', date: '' },
    { quote: '', author: { name: '', company: '' }, rating: '', date: '' },
    { quote: '', author: { name: '', company: '' }, rating: '', date: '' },
  ],
})

const testMail = ref('')

// 接口置顶相关
const searchApiKeyword = ref('')
const topApiList = ref([])
const topApiLoading = ref(false)
const searchLoading = ref(false)
const searchData = ref([])
const searchOldValue = ref('')
const selectedApi = ref(null)
const addLoading = ref(false)

// 合作伙伴相关
const partnerForm = ref({
  name: '',
  logo: '',
  description: '',
  website: '',
  category: '',
})
const partnerList = ref([])
const partnerLoading = ref(false)
const partnerDialogVisible = ref(false)
const partnerEditMode = ref(false)
const partnerCurrentId = ref(null)

// 获取网站设置
const getWebsetInfo = async () => {
  const res = await $myFetch('Options')
  websetInfo.value = res.data
}

// 获取邮件设置
const getMailInfo = async () => {
  const res = await $myFetch('MailInfo')
  mailInfo.value = res.data
  // 解码base64模板（支持中文）
  if (mailInfo.value.template) {
    try {
      mailInfo.value.template = decodeURIComponent(
        escape(atob(mailInfo.value.template)),
      )
    } catch (e) {
      console.error('模板解码失败:', e)
      mailInfo.value.template = ''
    }
  }
}

// 获取支付宝配置
const getAlipayInfo = async () => {
  const res = await $myFetch('AlipayInfo')
  if (res.code === 200) {
    alipayInfo.value = res.data
  }
}

// 新增：获取微信支付配置
const getWechatPayInfo = async () => {
  const res = await $myFetch('WechatPayInfo')
  if (res.code === 200) {
    wechatPayInfo.value.apiV3Key = res.data.api_v_3_key
    wechatPayInfo.value.appid = res.data.appid
    wechatPayInfo.value.mchid = res.data.mchid
    wechatPayInfo.value.privateKey = res.data.private_key
    wechatPayInfo.value.serialNo = res.data.serial_no
    wechatPayInfo.value.wxPublicKeyContent = res.data.wx_public_key_content
    wechatPayInfo.value.wxPublicKeyID = res.data.wx_public_key_id
  }
}

// 新增：获取易支付配置
const getMPayInfo = async () => {
  const res = await $myFetch('MPayInfo')
  if (res.code === 200) {
    mpayInfo.value = res.data
  }
}

// 新增：获取虎皮椒支付配置
const getHupiInfo = async () => {
  const res = await $myFetch('HuPiInfo')
  if (res.code === 200) {
    hupiInfo.value = res.data
  }
}

// 获取AI配置
const getAIInfo = async () => {
  const res = await $myFetch('AIInfo')
  if (res.code === 200) {
    aiInfo.value = res.data
  }
}

// 获取高级设置
const getAdvancedInfo = async () => {
  const res = await $myFetch('AdvancedSetting')
  if (res.code === 200) {
    advancedInfo.value = res.data
  }
}

// 获取登录设置
const getLoginInfo = async () => {
  const res = await $myFetch('LoginMethodInfo')
  if (res.code === 200 && res.data) {
    loginInfo.value = res.data
    // 将method字符串转换为数组
    if (typeof loginInfo.value.method === 'string') {
      loginInfo.value.method = loginInfo.value.method
        ? loginInfo.value.method.split('|')
        : []
    } else if (!loginInfo.value.method) {
      // 如果method字段不存在，设置为空数组
      loginInfo.value.method = []
    }
  } else {
    // 如果接口返回失败或数据为空，重置为初始状态
    loginInfo.value.method = []
  }
}

// 获取验证码配置
const getCaptchaInfo = async () => {
  const res = await $myFetch('GetCaptchaConfig')
  if (res.code === 200 && res.data) {
    captchaInfo.value = res.data
  }
}

// 新增：获取关于我们页面信息
const getAboutInfo = async () => {
  const res = await $myFetch('AboutInfo')
  if (res.code === 200) {
    aboutInfo.value = res.data

    // 确保功能特色固定为4个
    if (aboutInfo.value.features) {
      // 如果不足4个，补齐空项
      while (aboutInfo.value.features.length < 4) {
        aboutInfo.value.features.push({ title: '', description: '' })
      }
      // 如果超过4个，截取前4个
      if (aboutInfo.value.features.length > 4) {
        aboutInfo.value.features = aboutInfo.value.features.slice(0, 4)
      }
    }

    // 确保技术栈固定为4个类别
    if (aboutInfo.value.techStack) {
      // 如果不足4个，补齐空项
      while (aboutInfo.value.techStack.length < 4) {
        aboutInfo.value.techStack.push({ title: '', items: [''] })
      }
      // 如果超过4个，截取前4个
      if (aboutInfo.value.techStack.length > 4) {
        aboutInfo.value.techStack = aboutInfo.value.techStack.slice(0, 4)
      }
    }

    // 确保API类型固定为3个
    if (aboutInfo.value.apiTypes) {
      // 如果不足3个，补齐空项
      while (aboutInfo.value.apiTypes.length < 3) {
        aboutInfo.value.apiTypes.push({
          title: '',
          description: '',
          features: '',
        })
      }
      // 如果超过3个，截取前3个
      if (aboutInfo.value.apiTypes.length > 3) {
        aboutInfo.value.apiTypes = aboutInfo.value.apiTypes.slice(0, 3)
      }
    }

    // 确保开发者支持固定为4个
    if (aboutInfo.value.devSupport) {
      // 如果不足4个，补齐空项
      while (aboutInfo.value.devSupport.length < 4) {
        aboutInfo.value.devSupport.push({ title: '', description: '' })
      }
      // 如果超过4个，截取前4个
      if (aboutInfo.value.devSupport.length > 4) {
        aboutInfo.value.devSupport = aboutInfo.value.devSupport.slice(0, 4)
      }
    }

    // 确保统计数据固定为3个
    if (aboutInfo.value.statistics) {
      // 如果不足3个，补齐空项
      while (aboutInfo.value.statistics.length < 3) {
        aboutInfo.value.statistics.push({ number: '', label: '' })
      }
      // 如果超过3个，截取前3个
      if (aboutInfo.value.statistics.length > 3) {
        aboutInfo.value.statistics = aboutInfo.value.statistics.slice(0, 3)
      }
    }

    // 确保用户评价固定为6个
    if (aboutInfo.value.testimonials) {
      // 如果不足6个，补齐空项
      while (aboutInfo.value.testimonials.length < 6) {
        aboutInfo.value.testimonials.push({
          quote: '',
          author: { name: '', company: '' },
          rating: '',
          date: '',
        })
      }
      // 如果超过6个，截取前6个
      if (aboutInfo.value.testimonials.length > 6) {
        aboutInfo.value.testimonials = aboutInfo.value.testimonials.slice(0, 6)
      }
    }
  }
}

// 接口搜索
const querySearchAsync = async (queryString, cb) => {
  if (queryString === '') {
    searchApiKeyword.value = ''
    selectedApi.value = null
    cb([])
    return false
  }

  if (queryString === searchOldValue.value) {
    cb(searchData.value)
    return false
  }

  searchLoading.value = true
  try {
    const res = await $myFetch('ApiSearch', {
      params: {
        keyword: queryString,
      },
    })

    if (res.code !== 200) {
      $msg(res.msg, 'error')
      cb([])
      return false
    }

    // 遍历数据，将 name 改为 value
    res.data = res.data.map((item) => {
      item.value = item.name
      return item
    })

    searchOldValue.value = queryString
    searchData.value = res.data
    cb(searchData.value)
  } catch (error) {
    cb([])
  } finally {
    searchLoading.value = false
  }
}

// 选择接口
const handleApiSelect = (item) => {
  selectedApi.value = item
}

// 获取置顶列表
const getTopApiList = async () => {
  topApiLoading.value = true
  try {
    const res = await $myFetch('ApiTopList')
    if (res.code === 200) {
      topApiList.value = res.data || []
    }
  } catch (error) {
    $msg('获取置顶列表失败', 'error')
  }
  topApiLoading.value = false
}

// 取消置顶
const removeTopApi = async (index, row) => {
  topApiLoading.value = true
  try {
    const res = await $myFetch('RemoveTopApi', {
      method: 'GET',
      params: {
        id: row.id,
      },
    })

    if (res.code === 200) {
      $msg('取消置顶成功', 'success')
      await getTopApiList()
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('操作失败，请重试', 'error')
  }
  topApiLoading.value = false
}

// 添加置顶接口
const handleAddTopApi = async () => {
  if (!selectedApi.value) {
    $msg('请先选择接口', 'warning')
    return
  }

  // 检查是否已经在置顶列表中
  const exists = topApiList.value.some((api) => api.id === selectedApi.value.id)
  if (exists) {
    $msg('该接口已在置顶列表中', 'warning')
    searchApiKeyword.value = ''
    selectedApi.value = null
    return
  }

  addLoading.value = true
  try {
    const res = await $myFetch('ApiTopAdd', {
      method: 'GET',
      params: {
        id: selectedApi.value.id,
      },
    })

    if (res.code === 200) {
      $msg('添加置顶成功', 'success')
      await getTopApiList()
      searchApiKeyword.value = ''
      selectedApi.value = null
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('添加失败，请重试', 'error')
  } finally {
    addLoading.value = false
  }
}

// 提交网站设置
const websetInfoSubmit = async () => {
  if (
    !websetInfo.value.title ||
    !websetInfo.value.subheading ||
    !websetInfo.value.keywords ||
    !websetInfo.value.description ||
    !websetInfo.value.create_time
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('title', websetInfo.value.title)
  bodyValue.append('subheading', websetInfo.value.subheading)
  bodyValue.append('keywords', websetInfo.value.keywords)
  bodyValue.append('description', websetInfo.value.description)
  bodyValue.append('createTime', websetInfo.value.create_time)
  bodyValue.append('icp', websetInfo.value.icp)
  bodyValue.append('gongan', websetInfo.value.gongan)
  bodyValue.append('websiteName', websetInfo.value.website_name)
  bodyValue.append('recommend', websetInfo.value.recommend)
  bodyValue.append('notice', websetInfo.value.notice)
  bodyValue.append('feedback', websetInfo.value.feedback)
  bodyValue.append('css', websetInfo.value.css)
  bodyValue.append('js', websetInfo.value.js)
  bodyValue.append('companyName', websetInfo.value.company_name)
  bodyValue.append('slogan', websetInfo.value.slogan)
  bodyValue.append('contactEmail', websetInfo.value.contact_email)
  bodyValue.append('contactPhone', websetInfo.value.contact_phone)
  bodyValue.append('contactAddress', websetInfo.value.contact_address)
  bodyValue.append('workingHours', websetInfo.value.working_hours)
  bodyValue.append('ico', websetInfo.value.ico)
  bodyValue.append('logo', websetInfo.value.logo)
  bodyValue.append(
    'valueAddedTelecomLicense',
    websetInfo.value.valueAddedTelecomLicense,
  )

  const res = await $myFetch('OptionsUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getWebsetInfo()
    return
  }

  $msg(res.msg, 'error')
}

// 提交邮件设置
const mailInfoSubmit = async () => {
  if (
    !mailInfo.value.smtp ||
    !mailInfo.value.user ||
    !mailInfo.value.password ||
    !mailInfo.value.setfrom ||
    !mailInfo.value.port ||
    !mailInfo.value.name
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  // 验证模板必须包含占位符
  if (mailInfo.value.template) {
    if (
      !mailInfo.value.template.includes('{{title}}') ||
      !mailInfo.value.template.includes('{{content}}')
    ) {
      $msg('邮件模板必须包含 {{title}} 和 {{content}} 占位符', 'error')
      return false
    }
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('smtp', mailInfo.value.smtp)
  bodyValue.append('user', mailInfo.value.user)
  bodyValue.append('password', mailInfo.value.password)
  bodyValue.append('setfrom', mailInfo.value.setfrom)
  bodyValue.append('port', mailInfo.value.port)
  bodyValue.append('name', mailInfo.value.name)
  // 编码模板为base64（支持中文）
  if (mailInfo.value.template) {
    bodyValue.append(
      'template',
      btoa(unescape(encodeURIComponent(mailInfo.value.template))),
    )
  } else {
    bodyValue.append('template', '')
  }

  const res = await $myFetch('MailInfoUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getMailInfo()
  }
}

// 提交支付宝配置
const alipayInfoSubmit = async () => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('appid', alipayInfo.value.Appid || '')
  bodyValue.append('privateKey', alipayInfo.value.PrivateKey || '')
  bodyValue.append('publicKey', alipayInfo.value.PublicKey || '')

  const res = await $myFetch('AlipayOptionUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getAlipayInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

// 新增：提交微信支付配置
const wechatPayInfoSubmit = async () => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('apiV3Key', wechatPayInfo.value.apiV3Key || '')
  bodyValue.append('appid', wechatPayInfo.value.appid || '')
  bodyValue.append('mchid', wechatPayInfo.value.mchid || '')
  bodyValue.append('privateKey', wechatPayInfo.value.privateKey || '')
  bodyValue.append('serialNo', wechatPayInfo.value.serialNo || '')
  bodyValue.append(
    'wxPublicKeyContent',
    wechatPayInfo.value.wxPublicKeyContent || '',
  )
  bodyValue.append('wxPublicKeyID', wechatPayInfo.value.wxPublicKeyID || '')

  const res = await $myFetch('WechatPayOptionUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getWechatPayInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

// 新增：提交易支付配置
const mpayInfoSubmit = async () => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('key', mpayInfo.value.key || '')
  bodyValue.append('pid', mpayInfo.value.pid || '')
  bodyValue.append('type', mpayInfo.value.type || '')
  bodyValue.append('url', mpayInfo.value.url || '')

  const res = await $myFetch('MPayOptionUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getMPayInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

// 新增：提交虎皮椒支付配置
const hupiInfoSubmit = async () => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('appId', hupiInfo.value.app_id || '')
  bodyValue.append('appSecret', hupiInfo.value.app_secret || '')
  bodyValue.append('host', hupiInfo.value.host || '')
  bodyValue.append('method', hupiInfo.value.method || '')

  const res = await $myFetch('HuPiOptionUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getHupiInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

// 提交AI配置
const aiInfoSubmit = async () => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('key', aiInfo.value.key || '')
  bodyValue.append('model', aiInfo.value.model || '')
  bodyValue.append('systemMessage', aiInfo.value.system_message || '')
  bodyValue.append('url', aiInfo.value.url || '')

  const res = await $myFetch('AIOptionUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getAIInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

const aboutInfoSubmit = async () => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('data', JSON.stringify(aboutInfo.value))

  const res = await $myFetch('AboutInfoUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getAboutInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

// 提交高级设置
const advancedInfoSubmit = async () => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('requestId', advancedInfo.value.request_id)
  bodyValue.append('clickhouse', advancedInfo.value.clickhouse)
  bodyValue.append('serverIp', advancedInfo.value.server_ip || '')
  bodyValue.append(
    'clickhouseRetentionDays',
    advancedInfo.value.clickhouse_retention_days || '',
  )
  bodyValue.append(
    'apiLogsMapVirtual',
    advancedInfo.value.api_logs_map_virtual || 'false',
  )
  bodyValue.append('cdnHeader', advancedInfo.value.cdn_header || '')
  bodyValue.append(
    'wechatWebhookUrl',
    advancedInfo.value.wechat_webhook_url || '',
  )
  bodyValue.append(
    'forceBindPhone',
    advancedInfo.value.force_bind_phone || 'false',
  )

  const res = await $myFetch('UpdateAdvancedSetting', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getAdvancedInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

// 刷新加密密钥
const refreshEncryptionKeys = async () => {
  try {
    await ElMessageBox.confirm(
      '<p>刷新密钥后，<strong>旧的密钥将立即失效</strong>。</p><p>这可能会导致正在进行的加密通信中断，或依赖旧密钥的客户端无法连接。</p><p style="color: #f56c6c; margin-top: 10px;">请确认是否继续执行此操作？</p>',
      '危险操作确认',
      {
        confirmButtonText: '确定刷新',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        confirmButtonClass: 'el-button--danger',
      },
    )

    refreshKeysLoading.value = true
    const res = await $myFetch('RefreshEncryptionKeys', {
      method: 'POST',
    })

    if (res.code === 200) {
      $msg('密钥刷新成功', 'success')
    } else {
      $msg(res.msg || '密钥刷新失败', 'error')
    }
  } catch (error) {
    if (error !== 'cancel') {
      $msg('操作失败，请重试', 'error')
    }
  } finally {
    refreshKeysLoading.value = false
  }
}

// 提交登录设置
const loginInfoSubmit = async () => {
  const bodyValue = new URLSearchParams()
  // 将method数组用|分隔转换为字符串
  bodyValue.append('method', loginInfo.value.method.join('|'))
  bodyValue.append('provider', loginInfo.value.provider || '')
  bodyValue.append('sdkAppId', loginInfo.value.sdkAppId || '')
  bodyValue.append('secretId', loginInfo.value.secretId || '')
  bodyValue.append('secretKey', loginInfo.value.secretKey || '')
  bodyValue.append('signName', loginInfo.value.signName || '')
  bodyValue.append('templateCode', loginInfo.value.templateCode || '')

  const res = await $myFetch('UpdateLoginMethodInfo', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getLoginInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

// 提交验证码配置
const captchaInfoSubmit = async () => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('difficulty', captchaInfo.value.difficulty || 'medium')
  bodyValue.append('expireTime', captchaInfo.value.expire_time || 60)
  bodyValue.append('length', captchaInfo.value.length || 4)
  bodyValue.append('type', captchaInfo.value.type || 'math')

  const res = await $myFetch('UpdateCaptchaConfig', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getCaptchaInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

// 合作伙伴相关API函数

// 获取合作伙伴列表
const getPartners = async () => {
  partnerLoading.value = true
  try {
    const res = await $myFetch('GetPartnersInfo')

    if (res.code === 200) {
      partnerList.value = res.data || []
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('获取合作伙伴列表失败', 'error')
  } finally {
    partnerLoading.value = false
  }
}

// 创建合作伙伴
const createPartner = async () => {
  if (
    !partnerForm.value.name ||
    !partnerForm.value.logo ||
    !partnerForm.value.description ||
    !partnerForm.value.website ||
    !partnerForm.value.category
  ) {
    $msg('请填写所有必填字段', 'error')
    return false
  }

  partnerLoading.value = true
  try {
    const bodyValue = new URLSearchParams()
    bodyValue.append('name', partnerForm.value.name)
    bodyValue.append('logo', partnerForm.value.logo)
    bodyValue.append('description', partnerForm.value.description)
    bodyValue.append('website', partnerForm.value.website)
    bodyValue.append('category', partnerForm.value.category)

    const res = await $myFetch('CreatePartner', {
      method: 'POST',
      body: bodyValue,
    })

    if (res.code === 200) {
      $msg('创建合作伙伴成功', 'success')
      partnerDialogVisible.value = false
      resetPartnerForm()
      await getPartners()
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('创建合作伙伴失败', 'error')
  } finally {
    partnerLoading.value = false
  }
}

// 更新合作伙伴
const updatePartner = async () => {
  if (
    !partnerForm.value.name ||
    !partnerForm.value.logo ||
    !partnerForm.value.description ||
    !partnerForm.value.website ||
    !partnerForm.value.category
  ) {
    $msg('请填写所有必填字段', 'error')
    return false
  }

  partnerLoading.value = true
  try {
    const bodyValue = new URLSearchParams()
    bodyValue.append('id', partnerCurrentId.value)
    bodyValue.append('name', partnerForm.value.name)
    bodyValue.append('logo', partnerForm.value.logo)
    bodyValue.append('description', partnerForm.value.description)
    bodyValue.append('website', partnerForm.value.website)
    bodyValue.append('category', partnerForm.value.category)

    const res = await $myFetch('UpdatePartner', {
      method: 'POST',
      body: bodyValue,
    })

    if (res.code === 200) {
      $msg('更新合作伙伴成功', 'success')
      partnerDialogVisible.value = false
      resetPartnerForm()
      await getPartners()
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('更新合作伙伴失败', 'error')
  } finally {
    partnerLoading.value = false
  }
}

// 删除合作伙伴
const deletePartner = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个合作伙伴吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    partnerLoading.value = true
    const res = await $myFetch('DeletePartner', {
      params: {
        id: id,
      },
    })

    if (res.code === 200) {
      $msg('删除合作伙伴成功', 'success')
      await getPartners()
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    if (error !== 'cancel') {
      $msg('删除合作伙伴失败', 'error')
    }
  } finally {
    partnerLoading.value = false
  }
}

// 重置合作伙伴表单
const resetPartnerForm = () => {
  partnerForm.value = {
    name: '',
    logo: '',
    description: '',
    website: '',
    category: '',
  }
  partnerEditMode.value = false
  partnerCurrentId.value = null
}

// 打开新增合作伙伴对话框
const openAddPartnerDialog = () => {
  resetPartnerForm()
  partnerDialogVisible.value = true
}

// 打开编辑合作伙伴对话框
const openEditPartnerDialog = (partner) => {
  partnerForm.value = { ...partner }
  partnerEditMode.value = true
  partnerCurrentId.value = partner.id
  partnerDialogVisible.value = true
}

// 提交合作伙伴表单
const submitPartnerForm = async () => {
  if (partnerEditMode.value) {
    await updatePartner()
  } else {
    await createPartner()
  }
}

// 数组操作辅助函数

const addTimelineYear = () => {
  aboutInfo.value.timeline.push({ year: '', events: [''] })
}

const removeTimelineYear = (index) => {
  aboutInfo.value.timeline.splice(index, 1)
}

const addTimelineEvent = (yearIndex) => {
  aboutInfo.value.timeline[yearIndex].events.push('')
}

const removeTimelineEvent = (yearIndex, eventIndex) => {
  aboutInfo.value.timeline[yearIndex].events.splice(eventIndex, 1)
}

const addTechStackItem = (stackIndex) => {
  aboutInfo.value.techStack[stackIndex].items.push('')
}

const removeTechStackItem = (stackIndex, itemIndex) => {
  aboutInfo.value.techStack[stackIndex].items.splice(itemIndex, 1)
}

// 发送测试邮件
const sendTestMail = async () => {
  if (!testMail.value) {
    $msg('请输入测试邮箱', 'error')
    return false
  }

  const res = await $myFetch('SendTestMail', {
    params: {
      mail: testMail.value,
    },
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    testMail.value = ''
  } else {
    $msg(res.msg, 'error')
  }
}

// IPv4格式验证函数
const validateIPv4 = (rule, value, callback) => {
  if (!value) {
    callback() // 允许为空
    return
  }

  const ipv4Regex =
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

  if (!ipv4Regex.test(value)) {
    callback(new Error('请输入有效的IPv4地址格式（如：192.168.1.1）'))
  } else {
    callback()
  }
}

// 禁用未来日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

// 全局返回参数（aid=0）
const GLOBAL_RESPONSE_AID = 0
const globalResponseParamsArr = ref([])
const mapResponseParamNode = (node) => {
  const row = {
    id: node.id,
    aid: node.aid,
    parentId: node.parent_id ?? node.parentId ?? 0,
    name: node.name,
    param: node.param,
    docs: node.docs,
    example: node.example ?? '',
    create_time: node.create_time
      ? new Date(Number(node.create_time)).toLocaleString()
      : '',
  }
  if (node.children && node.children.length > 0) {
    row.children = node.children.map(mapResponseParamNode)
  }
  return row
}
const getGlobalResponseParams = async () => {
  try {
    const res = await $myFetch('ResponseParamList', {
      params: { aid: GLOBAL_RESPONSE_AID },
    })
    const rawList = res?.data?.response_params ?? res?.data
    if (Array.isArray(rawList)) {
      globalResponseParamsArr.value = rawList.map(mapResponseParamNode)
    } else {
      globalResponseParamsArr.value = []
    }
  } catch (e) {
    globalResponseParamsArr.value = []
  }
}

const globalAddResponseParamDialogStatus = ref(false)
const globalAddResponseParamInfo = ref({
  name: '',
  param: 'string',
  docs: '',
  example: '',
  parentId: 0,
})
const globalResponseParamTypeOptions = [
  { value: 'string', label: 'string' },
  { value: 'int', label: 'int' },
  { value: 'object', label: 'object' },
  { value: 'array', label: 'array' },
]
const globalResponseParamParentOptions = computed(() => {
  const list = [{ value: 0, label: '顶级参数' }]
  const flatten = (nodes, depth = 0) => {
    if (!nodes || !nodes.length) return
    nodes.forEach((n) => {
      list.push({
        value: n.id,
        label:
          (depth ? '　'.repeat(depth) + '└ ' : '') + `${n.name} (ID: ${n.id})`,
      })
      if (n.children?.length) flatten(n.children, depth + 1)
    })
  }
  flatten(globalResponseParamsArr.value)
  return list
})
const handleGlobalAddResponseParam = (row = null) => {
  globalAddResponseParamDialogStatus.value = true
  globalAddResponseParamInfo.value = {
    name: '',
    param: 'string',
    docs: '',
    example: '',
    parentId: row ? row.id : 0,
  }
}
const globalAddResponseParam = async () => {
  if (
    !globalAddResponseParamInfo.value.name ||
    !globalAddResponseParamInfo.value.param ||
    !globalAddResponseParamInfo.value.docs
  ) {
    $msg('请填写参数名称、类型和说明', 'error')
    return
  }
  const bodyValue = new URLSearchParams()
  bodyValue.append('aid', String(GLOBAL_RESPONSE_AID))
  bodyValue.append(
    'parentId',
    String(globalAddResponseParamInfo.value.parentId ?? 0),
  )
  bodyValue.append('name', globalAddResponseParamInfo.value.name)
  bodyValue.append('param', globalAddResponseParamInfo.value.param)
  bodyValue.append('docs', globalAddResponseParamInfo.value.docs)
  if (globalAddResponseParamInfo.value.example) {
    bodyValue.append('example', globalAddResponseParamInfo.value.example)
  }
  const res = await $myFetch('ResponseParamCreate', {
    method: 'POST',
    body: bodyValue,
  })
  if (res.code === 200) {
    $msg(res.msg, 'success')
    globalAddResponseParamDialogStatus.value = false
    await getGlobalResponseParams()
  } else {
    $msg(res.msg, 'error')
  }
}
watch(globalAddResponseParamDialogStatus, (newVal) => {
  if (!newVal) {
    globalAddResponseParamInfo.value = {
      name: '',
      param: 'string',
      docs: '',
      example: '',
      parentId: 0,
    }
  }
})

const globalEditResponseParamDialogStatus = ref(false)
const globalEditResponseParamInfo = ref({
  id: '',
  aid: '',
  parentId: 0,
  name: '',
  param: 'string',
  docs: '',
  example: '',
})
const globalEditResponseParamParentOptions = computed(() => {
  const id = globalEditResponseParamInfo.value.id
  if (!id) return globalResponseParamParentOptions.value
  return globalResponseParamParentOptions.value.filter(
    (opt) => opt.value !== id,
  )
})
const handleGlobalEditResponseParam = (row) => {
  globalEditResponseParamDialogStatus.value = true
  globalEditResponseParamInfo.value = {
    id: row.id,
    aid: row.aid,
    parentId: row.parentId ?? 0,
    name: row.name,
    param: row.param,
    docs: row.docs,
    example: row.example ?? '',
  }
}
const globalUpdateResponseParam = async () => {
  if (
    !globalEditResponseParamInfo.value.name ||
    !globalEditResponseParamInfo.value.param ||
    !globalEditResponseParamInfo.value.docs
  ) {
    $msg('请填写参数名称、类型和说明', 'error')
    return
  }
  const bodyValue = new URLSearchParams()
  bodyValue.append('id', globalEditResponseParamInfo.value.id)
  bodyValue.append(
    'aid',
    String(globalEditResponseParamInfo.value.aid ?? GLOBAL_RESPONSE_AID),
  )
  bodyValue.append(
    'parentId',
    String(globalEditResponseParamInfo.value.parentId ?? 0),
  )
  bodyValue.append('name', globalEditResponseParamInfo.value.name)
  bodyValue.append('param', globalEditResponseParamInfo.value.param)
  bodyValue.append('docs', globalEditResponseParamInfo.value.docs)
  if (globalEditResponseParamInfo.value.example) {
    bodyValue.append('example', globalEditResponseParamInfo.value.example)
  }
  const res = await $myFetch('ResponseParamUpdate', {
    method: 'POST',
    body: bodyValue,
  })
  if (res.code === 200) {
    $msg(res.msg, 'success')
    globalEditResponseParamDialogStatus.value = false
    await getGlobalResponseParams()
  } else {
    $msg(res.msg, 'error')
  }
}
watch(globalEditResponseParamDialogStatus, (newVal) => {
  if (!newVal) {
    globalEditResponseParamInfo.value = {
      id: '',
      aid: '',
      parentId: 0,
      name: '',
      param: 'string',
      docs: '',
      example: '',
    }
  }
})

const handleGlobalDeleteResponseParam = async (row) => {
  const res = await $myFetch('ResponseParamDelete', { params: { pid: row.id } })
  if (res.code === 200) {
    $msg(res.msg, 'success')
    await getGlobalResponseParams()
  } else {
    $msg(res.msg, 'error')
  }
}

// 监听主选项卡变化，设置对应的子选项卡默认值
watch(activeTab, (newTab) => {
  if (newTab === 'basic') {
    activeSubTab.value = 'website'
  } else if (newTab === 'payment') {
    activeSubTab.value = 'alipay'
  } else if (newTab === 'system') {
    activeSubTab.value = 'ai'
  }
})

// 监听子选项卡变化，按需加载数据
watch(
  activeSubTab,
  async (newSubTab) => {
    // 基本设置相关
    if (newSubTab === 'website' && !loadedData.value.website) {
      await getWebsetInfo()
      loadedData.value.website = true
    } else if (newSubTab === 'mail' && !loadedData.value.mail) {
      await getMailInfo()
      loadedData.value.mail = true
    } else if (newSubTab === 'topApi' && !loadedData.value.topApi) {
      await getTopApiList()
      loadedData.value.topApi = true
    } else if (newSubTab === 'partners' && !loadedData.value.partners) {
      await getPartners()
      loadedData.value.partners = true
    }
    // 支付设置相关
    else if (newSubTab === 'alipay' && !loadedData.value.alipay) {
      await getAlipayInfo()
      loadedData.value.alipay = true
    } else if (newSubTab === 'wechatpay' && !loadedData.value.wechatpay) {
      await getWechatPayInfo()
      loadedData.value.wechatpay = true
    } else if (newSubTab === 'mpay' && !loadedData.value.mpay) {
      await getMPayInfo()
      loadedData.value.mpay = true
    } else if (newSubTab === 'hupi' && !loadedData.value.hupi) {
      await getHupiInfo()
      loadedData.value.hupi = true
    }
    // 高级设置相关
    else if (newSubTab === 'ai' && !loadedData.value.ai) {
      await getAIInfo()
      loadedData.value.ai = true
    } else if (newSubTab === 'about' && !loadedData.value.about) {
      await getAboutInfo()
      loadedData.value.about = true
    } else if (newSubTab === 'advanced' && !loadedData.value.advanced) {
      await getAdvancedInfo()
      loadedData.value.advanced = true
    } else if (newSubTab === 'login' && !loadedData.value.login) {
      await getLoginInfo()
      loadedData.value.login = true
    } else if (newSubTab === 'captcha' && !loadedData.value.captcha) {
      await getCaptchaInfo()
      loadedData.value.captcha = true
    } else if (
      newSubTab === 'responseParams' &&
      !loadedData.value.responseParams
    ) {
      await getGlobalResponseParams()
      loadedData.value.responseParams = true
    }
    // 'test' 和 'security' 标签页不需要加载额外数据
  },
  { immediate: true },
)

useHead({
  title: '系统设置',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="webset_container">
    <div class="cont">
      <el-tabs v-model="activeTab" class="setting-tabs main-tabs">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-tabs v-model="activeSubTab" class="sub-tabs">
            <el-tab-pane label="网站配置" name="website">
              <div class="form">
                <el-form
                  :model="websetInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="网站标题" required>
                    <el-input v-model="websetInfo.title" />
                  </el-form-item>
                  <el-form-item label="网站副标题" required>
                    <el-input v-model="websetInfo.subheading" />
                  </el-form-item>
                  <el-form-item label="网站关键词" required>
                    <el-input v-model="websetInfo.keywords" />
                  </el-form-item>
                  <el-form-item label="网站描述" required>
                    <el-input v-model="websetInfo.description" />
                  </el-form-item>
                  <el-form-item label="建站时间" required>
                    <el-date-picker
                      v-model="websetInfo.create_time"
                      type="datetime"
                      placeholder="选择建站时间"
                      format="YYYY/MM/DD HH:mm:ss"
                      value-format="YYYY/MM/DD HH:mm:ss"
                      :disabled-date="disabledDate"
                    />
                  </el-form-item>
                  <el-form-item label="ICP备案号">
                    <el-input v-model="websetInfo.icp" />
                  </el-form-item>
                  <el-form-item label="公安备案号">
                    <el-input v-model="websetInfo.gongan" />
                  </el-form-item>
                  <el-form-item label="增值电信业务许可证号">
                    <el-input v-model="websetInfo.valueAddedTelecomLicense" />
                  </el-form-item>
                  <el-form-item label="网站名称">
                    <el-input v-model="websetInfo.website_name" />
                  </el-form-item>
                  <el-form-item label="网站ico">
                    <el-input v-model="websetInfo.ico" />
                  </el-form-item>
                  <el-form-item label="网站logo">
                    <el-input v-model="websetInfo.logo" />
                  </el-form-item>
                  <el-form-item label="公司名称">
                    <el-input v-model="websetInfo.company_name" />
                  </el-form-item>
                  <el-form-item label="标语">
                    <el-input v-model="websetInfo.slogan" />
                  </el-form-item>
                  <el-form-item label="首页推荐信息">
                    <el-select
                      v-model="websetInfo.recommend"
                      placeholder="请选择是否显示首页热门API推荐、免费API大全信息"
                      style="width: 100%"
                    >
                      <el-option label="是" value="true"></el-option>
                      <el-option label="否" value="false"></el-option>
                    </el-select>
                    <div class="form-help">
                      开启后，首页将显示热门API推荐、免费API大全等信息
                    </div>
                  </el-form-item>
                  <el-form-item label="通知信息">
                    <el-input
                      v-model="websetInfo.notice"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入通知信息"
                    />
                  </el-form-item>
                  <el-form-item label="问题反馈链接">
                    <el-input
                      v-model="websetInfo.feedback"
                      placeholder="请输入问题反馈链接"
                    />
                  </el-form-item>
                  <el-form-item label="自定义CSS">
                    <el-input
                      v-model="websetInfo.css"
                      type="textarea"
                      :rows="5"
                      placeholder="请输入自定义CSS"
                    />
                  </el-form-item>
                  <el-form-item label="自定义JS">
                    <el-input
                      v-model="websetInfo.js"
                      type="textarea"
                      :rows="5"
                      placeholder="请输入自定义JS，如统计代码等"
                    />
                    <div class="form-help">
                      直接输入 JS 代码即可，无需添加 &lt;script&gt;
                      标签。支持统计代码、第三方脚本等
                    </div>
                  </el-form-item>
                  <el-form-item label="联系邮箱">
                    <el-input v-model="websetInfo.contact_email" />
                  </el-form-item>
                  <el-form-item label="联系电话">
                    <el-input v-model="websetInfo.contact_phone" />
                  </el-form-item>
                  <el-form-item label="联系地址">
                    <el-input v-model="websetInfo.contact_address" />
                  </el-form-item>
                  <el-form-item label="工作时间">
                    <el-input v-model="websetInfo.working_hours" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="websetInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="邮件配置" name="mail">
              <div class="form">
                <el-form
                  :model="mailInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="SMTP服务器地址" required>
                    <el-input v-model="mailInfo.smtp" />
                  </el-form-item>
                  <el-form-item label="邮箱账户" required>
                    <el-input v-model="mailInfo.user" />
                  </el-form-item>
                  <el-form-item label="密码" required>
                    <el-input
                      v-model="mailInfo.password"
                      type="password"
                      show-password
                    />
                  </el-form-item>
                  <el-form-item label="发件人" required>
                    <el-input v-model="mailInfo.setfrom" />
                  </el-form-item>
                  <el-form-item label="服务器端口" required>
                    <el-input v-model="mailInfo.port" />
                  </el-form-item>
                  <el-form-item label="发信名称" required>
                    <el-input v-model="mailInfo.name" />
                  </el-form-item>
                  <el-form-item label="邮件模板（HTML）">
                    <el-input
                      v-model="mailInfo.template"
                      type="textarea"
                      :rows="15"
                      placeholder="请输入HTML邮件模板，必须包含 {{title}} 和 {{content}} 占位符"
                    />
                    <div
                      class="form-help"
                      style="margin-top: 8px; color: #909399; font-size: 13px"
                    >
                      <p style="margin: 4px 0">
                        • 模板必须包含
                        <strong v-text="'{{title}}'"></strong> 和
                        <strong v-text="'{{content}}'"></strong> 占位符
                      </p>
                      <p style="margin: 4px 0">
                        • 支持完整的HTML代码，可以自定义样式
                      </p>
                    </div>
                  </el-form-item>
                  <!-- 模板预览 -->
                  <div v-if="mailInfo.template" style="margin: 20px 0">
                    <el-divider content-position="left">
                      <span style="font-size: 14px; font-weight: 600"
                        >模板预览</span
                      >
                    </el-divider>
                    <div style="margin: 8px 0; color: #909399; font-size: 12px">
                      * 预览使用示例数据替换占位符
                    </div>
                    <div
                      style="
                        border: 1px solid #dcdfe6;
                        border-radius: 4px;
                        padding: 20px;
                        background-color: #f5f7fa;
                        max-height: 500px;
                        overflow-y: auto;
                      "
                    >
                      <div
                        v-html="
                          mailInfo.template
                            .replace(/\{\{title\}\}/g, '【示例标题】验证码通知')
                            .replace(
                              /\{\{content\}\}/g,
                              '【示例内容】您的验证码是：123456，有效期5分钟。',
                            )
                        "
                      ></div>
                    </div>
                  </div>
                  <el-form-item>
                    <el-button type="primary" @click="mailInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="发信测试" name="test">
              <div class="form">
                <el-form label-position="top" label-width="120px">
                  <el-form-item label="测试邮箱">
                    <el-input v-model="testMail" placeholder="请输入测试邮箱" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="sendTestMail"
                      >发送测试</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="接口置顶" name="topApi">
              <div class="form">
                <el-form label-position="top" label-width="120px">
                  <el-form-item label="搜索接口">
                    <div class="search-input-group">
                      <el-autocomplete
                        v-model="searchApiKeyword"
                        :fetch-suggestions="querySearchAsync"
                        placeholder="请输入接口名称搜索"
                        @select="handleApiSelect"
                        class="search-input"
                        clearable
                        :loading="searchLoading"
                      >
                        <template #suffix>
                          <el-icon class="search-icon"><Search /></el-icon>
                        </template>
                      </el-autocomplete>
                      <el-button
                        type="primary"
                        @click="handleAddTopApi"
                        :disabled="!selectedApi"
                        :loading="addLoading"
                      >
                        添加置顶
                      </el-button>
                    </div>
                  </el-form-item>
                </el-form>

                <div class="top-api-list">
                  <div class="list-header">
                    <h3>置顶接口列表</h3>
                  </div>
                  <el-table
                    :data="topApiList"
                    style="width: 100%"
                    v-loading="topApiLoading"
                  >
                    <el-table-column
                      type="index"
                      label="排序"
                      width="80"
                      align="center"
                    />
                    <el-table-column
                      prop="name"
                      label="接口名称"
                      min-width="150"
                    >
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                      <template #default="scope">
                        <el-button
                          type="danger"
                          link
                          style="padding: 0; margin: 0"
                          @click="removeTopApi(scope.$index, scope.row)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="合作伙伴" name="partners">
              <div class="form">
                <!-- 操作区域 -->
                <div style="margin-bottom: 20px; text-align: right">
                  <el-button type="primary" @click="openAddPartnerDialog">
                    新增合作伙伴
                  </el-button>
                </div>

                <!-- 合作伙伴列表 -->
                <div class="partner-list">
                  <el-table
                    :data="partnerList"
                    v-loading="partnerLoading"
                    style="width: 100%"
                    stripe
                    ><el-table-column prop="id" label="ID" width="80" />
                    <el-table-column prop="name" label="名称" width="120" />
                    <el-table-column prop="category" label="分类" width="120" />
                    <el-table-column
                      prop="logo"
                      label="Logo链接"
                      show-overflow-tooltip
                    />
                    <el-table-column
                      prop="website"
                      label="网站链接"
                      show-overflow-tooltip
                    />
                    <el-table-column prop="description" label="描述" />

                    <el-table-column label="操作" width="120">
                      <template #default="scope">
                        <el-button
                          type="primary"
                          link
                          @click="openEditPartnerDialog(scope.row)"
                          style="padding: 0"
                        >
                          编辑
                        </el-button>
                        <el-button
                          type="danger"
                          link
                          @click="deletePartner(scope.row.id)"
                          style="padding: 0"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <!-- 新增/编辑合作伙伴对话框 -->
                <el-dialog
                  v-model="partnerDialogVisible"
                  :title="partnerEditMode ? '编辑合作伙伴' : '新增合作伙伴'"
                  width="600px"
                >
                  <el-form
                    :model="partnerForm"
                    label-position="top"
                    label-width="120px"
                  >
                    <el-form-item label="名称" required>
                      <el-input
                        v-model="partnerForm.name"
                        placeholder="请输入合作伙伴名称"
                      />
                    </el-form-item>
                    <el-form-item label="Logo URL" required>
                      <el-input
                        v-model="partnerForm.logo"
                        placeholder="请输入Logo图片URL"
                      />
                    </el-form-item>
                    <el-form-item label="描述" required>
                      <el-input
                        v-model="partnerForm.description"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入合作伙伴描述"
                      />
                    </el-form-item>
                    <el-form-item label="网站" required>
                      <el-input
                        v-model="partnerForm.website"
                        placeholder="请输入合作伙伴网站URL"
                      />
                    </el-form-item>
                    <el-form-item label="分类" required>
                      <el-input
                        v-model="partnerForm.category"
                        placeholder="请输入分类"
                      />
                    </el-form-item>
                  </el-form>
                  <template #footer>
                    <span class="dialog-footer">
                      <el-button @click="partnerDialogVisible = false"
                        >取消</el-button
                      >
                      <el-button
                        type="primary"
                        @click="submitPartnerForm"
                        :loading="partnerLoading"
                      >
                        {{ partnerEditMode ? '更新' : '创建' }}
                      </el-button>
                    </span>
                  </template>
                </el-dialog>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 高级设置 -->
        <el-tab-pane label="高级设置" name="system">
          <el-tabs v-model="activeSubTab" class="sub-tabs">
            <el-tab-pane label="AI配置" name="ai">
              <div class="form">
                <el-form
                  :model="aiInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="API密钥">
                    <el-input
                      v-model="aiInfo.key"
                      type="password"
                      show-password
                      placeholder="请输入AI服务API密钥"
                    />
                  </el-form-item>
                  <el-form-item label="模型名称">
                    <el-input
                      v-model="aiInfo.model"
                      placeholder="请输入AI模型名称（如：gpt-3.5-turbo）"
                    />
                  </el-form-item>
                  <el-form-item label="系统消息">
                    <el-input
                      v-model="aiInfo.system_message"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入系统提示消息，用于定义AI助手的行为和角色"
                    />
                  </el-form-item>
                  <el-form-item label="API地址">
                    <el-input
                      v-model="aiInfo.url"
                      placeholder="请输入AI服务API地址（如：https://api.openai.com/v1）"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="aiInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="关于我们" name="about">
              <div class="form about-form">
                <el-form
                  :model="aboutInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <!-- 公司信息 -->
                  <el-divider content-position="left">公司信息</el-divider>
                  <el-form-item label="公司名称">
                    <el-input
                      v-model="aboutInfo.companyInfo.name"
                      placeholder="请输入公司名称"
                    />
                  </el-form-item>
                  <el-form-item label="公司标语">
                    <el-input
                      v-model="aboutInfo.companyInfo.slogan"
                      placeholder="请输入公司标语"
                    />
                  </el-form-item>
                  <el-form-item label="公司描述">
                    <el-input
                      v-model="aboutInfo.companyInfo.description"
                      type="textarea"
                      :rows="6"
                      placeholder="请输入公司详细描述（支持HTML）"
                    />
                  </el-form-item>
                  <el-form-item label="联系方式">
                    <el-input
                      v-model="aboutInfo.companyInfo.contact"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入联系方式（支持HTML）"
                    />
                  </el-form-item>

                  <!-- 功能特色 -->
                  <el-divider content-position="left">功能特色</el-divider>
                  <div
                    v-for="(feature, index) in aboutInfo.features"
                    :key="index"
                    class="array-item"
                  >
                    <div class="array-item-header">
                      <span>特色 {{ index + 1 }}</span>
                    </div>
                    <el-form-item label="标题">
                      <el-input
                        v-model="feature.title"
                        placeholder="请输入特色标题"
                      />
                    </el-form-item>
                    <el-form-item label="描述">
                      <el-input
                        v-model="feature.description"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入特色描述"
                      />
                    </el-form-item>
                  </div>

                  <!-- 服务条款 -->
                  <el-divider content-position="left">服务条款</el-divider>
                  <el-form-item label="服务说明标题">
                    <el-input
                      v-model="aboutInfo.serviceTerms.serviceDescription.title"
                      placeholder="请输入服务说明标题"
                    />
                  </el-form-item>
                  <el-form-item label="服务说明内容">
                    <el-input
                      v-model="
                        aboutInfo.serviceTerms.serviceDescription.content
                      "
                      type="textarea"
                      :rows="4"
                      placeholder="请输入服务说明内容（支持HTML）"
                    />
                  </el-form-item>
                  <el-form-item label="API服务协议标题">
                    <el-input
                      v-model="aboutInfo.serviceTerms.apiAgreement.title"
                      placeholder="请输入API服务协议标题"
                    />
                  </el-form-item>
                  <el-form-item label="API服务协议内容">
                    <el-input
                      v-model="aboutInfo.serviceTerms.apiAgreement.content"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入API服务协议内容（支持HTML）"
                    />
                  </el-form-item>
                  <el-form-item label="隐私保护标题">
                    <el-input
                      v-model="aboutInfo.serviceTerms.privacyPolicy.title"
                      placeholder="请输入隐私保护标题"
                    />
                  </el-form-item>
                  <el-form-item label="隐私保护内容">
                    <el-input
                      v-model="aboutInfo.serviceTerms.privacyPolicy.content"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入隐私保护内容（支持HTML）"
                    />
                  </el-form-item>

                  <!-- 发展历程 -->
                  <el-divider content-position="left">
                    <span>发展历程</span>
                    <el-button
                      type="primary"
                      link
                      @click="addTimelineYear"
                      style="margin-left: 10px"
                    >
                      + 添加年份
                    </el-button>
                  </el-divider>
                  <div
                    v-for="(timeline, yearIndex) in aboutInfo.timeline"
                    :key="yearIndex"
                    class="array-item"
                    style="margin-top: 20px"
                  >
                    <div class="array-item-header">
                      <span>年份 {{ yearIndex + 1 }}</span>
                      <el-button
                        type="danger"
                        link
                        @click="removeTimelineYear(yearIndex)"
                        v-if="aboutInfo.timeline.length > 1"
                      >
                        删除年份
                      </el-button>
                    </div>
                    <el-form-item label="年份">
                      <el-input
                        v-model="timeline.year"
                        placeholder="请输入年份，如：2022年"
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <div class="label-with-action">
                          <span>事件</span>
                          <el-button
                            type="primary"
                            link
                            @click="addTimelineEvent(yearIndex)"
                            size="small"
                          >
                            + 添加事件
                          </el-button>
                        </div>
                      </template>
                      <div
                        v-for="(event, eventIndex) in timeline.events"
                        :key="eventIndex"
                        class="event-item"
                      >
                        <div class="event-input-wrapper">
                          <el-input
                            v-model="timeline.events[eventIndex]"
                            placeholder="请输入事件描述"
                          />
                          <el-button
                            type="danger"
                            link
                            @click="removeTimelineEvent(yearIndex, eventIndex)"
                            v-if="timeline.events.length > 1"
                            class="event-delete-btn"
                          >
                            删除
                          </el-button>
                        </div>
                      </div>
                    </el-form-item>
                  </div>

                  <!-- 技术栈 -->
                  <el-divider content-position="left">技术栈</el-divider>
                  <div
                    v-for="(tech, stackIndex) in aboutInfo.techStack"
                    :key="stackIndex"
                    class="array-item"
                  >
                    <div class="array-item-header">
                      <span>技术类别 {{ stackIndex + 1 }}</span>
                    </div>
                    <el-form-item label="类别标题">
                      <el-input
                        v-model="tech.title"
                        placeholder="请输入技术类别标题"
                      />
                    </el-form-item>
                    <el-form-item>
                      <template #label>
                        <div class="label-with-action">
                          <span>技术项目</span>
                          <el-button
                            type="primary"
                            link
                            @click="addTechStackItem(stackIndex)"
                            size="small"
                          >
                            + 添加项目
                          </el-button>
                        </div>
                      </template>
                      <div
                        v-for="(item, itemIndex) in tech.items"
                        :key="itemIndex"
                        class="event-item"
                      >
                        <div class="event-input-wrapper">
                          <el-input
                            v-model="tech.items[itemIndex]"
                            placeholder="请输入技术项目"
                          />
                          <el-button
                            type="danger"
                            link
                            @click="removeTechStackItem(stackIndex, itemIndex)"
                            v-if="tech.items.length > 1"
                            class="event-delete-btn"
                          >
                            删除
                          </el-button>
                        </div>
                      </div>
                    </el-form-item>
                  </div>

                  <!-- API类型 -->
                  <el-divider content-position="left">API类型</el-divider>
                  <div
                    v-for="(apiType, index) in aboutInfo.apiTypes"
                    :key="index"
                    class="array-item"
                  >
                    <div class="array-item-header">
                      <span>API类型 {{ index + 1 }}</span>
                    </div>
                    <el-form-item label="标题">
                      <el-input
                        v-model="apiType.title"
                        placeholder="请输入API类型标题"
                      />
                    </el-form-item>
                    <el-form-item label="描述">
                      <el-input
                        v-model="apiType.description"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入API类型描述"
                      />
                    </el-form-item>
                    <el-form-item label="功能特性（HTML格式）">
                      <el-input
                        v-model="apiType.features"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入功能特性（支持HTML）"
                      />
                    </el-form-item>
                  </div>

                  <!-- 开发者支持 -->
                  <el-divider content-position="left">开发者支持</el-divider>
                  <div
                    v-for="(support, index) in aboutInfo.devSupport"
                    :key="index"
                    class="array-item"
                  >
                    <div class="array-item-header">
                      <span>支持项目 {{ index + 1 }}</span>
                    </div>
                    <el-form-item label="标题">
                      <el-input
                        v-model="support.title"
                        placeholder="请输入支持项目标题"
                      />
                    </el-form-item>
                    <el-form-item label="描述">
                      <el-input
                        v-model="support.description"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入支持项目描述"
                      />
                    </el-form-item>
                  </div>

                  <!-- 统计数据 -->
                  <el-divider content-position="left">统计数据</el-divider>
                  <div
                    v-for="(stat, index) in aboutInfo.statistics"
                    :key="index"
                    class="array-item"
                  >
                    <div class="array-item-header">
                      <span>统计项 {{ index + 1 }}</span>
                    </div>
                    <el-form-item label="数值">
                      <el-input
                        v-model="stat.number"
                        placeholder="请输入统计数值，如：10000+"
                      />
                    </el-form-item>
                    <el-form-item label="标签">
                      <el-input
                        v-model="stat.label"
                        placeholder="请输入统计标签，如：累计服务开发者"
                      />
                    </el-form-item>
                  </div>

                  <!-- 用户评价 -->
                  <el-divider content-position="left">用户评价</el-divider>
                  <div
                    v-for="(testimonial, index) in aboutInfo.testimonials"
                    :key="index"
                    class="array-item"
                  >
                    <div class="array-item-header">
                      <span>用户评价 {{ index + 1 }}</span>
                    </div>
                    <el-form-item label="评价内容">
                      <el-input
                        v-model="testimonial.quote"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入评价内容"
                      />
                    </el-form-item>
                    <el-form-item label="评价人姓名">
                      <el-input
                        v-model="testimonial.author.name"
                        placeholder="请输入评价人姓名"
                      />
                    </el-form-item>
                    <el-form-item label="评价人公司">
                      <el-input
                        v-model="testimonial.author.company"
                        placeholder="请输入评价人公司"
                      />
                    </el-form-item>
                    <el-form-item label="评分">
                      <el-input
                        v-model="testimonial.rating"
                        placeholder="请输入评分，如：★★★★★"
                      />
                    </el-form-item>
                    <el-form-item label="评价日期">
                      <el-input
                        v-model="testimonial.date"
                        placeholder="请输入评价日期，如：2024-02"
                      />
                    </el-form-item>
                  </div>

                  <el-form-item>
                    <el-button type="primary" @click="aboutInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>

                <!-- 提示说明 -->
                <client-only>
                  <el-alert
                    title="使用说明"
                    type="info"
                    :closable="false"
                    style="margin-top: 24px"
                  >
                    <template #default>
                      <p>
                        1.
                        所有文本内容字段都支持HTML标签，可以设置丰富的文本格式
                      </p>
                      <p>2. 数组类型的数据可以通过"添加"和"删除"按钮动态管理</p>
                      <p>3. 修改完成后请点击"提交"按钮保存更改</p>
                    </template>
                  </el-alert></client-only
                >
              </div>
            </el-tab-pane>

            <el-tab-pane label="安全设置" name="security">
              <div class="security-settings-container" style="padding: 20px 0">
                <div
                  class="setting-card"
                  style="
                    background: #fff;
                    border: 1px solid #ebeef5;
                    border-radius: 8px;
                    padding: 24px;
                    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
                  "
                >
                  <div
                    class="card-header"
                    style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      margin-bottom: 24px;
                      border-bottom: 1px solid #ebeef5;
                      padding-bottom: 16px;
                    "
                  >
                    <div>
                      <h3
                        style="
                          margin: 0;
                          font-size: 18px;
                          font-weight: 600;
                          color: #303133;
                        "
                      >
                        API 加密密钥管理
                      </h3>
                      <p
                        style="
                          margin: 8px 0 0;
                          font-size: 14px;
                          color: #909399;
                          line-height: 1.5;
                        "
                      >
                        管理系统用于 API
                        通信加密的核心密钥（AES与HMAC）。定期刷新密钥有助于提高系统安全性。
                      </p>
                    </div>
                  </div>

                  <div class="card-content">
                    <el-alert
                      title="高风险操作警告"
                      type="warning"
                      description="刷新密钥将导致当前使用的所有旧密钥立即失效。这可能会中断正在进行的加密通信，或导致未及时更新密钥的客户端无法连接。请务必在业务低峰期执行此操作，并做好应急准备。"
                      show-icon
                      :closable="false"
                      style="margin-bottom: 24px"
                    />

                    <div
                      class="action-area"
                      style="
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        background-color: #fef0f0;
                        padding: 16px;
                        border-radius: 4px;
                        border: 1px dashed #f56c6c;
                      "
                    >
                      <div style="flex: 1">
                        <span
                          style="
                            font-size: 14px;
                            color: #f56c6c;
                            font-weight: 500;
                          "
                          >执行密钥刷新</span
                        >
                        <p
                          style="
                            margin: 4px 0 0;
                            font-size: 13px;
                            color: #909399;
                          "
                        >
                          此操作不可逆，请谨慎操作。
                        </p>
                      </div>
                      <el-button
                        type="danger"
                        :icon="Refresh"
                        @click="refreshEncryptionKeys"
                        :loading="refreshKeysLoading"
                      >
                        立即刷新密钥
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="全局返回参数" name="responseParams">
              <client-only>
                <el-alert
                  title="全局返回参数说明"
                  type="info"
                  show-icon
                  :closable="false"
                  style="margin-bottom: 20px"
                >
                  <template #default>
                    <div>
                      全局返回参数（aid=0）将作为接口文档中返回结构的通用说明，可在接口编辑页为单接口维护专属返回参数。
                    </div>
                  </template>
                </el-alert>
              </client-only>

              <div class="param-header">
                <div class="header-left">
                  <span class="param-title">返回参数列表</span>
                </div>
                <div class="header-right">
                  <el-button
                    type="primary"
                    @click="handleGlobalAddResponseParam"
                  >
                    <span>添加返回参数</span>
                  </el-button>
                </div>
              </div>

              <el-table
                :data="globalResponseParamsArr"
                row-key="id"
                :tree-props="{ children: 'children' }"
                default-expand-all
              >
                <el-table-column prop="name" label="参数名称" min-width="120" />
                <el-table-column
                  prop="id"
                  label="ID"
                  width="80"
                  align="right"
                />
                <el-table-column
                  prop="parentId"
                  label="父级ID"
                  width="80"
                  align="right"
                />
                <el-table-column prop="param" label="类型" width="100" />
                <el-table-column
                  prop="docs"
                  label="说明"
                  min-width="160"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="example"
                  label="示例值"
                  width="120"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="create_time"
                  label="创建时间"
                  width="180"
                />
                <el-table-column label="操作" width="220" fixed="right">
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button
                        size="small"
                        type="primary"
                        link
                        @click="handleGlobalEditResponseParam(scope.row)"
                      >
                        编辑
                      </el-button>
                      <el-button
                        size="small"
                        type="primary"
                        link
                        @click="handleGlobalAddResponseParam(scope.row)"
                      >
                        添加
                      </el-button>
                      <el-popconfirm
                        confirm-button-text="确定"
                        cancel-button-text="取消"
                        title="确定要删除该返回参数吗？"
                        @confirm="handleGlobalDeleteResponseParam(scope.row)"
                      >
                        <template #reference>
                          <el-button size="small" type="danger" link>
                            删除
                          </el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <el-dialog
                v-model="globalAddResponseParamDialogStatus"
                title="添加返回参数"
                width="600px"
                destroy-on-close
                class="param-dialog"
              >
                <div class="dialog-content">
                  <el-form
                    :model="globalAddResponseParamInfo"
                    label-width="100px"
                  >
                    <el-form-item label="参数名称" required>
                      <el-input
                        v-model="globalAddResponseParamInfo.name"
                        placeholder="如 code、data、msg"
                      />
                    </el-form-item>
                    <el-form-item label="参数类型" required>
                      <el-select
                        v-model="globalAddResponseParamInfo.param"
                        placeholder="请选择或输入类型，如 string、int、object、array"
                        style="width: 100%"
                        filterable
                        allow-create
                        default-first-option
                        :teleported="false"
                      >
                        <el-option
                          v-for="item in globalResponseParamTypeOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="父级参数">
                      <el-select
                        v-model="globalAddResponseParamInfo.parentId"
                        placeholder="请选择父级，不选则为顶级"
                        style="width: 100%"
                        clearable
                        :teleported="false"
                      >
                        <el-option
                          v-for="opt in globalResponseParamParentOptions"
                          :key="opt.value"
                          :label="opt.label"
                          :value="opt.value"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="参数说明" required>
                      <el-input
                        v-model="globalAddResponseParamInfo.docs"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入参数说明"
                      />
                    </el-form-item>
                    <el-form-item label="示例值">
                      <el-input
                        v-model="globalAddResponseParamInfo.example"
                        placeholder="选填，如 200、success"
                      />
                    </el-form-item>
                  </el-form>
                </div>
                <template #footer>
                  <div class="dialog-footer">
                    <el-button
                      @click="globalAddResponseParamDialogStatus = false"
                    >
                      取消
                    </el-button>
                    <el-button type="primary" @click="globalAddResponseParam">
                      添加
                    </el-button>
                  </div>
                </template>
              </el-dialog>

              <el-dialog
                v-model="globalEditResponseParamDialogStatus"
                title="编辑返回参数"
                width="600px"
                destroy-on-close
                class="param-dialog"
              >
                <div class="dialog-content">
                  <el-form
                    :model="globalEditResponseParamInfo"
                    label-width="100px"
                  >
                    <el-form-item label="参数名称" required>
                      <el-input
                        v-model="globalEditResponseParamInfo.name"
                        placeholder="如 code、data、msg"
                      />
                    </el-form-item>
                    <el-form-item label="参数类型" required>
                      <el-select
                        v-model="globalEditResponseParamInfo.param"
                        placeholder="请选择或输入类型"
                        style="width: 100%"
                        filterable
                        allow-create
                        default-first-option
                        :teleported="false"
                      >
                        <el-option
                          v-for="item in globalResponseParamTypeOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="父级参数">
                      <el-select
                        v-model="globalEditResponseParamInfo.parentId"
                        placeholder="请选择父级，不选则为顶级"
                        style="width: 100%"
                        clearable
                        :teleported="false"
                      >
                        <el-option
                          v-for="opt in globalEditResponseParamParentOptions"
                          :key="opt.value"
                          :label="opt.label"
                          :value="opt.value"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="参数说明" required>
                      <el-input
                        v-model="globalEditResponseParamInfo.docs"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入参数说明"
                      />
                    </el-form-item>
                    <el-form-item label="示例值">
                      <el-input
                        v-model="globalEditResponseParamInfo.example"
                        placeholder="选填，如 200、success"
                      />
                    </el-form-item>
                  </el-form>
                </div>
                <template #footer>
                  <div class="dialog-footer">
                    <el-button
                      @click="globalEditResponseParamDialogStatus = false"
                    >
                      取消
                    </el-button>
                    <el-button
                      type="primary"
                      @click="globalUpdateResponseParam"
                    >
                      更新
                    </el-button>
                  </div>
                </template>
              </el-dialog>
            </el-tab-pane>

            <el-tab-pane label="高级设置" name="advanced">
              <div class="form">
                <el-form
                  :model="advancedInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="返回携带请求ID">
                    <el-select
                      v-model="advancedInfo.request_id"
                      placeholder="请选择是否返回请求ID"
                      style="width: 100%"
                    >
                      <el-option label="是" value="true"></el-option>
                      <el-option label="否" value="false"></el-option>
                    </el-select>
                    <div class="form-help">
                      开启后，所有API响应将包含唯一的请求ID，便于问题追踪和调试
                    </div>
                  </el-form-item>

                  <el-form-item label="是否启用clickhouse">
                    <el-select
                      v-model="advancedInfo.clickhouse"
                      placeholder="是否启用clickhouse"
                      style="width: 100%"
                    >
                      <el-option label="是" value="true"></el-option>
                      <el-option label="否" value="false"></el-option>
                    </el-select>
                    <div class="form-help">
                      开启后，所有API响应将写入clickhouse数据库，便于问题追踪和调试
                    </div>
                  </el-form-item>

                  <el-form-item label="ClickHouse日志保存时间(天)">
                    <el-input
                      v-model="advancedInfo.clickhouse_retention_days"
                      placeholder="请输入日志保存天数，例如：30"
                      type="number"
                      style="width: 100%"
                    />
                    <div class="form-help">
                      设置ClickHouse日志的保留时间，单位为天。过期日志将被自动清理。
                    </div>
                  </el-form-item>

                  <el-form-item label="数据大屏虚拟数据">
                    <el-select
                      v-model="advancedInfo.api_logs_map_virtual"
                      placeholder="请选择是否启用数据大屏虚拟数据"
                      style="width: 100%"
                    >
                      <el-option label="是" value="true"></el-option>
                      <el-option label="否" value="false"></el-option>
                    </el-select>
                    <div class="form-help">
                      开启后，数据大屏将使用虚拟数据进行展示
                    </div>
                  </el-form-item>

                  <el-form-item
                    label="服务器IP地址"
                    :rules="[
                      {
                        validator: validateIPv4,
                        trigger: 'blur',
                      },
                    ]"
                    prop="server_ip"
                  >
                    <el-input
                      v-model="advancedInfo.server_ip"
                      placeholder="请输入服务器IP地址（如：192.168.1.1）"
                      style="width: 100%"
                    />
                    <div class="form-help">
                      用于实时监控大屏中显示的服务器地址，必须为有效的IPv4格式
                    </div>
                  </el-form-item>

                  <el-form-item label="CDN HTTP头">
                    <el-input
                      v-model="advancedInfo.cdn_header"
                      placeholder="请输入用户开启CDN后获取的HTTP头"
                      style="width: 100%"
                    />
                    <div class="form-help">
                      用户开启CDN后用于获取IP的HTTP头，例如：X-Forwarded-For
                    </div>
                  </el-form-item>

                  <el-form-item label="强制用户绑定手机号">
                    <el-select
                      v-model="advancedInfo.force_bind_phone"
                      placeholder="请选择是否强制用户绑定手机号"
                      style="width: 100%"
                    >
                      <el-option label="是" value="true" />
                      <el-option label="否" value="false" />
                    </el-select>
                    <div class="form-help">
                      开启后，用户必须绑定手机号才能正常使用平台功能
                    </div>
                  </el-form-item>

                  <el-form-item label="企业微信通知机器人Webhook URL">
                    <el-input
                      v-model="advancedInfo.wechat_webhook_url"
                      placeholder="请输入企业微信机器人Webhook地址"
                      style="width: 100%"
                    />
                    <div class="form-help">
                      企业微信群机器人的Webhook地址，用于接收系统通知消息
                    </div>
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" @click="advancedInfoSubmit">
                      提交
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="登录设置" name="login">
              <div class="form">
                <el-form
                  :model="loginInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="登录方式">
                    <el-checkbox-group v-model="loginInfo.method">
                      <el-checkbox label="email">邮箱验证码登录</el-checkbox>
                      <el-checkbox label="sms">手机号验证码登录</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>

                  <!-- 手机号登录配置 -->
                  <template v-if="loginInfo.method.includes('sms')">
                    <el-divider content-position="left"
                      >短信平台配置</el-divider
                    >

                    <el-form-item label="短信服务商">
                      <el-radio-group v-model="loginInfo.provider">
                        <el-radio value="aliyun">阿里云</el-radio>
                        <el-radio value="tencent">腾讯云</el-radio>
                      </el-radio-group>
                    </el-form-item>

                    <!-- 阿里云配置 -->
                    <template v-if="loginInfo.provider === 'aliyun'">
                      <el-divider content-position="left"
                        >阿里云平台配置</el-divider
                      >

                      <el-form-item label="签名名称">
                        <el-input
                          v-model="loginInfo.signName"
                          placeholder="示例：山东省云鹊网络科技"
                        />
                        <div class="form-help">
                          短信签名名称，用于标识短信发送方
                        </div>
                      </el-form-item>

                      <el-form-item label="模版代码">
                        <el-input
                          v-model="loginInfo.templateCode"
                          placeholder="示例：SMS_311225217"
                        />
                        <div class="form-help">阿里云短信模板代码</div>
                      </el-form-item>

                      <el-form-item label="AccessKeyId">
                        <el-input
                          v-model="loginInfo.secretId"
                          placeholder="请输入AccessKeyId"
                        />
                        <div class="form-help">阿里云访问密钥ID</div>
                      </el-form-item>

                      <el-form-item label="AccessKeySecret">
                        <el-input
                          v-model="loginInfo.secretKey"
                          type="password"
                          show-password
                          placeholder="请输入AccessKeySecret"
                        />
                        <div class="form-help">阿里云访问密钥Secret</div>
                      </el-form-item>
                    </template>

                    <!-- 腾讯云配置 -->
                    <template v-if="loginInfo.provider === 'tencent'">
                      <el-divider content-position="left"
                        >腾讯云平台配置</el-divider
                      >

                      <el-form-item label="SdkAppId">
                        <el-input
                          v-model="loginInfo.sdkAppId"
                          placeholder="请输入SdkAppId"
                        />
                        <div class="form-help">腾讯云短信应用ID</div>
                      </el-form-item>

                      <el-form-item label="模板ID">
                        <el-input
                          v-model="loginInfo.templateCode"
                          placeholder="请输入模板ID"
                        />
                        <div class="form-help">腾讯云短信模板ID</div>
                      </el-form-item>

                      <el-form-item label="签名名称">
                        <el-input
                          v-model="loginInfo.signName"
                          placeholder="示例：山东省云鹊网络"
                        />
                        <div class="form-help">
                          短信签名名称，用于标识短信发送方
                        </div>
                      </el-form-item>

                      <el-form-item label="secretId">
                        <el-input
                          v-model="loginInfo.secretId"
                          placeholder="请输入secretId"
                        />
                        <div class="form-help">腾讯云API密钥ID</div>
                      </el-form-item>

                      <el-form-item label="secretKey">
                        <el-input
                          v-model="loginInfo.secretKey"
                          type="password"
                          show-password
                          placeholder="请输入secretKey"
                        />
                        <div class="form-help">腾讯云API密钥Key</div>
                      </el-form-item>
                    </template>
                  </template>

                  <el-form-item>
                    <el-button type="primary" @click="loginInfoSubmit">
                      提交
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="验证码配置" name="captcha">
              <div class="form">
                <el-form
                  :model="captchaInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="验证码类型">
                    <el-radio-group
                      v-model="captchaInfo.type"
                      class="captcha-type-group"
                    >
                      <el-radio value="math" border>
                        <div class="radio-content">
                          <span class="radio-title">数学运算</span>
                          <span class="radio-desc">如：3 + 5 = ?</span>
                        </div>
                      </el-radio>
                      <el-radio value="number" border>
                        <div class="radio-content">
                          <span class="radio-title">字符验证码</span>
                          <span class="radio-desc">如：A3K7</span>
                        </div>
                      </el-radio>
                      <el-radio value="mixed" border>
                        <div class="radio-content">
                          <span class="radio-title">混合模式</span>
                          <span class="radio-desc">随机切换类型</span>
                        </div>
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item label="难度等级">
                    <el-radio-group
                      v-model="captchaInfo.difficulty"
                      class="captcha-difficulty-group"
                    >
                      <el-radio value="easy" border>
                        <div class="radio-content">
                          <span class="radio-title">简单</span>
                          <span class="radio-desc">噪点少，易识别</span>
                        </div>
                      </el-radio>
                      <el-radio value="medium" border>
                        <div class="radio-content">
                          <span class="radio-title">中等</span>
                          <span class="radio-desc">推荐，平衡体验</span>
                        </div>
                      </el-radio>
                      <el-radio value="hard" border>
                        <div class="radio-content">
                          <span class="radio-title">困难</span>
                          <span class="radio-desc">高安全，防机器</span>
                        </div>
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <!-- 规则说明卡片 -->
                  <div class="captcha-rules-card">
                    <div class="rules-header">
                      <span class="rules-icon">ℹ</span>
                      <span>当前配置规则说明</span>
                    </div>
                    <div class="rules-content">
                      <!-- 图像参数 -->
                      <div class="rule-row">
                        <span class="rule-label">图像干扰</span>
                        <span class="rule-value">
                          <template v-if="captchaInfo.difficulty === 'easy'">
                            <el-tag size="small" type="success">噪点 30</el-tag>
                            <el-tag size="small" type="success"
                              >干扰线 2条</el-tag
                            >
                          </template>
                          <template
                            v-else-if="captchaInfo.difficulty === 'medium'"
                          >
                            <el-tag size="small" type="warning">噪点 50</el-tag>
                            <el-tag size="small" type="warning"
                              >干扰线 4条</el-tag
                            >
                          </template>
                          <template v-else>
                            <el-tag size="small" type="danger">噪点 80</el-tag>
                            <el-tag size="small" type="danger"
                              >干扰线 6条</el-tag
                            >
                          </template>
                        </span>
                      </div>

                      <!-- 数学运算规则 -->
                      <div
                        class="rule-row"
                        v-if="
                          captchaInfo.type === 'math' ||
                          captchaInfo.type === 'mixed'
                        "
                      >
                        <span class="rule-label">数学运算</span>
                        <span class="rule-value">
                          <template v-if="captchaInfo.difficulty === 'easy'">
                            <el-tag size="small">数字 1~10</el-tag>
                            <el-tag size="small">仅加法</el-tag>
                            <span class="rule-example">例：3 + 5 = 8</span>
                          </template>
                          <template
                            v-else-if="captchaInfo.difficulty === 'medium'"
                          >
                            <el-tag size="small">数字 1~50</el-tag>
                            <el-tag size="small">加、减、乘</el-tag>
                            <span class="rule-example">例：23 - 15 = 8</span>
                          </template>
                          <template v-else>
                            <el-tag size="small">数字 10~99</el-tag>
                            <el-tag size="small">加、减、乘</el-tag>
                            <span class="rule-example">例：67 - 38 = 29</span>
                          </template>
                        </span>
                      </div>

                      <!-- 字符验证码规则 -->
                      <div
                        class="rule-row"
                        v-if="
                          captchaInfo.type === 'number' ||
                          captchaInfo.type === 'mixed'
                        "
                      >
                        <span class="rule-label">字符组成</span>
                        <span class="rule-value">
                          <template v-if="captchaInfo.difficulty === 'easy'">
                            <el-tag size="small">纯数字 0-9</el-tag>
                            <span class="rule-example">例：4829</span>
                          </template>
                          <template
                            v-else-if="captchaInfo.difficulty === 'medium'"
                          >
                            <el-tag size="small">数字 + 大写字母</el-tag>
                            <span class="rule-example">例：A3K7</span>
                          </template>
                          <template v-else>
                            <el-tag size="small">数字 + 大小写字母</el-tag>
                            <span class="rule-example">例：aB3kM7</span>
                          </template>
                        </span>
                      </div>

                      <div
                        class="rule-note"
                        v-if="
                          captchaInfo.type === 'number' ||
                          captchaInfo.type === 'mixed'
                        "
                      >
                        * 已自动排除易混淆字符（I/l/1、O/0）
                      </div>
                    </div>
                  </div>

                  <el-form-item label="验证码长度">
                    <el-input-number
                      v-model="captchaInfo.length"
                      :min="4"
                      :max="8"
                      style="width: 200px"
                    />
                    <span class="form-help-inline"
                      >仅对字符验证码有效，建议 4~6 位</span
                    >
                  </el-form-item>

                  <el-form-item label="过期时间">
                    <el-input-number
                      v-model="captchaInfo.expire_time"
                      :min="30"
                      :max="300"
                      :step="10"
                      style="width: 200px"
                    />
                    <span class="form-help-inline">秒，建议 60~120 秒</span>
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" @click="captchaInfoSubmit">
                      提交
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 支付设置 -->
        <el-tab-pane label="支付设置" name="payment">
          <el-tabs v-model="activeSubTab" class="sub-tabs">
            <el-tab-pane label="支付宝配置" name="alipay">
              <div class="form">
                <el-form
                  :model="alipayInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="支付宝Appid">
                    <el-input
                      v-model="alipayInfo.Appid"
                      placeholder="请输入支付宝Appid"
                    />
                  </el-form-item>
                  <el-form-item label="应用私钥">
                    <el-input
                      v-model="alipayInfo.PrivateKey"
                      type="textarea"
                      :rows="5"
                      placeholder="请输入支付宝私钥"
                    />
                  </el-form-item>
                  <el-form-item label="支付宝公钥">
                    <el-input
                      v-model="alipayInfo.PublicKey"
                      type="textarea"
                      :rows="5"
                      placeholder="请输入支付宝公钥"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="alipayInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="微信支付配置" name="wechatpay">
              <div class="form">
                <el-form
                  :model="wechatPayInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="API V3密钥">
                    <el-input
                      v-model="wechatPayInfo.apiV3Key"
                      placeholder="请输入微信支付API V3密钥"
                    />
                  </el-form-item>
                  <el-form-item label="应用ID(AppId)">
                    <el-input
                      v-model="wechatPayInfo.appid"
                      placeholder="请输入微信小程序/公众号AppId"
                    />
                  </el-form-item>
                  <el-form-item label="商户号(MchId)">
                    <el-input
                      v-model="wechatPayInfo.mchid"
                      placeholder="请输入微信支付商户号"
                    />
                  </el-form-item>
                  <el-form-item label="商户私钥">
                    <el-input
                      v-model="wechatPayInfo.privateKey"
                      type="textarea"
                      :rows="8"
                      placeholder="请输入商户API证书私钥（完整的PEM格式）"
                    />
                  </el-form-item>
                  <el-form-item label="证书序列号">
                    <el-input
                      v-model="wechatPayInfo.serialNo"
                      placeholder="请输入商户API证书序列号"
                    />
                  </el-form-item>
                  <el-form-item label="微信公钥内容">
                    <el-input
                      v-model="wechatPayInfo.wxPublicKeyContent"
                      type="textarea"
                      :rows="8"
                      placeholder="请输入微信支付平台公钥内容（完整的PEM格式）"
                    />
                  </el-form-item>
                  <el-form-item label="微信公钥ID">
                    <el-input
                      v-model="wechatPayInfo.wxPublicKeyID"
                      placeholder="请输入微信支付平台公钥ID"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="wechatPayInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="易支付v1配置" name="mpay">
              <div class="form">
                <el-form
                  :model="mpayInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="密钥(Key)">
                    <el-input
                      v-model="mpayInfo.key"
                      type="password"
                      show-password
                      placeholder="请输入易支付密钥"
                    />
                    <div class="form-help">
                      易支付平台提供的API密钥，用于接口调用验证
                    </div>
                  </el-form-item>
                  <el-form-item label="商户ID(PID)">
                    <el-input
                      v-model="mpayInfo.pid"
                      placeholder="请输入易支付商户ID"
                    />
                    <div class="form-help">易支付平台分配的唯一商户标识符</div>
                  </el-form-item>
                  <el-form-item label="支付类型(Type)">
                    <el-select
                      v-model="mpayInfo.type"
                      placeholder="请选择支付类型"
                      style="width: 100%"
                    >
                      <el-option label="微信支付" value="wxpay"></el-option>
                      <el-option label="支付宝支付" value="alipay"></el-option>
                    </el-select>
                    <div class="form-help">
                      选择易支付平台支持的支付方式，只能选择其中一种
                    </div>
                  </el-form-item>
                  <el-form-item label="API地址(URL)">
                    <el-input
                      v-model="mpayInfo.url"
                      placeholder="请输入易支付API地址"
                    />
                    <div class="form-help">
                      易支付平台的API接口地址，通常以https://开头，mapi.php结尾
                    </div>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="mpayInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="虎皮椒支付配置" name="hupi">
              <div class="form">
                <el-form
                  :model="hupiInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="支付方式(Method)">
                    <el-select
                      v-model="hupiInfo.method"
                      placeholder="请选择支付方式"
                      style="width: 100%"
                    >
                      <el-option label="微信支付(wechat)" value="wechat" />
                      <el-option label="支付宝(alipay)" value="alipay" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="应用ID(AppId)">
                    <el-input
                      v-model="hupiInfo.app_id"
                      placeholder="请输入虎皮椒应用ID"
                    />
                  </el-form-item>
                  <el-form-item label="应用密钥(AppSecret)">
                    <el-input
                      v-model="hupiInfo.app_secret"
                      type="password"
                      show-password
                      placeholder="请输入虎皮椒应用密钥"
                    />
                  </el-form-item>
                  <el-form-item label="支付网关(Host)">
                    <el-input
                      v-model="hupiInfo.host"
                      placeholder="请输入虎皮椒支付网关地址"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="hupiInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style lang="less" scoped>
.webset_container {
  min-height: 100vh;
  padding: 10px;
  background-color: #f7f7f7;

  .cont {
    width: 100%;
    height: 100%;
    padding: 20px;
    background: #fff;
    box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
    border-radius: 8px;

    .setting-tabs {
      &.main-tabs {
        :deep(.el-tabs__header) {
          margin-bottom: 24px;
        }

        :deep(.el-tabs__nav-wrap::after) {
          height: 1px;
        }

        :deep(.el-tabs__item) {
          font-size: 16px;
          padding: 0 32px;
          height: 44px;
          line-height: 44px;
          font-weight: 500;

          &.is-active {
            font-weight: 600;
            color: #409eff;
          }
        }
      }

      &.sub-tabs {
        margin-top: 16px;

        :deep(.el-tabs__header) {
          margin-bottom: 20px;
          background-color: #f8f9fa;
          border-radius: 6px;
          padding: 4px;
        }

        :deep(.el-tabs__nav-wrap) {
          &::after {
            display: none;
          }
        }

        :deep(.el-tabs__nav) {
          border: none;
        }

        :deep(.el-tabs__item) {
          font-size: 14px;
          padding: 0 20px;
          height: 36px;
          line-height: 36px;
          border-radius: 4px;
          margin: 0 2px;
          transition: all 0.3s;
          color: #606266;

          &:hover {
            background-color: #e6f7ff;
            color: #409eff;
          }

          &.is-active {
            background-color: #409eff;
            color: #fff;
            font-weight: 500;
          }
        }

        :deep(.el-tabs__active-bar) {
          display: none;
        }
      }
    }

    .form {
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

      .form-help-inline {
        margin-left: 12px;
        font-size: 13px;
        color: #909399;
      }

      // 验证码配置样式
      .captcha-type-group,
      .captcha-difficulty-group {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        :deep(.el-radio) {
          margin-right: 0;
          padding: 12px 20px;
          height: auto;

          .el-radio__label {
            padding-left: 8px;
          }

          .radio-content {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .radio-title {
              font-weight: 500;
              color: #303133;
            }

            .radio-desc {
              font-size: 12px;
              color: #909399;
            }
          }

          &.is-checked {
            .radio-title {
              color: #409eff;
            }
          }
        }
      }

      .captcha-rules-card {
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
        border: 1px solid #e4e7ed;

        .rules-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-weight: 500;
          color: #303133;

          .rules-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            background: #409eff;
            color: #fff;
            border-radius: 50%;
            font-size: 12px;
            font-style: normal;
          }
        }

        .rules-content {
          background: #fff;
          border-radius: 6px;
          padding: 12px;

          .rule-row {
            display: flex;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px dashed #ebeef5;

            &:last-child {
              border-bottom: none;
            }

            .rule-label {
              width: 80px;
              font-size: 13px;
              color: #606266;
              flex-shrink: 0;
            }

            .rule-value {
              display: flex;
              align-items: center;
              gap: 8px;
              flex-wrap: wrap;

              .el-tag {
                border-radius: 4px;
              }

              .rule-example {
                font-size: 12px;
                color: #909399;
                margin-left: 4px;

                &::before {
                  content: '|';
                  margin-right: 8px;
                  color: #dcdfe6;
                }
              }
            }
          }

          .rule-note {
            margin-top: 8px;
            padding-top: 8px;
            font-size: 12px;
            color: #909399;
            border-top: 1px solid #ebeef5;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .webset_container {
    .cont {
      .form {
        width: 100%;
      }
    }
  }
}

.top-api-list {
  margin-top: 24px;

  .list-header {
    margin-bottom: 16px;

    h3 {
      font-size: 16px;
      font-weight: 500;
      color: #1f2937;
      margin: 0;
    }
  }
}

.search-input-group {
  display: flex;
  gap: 12px;
  align-items: flex-start;

  .search-input {
    flex: 1;
  }

  .el-button {
    margin-top: 1px;
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

  .el-form-item {
    margin-bottom: 20px;
  }

  .el-textarea {
    width: 100%;
  }
}

.about-form {
  :deep(.el-divider) {
    margin: 24px 0 16px 0;

    .el-divider__text {
      font-size: 16px;
      font-weight: 500;
      color: #1f2937;
    }
  }

  :deep(.el-textarea__inner) {
    font-family: inherit;
    line-height: 1.6;
  }

  .array-item {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    background-color: #f9fafb;

    .array-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;

      span {
        font-weight: 500;
        color: #374151;
      }
    }
  }

  .event-item {
    margin-bottom: 12px;

    .event-input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-input {
        flex: 1;
      }

      .event-delete-btn {
        flex-shrink: 0;
        margin-left: 8px;
      }
    }

    .event-actions {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
  }

  .label-with-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    span {
      font-weight: 500;
      color: #374151;
    }

    .el-button {
      font-size: 12px;
      padding: 0;
      margin: 0;
    }
  }
}
</style>
