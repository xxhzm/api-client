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

const options = useState('options')

const aboutData = ref({})

const {
  data: { value: aboutRes },
} = await useAsyncData('AboutInfo', () => $myFetch('AboutInfo'))

aboutData.value = aboutRes.data

const companyInfo = ref(aboutData.value.companyInfo || {})
const features = ref(aboutData.value.features || [])
const timeline = ref(aboutData.value.timeline || [])
const techStack = ref(aboutData.value.techStack || [])
const apiTypes = ref(aboutData.value.apiTypes || [])
const devSupport = ref(aboutData.value.devSupport || [])
const statistics = ref(aboutData.value.statistics || [])
const testimonials = ref(aboutData.value.testimonials || [])

const featureIcons = [Lightning, Lock, DataLine, Service]
const apiTypeIcons = [Document, Picture, DataAnalysis]
const devSupportIcons = [Reading, ChatLineRound, Promotion, Opportunity]
const featureColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']
const apiTypeColors = ['#3b82f6', '#10b981', '#8b5cf6']
const devSupportColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

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
  <div class="about-page">
    <IndexNavbar></IndexNavbar>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg-pattern"></div>
      <div class="container hero-container">
        <div class="hero-content">
          <div class="badge"><span class="badge-dot"></span> 关于我们</div>
          <h1 class="hero-title">
            {{ companyInfo.name || '关于我们' }}
          </h1>
          <p class="hero-subtitle" v-if="companyInfo.slogan">
            {{ companyInfo.slogan }}
          </p>
          <div class="hero-desc" v-html="companyInfo.description"></div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="section stats-section" v-if="statistics.length">
      <div class="container">
        <div class="stats-bar">
          <div
            v-for="(stat, index) in statistics"
            :key="index"
            class="stat-item"
          >
            <div class="stat-value">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Info -->
    <section class="section contact-section" v-if="companyInfo.contact">
      <div class="container">
        <div class="contact-card">
          <div class="contact-content" v-html="companyInfo.contact"></div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="section features-section" v-if="features.length">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">服务优势</h2>
          <p class="section-desc">全方位技术保障，为您的业务保驾护航</p>
        </div>
        <div class="features-grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card"
          >
            <div
              class="icon-box"
              :style="{
                backgroundColor: `${featureColors[index % featureColors.length]}15`,
                color: featureColors[index % featureColors.length],
              }"
            >
              <el-icon>
                <component :is="featureIcons[index % featureIcons.length]" />
              </el-icon>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- API Types Section -->
    <section class="section api-section" v-if="apiTypes.length">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">API 服务类型</h2>
          <p class="section-desc">丰富的接口类型，满足多样化业务需求</p>
        </div>
        <div class="api-grid">
          <div
            v-for="(apiType, index) in apiTypes"
            :key="index"
            class="api-card"
          >
            <div
              class="icon-box"
              :style="{
                backgroundColor: `${apiTypeColors[index % apiTypeColors.length]}15`,
                color: apiTypeColors[index % apiTypeColors.length],
              }"
            >
              <el-icon>
                <component :is="apiTypeIcons[index % apiTypeIcons.length]" />
              </el-icon>
            </div>
            <h3 class="api-title">{{ apiType.title }}</h3>
            <p class="api-desc">{{ apiType.description }}</p>
            <div class="api-features" v-html="apiType.features"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack Section -->
    <section class="section tech-section" v-if="techStack.length">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">技术架构</h2>
          <p class="section-desc">采用行业领先技术栈，确保高性能与高可用</p>
        </div>
        <div class="tech-grid">
          <div
            v-for="(tech, index) in techStack"
            :key="index"
            class="tech-card"
          >
            <div class="tech-indicator" :style="{ backgroundColor: featureColors[index % featureColors.length] }"></div>
            <h3 class="tech-title">{{ tech.title }}</h3>
            <ul class="tech-list">
              <li v-for="(item, itemIndex) in tech.items" :key="itemIndex">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Dev Support Section -->
    <section class="section support-section" v-if="devSupport.length">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">开发者支持</h2>
          <p class="section-desc">完善的开发者生态，助力快速接入与高效开发</p>
        </div>
        <div class="support-grid">
          <div
            v-for="(support, index) in devSupport"
            :key="index"
            class="support-card"
          >
            <div
              class="icon-box"
              :style="{
                backgroundColor: `${devSupportColors[index % devSupportColors.length]}15`,
                color: devSupportColors[index % devSupportColors.length],
              }"
            >
              <el-icon>
                <component
                  :is="devSupportIcons[index % devSupportIcons.length]"
                />
              </el-icon>
            </div>
            <div class="support-content">
              <h3>{{ support.title }}</h3>
              <p>{{ support.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline Section -->
    <section class="section timeline-section" v-if="timeline.length">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">发展历程</h2>
          <p class="section-desc">不断突破，持续为用户创造更大价值</p>
        </div>
        <div class="timeline-container">
          <div class="timeline-line"></div>
          <div
            v-for="(item, index) in timeline"
            :key="index"
            class="timeline-item"
            :class="{ even: index % 2 === 1 }"
          >
            <div class="timeline-marker">
              <div class="marker-dot"></div>
            </div>
            <div class="timeline-card">
              <div class="timeline-year">{{ item.year }}</div>
              <div class="timeline-events">
                <p v-for="(event, eventIndex) in item.events" :key="eventIndex">
                  {{ event }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="section testimonials-section" v-if="testimonials.length">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">用户评价</h2>
          <p class="section-desc">来自真实用户的声音，是我们前行的最大动力</p>
        </div>
        <div class="testimonials-grid">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="testimonial-card"
          >
            <div class="quote-icon">"</div>
            <div class="quote-text">{{ testimonial.quote }}</div>
            <div class="testimonial-footer">
              <div class="author-info">
                <div class="author-avatar">
                  {{ testimonial.author.name?.substring(0, 1) }}
                </div>
                <div>
                  <div class="author-name">{{ testimonial.author.name }}</div>
                  <div class="author-company">
                    {{ testimonial.author.company }}
                  </div>
                </div>
              </div>
              <div class="rating-info">
                <span class="stars">{{ testimonial.rating }}</span>
                <span class="date">{{ testimonial.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Legal Links Section -->
    <section class="section legal-section">
      <div class="container">
        <div class="legal-bar">
          <div class="legal-text">了解我们的服务规则与数据保护承诺</div>
          <div class="legal-links">
            <NuxtLink to="/terms" class="legal-link">
              <el-icon><Document /></el-icon>
              服务条款
            </NuxtLink>
            <NuxtLink to="/privacy" class="legal-link">
              <el-icon><Lock /></el-icon>
              隐私政策
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less" scoped>
.about-page {
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
    font-size: 20px;
    line-height: 1.6;
    color: #3b82f6;
    margin-bottom: 24px;
    font-weight: 500;
  }

  .hero-desc {
    :deep(p) {
      font-size: 17px;
      line-height: 1.8;
      color: #64748b;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

/* Statistics Bar */
.stats-section {
  padding: 0;
  margin-top: -40px;
  position: relative;
  z-index: 2;

  .stats-bar {
    display: flex;
    background: #0f172a;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
    justify-content: space-around;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 32px;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #94a3b8;
        font-weight: 500;
      }
    }
  }
}

/* Contact Section */
.contact-section {
  padding: 60px 0 0;

  .contact-card {
    background: white;
    border-radius: 16px;
    padding: 40px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

    .contact-content {
      :deep(.contact-item) {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        color: #475569;
        font-size: 15px;

        &:last-child {
          margin-bottom: 0;
        }

        i {
          font-size: 18px;
          color: #3b82f6;
          margin-right: 10px;
        }

        span {
          margin-right: 4px;
        }

        a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;

          &:hover {
            color: #3b82f6;
          }
        }
      }
    }
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

/* Features Grid */
.features-section {
  background-color: #f8fafc;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;

  .feature-card {
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

    .feature-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .feature-desc {
      font-size: 15px;
      line-height: 1.6;
      color: #64748b;
      margin: 0;
    }
  }
}

/* API Types Grid */
.api-section {
  background: white;
}

.api-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  .api-card {
    padding: 36px;
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
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

    .api-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .api-desc {
      font-size: 15px;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 20px;
    }

    .api-features {
      :deep(.feature-list) {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          font-size: 14px;
          color: #475569;
          margin-bottom: 10px;
          padding-left: 22px;
          position: relative;
          line-height: 1.6;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 8px;
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

/* Tech Stack */
.tech-section {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 28px;

  .tech-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    border: 1px solid #f1f5f9;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.1);
      border-color: transparent;
    }

    .tech-indicator {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
    }

    .tech-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 20px;
    }

    .tech-list {
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        color: #475569;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 12px;
        padding-left: 20px;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #cbd5e1;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

/* Dev Support */
.support-section {
  background: white;
}

.support-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;

  .support-card {
    display: flex;
    align-items: flex-start;
    gap: 20px;
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
      font-size: 24px;
      flex-shrink: 0;
    }

    .support-content {
      flex: 1;

      h3 {
        font-size: 18px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 8px;
      }

      p {
        font-size: 15px;
        color: #64748b;
        line-height: 1.6;
        margin: 0;
      }
    }
  }
}

/* Timeline */
.timeline-section {
  background: #f8fafc;
}

.timeline-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto;

  .timeline-line {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e2e8f0;
    transform: translateX(-50%);
  }

  .timeline-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 40px;
    position: relative;

    &:last-child {
      margin-bottom: 0;
    }

    .timeline-marker {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1;

      .marker-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #3b82f6;
        border: 4px solid #f8fafc;
        box-shadow: 0 0 0 2px #3b82f6;
      }
    }

    .timeline-card {
      width: calc(50% - 40px);
      background: white;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #f1f5f9;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 8px 24px -6px rgba(15, 23, 42, 0.1);
        border-color: transparent;
      }

      .timeline-year {
        font-size: 20px;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 12px;
      }

      .timeline-events p {
        font-size: 14px;
        color: #64748b;
        line-height: 1.7;
        margin: 0 0 8px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    &.even {
      justify-content: flex-end;
    }
  }
}

/* Testimonials */
.testimonials-section {
  background: white;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;

  .testimonial-card {
    padding: 32px;
    background: white;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.1);
      border-color: transparent;
    }

    .quote-icon {
      font-size: 48px;
      color: #e2e8f0;
      font-family: Georgia, serif;
      line-height: 1;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .quote-text {
      font-size: 15px;
      color: #334155;
      line-height: 1.8;
      flex: 1;
      margin-bottom: 24px;
    }

    .testimonial-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .author-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 700;
      }

      .author-name {
        font-size: 15px;
        font-weight: 600;
        color: #0f172a;
      }

      .author-company {
        font-size: 13px;
        color: #94a3b8;
      }
    }

    .rating-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;

      .stars {
        color: #f59e0b;
        font-size: 14px;
      }

      .date {
        color: #94a3b8;
        font-size: 12px;
      }
    }
  }
}

/* Legal Links */
.legal-section {
  padding: 60px 0;
  background: #f8fafc;

  .legal-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    border-radius: 16px;
    padding: 32px 40px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

    .legal-text {
      font-size: 16px;
      color: #475569;
      font-weight: 500;
    }

    .legal-links {
      display: flex;
      gap: 16px;
    }

    .legal-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      background: #f1f5f9;
      color: #0f172a;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;

      .el-icon {
        font-size: 16px;
      }

      &:hover {
        background: #0f172a;
        color: white;
      }
    }
  }
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .api-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .support-grid {
    grid-template-columns: 1fr;
  }

  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .timeline-container {
    .timeline-line {
      left: 20px;
    }

    .timeline-item {
      .timeline-marker {
        left: 20px;
      }

      .timeline-card {
        width: calc(100% - 60px);
        margin-left: 60px;
      }

      &.even {
        justify-content: flex-start;

        .timeline-card {
          margin-left: 60px;
        }
      }
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
      font-size: 17px;
    }

    .hero-desc {
      :deep(p) {
        font-size: 15px;
      }
    }
  }

  .stats-section {
    margin-top: -30px;

    .stats-bar {
      padding: 28px 20px;
      border-radius: 12px;
      flex-wrap: wrap;
      gap: 24px;

      .stat-item {
        min-width: calc(50% - 12px);

        .stat-value {
          font-size: 24px;
        }

        .stat-label {
          font-size: 13px;
        }
      }
    }
  }

  .contact-section {
    padding: 40px 0 0;

    .contact-card {
      padding: 28px 20px;
      border-radius: 12px;
    }
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;

    .feature-card {
      padding: 24px;

      .icon-box {
        width: 48px;
        height: 48px;
        font-size: 24px;
        margin-bottom: 16px;
      }

      .feature-title {
        font-size: 18px;
        margin-bottom: 8px;
      }

      .feature-desc {
        font-size: 14px;
      }
    }
  }

  .api-grid {
    grid-template-columns: 1fr;
    gap: 20px;

    .api-card {
      padding: 24px;

      .icon-box {
        width: 48px;
        height: 48px;
        font-size: 24px;
        margin-bottom: 16px;
      }

      .api-title {
        font-size: 18px;
      }

      .api-desc {
        font-size: 14px;
        margin-bottom: 16px;
      }

      .api-features :deep(.feature-list li) {
        font-size: 13px;
      }
    }
  }

  .tech-grid {
    gap: 20px;

    .tech-card {
      padding: 24px;
      border-radius: 12px;
    }
  }

  .support-grid {
    gap: 16px;

    .support-card {
      padding: 24px;

      .icon-box {
        width: 44px;
        height: 44px;
        font-size: 20px;
      }

      .support-content {
        h3 {
          font-size: 16px;
        }

        p {
          font-size: 14px;
        }
      }
    }
  }

  .timeline-container {
    .timeline-line {
      left: 16px;
    }

    .timeline-item {
      margin-bottom: 24px;

      .timeline-marker {
        left: 16px;

        .marker-dot {
          width: 12px;
          height: 12px;
          border-width: 3px;
        }
      }

      .timeline-card {
        width: calc(100% - 48px);
        margin-left: 48px;
        padding: 20px;
        border-radius: 10px;

        .timeline-year {
          font-size: 17px;
          margin-bottom: 8px;
        }

        .timeline-events p {
          font-size: 13px;
        }
      }

      &.even .timeline-card {
        margin-left: 48px;
      }
    }
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
    gap: 20px;

    .testimonial-card {
      padding: 24px;

      .quote-icon {
        font-size: 36px;
      }

      .quote-text {
        font-size: 14px;
        margin-bottom: 20px;
      }

      .author-info {
        .author-avatar {
          width: 36px;
          height: 36px;
          font-size: 14px;
        }

        .author-name {
          font-size: 14px;
        }

        .author-company {
          font-size: 12px;
        }
      }
    }
  }

  .legal-section {
    padding: 40px 0;

    .legal-bar {
      flex-direction: column;
      text-align: center;
      gap: 20px;
      padding: 24px 20px;
      border-radius: 12px;

      .legal-text {
        font-size: 15px;
      }

      .legal-links {
        width: 100%;
        flex-direction: column;
        gap: 12px;
      }

      .legal-link {
        justify-content: center;
        padding: 12px 20px;
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
      font-size: 15px;
      margin-bottom: 16px;
    }

    .badge {
      font-size: 12px;
      padding: 5px 10px;
      margin-bottom: 16px;
    }
  }

  .stats-section {
    .stats-bar {
      padding: 24px 16px;
      gap: 20px;

      .stat-item {
        .stat-value {
          font-size: 20px;
        }

        .stat-label {
          font-size: 12px;
        }
      }
    }
  }

  .features-grid .feature-card {
    padding: 20px;

    .icon-box {
      width: 44px;
      height: 44px;
      font-size: 22px;
      border-radius: 10px;
    }

    .feature-title {
      font-size: 16px;
    }

    .feature-desc {
      font-size: 13px;
    }
  }

  .api-grid .api-card {
    padding: 20px;

    .api-title {
      font-size: 16px;
    }

    .api-desc {
      font-size: 13px;
    }
  }

  .support-grid .support-card {
    padding: 20px;
    gap: 14px;

    .icon-box {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }

    .support-content {
      h3 {
        font-size: 15px;
      }

      p {
        font-size: 13px;
      }
    }
  }

}
</style>
