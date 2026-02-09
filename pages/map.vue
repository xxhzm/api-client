<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const { $myFetch } = useNuxtApp()

// 声明 ref 用于获取 DOM 元素
const chartRef = ref(null)
let chart = null
// 添加 updateTimer 声明
let updateTimer = null

// 添加数据响应式
const attackData = ref([])
const mapType = ref('china')

// 切换地图类型的函数
const toggleMapType = () => {
  mapType.value = mapType.value === 'china' ? 'world' : 'china'

  if (chart) {
    chart.setOption({
      geo: {
        map: mapType.value,
        center: mapType.value === 'china' ? [105.97, 29.71] : [0, -10],
        zoom: mapType.value === 'china' ? 1.5 : 1.8,
        label: {
          show: mapType.value === 'china',
        },
      },
    })
    updateChart()
  }
}

// 添加一个辅助函数来检查坐标是否有效
const isValidCoordinate = (coord) => {
  return (
    coord &&
    Array.isArray(coord) &&
    coord.length === 2 &&
    (coord[0] !== 0 || coord[1] !== 0)
  )
}

// 判断坐标是否在中国境内
const isInChina = (coord) => {
  if (!isValidCoordinate(coord)) return false
  const [lng, lat] = coord
  return lng >= 73 && lng <= 136 && lat >= 18 && lat <= 54
}

// 修改数据转换函数
const convertData = (data) => {
  const res = []
  for (let i = 0; i < data.length; i++) {
    const fromCoord = data[i][0].coordinate
    const toCoord = data[i][1].coordinate

    // 确保坐标是有效的数组
    if (
      Array.isArray(fromCoord) &&
      Array.isArray(toCoord) &&
      fromCoord.length === 2 &&
      toCoord.length === 2
    ) {
      res.push({
        fromName: data[i][0].name,
        toName: data[i][1].name,
        coords: [fromCoord, toCoord],
        value: data[i][1].value,
      })
    }
  }
  return res
}

// 图表配置
const getOption = (nameMap = {}) => ({
  backgroundColor: {
    type: 'radial',
    x: 0.5,
    y: 0.5,
    r: 0.8,
    colorStops: [
      {
        offset: 0,
        color: '#0a2b4e',
      },
      {
        offset: 1,
        color: '#081832',
      },
    ],
  },
  tooltip: {
    trigger: 'item',
    formatter: (params) => {
      if (params.seriesName === '起始点' || params.seriesName === '攻击点') {
        return params.name
      }
      if (params.componentType === 'geo') {
        return params.name
      }
      return null
    },
    backgroundColor: 'rgba(0, 43, 77, 0.9)',
    borderColor: 'rgba(0, 255, 255, 0.2)',
    borderWidth: 1,
    padding: [8, 12],
    textStyle: {
      color: '#fff',
      fontSize: 14,
    },
  },
  geo: {
    map: mapType.value,
    nameMap: nameMap,
    roam: false,
    center: mapType.value === 'china' ? [105.97, 29.71] : [0, 60],
    zoom: mapType.value === 'china' ? 1.5 : 1.2,
    layoutCenter: ['50%', '65%'],
    layoutSize: '85%',
    aspectScale: 0.85,
    label: {
      show: mapType.value === 'china',
      position: 'inside',
      color: 'rgba(220, 246, 255, 0.8)',
      fontSize: 10,
      formatter: (params) => {
        return params.name.replace(
          /(省|市|自治区|特别行政区|壮族|维吾尔|回族)$/,
          ''
        )
      },
    },
    itemStyle: {
      areaColor: {
        type: 'radial',
        x: 0.5,
        y: 0.5,
        r: 0.8,
        colorStops: [
          {
            offset: 0,
            color: 'rgba(10, 70, 99, 0.3)',
          },
          {
            offset: 1,
            color: 'rgba(10, 70, 99, 0.8)',
          },
        ],
      },
      borderColor: '#0692a4',
      borderWidth: 1,
      shadowColor: 'rgba(6, 146, 164, 0.4)',
      shadowBlur: 10,
    },
    emphasis: {
      label: {
        show: true,
        color: '#fff',
        fontSize: 12,
      },
      itemStyle: {
        areaColor: 'rgba(5, 121, 148, 0.8)',
      },
    },
  },
  series: [
    {
      name: '攻击路径',
      type: 'lines',
      coordinateSystem: 'geo',
      zlevel: 3,
      effect: {
        show: true,
        period: 3,
        trailLength: 0.1,
        color: '#fff',
        symbolSize: 3,
        symbol: 'circle',
      },
      lineStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: 'rgba(0, 255, 255, 0.1)' },
            { offset: 0.5, color: 'rgba(0, 255, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 255, 255, 0.1)' },
          ],
        },
        width: 1,
        opacity: 0.6,
        curveness: 0.3,
        type: 'solid',
      },
      animation: true,
      animationDuration: 2000,
      animationDelay: function (idx) {
        return idx * 200
      },
      progressiveThreshold: 500,
      progressive: 200,
      data: convertData(attackData.value),
    },
    {
      name: '攻击点',
      type: 'effectScatter',
      coordinateSystem: 'geo',
      zlevel: 4,
      rippleEffect: {
        brushType: 'stroke',
        scale: 6,
        period: 4,
      },
      symbol: 'circle',
      symbolSize: (val) => val[2] / 8,
      itemStyle: {
        color: '#0ff',
        shadowBlur: 20,
        shadowColor: '#0ff',
      },
      animation: true,
      data: [],
    },
    {
      name: '起始点',
      type: 'scatter',
      coordinateSystem: 'geo',
      zlevel: 4,
      symbolSize: 12,
      itemStyle: {
        color: '#ff0',
        shadowBlur: 20,
        shadowColor: 'rgba(255, 255, 0, 0.8)',
      },
      animation: true,
      data: [],
    },
  ],
})

// 添加状态控制
const isLoading = ref(false)
const hasError = ref(false)

// 添加当前时间的响应式引用
const currentTime = ref('')

// 添加一个计算请求源数量的响应式引用
const attackCount = ref(0)

// 更新时间的函数
const updateTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
}

// 修改获取数据函数
const fetchAttackData = async () => {
  if (isLoading.value) return

  try {
    isLoading.value = true
    hasError.value = false

    const response = await $myFetch('ApiLogsMap')

    // 处理暂无数据的情况
    if (response.data === '暂无数据') {
      attackCount.value = 0
      attackData.value = []
      updateChart()
      updateTime()
      return
    }

    // 处理正常数据
    if (response?.data && Array.isArray(response.data)) {
      // 只计算有效坐标的数据数量
      const validData = response.data.filter(
        (item) =>
          isValidCoordinate(item.sourceCoordinate) &&
          isValidCoordinate(item.targetCoordinate)
      )
      attackCount.value = validData.length

      // 转换数据格式
      attackData.value = response.data.map((item) => [
        {
          name: item.source,
          coordinate: item.sourceCoordinate,
        },
        {
          name: item.target,
          coordinate: item.targetCoordinate,
          value: item.value,
        },
      ])
      updateChart()
      updateTime()
    }
  } catch (error) {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

// 修改 updateChart 函数
const updateChart = () => {
  if (!chart) return

  // 过滤掉无效坐标的数据
  let validData = attackData.value.filter(
    (item) =>
      isValidCoordinate(item[0].coordinate) &&
      isValidCoordinate(item[1].coordinate)
  )

  // 如果是世界地图，只显示跨国数据（保留中国与境外的交互数据）
  if (mapType.value === 'world') {
    validData = validData.filter((item) => {
      const sourceIsChina = item[0].name.includes('中国')
      const targetIsChina = item[1].name.includes('中国')
      // 只保留起点和终点一个在境内一个在境外的数据
      return sourceIsChina !== targetIsChina
    })
  } else if (mapType.value === 'china') {
    validData = validData.filter((item) => {
      const sourceIsChina = item[0].name.includes('中国')
      const targetIsChina = item[1].name.includes('中国')
      // 只保留起点和终点都在境内的数据
      return sourceIsChina && targetIsChina
    })
  }

  const convertedData = convertData(validData)

  chart.setOption(
    {
      series: [
        {
          // 攻击路径
          data: convertedData,
        },
        {
          // 攻击点数据
          data: validData.map((dataItem) => ({
            name: dataItem[1].name,
            value: [...dataItem[1].coordinate, 100],
            fixed: true,
          })),
        },
        {
          // 起始点数据
          data: validData.map((dataItem) => ({
            name: dataItem[0].name,
            value: [...dataItem[0].coordinate, dataItem[1].value],
          })),
        },
      ],
    },
    false
  )
}

// 修改初始化图表部分
const initChart = async () => {
  try {
    // 动态导入 echarts
    const echarts = await import('echarts/core')
    const { MapChart, LinesChart, ScatterChart, EffectScatterChart } =
      await import('echarts/charts')
    const { TitleComponent, TooltipComponent, GeoComponent } = await import(
      'echarts/components'
    )
    const { CanvasRenderer } = await import('echarts/renderers')

    // 注册必需的组件
    echarts.use([
      TitleComponent,
      TooltipComponent,
      GeoComponent,
      MapChart,
      LinesChart,
      ScatterChart,
      EffectScatterChart,
      CanvasRenderer,
    ])

    // 从 public 目录通过 fetch 加载地图数据（不打包进 JS，减小 bundle 体积）
    const [chinaJSON, worldJSON, countryNameMap] = await Promise.all([
      $fetch('/data/map.json'),
      $fetch('/data/world.json'),
      $fetch('/data/countryNameMap.json'),
    ])

    // 注册地图数据
    echarts.registerMap('china', chinaJSON)
    echarts.registerMap('world', worldJSON)

    chart = echarts.init(chartRef.value)
    chart.setOption(getOption(countryNameMap))

    // 首次获取数据
    await fetchAttackData()

    // 设置定时更新
    updateTimer = setInterval(async () => {
      await fetchAttackData()
    }, 5000) // 每5秒更新一次数据

    // 添加窗口大小改变时的自适应处理
    window.addEventListener('resize', handleResize)
  } catch (error) {}
}

// 处理窗口大小改变
const handleResize = () => {
  chart?.resize()
}

// 组件挂载时初始化
onMounted(() => {
  initChart()
})

// 组件卸载时清理
onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})

const options = useState('options')

useHead({
  title: '实时请求大屏 - ' + options.value.title,
})
</script>

<template>
  <div class="map-container">
    <div ref="chartRef" class="attack-map"></div>
    <div v-if="hasError" class="error-message">数据加载失败</div>
    <div class="attack-info">
      <div class="attack-count">实时请求: {{ attackCount }}</div>
      <div class="update-time">更新时间: {{ currentTime }}</div>
      <div class="map-switch" @click="toggleMapType">
        切换至{{ mapType === 'china' ? '世界' : '中国' }}地图
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(circle at center, #0a2b4e 0%, #081832 100%);
}

.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        45deg,
        rgba(0, 255, 255, 0.1) 0%,
        transparent 100%
      ),
      radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
    pointer-events: none;
    z-index: 1;
  }

  .attack-map {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
  }
}

.attack-info {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 43, 77, 0.8);
  padding: 20px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);

  .attack-count {
    margin-bottom: 8px;
    color: #0ff;
    font-size: 16px;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }

  .update-time {
    color: rgba(255, 255, 255, 0.7);
  }

  .map-switch {
    margin-top: 10px;
    padding: 5px 10px;
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    transition: all 0.3s;
    color: #0ff;

    &:hover {
      background: rgba(0, 255, 255, 0.2);
    }
  }
}

.error-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 0, 0, 0.2);
  padding: 15px 30px;
  border-radius: 8px;
  color: #fff;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 0, 0, 0.3);
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.2);
}
</style>
