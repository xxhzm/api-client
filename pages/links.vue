<script setup>
import { Link } from '@element-plus/icons-vue'

const { $myFetch } = useNuxtApp()

const links = ref()
const {
  data: { value: res },
} = await useAsyncData('LinkList', () => $myFetch('LinkList'))

links.value = res.data

const options = useState('options')

useHead({
  title: '友情链接' + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    {
      name: 'description',
      content: options.value.website_name + '-友情链接',
    },
  ],
  style: [
    {
      children: options.value.css,
    },
  ],
})

const handleImageError = (e) => {
  const img = e.target
  img.src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  img.style.background = '#f1f5f9'
  img.style.padding = '8px'
}
</script>

<template>
  <div class="links-page">
    <IndexNavbar></IndexNavbar>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg-pattern"></div>
      <div class="container hero-container">
        <div class="hero-content">
          <div class="badge"><span class="badge-dot"></span> 合作伙伴</div>
          <h1 class="hero-title">友情链接</h1>
          <p class="hero-subtitle">
            感谢以下合作伙伴对我们的支持与信任，携手共建开放、互信的技术生态。
          </p>
        </div>
      </div>
    </section>

    <!-- Links Grid -->
    <section class="section links-section">
      <div class="container">
        <div class="links-grid" v-if="links && links.length">
          <a
            v-for="item in links"
            :key="item.id"
            :href="item.url"
            target="_blank"
            class="link-card"
          >
            <div class="card-logo">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name"
                @error="handleImageError"
              />
              <div v-else class="logo-placeholder">
                {{ item.name?.substring(0, 1) }}
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-name">{{ item.name }}</h3>
              <p class="card-desc">{{ item.description }}</p>
            </div>
            <div class="card-arrow">
              <el-icon><Link /></el-icon>
            </div>
          </a>
        </div>
        <div class="empty-state" v-else>
          <p>暂无友情链接</p>
        </div>
      </div>
    </section>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less" scoped>
.links-page {
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
  }
}

/* Links Section */
.links-section {
  padding: 80px 0;
  background: #f8fafc;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.12);
    border-color: transparent;

    .card-arrow {
      color: #2563eb;
      background: #eff6ff;
    }
  }

  .card-logo {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f1f5f9;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .logo-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
      color: white;
      font-size: 20px;
      font-weight: 700;
    }
  }

  .card-info {
    flex: 1;
    min-width: 0;
  }

  .card-name {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-desc {
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-arrow {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    font-size: 16px;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
}

.empty-state {
  text-align: center;
  padding: 80px 0;

  p {
    font-size: 16px;
    color: #94a3b8;
  }
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
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
  }

  .links-section {
    padding: 60px 0;
  }

  .links-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .link-card {
    padding: 20px;
    gap: 14px;

    .card-logo {
      width: 48px;
      height: 48px;
      border-radius: 10px;

      .logo-placeholder {
        font-size: 18px;
      }
    }

    .card-name {
      font-size: 15px;
      margin-bottom: 4px;
    }

    .card-desc {
      font-size: 13px;
    }

    .card-arrow {
      width: 32px;
      height: 32px;
    }
  }
}

/* Responsive - Small Mobile */
@media (max-width: 480px) {
  .container {
    padding: 0 12px;
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
  }

  .links-section {
    padding: 48px 0;
  }

  .links-grid {
    gap: 12px;
  }

  .link-card {
    padding: 16px;
    gap: 12px;
    border-radius: 12px;

    .card-logo {
      width: 44px;
      height: 44px;

      .logo-placeholder {
        font-size: 16px;
      }
    }

    .card-name {
      font-size: 14px;
    }

    .card-desc {
      font-size: 12px;
    }

    .card-arrow {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }
  }
}
</style>
