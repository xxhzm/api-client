<script setup>
import {
  Document,
  Lock,
  User,
  Service,
  Warning,
  Connection,
  DataAnalysis,
  Timer,
  Message,
  Phone,
  Location,
} from '@element-plus/icons-vue'

const { $myFetch } = useNuxtApp()

// 配置项
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

// 服务条款数据
const termsData = ref([
  {
    id: 'service-description',
    title: '服务说明',
    icon: 'Service',
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
    icon: 'User',
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
    icon: 'Connection',
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
    icon: 'DataAnalysis',
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
    icon: 'Lock',
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
    icon: 'Lock',
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
    icon: 'Warning',
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
    icon: 'Document',
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

// 图标映射函数
const getIcon = (iconName) => {
  const iconMap = {
    Service,
    User,
    Connection,
    DataAnalysis,
    Lock,
    Warning,
    Document,
  }
  return iconMap[iconName] || Service
}

// 联系信息
const contactInfo = ref({
  email: options.value?.contact_email || '',
  phone: options.value?.contact_phone || '',
  address: options.value?.contact_address || '',
  workTime: options.value?.working_hours || '',
})
</script>

<template>
  <div class="terms-container">
    <IndexNavbar></IndexNavbar>
    <IndexNotice :content="options.notice"></IndexNotice>
    <div class="container">
      <!-- 页面标题 -->
      <div class="section">
        <h1 class="page-title">服务条款</h1>
        <div class="content-card intro">
          <p class="intro-text">
            欢迎使用我们的API服务平台。在使用我们的服务之前，请仔细阅读并理解以下服务条款。
            这些条款构成您与我们之间的法律协议，使用我们的服务即表示您同意遵守这些条款。
          </p>
          <p class="update-notice">
            <el-icon><Timer /></el-icon>
            最后更新时间：{{ new Date().toLocaleDateString('zh-CN') }}
          </p>
        </div>
      </div>

      <!-- 服务条款内容 -->
      <div class="section" v-for="term in termsData" :key="term.id">
        <h2 class="section-title">
          <el-icon class="section-icon">
            <component :is="getIcon(term.icon)"></component>
          </el-icon>
          {{ term.title }}
        </h2>
        <div class="content-card terms-content">
          <div v-html="term.content"></div>
        </div>
      </div>

      <!-- 重要提醒 -->
      <div class="section">
        <h2 class="section-title">
          <el-icon class="section-icon"><Warning /></el-icon>
          重要提醒
        </h2>
        <div class="content-card important-notice">
          <div class="notice-grid">
            <div class="notice-item">
              <el-icon><Document /></el-icon>
              <div>
                <h4>法律效力</h4>
                <p>本服务条款具有法律约束力，请在使用服务前仔细阅读。</p>
              </div>
            </div>
            <div class="notice-item">
              <el-icon><User /></el-icon>
              <div>
                <h4>用户责任</h4>
                <p>用户应对自己的行为负责，遵守相关法律法规。</p>
              </div>
            </div>
            <div class="notice-item">
              <el-icon><Service /></el-icon>
              <div>
                <h4>服务变更</h4>
                <p>我们可能会根据业务需要调整服务内容和条款。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系我们 -->
      <div class="section">
        <h2 class="section-title">
          <el-icon class="section-icon"><Message /></el-icon>
          联系我们
        </h2>
        <div class="content-card contact">
          <p class="contact-intro">
            如果您对服务条款有任何疑问，请通过以下方式联系我们：
          </p>
          <div class="contact-grid">
            <div class="contact-item">
              <el-icon><Message /></el-icon>
              <div>
                <span class="label">邮箱：</span>
                <a :href="`mailto:${contactInfo.email}`">{{
                  contactInfo.email
                }}</a>
              </div>
            </div>
            <div class="contact-item">
              <el-icon><Phone /></el-icon>
              <div>
                <span class="label">电话：</span>
                <span>{{ contactInfo.phone }}</span>
              </div>
            </div>
            <div class="contact-item">
              <el-icon><Location /></el-icon>
              <div>
                <span class="label">地址：</span>
                <span>{{ contactInfo.address }}</span>
              </div>
            </div>
            <div class="contact-item">
              <el-icon><Timer /></el-icon>
              <div>
                <span class="label">工作时间：</span>
                <span>{{ contactInfo.workTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less" scoped>
.terms-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f7f9fe, #ffffff);

  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 0;
  }

  .section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .page-title {
    font-size: 28px;
    color: #1f2f3d;
    text-align: center;
    margin: 0 0 20px 0;
    font-weight: 500;
  }

  .section-title {
    position: relative;
    color: #1f2f3d;
    font-size: 16px;
    font-weight: normal;
    margin: 0 0 20px 0;
    padding-left: 24px;
    line-height: 1.4;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 16px;
      background: #409eff;
      border-radius: 3px;
    }

    .section-icon {
      font-size: 18px;
      color: #409eff;
      margin-left: 0;
    }
  }

  .content-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .intro {
    .intro-text {
      color: #606266;
      font-size: 14px;
      line-height: 1.8;
      margin: 0 0 16px 0;
      text-indent: 2em;
    }

    .update-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #909399;
      font-size: 13px;
      padding: 12px 16px;
      background: #f5f7fa;
      border-radius: 8px;
      margin: 0;

      .el-icon {
        font-size: 14px;
      }
    }
  }

  .terms-content {
    :deep(p) {
      color: #606266;
      font-size: 14px;
      line-height: 1.8;
      margin: 0 0 16px 0;
      text-indent: 2em;

      &:last-child {
        margin-bottom: 0;
      }

      &.notice {
        background: #fff7e6;
        border: 1px solid #ffd591;
        border-radius: 8px;
        padding: 12px 16px;
        text-indent: 0;
        color: #d46b08;
      }
    }

    :deep(.highlight) {
      color: #409eff;
      font-weight: 500;
    }

    :deep(.numbered-list) {
      margin: 0 0 16px 0;
      padding-left: 20px;
      counter-reset: item;

      li {
        margin-bottom: 12px;
        line-height: 1.8;
        color: #606266;
        font-size: 14px;
        display: block;
        position: relative;

        &:before {
          content: counter(item) '. ';
          counter-increment: item;
          color: #409eff;
          font-weight: 500;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    :deep(.bullet-list) {
      margin: 0 0 16px 0;
      padding-left: 20px;
      list-style-type: disc;

      li {
        margin-bottom: 8px;
        line-height: 1.8;
        color: #606266;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    :deep(.terms-subsection) {
      margin: 20px 0;
      padding: 16px;
      background: #f9fafc;
      border-radius: 8px;

      h4 {
        color: #303133;
        font-size: 15px;
        margin: 0 0 12px 0;
        font-weight: 500;
      }

      .bullet-list {
        margin-bottom: 0;
      }
    }
  }

  .important-notice {
    .notice-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .notice-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #fff7e6;
      border-radius: 8px;
      border: 1px solid #ffd591;

      .el-icon {
        font-size: 20px;
        color: #d46b08;
        margin-top: 2px;
      }

      h4 {
        color: #d46b08;
        font-size: 14px;
        margin: 0 0 4px 0;
        font-weight: 500;
      }

      p {
        color: #d46b08;
        font-size: 13px;
        line-height: 1.6;
        margin: 0;
      }
    }
  }

  .contact {
    .contact-intro {
      color: #606266;
      font-size: 14px;
      line-height: 1.8;
      margin: 0 0 20px 0;
      text-indent: 2em;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: #ecf5ff;
      }

      .el-icon {
        font-size: 18px;
        color: #409eff;
      }

      .label {
        color: #909399;
        font-size: 13px;
        margin-right: 4px;
      }

      a {
        color: #409eff;
        text-decoration: none;
        font-size: 14px;
        transition: color 0.3s ease;

        &:hover {
          color: #66b1ff;
        }
      }

      span:not(.label) {
        color: #606266;
        font-size: 14px;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .terms-container {
    .container {
      width: 95%;
    }

    .page-title {
      font-size: 24px;
    }

    .section-title {
      font-size: 15px;
      padding-left: 20px;

      &::before {
        height: 14px;
      }

      .section-icon {
        font-size: 16px;
      }
    }

    .content-card {
      padding: 20px;
    }

    .intro {
      .intro-text {
        font-size: 13px;
      }

      .update-notice {
        font-size: 12px;
        padding: 10px 12px;
      }
    }

    .terms-content {
      :deep(p) {
        font-size: 13px;
      }

      :deep(.numbered-list) {
        padding-left: 16px;

        li {
          font-size: 13px;
        }
      }

      :deep(.bullet-list) {
        padding-left: 16px;

        li {
          font-size: 13px;
        }
      }

      :deep(.terms-subsection) {
        padding: 12px;

        h4 {
          font-size: 14px;
        }
      }
    }

    .important-notice {
      .notice-grid {
        gap: 12px;
      }

      .notice-item {
        padding: 12px;

        .el-icon {
          font-size: 18px;
        }

        h4 {
          font-size: 13px;
        }

        p {
          font-size: 12px;
        }
      }
    }

    .contact {
      .contact-intro {
        font-size: 13px;
      }

      .contact-grid {
        gap: 12px;
      }

      .contact-item {
        padding: 12px;

        .el-icon {
          font-size: 16px;
        }

        .label {
          font-size: 12px;
        }

        a,
        span:not(.label) {
          font-size: 13px;
        }
      }
    }
  }
}
</style>
