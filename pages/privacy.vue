<script setup>
import {
  Lock,
  Document,
  DataAnalysis,
  Setting,
  Warning,
  User,
  Connection,
  Timer,
  Phone,
} from '@element-plus/icons-vue'

// 配置项
const options = useState('options')

// 隐私政策数据
const privacyData = ref({
  lastUpdated: '2025年10月12日',
  effectiveDate: '2025年10月12日',
  sections: [
    {
      title: '信息收集',
      icon: 'DataAnalysis',
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
      title: '信息使用',
      icon: 'Setting',
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
      title: '信息共享',
      icon: 'Connection',
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
      title: '数据安全',
      icon: 'Lock',
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
      title: '用户权利',
      icon: 'User',
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
      title: 'Cookie政策',
      icon: 'Document',
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
      title: '数据保留',
      icon: 'Timer',
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
      title: '联系我们',
      icon: 'Phone',
      content: [
        {
          subtitle: '联系方式',
          description: '如有隐私相关问题，请通过以下方式联系我们：',
          items: [
            '邮箱：privacy@example.com',
            '客服热线：400-123-4567',
            '在线客服：网站右下角客服窗口',
            '邮寄地址：[公司地址]',
            '工作时间：周一至周五 9:00-18:00',
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

// 获取图标组件
const getIconComponent = (iconName) => {
  const iconMap = {
    DataAnalysis,
    Setting,
    Connection,
    Lock,
    User,
    Document,
    Timer,
    Phone,
  }
  return iconMap[iconName] || Document
}
</script>

<template>
  <div class="privacy-container">
    <IndexNavbar></IndexNavbar>
    <IndexNotice :content="options.notice"></IndexNotice>
    <div class="container">
      <!-- 页面标题 -->
      <div class="section">
        <h1 class="page-title">隐私政策</h1>
        <div class="content-card intro-card">
          <div class="intro-content">
            <div class="intro-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="intro-text">
              <h3>保护您的隐私是我们的承诺</h3>
              <p>
                本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。我们严格遵守相关法律法规，
                采用行业领先的安全措施来保护您的数据安全。请仔细阅读本政策，了解您的权利和我们的义务。
              </p>
              <div class="policy-meta">
                <span class="meta-item">
                  <strong>生效日期：</strong>{{ privacyData.effectiveDate }}
                </span>
                <span class="meta-item">
                  <strong>最后更新：</strong>{{ privacyData.lastUpdated }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 隐私政策内容 -->
      <div
        v-for="(section, index) in privacyData.sections"
        :key="index"
        class="section"
      >
        <h2 class="section-title">{{ section.title }}</h2>
        <div class="content-card">
          <div
            v-for="(content, contentIndex) in section.content"
            :key="contentIndex"
            class="policy-section"
          >
            <div class="section-header-with-icon">
              <div class="section-icon">
                <component :is="getIconComponent(section.icon)"></component>
              </div>
              <h3>{{ content.subtitle }}</h3>
            </div>
            <p class="section-description">{{ content.description }}</p>
            <ul class="policy-list">
              <li v-for="(item, itemIndex) in content.items" :key="itemIndex">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 重要提醒 -->
      <div class="section">
        <div class="content-card warning-card">
          <div class="warning-header">
            <el-icon class="warning-icon"><Warning /></el-icon>
            <h3>重要提醒</h3>
          </div>
          <div class="warning-content">
            <p>
              <strong>政策更新：</strong>
              我们可能会不时更新本隐私政策。重大变更将通过网站公告、邮件通知等方式告知您。
              继续使用我们的服务即表示您接受更新后的政策。
            </p>
            <p>
              <strong>争议解决：</strong>
              如对本政策有任何疑问或争议，请首先通过我们的客服渠道联系我们。
              我们将诚恳地与您协商解决。
            </p>
            <p>
              <strong>法律适用：</strong>
              本隐私政策受中华人民共和国法律管辖。如有争议，
              双方应友好协商解决；协商不成的，可向有管辖权的人民法院提起诉讼。
            </p>
          </div>
        </div>
      </div>
    </div>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less" scoped>
.privacy-container {
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
    margin: 0 0 24px 0;
    font-weight: 600;
  }

  .section-title {
    position: relative;
    color: #1f2f3d;
    font-size: 16px;
    font-weight: normal;
    margin: 0 0 20px 0;
    padding-left: 12px;
    line-height: 1.4;

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
  }

  .content-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .intro-card {
    .intro-content {
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }

    .intro-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      background: #ecf5ff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409eff;
      font-size: 28px;
      flex-shrink: 0;
    }

    .intro-text {
      flex: 1;

      h3 {
        font-size: 20px;
        color: #303133;
        margin: 0 0 12px 0;
        font-weight: 500;
      }

      p {
        color: #606266;
        font-size: 14px;
        line-height: 1.8;
        margin: 0 0 16px 0;
      }
    }

    .policy-meta {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;

      .meta-item {
        color: #909399;
        font-size: 13px;

        strong {
          color: #606266;
        }
      }
    }
  }

  .policy-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-header-with-icon {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .section-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #ecf5ff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409eff;
      font-size: 16px;
    }

    h3 {
      font-size: 16px;
      color: #303133;
      margin: 0;
      font-weight: 500;
    }
  }

  .section-description {
    color: #606266;
    font-size: 14px;
    line-height: 1.6;
    margin: 0 0 16px 0;
  }

  .policy-list {
    margin: 0;
    padding-left: 20px;
    list-style-type: disc;

    li {
      color: #606266;
      font-size: 14px;
      line-height: 1.8;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .warning-card {
    border-left: 4px solid #e6a23c;
    background: #fdf6ec;

    .warning-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;

      .warning-icon {
        color: #e6a23c;
        font-size: 20px;
      }

      h3 {
        color: #e6a23c;
        font-size: 16px;
        margin: 0;
        font-weight: 500;
      }
    }

    .warning-content {
      p {
        color: #606266;
        font-size: 14px;
        line-height: 1.8;
        margin: 0 0 12px 0;

        &:last-child {
          margin-bottom: 0;
        }

        strong {
          color: #303133;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .privacy-container {
    .container {
      width: 95%;
    }

    .page-title {
      font-size: 24px;
      margin-bottom: 20px;
    }

    .content-card {
      padding: 20px;
    }

    .intro-card {
      .intro-content {
        flex-direction: column;
        gap: 16px;
      }

      .intro-icon {
        width: 50px;
        height: 50px;
        font-size: 24px;
        align-self: center;
      }

      .intro-text {
        h3 {
          font-size: 18px;
          text-align: center;
        }

        p {
          font-size: 13px;
        }
      }

      .policy-meta {
        flex-direction: column;
        gap: 8px;

        .meta-item {
          font-size: 12px;
        }
      }
    }

    .section-header-with-icon {
      gap: 8px;

      .section-icon {
        width: 28px;
        height: 28px;
        font-size: 14px;
      }

      h3 {
        font-size: 15px;
      }
    }

    .section-description {
      font-size: 13px;
    }

    .policy-list {
      li {
        font-size: 13px;
        line-height: 1.6;
      }
    }

    .warning-card {
      .warning-header {
        .warning-icon {
          font-size: 18px;
        }

        h3 {
          font-size: 15px;
        }
      }

      .warning-content {
        p {
          font-size: 13px;
        }
      }
    }
  }
}
</style>
