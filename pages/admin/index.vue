<script setup>
import * as echarts from 'echarts'
import { Menu } from '@element-plus/icons-vue'
const { $myFetch } = useNuxtApp()

const { $logout } = useNuxtApp()
const chartShow = ref(true)
const recentRequest = useState('recentRequest')
const todayRequest = ref({
  data: [],
})

const routeInfo = useCookie('routeInfo')

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
  // 禁止页面滑动
  if (isSidebarShow.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

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

onMounted(async () => {
  // 如果用户没有权限，那么取消渲染图表
  if (!routeShow('/admin/EchartDom')) {
    return false
  }

  // 图表
  chartShow.value = false
  chartShow.value = true

  const recentRequestDom = document.getElementById('recentRequestChart')

  const recentRequestChart = echarts.init(recentRequestDom)
  let option

  option = {
    title: {
      text: '调用量统计',
      top: '4%',
      left: '2%',
      textStyle: {
        color: '#555',
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '2%',
      right: '2%',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: 'category',
      data: recentRequest.value.data.xAxis,
    },
    yAxis: {
      type: 'value',
    },
    dataZoom: [{}],
    series: [
      {
        data: recentRequest.value.data.series,
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
  }

  option && recentRequestChart.setOption(option)

  const res = await $myFetch('TodayRequest')

  if (res.data !== undefined && res.data !== null && res.data !== '') {
    res.data.forEach((element) => {
      todayRequest.value.data.push({
        name: element.alias,
        value: element.number,
      })
    })
  }

  const TodayRequestDom = document.getElementById('TodayRequestChart')
  const TodayRequestChart = echarts.init(TodayRequestDom)

  option = {
    title: {
      top: '4%',
      text: '接口请求排名',
      left: 'center',
      textStyle: {
        color: '#555',
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      bottom: '8%',
      orient: 'horizontal',
      left: 'center',
    },
    series: [
      {
        name: '接口名称',
        type: 'pie',
        radius: '50%',
        data: todayRequest.value.data.slice(0, 5),
      },
    ],
  }

  option && TodayRequestChart.setOption(option)

  // 接口名称
  const namesArr = []
  // 请求次数
  const valuesArr = []

  todayRequest.value.data.forEach((item, index) => {
    if (index >= 5) {
      // 前五条数据不做处理
      namesArr.push(item.name)
      valuesArr.push(item.value)
    }
  })

  const APIRankingListDom = document.getElementById('APIRankingList')
  const APIRankingListChart = echarts.init(APIRankingListDom)

  option = {
    title: {
      text: '调用量统计',
      top: '4%',
      left: '2%',
      textStyle: {
        color: '#555',
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    legend: {},
    xAxis: {
      type: 'category',
      data: namesArr,
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: [
      {
        name: '次数',
        type: 'bar',
        barWidth: '60%',
        data: valuesArr,
      },
    ],
  }

  option && APIRankingListChart.setOption(option)

  // 监听宽度变化
  window.addEventListener('resize', function () {
    recentRequestChart.resize()
    TodayRequestChart.resize()
    APIRankingListChart.resize()
  })
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
      <!-- 遮罩层 -->
      <div class="overlay" v-show="isoverlay" @click="handleSidebarShow"></div>
      <!-- 侧边栏控制按钮 -->
      <div class="control-sidebar" v-show="iscontrolShow">
        <el-icon @click="handleSidebarShow">
          <Menu />
        </el-icon>
      </div>
      <AdminHeader></AdminHeader>
      <div class="main-container">
        <div class="info-container">
          <SystemInfo style="padding-top: 20px"></SystemInfo>

          <div class="chart" v-if="routeShow('/admin/EchartDom')">
            <div id="recentRequestChart" v-if="chartShow"></div>
            <div id="TodayRequestChart" v-if="chartShow"></div>
          </div>
          <div v-if="routeShow('/admin/EchartDom')" id="APIRankingList"></div>
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

      .chart {
        display: flex;
        justify-content: space-between;

        #recentRequestChart {
          width: 64%;
          height: 370px;
          margin-top: 10px;
          box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
          background: #fff;
        }

        #TodayRequestChart {
          width: 35%;
          height: 370px;
          margin-top: 10px;
          box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
          background: #fff;
        }
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
        .chart {
          flex-wrap: wrap;

          #recentRequestChart {
            width: 100%;
          }

          #TodayRequestChart {
            width: 100%;
          }
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
    }
  }
}
</style>
