<script setup>
import * as echarts from 'echarts'
import {
  Menu,
  Wallet,
  Refresh,
  CreditCard,
  Document,
  Tickets,
  Plus,
  Key,
  CopyDocument,
} from '@element-plus/icons-vue'

const { $myFetch, $msg } = useNuxtApp()
const username = useCookie('username')

const chartShow = ref(true)
const todayRequest = ref({
  data: [],
})
const todayRanking = ref([])

const systemInfo = ref({
  day: 0,
  total_api: 0,
  recent_request: [],
  total_request_number: 0,
  cpu: '0%',
  memory_used: '0MB',
  memory_available: '0MB',
  total_network_transmission: '0GB',
})

// 账户余额相关
const balance = ref(0)
const currentMonthTopUp = ref(0)
const totalTopUp = ref(0)

const formatCNY = (n) => {
  const num = Number(n || 0)
  return (
    '¥ ' +
    num.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

const getBalance = async (showTip = false) => {
  try {
    const res = await $myFetch('UserBalance', {
      params: {
        username: username.value,
      },
    })
    if (res.code === 200) {
      const data = res.data || {}
      balance.value = Number(data.AccountBalance || 0)
      currentMonthTopUp.value = Number(data.CurrentMonthTopUp || 0)
      totalTopUp.value = Number(data.TotalTopUp || 0)
      if (showTip) $msg('余额刷新成功', 'success')
    } else {
      $msg(res.msg || '获取余额失败', 'error')
    }
  } catch (error) {
    $msg('获取余额失败', 'error')
  }
}

const sysRes = await $myFetch('SystemInfo')
systemInfo.value = sysRes.data

// 控制左侧边栏显示隐藏
// 获取页面宽度
const screenWidth = ref(0)
const isSidebarShow = ref(true)
const iscontrolShow = ref(false)
const isoverlay = ref(false)
onMounted(() => {
  screenWidth.value = document.body.clientWidth
  document.body.style.overflow = ''

  if (screenWidth.value < 768) {
    iscontrolShow.value = true
    isSidebarShow.value = false
  }
})

const handleSidebarShow = () => {
  isSidebarShow.value = !isSidebarShow.value
  iscontrolShow.value = !iscontrolShow.value
  isoverlay.value = !isoverlay.value
  if (isSidebarShow.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

onMounted(async () => {
  chartShow.value = false
  chartShow.value = true

  const recentRequestDom = document.getElementById('recentRequestChart')
  const recentRequestChart = echarts.init(recentRequestDom)
  let option

  const xAxisData = []
  const seriesData = []
  if (systemInfo.value.recent_request == null) {
    return
  }
  systemInfo.value.recent_request.forEach((element) => {
    try {
      const hour = new Date(element.time).getHours()
      xAxisData.push(`${hour}时`)
    } catch {
      xAxisData.push('未知')
    }
    seriesData.push(Number(element.number || 0))
  })

  const hasRecentData = xAxisData.length > 0 && seriesData.length > 0

  option = {
    title: {
      text: '调用量统计',
      top: '4%',
      left: '2%',
      textStyle: { color: '#555', fontSize: 16 },
    },
    tooltip: { trigger: 'axis' },
    grid: { left: '2%', right: '2%', containLabel: true },
    toolbox: { feature: { saveAsImage: {} } },
    xAxis: { type: 'category', data: xAxisData },
    yAxis: { type: 'value' },
    dataZoom: [{}],
    series: [
      {
        data: seriesData,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        itemStyle: {
          color: '#fff',
          borderColor: '#4bc8db',
          areaStyle: { type: 'default', opacity: 0.4 },
        },
        lineStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#4C84FF' },
              { offset: 1, color: '#28d016' },
            ],
            globalCoord: false,
          },
        },
        areaStyle: { color: 'rgba(255,255,255,0)' },
      },
    ],
    graphic: hasRecentData
      ? []
      : [
          {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: { text: '暂无调用数据', fill: '#909399', fontSize: 16 },
          },
        ],
  }

  option && recentRequestChart.setOption(option)

  todayRequest.value.data = (systemInfo.value?.today_request || []).map(
    (element) => ({
      name: element.alias,
      value: Number(element.number || 0),
    })
  )

  const rankingColors = ['#4C84FF', '#28d016', '#4B5563', '#F59E0B', '#8B5CF6']
  const pieData = todayRequest.value.data.slice(0, 5)
  // 始终渲染5行；不足的用占位补齐
  todayRanking.value = Array.from({ length: 5 }, (_, idx) => {
    const item = pieData[idx]
    if (item) {
      return {
        name: item.name,
        value: Number(item.value || 0),
        color: rankingColors[idx % rankingColors.length],
      }
    }
    return {
      name: '—',
      value: 0,
      color: '#E5E7EB',
    }
  })

  const namesArr = []
  const valuesArr = []
  todayRequest.value.data.forEach((item, index) => {
    if (index >= 5) {
      namesArr.push(item.name)
      valuesArr.push(item.value)
    }
  })

  const APIRankingListDom = document.getElementById('APIRankingList')
  const APIRankingListChart = echarts.init(APIRankingListDom)
  const hasBarData = namesArr.length > 0 && valuesArr.length > 0

  option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0] : params
        const v = Number(p?.value || 0)
        const label = v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`
        return `${p?.name || ''}<br/>次数：${label}`
      },
    },
    grid: {
      left: '3%',
      right: '3%',
      top: '8%',
      bottom: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: namesArr,
      axisTick: { alignWithLabel: true },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
        rotate: 0,
        interval: 0,
        hideOverlap: true,
        overflow: 'truncate',
      },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: '#9ca3af',
          formatter: (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`),
        },
        splitLine: { show: true, lineStyle: { color: '#eee' } },
      },
    ],
    series: [
      {
        name: '次数',
        type: 'bar',
        data: valuesArr,
        barWidth: 28,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8B5CF6' },
            { offset: 1, color: '#6366F1' },
          ]),
        },
        label: {
          show: true,
          position: 'top',
          color: '#6b7280',
          fontSize: 12,
          formatter: (p) => {
            const v = Number(p?.value || 0)
            return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`
          },
        },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
        },
        animationDuration: 600,
        animationEasing: 'cubicOut',
      },
    ],
    graphic: hasBarData
      ? []
      : [
          {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: { text: '暂无排名数据', fill: '#909399', fontSize: 16 },
          },
        ],
  }

  option && APIRankingListChart.setOption(option)

  window.addEventListener('resize', function () {
    recentRequestChart.resize()
    APIRankingListChart.resize()
  })
})

onMounted(() => {
  getBalance(false)
  getUserKey(false)
})

useHead({
  title: '管理后台',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})

// 用户秘钥：展示并支持复制
const userAccessKey = ref('')
const getUserKey = async (showTip = false) => {
  try {
    const res = await $myFetch('GetUserKey', {
      params: {
        username: username.value,
      },
    })
    if (res.code === 200) {
      userAccessKey.value = res?.data?.access_key || ''
      if (showTip) $msg('秘钥刷新成功', 'success')
    } else {
      $msg(res.msg || '获取秘钥失败', 'error')
    }
  } catch (error) {
    $msg('获取秘钥失败', 'error')
  }
}

const copyKey = async () => {
  try {
    if (!userAccessKey.value) {
      await getUserKey(false)
    }
    if (!userAccessKey.value) {
      $msg('暂无可复制的秘钥', 'warning')
      return
    }
    await navigator.clipboard.writeText(userAccessKey.value)
    $msg('秘钥已复制', 'success')
  } catch (error) {
    $msg('复制失败', 'error')
  }
}
</script>

<template>
  <div class="container">
    <AdminSidebar v-show="isSidebarShow"></AdminSidebar>

    <div class="right">
      <div class="overlay" v-show="isoverlay" @click="handleSidebarShow"></div>
      <div class="control-sidebar" v-show="iscontrolShow">
        <el-icon @click="handleSidebarShow">
          <Menu />
        </el-icon>
      </div>
      <AdminHeader></AdminHeader>
      <div class="main-container">
        <div class="info-container">
          <SystemInfo
            :system-info="systemInfo"
            style="padding-top: 20px"
          ></SystemInfo>

          <div class="balance-row">
            <el-card class="balance-card compact">
              <div class="balance-header">
                <div class="title-left">
                  <el-icon class="title-icon"><Wallet /></el-icon>
                  <span class="balance-title">账户余额</span>
                </div>
                <el-button type="primary" link @click="getBalance(true)">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>

              <div class="balance-subtitle">当前余额</div>
              <div class="balance-amount">{{ formatCNY(balance) }}</div>

              <div class="divider"></div>

              <div class="balance-stats">
                <div class="stat-item">
                  <div class="stat-label">本月充值</div>
                  <div class="stat-value">
                    {{ formatCNY(currentMonthTopUp) }}
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">累计充值</div>
                  <div class="stat-value">{{ formatCNY(totalTopUp) }}</div>
                </div>
              </div>

              <div class="action-row">
                <el-button
                  type="primary"
                  class="recharge-btn"
                  @click="navigateTo('/admin/pay')"
                  color="#2b4ea7"
                >
                  <el-icon><Plus /></el-icon>
                  充值
                </el-button>
              </div>
            </el-card>
            <div class="right-col">
              <el-card class="key-card compact">
                <div class="balance-header">
                  <div class="title-left">
                    <el-icon class="title-icon"><Key /></el-icon>
                    <span class="balance-title">用户秘钥</span>
                  </div>
                  <div class="quick-actions">
                    <el-button type="primary" link @click="copyKey">
                      <el-icon><CopyDocument /></el-icon>
                      复制秘钥
                    </el-button>
                  </div>
                </div>
                <div class="key-value">
                  <code>{{ userAccessKey || '暂无秘钥' }}</code>
                </div>
              </el-card>

              <div id="TodayRequestChart" v-if="chartShow">
                <div class="ranking-title">接口请求排名</div>
                <div v-if="todayRanking.length" class="ranking-list">
                  <div
                    class="ranking-item"
                    v-for="(item, idx) in todayRanking"
                    :key="idx"
                  >
                    <div class="ranking-left">
                      <span
                        class="ranking-dot"
                        :style="{ background: item.color }"
                      ></span>
                      <span class="ranking-name">{{ item.name }}</span>
                    </div>
                    <span class="ranking-percent">{{ item.value }} 次</span>
                  </div>
                </div>
                <div v-else class="ranking-empty">暂无今日请求数据</div>
              </div>
            </div>
          </div>

          <div class="chart">
            <div id="recentRequestChart" v-if="chartShow"></div>
          </div>
          <div id="APIRankingList"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;

  .right {
    width: 100%;
    position: relative;

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 998;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .control-sidebar {
      position: absolute;
      width: 35px;
      height: 35px;
      top: 10px;
      left: 10px;
      z-index: 9999;
      text-align: center;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

      .el-icon {
        margin-top: 10px;
        font-size: 16px;
      }
    }

    .main-container {
      min-height: 100vh;
      padding: 0 10px;
      background-color: #f7f7f7;
      .info-container {
        padding-bottom: 50px;
      }

      .createKey {
        float: right;
        margin-left: 10px;
      }
      .copykey {
        float: right;
      }

      svg {
        width: 30px;
        height: 30px;
      }

      .balance-row {
        display: flex;
        justify-content: space-between;
        align-items: stretch;
      }

      .right-col {
        width: 35%;
        display: flex;
        flex-direction: column;
      }

      .balance-card {
        width: 64%;
        margin-top: 10px;
        background: #fff;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      }
      .balance-card :deep(.el-card__body) {
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .key-card {
        width: 100%;
        margin-top: 10px;
        background: #fff;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      }
      .key-card :deep(.el-card__body) {
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .balance-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .title-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .title-icon {
        font-size: 18px;
        color: #3b82f6;
      }
      .balance-title {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
      }
      .balance-subtitle {
        font-size: 13px;
        color: #6b7280;
        margin-top: 6px;
      }

      .balance-amount {
        font-size: 36px;
        font-weight: 800;
        line-height: 1.1;
        margin: 4px 0 8px;
        color: #303133;
      }

      .divider {
        height: 1px;
        background: #f3f4f6;
        margin: 8px 0 12px;
      }

      .balance-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .stat-item {
        display: flex;
        flex-direction: column;
        background: #fafafa;
        border: 1px solid #ebeef5;
        border-radius: 8px;
        padding: 12px;
      }
      .stat-label {
        font-size: 12px;
        color: #6b7280;
      }
      .stat-value {
        font-size: 18px;
        font-weight: 700;
        color: #303133;
      }

      .action-row {
        margin-top: 10px;
      }
      .recharge-btn {
        width: 100%;
        height: 44px;
        font-weight: 600;
      }
      .recharge-btn :deep(.el-icon) {
        margin-right: 6px;
      }

      .key-value {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
        font-size: 15px;
        background: #fafafa;
        border: 1px solid #ebeef5;
        border-radius: 8px;
        padding: 12px;
        color: #303133;
        word-break: break-all;
      }

      .quick-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }

      .chart {
        display: flex;
        justify-content: space-between;
      }
      .chart #recentRequestChart {
        width: 100%;
        height: 370px;
        margin-top: 10px;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        background: #fff;
      }

      .balance-row #TodayRequestChart {
        width: 100%;
        height: 240px;
        margin-top: 10px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        border: 1px solid #e5e7eb;
        background: #fff;
        border-radius: 12px;
      }

      .ranking-title {
        padding: 16px 16px 8px;
        font-size: 16px;
        font-weight: 600;
        color: #111827;
      }
      .ranking-list {
        padding: 8px 16px 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        height: calc(100% - 45px);
      }
      .ranking-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 0;
      }
      .ranking-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .ranking-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
      }
      .ranking-name {
        color: #303133;
      }
      .ranking-percent {
        color: #303133;
        font-weight: 600;
      }
      .ranking-empty {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        font-size: 16px;
      }

      #APIRankingList {
        width: 100%;
        height: 370px;
        margin-top: 30px;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        background: #fff;
      }

      .el-card {
        cursor: pointer;
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container {
    .right {
      .main-container {
        .balance-row {
          flex-wrap: wrap;
        }
        .balance-card {
          width: 100%;
        }
        .balance-row #TodayRequestChart {
          width: 100%;
        }

        .right-col {
          width: 100%;
        }
        .key-card {
          width: 100%;
        }

        .chart {
          flex-wrap: wrap;
        }
        .chart #recentRequestChart {
          width: 100%;
        }
      }
    }
  }
}

@media screen and (max-width: 900px) {
  .container {
    .right {
      .createKey {
        float: none !important;
        margin-top: 5px;
      }
      .copykey {
        float: none !important;
        margin-top: 5px;
      }
      .balance-stats {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
