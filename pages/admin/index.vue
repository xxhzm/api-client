<script setup>
import * as echarts from 'echarts'
import axios from 'axios'

// const chartShow = ref(true)

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
  // chartShow.value = false
  // chartShow.value = true

  // const { data: res } = await axios.get('statistics/recentRequest?token=' + token.value)
  // recentRequest.value = res

  // const dom = document.getElementById('chart')

  // const myChart = echarts.init(dom)
  // let option

  // option = {
  //   tooltip: {
  //     trigger: "axis"
  //   },
  //   xAxis: {
  //     type: 'category',
  //     data: recentRequest.value.data.xAxis
  //   },
  //   yAxis: {
  //     type: 'value'
  //   },
  //   dataZoom: [{}],
  //   series: [
  //     {
  //       data: recentRequest.value.data.series,
  //       type: 'line',
  //       smooth: true
  //     }
  //   ]
  // }

  // option && myChart.setOption(option)
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
        <!-- <div class="info-container">
          <div class="info__box">
            <div class="info__box__left" style="background: #27ae60">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-person-lines-fill"
                viewBox="0 0 16 16"
              >
                <path
                  d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z"
                />
              </svg>
            </div>
            <div class="info__box__right">
              <h1 class="box__right__title">平台用户</h1>
              <p class="box__right__text">{{ totaluser.data }}人</p>
            </div>
          </div>
          <div class="info__box">
            <div class="info__box__left" style="background: #17a2b8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-person-lines-fill"
                viewBox="0 0 16 16"
              >
                <path
                  d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z"
                />
              </svg>
            </div>
            <div class="info__box__right">
              <h1 class="box__right__title">今日注册</h1>
              <p class="box__right__text">
                {{ todayRegisterUserTotal.data }}人
              </p>
            </div>
          </div>
          <div class="info__box">
            <div class="info__box__left" style="background: #ffc107">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-person-lines-fill"
                viewBox="0 0 16 16"
              >
                <path
                  d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z"
                />
              </svg>
            </div>
            <div class="info__box__right">
              <h1 class="box__right__title">平台接口</h1>
              <p class="box__right__text">{{ apiTotal.data }}个</p>
            </div>
          </div>
          <div class="info__box">
            <div class="info__box__left" style="background: #dc3545">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-person-lines-fill"
                viewBox="0 0 16 16"
              >
                <path
                  d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z"
                />
              </svg>
            </div>
            <div class="info__box__right">
              <h1 class="box__right__title">总调用</h1>
              <p class="box__right__text">{{ requestTotal.data }}次</p>
            </div>
          </div>
        </div> -->
        <!-- <div id="chart" v-if="chartShow"></div> -->
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
      // .info-container {
      // display: flex;
      // justify-content: space-between;
      // align-items: center;
      // .text {
      //   font-size: 14px;
      // }
      // .item {
      //   margin-bottom: 18px;
      // }
      // .box-card {
      //   width: 320px;
      //   margin: 0 5px;
      // }
      // display: flex;
      // justify-content: space-between;
      // margin-top: 20px;
      // .info__box {
      //   overflow: hidden;
      //   display: flex;
      //   flex: 0.21;
      //   height: 80px;
      //   border-radius: 9px;
      //   box-shadow: 0 1px 1px rgb(0 0 0 / 10%);
      //   .info__box__left {
      //     position: relative;
      //     flex: 0.6;
      //     height: 100%;
      //     svg {
      //       position: absolute;
      //       top: 50%;
      //       transform: translateY(-50%);
      //       width: 80px;
      //       height: 32px;
      //       color: #fff;
      //     }
      //   }
      //   .info__box__right {
      //     flex: 1.2;
      //     padding: 15px;
      //     background: #fff;
      //     color: #2a2a2a;
      //     text-align: center;
      //     .box__right__title {
      //       font-size: 1.1rem;
      //       font-weight: normal;
      //     }
      //     .box__right__text {
      //       font-size: 0.7rem;
      //       margin-top: 8px;
      //     }
      // }

      // #chart {
      //   width: 1200px;
      //   height: 370px;
      //   margin: 0 auto;
      //   margin-top: 100px;
      //   border-radius: 10px;
      //   box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
      //   background: #fff;
      // }
    }
  }
}
</style>
