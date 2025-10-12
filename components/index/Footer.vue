<script setup>
const props = defineProps(['options'])
</script>

<template>
  <footer class="modern-footer">
    <!-- 主要内容区域 -->
    <div class="footer-main">
      <div class="footer-container">
        <!-- 品牌区域 -->
        <div class="brand-section">
          <div class="brand-logo">
            <div class="logo-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="url(#gradient1)" />
                <path
                  d="M24 12L36 20V28L24 36L12 28V20L24 12Z"
                  fill="white"
                  opacity="0.9"
                />
                <path d="M24 18L30 22V26L24 30L18 26V22L24 18Z" fill="white" />
                <defs>
                  <linearGradient
                    id="gradient1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" style="stop-color: #667eea" />
                    <stop offset="100%" style="stop-color: #764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="brand-text">
              <h3>{{ props.options?.website_name }}</h3>
              <p>{{ props.options?.slogan }}</p>
            </div>
          </div>
          <p class="brand-description">
            {{ props.options?.description }}
          </p>
          <!-- <div class="social-links">
            <a href="#" class="social-link" title="微信">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M8.5 12.5c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zm7 0c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1z"
                />
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                />
              </svg>
            </a>
            <a href="#" class="social-link" title="QQ">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-1.5-1.5L10 14l2-2 2 2 1.5 1.5L14 17l-2-2-2 2z"
                />
              </svg>
            </a>
            <a
              href="https://github.com"
              class="social-link"
              title="GitHub"
              target="_blank"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
            </a>
          </div> -->
        </div>

        <!-- 产品服务 -->
        <!-- <div class="footer-column">
          <h4>产品服务</h4>
          <ul class="footer-links">
            <li><a href="/doc/api">API文档</a></li>
            <li><a href="/doc/sdk">SDK下载</a></li>
            <li><a href="/pricing">价格方案</a></li>
            <li><a href="/status">服务状态</a></li>
            <li><a href="/changelog">更新日志</a></li>
          </ul>
        </div> -->

        <!-- 开发者 -->
        <!-- <div class="footer-column">
          <h4>开发者</h4>
          <ul class="footer-links">
            <li><a href="/doc/guide">快速开始</a></li>
            <li><a href="/doc/examples">代码示例</a></li>
            <li><a href="/doc/faq">常见问题</a></li>
            <li><a href="/community">开发者社区</a></li>
            <li><a href="/blog">技术博客</a></li>
          </ul>
        </div> -->

        <!-- 支持帮助 -->
        <div class="footer-column">
          <h4>支持帮助</h4>
          <ul class="footer-links">
            <li><a href="/terms">服务条款</a></li>
            <li><a href="/privacy">隐私政策</a></li>
          </ul>
        </div>

        <!-- 联系信息 -->
        <div class="footer-column contact-column">
          <h4>联系我们</h4>
          <div class="contact-info">
            <div class="contact-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                />
              </svg>
              <span>{{ props.options?.contact_email }}</span>
            </div>
            <div class="contact-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                />
              </svg>
              <span>{{ props.options?.contact_phone }}</span>
            </div>
            <div class="contact-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                />
              </svg>
              <span>{{ props.options?.contact_address }}</span>
            </div>
            <div class="contact-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
                />
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
              <span>{{ props.options?.working_hours }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版权区域 -->
    <div class="footer-bottom">
      <div class="footer-container">
        <div class="bottom-content">
          <div class="copyright">
            <p>&copy; 2025 {{ props.options?.website_name }}. 保留所有权利.</p>
            <div class="legal-links">
              <span v-if="props.options?.icp">
                <a href="https://beian.miit.gov.cn/" target="_blank">{{
                  props.options.icp
                }}</a>
              </span>
              <span v-if="props.options?.gongan" class="gongan-info">
                <img
                  src="@/assets/images/gongan.png"
                  width="14"
                  height="14"
                  alt=""
                />
                <a
                  target="_blank"
                  :href="
                    'https://beian.mps.gov.cn/#/query/webSearch?code=' +
                    props.options.gongan
                  "
                  >{{ props.options.gongan }}</a
                >
              </span>
              <span v-if="props.options.valueAddedTelecomLicense"
                ><a
                  :href="
                    'https://tsm.miit.gov.cn/dxxzsp/xkz/xkzgl/resource/qiyesearch.jsp?num=' +
                    props.options.valueAddedTelecomLicense +
                    '&type=xuke'
                  "
                  target="_blank"
                  >增值电信业务经营许可证
                  {{ props.options.valueAddedTelecomLicense }}</a
                >
              </span>
            </div>
          </div>
          <div class="footer-meta">
            <span>{{ props.options?.company_name }}</span>
            <span class="separator">|</span>
            <span>{{ props.options?.slogan }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空的custom-tabbar保持兼容性 -->
    <nav class="custom-tabbar">
      <!-- 内容已删除 -->
    </nav>
  </footer>
</template>

<style lang="less" scoped>
.modern-footer {
  background: #fff;
  color: #606266;
  margin-top: 60px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23409eff" opacity="0.02"/><circle cx="75" cy="75" r="1" fill="%23409eff" opacity="0.02"/><circle cx="50" cy="10" r="0.5" fill="%23409eff" opacity="0.01"/><circle cx="10" cy="60" r="0.5" fill="%23409eff" opacity="0.01"/><circle cx="90" cy="40" r="0.5" fill="%23409eff" opacity="0.01"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    position: relative;
    z-index: 1;
  }

  .footer-main {
    padding: 60px 0 40px;

    .footer-container {
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr;
      gap: 40px;

      @media (max-width: 1024px) {
        grid-template-columns: 2fr 1fr 1fr;
        gap: 30px;
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 40px;
        text-align: center;
      }
    }
  }

  .brand-section {
    .brand-logo {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      @media (max-width: 768px) {
        justify-content: center;
      }

      .logo-icon {
        margin-right: 16px;
        flex-shrink: 0;
      }

      .brand-text {
        h3 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: #409eff;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #606266;
          font-weight: 500;
        }
      }
    }

    .brand-description {
      color: #606266;
      line-height: 1.6;
      margin-bottom: 24px;
      font-size: 14px;
    }

    .social-links {
      display: flex;
      gap: 12px;

      @media (max-width: 768px) {
        justify-content: center;
      }

      .social-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: #f5f7fa;
        border: 1px solid #ebeef5;
        border-radius: 50%;
        color: #606266;
        text-decoration: none;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);

        &:hover {
          background: #409eff;
          border-color: #409eff;
          color: #fff;
          transform: translateY(-2px);
        }
      }
    }
  }

  .footer-column {
    h4 {
      color: #1f2f3d;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      position: relative;
      padding-bottom: 8px;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 30px;
        height: 2px;
        background: #409eff;
        border-radius: 1px;

        @media (max-width: 768px) {
          left: 50%;
          transform: translateX(-50%);
        }
      }
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 12px;

        a {
          color: #606266;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.3s ease;
          display: inline-block;

          &:hover {
            color: #409eff;
            transform: translateX(4px);
          }
        }
      }
    }

    &.contact-column {
      .contact-info {
        .contact-item {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          color: #606266;
          font-size: 14px;

          @media (max-width: 768px) {
            justify-content: center;
          }

          svg {
            margin-right: 12px;
            color: #409eff;
            flex-shrink: 0;
          }

          span {
            line-height: 1.4;
          }
        }
      }
    }
  }

  .footer-bottom {
    background: #f5f7fa;
    padding: 24px 0;
    border-top: 1px solid #ebeef5;

    .bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;

      @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
      }

      .copyright {
        p {
          margin: 0 0 8px 0;
          color: #909399;
          font-size: 13px;
        }

        .legal-links {
          display: flex;
          gap: 16px;
          align-items: center;
          font-size: 12px;

          @media (max-width: 768px) {
            justify-content: center;
          }

          a {
            color: #606266;
            text-decoration: none;
            transition: color 0.3s ease;

            &:hover {
              color: #409eff;
            }
          }

          .gongan-info {
            display: flex;
            align-items: center;
            gap: 4px;

            img {
              opacity: 0.7;
            }
          }
        }
      }

      .footer-meta {
        color: #909399;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;

        .separator {
          opacity: 0.5;
        }
      }
    }
  }

  .custom-tabbar {
    // 保持空的以维持兼容性
    display: none;
  }
}

// 响应式优化
@media (max-width: 480px) {
  .modern-footer {
    .footer-main {
      padding: 40px 0 30px;
    }

    .brand-section {
      .brand-logo {
        flex-direction: column;
        text-align: center;

        .logo-icon {
          margin-right: 0;
          margin-bottom: 12px;
        }
      }
    }

    .footer-container {
      padding: 0 16px;
    }
  }
}
</style>
