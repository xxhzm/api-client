<script setup>
import {
  Menu,
  Close,
  User,
  Monitor,
  Link,
  Document,
  House,
  ChatDotSquare,
} from '@element-plus/icons-vue'
const options = useState('options')

// 移动端菜单控制
const isMobileMenuOpen = ref(false)

// 当前路由
const route = useRoute()

// 导航项配置
const navItems = [
  {
    name: '首页',
    path: '/',
    icon: House,
  },
  {
    name: '友情链接',
    path: '/links',
    icon: Link,
  },
  {
    name: '新闻',
    path: '/articles',
    icon: Document,
  },
  {
    name: '关于我们',
    path: '/about',
    icon: ChatDotSquare,
  },
  {
    name: '实时监控',
    path: '/map',
    icon: Monitor,
  },
  {
    name: '登录',
    path: '/login',
    icon: User,
  },
]

// 切换移动端菜单
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// 判断当前路由是否激活
const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

// 导航到指定路径
const navigateToPath = (path) => {
  navigateTo(path)
  closeMobileMenu()
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo区域 -->
      <div class="navbar-brand">
        <nuxt-link to="/" class="brand-link">
          <span class="brand-text">{{ options?.website_name }}</span>
        </nuxt-link>
      </div>

      <!-- 桌面端导航菜单 -->
      <div class="navbar-menu desktop-menu">
        <ul class="navbar-nav">
          <li
            v-for="item in navItems"
            :key="item.path"
            class="nav-item"
            :class="{ active: isActive(item.path) }"
          >
            <nuxt-link
              :to="item.path"
              class="nav-link"
              @click="closeMobileMenu"
            >
              <el-icon class="nav-icon">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.name }}</span>
            </nuxt-link>
          </li>
        </ul>
      </div>

      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-toggle">
        <el-button link @click="toggleMobileMenu" class="menu-button">
          <el-icon size="24">
            <Menu v-if="!isMobileMenuOpen" />
            <Close v-else />
          </el-icon>
        </el-button>
      </div>
    </div>

    <!-- 移动端导航菜单 -->
    <div class="mobile-menu" :class="{ 'mobile-menu-open': isMobileMenuOpen }">
      <ul class="mobile-nav">
        <li
          v-for="item in navItems"
          :key="item.path"
          class="mobile-nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <a
            href="#"
            class="mobile-nav-link"
            @click.prevent="navigateToPath(item.path)"
          >
            <el-icon class="mobile-nav-icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.name }}</span>
          </a>
        </li>
      </ul>
    </div>

    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobileMenuOpen"
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
  </nav>
</template>

<style lang="less" scoped>
.navbar {
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

  .navbar-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }

  .navbar-brand {
    .brand-link {
      text-decoration: none;
      display: flex;
      align-items: center;

      .brand-text {
        font-size: 18px;
        font-weight: 600;
        color: #409eff;
        margin-left: 8px;
        transition: color 0.3s ease;

        &:hover {
          color: #337ecc;
        }
      }
    }
  }

  .desktop-menu {
    display: flex;
    align-items: center;

    .navbar-nav {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 24px;

      .nav-item {
        position: relative;

        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          color: #606266;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
          position: relative;

          .nav-icon {
            font-size: 16px;
          }

          &:hover {
            color: #409eff;
            background: rgba(64, 158, 255, 0.08);
            transform: translateY(-1px);
          }
        }

        &.active .nav-link {
          color: #409eff;
          background: rgba(64, 158, 255, 0.1);

          &::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 2px;
            background: #409eff;
            border-radius: 1px;
          }
        }
      }
    }
  }

  .mobile-menu-toggle {
    display: none;

    .menu-button {
      color: #606266;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.3s ease;

      &:hover {
        color: #409eff;
        background: rgba(64, 158, 255, 0.1);
      }
    }
  }

  .mobile-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border-bottom: 1px solid #ebeef5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 999;

    &.mobile-menu-open {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
      animation: slideDown 0.3s ease;
    }

    .mobile-nav {
      list-style: none;
      margin: 0;
      padding: 16px 0;

      .mobile-nav-item {
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          color: #606266;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.3s ease;
          margin: 0 4px;

          .mobile-nav-icon {
            font-size: 16px;
          }

          &:hover {
            color: #409eff;
            background: rgba(64, 158, 255, 0.08);
          }
        }

        &.active .mobile-nav-link {
          color: #409eff;
          background: rgba(64, 158, 255, 0.1);
          border-left: 3px solid #409eff;
        }
      }
    }
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 998;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .navbar {
    .navbar-container {
      padding: 0 16px;
      height: 56px;
    }

    .desktop-menu {
      display: none;
    }

    .mobile-menu-toggle {
      display: block;
    }

    .navbar-brand .brand-text {
      font-size: 16px;
    }
  }
}

@media (max-width: 480px) {
  .navbar {
    .navbar-container {
      height: 56px;
      padding: 0 12px;
    }

    .navbar-brand .brand-text {
      font-size: 16px;
    }

    .mobile-menu {
      .mobile-nav {
        padding: 12px 0;
      }
    }
  }
}
</style>
