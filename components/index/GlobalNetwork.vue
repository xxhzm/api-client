<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Connection, DataLine, Stopwatch, Star } from '@element-plus/icons-vue'

// ECharts 容器
const chartRef = ref(null)
let chart = null
let echarts = null

// 全局数据中心（经纬度 + 核心等级）
const centers = [
  { name: '北京', coord: [116.407526, 39.90403], tier: 1 },
  { name: '上海', coord: [121.473701, 31.230416], tier: 1 },
  { name: '香港', coord: [114.1694, 22.3193], tier: 1 },
  { name: '新加坡', coord: [103.851959, 1.29027], tier: 1 },
  { name: '东京', coord: [139.691711, 35.689487], tier: 1 },
  { name: '硅谷', coord: [-122.0838, 37.3861], tier: 1 },
  { name: '洛杉矶', coord: [-118.2437, 34.0522], tier: 1 },
  { name: '纽约', coord: [-74.006, 40.7128], tier: 1 },
  { name: '伦敦', coord: [-0.1276, 51.5072], tier: 1 },
  { name: '法兰克福', coord: [8.682127, 50.110924], tier: 1 },
  { name: '阿姆斯特丹', coord: [4.9041, 52.3676], tier: 1 },
  { name: '巴黎', coord: [2.3522, 48.8566], tier: 1 },

  { name: '西雅图', coord: [-122.3321, 47.6062], tier: 2 },
  { name: '芝加哥', coord: [-87.6298, 41.8781], tier: 2 },
  { name: '达拉斯', coord: [-96.797, 32.7767], tier: 2 },
  { name: '迈阿密', coord: [-80.1918, 25.7617], tier: 2 },
  { name: '多伦多', coord: [-79.3832, 43.6532], tier: 2 },
  { name: '墨西哥城', coord: [-99.1332, 19.4326], tier: 3 },
  { name: '圣保罗', coord: [-46.6333, -23.5505], tier: 2 },
  { name: '布宜诺斯艾利斯', coord: [-58.3816, -34.6037], tier: 3 },
  { name: '圣地亚哥', coord: [-70.6693, -33.4489], tier: 3 },
  { name: '波哥大', coord: [-74.0721, 4.711], tier: 3 },

  { name: '马德里', coord: [-3.7038, 40.4168], tier: 2 },
  { name: '米兰', coord: [9.19, 45.4642], tier: 2 },
  { name: '苏黎世', coord: [8.5417, 47.3769], tier: 2 },
  { name: '斯德哥尔摩', coord: [18.0686, 59.3293], tier: 2 },
  { name: '华沙', coord: [21.0122, 52.2297], tier: 2 },
  { name: '都柏林', coord: [-6.2603, 53.3498], tier: 3 },
  { name: '布鲁塞尔', coord: [4.3517, 50.8503], tier: 3 },
  { name: '布拉格', coord: [14.4378, 50.0755], tier: 3 },
  { name: '维也纳', coord: [16.3738, 48.2082], tier: 3 },
  { name: '里斯本', coord: [-9.1393, 38.7223], tier: 3 },

  { name: '首尔', coord: [126.978, 37.5665], tier: 2 },
  { name: '大阪', coord: [135.5022, 34.6937], tier: 2 },
  { name: '台北', coord: [121.5654, 25.033], tier: 3 },
  { name: '曼谷', coord: [100.5018, 13.7563], tier: 3 },
  { name: '雅加达', coord: [106.8456, -6.2088], tier: 3 },
  { name: '孟买', coord: [72.8777, 19.076], tier: 2 },
  { name: '班加罗尔', coord: [77.5946, 12.9716], tier: 3 },

  { name: '悉尼', coord: [151.2093, -33.8688], tier: 2 },
  { name: '墨尔本', coord: [144.9631, -37.8136], tier: 3 },

  { name: '迪拜', coord: [55.2708, 25.2048], tier: 2 },
  { name: '利雅得', coord: [46.6753, 24.7136], tier: 3 },
  { name: '特拉维夫', coord: [34.7818, 32.0853], tier: 3 },
  { name: '伊斯坦布尔', coord: [28.9784, 41.0082], tier: 3 },
  { name: '开罗', coord: [31.2357, 30.0444], tier: 3 },
  { name: '约翰内斯堡', coord: [28.0473, -26.2041], tier: 3 },
  { name: '拉各斯', coord: [3.3792, 6.5244], tier: 3 },
  { name: '内罗毕', coord: [36.8219, -1.2921], tier: 3 },
  { name: '卡萨布兰卡', coord: [-7.5898, 33.5731], tier: 3 },
]

// 连线数据（起点 -> 终点），覆盖主要跨洲骨干与区域互联
const links = [
  ['纽约', '伦敦'],
  ['伦敦', '法兰克福'],
  ['法兰克福', '阿姆斯特丹'],
  ['巴黎', '伦敦'],
  ['纽约', '硅谷'],
  ['硅谷', '北京'],
  ['东京', '上海'],
  ['上海', '北京'],
  ['北京', '香港'],
  ['香港', '新加坡'],
  ['新加坡', '悉尼'],
  ['孟买', '迪拜'],
  ['迪拜', '法兰克福'],
  ['圣保罗', '迈阿密'],
  ['墨西哥城', '达拉斯'],
  ['多伦多', '纽约'],
  ['西雅图', '硅谷'],
  ['芝加哥', '纽约'],
  ['首尔', '东京'],
  ['台北', '香港'],
  ['雅加达', '新加坡'],
  ['曼谷', '新加坡'],
  ['墨尔本', '悉尼'],
  ['马德里', '巴黎'],
  ['米兰', '法兰克福'],
  ['苏黎世', '法兰克福'],
  ['斯德哥尔摩', '阿姆斯特丹'],
  ['华沙', '法兰克福'],
  ['都柏林', '伦敦'],
  ['布拉格', '维也纳'],
  ['维也纳', '法兰克福'],
  ['里斯本', '马德里'],
  ['布鲁塞尔', '阿姆斯特丹'],
  ['伊斯坦布尔', '法兰克福'],
  ['开罗', '迪拜'],
  ['特拉维夫', '法兰克福'],
  ['利雅得', '迪拜'],
  ['约翰内斯堡', '法兰克福'],
  ['拉各斯', '伦敦'],
  ['内罗毕', '迪拜'],
  ['卡萨布兰卡', '马德里'],
  ['大阪', '东京'],
  ['迈阿密', '纽约'],
]

const findCoord = (name) => centers.find((c) => c.name === name)?.coord

// 距离阈值（单位：km），低于该值的连线将被过滤
const MIN_LINK_DISTANCE_KM = 2200
const degToRad = (deg) => (deg * Math.PI) / 180
const haversineDistanceKm = (a, b) => {
  if (!a || !b) return 0
  const [lng1, lat1] = a
  const [lng2, lat2] = b
  const dLat = degToRad(lat2 - lat1)
  const dLng = degToRad(lng2 - lng1)
  const rLat1 = degToRad(lat1)
  const rLat2 = degToRad(lat2)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

// 节点密度过滤：隐藏距任意一级核心节点一定半径内的低等级节点
const NODE_HIDE_RADIUS_KM = 550
const tier1Centers = centers.filter((c) => (c.tier ?? 2) === 1)
const visibleCenters = centers.filter((c) => {
  if ((c.tier ?? 2) === 1) return true
  return !tier1Centers.some(
    (t1) => haversineDistanceKm(c.coord, t1.coord) <= NODE_HIDE_RADIUS_KM
  )
})

const toLineData = (pairs) =>
  pairs
    .map(([from, to]) => {
      const a = findCoord(from)
      const b = findCoord(to)
      if (!a || !b) return null
      const dist = haversineDistanceKm(a, b)
      return dist >= MIN_LINK_DISTANCE_KM
        ? { coords: [a, b], from, to, dist }
        : null
    })
    .filter(Boolean)

// 世界地图配置
const getWorldOption = () => {
  const lineData = toLineData(links)

  return {
    backgroundColor: '#fff',
    title: {
      text: '全球云联接网络',
      left: 'center',
      top: 8,
      textStyle: { color: '#1f2f3d', fontSize: 16, fontWeight: 600 },
    },
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: (params) => {
        if (params.componentType === 'geo') return null
        if (params.seriesType === 'lines') {
          return `${params.data.from} → ${params.data.to}`
        }
        if (
          params.seriesType === 'effectScatter' ||
          params.seriesType === 'scatter'
        ) {
          return params.name
        }
        return null
      },
    },
    geo: {
      map: 'world',
      silent: true, // 禁用国家区域的交互与tooltip
      roam: false,
      zoom: 1.15,
      scaleLimit: { min: 1.15, max: 1.15 },
      left: 'center',
      top: 'center',
      itemStyle: {
        areaColor: '#eef5ff',
        borderColor: '#b3d4ff',
        shadowColor: 'rgba(64, 158, 255, 0.25)',
        shadowBlur: 12,
      },
      emphasis: {
        itemStyle: {
          areaColor: '#e6f2ff',
          shadowBlur: 16,
          shadowColor: 'rgba(102, 177, 255, 0.35)',
        },
        label: { show: false },
      },
    },
    series: [
      {
        name: '全球连线',
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 2,
        effect: {
          show: true,
          constantSpeed: 60,
          trailLength: 0.25,
          symbol: 'arrow',
          symbolSize: 8,
          color: '#66b1ff',
        },
        lineStyle: {
          color: '#409eff',
          width: 1.8,
          opacity: 0.85,
          curveness: 0.25,
        },
        data: lineData,
      },
      {
        name: '粒子流光',
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 1,
        effect: {
          show: true,
          constantSpeed: 35,
          trailLength: 0,
          symbol: 'circle',
          symbolSize: 3.5,
          color: '#a0c8ff',
        },
        lineStyle: {
          color: '#a0c8ff',
          width: 0.8,
          opacity: 0.5,
          curveness: 0.25,
        },
        data: lineData,
      },
      {
        name: '目标节点',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        rippleEffect: { brushType: 'stroke', scale: 3, period: 4 },
        itemStyle: {
          color: '#409eff',
          shadowBlur: 10,
          shadowColor: 'rgba(64, 158, 255, 0.5)',
        },
        symbolSize: (val, params) => params.data?.symbolSize ?? 9,
        data: visibleCenters.map((c) => ({
          name: c.name,
          value: [...c.coord, 1],
          symbolSize: c.tier === 1 ? 11 : c.tier === 2 ? 9 : 7,
        })),
      },
      {
        name: '节点标签',
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 4,
        symbolSize: 1,
        label: {
          show: true,
          formatter: (p) => p.name,
          position: 'right',
          color: '#606266',
          fontSize: 12,
        },
        itemStyle: { color: '#409eff' },
        // 在 ECharts 配置中，按核心等级调整节点大小，减少标签拥挤
        // effectScatter 系列：为每个节点设置 symbolSize
        data: visibleCenters
          .filter((c) => (c.tier ?? 2) <= 2)
          .map((c) => ({ name: c.name, value: [...c.coord, 1] })),
      },
    ],
  }
}

// 备用：图形布局（无世界地图时）
const getGraphOption = () => {
  const nodes = visibleCenters.map((c, idx) => ({ id: idx, name: c.name }))
  const nameToId = Object.fromEntries(nodes.map((n) => [n.name, n.id]))
  const edges = links
    .map(([a, b]) => {
      const ca = findCoord(a)
      const cb = findCoord(b)
      const dist = haversineDistanceKm(ca, cb)
      return {
        source: nameToId[a],
        target: nameToId[b],
        valid:
          nameToId[a] !== undefined &&
          nameToId[b] !== undefined &&
          dist >= MIN_LINK_DISTANCE_KM,
      }
    })
    .filter((e) => e.valid)
    .map((e) => ({ source: e.source, target: e.target }))

  return {
    backgroundColor: '#fff',
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'graph',
        layout: 'circular',
        roam: true,
        label: { show: true, color: '#606266' },
        lineStyle: { color: '#409eff', width: 1.5 },
        itemStyle: { color: '#409eff' },
        emphasis: { focus: 'adjacency' },
        data: nodes,
        edges,
      },
    ],
  }
}

const initChart = async () => {
  // 动态导入 ECharts
  const core = await import('echarts/core')
  const charts = await import('echarts/charts')
  const comps = await import('echarts/components')
  const renderers = await import('echarts/renderers')

  echarts = core
  const { LinesChart, ScatterChart, EffectScatterChart, MapChart } = charts
  const { GeoComponent, TooltipComponent, TitleComponent } = comps
  const { CanvasRenderer } = renderers

  echarts.use([
    GeoComponent,
    TooltipComponent,
    TitleComponent,
    LinesChart,
    ScatterChart,
    EffectScatterChart,
    MapChart,
    CanvasRenderer,
  ])

  // 从 public 目录通过 fetch 加载地图数据（不打包进 JS，减小 bundle 体积）
  const worldRegistered = await (async () => {
    try {
      const worldData = await $fetch('/data/world.json')
      echarts.registerMap('world', worldData)
      return true
    } catch (e) {
      return false
    }
  })()

  chart = echarts.init(chartRef.value)
  chart.setOption(worldRegistered ? getWorldOption() : getGraphOption())

  window.addEventListener('resize', () => chart?.resize())
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  chart?.dispose()
})
</script>

<template>
  <div class="global-network-section">
    <div class="container">
      <div class="header">
        <h2 class="title">全球云联接网络</h2>
        <p class="subtitle">多个数据中心覆盖全球，提供高速稳定的云联接</p>
      </div>

      <div class="visual-card">
        <!-- 粒子背景 -->
        <div class="particles">
          <span v-for="i in 12" :key="i" class="particle" />
        </div>

        <!-- 地球/网络可视化 -->
        <div class="globe-wrapper">
          <div ref="chartRef" class="global-echarts"></div>
        </div>

        <!-- 高亮能力指标 -->
        <div class="stats">
          <div class="stat">
            <el-icon class="icon"><Connection /></el-icon>
            <div class="content">
              <div class="label">全球加速</div>
              <div class="desc">智能路由，多点就近接入</div>
            </div>
          </div>
          <div class="stat">
            <el-icon class="icon"><DataLine /></el-icon>
            <div class="content">
              <div class="label">高带宽</div>
              <div class="desc">骨干网络，稳定吞吐表现</div>
            </div>
          </div>
          <div class="stat">
            <el-icon class="icon"><Stopwatch /></el-icon>
            <div class="content">
              <div class="label">低时延</div>
              <div class="desc">跨洲通信，时延优化体验</div>
            </div>
          </div>
          <div class="stat">
            <el-icon class="icon"><Star /></el-icon>
            <div class="content">
              <div class="label">高可用</div>
              <div class="desc">多活容灾，企业级SLA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.global-network-section {
  width: 100%;
  padding: 40px 0;
  background: linear-gradient(180deg, #0c1222 0%, #0f1530 100%);
  background: transparent;
  position: relative;
  overflow: hidden;

  .container {
    width: 95%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    text-align: center;
    margin-bottom: 16px;

    .title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.5px;
      background: linear-gradient(90deg, #8a2be2, #00f5ff);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      color: #1f2f3d;
    }

    .subtitle {
      margin-top: 8px;
      font-size: 14px;
      color: #b7c1d9;
      color: #606266;
    }
  }

  .visual-card {
    position: relative;
    background: #fff;
    border: 1px solid #ebeef5;
    padding: 28px;
    overflow: hidden;

    .particles {
      position: absolute;
      inset: 0;
      pointer-events: none;

      .particle {
        position: absolute;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        animation: float 9s linear infinite;
        filter: blur(0.3px);
      }

      .particle:nth-child(1) {
        left: 10%;
        top: 20%;
        animation-delay: 0s;
      }
      .particle:nth-child(2) {
        left: 25%;
        top: 70%;
        animation-delay: 0.5s;
      }
      .particle:nth-child(3) {
        left: 80%;
        top: 30%;
        animation-delay: 1s;
      }
      .particle:nth-child(4) {
        left: 60%;
        top: 15%;
        animation-delay: 1.4s;
      }
      .particle:nth-child(5) {
        left: 40%;
        top: 50%;
        animation-delay: 2s;
      }
      .particle:nth-child(6) {
        left: 15%;
        top: 85%;
        animation-delay: 2.5s;
      }
      .particle:nth-child(7) {
        left: 90%;
        top: 70%;
        animation-delay: 3s;
      }
      .particle:nth-child(8) {
        left: 72%;
        top: 55%;
        animation-delay: 3.4s;
      }
      .particle:nth-child(9) {
        left: 33%;
        top: 30%;
        animation-delay: 4s;
      }
      .particle:nth-child(10) {
        left: 55%;
        top: 80%;
        animation-delay: 4.5s;
      }
      .particle:nth-child(11) {
        left: 20%;
        top: 40%;
        animation-delay: 5s;
      }
      .particle:nth-child(12) {
        left: 85%;
        top: 20%;
        animation-delay: 5.5s;
      }
    }

    .globe-wrapper {
      display: grid;
      place-items: center;
      padding: 8px 8px 24px;

      .global-echarts {
        width: 100%;
        max-width: 100%;
        height: 520px;
      }
    }

    .globe {
      position: relative;
      width: 560px;
      max-width: 100%;
      aspect-ratio: 1/1;
      border-radius: 50%;
      background: radial-gradient(
        120% 120% at 30% 30%,
        rgba(138, 43, 226, 0.25) 0%,
        rgba(0, 245, 255, 0.25) 50%,
        rgba(255, 255, 255, 0.06) 100%
      );
      box-shadow: inset 0 0 80px rgba(0, 245, 255, 0.12),
        0 0 40px rgba(138, 43, 226, 0.2);
      background: #fff;
      box-shadow: inset 0 0 40px rgba(64, 158, 255, 0.08),
        0 2px 10px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }

    .globe-grid {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background-image: radial-gradient(
          circle at 50% 50%,
          rgba(255, 255, 255, 0.12) 0,
          rgba(255, 255, 255, 0.04) 60%,
          transparent 65%
        ),
        repeating-conic-gradient(
          from 0deg,
          rgba(255, 255, 255, 0.08) 0deg 2deg,
          transparent 2deg 8deg
        ),
        repeating-radial-gradient(
          circle at 50% 50%,
          rgba(255, 255, 255, 0.06) 0 6px,
          transparent 6px 12px
        ),
        radial-gradient(
          circle at 50% 50%,
          rgba(64, 158, 255, 0.08) 0,
          rgba(64, 158, 255, 0.04) 60%,
          transparent 65%
        ),
        repeating-conic-gradient(
          from 0deg,
          rgba(64, 158, 255, 0.08) 0deg 2deg,
          transparent 2deg 8deg
        ),
        repeating-radial-gradient(
          circle at 50% 50%,
          rgba(64, 158, 255, 0.06) 0 6px,
          transparent 6px 12px
        );
      animation: rotate 28s linear infinite;
      filter: drop-shadow(0 0 8px rgba(0, 245, 255, 0.25));
      filter: drop-shadow(0 0 6px rgba(64, 158, 255, 0.15));
    }

    .links {
      position: absolute;
      inset: 0;
    }

    .arc {
      stroke-linecap: round;
      opacity: 0.85;
      filter: drop-shadow(0 0 6px rgba(0, 245, 255, 0.45));
      filter: drop-shadow(0 0 6px rgba(64, 158, 255, 0.25));
      stroke-dasharray: 4 90;
      animation: flow 6s linear infinite;
    }

    .node {
      position: absolute;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      gap: 8px;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #00f5ff;
        box-shadow: 0 0 12px rgba(0, 245, 255, 0.8),
          0 0 24px rgba(138, 43, 226, 0.6);
        background: #409eff;
        box-shadow: 0 0 10px rgba(64, 158, 255, 0.4);
        position: relative;
      }

      .dot::after {
        content: '';
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        border: 2px solid rgba(0, 245, 255, 0.35);
        border: 2px solid rgba(64, 158, 255, 0.3);
        animation: pulse 2.4s ease-out infinite;
      }

      .label {
        color: #e6efff;
        font-size: 12px;
        background: rgba(8, 16, 40, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #606266;
        font-size: 12px;
        background: #fff;
        border: 1px solid #ebeef5;
        padding: 3px 8px;
        border-radius: 10px;
        backdrop-filter: blur(4px);
      }
    }

    .stats {
      margin-top: 12px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;

      .stat {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 14px;
        color: #d7e0f7;
        padding: 12px 14px;
        background: #fff;
        border: 1px solid #ebeef5;
        border-radius: 14px;
        color: #1f2f3d;
      }

      .icon {
        font-size: 18px;
        color: #9bd8ff;
        filter: drop-shadow(0 0 6px rgba(0, 245, 255, 0.4));
        color: #409eff;
        filter: none;
      }

      .content {
        .label {
          font-size: 14px;
          font-weight: 600;
          color: #1f2f3d;
        }
        .desc {
          margin-top: 2px;
          font-size: 12px;
          color: #b7c1d9;
          color: #606266;
        }
      }
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes flow {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: -94;
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(0.9);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.4;
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }

  @keyframes float {
    0% {
      transform: translateY(0);
      opacity: 0.7;
    }
    50% {
      transform: translateY(-6px);
      opacity: 1;
    }
    100% {
      transform: translateY(0);
      opacity: 0.7;
    }
  }

  /* 响应式调整 */
  @media (max-width: 992px) {
    .visual-card {
      padding: 22px;
      .stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
  @media (max-width: 640px) {
    .header .title {
      font-size: 22px;
    }
    .header .subtitle {
      font-size: 13px;
    }
    .visual-card .stats {
      grid-template-columns: 1fr;
    }
  }
}
</style>
