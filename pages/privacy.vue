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

const privacyColors = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
  '#3b82f6', '#10b981', '#ef4444', '#8b5cf6',
]

const privacyData = ref({
  lastUpdated: '2025年10月12日',
  effectiveDate: '2025年10月12日',
  sections: [
    {
      id: 'info-collection',
      title: '信息收集',
      content: [
        {
          subtitle: '个人信息收集',
          description: '我们可能收集以下类型的个人信息：',
          items: [
            '账户信息：用户名、邮箱地址、手机号码',
            '身份验证信息：密码、安全问题答案',
            '使用数据：API调用记录、访问日志、使用统计',
            '设备信息：IP地址、浏览器类型、操作系统',
            '支付信息：订单记录、交易历史（不包含敏感支付数据）',
          ],
        },
        {
          subtitle: '信息收集方式',
          description: '我们通过以下方式收集信息：',
          items: [
            '用户主动提供：注册账户、填写表单时提供的信息',
            '自动收集：通过cookies、日志文件等技术手段收集',
            '第三方服务：通过合法的第三方服务提供商获取',
            'API调用：用户使用我们的API服务时产生的数据',
          ],
        },
      ],
    },
    {
      id: 'info-usage',
      title: '信息使用',
      content: [
        {
          subtitle: '使用目的',
          description: '我们使用收集的信息用于：',
          items: [
            '提供和维护我们的API服务',
            '处理用户注册、登录和账户管理',
            '响应用户查询和提供客户支持',
            '发送服务相关通知和更新',
            '改进我们的服务质量和用户体验',
            '进行安全监控和欺诈防护',
            '遵守法律法规要求',
          ],
        },
        {
          subtitle: '数据处理原则',
          description: '我们遵循以下数据处理原则：',
          items: [
            '合法性：仅在合法基础上处理个人数据',
            '目的限制：仅为明确、合法的目的处理数据',
            '数据最小化：仅处理必要的个人数据',
            '准确性：确保个人数据准确且及时更新',
            '存储限制：仅在必要期间保留个人数据',
            '完整性和保密性：确保数据安全',
          ],
        },
      ],
    },
    {
      id: 'info-sharing',
      title: '信息共享',
      content: [
        {
          subtitle: '共享情况',
          description: '我们可能在以下情况下共享您的信息：',
          items: [
            '获得您的明确同意',
            '为提供您要求的服务而必需',
            '遵守法律法规、法院命令或政府要求',
            '保护我们的权利、财产或安全',
            '在业务转让、合并或收购中',
          ],
        },
        {
          subtitle: '第三方服务',
          description: '我们可能使用以下第三方服务：',
          items: [
            '云存储服务提供商（用于数据存储）',
            '支付处理服务（用于处理付款）',
            '分析服务（用于改进服务质量）',
            '客户支持工具（用于提供技术支持）',
            '安全服务（用于保护系统安全）',
          ],
        },
      ],
    },
    {
      id: 'data-security',
      title: '数据安全',
      content: [
        {
          subtitle: '安全措施',
          description: '我们采取以下安全措施保护您的数据：',
          items: [
            '数据加密：使用SSL/TLS加密传输数据',
            '访问控制：实施严格的访问权限管理',
            '安全监控：24/7监控系统安全状态',
            '定期备份：定期备份重要数据',
            '安全审计：定期进行安全评估和审计',
            '员工培训：对员工进行数据保护培训',
            '事件响应：建立完善的安全事件响应机制',
          ],
        },
        {
          subtitle: '数据存储',
          description: '关于数据存储的重要信息：',
          items: [
            '数据存储在安全的服务器环境中',
            '采用行业标准的安全防护措施',
            '定期更新安全补丁和防护系统',
            '实施多层安全防护架构',
            '数据中心符合相关安全认证标准',
          ],
        },
      ],
    },
    {
      id: 'user-rights',
      title: '用户权利',
      content: [
        {
          subtitle: '您的权利',
          description: '根据适用的数据保护法律，您享有以下权利：',
          items: [
            '访问权：查看我们持有的关于您的个人数据',
            '更正权：要求更正不准确的个人数据',
            '删除权：在特定情况下要求删除个人数据',
            '限制处理权：在特定情况下限制数据处理',
            '数据可携权：以结构化格式获取您的数据',
            '反对权：反对基于合法利益的数据处理',
            '撤回同意权：撤回之前给予的同意',
          ],
        },
        {
          subtitle: '行使权利',
          description: '如需行使上述权利，请：',
          items: [
            '通过我们的客服邮箱联系我们',
            '提供必要的身份验证信息',
            '我们将在法定时间内响应您的请求',
            '某些权利的行使可能受到法律限制',
          ],
        },
      ],
    },
    {
      id: 'cookie-policy',
      title: 'Cookie政策',
      content: [
        {
          subtitle: 'Cookie使用',
          description: '我们使用Cookie和类似技术：',
          items: [
            '必要Cookie：确保网站正常运行',
            '功能Cookie：记住您的偏好设置',
            '分析Cookie：了解网站使用情况',
            '营销Cookie：提供个性化内容',
            '您可以通过浏览器设置管理Cookie',
          ],
        },
        {
          subtitle: 'Cookie管理',
          description: '您可以：',
          items: [
            '通过浏览器设置禁用Cookie',
            '删除已存储的Cookie',
            '设置Cookie偏好',
            '注意：禁用某些Cookie可能影响网站功能',
          ],
        },
      ],
    },
    {
      id: 'data-retention',
      title: '数据保留',
      content: [
        {
          subtitle: '保留期限',
          description: '我们根据以下原则保留数据：',
          items: [
            '账户数据：账户存续期间及之后合理期间',
            '交易记录：根据法律要求保留相应期间',
            '日志数据：通常保留12个月',
            '支持记录：问题解决后保留合理期间',
            '营销数据：直到您取消订阅或反对',
            '法律要求：根据适用法律确定保留期',
          ],
        },
        {
          subtitle: '数据删除',
          description: '数据删除的相关说明：',
          items: [
            '超过保留期的数据将被安全删除',
            '用户可申请删除特定数据',
            '某些数据因法律要求无法立即删除',
            '删除过程采用安全的数据销毁方法',
          ],
        },
      ],
    },
    {
      id: 'contact-us',
      title: '联系我们',
      content: [
        {
          subtitle: '联系方式',
          description: '如有隐私相关问题，请通过以下方式联系我们：',
          items: [
            '邮箱：' + (options.value?.contact_email || ''),
            '客服热线：' + (options.value?.contact_phone || ''),
            '在线客服：网站右下角客服窗口',
            '邮寄地址：' + (options.value?.contact_address || ''),
            '工作时间：' + (options.value?.working_hours || ''),
          ],
        },
        {
          subtitle: '响应时间',
          description: '我们承诺：',
          items: [
            '一般咨询：1个工作日内回复',
            '权利行使请求：15个工作日内处理',
            '紧急安全问题：24小时内响应',
            '复杂问题：30个工作日内给出答复',
          ],
        },
      ],
    },
  ],
})

useHead({
  title: '隐私政策' + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    {
      name: 'description',
      content:
        options.value.website_name +
        ' - 隐私政策，了解我们如何收集、使用和保护您的个人信息',
    },
    {
      name: 'keywords',
      content: '隐私政策,数据保护,个人信息,用户权利,数据安全',
    },
  ],
  style: [
    {
      children: options.value.css,
    },
  ],
})
</script>

<template>
  <div class="privacy-page">
    <IndexNavbar></IndexNavbar>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg-pattern"></div>
      <div class="container hero-container">
        <div class="hero-content">
          <div class="badge"><span class="badge-dot"></span> 法律条款</div>
          <h1 class="hero-title">隐私政策</h1>
          <p class="hero-subtitle">
            本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。我们严格遵守相关法律法规，
            采用行业领先的安全措施来保护您的数据安全。
          </p>
          <div class="hero-meta">
            <div class="meta-tag">
              <el-icon><Timer /></el-icon>
              生效日期：{{ privacyData.effectiveDate }}
            </div>
            <div class="meta-tag">
              <el-icon><Document /></el-icon>
              最后更新：{{ privacyData.lastUpdated }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Privacy Content -->
    <section class="section privacy-list-section">
      <div class="container">
        <div class="privacy-layout">
          <!-- Sidebar Nav -->
          <aside class="privacy-nav">
            <div class="nav-sticky">
              <h3 class="nav-title">目录</h3>
              <a
                v-for="(section, index) in privacyData.sections"
                :key="section.id"
                :href="`#${section.id}`"
                class="nav-item"
              >
                <span class="nav-num">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="nav-text">{{ section.title }}</span>
              </a>
            </div>
          </aside>

          <!-- Main Content -->
          <div class="privacy-main">
            <div
              v-for="(section, index) in privacyData.sections"
              :key="section.id"
              :id="section.id"
              class="privacy-block"
            >
              <div class="block-header">
                <div class="block-num">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="block-meta">
                  <h2>{{ section.title }}</h2>
                  <div
                    class="block-divider"
                    :style="{ backgroundColor: privacyColors[index % privacyColors.length] }"
                  ></div>
                </div>
              </div>
              <div class="block-body">
                <div
                  v-for="(content, contentIndex) in section.content"
                  :key="contentIndex"
                  class="content-group"
                >
                  <h3>{{ content.subtitle }}</h3>
                  <p class="group-desc">{{ content.description }}</p>
                  <ul class="group-list">
                    <li
                      v-for="(item, itemIndex) in content.items"
                      :key="itemIndex"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </div>
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
          <p class="section-desc">关于本隐私政策您需要了解的重要事项</p>
        </div>
        <div class="notice-grid">
          <div class="notice-card">
            <div class="icon-box">
              <el-icon><Document /></el-icon>
            </div>
            <h3>政策更新</h3>
            <p>我们可能会不时更新本隐私政策。重大变更将通过网站公告、邮件通知等方式告知您。继续使用我们的服务即表示您接受更新后的政策。</p>
          </div>
          <div class="notice-card">
            <div class="icon-box">
              <el-icon><User /></el-icon>
            </div>
            <h3>争议解决</h3>
            <p>如对本政策有任何疑问或争议，请首先通过我们的客服渠道联系我们。我们将诚恳地与您协商解决。</p>
          </div>
          <div class="notice-card">
            <div class="icon-box">
              <el-icon><Service /></el-icon>
            </div>
            <h3>法律适用</h3>
            <p>本隐私政策受中华人民共和国法律管辖。如有争议，双方应友好协商解决；协商不成的，可向有管辖权的人民法院提起诉讼。</p>
          </div>
        </div>
      </div>
    </section>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less" scoped>
.privacy-page {
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

  .hero-meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .meta-tag {
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

/* Privacy List */
.privacy-list-section {
  padding-top: 60px;
  background: #f8fafc;

  .privacy-layout {
    display: flex;
    gap: 48px;
    align-items: flex-start;
  }

  .privacy-nav {
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

  .privacy-main {
    flex: 1;
    min-width: 0;
  }

  .privacy-block {
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
      padding: 0 36px 32px;
    }

    .content-group {
      padding: 24px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      h3 {
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 10px;
      }

      .group-desc {
        font-size: 15px;
        color: #475569;
        line-height: 1.7;
        margin: 0 0 16px;
      }

      .group-list {
        margin: 0;
        padding: 0;
        list-style: none;

        li {
          font-size: 15px;
          color: #475569;
          line-height: 1.8;
          margin-bottom: 10px;
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
    }
  }
}

/* Notice Section */
.notice-section {
  background: white;

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
      background-color: #fffbeb;
      color: #f59e0b;
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
      line-height: 1.7;
      margin: 0;
    }
  }
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .privacy-list-section {
    .privacy-nav {
      display: none;
    }

    .privacy-layout {
      gap: 0;
    }
  }

  .notice-grid {
    grid-template-columns: repeat(3, 1fr);
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

    .hero-meta {
      flex-direction: column;
      gap: 10px;

      .meta-tag {
        font-size: 13px;
        padding: 6px 12px;
      }
    }
  }

  .privacy-list-section {
    padding-top: 40px;

    .privacy-block {
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
      }

      .content-group {
        padding: 18px;

        h3 {
          font-size: 15px;
        }

        .group-desc {
          font-size: 14px;
        }

        .group-list li {
          font-size: 14px;
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

    .hero-meta .meta-tag {
      font-size: 12px;
    }
  }

  .privacy-list-section {
    .privacy-block {
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
      }

      .content-group {
        padding: 14px;

        h3 {
          font-size: 14px;
        }

        .group-desc {
          font-size: 13px;
        }

        .group-list li {
          font-size: 13px;
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
}
</style>
