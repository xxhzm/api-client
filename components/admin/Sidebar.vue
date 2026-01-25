<script setup>
import {
  List,
  Menu as IconMenu,
  Setting,
  Odometer,
  Promotion,
  Tickets,
  Avatar,
  Connection,
  Wallet,
  Lock,
  Shop,
  Document,
} from '@element-plus/icons-vue'

const options = useState('options')

const defaultOpeneds = ref([])
const defaultActive = ref('')

const { $msg, $myFetch } = useNuxtApp()
const routeInfo = useCookie('routeInfo')

// 判断是否拥有权限，动态显示左侧边栏
const routeShow = (path) => {
  if (path === undefined) {
    return false
  }

  const state = routeInfo.value.find((obj) => obj.path === path)

  if (state !== undefined) {
    return true
  }

  return false
}

const routeShowArr = (arr) => {
  if (arr === undefined) {
    return false
  }

  const set2 = new Set(arr)

  const state = routeInfo.value.some((obj) => set2.has(obj.path))
  if (state === true) {
    return true
  }

  return false
}

const handleOpen = (key, keyPath) => {
  // console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  // console.log(key, keyPath)
}

const sitemap = async () => {
  const res = await $myFetch('Sitemap', {
    method: 'GET',
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'success')
  }
}
// 获取当前打开的菜单
const path = useRoute().path
const pathArr = path.split('/')

const pathMap = {
  // 1: Dashboard (no sub-menu)

  // 2: System & Security (Moved from 6)
  webset: '2',
  sitemap: '2',
  'online-update': '2',
  import: '2',
  'ip-ban': '2',
  'api-rate-limit': '2',
  logs: '2',

  // 3: API Management (Moved from 2)
  apilist: '3',
  createapi: '3',
  addparam: '3',
  categories: '3',
  prefix: '3',
  apilogs: '3',
  statistics: '3',

  // 4: Finance Management (Moved from 3)
  package: '4',
  userPackageManagement: '4',
  rechargerecord: '4',
  buypackagerecord: '4',
  createRechargeCard: '4',
  rechargeCardHistory: '4',
  pay: '4',
  buy: '4',
  mypackage: '4',
  useRechargeCard: '4',

  // 5: User & Merchant (Moved from 4)
  userlist: '5',
  rolelist: '5',
  permissionlist: '5',
  merchant: '5',
  'merchant-manage': '5',
  keylog: '5',

  // 6: Content & Operation (Moved from 5)
  articlelist: '6',
  createarticle: '6',
  'ai-article': '6',
  ad: '6',
  links: '6',

  // 7: Personal Center (Unchanged)
  profile: '7',
  key: '7',
  password: '7',
  phone: '7',
}

const thirdPath = pathArr[2] // 注意 pathArr[2] 是第3段

if (thirdPath && pathMap[thirdPath]) {
  defaultOpeneds.value = [pathMap[thirdPath]]
}

// 路由与菜单索引映射，用于高亮当前项
const pathIndexMap = {
  '/admin': '1',

  // System & Security (2)
  '/admin/webset': '2-1',
  '/admin/sitemap': '2-2',
  '/admin/online-update': '2-3',
  '/admin/import': '2-4',
  '/admin/ip-ban': '2-5',
  '/admin/api-rate-limit': '2-6',
  '/admin/logs': '2-7',

  // API Management (3)
  '/admin/apilist': '3-1',
  '/admin/createapi': '3-2',
  '/admin/addparam': '3-3',
  '/admin/categories': '3-4',
  '/admin/prefix': '3-5',
  '/admin/apilogs': '3-6',
  '/admin/statistics': '3-7',

  // Finance Management (4)
  '/admin/package': '4-1',
  '/admin/userPackageManagement': '4-2',
  '/admin/rechargerecord': '4-3',
  '/admin/buypackagerecord': '4-4',
  '/admin/createRechargeCard': '4-5',
  '/admin/rechargeCardHistory': '4-6',
  '/admin/pay': '4-7',
  '/admin/buy': '4-8',
  '/admin/mypackage': '4-9',
  '/admin/useRechargeCard': '4-10',

  // User & Merchant (5)
  '/admin/userlist': '5-1',
  '/admin/rolelist': '5-2',
  '/admin/permissionlist': '5-3',
  '/admin/merchant': '5-4',
  '/admin/merchant-manage': '5-5',
  '/admin/keylog': '5-6',

  // Content & Operation (6)
  '/admin/articlelist': '6-1',
  '/admin/createarticle': '6-2',
  '/admin/ai-article': '6-3',
  '/admin/ad': '6-4',
  '/admin/links': '6-5',

  // Personal Center (7)
  '/admin/profile': '7-1',
  '/admin/key': '7-2',
  '/admin/password': '7-3',
  '/admin/phone': '7-4',
}

const route = useRoute()
// 初始化高亮
defaultActive.value = pathIndexMap[route.path] || ''
// 路由变化时更新高亮
watch(
  () => route.path,
  (newPath) => {
    defaultActive.value = pathIndexMap[newPath] || ''
  },
)
</script>

<template>
  <div class="sidebar-container">
    <el-menu
      class="sidebar-menu"
      @open="handleOpen"
      @close="handleClose"
      :unique-opened="true"
      :default-openeds="defaultOpeneds"
      :default-active="defaultActive"
    >
      <el-menu-item index="logo" @click="navigateTo('/admin')">
        <img :src="options.logo" alt="logo" class="logo" style="width: 120px" />
      </el-menu-item>
      <div>
        <!-- 1. 控制台 -->
        <el-menu-item
          index="1"
          @click="navigateTo('/admin')"
          v-if="routeShow('/admin')"
          style="margin-top: 10px"
        >
          <el-icon>
            <Odometer />
          </el-icon>
          <template #title>控制台</template>
        </el-menu-item>

        <!-- 2. 系统与安全 (Moved here) -->
        <el-sub-menu
          index="2"
          v-if="
            routeShowArr([
              '/admin/webset',
              '/admin/sitemap',
              '/admin/online-update',
              '/admin/import',
              '/admin/ip-ban',
              '/admin/api-rate-limit',
              '/admin/logs',
            ])
          "
        >
          <template #title>
            <el-icon>
              <Setting />
            </el-icon>
            <span>系统与安全</span>
          </template>
          <el-menu-item-group title="系统与安全">
            <el-menu-item
              index="2-1"
              @click="navigateTo('/admin/webset')"
              v-if="routeShow('/admin/webset')"
              >基本设置</el-menu-item
            >
            <el-menu-item
              index="2-2"
              @click="sitemap()"
              v-if="routeShow('/admin/sitemap')"
              >生成网站地图
            </el-menu-item>
            <el-menu-item
              index="2-3"
              @click="navigateTo('/admin/online-update')"
              v-if="routeShow('/admin/online-update')"
            >
              在线更新
            </el-menu-item>
            <el-menu-item
              index="2-4"
              @click="navigateTo('/admin/import')"
              v-if="routeShow('/admin/import')"
            >
              一键对接
            </el-menu-item>
            <el-menu-item
              index="2-5"
              @click="navigateTo('/admin/ip-ban')"
              v-if="routeShow('/admin/ip-ban')"
              >IP封禁</el-menu-item
            >
            <el-menu-item
              index="2-6"
              @click="navigateTo('/admin/api-rate-limit')"
              v-if="routeShow('/admin/api-rate-limit')"
              >接口限频</el-menu-item
            >
            <el-menu-item
              index="2-7"
              @click="navigateTo('/admin/logs')"
              v-if="routeShow('/admin/logs')"
              >综合日志</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 3. 接口管理 -->
        <el-sub-menu
          index="3"
          v-if="
            routeShowArr([
              '/admin/apilist',
              '/admin/createapi',
              '/admin/addparam',
              '/admin/categories',
              '/admin/prefix',
              '/admin/apilogs',
              '/admin/statistics',
            ])
          "
        >
          <template #title>
            <el-icon>
              <List />
            </el-icon>
            <span>接口管理</span>
          </template>
          <el-menu-item-group title="接口管理">
            <el-menu-item
              index="3-1"
              @click="navigateTo('/admin/apilist')"
              v-if="routeShow('/admin/apilist')"
              >接口列表</el-menu-item
            >
            <el-menu-item
              index="3-2"
              @click="navigateTo('/admin/createapi')"
              v-if="routeShow('/admin/createapi')"
              >新增接口</el-menu-item
            >
            <el-menu-item
              index="3-3"
              @click="navigateTo('/admin/addparam')"
              v-if="routeShow('/admin/addparam')"
              >添加参数</el-menu-item
            >
            <el-menu-item
              index="3-4"
              @click="navigateTo('/admin/categories')"
              v-if="routeShow('/admin/categories')"
              >管理分类</el-menu-item
            >
            <el-menu-item
              index="3-5"
              @click="navigateTo('/admin/prefix')"
              v-if="routeShow('/admin/prefix')"
              >管理前缀</el-menu-item
            >
            <el-menu-item
              index="3-6"
              @click="navigateTo('/admin/apilogs')"
              v-if="routeShow('/admin/apilogs')"
              >接口日志</el-menu-item
            >
            <el-menu-item
              index="3-7"
              @click="navigateTo('/admin/statistics')"
              v-if="routeShow('/admin/statistics')"
              >统计分析</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 4. 财务管理 -->
        <el-sub-menu
          index="4"
          v-if="
            routeShowArr([
              '/admin/package',
              '/admin/userPackageManagement',
              '/admin/rechargerecord',
              '/admin/buypackagerecord',
              '/admin/createRechargeCard',
              '/admin/rechargeCardHistory',
              '/admin/pay',
              '/admin/buy',
              '/admin/mypackage',
              '/admin/useRechargeCard',
            ])
          "
        >
          <template #title>
            <el-icon>
              <Wallet />
            </el-icon>
            <span>财务管理</span>
          </template>
          <el-menu-item-group title="财务管理">
            <el-menu-item
              index="4-1"
              @click="navigateTo('/admin/package')"
              v-if="routeShow('/admin/package')"
              >套餐管理</el-menu-item
            >
            <el-menu-item
              index="4-2"
              @click="navigateTo('/admin/userPackageManagement')"
              v-if="routeShow('/admin/userPackageManagement')"
              >用户套餐</el-menu-item
            >
            <el-menu-item
              index="4-3"
              @click="navigateTo('/admin/rechargerecord')"
              v-if="routeShow('/admin/rechargerecord')"
              >充值记录</el-menu-item
            >
            <el-menu-item
              index="4-4"
              @click="navigateTo('/admin/buypackagerecord')"
              v-if="routeShow('/admin/buypackagerecord')"
              >购买记录</el-menu-item
            >
            <el-menu-item
              index="4-5"
              @click="navigateTo('/admin/createRechargeCard')"
              v-if="routeShow('/admin/createRechargeCard')"
              >生成充值卡</el-menu-item
            >
            <el-menu-item
              index="4-6"
              @click="navigateTo('/admin/rechargeCardHistory')"
              v-if="routeShow('/admin/rechargeCardHistory')"
              >充值卡记录</el-menu-item
            >
            <el-menu-item
              index="4-7"
              @click="navigateTo('/admin/pay')"
              v-if="routeShow('/admin/pay')"
              >账户充值</el-menu-item
            >
            <el-menu-item
              index="4-8"
              @click="navigateTo('/admin/buy')"
              v-if="routeShow('/admin/buy')"
              >购买套餐</el-menu-item
            >
            <el-menu-item
              index="4-9"
              @click="navigateTo('/admin/mypackage')"
              v-if="routeShow('/admin/mypackage')"
              >我的套餐</el-menu-item
            >
            <el-menu-item
              index="4-10"
              @click="navigateTo('/admin/useRechargeCard')"
              v-if="routeShow('/admin/useRechargeCard')"
              >使用充值卡</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 5. 用户与商户 -->
        <el-sub-menu
          index="5"
          v-if="
            routeShowArr([
              '/admin/userlist',
              '/admin/rolelist',
              '/admin/permissionlist',
              '/admin/merchant',
              '/admin/merchant-manage',
              '/admin/keylog',
            ])
          "
        >
          <template #title>
            <el-icon>
              <Avatar />
            </el-icon>
            <span>用户与商户</span>
          </template>
          <el-menu-item-group title="用户与商户">
            <el-menu-item
              index="5-1"
              @click="navigateTo('/admin/userlist')"
              v-if="routeShow('/admin/userlist')"
              >用户列表</el-menu-item
            >
            <el-menu-item
              index="5-2"
              @click="navigateTo('/admin/rolelist')"
              v-if="routeShow('/admin/rolelist')"
              >角色列表</el-menu-item
            >
            <el-menu-item
              index="5-3"
              @click="navigateTo('/admin/permissionlist')"
              v-if="routeShow('/admin/permissionlist')"
              >权限列表</el-menu-item
            >
            <el-menu-item
              index="5-4"
              @click="navigateTo('/admin/merchant')"
              v-if="routeShow('/admin/merchant')"
              >商户审核</el-menu-item
            >
            <el-menu-item
              index="5-5"
              @click="navigateTo('/admin/merchant-manage')"
              v-if="routeShow('/admin/merchant-manage')"
              >商户列表</el-menu-item
            >
            <el-menu-item
              index="5-6"
              @click="navigateTo('/admin/keylog')"
              v-if="routeShow('/admin/keylog')"
              >秘钥历史</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 6. 内容与运营 -->
        <el-sub-menu
          index="6"
          v-if="
            routeShowArr([
              '/admin/articlelist',
              '/admin/createarticle',
              '/admin/ai-article',
              '/admin/ad',
              '/admin/links',
            ])
          "
        >
          <template #title>
            <el-icon>
              <Tickets />
            </el-icon>
            <span>内容与运营</span>
          </template>
          <el-menu-item-group title="内容与运营">
            <el-menu-item
              index="6-1"
              @click="navigateTo('/admin/articlelist')"
              v-if="routeShow('/admin/articlelist')"
              >文章列表</el-menu-item
            >
            <el-menu-item
              index="6-2"
              @click="navigateTo('/admin/createarticle')"
              v-if="routeShow('/admin/createarticle')"
              >新增文章</el-menu-item
            >
            <el-menu-item
              index="6-3"
              @click="navigateTo('/admin/ai-article')"
              v-if="routeShow('/admin/createarticle')"
              >AI生成文章</el-menu-item
            >
            <el-menu-item
              index="6-4"
              @click="navigateTo('/admin/ad')"
              v-if="routeShow('/admin/ad')"
              >广告位管理</el-menu-item
            >
            <el-menu-item
              index="6-5"
              @click="navigateTo('/admin/links')"
              v-if="routeShow('/admin/links')"
            >
              友情链接
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 7. 个人中心 -->
        <el-sub-menu
          index="7"
          v-if="
            routeShowArr([
              '/admin/profile',
              '/admin/key',
              '/admin/password',
              '/admin/phone',
            ])
          "
        >
          <template #title>
            <el-icon>
              <Lock />
            </el-icon>
            <span>个人中心</span>
          </template>
          <el-menu-item-group title="个人中心">
            <el-menu-item
              index="7-1"
              @click="navigateTo('/admin/profile')"
              v-if="routeShow('/admin/profile')"
              >个人信息</el-menu-item
            >
            <el-menu-item
              index="7-2"
              @click="navigateTo('/admin/key')"
              v-if="routeShow('/admin/key')"
              >API密钥管理</el-menu-item
            >
            <el-menu-item
              index="7-3"
              @click="navigateTo('/admin/password')"
              v-if="routeShow('/admin/password')"
              >修改密码</el-menu-item
            >
            <el-menu-item
              index="7-4"
              @click="navigateTo('/admin/phone')"
              v-if="routeShow('/admin/phone')"
              >手机号管理</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 8. 访问前台 -->
        <el-menu-item index="8" @click="navigateTo('/')">
          <el-icon>
            <Promotion />
          </el-icon>
          <template #title>访问前台</template>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<style lang="less" scoped>
.sidebar-container {
  .sidebar-menu {
    height: 100%;
  }

  .sidebar-menu:not(.el-menu--collapse) {
    width: 200px;
  }
}

@media screen and (max-width: 768px) {
  .sidebar-container {
    position: absolute;
    left: 0;
    z-index: 999;
    height: 120vh;
  }
}

/* 自定义菜单样式，接近示例图片效果 */
:deep(.el-menu) {
  border-right: none;
  background: #ffffff;
  padding-top: 8px;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 44px;
  line-height: 44px;
  margin: 6px 12px;
  border-radius: 10px;
  color: #333;
  padding-left: 12px;
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  margin-right: 10px;
}

/* 悬停效果 */
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background: #f0f6ff;
  color: #1677ff;
}

/* 激活项高亮为蓝底白字 */
:deep(.el-menu-item.is-active) {
  background: #1677ff !important;
  color: #ffffff !important;
  font-weight: 500;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #ffffff !important;
}

/* 分组标题更紧凑 */
:deep(.el-menu-item-group__title) {
  padding-left: 16px;
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style>
