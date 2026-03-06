<script setup>
import {
  Document,
  User,
  Service,
  Timer,
  Message,
  Phone,
  Location,
} from '@element-plus/icons-vue'

const options = useState('options')

useHead({
  title: '服务条款' + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    {
      name: 'description',
      content: options.value.website_name + ' - 服务条款',
    },
    {
      name: 'keywords',
      content: '服务条款,用户协议,API服务,使用条款',
    },
  ],
  style: [
    {
      children: options.value.css,
    },
  ],
})

const termsData = ref([
  {
    id: 'service-description',
    title: '服务说明',
    color: '#3b82f6',
    content: `
      <p>本平台是一个专业的API服务平台，致力于为开发者提供高质量、稳定可靠的API接口服务。我们提供的服务包括但不限于：</p>
      <ul class="bullet-list">
        <li>免费和付费API接口服务</li>
        <li>API文档和技术支持</li>
        <li>开发者工具和SDK</li>
        <li>数据分析和统计服务</li>
        <li>技术咨询和定制开发</li>
      </ul>
      <p>通过使用我们的服务，您同意遵守本服务条款的所有规定。</p>
    `,
  },
  {
    id: 'user-agreement',
    title: '用户协议',
    color: '#10b981',
    content: `
      <p>在使用本平台服务前，请仔细阅读并理解以下用户协议：</p>
      <ol class="numbered-list">
        <li><span class="highlight">账户注册</span>：用户需提供真实、准确的注册信息，并对账户安全负责。</li>
        <li><span class="highlight">使用规范</span>：用户应合法、合理地使用API服务，不得进行恶意攻击或滥用。</li>
        <li><span class="highlight">内容责任</span>：用户对通过API获取或提交的数据内容承担全部责任。</li>
        <li><span class="highlight">知识产权</span>：尊重平台及第三方的知识产权，不得侵犯相关权益。</li>
        <li><span class="highlight">禁止行为</span>：禁止进行任何可能损害平台或其他用户利益的行为。</li>
      </ol>
    `,
  },
  {
    id: 'api-usage',
    title: 'API使用条款',
    color: '#8b5cf6',
    content: `
      <p>使用我们的API服务时，您需要遵守以下条款：</p>
      <div class="terms-subsection">
        <h4>调用限制</h4>
        <ul class="bullet-list">
          <li>免费用户每日调用次数有限制，具体限制请查看相关API文档</li>
          <li>付费用户根据套餐享有不同的调用额度</li>
          <li>超出限制的调用可能被暂停或收取额外费用</li>
        </ul>
      </div>
      <div class="terms-subsection">
        <h4>数据使用</h4>
        <ul class="bullet-list">
          <li>API返回的数据仅供合法用途使用</li>
          <li>不得将数据用于违法、有害或侵犯他人权益的活动</li>
          <li>商业使用需遵守相应的商业许可条款</li>
        </ul>
      </div>
      <div class="terms-subsection">
        <h4>技术要求</h4>
        <ul class="bullet-list">
          <li>使用标准的HTTP/HTTPS协议进行API调用</li>
          <li>正确处理API返回的错误码和异常情况</li>
          <li>实施适当的缓存策略以减少不必要的API调用</li>
        </ul>
      </div>
    `,
  },
  {
    id: 'payment-terms',
    title: '付费条款',
    color: '#f59e0b',
    content: `
      <p>对于付费API服务，以下条款适用：</p>
      <ol class="numbered-list">
        <li><span class="highlight">计费方式</span>：根据API调用次数、数据量或订阅周期进行计费。</li>
        <li><span class="highlight">支付方式</span>：支持多种支付方式，包括在线支付、银行转账等。</li>
        <li><span class="highlight">退款政策</span>：在特定条件下提供退款服务，具体政策请查看退款说明。</li>
        <li><span class="highlight">发票服务</span>：可根据用户需求提供正规发票。</li>
        <li><span class="highlight">价格调整</span>：我们保留调整服务价格的权利，但会提前通知用户。</li>
      </ol>
      <p class="notice">注意：付费服务一旦开通，费用将根据实际使用情况扣除，请合理规划使用。</p>
    `,
  },
  {
    id: 'data-security',
    title: '数据安全',
    color: '#10b981',
    content: `
      <p>我们高度重视数据安全，采取以下措施保护用户数据：</p>
      <div class="terms-subsection">
        <h4>技术保障</h4>
        <ul class="bullet-list">
          <li>采用HTTPS加密传输，确保数据传输安全</li>
          <li>实施严格的访问控制和身份验证机制</li>
          <li>定期进行安全审计和漏洞扫描</li>
          <li>建立完善的数据备份和恢复机制</li>
        </ul>
      </div>
      <div class="terms-subsection">
        <h4>隐私保护</h4>
        <ul class="bullet-list">
          <li>严格遵守相关隐私法律法规</li>
          <li>不会未经授权访问或使用用户数据</li>
          <li>实施数据最小化原则，只收集必要的数据</li>
          <li>提供数据删除和修改的权利</li>
        </ul>
      </div>
      <p class="highlight">我们承诺不会将用户数据出售给第三方，仅在法律要求或用户授权的情况下共享数据。</p>
    `,
  },
  {
    id: 'service-availability',
    title: '服务可用性',
    color: '#3b82f6',
    content: `
      <p>我们致力于提供稳定可靠的服务，但需要说明以下情况：</p>
      <ol class="numbered-list">
        <li><span class="highlight">服务时间</span>：我们努力提供7×24小时不间断服务。</li>
        <li><span class="highlight">维护时间</span>：定期维护可能导致短暂的服务中断，我们会提前通知。</li>
        <li><span class="highlight">不可抗力</span>：因自然灾害、网络故障等不可抗力因素导致的服务中断，我们不承担责任。</li>
        <li><span class="highlight">服务升级</span>：为提升服务质量，我们可能对API进行升级，会提前通知并提供迁移指导。</li>
      </ol>
      <p>我们的目标是保持99.9%的服务可用性，如遇到服务问题，请及时联系我们的技术支持团队。</p>
    `,
  },
  {
    id: 'liability-limitation',
    title: '责任限制',
    color: '#ef4444',
    content: `
      <p>在法律允许的最大范围内，我们的责任限制如下：</p>
      <ol class="numbered-list">
        <li><span class="highlight">服务质量</span>：我们尽力提供高质量服务，但不保证服务完全无错误或中断。</li>
        <li><span class="highlight">数据准确性</span>：API返回的数据可能存在延迟或错误，用户应自行验证数据的准确性。</li>
        <li><span class="highlight">间接损失</span>：我们不对因使用服务而产生的间接损失承担责任。</li>
        <li><span class="highlight">第三方服务</span>：对于集成的第三方服务，我们不对其可用性和准确性承担责任。</li>
        <li><span class="highlight">赔偿限额</span>：我们的最大赔偿责任不超过用户支付的服务费用。</li>
      </ol>
      <p class="notice">用户在使用服务时应充分了解相关风险，并采取适当的预防措施。</p>
    `,
  },
  {
    id: 'terms-modification',
    title: '条款修改',
    color: '#8b5cf6',
    content: `
      <p>我们保留修改本服务条款的权利，修改时将遵循以下原则：</p>
      <ul class="bullet-list">
        <li>重大修改将提前30天通过邮件、网站公告等方式通知用户</li>
        <li>轻微修改将在网站上公布，用户继续使用服务即视为同意修改</li>
        <li>用户如不同意修改，可以停止使用服务并注销账户</li>
        <li>修改后的条款将在公布后生效，不具有追溯力</li>
      </ul>
      <p>建议用户定期查看本服务条款，以了解最新的规定和要求。</p>
    `,
  },
])

const contactInfo = ref({
  email: options.value?.contact_email || '',
  phone: options.value?.contact_phone || '',
  address: options.value?.contact_address || '',
  workTime: options.value?.working_hours || '',
})
</script>

<template>
  <div class="terms-page">
    <IndexNavbar></IndexNavbar>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg-pattern"></div>
      <div class="container hero-container">
        <div class="hero-content">
          <div class="badge"><span class="badge-dot"></span> 法律条款</div>
          <h1 class="hero-title">服务条款</h1>
          <p class="hero-subtitle">
            欢迎使用我们的API服务平台。在使用我们的服务之前，请仔细阅读并理解以下服务条款。
            这些条款构成您与我们之间的法律协议，使用我们的服务即表示您同意遵守这些条款。
          </p>
          <div class="update-time">
            <el-icon><Timer /></el-icon>
            最后更新时间：{{ new Date().toLocaleDateString('zh-CN') }}
          </div>
        </div>
      </div>
    </section>

    <!-- Terms Content -->
    <section class="section terms-list-section">
      <div class="container">
        <div class="terms-layout">
          <!-- Sidebar Nav -->
          <aside class="terms-nav">
            <div class="nav-sticky">
              <h3 class="nav-title">目录</h3>
              <a
                v-for="(term, index) in termsData"
                :key="term.id"
                :href="`#${term.id}`"
                class="nav-item"
              >
                <span class="nav-num">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="nav-text">{{ term.title }}</span>
              </a>
            </div>
          </aside>

          <!-- Main Content -->
          <div class="terms-main">
            <div
              v-for="(term, index) in termsData"
              :key="term.id"
              :id="term.id"
              class="terms-block"
            >
              <div class="block-header">
                <div class="block-num">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="block-meta">
                  <h2>{{ term.title }}</h2>
                  <div class="block-divider" :style="{ backgroundColor: term.color }"></div>
                </div>
              </div>
              <div class="block-body" v-html="term.content"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Important Notice -->
    <section class="section notice-section">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">重要提醒</h2>
          <p class="section-desc">请在使用服务前务必了解以下事项</p>
        </div>
        <div class="notice-grid">
          <div class="notice-card">
            <div class="icon-box" style="background-color: #fef3c715; color: #f59e0b;">
              <el-icon><Document /></el-icon>
            </div>
            <h3>法律效力</h3>
            <p>本服务条款具有法律约束力，请在使用服务前仔细阅读。</p>
          </div>
          <div class="notice-card">
            <div class="icon-box" style="background-color: #fef3c715; color: #f59e0b;">
              <el-icon><User /></el-icon>
            </div>
            <h3>用户责任</h3>
            <p>用户应对自己的行为负责，遵守相关法律法规。</p>
          </div>
          <div class="notice-card">
            <div class="icon-box" style="background-color: #fef3c715; color: #f59e0b;">
              <el-icon><Service /></el-icon>
            </div>
            <h3>服务变更</h3>
            <p>我们可能会根据业务需要调整服务内容和条款。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="section contact-section">
      <div class="container">
        <div class="contact-bar">
          <div class="contact-left">
            <h3>对条款有疑问？</h3>
            <p>如果您对服务条款有任何疑问，请通过以下方式联系我们，我们将尽快为您解答。</p>
          </div>
          <div class="contact-right">
            <div class="contact-item" v-if="contactInfo.email">
              <el-icon><Message /></el-icon>
              <div>
                <span class="label">邮箱</span>
                <a :href="`mailto:${contactInfo.email}`">{{ contactInfo.email }}</a>
              </div>
            </div>
            <div class="contact-item" v-if="contactInfo.phone">
              <el-icon><Phone /></el-icon>
              <div>
                <span class="label">电话</span>
                <span>{{ contactInfo.phone }}</span>
              </div>
            </div>
            <div class="contact-item" v-if="contactInfo.address">
              <el-icon><Location /></el-icon>
              <div>
                <span class="label">地址</span>
                <span>{{ contactInfo.address }}</span>
              </div>
            </div>
            <div class="contact-item" v-if="contactInfo.workTime">
              <el-icon><Timer /></el-icon>
              <div>
                <span class="label">工作时间</span>
                <span>{{ contactInfo.workTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less" scoped>
.terms-page {
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

/* Hero Section */
.hero-section {
  position: relative;
  padding: 120px 0 80px;
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
  }

  .hero-content {
    max-width: 800px;
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
    font-size: 48px;
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 20px;
    color: #0f172a;
  }

  .hero-subtitle {
    font-size: 17px;
    line-height: 1.8;
    color: #64748b;
    margin-bottom: 24px;
  }

  .update-time {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: white;
    border-radius: 8px;
    font-size: 14px;
    color: #64748b;
    border: 1px solid #e2e8f0;

    .el-icon {
      font-size: 16px;
      color: #3b82f6;
    }
  }
}

/* Sections */
.section {
  padding: 80px 0;

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

/* Terms List */
.terms-list-section {
  padding-top: 60px;
  background: #f8fafc;

  .terms-layout {
    display: flex;
    gap: 48px;
    align-items: flex-start;
  }

  .terms-nav {
    width: 240px;
    flex-shrink: 0;

    .nav-sticky {
      position: sticky;
      top: 100px;
    }

    .nav-title {
      font-size: 12px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 0 0 16px;
      padding-left: 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s ease;
      margin-bottom: 4px;

      &:hover {
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

        .nav-num {
          color: #2563eb;
        }

        .nav-text {
          color: #0f172a;
        }
      }

      .nav-num {
        font-size: 13px;
        font-weight: 700;
        color: #cbd5e1;
        font-variant-numeric: tabular-nums;
        transition: color 0.2s;
      }

      .nav-text {
        font-size: 14px;
        color: #64748b;
        font-weight: 500;
        transition: color 0.2s;
      }
    }
  }

  .terms-main {
    flex: 1;
    min-width: 0;
  }

  .terms-block {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    margin-bottom: 28px;
    transition: all 0.3s ease;
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.1);
      border-color: transparent;
    }

    .block-header {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 32px 36px 24px;

      .block-num {
        font-size: 48px;
        font-weight: 800;
        color: #f1f5f9;
        line-height: 1;
        letter-spacing: -0.04em;
        flex-shrink: 0;
        user-select: none;
      }

      .block-meta {
        padding-top: 10px;
      }

      h2 {
        font-size: 22px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 8px;
      }

      .block-divider {
        width: 40px;
        height: 3px;
        border-radius: 2px;
        opacity: 0.6;
      }
    }

    .block-body {
      padding: 0 36px 32px 36px;

      :deep(p) {
        color: #475569;
        font-size: 15px;
        line-height: 1.8;
        margin: 0 0 16px;

        &:last-child {
          margin-bottom: 0;
        }

        &.notice {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 10px;
          padding: 14px 18px;
          color: #92400e;
          font-size: 14px;
        }
      }

      :deep(.highlight) {
        color: #2563eb;
        font-weight: 600;
      }

      :deep(.numbered-list) {
        margin: 0 0 16px;
        padding-left: 0;
        counter-reset: item;
        list-style: none;

        li {
          margin-bottom: 14px;
          line-height: 1.8;
          color: #475569;
          font-size: 15px;
          display: flex;
          gap: 10px;

          &::before {
            content: counter(item);
            counter-increment: item;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background: #eff6ff;
            color: #2563eb;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 700;
            flex-shrink: 0;
            margin-top: 3px;
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      :deep(.bullet-list) {
        margin: 0 0 16px;
        padding-left: 0;
        list-style: none;

        li {
          margin-bottom: 10px;
          line-height: 1.8;
          color: #475569;
          font-size: 15px;
          padding-left: 22px;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 10px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #3b82f6;
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      :deep(.terms-subsection) {
        margin: 20px 0;
        padding: 24px;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #f1f5f9;

        h4 {
          color: #0f172a;
          font-size: 16px;
          margin: 0 0 14px;
          font-weight: 700;
        }

        .bullet-list {
          margin-bottom: 0;
        }
      }
    }
  }
}

/* Notice Section */
.notice-section {
  background: #f8fafc;

  .notice-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }

  .notice-card {
    padding: 32px;
    background: white;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.1);
      border-color: transparent;
    }

    .icon-box {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      margin-bottom: 20px;
    }

    h3 {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 10px;
    }

    p {
      font-size: 15px;
      color: #64748b;
      line-height: 1.6;
      margin: 0;
    }
  }
}

/* Contact Section */
.contact-section {
  background: white;

  .contact-bar {
    display: flex;
    background: #0f172a;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
  }

  .contact-left {
    flex: 1;
    padding: 48px;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);

    h3 {
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin: 0 0 14px;
    }

    p {
      font-size: 15px;
      color: #94a3b8;
      line-height: 1.7;
      margin: 0;
    }
  }

  .contact-right {
    flex: 1;
    padding: 48px;
    background: white;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
      background: #f1f5f9;
    }

    .el-icon {
      font-size: 20px;
      color: #3b82f6;
      margin-top: 2px;
    }

    .label {
      display: block;
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    a {
      color: #2563eb;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s;

      &:hover {
        color: #3b82f6;
      }
    }

    span:not(.label) {
      color: #334155;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .terms-list-section {
    .terms-nav {
      display: none;
    }

    .terms-layout {
      gap: 0;
    }
  }

  .notice-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .contact-section {
    .contact-bar {
      flex-direction: column;
    }

    .contact-left {
      padding: 36px;
    }

    .contact-right {
      padding: 36px;
    }
  }
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .section {
    padding: 60px 0;

    .section-header {
      margin-bottom: 40px;

      .section-title {
        font-size: 28px;
      }

      .section-desc {
        font-size: 15px;
      }
    }
  }

  .hero-section {
    padding: 80px 0 60px;

    .hero-title {
      font-size: 32px;
    }

    .hero-subtitle {
      font-size: 15px;
    }

    .badge {
      margin-bottom: 16px;
    }
  }

  .terms-list-section {
    padding-top: 40px;

    .terms-block {
      margin-bottom: 20px;

      .block-header {
        padding: 20px 24px 16px;
        gap: 14px;

        .block-num {
          font-size: 36px;
        }

        h2 {
          font-size: 17px;
          margin-bottom: 6px;
        }

        .block-divider {
          width: 32px;
          height: 2px;
        }
      }

      .block-body {
        padding: 0 24px 24px;

        :deep(p) {
          font-size: 14px;
        }

        :deep(.numbered-list li) {
          font-size: 14px;
        }

        :deep(.bullet-list li) {
          font-size: 14px;
        }

        :deep(.terms-subsection) {
          padding: 18px;

          h4 {
            font-size: 15px;
          }
        }
      }
    }
  }

  .notice-section {
    .notice-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .notice-card {
      padding: 24px;

      .icon-box {
        width: 44px;
        height: 44px;
        font-size: 22px;
        margin-bottom: 16px;
      }

      h3 {
        font-size: 16px;
      }

      p {
        font-size: 14px;
      }
    }
  }

  .contact-section {
    .contact-left {
      padding: 28px 24px;

      h3 {
        font-size: 22px;
        margin-bottom: 10px;
      }

      p {
        font-size: 14px;
      }
    }

    .contact-right {
      padding: 24px;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .contact-item {
      padding: 14px;

      .el-icon {
        font-size: 18px;
      }

      a,
      span:not(.label) {
        font-size: 13px;
      }
    }
  }
}

/* Responsive - Small Mobile */
@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }

  .section {
    padding: 48px 0;

    .section-header {
      margin-bottom: 32px;

      .section-title {
        font-size: 24px;
      }

      .section-desc {
        font-size: 14px;
      }
    }
  }

  .hero-section {
    padding: 70px 0 48px;

    .hero-title {
      font-size: 26px;
      margin-bottom: 14px;
    }

    .hero-subtitle {
      font-size: 14px;
    }

    .badge {
      font-size: 12px;
      padding: 5px 10px;
    }

    .update-time {
      font-size: 13px;
      padding: 6px 12px;
    }
  }

  .terms-list-section {
    .terms-block {
      .block-header {
        padding: 16px 20px 12px;
        gap: 10px;

        .block-num {
          font-size: 28px;
        }

        .block-meta {
          padding-top: 2px;
        }

        h2 {
          font-size: 15px;
          margin-bottom: 4px;
        }

        .block-divider {
          width: 24px;
          height: 2px;
        }
      }

      .block-body {
        padding: 0 20px 20px;

        :deep(p) {
          font-size: 13px;
        }

        :deep(.numbered-list li) {
          font-size: 13px;
          gap: 8px;

          &::before {
            width: 20px;
            height: 20px;
            font-size: 11px;
          }
        }

        :deep(.bullet-list li) {
          font-size: 13px;
        }

        :deep(.terms-subsection) {
          padding: 14px;
          border-radius: 10px;

          h4 {
            font-size: 14px;
          }
        }
      }
    }
  }

  .notice-section .notice-card {
    padding: 20px;

    .icon-box {
      width: 40px;
      height: 40px;
      font-size: 20px;
    }

    h3 {
      font-size: 15px;
    }

    p {
      font-size: 13px;
    }
  }

  .contact-section {
    .contact-bar {
      border-radius: 14px;
    }

    .contact-left {
      padding: 24px 20px;

      h3 {
        font-size: 20px;
      }

      p {
        font-size: 13px;
      }
    }

    .contact-right {
      padding: 20px 16px;
      gap: 10px;
    }

    .contact-item {
      padding: 12px;

      .label {
        font-size: 11px;
      }
    }
  }
}
</style>
