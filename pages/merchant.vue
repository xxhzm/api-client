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

const form = reactive({
  name: '',
  enterprise_name: '',
  credit_code: '',
  contact: '',
  phone: '',
  email: '',
  description: '',
})

const formRef = ref(null)

const rules = reactive({
  name: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: ['blur', 'change'],
    },
  ],
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
    apiBodyValue.append('ceditCode', form.credit_code)
    apiBodyValue.append('contactName', form.contact)
    apiBodyValue.append('contactPhone', form.phone)
    apiBodyValue.append('contactEmail', form.email)
    apiBodyValue.append('cooperationIntent', form.description)

    const res = await $myFetch('MerchantCreate', {
      method: 'POST',
      body: apiBodyValue,
    })

    if (res.code === 200) {
      ElMessage.success({
        message: res.msg || '申请提交成功！我们的商务经理将尽快联系您。',
        duration: 3000,
      })
      // 重置表单
      form.name = ''
      form.enterprise_name = ''
      form.credit_code = ''
      form.contact = ''
      form.phone = ''
      form.email = ''
      form.description = ''
    } else {
      ElMessage.error(res.msg || '提交失败，请稍后重试')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
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
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
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
