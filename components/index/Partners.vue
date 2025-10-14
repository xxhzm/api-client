<script setup>
import { Right } from '@element-plus/icons-vue'

// 合作伙伴数据
const partners = ref([])
const loading = ref(false)

// 获取合作伙伴数据
const getPartners = async () => {
  loading.value = true
  try {
    const { $myFetch, $msg } = useNuxtApp()
    const res = await $myFetch('GetPartnersInfo')

    if (res.code === 200) {
      partners.value = res.data || []
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    console.error('获取合作伙伴列表失败:', error)
    const { $msg } = useNuxtApp()
    $msg('获取合作伙伴列表失败', 'error')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getPartners()
})

// 处理logo加载失败的情况
const handleImageError = (event) => {
  // 使用默认的占位符图标
  event.target.style.display = 'none'
  event.target.nextElementSibling.style.display = 'flex'
}

// 跳转到合作伙伴网站
const visitPartner = (website) => {
  if (website) {
    window.open(website, '_blank')
  }
}
</script>

<template>
  <div class="partners-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">合作伙伴</h2>
        <p class="section-subtitle">感谢以下优秀的合作伙伴对我们的支持与信任</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
        <el-skeleton :rows="3" animated />
        <el-skeleton :rows="3" animated />
      </div>

      <!-- 空数据状态 -->
      <div v-else-if="!partners.length" class="empty-container">
        <p class="empty-text">暂无合作伙伴数据</p>
      </div>

      <!-- 合作伙伴列表 -->
      <div v-else class="partners-grid">
        <div
          v-for="partner in partners"
          :key="partner.id"
          class="partner-card"
          @click="visitPartner(partner.website)"
        >
          <div class="partner-logo">
            <img
              :src="partner.logo"
              :alt="partner.name"
              @error="handleImageError"
            />
            <div class="logo-placeholder">
              <span>{{ partner.name.charAt(0) }}</span>
            </div>
          </div>

          <div class="partner-info">
            <div class="partner-header">
              <h3 class="partner-name">{{ partner.name }}</h3>
              <span class="partner-category">{{ partner.category }}</span>
            </div>
            <p class="partner-description">{{ partner.description }}</p>
          </div>

          <div class="partner-action">
            <el-icon class="visit-icon">
              <Right />
            </el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.partners-section {
  background: #f8fafc;
  padding: 60px 0;
  margin-top: 40px;

  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-header {
    text-align: center;
    margin-bottom: 50px;
  }

  .section-title {
    position: relative;
    color: #1f2f3d;
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 16px 0;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #409eff, #67c23a);
      border-radius: 2px;
    }
  }

  .section-subtitle {
    color: #606266;
    font-size: 16px;
    margin: 0;
    line-height: 1.6;
  }

  .loading-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
    margin-top: 20px;
  }

  .empty-container {
    text-align: center;
    padding: 60px 20px;
    color: #909399;
  }

  .empty-text {
    font-size: 16px;
    margin: 0;
  }

  .partners-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
  }

  .partner-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    transition: all 0.3s ease;
    border: 1px solid #ebeef5;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #409eff, #67c23a);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-color: #dcdfe6;

      &::before {
        transform: scaleX(1);
      }

      .visit-icon {
        transform: translateX(4px);
      }
    }
  }

  .partner-logo {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    background: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 8px;
    }

    .logo-placeholder {
      display: none;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #409eff, #67c23a);
      color: #fff;
      font-size: 24px;
      font-weight: 600;
    }
  }

  .partner-info {
    flex: 1;
    min-width: 0;
  }

  .partner-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .partner-name {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }

  .partner-category {
    padding: 4px 8px;
    background: #ecf5ff;
    color: #409eff;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
  }

  .partner-description {
    color: #606266;
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .partner-action {
    flex-shrink: 0;
    color: #909399;

    .visit-icon {
      font-size: 18px;
      transition: all 0.3s ease;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .partners-section {
    padding: 40px 0;
    margin-top: 30px;

    .container {
      width: 95%;
    }

    .section-header {
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 24px;
    }

    .section-subtitle {
      font-size: 14px;
    }

    .partners-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .partner-card {
      padding: 20px;
      gap: 16px;
    }

    .partner-logo {
      width: 50px;
      height: 50px;
    }

    .partner-name {
      font-size: 16px;
    }

    .partner-description {
      font-size: 13px;
    }
  }
}

@media (max-width: 480px) {
  .partners-section {
    padding: 30px 0;

    .partner-card {
      padding: 16px;
      gap: 12px;
    }

    .partner-logo {
      width: 45px;
      height: 45px;

      .logo-placeholder span {
        font-size: 20px;
      }
    }

    .partner-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }

    .partner-name {
      font-size: 15px;
    }

    .partner-category {
      font-size: 11px;
    }
  }
}
</style>
