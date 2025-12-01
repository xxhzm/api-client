<template>
  <div class="banner-container">
    <div class="banner-background"></div>
    <div class="banner-overlay"></div>
    <div class="banner-content" :style="{ alignItems: verticalAlign }">
      <div class="banner-text">
        <div class="text-content">
          <h1 class="banner-title" v-if="!customTitle">
            {{ options.website_name }}-专业的<span class="title-highlight"
              >API服务</span
            >平台
          </h1>
          <h1 class="banner-title" v-else v-html="customTitle"></h1>

          <p class="banner-subtitle">{{ customSubtitle || options.slogan }}</p>

          <p
            class="banner-description"
            v-if="!customDescription && !customTitle"
          >
            我们致力于为开发者和企业提供最优质的API服务体验，通过先进的技术架构和完善的服务体系，助力您的业务快速发展和数字化转型。
          </p>
          <p class="banner-description" v-else-if="customDescription">
            {{ customDescription }}
          </p>

          <div class="banner-actions" v-if="showActions">
            <button class="btn-primary" @click="navigateTo('/api-market')">
              <span class="btn-text">立即体验 </span>
              <span class="btn-icon">→</span>
            </button>
          </div>
          <div class="banner-stats"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  customTitle: {
    type: String,
    default: '',
  },
  customSubtitle: {
    type: String,
    default: '',
  },
  customDescription: {
    type: String,
    default: '',
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  verticalAlign: {
    type: String,
    default: 'end',
  },
})

// 获取Options信息
const options = useState('options')
</script>

<style lang="less" scoped>
.banner-container {
  position: relative;
  width: 100%;
  height: 450px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.banner-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('~/assets/images/banner-bg.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // background: linear-gradient(
  //   90deg,
  //   rgba(15, 23, 42, 0.3) 0%,
  //   rgba(15, 23, 42, 0.1) 50%,
  //   rgba(15, 23, 42, 0.2) 100%
  // );
  z-index: 2;
}

.banner-content {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  min-height: 450px;
}

.banner-text {
  flex: 1;
  max-width: 800px;
  color: #1e293b;
}

.text-content {
  animation: fadeInUp 1s ease-out;
}

.banner-title {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 20px 0;
  color: #0f172a;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.02em;

  .title-highlight {
    color: #409eff;
    background: linear-gradient(45deg, #409eff, #1e40af);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
  }
}

.banner-subtitle {
  font-size: 24px;
  font-weight: 400;
  line-height: 1.4;
  margin: 0 0 24px 0;
  color: #475569;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.banner-description {
  font-size: 18px;
  line-height: 1.6;
  margin: 0 0 40px 0;
  color: #64748b;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  max-width: 500px;
}

.banner-actions {
  display: flex;
  gap: 20px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.btn-primary {
  background: linear-gradient(45deg, #409eff, #1e40af);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(64, 158, 255, 0.35);
    background: linear-gradient(45deg, #3b82f6, #1d4ed8);

    .btn-icon {
      transform: translateX(4px);
    }
  }

  .btn-icon {
    transition: transform 0.3s ease;
    font-size: 18px;
  }
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 14px 30px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
}

.banner-stats {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: left;

  .stat-number {
    font-size: 32px;
    font-weight: 800;
    color: #00d4ff;
    line-height: 1;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .stat-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .banner-content {
    padding: 0 30px;
  }

  .banner-title {
    font-size: 48px;
  }

  .banner-subtitle {
    font-size: 22px;
  }

  .banner-description {
    font-size: 16px;
  }
}

@media screen and (max-width: 992px) {
  .banner-container {
    height: 500px;
  }

  .banner-content {
    padding: 0 20px;
    min-height: 500px;
  }

  .banner-title {
    font-size: 42px;
  }

  .banner-subtitle {
    font-size: 20px;
  }

  .banner-description {
    font-size: 16px;
    margin-bottom: 30px;
  }

  .banner-actions {
    margin-bottom: 40px;
  }

  .banner-stats {
    gap: 30px;
  }
}

@media screen and (max-width: 768px) {
  .banner-container {
    height: 350px;
  }

  .banner-content {
    align-items: center;
    padding: 0 16px;
    min-height: 350px;
  }

  .banner-title {
    font-size: 36px;
    margin-bottom: 16px;
  }

  .banner-subtitle {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .banner-description {
    font-size: 15px;
    margin-bottom: 25px;
  }

  .banner-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 30px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 12px 24px;
    font-size: 14px;
  }

  .banner-stats {
    gap: 20px;
  }

  .stat-item {
    .stat-number {
      font-size: 24px;
    }

    .stat-label {
      font-size: 12px;
    }
  }
}

@media screen and (max-width: 480px) {
  .banner-container {
    height: 350px;
  }

  .banner-content {
    padding: 0 12px;
    min-height: 350px;
  }

  .banner-title {
    font-size: 28px;
  }

  .banner-subtitle {
    font-size: 16px;
  }

  .banner-description {
    font-size: 14px;
  }

  .banner-actions {
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .banner-stats {
    gap: 15px;
    flex-direction: column;
  }

  .stat-item {
    .stat-number {
      font-size: 20px;
    }
  }
}
</style>
