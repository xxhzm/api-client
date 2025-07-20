<script setup>
import {
  Message,
  User,
  ChatDotSquare,
  Lightning,
  DataLine,
  Service,
  Lock,
  Promotion,
  Document,
  Picture,
  DataAnalysis,
  Reading,
  ChatLineRound,
  Opportunity,
} from '@element-plus/icons-vue'
const { $myFetch } = useNuxtApp()

// 配置项
const options = ref({})

const {
  data: { value: res },
} = await useAsyncData('Options', () => $myFetch('Options'))

options.value = res.data

// 关于我们页面数据
const aboutData = ref({})

const {
  data: { value: aboutRes },
} = await useAsyncData('AboutInfo', () => $myFetch('AboutInfo'))

aboutData.value = aboutRes.data

// 公司信息
const companyInfo = ref(aboutData.value.companyInfo || {})

// 服务优势
const features = ref(aboutData.value.features || [])

// 服务条款
const serviceTerms = ref(aboutData.value.serviceTerms || {})

// 发展历程
const timeline = ref(aboutData.value.timeline || [])

// 技术架构
const techStack = ref(aboutData.value.techStack || [])

// API类型
const apiTypes = ref(aboutData.value.apiTypes || [])

// 开发者支持
const devSupport = ref(aboutData.value.devSupport || [])

// 数据统计
const statistics = ref(aboutData.value.statistics || [])

// 用户评价
const testimonials = ref(aboutData.value.testimonials || [])

useHead({
  title: '关于我们' + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    {
      name: 'description',
      content: options.value.website_name + ' - 关于我们',
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
  <div class="about-container">
    <IndexNotice :content="options.notice"></IndexNotice>
    <div class="container">
      <div class="section">
        <h2 class="section-title">关于我们</h2>
        <div class="content-card company-intro">
          <div class="company-info">
            <h3>
              {{ companyInfo.name }}
              <span>{{ companyInfo.slogan }}</span>
            </h3>
            <div class="intro-text" v-html="companyInfo.description"></div>
            <div class="contact-info" v-html="companyInfo.contact"></div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">服务优势</h2>
        <div class="content-card features">
          <div class="feature-grid">
            <div
              v-for="(feature, index) in features"
              :key="index"
              class="feature-item"
            >
              <el-icon v-if="index === 0"><Lightning /></el-icon>
              <el-icon v-else-if="index === 1"><Lock /></el-icon>
              <el-icon v-else-if="index === 2"><DataLine /></el-icon>
              <el-icon v-else><Service /></el-icon>
              <h4>{{ feature.title }}</h4>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">服务条款</h2>
        <div class="content-card terms">
          <div class="terms-section">
            <h3>{{ serviceTerms.serviceDescription.title }}</h3>
            <div
              class="terms-content"
              v-html="serviceTerms.serviceDescription.content"
            ></div>
          </div>

          <div class="terms-section">
            <h3>{{ serviceTerms.apiAgreement.title }}</h3>
            <div
              class="terms-content"
              v-html="serviceTerms.apiAgreement.content"
            ></div>
          </div>

          <div class="terms-section">
            <h3>{{ serviceTerms.privacyPolicy.title }}</h3>
            <div
              class="terms-content"
              v-html="serviceTerms.privacyPolicy.content"
            ></div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">发展历程</h2>
        <div class="content-card timeline">
          <div
            v-for="(item, index) in timeline"
            :key="index"
            class="timeline-item"
          >
            <div class="timeline-point"></div>
            <div class="timeline-content">
              <h4>{{ item.year }}</h4>
              <p v-for="(event, eventIndex) in item.events" :key="eventIndex">
                {{ event }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">技术架构</h2>
        <div class="content-card tech-stack">
          <div class="tech-grid">
            <div
              v-for="(tech, index) in techStack"
              :key="index"
              class="tech-item"
            >
              <h4>{{ tech.title }}</h4>
              <ul>
                <li v-for="(item, itemIndex) in tech.items" :key="itemIndex">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">API类型</h2>
        <div class="content-card api-types">
          <div class="api-types-grid">
            <div
              v-for="(apiType, index) in apiTypes"
              :key="index"
              class="api-type-item"
            >
              <div class="icon">
                <el-icon v-if="index === 0"><Document /></el-icon>
                <el-icon v-else-if="index === 1"><Picture /></el-icon>
                <el-icon v-else><DataAnalysis /></el-icon>
              </div>
              <h4>{{ apiType.title }}</h4>
              <p>{{ apiType.description }}</p>
              <div v-html="apiType.features"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">开发者支持</h2>
        <div class="content-card dev-support">
          <div class="support-grid">
            <div
              v-for="(support, index) in devSupport"
              :key="index"
              class="support-item"
            >
              <div class="icon">
                <el-icon v-if="index === 0"><Reading /></el-icon>
                <el-icon v-else-if="index === 1"><ChatLineRound /></el-icon>
                <el-icon v-else-if="index === 2"><Promotion /></el-icon>
                <el-icon v-else><Opportunity /></el-icon>
              </div>
              <div class="content">
                <h4>{{ support.title }}</h4>
                <p>{{ support.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">数据统计</h2>
        <div class="content-card statistics">
          <div class="stats-grid">
            <div
              v-for="(stat, index) in statistics"
              :key="index"
              class="stat-item"
            >
              <div class="number">{{ stat.number }}</div>
              <div class="label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">用户评价</h2>
        <div class="content-card testimonials">
          <div class="testimonials-grid">
            <div
              v-for="(testimonial, index) in testimonials"
              :key="index"
              class="testimonial-item"
            >
              <div class="quote">"{{ testimonial.quote }}"</div>
              <div class="author">
                <span class="name">{{ testimonial.author.name }}</span>
                <span class="company">{{ testimonial.author.company }}</span>
              </div>
              <div class="rating">
                <span class="stars">{{ testimonial.rating }}</span>
                <span class="date">{{ testimonial.date }}</span>
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
.about-container {
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
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .company-intro {
    .company-info {
      h3 {
        font-size: 20px;
        color: #303133;
        margin: 0 0 12px 0;
        font-weight: 500;

        span {
          font-size: 12px;
          color: #606266;
          margin: 0 0 24px 0;
          line-height: 1.6;
        }
      }

      .contact-info {
        padding-top: 20px;
        border-top: 1px solid #ebeef5;
      }

      :deep(.contact-item) {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        color: #606266;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        i {
          font-size: 16px;
          color: #409eff;
          margin-right: 8px;
        }

        span {
          margin-right: 4px;
        }

        a {
          color: #409eff;
          text-decoration: none;
          transition: color 0.3s;

          &:hover {
            color: #66b1ff;
          }
        }
      }

      .intro-text {
        margin-bottom: 24px;

        :deep(p) {
          color: #606266;
          font-size: 14px;
          line-height: 1.8;
          margin-bottom: 16px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }

  .features {
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
    }

    .feature-item {
      text-align: center;
      padding: 24px;
      background: #f9fafc;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        background: #f5f7fa;
      }

      i {
        font-size: 32px;
        color: #409eff;
        margin-bottom: 16px;
      }

      h4 {
        font-size: 16px;
        color: #303133;
        margin: 0 0 12px 0;
        font-weight: 500;
      }

      p {
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
        margin: 0;
      }
    }
  }

  .terms {
    .terms-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      h3 {
        font-size: 16px;
        color: #303133;
        margin: 0 0 16px 0;
        font-weight: 500;
      }
    }

    .terms-content {
      color: #606266;
      font-size: 14px;
      line-height: 1.8;

      :deep(p) {
        margin: 0 0 12px 0;

        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(.highlight) {
        color: #409eff;
        font-weight: 500;
      }
    }

    :deep(.numbered-list) {
      margin: 0;
      padding-left: 20px;

      li {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    :deep(.bullet-list) {
      margin: 12px 0 0 0;
      padding-left: 20px;
      list-style-type: disc;

      li {
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .timeline {
    position: relative;
    padding: 20px 0;

    &::before {
      content: '';
      position: absolute;
      left: 20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #ebeef5;
    }

    .timeline-item {
      position: relative;
      padding-left: 45px;
      margin-bottom: 32px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .timeline-point {
      position: absolute;
      left: 13px;
      top: 0;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid #409eff;
    }

    .timeline-content {
      h4 {
        font-size: 16px;
        color: #303133;
        margin: 0 0 12px 0;
        font-weight: 500;
      }

      p {
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
        margin: 0 0 8px 0;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .tech-stack {
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
    }

    .tech-item {
      background: #fff;

      h4 {
        font-size: 16px;
        color: #303133;
        margin: 0 0 16px 0;
        font-weight: 500;
        padding-left: 12px;
        border-left: 3px solid #409eff;
      }

      ul {
        margin: 0;
        padding-left: 20px;
        list-style-type: disc;

        li {
          color: #606266;
          font-size: 14px;
          line-height: 2;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }

  .api-types {
    .api-types-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;

      .api-type-item {
        background: #f9fafc;
        border-radius: 8px;
        padding: 24px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          background: #f5f7fa;
        }

        .icon {
          font-size: 32px;
          color: #409eff;
          margin-bottom: 16px;
        }

        h4 {
          font-size: 18px;
          color: #303133;
          margin: 0 0 12px;
          font-weight: 500;
        }

        p {
          font-size: 14px;
          color: #606266;
          line-height: 1.6;
          margin: 0 0 16px;
        }

        :deep(.feature-list) {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            font-size: 14px;
            color: #606266;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;

            &:before {
              content: '•';
              color: #409eff;
              position: absolute;
              left: 0;
            }

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
  }

  .dev-support {
    .support-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;

      .support-item {
        background: #f9fafc;
        border-radius: 8px;
        padding: 24px;
        display: flex;
        align-items: flex-start;
        gap: 16px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          background: #f5f7fa;
        }

        .icon {
          font-size: 24px;
          color: #409eff;
          padding: 12px;
          background: #ecf5ff;
          border-radius: 8px;
        }

        .content {
          flex: 1;

          h4 {
            font-size: 16px;
            color: #303133;
            margin: 0 0 8px;
            font-weight: 500;
          }

          p {
            font-size: 14px;
            color: #606266;
            line-height: 1.6;
            margin: 0;
          }
        }
      }
    }
  }

  .statistics {
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 24px;

      .stat-item {
        text-align: center;
        padding: 24px;
        background: #f9fafc;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          background: #f5f7fa;
        }

        .number {
          font-size: 32px;
          font-weight: 600;
          color: #409eff;
          margin-bottom: 8px;
        }

        .label {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }

  .testimonials {
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .testimonial-item {
      padding: 24px;
      background: #f9fafc;
      border-radius: 8px;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      height: 100%;

      &:hover {
        transform: translateY(-2px);
        background: #f5f7fa;
      }

      .quote {
        font-size: 14px;
        color: #303133;
        margin: 0 0 16px 0;
        line-height: 1.8;
        font-style: italic;
        flex: 1;
      }

      .author {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .name {
          font-weight: 500;
          color: #303133;
          font-size: 14px;
        }

        .company {
          color: #909399;
          font-size: 13px;
        }
      }

      .rating {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .stars {
          color: #f7ba2a;
          font-size: 14px;
        }

        .date {
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .about-container {
    .container {
      width: 95%;
    }

    .content-card {
      padding: 20px;
    }

    .company-intro {
      .company-info {
        h3 {
          font-size: 18px;
        }

        .contact-item {
          font-size: 13px;
        }
      }
    }

    .features {
      .feature-grid {
        gap: 16px;
      }

      .feature-item {
        padding: 20px;

        i {
          font-size: 28px;
          margin-bottom: 12px;
        }

        h4 {
          font-size: 15px;
          margin-bottom: 8px;
        }

        p {
          font-size: 13px;
        }
      }
    }

    .terms {
      .terms-section {
        h3 {
          font-size: 15px;
        }
      }

      .terms-content {
        font-size: 13px;
      }
    }

    .timeline {
      .timeline-item {
        padding-left: 35px;
        margin-bottom: 24px;
      }

      .timeline-point {
        width: 12px;
        height: 12px;
        left: 11px;
      }

      .timeline-content {
        h4 {
          font-size: 15px;
          margin-bottom: 8px;
        }

        p {
          font-size: 13px;
        }
      }
    }

    .tech-stack {
      .tech-grid {
        gap: 16px;
      }

      .tech-item {
        h4 {
          font-size: 15px;
          margin-bottom: 12px;
        }

        ul li {
          font-size: 13px;
          line-height: 1.8;
        }
      }
    }

    .testimonials {
      .testimonial-item {
        padding: 20px;

        .quote {
          font-size: 14px;
        }

        .author {
          .name {
            font-size: 13px;
          }

          .company {
            font-size: 12px;
          }
        }
      }
    }

    .api-types {
      .api-types-grid {
        gap: 16px;

        .api-type-item {
          padding: 20px;

          .icon {
            font-size: 28px;
            margin-bottom: 12px;
          }

          h4 {
            font-size: 16px;
            margin-bottom: 8px;
          }

          p {
            font-size: 13px;
            margin-bottom: 12px;
          }

          .feature-list li {
            font-size: 13px;
            margin-bottom: 6px;
          }
        }
      }
    }

    .dev-support {
      .support-grid {
        gap: 16px;

        .support-item {
          padding: 20px;

          .icon {
            font-size: 20px;
            padding: 10px;
          }

          .content {
            h4 {
              font-size: 15px;
              margin-bottom: 6px;
            }

            p {
              font-size: 13px;
            }
          }
        }
      }
    }
  }
}
</style>
