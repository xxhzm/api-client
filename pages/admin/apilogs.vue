<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="apilogs-container" v-loading="loading">
        <client-only>
          <span style="color: #606266; margin-right: 10px; cursor: pointer"
            >请选择时间</span
          >
          <el-date-picker
            v-model="searchTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="起始时间"
            end-placeholder="结束时间"
            size="small"
            :editable="false"
            style="cursor: pointer"
            :disabled-date="disabledDate"
            value-format="x"
          />
          <el-input
            v-model="searchId"
            style="width: 240px; margin-left: 20px"
            placeholder="请输入请求ID"
            :prefix-icon="Search"
            size="small"
          />
          <el-pagination
            :page-size="100"
            :pager-count="5"
            :page-count="maxPage"
            v-model:current-page="page"
            :disabled="pageLoading"
            size="small"
            background
            layout="prev, pager, next"
            style="float: right; margin-right: 100px"
          />
          <div style="display: block; margin-top: 15px">
            <el-button type="primary" @click="handleSearch(1)">查询</el-button>
            <el-button type="primary" plain @click="handleReset"
              >重置</el-button
            >
          </div>

          <el-table
            :data="tableData"
            style="width: 100%; margin-top: 15px"
            height="96%"
            v-loading="pageLoading"
          >
            <el-table-column
              prop="id"
              label="请求ID"
              width="180"
              show-overflow-tooltip
            />
            <el-table-column prop="alias" label="接口名称" width="80" />
            <el-table-column prop="method" label="请求方法" width="100" />
            <el-table-column
              prop="path"
              label="请求路径"
              width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="response_time"
              label="响应时间"
              width="100"
            />
            <el-table-column prop="status_code" label="状态码" width="80" />
            <el-table-column prop="client_ip" label="IP" width="150" />
            <el-table-column prop="address" label="用户归属地" width="150" />
            <el-table-column prop="timestamp" label="请求时间" width="220" />
            <el-table-column
              prop="ua"
              label="ua"
              width="240"
              show-overflow-tooltip
            />
          </el-table>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()
const msg = $msg

// 当前页数
const page = ref(1)
// 总记录
const maxPage = ref(50)
// 页数loading
const pageLoading = ref(false)

// 监听页数变化
watch(
  () => page.value,
  async (newValue, oldValue) => {
    pageLoading.value = true

    if (searchTime.value === undefined) {
      await getData()
    } else {
      await handleSearch(newValue)
    }
    setTimeout(() => {
      pageLoading.value = false
    }, 300)
  }
)

const loading = ref(false)
const tableData = ref([])

const getData = async () => {
  const res = await $myFetch('ApiLogList', {
    params: {
      page: page.value,
      size: 100,
    },
  })

  if (res.code !== 200) {
    return
  }

  res.data.logs.forEach((element, key) => {
    res.data.logs[key].timestamp = new Date(element.timestamp).toLocaleString()
    // 提取URL中的信息
    const parts = res.data.logs[key].url.split(' ')
    res.data.logs[key].method = parts[0]

    const pathAndParams = parts[1].split('clientIP=')
    // 移除右侧字符串
    res.data.logs[key].path = pathAndParams[0].slice(0, -1)

    const uaArr = res.data.logs[key].url.split('=')
    res.data.logs[key].ua = uaArr[uaArr.length - 1]
  })

  tableData.value = res.data.logs
  maxPage.value = res.data.max_page_count
}

// 禁用时间
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

const handleSearchTime = async (sPage) => {
  if (searchTime.value === undefined) {
    $msg('请选择时间或输入ID进行查询', 'error')
    return false
  }

  const res = await $myFetch('ApiLogSearch', {
    params: {
      startTime: searchTime.value[0],
      endTime: searchTime.value[1],
      page: sPage,
      size: 100,
    },
  })

  if (res.code !== 200) {
    $msg(res.msg, 'warning')
    tableData.value = []
    maxPage.value = 1
    return false
  }

  res.data.logs.forEach((element, key) => {
    res.data.logs[key].timestamp = new Date(element.timestamp).toLocaleString()
    // 提取URL中的信息
    const parts = res.data.logs[key].url.split(' ')
    res.data.logs[key].method = parts[0]

    const pathAndParams = parts[1].split('clientIP=')
    // 移除右侧字符串
    res.data.logs[key].path = pathAndParams[0].slice(0, -1)

    const uaArr = res.data.logs[key].url.split('=')
    res.data.logs[key].ua = uaArr[uaArr.length - 1]
  })

  tableData.value = res.data.logs
  maxPage.value = res.data.max_page_count
  if (page.value != sPage) {
    page.value = sPage
  }
}

const handleSearchId = async () => {
  if (searchId.value.length != 24) {
    $msg('请输入正确的请求ID', 'warning')
    return false
  }
  const res = await $myFetch('ApiLogId', {
    params: {
      id: searchId.value,
    },
  })

  if (res.code !== 200) {
    $msg(res.msg, 'warning')
    tableData.value = []
    return false
  }

  res.data.timestamp = new Date(res.data.timestamp).toLocaleString()
  // 提取URL中的信息
  const parts = res.data.url.split(' ')
  res.data.method = parts[0]

  const pathAndParams = parts[1].split('clientIP=')
  // 移除右侧字符串
  res.data.path = pathAndParams[0].slice(0, -1)

  const uaArr = res.data.url.split('=')
  res.data.ua = uaArr[uaArr.length - 1]

  tableData.value = [res.data]
  maxPage.value = 1
}

const handleSearch = async (page) => {
  if (searchId.value == '') {
    handleSearchTime(page)
  } else {
    handleSearchId()
  }
}

onMounted(() => {
  getData()
})

const searchTime = ref()
const searchId = ref('')

const handleReset = () => {
  getData()
  searchTime.value = undefined
  searchId.value = ''
}
useHead({
  title: '接口日志',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<style lang="less" scoped>
.container {
  display: flex;
  .right {
    width: 100%;
    overflow-x: hidden;
    .apilogs-container {
      width: 100%;
      height: calc(100vh - 65px);
      padding-left: 20px;
      padding-top: 15px;
    }
  }
}
</style>
