<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const { $myFetch } = useNuxtApp()

const chartRef = ref(null)
let chart = null
let updateTimer = null
let isFirstRender = true

const MAX_RENDER_ITEMS = 200

const attackData = ref([])
const mapType = ref('china')

const MAJOR_COUNTRIES = new Set([
  '中国', '俄罗斯', '美国', '加拿大', '巴西', '澳大利亚', '印度',
  '阿根廷', '哈萨克斯坦', '阿尔及利亚', '刚果民主共和国', '沙特阿拉伯',
  '墨西哥', '印度尼西亚', '苏丹', '利比亚', '伊朗', '蒙古', '秘鲁',
  '乍得', '尼日尔', '安哥拉', '马里', '南非', '哥伦比亚', '埃塞俄比亚',
  '玻利维亚', '毛里塔尼亚', '埃及', '坦桑尼亚', '尼日利亚',
  '巴基斯坦', '土耳其', '法国', '德国', '西班牙', '日本',
  '英国', '意大利', '乌克兰', '格陵兰',
])

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
          show: true,
          fontSize: mapType.value === 'china' ? 10 : 9,
        },
      },
    })
    updateChart()
  }
}

const isValidCoordinate = (coord) => {
  return (
    coord &&
    Array.isArray(coord) &&
    coord.length === 2 &&
    (coord[0] !== 0 || coord[1] !== 0)
  )
}

const convertData = (data) => {
  const res = []
  for (let i = 0; i < data.length; i++) {
    const fromCoord = data[i][0].coordinate
    const toCoord = data[i][1].coordinate
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

const getOption = (nameMap = {}) => ({
  backgroundColor: '#081832',
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
    silent: mapType.value === 'world',
    label: {
      show: true,
      position: 'inside',
      color: 'rgba(220, 246, 255, 0.8)',
      fontSize: mapType.value === 'china' ? 10 : 9,
      formatter: (params) => {
        if (mapType.value === 'china') {
          return params.name.replace(
            /(省|市|自治区|特别行政区|壮族|维吾尔|回族)$/,
            ''
          )
        }
        return MAJOR_COUNTRIES.has(params.name) ? params.name : ''
      },
    },
    itemStyle: {
      areaColor: 'rgba(10, 70, 99, 0.6)',
      borderColor: '#0692a4',
      borderWidth: 1,
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
      large: true,
      largeThreshold: 100,
      effect: {
        show: true,
        period: 4,
        trailLength: 0.05,
        color: '#fff',
        symbolSize: 2,
        symbol: 'circle',
      },
      lineStyle: {
        color: 'rgba(0, 255, 255, 0.25)',
        width: 1,
        opacity: 0.6,
        curveness: 0.3,
      },
      animation: false,
      progressiveThreshold: 100,
      progressive: 50,
      data: [],
    },
    {
      name: '攻击点',
      type: 'effectScatter',
      coordinateSystem: 'geo',
      zlevel: 4,
      rippleEffect: {
        brushType: 'stroke',
        scale: 3,
        period: 5,
      },
      symbol: 'circle',
      symbolSize: (val) => Math.min(val[2] / 8, 20),
      itemStyle: {
        color: '#0ff',
        shadowBlur: 5,
        shadowColor: '#0ff',
      },
      animation: false,
      data: [],
    },
    {
      name: '起始点',
      type: 'scatter',
      coordinateSystem: 'geo',
      zlevel: 4,
      large: true,
      largeThreshold: 100,
      symbolSize: 8,
      itemStyle: {
        color: '#ff0',
        shadowBlur: 5,
        shadowColor: 'rgba(255, 255, 0, 0.5)',
      },
      animation: false,
      data: [],
    },
  ],
})

const isLoading = ref(false)
const hasError = ref(false)
const currentTime = ref('')
const attackCount = ref(0)

const updateTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
}

const scheduleNextUpdate = () => {
  if (updateTimer) clearTimeout(updateTimer)
  updateTimer = setTimeout(() => {
    fetchAttackData()
  }, 5000)
}

const fetchAttackData = async () => {
  if (isLoading.value) return

  try {
    isLoading.value = true
    hasError.value = false

    const response = await $myFetch('ApiLogsMap')

    if (response.data === '暂无数据') {
      attackCount.value = 0
      attackData.value = []
      updateChart()
      updateTime()
      return
    }

    if (response?.data && Array.isArray(response.data)) {
      const validData = response.data.filter(
        (item) =>
          isValidCoordinate(item.sourceCoordinate) &&
          isValidCoordinate(item.targetCoordinate)
      )
      attackCount.value = validData.length

      attackData.value = validData.map((item) => [
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
    scheduleNextUpdate()
  }
}

const filterDataByMap = (data) => {
  if (mapType.value === 'world') {
    return data.filter((item) => {
      const sourceIsChina = item[0].name.includes('中国')
      const targetIsChina = item[1].name.includes('中国')
      return sourceIsChina !== targetIsChina
    })
  }
  if (mapType.value === 'china') {
    return data.filter((item) => {
      const sourceIsChina = item[0].name.includes('中国')
      const targetIsChina = item[1].name.includes('中国')
      return sourceIsChina && targetIsChina
    })
  }
  return data
}

const updateChart = () => {
  if (!chart) return

  let validData = attackData.value.filter(
    (item) =>
      isValidCoordinate(item[0].coordinate) &&
      isValidCoordinate(item[1].coordinate)
  )

  validData = filterDataByMap(validData)

  if (validData.length > MAX_RENDER_ITEMS) {
    validData = validData.slice(-MAX_RENDER_ITEMS)
  }

  const convertedData = convertData(validData)

  const targetPoints = new Map()
  const sourcePoints = new Map()

  for (const item of validData) {
    const tKey = item[1].coordinate.join(',')
    if (!targetPoints.has(tKey)) {
      targetPoints.set(tKey, {
        name: item[1].name,
        value: [...item[1].coordinate, 100],
      })
    }

    const sKey = item[0].coordinate.join(',')
    if (!sourcePoints.has(sKey)) {
      sourcePoints.set(sKey, {
        name: item[0].name,
        value: [...item[0].coordinate, item[1].value],
      })
    }
  }

  chart.setOption(
    {
      series: [
        { data: convertedData },
        { data: Array.from(targetPoints.values()) },
        { data: Array.from(sourcePoints.values()) },
      ],
    },
    { notMerge: false, lazyUpdate: true }
  )

  isFirstRender = false
}

const initChart = async () => {
  try {
    const echarts = await import('echarts/core')
    const { MapChart, LinesChart, ScatterChart, EffectScatterChart } =
      await import('echarts/charts')
    const { TitleComponent, TooltipComponent, GeoComponent } = await import(
      'echarts/components'
    )
    const { CanvasRenderer } = await import('echarts/renderers')

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

    const [chinaJSON, worldJSON, countryNameMap] = await Promise.all([
      $fetch('/data/map.json'),
      $fetch('/data/world.json'),
      $fetch('/data/countryNameMap.json'),
    ])

    echarts.registerMap('china', chinaJSON)
    echarts.registerMap('world', worldJSON)

    chart = echarts.init(chartRef.value)
    chart.setOption(getOption(countryNameMap))

    await fetchAttackData()

    window.addEventListener('resize', handleResize)
  } catch (error) {}
}

let resizeTimer = null
const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    chart?.resize()
  }, 200)
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (updateTimer) clearTimeout(updateTimer)
  if (resizeTimer) clearTimeout(resizeTimer)
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
  background: #081832;
}

.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #081832;

  .attack-map {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}

.attack-info {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 43, 77, 0.9);
  padding: 20px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  z-index: 10;
  border: 1px solid rgba(0, 255, 255, 0.2);

  .attack-count {
    margin-bottom: 8px;
    color: #0ff;
    font-size: 16px;
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
    transition: background 0.3s;
    color: #0ff;

    &:hover {
      background: rgba(0, 255, 255, 0.2);
    }
  }
}

.error-message {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 0, 0, 0.2);
  padding: 15px 30px;
  border-radius: 8px;
  color: #fff;
  z-index: 10;
  border: 1px solid rgba(255, 0, 0, 0.3);
}
</style>
