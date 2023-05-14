<script setup>
import * as echarts from 'echarts'
import axios from 'axios'

const chartShow = ref(true)

const totaluser = ref({
  data: 0
})

const todayRegisterUserTotal = ref({
  data: 0
})

const apiTotal = ref({
  data: 0
})

const requestTotal = ref({
  data: 0
})

const recentRequest = ref({
  data: {
    xAxis: ["2022-01-01 12:00"],
    series: [0]
  }
})


onMounted(async () => {
  chartShow.value = false
  chartShow.value = true

  recentRequest.value.data.xAxis = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  recentRequest.value.data.series = [820, 932, 901, 934, 1290, 1330, 1320]

  const dom = document.getElementById('chart')

  const myChart = echarts.init(dom)
  let option

  option = {
    tooltip: {
      trigger: "axis"
    },
    xAxis: {
      type: 'category',
      data: recentRequest.value.data.xAxis
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [{}],
    series: [
      {
        data: recentRequest.value.data.series,
        type: 'line',
        smooth: true
      }
    ]
  }

  option && myChart.setOption(option)
})

onMounted(async () => {
  // 平台所有用户
  const { data: res1 } = await axios.get('TotalUser')
  totaluser.value = res1

  // 24小时内注册用户
  const { data: res2 } = await axios.get('TodayRegisterUserTotal')
  todayRegisterUserTotal.value = res2

  // 接口总数
  const { data: res3 } = await axios.get('ApiTotal')
  apiTotal.value = res3

  const { data: res4 } = await axios.get('RequestTotal')
  requestTotal.value = res4
})
</script>

<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="main-container">
        <div class="info-container">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <AdminIndexCard>
                <template v-slot:title>平台用户</template>
                <template v-slot:tag>总</template>
                <template v-slot:content>
                  <HelpersCount
                    style="font-size: 26px"
                    :end="totaluser.data"
                  ></HelpersCount>
                </template>
              </AdminIndexCard>
            </el-col>

            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <AdminIndexCard>
                <template v-slot:title>24小时内注册用户</template>
                <template v-slot:tag>24</template>
                <template v-slot:content>
                  <HelpersCount
                    style="font-size: 26px"
                    :end="todayRegisterUserTotal.data"
                  ></HelpersCount>
                </template>
              </AdminIndexCard>
            </el-col>

            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <AdminIndexCard>
                <template v-slot:title>平台接口</template>
                <template v-slot:tag>总</template>
                <template v-slot:content>
                  <HelpersCount
                    style="font-size: 26px"
                    :end="apiTotal.data"
                  ></HelpersCount>
                </template>
              </AdminIndexCard>
            </el-col>

            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <AdminIndexCard>
                <template v-slot:title>请求总调用</template>
                <template v-slot:tag>总</template>
                <template v-slot:content>
                  <HelpersCount
                    style="font-size: 26px"
                    :end="requestTotal.data"
                  ></HelpersCount>
                </template>
              </AdminIndexCard>
            </el-col>
          </el-row>

          <el-row :gutter="12" style="margin-top: 20px; text-align: center">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-card style="padding: 5px 0" shadow="hover">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 1024 1024"
                  style="color: rgb(105, 192, 255); font-size: 32px"
                >
                  <path
                    d="M892 772h-80v-80c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v80h-80c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h80v80c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-80h80c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM373.5 498.4c-.9-8.7-1.4-17.5-1.4-26.4c0-15.9 1.5-31.4 4.3-46.5c.7-3.6-1.2-7.3-4.5-8.8c-13.6-6.1-26.1-14.5-36.9-25.1a127.54 127.54 0 0 1-38.7-95.4c.9-32.1 13.8-62.6 36.3-85.6c24.7-25.3 57.9-39.1 93.2-38.7c31.9.3 62.7 12.6 86 34.4c7.9 7.4 14.7 15.6 20.4 24.4c2 3.1 5.9 4.4 9.3 3.2c17.6-6.1 36.2-10.4 55.3-12.4c5.6-.6 8.8-6.6 6.3-11.6c-32.5-64.3-98.9-108.7-175.7-109.9c-110.8-1.7-203.2 89.2-203.2 200c0 62.8 28.9 118.8 74.2 155.5c-31.8 14.7-61.1 35-86.5 60.4c-54.8 54.7-85.8 126.9-87.8 204a8 8 0 0 0 8 8.2h56.1c4.3 0 7.9-3.4 8-7.7c1.9-58 25.4-112.3 66.7-153.5c29.4-29.4 65.4-49.8 104.7-59.7c3.8-1.1 6.4-4.8 5.9-8.8zM824 472c0-109.4-87.9-198.3-196.9-200C516.3 270.3 424 361.2 424 472c0 62.8 29 118.8 74.2 155.5a300.95 300.95 0 0 0-86.4 60.4C357 742.6 326 814.8 324 891.8a8 8 0 0 0 8 8.2h56c4.3 0 7.9-3.4 8-7.7c1.9-58 25.4-112.3 66.7-153.5C505.8 695.7 563 672 624 672c110.4 0 200-89.5 200-200zm-109.5 90.5C690.3 586.7 658.2 600 624 600s-66.3-13.3-90.5-37.5a127.26 127.26 0 0 1-37.5-91.8c.3-32.8 13.4-64.5 36.3-88c24-24.6 56.1-38.3 90.4-38.7c33.9-.3 66.8 12.9 91 36.6c24.8 24.3 38.4 56.8 38.4 91.4c-.1 34.2-13.4 66.3-37.6 90.5z"
                    fill="currentColor"
                  ></path>
                </svg>
                <p>用户</p></el-card
              >
            </el-col>

            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-card style="padding: 5px 0" shadow="hover">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 1024 1024"
                  style="color: rgb(255, 192, 105); font-size: 32px"
                >
                  <path
                    d="M924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.8s-1.6-38.8-4.7-57.8l65.5-56a32.03 32.03 0 0 0 9.3-35.2l-.9-2.6a443.74 443.74 0 0 0-79.7-137.9l-1.8-2.1a32.12 32.12 0 0 0-35.1-9.5l-81.3 28.9c-30-24.6-63.5-44-99.7-57.6l-15.7-85a32.05 32.05 0 0 0-25.8-25.7l-2.7-.5c-52.1-9.4-106.9-9.4-159 0l-2.7.5a32.05 32.05 0 0 0-25.8 25.7l-15.8 85.4a351.86 351.86 0 0 0-99 57.4l-81.9-29.1a32 32 0 0 0-35.1 9.5l-1.8 2.1a446.02 446.02 0 0 0-79.7 137.9l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.3 56.6c-3.1 18.8-4.6 38-4.6 57.1c0 19.2 1.5 38.4 4.6 57.1L99 625.5a32.03 32.03 0 0 0-9.3 35.2l.9 2.6c18.1 50.4 44.9 96.9 79.7 137.9l1.8 2.1a32.12 32.12 0 0 0 35.1 9.5l81.9-29.1c29.8 24.5 63.1 43.9 99 57.4l15.8 85.4a32.05 32.05 0 0 0 25.8 25.7l2.7.5a449.4 449.4 0 0 0 159 0l2.7-.5a32.05 32.05 0 0 0 25.8-25.7l15.7-85a350 350 0 0 0 99.7-57.6l81.3 28.9a32 32 0 0 0 35.1-9.5l1.8-2.1c34.8-41.1 61.6-87.5 79.7-137.9l.9-2.6c4.5-12.3.8-26.3-9.3-35zM788.3 465.9c2.5 15.1 3.8 30.6 3.8 46.1s-1.3 31-3.8 46.1l-6.6 40.1l74.7 63.9a370.03 370.03 0 0 1-42.6 73.6L721 702.8l-31.4 25.8c-23.9 19.6-50.5 35-79.3 45.8l-38.1 14.3l-17.9 97a377.5 377.5 0 0 1-85 0l-17.9-97.2l-37.8-14.5c-28.5-10.8-55-26.2-78.7-45.7l-31.4-25.9l-93.4 33.2c-17-22.9-31.2-47.6-42.6-73.6l75.5-64.5l-6.5-40c-2.4-14.9-3.7-30.3-3.7-45.5c0-15.3 1.2-30.6 3.7-45.5l6.5-40l-75.5-64.5c11.3-26.1 25.6-50.7 42.6-73.6l93.4 33.2l31.4-25.9c23.7-19.5 50.2-34.9 78.7-45.7l37.9-14.3l17.9-97.2c28.1-3.2 56.8-3.2 85 0l17.9 97l38.1 14.3c28.7 10.8 55.4 26.2 79.3 45.8l31.4 25.8l92.8-32.9c17 22.9 31.2 47.6 42.6 73.6L781.8 426l6.5 39.9zM512 326c-97.2 0-176 78.8-176 176s78.8 176 176 176s176-78.8 176-176s-78.8-176-176-176zm79.2 255.2A111.6 111.6 0 0 1 512 614c-29.9 0-58-11.7-79.2-32.8A111.6 111.6 0 0 1 400 502c0-29.9 11.7-58 32.8-79.2C454 401.6 482.1 390 512 390c29.9 0 58 11.6 79.2 32.8A111.6 111.6 0 0 1 624 502c0 29.9-11.7 58-32.8 79.2z"
                    fill="currentColor"
                  ></path>
                </svg>
                <p>设置</p></el-card
              >
            </el-col>

            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-card style="padding: 5px 0" shadow="hover">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 1024 1024"
                  style="color: rgb(255, 133, 192); font-size: 32px"
                >
                  <path
                    d="M483.2 790.3L861.4 412c1.7-1.7 2.5-4 2.3-6.3l-25.5-301.4c-.7-7.8-6.8-13.9-14.6-14.6L522.2 64.3c-2.3-.2-4.7.6-6.3 2.3L137.7 444.8a8.03 8.03 0 0 0 0 11.3l334.2 334.2c3.1 3.2 8.2 3.2 11.3 0zm62.6-651.7l224.6 19l19 224.6L477.5 694L233.9 450.5l311.9-311.9zm60.16 186.23a48 48 0 1 0 67.88-67.89a48 48 0 1 0-67.88 67.89zM889.7 539.8l-39.6-39.5a8.03 8.03 0 0 0-11.3 0l-362 361.3l-237.6-237a8.03 8.03 0 0 0-11.3 0l-39.6 39.5a8.03 8.03 0 0 0 0 11.3l243.2 242.8l39.6 39.5c3.1 3.1 8.2 3.1 11.3 0l407.3-406.6c3.1-3.1 3.1-8.2 0-11.3z"
                    fill="currentColor"
                  ></path>
                </svg>
                <p>参数</p></el-card
              >
            </el-col>

            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-card style="padding: 5px 0" shadow="hover">
                <svg
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  style="color: rgb(179, 127, 235); font-size: 32px"
                >
                  <path
                    fill="currentColor"
                    d="M640 384v256H384V384h256zm64 0h192v256H704V384zm-64 512H384V704h256v192zm64 0V704h192v192H704zm-64-768v192H384V128h256zm64 0h192v192H704V128zM320 384v256H128V384h192zm0 512H128V704h192v192zm0-768v192H128V128h192z"
                  ></path>
                </svg>
                <p>分类</p></el-card
              >
            </el-col>
          </el-row>

          <el-row :gutter="12" style="margin-top: 20px; text-align: center">
            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-card style="padding: 5px 0" shadow="hover">
                <svg
                  version="1.1"
                  id="a"
                  xmlns="http://www.w3.org/2000/svg"
                  x="0"
                  y="0"
                  viewBox="0 0 1024 1024"
                  xml:space="preserve"
                  style="color: rgb(92, 219, 211); font-size: 32px"
                >
                  <path
                    d="M480 320h192c21.33 0 32-10.67 32-32s-10.67-32-32-32H480c-21.33 0-32 10.67-32 32s10.67 32 32 32z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M887.01 72.99C881.01 67 873.34 64 864 64H160c-9.35 0-17.02 3-23.01 8.99C131 78.99 128 86.66 128 96v832c0 9.35 2.99 17.02 8.99 23.01S150.66 960 160 960h704c9.35 0 17.02-2.99 23.01-8.99S896 937.34 896 928V96c0-9.35-3-17.02-8.99-23.01zM192 896V128h96v768h-96zm640 0H352V128h480v768z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M480 512h192c21.33 0 32-10.67 32-32s-10.67-32-32-32H480c-21.33 0-32 10.67-32 32s10.67 32 32 32zM480 704h192c21.33 0 32-10.67 32-32s-10.67-32-32-32H480c-21.33 0-32 10.67-32 32s10.67 32 32 32z"
                    fill="currentColor"
                  ></path>
                </svg>
                <p>接口</p></el-card
              >
            </el-col>

            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-card style="padding: 5px 0" shadow="hover">
                <svg
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  style="color: rgb(179, 127, 235); font-size: 32px"
                >
                  <path
                    fill="currentColor"
                    d="m64 448 832-320-128 704-446.08-243.328L832 192 242.816 545.472 64 448zm256 512V657.024L512 768 320 960z"
                  ></path>
                </svg>
                <p>前台</p></el-card
              >
            </el-col>

            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-card style="padding: 5px 0" shadow="hover">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 1024 1024"
                  style="color: rgb(105, 192, 255); font-size: 32px"
                >
                  <path
                    d="M892 772h-80v-80c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v80h-80c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h80v80c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-80h80c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM373.5 498.4c-.9-8.7-1.4-17.5-1.4-26.4c0-15.9 1.5-31.4 4.3-46.5c.7-3.6-1.2-7.3-4.5-8.8c-13.6-6.1-26.1-14.5-36.9-25.1a127.54 127.54 0 0 1-38.7-95.4c.9-32.1 13.8-62.6 36.3-85.6c24.7-25.3 57.9-39.1 93.2-38.7c31.9.3 62.7 12.6 86 34.4c7.9 7.4 14.7 15.6 20.4 24.4c2 3.1 5.9 4.4 9.3 3.2c17.6-6.1 36.2-10.4 55.3-12.4c5.6-.6 8.8-6.6 6.3-11.6c-32.5-64.3-98.9-108.7-175.7-109.9c-110.8-1.7-203.2 89.2-203.2 200c0 62.8 28.9 118.8 74.2 155.5c-31.8 14.7-61.1 35-86.5 60.4c-54.8 54.7-85.8 126.9-87.8 204a8 8 0 0 0 8 8.2h56.1c4.3 0 7.9-3.4 8-7.7c1.9-58 25.4-112.3 66.7-153.5c29.4-29.4 65.4-49.8 104.7-59.7c3.8-1.1 6.4-4.8 5.9-8.8zM824 472c0-109.4-87.9-198.3-196.9-200C516.3 270.3 424 361.2 424 472c0 62.8 29 118.8 74.2 155.5a300.95 300.95 0 0 0-86.4 60.4C357 742.6 326 814.8 324 891.8a8 8 0 0 0 8 8.2h56c4.3 0 7.9-3.4 8-7.7c1.9-58 25.4-112.3 66.7-153.5C505.8 695.7 563 672 624 672c110.4 0 200-89.5 200-200zm-109.5 90.5C690.3 586.7 658.2 600 624 600s-66.3-13.3-90.5-37.5a127.26 127.26 0 0 1-37.5-91.8c.3-32.8 13.4-64.5 36.3-88c24-24.6 56.1-38.3 90.4-38.7c33.9-.3 66.8 12.9 91 36.6c24.8 24.3 38.4 56.8 38.4 91.4c-.1 34.2-13.4 66.3-37.6 90.5z"
                    fill="currentColor"
                  ></path>
                </svg>
                <p>友情链接</p></el-card
              >
            </el-col>

            <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
              <el-card style="padding: 5px 0" shadow="hover">
                <svg
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  style="color: rgb(255, 214, 102); font-size: 32px"
                >
                  <path
                    fill="currentColor"
                    d="M224 448a32 32 0 0 0-32 32v384a32 32 0 0 0 32 32h576a32 32 0 0 0 32-32V480a32 32 0 0 0-32-32H224zm0-64h576a96 96 0 0 1 96 96v384a96 96 0 0 1-96 96H224a96 96 0 0 1-96-96V480a96 96 0 0 1 96-96z"
                  ></path>
                  <path
                    fill="currentColor"
                    d="M512 544a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V576a32 32 0 0 1 32-32zm192-160v-64a192 192 0 1 0-384 0v64h384zM512 64a256 256 0 0 1 256 256v128H256V320A256 256 0 0 1 512 64z"
                  ></path>
                </svg>
                <p>退出登录</p></el-card
              >
            </el-col>
          </el-row>

          <div id="chart" v-if="chartShow"></div>
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
    .main-container {
      height: 100%;
      padding: 0 10px;
      padding-top: 20px;
      background-color: #f7f7f7;
      svg {
        width: 30px;
        height: 30px;
      }
      #chart {
        width: 100%;
        height: 370px;
        margin-top: 30px;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        background: #fff;
      }
    }
  }
}
</style>
