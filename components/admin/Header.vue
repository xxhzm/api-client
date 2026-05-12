<script setup>
import { Close, Menu } from '@element-plus/icons-vue'

const props = defineProps({
  showSidebarControl: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-sidebar'])

const { $logout } = useNuxtApp()
const route = useRoute()

const username = useCookie('username')
const { onlyPhoneBind } = usePhoneBind()
const HOME_PATH = '/admin'

// 路由路径与名称映射
const routeNameMap = {
  '/admin': '控制台',
  '/admin/webset': '基本设置',
  '/admin/pay-config': '支付配置',
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
  '/admin/userdetail': '用户详情',
  '/admin/rolelist': '角色列表',
  '/admin/permissionlist': '权限列表',
  '/admin/keylog': '秘钥历史记录',
  '/admin/articlelist': '文章列表',
  '/admin/createarticle': '新增文章',
  '/admin/ai-article': 'AI生成文章',
  '/admin/ai-chat': 'AI会话管理',
  '/admin/articleset': '文章设置',
  '/admin/pay': '账户充值',
  '/admin/invoice-audit': '发票管理',
  '/admin/invoice': '发票申请',
  '/admin/invoicedetail': '开票详情',
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
  '/admin/merchant': '商户审核',
  '/admin/merchant-manage': '商户管理',
  '/admin/merchant-profile': '商户资料',
  '/admin/merchant-commission-log': '分成记录',
  '/admin/logs': '综合日志',
  '/admin/workorder': '工单管理',
  '/admin/myworkorder': '我的工单',
  '/admin/createworkorder': '新建工单',
}

// 动态路由名称处理
const dynamicRouteMap = {
  apiset: '接口设置',
  articleset: '文章设置',
  invoicedetail: '开票详情',
  userdetail: '用户详情',
  workorderdetail: '工单详情',
}

// 路由路径与父级菜单名称映射
const parentNameMap = {
  // 系统与安全
  '/admin/webset': '系统与安全',
  '/admin/pay-config': '系统与安全',
  '/admin/sitemap': '系统与安全',
  '/admin/online-update': '系统与安全',
  '/admin/import': '系统与安全',
  '/admin/ip-ban': '系统与安全',
  '/admin/api-rate-limit': '系统与安全',
  '/admin/logs': '系统与安全',

  // 接口管理
  '/admin/apilist': '接口管理',
  '/admin/createapi': '接口管理',
  '/admin/addparam': '接口管理',
  '/admin/categories': '接口管理',
  '/admin/prefix': '接口管理',
  '/admin/apilogs': '接口管理',
  '/admin/statistics': '接口管理',
  '/admin/apiset': '接口管理',

  // 财务管理
  '/admin/pay': '财务管理',
  '/admin/invoice-audit': '财务管理',
  '/admin/invoice': '财务管理',
  '/admin/invoicedetail': '财务管理',
  '/admin/createRechargeCard': '财务管理',
  '/admin/useRechargeCard': '财务管理',
  '/admin/rechargeCardHistory': '财务管理',
  '/admin/rechargerecord': '财务管理',
  '/admin/buypackagerecord': '财务管理',
  '/admin/package': '财务管理',
  '/admin/buy': '财务管理',
  '/admin/mypackage': '财务管理',
  '/admin/userPackageManagement': '财务管理',

  // 用户与商户
  '/admin/userlist': '用户与商户',
  '/admin/userdetail': '用户与商户',
  '/admin/rolelist': '用户与商户',
  '/admin/permissionlist': '用户与商户',
  '/admin/keylog': '用户与商户',
  '/admin/merchant': '用户与商户',
  '/admin/merchant-manage': '用户与商户',
  '/admin/merchant-profile': '用户与商户',
  '/admin/merchant-commission-log': '用户与商户',

  // 内容与运营
  '/admin/articlelist': '内容与运营',
  '/admin/createarticle': '内容与运营',
  '/admin/ai-article': '内容与运营',
  '/admin/ai-chat': '内容与运营',
  '/admin/articleset': '内容与运营',
  '/admin/ad': '内容与运营',
  '/admin/links': '内容与运营',

  // 工单系统
  '/admin/workorder': '工单系统',
  '/admin/myworkorder': '工单系统',
  '/admin/createworkorder': '工单系统',
  '/admin/workorderdetail': '工单系统', // 动态路由会匹配到此

  // 个人中心
  '/admin/key': '个人中心',
  '/admin/password': '个人中心',
  '/admin/phone': '个人中心',
  '/admin/profile': '个人中心',
}

const breadcrumbs = computed(() => {
  const path = route.path.replace(/\/$/, '') || '/admin'
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
    (pathParts[2] === 'apiset' ||
      pathParts[2] === 'articleset' ||
      pathParts[2] === 'invoicedetail' ||
      pathParts[2] === 'userdetail' ||
      pathParts[2] === 'workorderdetail')
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
const contextMenu = reactive({
  visible: false,
  left: 0,
  top: 0,
  tag: null,
})

const visibleViews = computed(() => {
  if (!onlyPhoneBind.value) return visitedViews.value
  return visitedViews.value.filter(
    (v) => v.path === HOME_PATH || v.path === '/admin/phone',
  )
})

const isUserDetailPath = (path) => {
  return /^\/admin\/userdetail\/[^/]+$/.test(path)
}

const keepLastUserDetailView = (views) => {
  let lastUserDetailIndex = -1
  for (let index = views.length - 1; index >= 0; index -= 1) {
    if (isUserDetailPath(views[index].path)) {
      lastUserDetailIndex = index
      break
    }
  }

  if (lastUserDetailIndex === -1) return views

  return views.filter(
    (v, index) => !isUserDetailPath(v.path) || index === lastUserDetailIndex,
  )
}

const addVisitedView = () => {
  const path = route.path.replace(/\/$/, '') || '/admin'

  // Logic to determine title
  let title = '未知页面'
  const pathParts = path.split('/')
  let basePath = path

  if (
    pathParts.length > 3 &&
    (pathParts[2] === 'apiset' ||
      pathParts[2] === 'articleset' ||
      pathParts[2] === 'invoicedetail' ||
      pathParts[2] === 'userdetail' ||
      pathParts[2] === 'workorderdetail')
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

  // 仅绑定手机号权限时，只允许 /admin 和 /admin/phone
  if (onlyPhoneBind.value && path !== '/admin' && path !== '/admin/phone')
    return

  const view = {
    path,
    title,
    name: route.name || 'no-name',
  }

  if (isUserDetailPath(path)) {
    visitedViews.value = visitedViews.value.filter(
      (v) => !isUserDetailPath(v.path) || v.path === path,
    )
  }

  // Deduplicate
  if (visitedViews.value.some((v) => v.path === view.path)) return

  visitedViews.value.push(view)
}

const isActive = (view) => {
  const currentPath = route.path.replace(/\/$/, '') || HOME_PATH
  return view.path === currentPath
}

const getCurrentPath = () => route.path.replace(/\/$/, '') || HOME_PATH

const closeTag = (view) => {
  const index = visitedViews.value.findIndex((v) => v.path === view.path)
  if (index > -1) {
    visitedViews.value.splice(index, 1)
    if (isActive(view)) {
      toLastView(visitedViews.value, view)
    }
  }
}

const getHomeView = () => {
  return (
    visitedViews.value.find((v) => v.path === HOME_PATH) || {
      path: HOME_PATH,
      title: '控制台',
      name: 'admin',
    }
  )
}

const updateVisitedViews = (views, fallbackPath = HOME_PATH) => {
  const currentPath = getCurrentPath()
  const nextViews = views.length ? views : [getHomeView()]
  const shouldRedirect = !nextViews.some((v) => v.path === currentPath)

  visitedViews.value = nextViews

  if (shouldRedirect) {
    navigateTo(fallbackPath)
  }
}

const closeOtherTags = (view) => {
  if (!view || !canCloseOtherTags(view)) return

  const nextViews = visitedViews.value.filter(
    (v) => v.path === HOME_PATH || v.path === view.path,
  )
  updateVisitedViews(nextViews, view.path)
}

const closeRightTags = (view) => {
  if (!view || !canCloseRightTags(view)) return

  const targetIndex = visitedViews.value.findIndex((v) => v.path === view.path)
  if (targetIndex === -1) return

  const nextViews = visitedViews.value.filter(
    (v, index) => v.path === HOME_PATH || index <= targetIndex,
  )
  updateVisitedViews(nextViews, view.path)
}

const closeLeftTags = (view) => {
  if (!view || !canCloseLeftTags(view)) return

  const targetIndex = visitedViews.value.findIndex((v) => v.path === view.path)
  if (targetIndex === -1) return

  const nextViews = visitedViews.value.filter(
    (v, index) => v.path === HOME_PATH || index >= targetIndex,
  )
  updateVisitedViews(nextViews, view.path)
}

const closeAllTags = () => {
  if (!canCloseAllTags()) return

  updateVisitedViews([getHomeView()], HOME_PATH)
}

const canCloseOtherTags = (view) => {
  if (!view) return false
  return visitedViews.value.some(
    (v) => v.path !== HOME_PATH && v.path !== view.path,
  )
}

const canCloseRightTags = (view) => {
  if (!view) return false

  const targetIndex = visitedViews.value.findIndex((v) => v.path === view.path)
  if (targetIndex === -1) return false

  return visitedViews.value.some(
    (v, index) => index > targetIndex && v.path !== HOME_PATH,
  )
}

const canCloseLeftTags = (view) => {
  if (!view) return false

  const targetIndex = visitedViews.value.findIndex((v) => v.path === view.path)
  if (targetIndex === -1) return false

  return visitedViews.value.some(
    (v, index) => index < targetIndex && v.path !== HOME_PATH,
  )
}

const canCloseAllTags = () => {
  return visitedViews.value.some((v) => v.path !== HOME_PATH)
}

const closeContextMenu = () => {
  contextMenu.visible = false
  contextMenu.tag = null
}

const openTagContextMenu = (event, tag) => {
  const menuWidth = 118
  const menuHeight = 136
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  contextMenu.left = Math.max(
    8,
    Math.min(event.clientX, viewportWidth - menuWidth - 8),
  )
  contextMenu.top = Math.max(
    8,
    Math.min(event.clientY, viewportHeight - menuHeight - 8),
  )
  contextMenu.tag = tag
  contextMenu.visible = true
}

const handleContextMenuCommand = (command) => {
  const tag = contextMenu.tag

  if (command === 'others') {
    closeOtherTags(tag)
  } else if (command === 'right') {
    closeRightTags(tag)
  } else if (command === 'left') {
    closeLeftTags(tag)
  } else if (command === 'all') {
    closeAllTags()
  }

  closeContextMenu()
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
    closeContextMenu()
    addVisitedView()
  },
  { immediate: true },
)

onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem('visitedViews')
    if (saved) {
      try {
        visitedViews.value = keepLastUserDetailView(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
    // Add current view after loading
    addVisitedView()
    document.addEventListener('click', closeContextMenu)
    window.addEventListener('resize', closeContextMenu)
  }
})

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('click', closeContextMenu)
    window.removeEventListener('resize', closeContextMenu)
  }
})

watch(
  visitedViews,
  (val) => {
    const normalizedViews = keepLastUserDetailView(val)
    if (normalizedViews.length !== val.length) {
      visitedViews.value = normalizedViews
      return
    }

    if (process.client) {
      localStorage.setItem('visitedViews', JSON.stringify(normalizedViews))
    }
    checkTagsWidth()
  },
  { deep: true },
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
      <div
        v-show="props.showSidebarControl"
        class="mobile-sidebar-trigger"
        role="button"
        tabindex="0"
        @click="emit('toggle-sidebar')"
        @keydown.enter.prevent="emit('toggle-sidebar')"
        @keydown.space.prevent="emit('toggle-sidebar')"
      >
        <el-icon><Menu /></el-icon>
      </div>

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
          v-for="tag in visibleViews"
          :key="tag.path"
          :class="isActive(tag) ? 'active' : ''"
          :to="{ path: tag.path }"
          class="tags-view-item"
          @contextmenu.prevent="openTagContextMenu($event, tag)"
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

      <ul
        v-if="contextMenu.visible"
        class="tags-context-menu"
        :style="{ left: `${contextMenu.left}px`, top: `${contextMenu.top}px` }"
        @click.stop
        @contextmenu.prevent
      >
        <li
          :class="{ disabled: !canCloseOtherTags(contextMenu.tag) }"
          @click="handleContextMenuCommand('others')"
        >
          关闭其他
        </li>
        <li
          :class="{ disabled: !canCloseRightTags(contextMenu.tag) }"
          @click="handleContextMenuCommand('right')"
        >
          关闭右侧
        </li>
        <li
          :class="{ disabled: !canCloseLeftTags(contextMenu.tag) }"
          @click="handleContextMenuCommand('left')"
        >
          关闭左侧
        </li>
        <li
          :class="{ disabled: !canCloseAllTags() }"
          @click="handleContextMenuCommand('all')"
        >
          关闭全部
        </li>
      </ul>
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

  .mobile-sidebar-trigger {
    display: none;
    width: 50px;
    height: 50px;
    flex: 0 0 50px;
    align-items: center;
    justify-content: center;
    margin-left: -20px;
    cursor: pointer;
    transition: background-color 0.3s;

    .el-icon {
      font-size: 20px;
      color: #303133;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.025);
    }

    &:active {
      background-color: rgba(0, 0, 0, 0.05);
    }

    @media screen and (max-width: 768px) {
      display: flex;
    }
  }

  .left-section {
    flex: 1;

    @media screen and (max-width: 768px) {
      display: none;
    }
  }

  .right-section {
    @media screen and (max-width: 768px) {
      margin-left: auto;
    }

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

  .tags-context-menu {
    position: fixed;
    z-index: 2000;
    width: 118px;
    padding: 4px 0;
    margin: 0;
    list-style: none;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
    color: #606266;
    font-size: 12px;

    li {
      height: 30px;
      line-height: 30px;
      padding: 0 14px;
      cursor: pointer;
      user-select: none;

      &:hover {
        background: #ecf5ff;
        color: #409eff;
      }

      &.disabled {
        color: #c0c4cc;
        cursor: not-allowed;

        &:hover {
          background: transparent;
          color: #c0c4cc;
        }
      }
    }
  }

  /* 移除 .el-scrollbar__bar 样式，因为已经没有 el-scrollbar 了 */
}
</style>
