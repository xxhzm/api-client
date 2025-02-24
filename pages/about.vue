<template>
  <div class="about-container">
    <IndexNotice></IndexNotice>
    <div class="container">
      <div class="section">
        <h2 class="section-title">关于我们</h2>
        <div class="content-card company-intro">
          <div class="company-info">
            <h3>滕州市星语软件开发工作室</h3>
            <p class="slogan">致力于为用户提供稳定、快速的API接口服务平台</p>
            <div class="intro-text">
              <p>
                小小API平台成立于2022年，是一家专注于API接口服务的技术团队。我们始终秉持"稳定、快速、专业"的服务理念，致力于为开发者提供高质量的API接口服务。
              </p>
              <p>
                经过多年发展，我们已累计服务超过10000+开发者，日均调用量突破100万次。我们的API覆盖文本处理、图像识别、数据查询等多个领域，能够满足各类开发场景的需求。
              </p>
              <p>
                未来，我们将持续优化服务质量，不断扩展API品类，为用户提供更多优质、实用的接口服务。同时，我们也在积极探索新技术领域，努力为行业发展贡献力量。
              </p>
            </div>
            <div class="contact-info">
              <div class="contact-item">
                <el-icon>
                  <Message />
                </el-icon>
                <span>反馈邮箱：</span>
                <a href="mailto:admin@xxhzm.cn">admin@xxhzm.cn</a>
              </div>
              <div class="contact-item">
                <el-icon>
                  <User />
                </el-icon>
                <span>商务微信：</span>
                <span>13188880632（备注需求）</span>
              </div>
              <div class="contact-item">
                <el-icon><ChatDotSquare /></el-icon>
                <span>用户交流群：</span>
                <a
                  href="https://jq.qq.com/?_wv=1027&k=92BF8Ndr"
                  target="_blank"
                  class="link"
                  >点击加入QQ群</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">服务优势</h2>
        <div class="content-card features">
          <div class="feature-grid">
            <div class="feature-item">
              <el-icon><Lightning /></el-icon>
              <h4>高性能</h4>
              <p>采用分布式架构，确保接口快速响应，平均响应时间<100ms</p>
            </div>
            <div class="feature-item">
              <el-icon><Lock /></el-icon>
              <h4>安全可靠</h4>
              <p>数据传输采用SSL加密，多重安全防护，确保数据安全</p>
            </div>
            <div class="feature-item">
              <el-icon><DataLine /></el-icon>
              <h4>稳定性高</h4>
              <p>服务可用性99.9%，多机房容灾备份，确保服务稳定</p>
            </div>
            <div class="feature-item">
              <el-icon><Service /></el-icon>
              <h4>专业支持</h4>
              <p>7*24小时技术支持，专业团队快速响应解决问题</p>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">服务条款</h2>
        <div class="content-card terms">
          <div class="terms-section">
            <h3>服务说明</h3>
            <div class="terms-content">
              <p>
                小小API（以下简称"本平台"）是由滕州市星语软件开发工作室开发并运营的API接口服务平台，本平台所提供的各项服务的所有权和运作权归滕州市星语软件开发工作室所有。
              </p>
              <p>服务地址：<span class="highlight">https://xxapi.cn</span></p>
            </div>
          </div>

          <div class="terms-section">
            <h3>API服务协议</h3>
            <div class="terms-content">
              <ol class="numbered-list">
                <li>
                  本平台根据不同API功能制定相应的请求频次限制，以确保服务质量。
                </li>
                <li>
                  用户不得进行恶意请求或数据采集，违者将被限制使用或封禁IP。
                </li>
                <li>
                  本平台保留根据实际运营情况调整服务内容和收费标准的权利。
                </li>
                <li>
                  用户注册即表示同意本平台在遵守隐私保护义务的前提下合理使用相关数据。
                </li>
              </ol>
            </div>
          </div>

          <div class="terms-section">
            <h3>隐私保护</h3>
            <div class="terms-content">
              <p>我们重视用户的隐私保护，承诺：</p>
              <ul class="bullet-list">
                <li>严格保护用户信息安全</li>
                <li>不会泄露用户隐私数据</li>
                <li>遵守相关法律法规要求</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">发展历程</h2>
        <div class="content-card timeline">
          <div class="timeline-item">
            <div class="timeline-point"></div>
            <div class="timeline-content">
              <h4>2022年</h4>
              <p>小小API平台正式成立，发布首批基础API接口服务</p>
              <p>首月服务用户突破1000+</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-point"></div>
            <div class="timeline-content">
              <h4>2023年</h4>
              <p>升级基础设施，提升服务质量</p>
              <p>推出企业版API服务，支持定制化解决方案</p>
              <p>日调用量突破50万次</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-point"></div>
            <div class="timeline-content">
              <h4>2024年</h4>
              <p>全面升级分布式架构，性能提升300%</p>
              <p>推出开发者合作计划</p>
              <p>累计服务开发者超10000+</p>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">技术架构</h2>
        <div class="content-card tech-stack">
          <div class="tech-grid">
            <div class="tech-item">
              <h4>基础设施</h4>
              <ul>
                <li>多区域负载均衡</li>
                <li>分布式集群部署</li>
                <li>CDN全球加速</li>
                <li>自动弹性伸缩</li>
              </ul>
            </div>
            <div class="tech-item">
              <h4>安全防护</h4>
              <ul>
                <li>HTTPS加密传输</li>
                <li>WAF防火墙</li>
                <li>DDoS防护</li>
                <li>数据加密存储</li>
              </ul>
            </div>
            <div class="tech-item">
              <h4>监控运维</h4>
              <ul>
                <li>7*24小时监控</li>
                <li>故障自动报警</li>
                <li>性能实时分析</li>
                <li>日志实时采集</li>
              </ul>
            </div>
            <div class="tech-item">
              <h4>服务保障</h4>
              <ul>
                <li>99.9%可用性</li>
                <li>毫秒级响应</li>
                <li>自动容灾切换</li>
                <li>全量数据备份</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<script setup>
import {
  Message,
  User,
  ChatDotSquare,
  Lightning,
  DataLine,
  Service,
  Lock,
} from '@element-plus/icons-vue'
const { $myFetch } = useNuxtApp()

// 配置项
const options = ref({})

const {
  data: { value: res },
} = await useAsyncData('Options', () => $myFetch('Options'))

options.value = res.data

useHead({
  title: '关于我们' + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [{ name: 'description', content: '小小API-关于我们' }],
})
</script>

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
      }

      .slogan {
        font-size: 15px;
        color: #606266;
        margin: 0 0 24px 0;
        line-height: 1.6;
      }

      .contact-info {
        padding-top: 20px;
        border-top: 1px solid #ebeef5;
      }

      .contact-item {
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

        p {
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

      p {
        margin: 0 0 12px 0;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .highlight {
        color: #409eff;
        font-weight: 500;
      }
    }

    .numbered-list {
      margin: 0;
      padding-left: 20px;

      li {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .bullet-list {
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

        .slogan {
          font-size: 14px;
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
  }
}
</style>
