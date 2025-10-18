<script setup>
// 纯展示组件，无需脚本逻辑
</script>

<template>
  <section class="why-choose-us">
    <div class="container">
      <div class="header">
        <h2 class="title">为什么选择我们</h2>
        <p class="subtitle">
          提供海量API接口，完善文档与调试工具，帮助开发者快速集成与上线。
        </p>
      </div>

      <div class="cards">
        <div class="card">
          <div class="content">
            <h3>高性能分布式架构</h3>
            <p>
              采用多节点分布式部署与智能负载均衡，支持水平扩展与高并发处理，保障接口在海量请求下依旧稳定高效。
            </p>
            <div class="tags">
              <span class="tag">分布式</span>
              <span class="tag">高可用</span>
              <span class="tag">自动扩展</span>
            </div>
          </div>
          <div class="icon">
            <img
              src="@/assets/images/diverse-config.svg"
              alt="统一鉴权与流量治理"
            />
          </div>
        </div>

        <div class="card">
          <div class="content">
            <h3>完善的安全体系</h3>
            <p>
              支持 HTTPS、签名校验、访问令牌、IP
              白名单与多层防护机制，确保数据传输安全与接口调用可信。
            </p>
            <div class="tags">
              <span class="tag">安全加密</span>
              <span class="tag">访问控制</span>
              <span class="tag">防攻击防滥用</span>
            </div>
          </div>
          <div class="icon">
            <img
              src="@/assets/images/secure-network.svg"
              alt="稳定高性能与服务保障"
            />
          </div>
        </div>

        <div class="card">
          <div class="content">
            <h3>智能化监控与分析</h3>
            <p>
              提供实时调用监控、错误追踪、日志分析与告警系统，帮助企业快速定位问题，优化接口性能与用户体验。
            </p>
            <div class="tags">
              <span class="tag">实时监控</span>
              <span class="tag">日志分析</span>
              <span class="tag">告警系统</span>
            </div>
          </div>
          <div class="icon">
            <img
              src="@/assets/images/smart-ops.svg"
              alt="开发者文档与调试工具"
            />
          </div>
        </div>

        <div class="card">
          <div class="content">
            <h3>专业支持与生态服务</h3>
            <p>
              提供 7×24 技术支持、SDK
              工具包、开放文档与社区生态，助力开发者高效构建与集成业务系统。
            </p>
            <div class="tags">
              <span class="tag">技术支持</span>
              <span class="tag">SDK 工具</span>
              <span class="tag">开发者生态</span>
            </div>
          </div>
          <div class="icon">
            <img
              src="@/assets/images/flexible-billing.svg"
              alt="海量接口与场景覆盖"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="less" scoped>
.why-choose-us {
  width: 100%;
  padding: 32px 0;

  .container {
    width: 95%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    text-align: center;
    margin-bottom: 16px;

    .title {
      font-size: 24px;
      color: #1f2f3d;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    margin-top: 20px;
  }

  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border: 1px solid #ebeef5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    padding: 20px 24px;

    .content {
      flex: 1;
      padding-right: 12px;

      h3 {
        font-size: 18px;
        color: #1f2f3d;
        margin: 0 0 8px 0;
      }

      p {
        font-size: 14px;
        color: #4b5563;
        line-height: 1.7;
        margin: 0 0 12px 0;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .tag {
          font-size: 12px;
          color: #374151;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 0;
          padding: 6px 12px;
          line-height: 1;
        }
      }
    }

    .icon {
      width: 120px;
      min-width: 120px;
      text-align: right;

      img {
        width: 100%;
        height: auto;
      }
    }
  }
}

/* 小屏优化 */
@media screen and (max-width: 900px) {
  .why-choose-us {
    padding: 24px 0;

    .header .title {
      font-size: 20px;
    }

    .cards {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .card {
      padding: 16px;

      .icon {
        width: 90px;
        min-width: 90px;
      }

      .content h3 {
        font-size: 16px;
      }

      .content p {
        font-size: 13px;
      }
    }
  }
}
</style>
