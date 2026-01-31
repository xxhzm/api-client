<script setup>
import * as echarts from 'echarts'
import {
  TrendCharts,
  Wallet,
  Ticket,
  Box,
  Key,
} from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const todayRequest = ref({ data: [] })
const systemInfo = ref({
  total_api: 0,
  recent_request: [],
})

// Computed: Total API calls
const totalApiCalls = computed(() => {
  return todayRequest.value.data.reduce((sum, item) => sum + item.value, 0)
})

// Helper method
const getPercent = (value) => {
  if (!totalApiCalls.value) return 0
  return ((value / totalApiCalls.value) * 100).toFixed(1)
}

// Quick actions
const quickActions = [
  {
    title: '账户充值',
    desc: '充值账户余额',
    icon: Wallet,
    color: '#3b82f6',
    bgColor: '#eff6ff',
    path: '/admin/pay',
  },
  {
    title: '购买套餐',
    desc: '选购API套餐',
    icon: Ticket,
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    path: '/admin/buy',
  },
  {
    title: '我的套餐',
    desc: '查看已购套餐',
    icon: Box,
    color: '#10b981',
    bgColor: '#ecfdf5',
    path: '/admin/mypackage',
  },
  {
    title: '秘钥管理',
    desc: '管理API秘钥',
    icon: Key,
    color: '#f59e0b',
    bgColor: '#fffbeb',
    path: '/admin/key',
  },
]

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
          xAxisData.push(`${hour}:00`)
        } catch {
          xAxisData.push('未知')
        }
        seriesData.push(Number(element.number || 0))
      })
    }

    const hasRecentData = xAxisData.length > 0 && seriesData.length > 0
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' },
        axisPointer: {
          type: 'cross',
          crossStyle: { color: '#999' },
        },
        formatter: (params) => {
          const p = Array.isArray(params) ? params[0] : params
          return `<div style="font-weight:600;margin-bottom:4px">${p?.name || ''}</div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="display:inline-block;width:10px;height:10px;background:linear-gradient(135deg, #3b82f6, #8b5cf6);border-radius:50%"></span>
                    <span>调用次数: <b>${p?.value || 0}</b></span>
                  </div>`
        },
      },
      grid: { left: '3%', right: '4%', top: '12%', bottom: '15%', containLabel: true },
      toolbox: {
        feature: {
          saveAsImage: {
            iconStyle: { borderColor: '#9ca3af' },
          },
        },
        right: 20,
        top: 10,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false },
        axisLabel: { color: '#6b7280', fontSize: 12 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#9ca3af',
          formatter: (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`),
        },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          show: true,
          height: 20,
          bottom: 0,
          borderColor: 'transparent',
          backgroundColor: '#f9fafb',
          fillerColor: 'rgba(59, 130, 246, 0.1)',
          handleStyle: { color: '#3b82f6', borderColor: '#3b82f6' },
          textStyle: { color: '#9ca3af' },
        },
      ],
      series: [
        {
          data: seriesData,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          showSymbol: false,
          itemStyle: {
            color: '#3b82f6',
            borderColor: '#fff',
            borderWidth: 2,
          },
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#8b5cf6' },
            ]),
            shadowColor: 'rgba(59, 130, 246, 0.3)',
            shadowBlur: 10,
            shadowOffsetY: 8,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.25)' },
              { offset: 0.5, color: 'rgba(139, 92, 246, 0.1)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.02)' },
            ]),
          },
          emphasis: {
            showSymbol: true,
            itemStyle: {
              color: '#3b82f6',
              borderColor: '#fff',
              borderWidth: 3,
              shadowColor: 'rgba(59, 130, 246, 0.4)',
              shadowBlur: 10,
            },
          },
        },
      ],
      graphic: hasRecentData
        ? []
        : [
            {
              type: 'text',
              left: 'center',
              top: 'middle',
              style: {
                text: '暂无调用数据',
                fill: '#9ca3af',
                fontSize: 14,
                fontWeight: 500,
              },
            },
          ],
    }

    recentRequestChart.setOption(option)

    // Resize listener
    window.addEventListener('resize', () => recentRequestChart.resize())
  }

  // API Ranking List Data
  todayRequest.value.data = (systemInfo.value?.today_request || [])
    .map((element) => ({
      name: element.name,
      value: Number(element.number || 0),
    }))
    .sort((a, b) => b.value - a.value) // Sort by value descending
}

useHead({
  title: '管理后台',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
})
</script>

<template>
  <div class="dashboard-page">
    <!-- Main Content -->
    <div class="dashboard-content">
      <!-- User Profile Card -->
      <AdminUserProfileCard @loaded="handleProfileLoaded" />

      <!-- Quick Actions -->
      <div class="quick-actions">
        <div
          v-for="action in quickActions"
          :key="action.title"
          class="action-card"
          @click="navigateTo(action.path)"
        >
          <div class="action-icon" :style="{ backgroundColor: action.bgColor }">
            <el-icon :style="{ color: action.color }">
              <component :is="action.icon" />
            </el-icon>
          </div>
          <div class="action-info">
            <div class="action-title">{{ action.title }}</div>
            <div class="action-desc">{{ action.desc }}</div>
          </div>
          <div class="action-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Request Trend Chart -->
        <div class="chart-card chart-card-primary">
          <div class="chart-header">
            <div class="chart-title">
              <div class="title-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="title-text">
                <h3>24小时调用趋势</h3>
                <p>实时监控 API 调用量变化</p>
              </div>
            </div>
            <div class="chart-badge">
              <span class="badge-dot"></span>
              <span>实时</span>
            </div>
          </div>
          <div id="recentRequestChart" class="chart-container"></div>
        </div>

        <!-- API Ranking Card -->
        <div class="ranking-card">
          <div class="ranking-header">
            <h3 class="ranking-title">接口调用排行</h3>
            <span class="ranking-total">共 {{ totalApiCalls.toLocaleString() }} 次</span>
          </div>
          <div class="ranking-table">
            <div class="table-header">
              <span class="col-rank">排名</span>
              <span class="col-name">接口名称</span>
              <span class="col-count">调用次数</span>
              <span class="col-percent">占比</span>
            </div>
            <div class="table-body">
              <div
                v-for="(item, index) in todayRequest.data"
                :key="item.name"
                class="table-row"
              >
                <span class="col-rank">{{ index + 1 }}</span>
                <span class="col-name">{{ item.name }}</span>
                <span class="col-count">{{ item.value.toLocaleString() }}</span>
                <span class="col-percent">{{ getPercent(item.value) }}%</span>
              </div>
              <div v-if="!todayRequest.data.length" class="table-empty">
                暂无数据
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="dashboard-footer">
      <p>API 管理平台 · 安全 · 稳定 · 高效</p>
    </div>
  </div>
</template>

<style lang="less" scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 24px 24px 40px;
}

// Quick Actions
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  .action-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #fff;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
      border-color: transparent;

      .action-arrow {
        transform: translateX(4px);
        color: #3b82f6;
      }
    }

    .action-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s ease;

      .el-icon {
        font-size: 24px;
      }
    }

    &:hover .action-icon {
      transform: scale(1.05);
    }

    .action-info {
      flex: 1;
      min-width: 0;

      .action-title {
        font-size: 15px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 4px;
      }

      .action-desc {
        font-size: 13px;
        color: #64748b;
      }
    }

    .action-arrow {
      color: #cbd5e1;
      transition: all 0.3s ease;
    }
  }
}

// Dashboard Content
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// Charts Section
.charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.chart-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.08);
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .chart-title {
      display: flex;
      align-items: flex-start;
      gap: 16px;

      .title-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .el-icon {
          font-size: 22px;
          color: #3b82f6;
        }

        &.purple {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          .el-icon {
            color: #8b5cf6;
          }
        }
      }

      .title-text {
        h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }
      }
    }

    .chart-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #ecfdf5;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      color: #059669;

      .badge-dot {
        width: 6px;
        height: 6px;
        background: #10b981;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
    }
  }

  .chart-container {
    width: 100%;
    height: 380px;
  }
}

// Ranking Card
.ranking-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eaecf0;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  .ranking-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .ranking-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .ranking-total {
      font-size: 13px;
      color: #64748b;
    }
  }

  .ranking-table {
    .table-header {
      display: flex;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
    }

    .table-body {
      .table-row {
        display: flex;
        padding: 14px 16px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 14px;
        color: #1e293b;
        transition: background 0.2s;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: #f8fafc;
        }
      }

      .table-empty {
        padding: 48px 16px;
        text-align: center;
        color: #94a3b8;
        font-size: 14px;
      }
    }

    .col-rank {
      width: 60px;
      flex-shrink: 0;
    }

    .col-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .col-count {
      width: 100px;
      text-align: right;
      flex-shrink: 0;
      font-weight: 500;
    }

    .col-percent {
      width: 70px;
      text-align: right;
      flex-shrink: 0;
      color: #64748b;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// Dashboard Footer
.dashboard-footer {
  text-align: center;
  padding: 32px 0 16px;

  p {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
    letter-spacing: 0.5px;
  }
}

// Responsive
@media screen and (max-width: 1200px) {
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .dashboard-page {
    padding: 0 16px 32px;
  }

  .page-header {
    padding: 20px 0 16px;

    .header-content {
      padding: 24px;
      border-radius: 16px;
    }

    .page-title {
      font-size: 22px;
    }

    .page-subtitle {
      font-size: 14px;
    }
  }

  .quick-actions {
    grid-template-columns: 1fr;
    gap: 12px;

    .action-card {
      padding: 16px;

      .action-icon {
        width: 44px;
        height: 44px;

        .el-icon {
          font-size: 20px;
        }
      }
    }
  }

  .chart-card {
    padding: 20px;
    border-radius: 16px;

    .chart-header {
      flex-direction: column;
      gap: 12px;
    }

    .chart-container {
      height: 300px;
    }
  }

  .ranking-card {
    padding: 16px;

    .ranking-table {
      .col-rank {
        width: 40px;
      }

      .col-count {
        width: 80px;
      }

      .col-percent {
        width: 60px;
      }

      .table-header,
      .table-body .table-row {
        padding: 10px 12px;
        font-size: 13px;
      }
    }
  }
}

@media screen and (max-width: 480px) {
  .chart-card .chart-header .chart-title {
    .title-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;

      .el-icon {
        font-size: 18px;
      }
    }

    .title-text h3 {
      font-size: 16px;
    }
  }
}
</style>
