<script setup>
import {
  TrendCharts,
  Money,
  Shop,
  Service,
  ArrowRight,
  Check,
  DataLine,
  UserFilled,
  Timer,
  Link,
  OfficeBuilding,
} from '@element-plus/icons-vue'

const { $myFetch } = useNuxtApp()
const options = useState('options')

useHead({
  title: '合作伙伴计划 - ' + (options.value?.title || 'API开放平台'),
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    {
      name: 'description',
      content:
        '加入' +
        (options.value?.website_name || '平台') +
        '合作伙伴计划，共建开放生态，共享技术红利。',
    },
    { name: 'keywords', content: 'API变现,商户入驻,开发者生态,技术合作伙伴' },
  ],
  style: [
    {
      children: options.value?.css || '',
    },
  ],
})

const stats = [
  { value: '500+', label: '入驻商户', icon: UserFilled },
  { value: '百万+', label: '日均调用', icon: DataLine },
  { value: '99.99%', label: '服务可用性', icon: Timer },
]

const benefits = [
  {
    title: '精准流量分发',
    description:
      '依托平台强大的开发者社区，通过智能推荐算法，将您的 API 精准推送给有需求的目标用户，实现高效获客。',
    icon: TrendCharts,
    color: '#3b82f6',
  },
  {
    title: '极具竞争力的收益',
    description:
      '提供行业领先的分成比例（最高可达 80%），支持灵活的定价策略（按次、包月、阶梯计费），结算周期短。',
    icon: Money,
    color: '#10b981',
  },
  {
    title: '企业级技术支持',
    description:
      '提供标准化的接入网关、完善的 SDK 工具包以及可视化的调试工具，大幅降低接入成本。',
    icon: Shop,
    color: '#8b5cf6',
  },
  {
    title: '全链路安全防护',
    description:
      '集成 WAF 防火墙、DDoS 防护、请求签名验证等多重安全机制，保障您的接口与数据资产安全无忧。',
    icon: Service,
    color: '#f59e0b',
  },
]

const processSteps = [
  {
    num: '01',
    title: '提交入驻申请',
    desc: '填写企业/个人基本信息及合作意向，提交相关资质证明。',
  },
  {
    num: '02',
    title: '平台资质审核',
    desc: '商务团队将在 1-3 个工作日内完成审核并与您取得联系。',
  },
  {
    num: '03',
    title: '接口技术对接',
    desc: '获取商户 Key，参照开发文档完成接口配置与联调测试。',
  },
  {
    num: '04',
    title: '上架发布变现',
    desc: '设置计费规则，正式发布至 API 市场，查看实时收益报表。',
  },
]

// 战略合作伙伴列表
const merchantList = ref([])
const merchantLoading = ref(false)
const merchantPagination = reactive({
  page: 1,
  total: 0,
  page_size: 6,
})

// 获取战略合作伙伴列表
const getMerchantList = async () => {
  merchantLoading.value = true
  try {
    const res = await $myFetch('MerchantDisplayList', {
      method: 'GET',
      params: {
        page: merchantPagination.page,
      },
    })
    if (res.code === 200 && res.data) {
      merchantList.value = res.data.list || []
      merchantPagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取合作伙伴列表失败:', error)
  } finally {
    merchantLoading.value = false
  }
}

// 分页切换
const handleMerchantPageChange = (page) => {
  merchantPagination.page = page
  getMerchantList()
}

// 格式化日期（时间戳转 YYYY-MM 格式）
const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const form = reactive({
  name: '',
  enterprise_name: '',
  credit_code: '',
  contact: '',
  phone: '',
  email: '',
  description: '',
  captcha: '',
})

const formRef = ref(null)

// 统一社会信用代码校验（18位）
const validateCreditCode = (rule, value, callback) => {
  if (!value) {
    callback() // 非必填，为空时通过
    return
  }
  // 18位，由数字和大写字母组成（不含I、O、Z、S、V）
  const creditCodeReg = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/
  if (!creditCodeReg.test(value)) {
    callback(new Error('请输入正确的18位统一社会信用代码'))
  } else {
    callback()
  }
}

// 手机号码校验
const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入联系电话'))
    return
  }
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(value)) {
    callback(new Error('请输入正确的11位手机号码'))
  } else {
    callback()
  }
}

// 商户名称校验
const validateName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入商户名称'))
    return
  }
  if (value.length < 2 || value.length > 50) {
    callback(new Error('商户名称长度为2-50个字符'))
  } else if (/[<>'"&\\\/]/.test(value)) {
    callback(new Error('商户名称不能包含特殊字符'))
  } else {
    callback()
  }
}

// 联系人校验
const validateContact = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入联系人'))
    return
  }
  if (value.length < 2 || value.length > 20) {
    callback(new Error('联系人姓名长度为2-20个字符'))
  } else {
    callback()
  }
}

// 企业名称校验
const validateEnterpriseName = (rule, value, callback) => {
  if (!value) {
    callback() // 非必填，为空时通过
    return
  }
  if (value.length < 4 || value.length > 100) {
    callback(new Error('企业名称长度为4-100个字符'))
  } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9（）()]+$/.test(value)) {
    callback(new Error('企业名称只能包含中文、字母、数字和括号'))
  } else {
    callback()
  }
}

const rules = reactive({
  name: [{ required: true, validator: validateName, trigger: 'blur' }],
  enterprise_name: [{ validator: validateEnterpriseName, trigger: 'blur' }],
  credit_code: [{ validator: validateCreditCode, trigger: 'blur' }],
  contact: [{ required: true, validator: validateContact, trigger: 'blur' }],
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: ['blur', 'change'],
    },
  ],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
})

// 图片验证码
const captchaInfo = ref({
  id: '',
  url: '',
})

// 获取图片验证码
const getCaptchaInfo = async () => {
  const res = await $myFetch('Captcha', {
    method: 'GET',
  })
  if (res.data) {
    captchaInfo.value = res.data
  }
}

// 页面加载时获取验证码和合作伙伴列表
onMounted(() => {
  getCaptchaInfo()
  getMerchantList()
})

const loading = ref(false)

const submitForm = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch (error) {
    ElMessage.warning('请填写必填项')
    return
  }

  loading.value = true
  try {
    const apiBodyValue = new URLSearchParams()
    apiBodyValue.append('merchantName', form.name)
    apiBodyValue.append('companyName', form.enterprise_name)
    apiBodyValue.append('creditCode', form.credit_code)
    apiBodyValue.append('contactName', form.contact)
    apiBodyValue.append('contactPhone', form.phone)
    apiBodyValue.append('contactEmail', form.email)
    apiBodyValue.append('description', form.description)
    apiBodyValue.append('captchaId', captchaInfo.value.id)
    apiBodyValue.append('captchaKey', form.captcha)

    const res = await $myFetch('CreateMerchant', {
      method: 'POST',
      body: apiBodyValue,
    })

    if (res.code === 200) {
      // 重置表单
      form.name = ''
      form.enterprise_name = ''
      form.credit_code = ''
      form.contact = ''
      form.phone = ''
      form.email = ''
      form.description = ''
      form.captcha = ''
      getCaptchaInfo()

      // 显示成功提示弹窗
      ElMessageBox.alert(
        `<div style="text-align: center; padding: 10px 0;">
          <div style="font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">申请提交成功！</div>
          <div style="font-size: 14px; color: #64748b; line-height: 1.8;">
            感谢您的信任与支持！<br/>
            我们的商务经理将在 <strong style="color: #2563eb;">1-3 个工作日</strong> 内与您取得联系，<br/>
            请保持电话畅通。
          </div>
        </div>`,
        '提交成功',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '我知道了',
          center: true,
          customClass: 'merchant-success-dialog',
        }
      )
    } else {
      ElMessage.error(res.msg || '提交失败，请稍后重试')
      // 验证码错误时刷新验证码
      form.captcha = ''
      getCaptchaInfo()
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
    form.captcha = ''
    getCaptchaInfo()
  } finally {
    loading.value = false
  }
}

const scrollToForm = () => {
  const element = document.getElementById('apply-form')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="merchant-page">
    <IndexNavbar></IndexNavbar>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg-pattern"></div>
      <div class="container hero-container">
        <div class="hero-content">
          <div class="badge"><span class="badge-dot"></span> 招募合作伙伴</div>
          <h1 class="hero-title">
            将您的数据价值 <br />
            <span class="text-gradient">转化为商业收益</span>
          </h1>
          <p class="hero-subtitle">
            加入
            {{ options?.website_name }}
            开放平台，连接百万开发者。我们提供全方位的技术支持与商业化解决方案，助您轻松构建
            API 经济。
          </p>
          <div class="hero-actions">
            <el-button
              type="primary"
              size="large"
              class="cta-btn primary"
              @click="scrollToForm"
            >
              立即申请入驻 <el-icon class="ml-2"><ArrowRight /></el-icon>
            </el-button>
            <el-button
              size="large"
              class="cta-btn secondary"
              @click="scrollToForm"
            >
              查看接入文档
            </el-button>
          </div>

          <div class="hero-stats">
            <div v-for="(stat, index) in stats" :key="index" class="stat-item">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">
                <el-icon class="mr-1"><component :is="stat.icon" /></el-icon>
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>
        <div class="hero-image">
          <!-- CSS 绘制的抽象图形，模拟仪表盘/连接图 -->
          <div class="abstract-dashboard">
            <div class="dash-header">
              <div class="dot red"></div>
              <div class="dot yellow"></div>
              <div class="dot green"></div>
            </div>
            <div class="dash-body">
              <div class="chart-area">
                <div class="chart-bar" style="height: 40%"></div>
                <div class="chart-bar" style="height: 60%"></div>
                <div class="chart-bar" style="height: 35%"></div>
                <div class="chart-bar" style="height: 80%"></div>
                <div class="chart-bar active" style="height: 95%"></div>
                <div class="chart-bar" style="height: 50%"></div>
              </div>
              <div class="dash-row">
                <div class="dash-card"></div>
                <div class="dash-card"></div>
              </div>
            </div>
            <div class="floating-card card-1">
              <el-icon><Check /></el-icon> API Connected
            </div>
            <div class="floating-card card-2">
              <span class="income-text">本月收益</span>
              <span class="income-num">¥ 128,450</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="section benefits-section">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">赋能您的业务增长</h2>
          <p class="section-desc">为什么领先的企业选择与我们合作？</p>
        </div>
        <div class="benefits-grid">
          <div
            v-for="(item, index) in benefits"
            :key="index"
            class="benefit-card"
          >
            <div
              class="icon-box"
              :style="{ backgroundColor: `${item.color}15`, color: item.color }"
            >
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <h3 class="benefit-title">{{ item.title }}</h3>
            <p class="benefit-desc">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Merchants Section -->
    <section class="section merchants-section">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">战略合作伙伴</h2>
          <p class="section-desc">携手行业领先企业，共建可信赖的数据服务生态</p>
        </div>
        <div class="merchants-container" v-loading="merchantLoading">
          <div class="merchants-grid" v-if="merchantList.length > 0">
            <div
              v-for="(merchant, index) in merchantList"
              :key="merchant.id || index"
              class="merchant-card"
            >
              <div class="card-header">
                <div class="merchant-logo">
                  <img
                    v-if="merchant.logo"
                    :src="merchant.logo"
                    :alt="merchant.merchant_name"
                  />
                  <div v-else class="logo-placeholder">
                    {{ merchant.merchant_name?.substring(0, 2) }}
                  </div>
                </div>
                <div class="header-info">
                  <div class="name-row">
                    <h4 class="merchant-name">{{ merchant.merchant_name }}</h4>
                    <span v-if="merchant.is_verified" class="verified-badge">
                      <el-icon><Check /></el-icon>
                      企业认证
                    </span>
                  </div>
                  <p class="merchant-company">{{ merchant.company_name }}</p>
                </div>
              </div>
              <div class="card-body">
                <p class="merchant-desc">{{ merchant.description }}</p>
              </div>
              <div class="card-footer">
                <div class="stat-item">
                  <span class="stat-value">{{ merchant.api_count }}</span>
                  <span class="stat-label">API 服务</span>
                </div>
                <div class="divider"></div>
                <div class="stat-item">
                  <span class="stat-value">{{ merchant.availability }}%</span>
                  <span class="stat-label">服务可用</span>
                </div>
                <div class="divider"></div>
                <div class="stat-item">
                  <span class="stat-value">{{ formatDate(merchant.created_at) }}</span>
                  <span class="stat-label">入驻时间</span>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else-if="!merchantLoading" description="暂无合作伙伴" />
          <!-- 分页 -->
          <div class="merchants-pagination" v-if="merchantPagination.total > merchantPagination.page_size">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="merchantPagination.total"
              :page-size="merchantPagination.page_size"
              :current-page="merchantPagination.page"
              @current-change="handleMerchantPageChange"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Process Section -->
    <section class="section process-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">简单的接入流程</h2>
          <p class="section-desc">标准化流程，最快 24 小时内完成上线</p>
        </div>
        <div class="process-timeline">
          <div class="timeline-line"></div>
          <div
            v-for="(step, index) in processSteps"
            :key="index"
            class="process-step"
          >
            <div class="step-marker">{{ step.num }}</div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Form Section -->
    <section class="section form-section" id="apply-form">
      <div class="container">
        <div class="form-container-box">
          <div class="form-left">
            <h3>准备好开始了吗？</h3>
            <p>填写右侧表单，开启您的 API 商业化之旅。</p>
            <ul class="check-list">
              <li>
                <el-icon><Check /></el-icon> 专属商务经理 1v1 对接
              </li>
              <li>
                <el-icon><Check /></el-icon> 免费的技术咨询与方案设计
              </li>
              <li>
                <el-icon><Check /></el-icon> 优先获得平台流量扶持
              </li>
            </ul>
            <div class="support-contact">
              <p>有问题？直接联系我们</p>
              <a
                :href="`mailto:${options?.contact_email}`"
                class="email-link"
                >{{ options?.contact_email }}</a
              >
            </div>
          </div>
          <div class="form-right">
            <el-form
              :model="form"
              :rules="rules"
              ref="formRef"
              label-position="top"
              class="business-form"
            >
              <div class="form-row">
                <el-form-item label="商户名称" prop="name" class="flex-1">
                  <el-input v-model="form.name" placeholder="请输入完整名称" />
                </el-form-item>
              </div>
              <div class="form-row two-cols">
                <el-form-item label="企业名称" prop="enterprise_name">
                  <el-input
                    v-model="form.enterprise_name"
                    placeholder="请输入营业执照上的企业名称"
                  />
                </el-form-item>
                <el-form-item label="统一社会信用代码" prop="credit_code">
                  <el-input
                    v-model="form.credit_code"
                    placeholder="请输入18位信用代码"
                  />
                </el-form-item>
              </div>
              <div class="form-row two-cols">
                <el-form-item label="联系人" prop="contact">
                  <el-input v-model="form.contact" placeholder="怎么称呼您" />
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                  <el-input v-model="form.phone" placeholder="手机号码" />
                </el-form-item>
              </div>
              <el-form-item label="电子邮箱" prop="email">
                <el-input v-model="form.email" placeholder="接收审核通知" />
              </el-form-item>
              <el-form-item label="合作意向" prop="description">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="4"
                  placeholder="简单描述您的 API 资源或合作想法..."
                />
              </el-form-item>
              <el-form-item label="验证码" prop="captcha">
                <div class="captcha-wrapper">
                  <el-input
                    v-model="form.captcha"
                    placeholder="请输入验证码"
                    @keyup.enter="submitForm"
                  />
                  <img
                    :src="captchaInfo.url"
                    alt="验证码"
                    class="captcha-img"
                    title="点击刷新验证码"
                    @click="getCaptchaInfo()"
                  />
                </div>
              </el-form-item>
              <el-button
                type="primary"
                class="submit-btn"
                @click="submitForm"
                :loading="loading"
              >
                提交申请
              </el-button>
              <p class="privacy-tip">
                提交即代表您同意我们的 <a href="privacy">隐私政策</a>
              </p>
            </el-form>
          </div>
        </div>
      </div>
    </section>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style scoped lang="less">
/* Global Reset & Fonts */
.merchant-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    sans-serif;
  color: #1e293b;
  background-color: #ffffff;
  overflow-x: hidden;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.text-gradient {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: 120px 0 100px;
  background-color: #f8fafc;
  overflow: hidden;

  .hero-bg-pattern {
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: 0.5;
    z-index: 0;
    mask-image: linear-gradient(to left, black, transparent);
  }

  .hero-container {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 60px;
  }

  .hero-content {
    flex: 1;
    max-width: 600px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    background-color: #eff6ff;
    color: #2563eb;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 24px;

    .badge-dot {
      width: 6px;
      height: 6px;
      background-color: #2563eb;
      border-radius: 50%;
      margin-right: 8px;
    }
  }

  .hero-title {
    font-size: 56px;
    line-height: 1.1;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 24px;
    color: #0f172a;
  }

  .hero-subtitle {
    font-size: 20px;
    line-height: 1.6;
    color: #64748b;
    margin-bottom: 40px;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 60px;

    .cta-btn {
      height: 56px;
      padding: 0 32px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;

      &.primary {
        background-color: #0f172a;
        border: none;
        &:hover {
          background-color: #1e293b;
        }
      }

      &.secondary {
        background-color: white;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        &:hover {
          background-color: #f1f5f9;
        }
      }
    }
  }

  .hero-stats {
    display: flex;
    gap: 48px;
    padding-top: 32px;
    border-top: 1px solid #e2e8f0;

    .stat-item {
      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 4px;
      }
      .stat-label {
        font-size: 14px;
        color: #64748b;
        display: flex;
        align-items: center;
      }
    }
  }
}

/* Abstract Dashboard Image */
.hero-image {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
}

.abstract-dashboard {
  width: 100%;
  max-width: 500px;
  height: 400px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .dash-header {
    display: flex;
    gap: 8px;
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      &.red {
        background: #ef4444;
      }
      &.yellow {
        background: #f59e0b;
      }
      &.green {
        background: #22c55e;
      }
    }
  }

  .dash-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .chart-area {
    height: 180px;
    background: #f8fafc;
    border-radius: 8px;
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    padding: 20px 20px 0;
    gap: 10px;

    .chart-bar {
      width: 12%;
      background: #e2e8f0;
      border-radius: 4px 4px 0 0;
      transition: height 0.3s;
      &.active {
        background: #3b82f6;
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
      }
    }
  }

  .dash-row {
    display: flex;
    gap: 16px;
    height: 100px;
    .dash-card {
      flex: 1;
      background: #f1f5f9;
      border-radius: 8px;
    }
  }

  .floating-card {
    position: absolute;
    background: white;
    padding: 12px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    border: 1px solid #f1f5f9;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: float 6s ease-in-out infinite;

    &.card-1 {
      top: 40px;
      right: -30px;
      color: #22c55e;
      .el-icon {
        background: #dcfce7;
        padding: 4px;
        border-radius: 50%;
      }
    }

    &.card-2 {
      bottom: 60px;
      left: -40px;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      animation-delay: 2s;
      .income-text {
        font-size: 12px;
        color: #64748b;
        font-weight: 400;
      }
      .income-num {
        font-size: 18px;
        color: #0f172a;
      }
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Sections */
.section {
  padding: 100px 0;

  .section-header {
    margin-bottom: 60px;
    &.text-center {
      text-align: center;
    }

    .section-title {
      font-size: 36px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .section-desc {
      font-size: 18px;
      color: #64748b;
    }
  }
}

/* Benefits Grid */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;

  .benefit-card {
    padding: 32px;
    background: white;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
      border-color: transparent;
    }

    .icon-box {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 24px;
    }

    .benefit-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .benefit-desc {
      font-size: 15px;
      line-height: 1.6;
      color: #64748b;
    }
  }
}

/* Merchants Section */
.merchants-section {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);

  .merchants-container {
    min-height: 200px;
  }

  .merchants-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }

  .merchants-pagination {
    display: flex;
    justify-content: center;
    margin-top: 40px;
  }

  .merchant-card {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.12);
      border-color: #cbd5e1;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 24px 24px 16px;
      border-bottom: 1px solid #f1f5f9;
    }

    .merchant-logo {
      width: 56px;
      height: 56px;
      border-radius: 10px;
      overflow: hidden;
      flex-shrink: 0;
      background: #f1f5f9;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .logo-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
        color: white;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 1px;
      }
    }

    .header-info {
      flex: 1;
      min-width: 0;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .merchant-name {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .verified-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 8px;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      flex-shrink: 0;

      .el-icon {
        font-size: 10px;
      }
    }

    .merchant-company {
      font-size: 13px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-body {
      padding: 16px 24px 20px;
    }

    .merchant-desc {
      font-size: 14px;
      color: #475569;
      line-height: 1.7;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 16px 24px;
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }

      .stat-value {
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
      }

      .stat-label {
        font-size: 12px;
        color: #94a3b8;
      }

      .divider {
        width: 1px;
        height: 32px;
        background: #e2e8f0;
      }
    }
  }
}

/* Process Timeline */
.process-section {
  background-color: #f8fafc;
}

.process-timeline {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  padding-top: 40px;

  .timeline-line {
    position: absolute;
    top: 56px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #e2e8f0;
    z-index: 0;
  }

  .process-step {
    position: relative;
    z-index: 1;

    .step-marker {
      width: 32px;
      height: 32px;
      background: #0f172a;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 24px;
      border: 4px solid #f8fafc;
    }

    .step-content {
      h3 {
        font-size: 18px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 8px;
      }
      p {
        font-size: 14px;
        color: #64748b;
        line-height: 1.6;
      }
    }
  }
}

/* Form Section */
.form-section {
  background: white;

  .form-container-box {
    display: flex;
    background: #0f172a;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
  }

  .form-left {
    flex: 1;
    padding: 60px;
    color: white;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);

    h3 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    p {
      color: #94a3b8;
      font-size: 16px;
      margin-bottom: 40px;
    }

    .check-list {
      list-style: none;
      padding: 0;
      margin-bottom: 60px;

      li {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        font-size: 16px;
        color: #e2e8f0;

        .el-icon {
          color: #3b82f6;
        }
      }
    }

    .support-contact {
      border-top: 1px solid #334155;
      padding-top: 30px;
      p {
        margin-bottom: 8px;
        font-size: 14px;
      }
      .email-link {
        color: white;
        font-weight: 600;
        text-decoration: none;
        font-size: 18px;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .form-right {
    flex: 1.2;
    padding: 60px;
    background: white;

    .business-form {
      .form-row {
        display: flex;
        gap: 20px;
        &.two-cols {
          .el-form-item {
            flex: 1;
          }
        }
      }

      :deep(.el-form-item__label) {
        font-weight: 600;
        color: #334155;
      }

      :deep(.el-input__wrapper),
      :deep(.el-textarea__inner) {
        box-shadow: none;
        background-color: #f1f5f9;
        border: 1px solid transparent;
        border-radius: 8px;
        padding: 8px 12px;
        transition: all 0.2s;

        &:hover {
          background-color: #e2e8f0;
        }

        &.is-focus {
          background-color: white;
          border-color: #0f172a;
          box-shadow: 0 0 0 1px #0f172a inset;
        }
      }

      :deep(.el-textarea__inner) {
        padding: 12px;
      }

      .captcha-wrapper {
        display: flex;
        gap: 12px;
        width: 100%;

        .el-input {
          flex: 1;
        }

        .captcha-img {
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.2s;

          &:hover {
            opacity: 0.8;
          }
        }
      }

      .submit-btn {
        width: 100%;
        height: 50px;
        background-color: #0f172a;
        border-color: #0f172a;
        font-weight: 600;
        font-size: 16px;
        margin-top: 20px;
        border-radius: 8px;

        &:hover {
          background-color: #1e293b;
        }
      }

      .privacy-tip {
        text-align: center;
        margin-top: 16px;
        font-size: 13px;
        color: #94a3b8;
        a {
          color: #0f172a;
          text-decoration: underline;
        }
      }
    }
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-container {
    flex-direction: column;
    text-align: center;
  }

  .hero-content {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .benefits-grid,
  .process-timeline {
    grid-template-columns: repeat(2, 1fr);
  }

  .merchants-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 20px !important;
  }

  .timeline-line {
    display: none;
  }

  .form-container-box {
    flex-direction: column;
  }

  .form-left,
  .form-right {
    padding: 40px;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 40px;
  }

  .benefits-grid,
  .process-timeline {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .merchants-grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }

  .merchant-card {
    .card-header {
      padding: 20px 20px 14px !important;
    }

    .card-body {
      padding: 14px 20px 16px !important;
    }

    .card-footer {
      padding: 14px 16px !important;

      .stat-value {
        font-size: 14px !important;
      }

      .stat-label {
        font-size: 11px !important;
      }
    }

    .merchant-logo {
      width: 48px !important;
      height: 48px !important;

      .logo-placeholder {
        font-size: 16px !important;
      }
    }

    .merchant-name {
      font-size: 15px !important;
    }

    .verified-badge {
      font-size: 10px !important;
      padding: 2px 6px !important;
    }
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
    .cta-btn {
      width: 100%;
    }
  }
}
</style>

<style lang="less">
/* 商户申请成功弹窗样式 */
.merchant-success-dialog {
  border-radius: 16px !important;
  overflow: hidden;

  .el-message-box__header {
    padding: 20px 20px 0;

    .el-message-box__title {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }
  }

  .el-message-box__content {
    padding: 20px 30px 10px;
  }

  .el-message-box__btns {
    padding: 10px 30px 24px;

    .el-button--primary {
      width: 120px;
      height: 40px;
      background: #0f172a;
      border-color: #0f172a;
      border-radius: 8px;
      font-weight: 600;

      &:hover {
        background: #1e293b;
        border-color: #1e293b;
      }
    }
  }
}
</style>
