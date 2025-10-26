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
} from '@element-plus/icons-vue'
const { $myFetch, $msg } = useNuxtApp()

const chartShow = ref(true)

const todayRequest = ref({
  data: [],
})

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
const username = useCookie('username')
const balance = ref(0)
const monthSpend = ref(0)
const totalSpend = ref(0)

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
      params: { username: username.value },
    })
    if (res.code === 200) {
      balance.value = res.data
      if (showTip) $msg('余额刷新成功', 'success')
    }
  } catch (error) {}
}

const getMonthlySpend = async () => {
  try {
    const res = await $myFetch('GetBuyPackageRecords', {
      params: { page: 1, limit: 200 },
    })
    if (res.code === 200) {
      const list = res.data?.data || []
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()
      monthSpend.value = list.reduce((sum, item) => {
        const t = Number(item.create_time || 0)
        const amt = Number(item.amount || 0)
        return t >= start && t < end ? sum + amt : sum
      }, 0)
      totalSpend.value = list.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      )
    }
  } catch (error) {}
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

  const TodayRequestDom = document.getElementById('TodayRequestChart')
  const TodayRequestChart = echarts.init(TodayRequestDom)
  const pieData = todayRequest.value.data.slice(0, 5)

  option = {
    title: {
      top: '4%',
      text: '接口请求排名',
      left: 'center',
      textStyle: { color: '#555', fontSize: 16 },
    },
    tooltip: { trigger: 'item' },
    legend: { bottom: '8%', orient: 'horizontal', left: 'center' },
    series: [{ name: '接口名称', type: 'pie', radius: '50%', data: pieData }],
    graphic: pieData.length
      ? []
      : [
          {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: { text: '暂无今日请求数据', fill: '#909399', fontSize: 16 },
          },
        ],
  }

  option && TodayRequestChart.setOption(option)

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
    title: {
      text: '调用量统计',
      top: '4%',
      left: '2%',
      textStyle: { color: '#555', fontSize: 16 },
    },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    legend: {},
    xAxis: {
      type: 'category',
      data: namesArr,
      axisTick: { alignWithLabel: true },
    },
    yAxis: [{ type: 'value' }],
    series: [{ name: '次数', type: 'bar', barWidth: '60%', data: valuesArr }],
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
    TodayRequestChart.resize()
    APIRankingListChart.resize()
  })
})

onMounted(() => {
  getBalance(false)
  getMonthlySpend()
})

useHead({
  title: '管理后台',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
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
                  <div class="stat-label">本月消费</div>
                  <div class="stat-value">{{ formatCNY(monthSpend) }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">累计消费</div>
                  <div class="stat-value">{{ formatCNY(totalSpend) }}</div>
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
            <div id="TodayRequestChart" v-if="chartShow"></div>
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
        width: 35%;
        height: 370px;
        margin-top: 10px;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        background: #fff;
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
