<template>
  <div class="sysinfo">
    <el-row :gutter="12">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <SystemCard>
          <template v-slot:title>平台接口</template>
          <template v-slot:tag>接口</template>
          <template v-slot:content>
            <HelpersCount
              style="font-size: 18px"
              :end="systemInfo.total_api"
            ></HelpersCount>
          </template>
        </SystemCard>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <SystemCard>
          <template v-slot:title>24小时内总请求</template>
          <template v-slot:tag>24</template>
          <template v-slot:content>
            <HelpersCount style="font-size: 18px" :end="number"></HelpersCount>
          </template>
        </SystemCard>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <SystemCard>
          <template v-slot:title>请求总调用</template>
          <template v-slot:tag>总</template>
          <template v-slot:content>
            <HelpersCount
              style="font-size: 18px"
              :end="systemInfo.total_request_number"
            ></HelpersCount>
          </template>
        </SystemCard>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <SystemCard>
          <template v-slot:title>已稳定运营</template>
          <template v-slot:tag>天</template>
          <template v-slot:content>
            <HelpersCount
              style="font-size: 18px"
              :end="systemInfo.day"
            ></HelpersCount>
          </template>
        </SystemCard>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <SystemCard>
          <template v-slot:title>CPU使用率</template>
          <template v-slot:tag>CPU</template>
          <template v-slot:content>
            <span style="font-size: 18px">{{ systemInfo.cpu }}</span>
          </template>
        </SystemCard>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <SystemCard>
          <template v-slot:title>已用内存</template>
          <template v-slot:tag>已用</template>
          <template v-slot:content>
            <span style="font-size: 18px">{{ systemInfo.memory_used }}</span>
          </template>
        </SystemCard>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <SystemCard>
          <template v-slot:title>可用内存</template>
          <template v-slot:tag>可用</template>
          <template v-slot:content>
            <span style="font-size: 18px">{{
              systemInfo.memory_available
            }}</span>
          </template>
        </SystemCard>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <SystemCard>
          <template v-slot:title>已发送</template>
          <template v-slot:tag>总</template>
          <template v-slot:content>
            <span style="font-size: 18px">{{
              systemInfo.total_network_transmission
            }}</span>
          </template>
        </SystemCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
const { $myFetch } = useNuxtApp()

const systemInfo = ref({
  day: 0,
  total_api: 0,
  recent_request: [],
  total_request_number: 0,
  cpu: '0%',
  memory_used: '0MB',
  memory_available: '0MB',
  total_network_transmission: '0GB',
})

const recentRequest = ref({
  data: {
    xAxis: [],
    series: [],
  },
})

const number = ref(0)

const res = await $myFetch('SystemInfo')

systemInfo.value = res.data

// 24小时内请求
systemInfo.value.recent_request.forEach((element) => {
  recentRequest.value.data.xAxis.push(new Date(element.time).getHours() + '时')
  recentRequest.value.data.series.push(element.number)
  number.value += element.number
})

const recentRequestState = useState('recentRequest')
recentRequestState.value = recentRequest.value
</script>

<style lang="less">
.el-col {
  margin-top: 0.5rem;
}
</style>
