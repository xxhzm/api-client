<script setup>
import * as echarts from 'echarts'

definePageMeta({
  layout: 'admin',
})

const todayRequest = ref({ data: [] })
const systemInfo = ref({
  total_api: 0,
  recent_request: [],
})

// --- Methods ---

// Handle Profile Data Loaded from Child
const handleProfileLoaded = (data) => {
  systemInfo.value.recent_request = data.recent_request || []
  systemInfo.value.today_request = data.today_request || []
  initCharts()
}

// Chart Initialization
const initCharts = () => {
  if (!process.client) return

  // Recent Request Chart
  const recentRequestDom = document.getElementById('recentRequestChart')
  if (recentRequestDom) {
    const recentRequestChart = echarts.init(recentRequestDom)

    const xAxisData = []
    const seriesData = []
    if (systemInfo.value.recent_request) {
      systemInfo.value.recent_request.forEach((element) => {
        try {
          const hour = new Date(element.time).getHours()
          xAxisData.push(`${hour}时`)
        } catch {
          xAxisData.push('未知')
        }
        seriesData.push(Number(element.number || 0))
      })
    }

    const hasRecentData = xAxisData.length > 0 && seriesData.length > 0
    const option = {
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

    recentRequestChart.setOption(option)

    // Resize listener
    window.addEventListener('resize', () => recentRequestChart.resize())
  }

  // API Ranking List Chart
  todayRequest.value.data = (systemInfo.value?.today_request || []).map(
    (element) => ({
      name: element.name,
      value: Number(element.number || 0),
    }),
  )

  // API Bar Chart
  const namesArr = []
  const valuesArr = []
  todayRequest.value.data.forEach((item) => {
    namesArr.push(item.name)
    valuesArr.push(item.value)
  })

  const APIRankingListDom = document.getElementById('APIRankingList')
  if (APIRankingListDom) {
    const APIRankingListChart = echarts.init(APIRankingListDom)
    const hasBarData = namesArr.length > 0 && valuesArr.length > 0
    const barOption = {
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
            formatter: (v) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`,
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
    APIRankingListChart.setOption(barOption)
    window.addEventListener('resize', () => APIRankingListChart.resize())
  }
}

useHead({
  title: '管理后台',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
})
</script>

<template>
  <div class="main-container">
    <div class="dashboard-content">
      <!-- Top Section: User Profile & System Info -->
      <AdminUserProfileCard @loaded="handleProfileLoaded" />

      <!-- Bottom Section: Charts -->
      <div class="charts-section">
        <!-- Request Chart (Full Width) -->
        <div class="card chart-card-lg">
          <div id="recentRequestChart" class="chart-container"></div>
        </div>

        <!-- API Full Ranking (Full Width) -->
        <div class="card full-ranking-card">
          <div class="card-title">接口总调用趋势</div>
          <div id="APIRankingList" class="chart-container-bar"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Dialogs -->
</template>

<style lang="less" scoped>
.main-container {
  padding: 0 20px 40px;

  .dashboard-content {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .top-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .charts-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }
}

// Card Styles
.card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eaecf0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1f36;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  .el-icon {
    color: #3b82f6;
  }
}

// Stats & Charts

.chart-card-lg {
  min-height: 400px;
  padding: 10px;
  .chart-container {
    width: 100%;
    height: 380px;
  }
}

.full-ranking-card {
  min-height: 350px;
  .chart-container-bar {
    width: 100%;
    height: 300px;
  }
}

@media screen and (max-width: 900px) {
  .chart-card-lg {
    height: 300px;
    .chart-container {
      height: 280px;
    }
  }
}
</style>
