<script setup>
import { Menu } from '@element-plus/icons-vue'
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const { $msg, $myFetch } = useNuxtApp()

// 控制左侧边栏显示隐藏
const screenWidth = ref(0)
const isSidebarShow = ref(true)
const iscontrolShow = ref(false)
const isoverlay = ref(false)

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
    const currentData = statsData.value.find(item => item.time_range === timeRange.value)
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
        const times = oneHourData.minute_stats.map(item => {
            const date = new Date(item.time)
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
        })
        const counts = oneHourData.minute_stats.map(item => item.count)

        trendChart.setOption({
            title: { text: '最近1小时访问趋势' },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}<br />访问次数: {c}'
            },
            grid: {
                left: '1%',
                right: '1%',
                bottom: 0,
                containLabel: true
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
    screenWidth.value = document.body.clientWidth
    document.body.style.overflow = ''

    if (screenWidth.value < 768) {
        iscontrolShow.value = true
        isSidebarShow.value = false
    }

    // 使用 nextTick 确保 DOM 已经渲染
    nextTick(() => {
        // 初始化图表
        trendChart = echarts.init(document.getElementById('trendChart'))

        // 获取数据
        getStats()

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            trendChart?.resize()
        })
    })
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

useHead({
    title: '统计分析',
    viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
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
                <div class="stats-header">
                    <el-select v-model="timeRange" @change="handleTimeRangeChange" placeholder="选择时间范围">
                        <el-option label="最近1小时" value="1h" />
                        <el-option label="最近3小时" value="3h" />
                        <el-option label="最近12小时" value="12h" />
                        <el-option label="最近24小时" value="24h" />
                    </el-select>
                </div>

                <div class="stats-content" v-loading="loading">
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
                                <el-table :data="currentRefererStats" stripe style="width: 100%">
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
                                    <el-table-column prop="ua" label="User Agent" show-overflow-tooltip />
                                    <el-table-column prop="count" label="访问次数" sortable />
                                </el-table>
                            </div>
                            <div class="table-container">
                                <h3>防火墙统计</h3>
                                <el-table :data="currentFirewallStats" stripe style="width: 100%">
                                    <el-table-column prop="ip" label="IP地址" />
                                    <el-table-column prop="address" label="地址" />
                                    <el-table-column prop="count" label="拦截次数" sortable />
                                </el-table>
                            </div>
                            <div class="table-container">
                                <h3>状态码统计</h3>
                                <el-table :data="currentStatusStats" stripe style="width: 100%">
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
            padding: 20px;

            .stats-header {
                margin-bottom: 20px;
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
                            border-radius: 4px;
                            padding: 20px;
                            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

                            h3 {
                                margin: 0 0 15px 0;
                                font-size: 16px;
                                color: #333;
                            }
                        }
                    }

                    .trend-chart {
                        width: 100%;
                        height: 500px;
                        background: #fff;
                        border-radius: 4px;
                        padding: 20px;
                        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
                    }
                }
            }
        }
    }
}

@media screen and (max-width: 900px) {
    .container {
        .right {
            .main-container {
                padding: 10px;
            }
        }
    }
}
</style>
