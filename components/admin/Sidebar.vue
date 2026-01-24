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
  webset: '2',
  ad: '2',
  sitemap: '2',
  'online-update': '2',
  import: '2',
  apilist: '3',
  createapi: '3',
  addparam: '3',
  categories: '3',
  prefix: '3',
  apilogs: '3',
  apiset: '3',
  statistics: '3',
  userlist: '4',
  rolelist: '4',
  permissionlist: '4',
  keylog: '4',
  articlelist: '5',
  createarticle: '5',
  'ai-article': '5',
  articleset: '5',
  pay: '6',
  createRechargeCard: '6',
  useRechargeCard: '6',
  rechargeCardHistory: '6',
  rechargerecord: '6',
  buypackagerecord: '6',
  package: '6',
  buy: '6',
  mypackage: '6',
  userPackageManagement: '6',
  'ip-ban': '7',
  'api-rate-limit': '7',
  key: '8',
  password: '8',
  phone: '8',
  profile: '8',
  merchant: '11',
  'merchant-manage': '11',
  logs: '12',
}

const thirdPath = pathArr[2] // 注意 pathArr[2] 是第3段

if (thirdPath && pathMap[thirdPath]) {
  defaultOpeneds.value = [pathMap[thirdPath]]
}

// 路由与菜单索引映射，用于高亮当前项
const pathIndexMap = {
  '/admin': '1',
  '/admin/webset': '2-1',
  '/admin/ad': '2-2',
  '/admin/sitemap': '2-3',
  '/admin/online-update': '2-4',
  '/admin/import': '2-5',
  '/admin/apilist': '3-1',
  '/admin/createapi': '3-2',
  '/admin/addparam': '3-3',
  '/admin/categories': '3-4',
  '/admin/prefix': '3-5',
  '/admin/apilogs': '3-6',
  '/admin/statistics': '3-7',
  '/admin/userlist': '4-1',
  '/admin/rolelist': '4-2',
  '/admin/permissionlist': '4-3',
  '/admin/keylog': '4-4',
  '/admin/articlelist': '5-1',
  '/admin/createarticle': '5-2',
  '/admin/ai-article': '5-3',
  '/admin/pay': '6-1',
  '/admin/createRechargeCard': '6-2',
  '/admin/useRechargeCard': '6-3',
  '/admin/rechargeCardHistory': '6-4',
  '/admin/rechargerecord': '6-5',
  '/admin/buypackagerecord': '6-6',
  '/admin/package': '6-7',
  '/admin/buy': '6-8',
  '/admin/mypackage': '6-9',
  '/admin/userPackageManagement': '6-10',
  '/admin/ip-ban': '7-1',
  '/admin/api-rate-limit': '7-2',
  '/admin/key': '8-2',
  '/admin/password': '8-3',
  '/admin/phone': '8-4',
  '/admin/links': '9',
  '/admin/merchant': '11-1',
  '/admin/merchant-manage': '11-2',
  '/admin/logs': '12-1',
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

        <el-sub-menu
          index="2"
          v-if="
            routeShowArr([
              '/admin/webset',
              '/admin/ad',
              '/admin/sitemap',
              '/admin/online-update',
              '/admin/import',
            ])
          "
        >
          <template #title>
            <el-icon>
              <Setting />
            </el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item-group title="系统设置">
            <el-menu-item
              index="2-1"
              @click="navigateTo('/admin/webset')"
              v-if="routeShow('/admin/webset')"
              >基本设置</el-menu-item
            >
            <el-menu-item
              index="2-2"
              @click="navigateTo('/admin/ad')"
              v-if="routeShow('/admin/ad')"
              >广告位管理</el-menu-item
            >
            <el-menu-item
              index="2-3"
              @click="sitemap()"
              v-if="routeShow('/admin/sitemap')"
              >生成网站地图
            </el-menu-item>
            <el-menu-item
              index="2-4"
              @click="navigateTo('/admin/online-update')"
              v-if="routeShow('/admin/online-update')"
            >
              在线更新
            </el-menu-item>
            <el-menu-item
              index="2-5"
              @click="navigateTo('/admin/import')"
              v-if="routeShow('/admin/import')"
            >
              一键对接
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

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

        <el-sub-menu
          index="4"
          v-if="
            routeShowArr([
              '/admin/userlist',
              '/admin/rolelist',
              '/admin/permissionlist',
              '/admin/keylog',
            ])
          "
        >
          <template #title>
            <el-icon>
              <Avatar />
            </el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item-group title="用户管理">
            <el-menu-item
              index="4-1"
              @click="navigateTo('/admin/userlist')"
              v-if="routeShow('/admin/userlist')"
              >用户列表</el-menu-item
            >
            <el-menu-item
              index="4-2"
              @click="navigateTo('/admin/rolelist')"
              v-if="routeShow('/admin/rolelist')"
              >角色列表</el-menu-item
            >
            <el-menu-item
              index="4-3"
              @click="navigateTo('/admin/permissionlist')"
              v-if="routeShow('/admin/permissionlist')"
              >权限列表</el-menu-item
            >
            <el-menu-item
              index="4-4"
              @click="navigateTo('/admin/keylog')"
              v-if="routeShow('/admin/keylog')"
              >秘钥历史记录</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu
          index="5"
          v-if="routeShowArr(['/admin/articlelist', '/admin/createarticle'])"
        >
          <template #title>
            <el-icon>
              <Tickets />
            </el-icon>
            <span>文章管理</span>
          </template>
          <el-menu-item-group title="文章管理">
            <el-menu-item
              index="5-1"
              @click="navigateTo('/admin/articlelist')"
              v-if="routeShow('/admin/articlelist')"
              >文章列表</el-menu-item
            >
            <el-menu-item
              index="5-2"
              @click="navigateTo('/admin/createarticle')"
              v-if="routeShow('/admin/createarticle')"
              >新增文章</el-menu-item
            >
            <el-menu-item
              index="5-3"
              @click="navigateTo('/admin/ai-article')"
              v-if="routeShow('/admin/createarticle')"
              >AI生成文章</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu
          index="6"
          v-if="
            routeShowArr([
              '/admin/pay',
              '/admin/createRechargeCard',
              '/admin/useRechargeCard',
              '/admin/rechargeCardHistory',
              '/admin/rechargerecord',
              '/admin/buypackagerecord',
              '/admin/package',
              '/admin/buy',
              '/admin/mypackage',
              'userPackageManagement',
            ])
          "
        >
          <template #title>
            <el-icon>
              <Wallet />
            </el-icon>
            <span>财务功能</span>
          </template>
          <el-menu-item-group title="财务功能">
            <el-menu-item
              index="6-1"
              @click="navigateTo('/admin/pay')"
              v-if="routeShow('/admin/pay')"
              >账户充值</el-menu-item
            >
            <el-menu-item
              index="6-2"
              @click="navigateTo('/admin/createRechargeCard')"
              v-if="routeShow('/admin/createRechargeCard')"
              >生成充值卡</el-menu-item
            >
            <el-menu-item
              index="6-3"
              @click="navigateTo('/admin/useRechargeCard')"
              v-if="routeShow('/admin/useRechargeCard')"
              >使用充值卡</el-menu-item
            >
            <el-menu-item
              index="6-4"
              @click="navigateTo('/admin/rechargeCardHistory')"
              v-if="routeShow('/admin/rechargeCardHistory')"
              >充值卡记录</el-menu-item
            >
            <el-menu-item
              index="6-5"
              @click="navigateTo('/admin/rechargerecord')"
              v-if="routeShow('/admin/rechargerecord')"
              >充值记录</el-menu-item
            >
            <el-menu-item
              index="6-6"
              @click="navigateTo('/admin/buypackagerecord')"
              v-if="routeShow('/admin/buypackagerecord')"
              >购买记录</el-menu-item
            >
            <el-menu-item
              index="6-7"
              @click="navigateTo('/admin/package')"
              v-if="routeShow('/admin/package')"
              >套餐管理</el-menu-item
            >
            <el-menu-item
              index="6-8"
              @click="navigateTo('/admin/buy')"
              v-if="routeShow('/admin/buy')"
              >购买套餐</el-menu-item
            >
            <el-menu-item
              index="6-9"
              @click="navigateTo('/admin/mypackage')"
              v-if="routeShow('/admin/mypackage')"
              >我的套餐</el-menu-item
            >
            <el-menu-item
              index="6-10"
              @click="navigateTo('/admin/userPackageManagement')"
              v-if="routeShow('/admin/userPackageManagement')"
              >用户套餐管理</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu
          index="7"
          v-if="routeShowArr(['/admin/ip-ban', '/admin/api-rate-limit'])"
        >
          <template #title>
            <el-icon>
              <Lock />
            </el-icon>
            <span>安全管理</span>
          </template>
          <el-menu-item-group title="安全管理">
            <el-menu-item
              index="7-1"
              @click="navigateTo('/admin/ip-ban')"
              v-if="routeShow('/admin/ip-ban')"
              >IP封禁</el-menu-item
            >
            <el-menu-item
              index="7-2"
              @click="navigateTo('/admin/api-rate-limit')"
              v-if="routeShow('/admin/api-rate-limit')"
              >接口限频</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu
          index="8"
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
              <Avatar />
            </el-icon>
            <span>个人中心</span>
          </template>
          <el-menu-item-group title="个人中心">
            <el-menu-item
              index="8-1"
              @click="navigateTo('/admin/profile')"
              v-if="routeShow('/admin/profile')"
              >个人信息</el-menu-item
            >
            <el-menu-item
              index="8-2"
              @click="navigateTo('/admin/key')"
              v-if="routeShow('/admin/key')"
              >API密钥管理</el-menu-item
            >
            <el-menu-item
              index="8-3"
              @click="navigateTo('/admin/password')"
              v-if="routeShow('/admin/password')"
              >修改密码</el-menu-item
            >
            <el-menu-item
              index="8-4"
              @click="navigateTo('/admin/phone')"
              v-if="routeShow('/admin/phone')"
              >手机号管理</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <el-menu-item
          index="9"
          @click="navigateTo('/admin/links')"
          v-if="routeShow('/admin/links')"
        >
          <el-icon>
            <Connection />
          </el-icon>
          <template #title>友情链接</template>
        </el-menu-item>

        <el-sub-menu index="11">
          <template #title>
            <el-icon>
              <Shop />
            </el-icon>
            <span>商户管理</span>
          </template>
          <el-menu-item-group title="商户管理">
            <el-menu-item
              index="11-1"
              @click="navigateTo('/admin/merchant')"
              v-if="routeShow('/admin/merchant')"
              >商户审核</el-menu-item
            >
            <el-menu-item
              index="11-2"
              @click="navigateTo('/admin/merchant-manage')"
              >商户列表</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu index="12">
          <template #title>
            <el-icon>
              <Document />
            </el-icon>
            <span>日志管理</span>
          </template>
          <el-menu-item-group title="日志管理">
            <el-menu-item index="12-1" @click="navigateTo('/admin/logs')"
              >综合日志</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <el-menu-item index="10" @click="navigateTo('/')">
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
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #ffffff !important;
}

/* 分组标题更紧凑 */
:deep(.el-menu-item-group__title) {
  padding-left: 16px;
  color: #909399;
}
</style>
