<script setup>
import { markRaw } from 'vue'

// ECharts 按需动态导入，避免全量打包
let echarts = null
import {
  TrendCharts,
  Wallet,
  Ticket,
  Box,
  Key,
  Document,
  ArrowRight,
  Refresh,
  User,
  Message,
  CircleCheck,
  Warning,
  Link,
  Bell,
  Phone,
  Timer,
  Setting,
  List,
  Avatar,
  DataLine,
  Coin,
  Shop,
  Iphone,
  Reading,
  ShoppingCart,
} from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const { $myFetch, $msg } = useNuxtApp()
const username = useCookie('username')
const routeInfo = useCookie('routeInfo')
const { userAccessKey } = useUserKey()

// 判断是否是管理员（通过 /admin/system 路由权限判断）
const isAdmin = computed(() => {
  if (!routeInfo.value) return false
  return routeInfo.value.some((r) => r.path === '/admin/system')
})

// 判断是否有某个路由权限
const hasRoute = (path) => {
  if (!routeInfo.value) return false
  return routeInfo.value.some((r) => r.path === path)
}

// User Info State
const userInfo = reactive({
  id: 0,
  username: '',
  mail: '',
  phone: '',
  mail_verified: false,
  phone_verified: false,
})

const balance = ref(0)
const currentMonthTopUp = ref(0)
const totalTopUp = ref(0)

// Package stats (from Profile API)
const packageStats = reactive({
  total: 0,
  expiringSoon: 0,
})

// Admin stats (from Profile API)
const adminStats = reactive({
  totalUsers: 0,
  totalApis: 0,
  totalRequests: 0,
  todayIncome: 0,
  phoneVerifiedUsers: 0,
  recentRegisters: 0,
  totalArticles: 0,
  totalPackageSales: 0,
})

// Chart data
const chartData = reactive({
  recent_request: [],
  today_request: [],
})

const total24h = ref(0)
const activeChartTab = ref('trend')

// Recent access quick links - 普通用户
const userAccessLinks = [
  { title: '账户充值', path: '/admin/pay' },
  { title: '购买套餐', path: '/admin/buy' },
  { title: '我的套餐', path: '/admin/mypackage' },
  { title: 'API密钥', path: '/admin/key' },
  { title: '修改密码', path: '/admin/password' },
  { title: '使用充值卡', path: '/admin/useRechargeCard' },
]

// Recent access quick links - 管理员
const adminAccessLinks = [
  { title: '基本设置', path: '/admin/webset' },
  { title: '用户列表', path: '/admin/userlist' },
  { title: '接口列表', path: '/admin/apilist' },
  { title: '新增接口', path: '/admin/createapi' },
  { title: '套餐管理', path: '/admin/package' },
  { title: '充值记录', path: '/admin/rechargerecord' },
  { title: '统计分析', path: '/admin/statistics' },
  { title: '接口日志', path: '/admin/apilogs' },
]

// 根据权限过滤链接
const recentAccessLinks = computed(() => {
  const links = isAdmin.value ? adminAccessLinks : userAccessLinks
  return links.filter((link) => hasRoute(link.path))
})

// Resource stats - 普通用户 (使用 markRaw 避免组件被转为响应式)
const userResourceStats = ref([
  { icon: markRaw(Box), title: '我的套餐', count: 0, unit: '个', color: '#3b82f6', bgColor: '#eff6ff', path: '/admin/mypackage' },
  { icon: markRaw(TrendCharts), title: '今日调用', count: 0, unit: '次', color: '#8b5cf6', bgColor: '#f5f3ff', path: '/admin/statistics' },
  { icon: markRaw(Key), title: 'API密钥', count: 1, unit: '个', color: '#10b981', bgColor: '#ecfdf5', path: '/admin/key' },
  { icon: markRaw(Timer), title: '即将到期', count: 0, unit: '个', color: '#f59e0b', bgColor: '#fffbeb', path: '/admin/mypackage' },
])

// Resource stats - 管理员 (data from Profile API, 使用 markRaw 避免组件被转为响应式)
const adminResourceStats = ref([
  { icon: markRaw(Avatar), title: '用户总数', count: 0, unit: '人', color: '#3b82f6', bgColor: '#eff6ff', path: '/admin/userlist' },
  { icon: markRaw(Iphone), title: '已绑定手机', count: 0, unit: '人', color: '#06b6d4', bgColor: '#ecfeff', path: '/admin/userlist' },
  { icon: markRaw(User), title: '24h新注册', count: 0, unit: '人', color: '#ef4444', bgColor: '#fef2f2', path: '/admin/userlist' },
  { icon: markRaw(List), title: '接口总数', count: 0, unit: '个', color: '#8b5cf6', bgColor: '#f5f3ff', path: '/admin/apilist' },
  { icon: markRaw(TrendCharts), title: '总请求数', count: 0, unit: '次', color: '#10b981', bgColor: '#ecfdf5', path: '/admin/statistics' },
  { icon: markRaw(Coin), title: '今日收入', count: 0, unit: '元', color: '#f59e0b', bgColor: '#fffbeb', path: '/admin/rechargerecord' },
  { icon: markRaw(Reading), title: '文章总数', count: 0, unit: '篇', color: '#ec4899', bgColor: '#fdf2f8', path: '/admin/articlelist' },
  { icon: markRaw(ShoppingCart), title: '套餐销量', count: 0, unit: '单', color: '#22c55e', bgColor: '#f0fdf4', path: '/admin/buypackagerecord' },
])

// Fetch Profile
const fetchProfile = async () => {
  try {
    const res = await $myFetch('Profile')
    if (res.code === 200) {
      const data = res.data
      
      // 基本用户信息
      userInfo.id = data.id
      userInfo.username = username.value || '用户'
      userInfo.mail = data.mail || ''
      userInfo.phone = data.phone || ''
      userInfo.mail_verified = !!data.mail
      userInfo.phone_verified = !!data.phone

      // 图表数据
      chartData.recent_request = data.recent_request || []
      chartData.today_request = data.today_request || []

      // 用户资源统计 - 使用接口返回的数据
      userResourceStats.value[0].count = data.available_packages || 0  // 我的套餐
      packageStats.total = data.available_packages || 0
      
      userResourceStats.value[3].count = data.expiring_packages || 0   // 即将到期
      packageStats.expiringSoon = data.expiring_packages || 0

      // 计算今日调用总数
      let totalCalls = 0
      ;(data.today_request || []).forEach((item) => {
        totalCalls += Number(item?.number || 0)
      })
      userResourceStats.value[1].count = totalCalls

      // 计算24小时调用总数
      let total = 0
      ;(data.recent_request || []).forEach((element) => {
        total += Number(element?.number || 0)
      })
      total24h.value = total

      // 管理员统计数据 - 使用接口返回的数据
      if (isAdmin.value) {
        adminStats.totalUsers = data.total_users || 0
        adminStats.totalApis = data.total_apis || 0
        adminStats.todayIncome = Number(data.today_income || 0)
        adminStats.totalRequests = data.total_requests || 0
        adminStats.phoneVerifiedUsers = data.phone_bind_users || 0
        adminStats.recentRegisters = data.recent_registers || 0
        adminStats.totalArticles = data.total_articles || 0
        adminStats.totalPackageSales = data.total_package_sold || 0

        adminResourceStats.value[0].count = data.total_users || 0              // 用户总数
        adminResourceStats.value[1].count = data.phone_bind_users || 0        // 已绑定手机
        adminResourceStats.value[2].count = data.new_users_in_24h || 0        // 24h新注册
        adminResourceStats.value[3].count = data.total_apis || 0              // 接口总数
        adminResourceStats.value[4].count = data.total_requests || 0          // 总请求数
        adminResourceStats.value[5].count = Number(data.today_income || 0)    // 今日收入
        adminResourceStats.value[6].count = data.total_articles || 0          // 文章总数
        adminResourceStats.value[7].count = data.total_package_sold || 0      // 套餐销量
      }

      nextTick(() => {
        initChart()
      })
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  }
}

// Fetch Balance
const fetchBalance = async (showTip = false) => {
  try {
    const res = await $myFetch('UserBalance', {
      params: { username: username.value },
    })
    if (res.code === 200) {
      const data = res.data || {}
      balance.value = Number(data.AccountBalance || 0)
      currentMonthTopUp.value = Number(data.CurrentMonthTopUp || 0)
      totalTopUp.value = Number(data.TotalTopUp || 0)
      if (showTip) $msg('余额刷新成功', 'success')
    }
  } catch (error) {
    if (showTip) $msg('获取余额失败', 'error')
  }
}


// Init Chart
const initChart = async () => {
  if (!process.client) return

  const chartDom = document.getElementById('dataOverviewChart')
  if (!chartDom) return

  // 动态导入 ECharts 核心模块（按需加载，减小首屏体积）
  if (!echarts) {
    const echartsCore = await import('echarts/core')
    const { LineChart } = await import('echarts/charts')
    const { TooltipComponent, GridComponent, GraphicComponent } = await import(
      'echarts/components'
    )
    const { CanvasRenderer } = await import('echarts/renderers')

    echartsCore.use([
      LineChart,
      TooltipComponent,
      GridComponent,
      GraphicComponent,
      CanvasRenderer,
    ])
    echarts = echartsCore
  }

  const chart = echarts.init(chartDom)

  const xAxisData = []
  const seriesData = []

  if (chartData.recent_request) {
    chartData.recent_request.forEach((element) => {
      try {
        const hour = new Date(element.time).getHours()
        xAxisData.push(`${hour}:00`)
      } catch {
        xAxisData.push('未知')
      }
      seriesData.push(Number(element.number || 0))
    })
  }

  const hasData = xAxisData.length > 0 && seriesData.length > 0

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
    },
    grid: { left: '3%', right: '4%', top: '10%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
    },
    series: [
      {
        data: seriesData,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#3b82f6',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.02)' },
          ]),
        },
      },
    ],
    graphic: hasData
      ? []
      : [
          {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: '暂无数据',
              fill: '#9ca3af',
              fontSize: 14,
            },
          },
        ],
  }

  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

const handleRefreshBalance = () => {
  fetchBalance(true)
}

// Format currency
const formatCNY = (n) => {
  const num = Number(n || 0)
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

onMounted(() => {
  fetchProfile()  // 包含用户信息、套餐统计、管理员统计数据
  fetchBalance()  // 获取账户余额
})

useHead({
  title: '管理后台',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
})
</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-layout">
      <!-- Main Content -->
      <div class="main-content">
        <!-- Recent Access -->
        <div class="card recent-access">
          <div class="card-header">
            <span class="card-title">最近访问</span>
          </div>
          <div class="quick-links">
            <div
              v-for="link in recentAccessLinks"
              :key="link.path"
              class="quick-link"
              @click="navigateTo(link.path)"
            >
              {{ link.title }}
            </div>
          </div>
        </div>

        <!-- Admin Stats (管理员专属) -->
        <div v-if="isAdmin" class="card admin-resources">
          <div class="card-header">
            <span class="card-title">系统概览</span>
            <span class="admin-badge">管理员</span>
          </div>
          <div class="resource-grid">
            <div
              v-for="stat in adminResourceStats"
              :key="stat.title"
              class="resource-item admin-item"
              @click="navigateTo(stat.path)"
            >
              <div class="resource-icon" :style="{ backgroundColor: stat.bgColor }">
                <el-icon :style="{ color: stat.color }">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <span class="resource-title">{{ stat.title }}</span>
              <span class="resource-count">
                {{ typeof stat.count === 'number' && stat.title === '今日收入' ? formatCNY(stat.count) : stat.count.toLocaleString() }}
                <small v-if="stat.title !== '今日收入'">{{ stat.unit }}</small>
              </span>
            </div>
          </div>
        </div>

        <!-- My Resources (用户资源) -->
        <div class="card my-resources">
          <div class="card-header">
            <span class="card-title">我的资源</span>
          </div>
          <div class="resource-grid">
            <div
              v-for="stat in userResourceStats"
              :key="stat.title"
              class="resource-item"
              @click="navigateTo(stat.path)"
            >
              <div class="resource-icon" :style="{ backgroundColor: stat.bgColor }">
                <el-icon :style="{ color: stat.color }">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <span class="resource-title">{{ stat.title }}</span>
              <span class="resource-count">
                {{ stat.count.toLocaleString() }}
                <small>{{ stat.unit }}</small>
              </span>
            </div>
          </div>
        </div>

        <!-- Data Overview -->
        <div class="card data-overview">
          <div class="card-header">
            <span class="card-title">数据概览</span>
            <span class="card-link" @click="navigateTo('/admin/statistics')">
              查看详情
              <el-icon><ArrowRight /></el-icon>
            </span>
          </div>
          <div class="chart-tabs">
            <div
              :class="['chart-tab', { active: activeChartTab === 'trend' }]"
              @click="activeChartTab = 'trend'"
            >
              请求趋势
            </div>
            <div
              :class="['chart-tab', { active: activeChartTab === 'ranking' }]"
              @click="activeChartTab = 'ranking'"
            >
              今日调用
            </div>
          </div>
          <!-- 请求趋势图表 -->
          <div v-show="activeChartTab === 'trend'" id="dataOverviewChart" class="chart-container"></div>
          <!-- 今日调用排行 -->
          <div v-show="activeChartTab === 'ranking'" class="today-ranking-panel">
            <div class="ranking-header">
              <span class="ranking-title">今日接口调用排行</span>
              <span class="ranking-total">共 {{ chartData.today_request.length }} 个接口，{{ userResourceStats[1].count.toLocaleString() }} 次调用</span>
            </div>
            <div class="ranking-table">
              <div class="ranking-table-header">
                <span class="col-rank">排名</span>
                <span class="col-name">接口名称</span>
                <span class="col-alias">接口标识</span>
                <span class="col-count">调用次数</span>
              </div>
              <div class="ranking-table-body">
                <div
                  v-for="(item, index) in chartData.today_request"
                  :key="item.alias"
                  class="ranking-table-row"
                >
                  <span :class="['col-rank', { top: index < 3 }]">
                    <span class="rank-badge">{{ index + 1 }}</span>
                  </span>
                  <span class="col-name" :title="item.name">{{ item.name }}</span>
                  <span class="col-alias">{{ item.alias }}</span>
                  <span class="col-count">{{ item.number.toLocaleString() }}</span>
                </div>
                <div v-if="!chartData.today_request.length" class="ranking-empty">
                  暂无调用数据
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Solutions -->
        <div class="card help-docs">
          <div class="card-header">
            <span class="card-title">解决方案</span>
            <a class="card-link" href="/articles?type=4" target="_blank">
              查看更多
              <el-icon><ArrowRight /></el-icon>
            </a>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <!-- User Profile Mini Card -->
        <div class="card user-mini-card">
          <div class="user-header">
            <div class="user-avatar" :class="{ admin: isAdmin }">
              <span>{{ String(userInfo.username ?? '').charAt(0)?.toUpperCase() || 'U' }}</span>
            </div>
            <div class="user-meta">
              <div class="user-name">
                {{ userInfo.username || '用户' }}
                <el-tag v-if="isAdmin" size="small" type="danger" effect="dark">管理员</el-tag>
                <el-icon v-else class="external-link"><Link /></el-icon>
              </div>
              <div class="user-id">
                账号 ID
                <span class="id-value">{{ userInfo.id || '-' }}</span>
              </div>
            </div>
          </div>
          <div class="user-verifications">
            <div class="verification-item">
              <span class="item-label">邮箱绑定</span>
              <span :class="['status', userInfo.mail_verified ? 'verified' : 'unverified']">
                <el-icon v-if="userInfo.mail_verified"><CircleCheck /></el-icon>
                {{ userInfo.mail_verified ? '已绑定' : '未绑定' }}
              </span>
              <span v-if="userInfo.mail" class="item-value">{{ userInfo.mail }}</span>
              <span class="action-link" @click="navigateTo('/admin/profile')">{{ userInfo.mail_verified ? '修改' : '绑定' }}</span>
            </div>
            <div class="verification-item">
              <span class="item-label">手机绑定</span>
              <span :class="['status', userInfo.phone_verified ? 'verified' : 'unverified']">
                <el-icon v-if="userInfo.phone_verified"><CircleCheck /></el-icon>
                {{ userInfo.phone_verified ? '已绑定' : '未绑定' }}
              </span>
              <span v-if="userInfo.phone" class="item-value">{{ userInfo.phone }}</span>
              <span class="action-link" @click="navigateTo('/admin/phone')">{{ userInfo.phone_verified ? '修改' : '绑定' }}</span>
            </div>
          </div>
        </div>

        <!-- Admin Quick Actions (管理员专属) -->
        <div v-if="isAdmin" class="card admin-actions-card">
          <div class="card-header">
            <span class="card-title">管理操作</span>
          </div>
          <div class="admin-action-list">
            <div v-if="hasRoute('/admin/webset')" class="admin-action-item" @click="navigateTo('/admin/webset')">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </div>
            <div v-if="hasRoute('/admin/userlist')" class="admin-action-item" @click="navigateTo('/admin/userlist')">
              <el-icon><Avatar /></el-icon>
              <span>用户管理</span>
            </div>
            <div v-if="hasRoute('/admin/apilist')" class="admin-action-item" @click="navigateTo('/admin/apilist')">
              <el-icon><List /></el-icon>
              <span>接口管理</span>
            </div>
            <div v-if="hasRoute('/admin/package')" class="admin-action-item" @click="navigateTo('/admin/package')">
              <el-icon><Box /></el-icon>
              <span>套餐管理</span>
            </div>
            <div v-if="hasRoute('/admin/statistics')" class="admin-action-item" @click="navigateTo('/admin/statistics')">
              <el-icon><DataLine /></el-icon>
              <span>统计分析</span>
            </div>
            <div v-if="hasRoute('/admin/merchant')" class="admin-action-item" @click="navigateTo('/admin/merchant')">
              <el-icon><Shop /></el-icon>
              <span>商户审核</span>
            </div>
          </div>
        </div>

        <!-- Billing Info -->
        <div class="card billing-card">
          <div class="card-header">
            <span class="card-title">费用信息</span>
            <div class="billing-links">
              <span @click="navigateTo('/admin/rechargerecord')">充值记录</span>
              <span @click="navigateTo('/admin/buypackagerecord')">购买记录</span>
            </div>
          </div>
          <div class="balance-section">
            <div class="balance-label">账户余额 (元)</div>
            <div class="balance-row">
              <span class="balance-amount">{{ formatCNY(balance) }}</span>
              <el-button type="primary" size="small" @click="navigateTo('/admin/pay')">
                充值
              </el-button>
            </div>
          </div>
          <div class="billing-stats">
            <div class="billing-stat">
              <span class="stat-label">本月充值</span>
              <span class="stat-value">¥{{ formatCNY(currentMonthTopUp) }}</span>
            </div>
            <div class="billing-stat">
              <span class="stat-label">累计充值</span>
              <span class="stat-value">¥{{ formatCNY(totalTopUp) }}</span>
            </div>
          </div>
        </div>

        <!-- Expiring Resources -->
        <div class="card expiring-card">
          <div class="expiring-header">
            <span class="expiring-label">30天内到期套餐</span>
            <span :class="['expiring-count', { warning: packageStats.expiringSoon > 0 }]">
              ({{ packageStats.expiringSoon }})
            </span>
          </div>
          <span class="expiring-link" @click="navigateTo('/admin/mypackage')">立即续费</span>
        </div>

        <!-- API Key Info -->
        <div class="card apikey-card">
          <div class="card-header">
            <span class="card-title">API密钥</span>
            <div class="apikey-links">
              <span @click="navigateTo('/admin/key')">密钥管理</span>
              <span @click="navigateTo('/admin/keylog')">历史记录</span>
            </div>
          </div>
          <div class="apikey-info">
            <div class="apikey-label">当前密钥</div>
            <div class="apikey-value">
              <code>{{ userAccessKey ? userAccessKey.slice(0, 8) + '****' + userAccessKey.slice(-4) : '-' }}</code>
            </div>
          </div>
          <div class="apikey-stats">
            <div class="apikey-stat">
              <span class="stat-label">24小时调用</span>
              <span class="stat-value">{{ total24h.toLocaleString() }} <small>次</small></span>
            </div>
          </div>
        </div>

        <!-- Quick Actions (普通用户) -->
        <div v-if="!isAdmin" class="card quick-actions-card">
          <div class="card-header">
            <span class="card-title">快捷操作</span>
          </div>
          <div class="quick-action-list">
            <div class="quick-action-item" @click="navigateTo('/admin/buy')">
              <el-icon><Ticket /></el-icon>
              <span>购买套餐</span>
            </div>
            <div class="quick-action-item" @click="navigateTo('/admin/pay')">
              <el-icon><Wallet /></el-icon>
              <span>账户充值</span>
            </div>
            <div class="quick-action-item" @click="navigateTo('/admin/useRechargeCard')">
              <el-icon><Box /></el-icon>
              <span>使用充值卡</span>
            </div>
            <div class="quick-action-item" @click="navigateTo('/admin/password')">
              <el-icon><Key /></el-icon>
              <span>修改密码</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.dashboard-layout {
  display: flex;
  gap: 20px;
  width: 100%;
}

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// Card Base
.card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 16px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .card-link {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #409eff;
    cursor: pointer;
    text-decoration: none;

    &:hover {
      color: #66b1ff;
      text-decoration: none;
    }

    .el-icon {
      font-size: 12px;
    }
  }

  .admin-badge {
    padding: 2px 8px;
    background: linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%);
    color: #fff;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
  }
}

// Recent Access
.recent-access {
  .quick-links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .quick-link {
    padding: 6px 16px;
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #ecf5ff;
      border-color: #b3d8ff;
      color: #409eff;
    }
  }
}

// Admin Resources
.admin-resources {
  border: 1px solid #fde2e2;
  background: linear-gradient(135deg, #fff 0%, #fef0f0 100%);

  .resource-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .resource-item.admin-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #fde2e2;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #f56c6c;
      box-shadow: 0 2px 8px rgba(245, 108, 108, 0.15);
    }

    .resource-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;

      .el-icon {
        font-size: 20px;
      }
    }

    .resource-title {
      font-size: 13px;
      color: #909399;
      margin-bottom: 6px;
    }

    .resource-count {
      font-size: 22px;
      font-weight: 600;
      color: #303133;

      small {
        font-size: 13px;
        font-weight: 400;
        color: #909399;
        margin-left: 4px;
      }
    }
  }
}

// My Resources
.my-resources {
  .resource-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .resource-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f5f7fa;
      border-color: #e4e7ed;
    }

    .resource-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;

      .el-icon {
        font-size: 20px;
      }
    }

    .resource-title {
      font-size: 13px;
      color: #909399;
      margin-bottom: 6px;
    }

    .resource-count {
      font-size: 22px;
      font-weight: 600;
      color: #303133;

      small {
        font-size: 13px;
        font-weight: 400;
        color: #909399;
        margin-left: 4px;
      }
    }
  }
}

// Data Overview
.data-overview {
  .chart-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .chart-tab {
    padding: 6px 14px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }

    &.active {
      background: #409eff;
      border-color: #409eff;
      color: #fff;
    }
  }

  .chart-container {
    width: 100%;
    height: 280px;
  }

  .today-ranking-panel {
    min-height: 280px;
  }

  .ranking-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .ranking-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    .ranking-total {
      font-size: 13px;
      color: #909399;
    }
  }

  .ranking-table {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;
  }

  .ranking-table-header {
    display: flex;
    background: #f5f7fa;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #606266;
    border-bottom: 1px solid #ebeef5;
  }

  .ranking-table-body {
    max-height: 320px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background: #f5f7fa;
    }
  }

  .ranking-table-row {
    display: flex;
    padding: 10px 16px;
    font-size: 13px;
    color: #303133;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #f5f7fa;
    }
  }

  .col-rank {
    width: 60px;
    flex-shrink: 0;
    display: flex;
    align-items: center;

    .rank-badge {
      width: 22px;
      height: 22px;
      border-radius: 4px;
      background: #e4e7ed;
      color: #909399;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &.top .rank-badge {
      background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
      color: #fff;
    }
  }

  .col-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 12px;
  }

  .col-alias {
    width: 140px;
    flex-shrink: 0;
    color: #909399;
    font-family: 'SF Mono', SFMono-Regular, ui-monospace, monospace;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .col-count {
    width: 100px;
    flex-shrink: 0;
    text-align: right;
    font-weight: 600;
    color: #409eff;
  }

  .ranking-empty {
    text-align: center;
    padding: 60px 0;
    color: #c0c4cc;
    font-size: 13px;
  }
}

// Help Docs
.help-docs {
  .card-header {
    margin-bottom: 0;
  }
}

// User Mini Card
.user-mini-card {
  .user-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
  }

  .user-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.admin {
      background: linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%);
    }

    span {
      font-size: 24px;
      font-weight: 600;
      color: #fff;
    }
  }

  .user-meta {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;

    .external-link {
      font-size: 14px;
      color: #909399;
    }
  }

  .user-id {
    font-size: 13px;
    color: #909399;

    .id-value {
      margin-left: 8px;
      color: #606266;
      font-weight: 500;
    }
  }

  .user-verifications {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .verification-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #606266;
    padding: 10px 12px;
    background: #fafafa;
    border-radius: 6px;
    border: 1px solid #f0f0f0;

    .item-label {
      color: #909399;
      font-size: 12px;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;

      &.verified {
        background: #f0f9eb;
        color: #67c23a;
      }

      &.unverified {
        background: #fdf6ec;
        color: #e6a23c;
      }

      .el-icon {
        font-size: 12px;
      }
    }

    .item-value {
      flex: 1;
      min-width: 0;
      font-size: 13px;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .action-link {
      color: #409eff;
      cursor: pointer;
      font-size: 12px;
      flex-shrink: 0;

      &:hover {
        color: #66b1ff;
      }
    }
  }
}

// Admin Actions Card
.admin-actions-card {
  border: 1px solid #fde2e2;
  background: linear-gradient(135deg, #fff 0%, #fef0f0 100%);

  .admin-action-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .admin-action-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #fff;
    border: 1px solid #fde2e2;
    border-radius: 6px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    &:hover {
      background: #fef0f0;
      border-color: #f56c6c;
      color: #f56c6c;

      .el-icon {
        color: #f56c6c;
      }
    }

    .el-icon {
      font-size: 16px;
      color: #909399;
    }

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
    }
  }
}

// Billing Card
.billing-card {
  .billing-links {
    display: flex;
    gap: 12px;

    span {
      font-size: 12px;
      color: #909399;
      cursor: pointer;

      &:hover {
        color: #409eff;
      }
    }
  }

  .balance-section {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
  }

  .balance-label {
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;
  }

  .balance-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .balance-amount {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
  }

  .billing-stats {
    display: flex;
    gap: 16px;
  }

  .billing-stat {
    flex: 1;
    padding: 12px;
    background: #fafafa;
    border-radius: 6px;
    border: 1px solid #f0f0f0;

    .stat-label {
      display: block;
      font-size: 12px;
      color: #909399;
      margin-bottom: 6px;
    }

    .stat-value {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }
}

// Expiring Card
.expiring-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;

  .expiring-header {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .expiring-label {
    font-size: 13px;
    color: #606266;
  }

  .expiring-count {
    color: #909399;
    font-weight: 500;

    &.warning {
      color: #f56c6c;
    }
  }

  .expiring-link {
    font-size: 13px;
    color: #409eff;
    cursor: pointer;

    &:hover {
      color: #66b1ff;
    }
  }
}

// API Key Card
.apikey-card {
  .apikey-links {
    display: flex;
    gap: 12px;

    span {
      font-size: 12px;
      color: #909399;
      cursor: pointer;

      &:hover {
        color: #409eff;
      }
    }
  }

  .apikey-info {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
  }

  .apikey-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 6px;
  }

  .apikey-value {
    code {
      font-family: 'SF Mono', SFMono-Regular, ui-monospace, monospace;
      font-size: 13px;
      color: #303133;
      background: #f5f7fa;
      padding: 4px 8px;
      border-radius: 4px;
    }
  }

  .apikey-stats {
    .apikey-stat {
      .stat-label {
        display: block;
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: #303133;

        small {
          font-size: 12px;
          font-weight: 400;
          color: #909399;
        }
      }
    }
  }
}

// Quick Actions Card
.quick-actions-card {
  .quick-action-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .quick-action-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #ecf5ff;
      border-color: #b3d8ff;
      color: #409eff;

      .el-icon {
        color: #409eff;
      }
    }

    .el-icon {
      font-size: 16px;
      color: #909399;
    }
  }
}

// Responsive
@media screen and (max-width: 1200px) {
  .dashboard-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;

    .card {
      flex: 1;
      min-width: 280px;
    }
  }

  .my-resources .resource-grid,
  .admin-resources .resource-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .dashboard-page {
    padding: 12px;
  }

  .sidebar {
    flex-direction: column;

    .card {
      min-width: 100%;
    }
  }

  .my-resources .resource-grid,
  .admin-resources .resource-grid {
    grid-template-columns: 1fr;
  }

  .billing-card .billing-stats {
    flex-direction: column;
  }

  .quick-actions-card .quick-action-list,
  .admin-actions-card .admin-action-list {
    grid-template-columns: 1fr;
  }

  .data-overview {
    .chart-container {
      height: 200px;
    }

    .col-alias {
      display: none;
    }

    .col-count {
      width: 80px;
    }
  }
}
</style>
