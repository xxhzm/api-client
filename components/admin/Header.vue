<script setup>
import { Close } from '@element-plus/icons-vue'

const { $logout } = useNuxtApp()
const route = useRoute()

const username = useCookie('username')

// 路由路径与名称映射
const routeNameMap = {
  '/admin': '控制台',
  '/admin/webset': '基本设置',
  '/admin/ad': '广告位管理',
  '/admin/sitemap': '生成网站地图',
  '/admin/online-update': '在线更新',
  '/admin/import': '一键对接',
  '/admin/apilist': '接口列表',
  '/admin/createapi': '新增接口',
  '/admin/addparam': '添加参数',
  '/admin/categories': '管理分类',
  '/admin/prefix': '管理前缀',
  '/admin/apilogs': '接口日志',
  '/admin/statistics': '统计分析',
  '/admin/userlist': '用户列表',
  '/admin/rolelist': '角色列表',
  '/admin/permissionlist': '权限列表',
  '/admin/keylog': '秘钥历史记录',
  '/admin/articlelist': '文章列表',
  '/admin/createarticle': '新增文章',
  '/admin/articleset': '文章设置',
  '/admin/pay': '账户充值',
  '/admin/createRechargeCard': '生成充值卡',
  '/admin/useRechargeCard': '使用充值卡',
  '/admin/rechargeCardHistory': '充值卡记录',
  '/admin/rechargerecord': '充值记录',
  '/admin/buypackagerecord': '购买记录',
  '/admin/package': '套餐列表',
  '/admin/buy': '购买套餐',
  '/admin/mypackage': '我的套餐',
  '/admin/userPackageManagement': '用户套餐',
  '/admin/ip-ban': 'IP封禁',
  '/admin/api-rate-limit': '速率限制',
  '/admin/profile': '个人信息',
  '/admin/key': '秘钥管理',
  '/admin/password': '修改密码',
  '/admin/phone': '换绑手机',
  '/admin/links': '友情链接',
}

// 动态路由名称处理
const dynamicRouteMap = {
  apiset: '接口设置',
  articleset: '文章设置',
}

// 路由路径与父级菜单名称映射
const parentNameMap = {
  '/admin/webset': '系统设置',
  '/admin/ad': '系统设置',
  '/admin/sitemap': '系统设置',
  '/admin/online-update': '系统设置',
  '/admin/import': '系统设置',
  '/admin/apilist': '接口管理',
  '/admin/createapi': '接口管理',
  '/admin/addparam': '接口管理',
  '/admin/categories': '接口管理',
  '/admin/prefix': '接口管理',
  '/admin/apilogs': '接口管理',
  '/admin/statistics': '接口管理',
  '/admin/apiset': '接口管理',
  '/admin/userlist': '用户管理',
  '/admin/rolelist': '用户管理',
  '/admin/permissionlist': '用户管理',
  '/admin/keylog': '用户管理',
  '/admin/articlelist': '文章管理',
  '/admin/createarticle': '文章管理',
  '/admin/articleset': '文章管理',
  '/admin/pay': '财务功能',
  '/admin/createRechargeCard': '财务功能',
  '/admin/useRechargeCard': '财务功能',
  '/admin/rechargeCardHistory': '财务功能',
  '/admin/rechargerecord': '财务功能',
  '/admin/buypackagerecord': '财务功能',
  '/admin/package': '财务功能',
  '/admin/buy': '财务功能',
  '/admin/mypackage': '财务功能',
  '/admin/userPackageManagement': '财务功能',
  '/admin/ip-ban': '安全管理',
  '/admin/api-rate-limit': '安全管理',
  '/admin/key': '个人中心',
  '/admin/password': '个人中心',
  '/admin/phone': '个人中心',
  '/admin/links': '友情链接',
}

const breadcrumbs = computed(() => {
  const path = route.path
  const items = []

  // 始终添加首页/控制台
  items.push({ name: '控制台', path: '/admin' })

  if (path === '/admin') return items

  // 处理动态路由
  const pathParts = path.split('/')
  let basePath = path

  // 如果是动态路由（包含ID），则获取基础路径
  if (
    pathParts.length > 3 &&
    (pathParts[2] === 'apiset' || pathParts[2] === 'articleset')
  ) {
    basePath = `/${pathParts[1]}/${pathParts[2]}`
  }

  // 添加父级菜单
  if (parentNameMap[basePath]) {
    items.push({ name: parentNameMap[basePath] })
  }

  // 添加当前页面
  let currentName = routeNameMap[basePath] || '未知页面'

  // 针对特定动态路由的处理
  if (pathParts.length > 3) {
    if (dynamicRouteMap[pathParts[2]]) {
      currentName = dynamicRouteMap[pathParts[2]]
    }
  }

  items.push({ name: currentName, path: path })

  return items
})

// --- Visited Views Logic ---
const visitedViews = useState('visitedViews', () => [])

const addVisitedView = () => {
  const { path } = route

  // Logic to determine title
  let title = '未知页面'
  const pathParts = path.split('/')
  let basePath = path

  if (
    pathParts.length > 3 &&
    (pathParts[2] === 'apiset' || pathParts[2] === 'articleset')
  ) {
    basePath = `/${pathParts[1]}/${pathParts[2]}`
  }

  if (routeNameMap[basePath]) {
    title = routeNameMap[basePath]
  } else if (pathParts.length > 3 && dynamicRouteMap[pathParts[2]]) {
    title = dynamicRouteMap[pathParts[2]]
  }

  // Prevent adding if title is unknown or redirect
  if (path.startsWith('/redirect')) return

  const view = {
    path,
    title,
    name: route.name || 'no-name',
  }

  // Deduplicate
  if (visitedViews.value.some((v) => v.path === view.path)) return

  visitedViews.value.push(view)
}

const isActive = (view) => {
  return view.path === route.path
}

const closeTag = (view) => {
  const index = visitedViews.value.findIndex((v) => v.path === view.path)
  if (index > -1) {
    visitedViews.value.splice(index, 1)
    if (isActive(view)) {
      toLastView(visitedViews.value, view)
    }
  }
}

const toLastView = (visitedViews, view) => {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    navigateTo(latestView.path)
  } else {
    navigateTo('/admin')
  }
}

// --- Auto Close Logic ---
const tagsWrapperRef = ref(null)

const checkTagsWidth = async () => {
  await nextTick()
  if (!tagsWrapperRef.value) return

  const containerWidth = tagsWrapperRef.value.offsetWidth
  const tags = visitedViews.value

  // 保护机制：如果标签数量少于 6 个，不进行自动关闭，防止误删
  if (tags.length < 6) return

  // 估算当前所有标签占用的理论最大宽度
  // 每个标签最大宽度 120px + margin 6px + 额外缓冲
  const ESTIMATED_TAG_WIDTH = 130
  const currentTotalWidth = tags.length * ESTIMATED_TAG_WIDTH

  // 如果理论宽度超过容器宽度的 90%（稍微放宽一点，避免太早触发），则清理旧标签
  // 这里的目的是保持标签栏宽松，而不是等到真正溢出（100%）才删
  if (currentTotalWidth > containerWidth * 0.9) {
    // Find the first closable tag (skip /admin and active tag)
    const indexToRemove = visitedViews.value.findIndex((v) => {
      if (v.path === '/admin') return false
      if (isActive(v)) return false
      return true
    })

    if (indexToRemove > -1) {
      visitedViews.value.splice(indexToRemove, 1)
      // 递归检查，确保清理后满足要求
      // checkTagsWidth() // 暂时不递归，让 watcher 处理，或者一次只删一个避免突变
    }
  }
}

watch(
  route,
  () => {
    addVisitedView()
  },
  { immediate: true }
)

onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem('visitedViews')
    if (saved) {
      try {
        visitedViews.value = JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }
    // Add current view after loading
    addVisitedView()
  }
})

watch(
  visitedViews,
  (val) => {
    if (process.client) {
      localStorage.setItem('visitedViews', JSON.stringify(val))
    }
    checkTagsWidth()
  },
  { deep: true }
)
// --- End Visited Views Logic ---

const handleSelect = (key) => {
  // 更改密码
  if (key === '0-1') {
    navigateTo('/admin/password')
  }

  // 个人信息
  if (key === '0-3') {
    navigateTo('/admin/profile')
  }

  // 退出登录
  if (key === '0-2') {
    $logout()
  }
}
</script>

<template>
  <div class="header-wrapper">
    <div class="header-container">
      <div class="left-section">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbs"
            :key="index"
            :to="item.path ? { path: item.path } : null"
          >
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="right-section">
        <el-menu
          class="el-menu-demo"
          mode="horizontal"
          :ellipsis="false"
          @select="handleSelect"
        >
          <ClientOnly>
            <el-sub-menu index="1">
              <template #title>{{ username }}</template>
              <el-menu-item @click="navigateTo('/')">首页</el-menu-item>
              <el-menu-item index="0-1">更改密码</el-menu-item>
              <el-menu-item index="0-2">退出登录</el-menu-item>
            </el-sub-menu>
          </ClientOnly>
        </el-menu>
      </div>
    </div>

    <!-- Tags View -->
    <div class="tags-view-container">
      <div class="tags-view-wrapper" ref="tagsWrapperRef">
        <router-link
          v-for="tag in visitedViews"
          :key="tag.path"
          :class="isActive(tag) ? 'active' : ''"
          :to="{ path: tag.path }"
          class="tags-view-item"
        >
          <span class="tag-title">{{ tag.title }}</span>
          <el-icon
            v-if="tag.path !== '/admin'"
            class="close-icon"
            @click.prevent.stop="closeTag(tag)"
            ><Close
          /></el-icon>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.header-wrapper {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
}

.header-container {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;

  .left-section {
    flex: 1;
  }

  .right-section {
    .el-menu-demo {
      border-bottom: none;
      height: 50px;

      :deep(.el-sub-menu__title) {
        height: 50px;
        line-height: 50px;
      }
    }
  }
}

.tags-view-container {
  height: 40px;
  width: 100%;
  background: #fff;
  display: flex; /* 确保容器是 flex */
  overflow: hidden; /* 防止容器本身溢出 */

  .tags-view-wrapper {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 10px;
    flex: 1; /* 占据所有空间 */
    overflow: hidden; /* 防止子元素溢出 */
    /* 移除之前的 width: max-content 和 min-width: 100% */

    .tags-view-item {
      display: inline-flex;
      align-items: center;
      position: relative;
      cursor: pointer;
      height: 28px;
      line-height: 28px;
      border-radius: 4px;
      color: #606266;
      background: #f4f4f5;
      padding: 0 8px; /* 稍微减小 padding */
      font-size: 12px;
      margin-left: 6px;
      text-decoration: none;
      transition: all 0.3s;

      /* 关键：允许收缩，但不能无限收缩 */
      flex: 0 1 auto;
      min-width: 60px; /* 最小宽度，保证至少能点到 */
      max-width: 120px; /* 设置最大宽度，防止太宽 */
      overflow: hidden;

      &:first-of-type {
        margin-left: 0;
      }

      &:hover {
        background-color: #e9e9eb;
        color: #303133;
      }

      &.active {
        background-color: #ecf5ff;
        color: #409eff;
        border-color: #d9ecff;
        font-weight: 500;
        /* 激活状态可以稍微宽一点，或者保持一致 */
        flex-shrink: 0; /* 激活的标签不收缩，保证完整显示 */

        .close-icon {
          color: #409eff;
          opacity: 1;

          &:hover {
            background-color: #409eff;
            color: #fff;
          }
        }
      }

      .tag-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1; /* 占据剩余空间 */
      }

      .close-icon {
        margin-left: 4px; /* 减小间距 */
        border-radius: 50%;
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        opacity: 0.6;
        flex-shrink: 0; /* 图标不收缩 */

        &:hover {
          background-color: #c0c4cc;
          color: #fff;
          opacity: 1;
        }
      }
    }
  }

  /* 移除 .el-scrollbar__bar 样式，因为已经没有 el-scrollbar 了 */
}
</style>
