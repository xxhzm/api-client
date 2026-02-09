<script setup>
import { DataLine } from '@element-plus/icons-vue'
import { ref, onMounted, nextTick } from 'vue'

// ECharts 按需动态导入，避免全量打包
let echarts = null

const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

// 统计数据
const statsData = ref([])
const loading = ref(false)
const timeRange = ref('24h')

// 当前显示的统计数据
const currentIpStats = ref([])
const currentRefererStats = ref([])
const currentUaStats = ref([])
const currentStatusStats = ref([])
const currentFirewallStats = ref([])
const userStats = ref([])

// 图表实例
let trendChart = null

// 获取统计数据
const getStats = async () => {
  loading.value = true
  try {
    const data = await $myFetch('GetTimeRangeStats')
    if (data.code === 200) {
      statsData.value = data.data
      // 更新图表
      updateCharts()
    } else {
      $msg(data.msg, 'error')
    }
  } catch (error) {
    $msg('获取数据失败', 'error')
  } finally {
    loading.value = false
  }
}

// 更新图表
const updateCharts = () => {
  const currentData = statsData.value.find(
    (item) => item.time_range === timeRange.value
  )
  if (!currentData) return

  // 更新表格数据
  currentIpStats.value = currentData.ip_stats
  currentRefererStats.value = currentData.referer_stats
  currentUaStats.value = currentData.ua_stats
  currentStatusStats.value = currentData.status_stats
  currentFirewallStats.value = currentData.firewall_stats
  userStats.value = currentData.user_stats

  // 访问趋势图 - 只使用1小时的数据
  const oneHourData = statsData.value[0]
  if (oneHourData?.minute_stats) {
    const times = oneHourData.minute_stats.map((item) => {
      const date = new Date(item.time)
      return `${date.getHours()}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`
    })
    const counts = oneHourData.minute_stats.map((item) => item.count)

    trendChart.setOption({
      title: { text: '最近1小时访问趋势' },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br />访问次数: {c}',
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: 0,
        containLabel: true,
      },
      xAxis: [
        {
          data: times,
          type: 'category',
          axisTick: {
            show: false,
          },
          boundaryGap: true,
        },
      ],
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: counts,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: {
            color: '#fff',
            borderColor: '#4bc8db',
            areaStyle: {
              type: 'default',
              opacity: 0.4,
            },
          },
          lineStyle: {
            // 线性渐变，前四个参数分别是 x0, y0, x2, y2, 范围从 0 - 1，相当于在图形包围盒中的百分比，如果 globalCoord 为 `true`，则该四个值是绝对的像素位置
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: '#4C84FF', // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: '#28d016', // 100% 处的颜色
                },
              ],
              globalCoord: false, // 缺省为 false
            },
          },
          areaStyle: {
            color: 'rgba(255,255,255,0)',
          },
        },
      ],
    })
  }
}

// 时间范围变化
const handleTimeRangeChange = () => {
  updateCharts()
}

onMounted(() => {
  // 使用 nextTick 确保 DOM 已经渲染
  nextTick(async () => {
    // 动态导入 ECharts 核心模块（按需加载，减小首屏体积）
    const echartsCore = await import('echarts/core')
    const { BarChart, LineChart } = await import('echarts/charts')
    const {
      TitleComponent,
      TooltipComponent,
      GridComponent,
      LegendComponent,
    } = await import('echarts/components')
    const { CanvasRenderer } = await import('echarts/renderers')

    echartsCore.use([
      BarChart,
      LineChart,
      TitleComponent,
      TooltipComponent,
      GridComponent,
      LegendComponent,
      CanvasRenderer,
    ])
    echarts = echartsCore

    // 初始化图表
    trendChart = echarts.init(document.getElementById('trendChart'))

    // 获取数据
    getStats()

    // 每1分钟获取一次数据
    setInterval(() => {
      getStats()
    }, 60000)

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      trendChart?.resize()
    })
  })
})

useHead({
  title: '统计分析',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="statistics-container" v-loading="loading">
    <div class="stats-card">
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon">
            <DataLine />
          </el-icon>
          <span class="title">统计分析</span>
        </div>
        <div class="header-right">
          <el-radio-group
            v-model="timeRange"
            @change="handleTimeRangeChange"
          >
            <el-radio-button label="1h">最近1小时</el-radio-button>
            <el-radio-button label="3h">最近3小时</el-radio-button>
            <el-radio-button label="12h">最近12小时</el-radio-button>
            <el-radio-button label="24h">最近24小时</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="stats-content">
        <div class="chart-container">
          <div class="stats-tables">
            <div class="table-container">
              <h3>IP访问统计</h3>
              <el-table :data="currentIpStats" stripe style="width: 100%">
                <el-table-column prop="ip" label="IP地址" />
                <el-table-column prop="address" label="地址" />
                <el-table-column prop="count" label="请求次数" sortable />
              </el-table>
            </div>
            <div class="table-container">
              <h3>用户统计</h3>
              <el-table :data="userStats" stripe style="width: 100%">
                <el-table-column prop="user_id" label="ID" />
                <el-table-column prop="username" label="用户名" />
                <el-table-column prop="count" label="请求次数" sortable />
              </el-table>
            </div>
            <div class="table-container">
              <h3>来源统计</h3>
              <el-table
                :data="currentRefererStats"
                stripe
                style="width: 100%"
              >
                <el-table-column prop="referer" label="来源">
                  <template #default="scope">
                    {{ scope.row.referer || '直接访问' }}
                  </template>
                </el-table-column>
                <el-table-column prop="count" label="访问次数" sortable />
              </el-table>
            </div>
            <div class="table-container">
              <h3>User Agent统计</h3>
              <el-table :data="currentUaStats" stripe style="width: 100%">
                <el-table-column
                  prop="ua"
                  label="User Agent"
                  show-overflow-tooltip
                />
                <el-table-column prop="count" label="访问次数" sortable />
              </el-table>
            </div>
            <div class="table-container">
              <h3>防火墙统计</h3>
              <el-table
                :data="currentFirewallStats"
                stripe
                style="width: 100%"
              >
                <el-table-column prop="ip" label="IP地址" />
                <el-table-column prop="address" label="地址" />
                <el-table-column prop="count" label="拦截次数" sortable />
              </el-table>
            </div>
            <div class="table-container">
              <h3>状态码统计</h3>
              <el-table
                :data="currentStatusStats"
                stripe
                style="width: 100%"
              >
                <el-table-column prop="status_code" label="状态码" />
                <el-table-column prop="count" label="访问次数" sortable />
              </el-table>
            </div>
          </div>
          <div id="trendChart" class="chart trend-chart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.statistics-container {
  position: relative;
  min-height: 100vh;
  padding: 24px;
  display: flex;
  justify-content: center;
  background: #f5f7fa;

  .stats-card {
    width: 100%;
    border-radius: 12px;
    margin: 0 auto;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: #fff;
      border: 1px solid #eaecf0;
      border-radius: 12px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
      margin-bottom: 16px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .icon {
          font-size: 20px;
          color: #4b5563;
        }

        .title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1f36;
        }
      }
    }

    .stats-content {
      .chart-container {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;

        .stats-tables {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;

          .table-container {
            background: #fff;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #eaecf0;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

            h3 {
              margin: 0 0 15px 0;
              font-size: 16px;
              color: #333;
              font-weight: 600;
            }

            :deep(.el-table) {
              border: none;

              .el-table__header-wrapper {
                th {
                  background: #f8fafc;
                  color: #1f2937;
                  font-weight: 600;
                }
              }
            }
          }
        }

        .trend-chart {
          width: 100%;
          height: 500px;
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #eaecf0;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
        }
      }
    }
  }
}

@media screen and (max-width: 900px) {
  .statistics-container {
    padding: 10px;

    .stats-card {
      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;

        .header-right {
          width: 100%;
          overflow-x: auto;
          padding-bottom: 5px; // For scrollbar if needed
        }
      }
    }
  }
}
</style>
