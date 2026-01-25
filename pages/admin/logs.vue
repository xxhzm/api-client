<script setup>
import { Search, Refresh, Document } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const { $msg, $myFetch } = useNuxtApp()

onMounted(() => {
  getData()
})

const activeTab = ref('sms')
const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 搜索条件
const searchForm = ref({
  keyword: '',
  dateRange: [],
})

// 监听 Tab 切换
watch(activeTab, () => {
  page.value = 1
  tableData.value = []
  getData()
})

// 监听分页
watch([page, pageSize], () => {
  getData()
})

const getData = async () => {
  loading.value = true

  let startTime = undefined
  let endTime = undefined

  if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
    startTime = new Date(searchForm.value.dateRange[0] + ' 00:00:00').getTime()
    endTime = new Date(searchForm.value.dateRange[1] + ' 23:59:59').getTime()
  }

  const commonParams = {
    page: page.value,
    size: pageSize.value,
    keyword: searchForm.value.keyword,
    startTime,
    endTime,
  }

  try {
    if (activeTab.value === 'sms') {
      const res = await $myFetch('SmsLogs', {
        params: commonParams,
      })

      if (res.code === 200) {
        tableData.value = res.data.sms_logs.map((item) => ({
          ...item,
          status: item.status ? '成功' : '失败',
          createTime: new Date(item.time).toLocaleString(),
        }))
        total.value = res.data.total_count
      }
    } else if (activeTab.value === 'email') {
      const res = await $myFetch('EmailLogs', {
        params: commonParams,
      })

      if (res.code === 200) {
        tableData.value = res.data.email_logs.map((item) => ({
          ...item,
          status: item.status ? '成功' : '失败',
          createTime: new Date(item.time).toLocaleString(),
        }))
        total.value = res.data.total_count
      }
    } else if (activeTab.value === 'action') {
      const res = await $myFetch('ActionLogs', {
        params: commonParams,
      })

      if (res.code === 200) {
        tableData.value = res.data.action_logs.map((item) => ({
          ...item,
          createTime: new Date(item.time).toLocaleString(),
        }))
        total.value = res.data.total_count
      }
    }
  } catch (e) {
    console.error(e)
    $msg('获取数据失败', 'error')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  getData()
}

const resetSearch = () => {
  searchForm.value = { keyword: '', dateRange: [] }
  handleSearch()
}

useHead({
  title: '综合日志',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="logs-container">
    <div class="logs-card">
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon">
            <Document />
          </el-icon>
          <span class="title">综合日志</span>
        </div>
      </div>

      <div class="card-body">
        <el-tabs v-model="activeTab" class="demo-tabs">
          <el-tab-pane label="短信验证码记录" name="sms"></el-tab-pane>
          <el-tab-pane label="邮箱验证码记录" name="email"></el-tab-pane>
          <el-tab-pane label="用户操作记录" name="action"></el-tab-pane>
        </el-tabs>

        <div class="filter-container">
          <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="手机号/邮箱/用户名"
                clearable
              />
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch"
                >查询</el-button
              >
              <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="table-wrapper" v-loading="loading">
          <!-- 短信记录表格 -->
          <div v-if="activeTab === 'sms'">
            <el-table :data="tableData" border style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="phone" label="手机号" width="150" />
              <el-table-column prop="code" label="验证码" width="100" />
              <el-table-column prop="type" label="类型" width="120" />
              <el-table-column prop="status" label="发送状态">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.status === '成功' ? 'success' : 'danger'"
                  >
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="ip" label="IP地址" width="150" />
              <el-table-column prop="createTime" label="发送时间" />
            </el-table>
          </div>

          <!-- 邮箱记录表格 -->
          <div v-if="activeTab === 'email'">
            <el-table :data="tableData" border style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="email" label="邮箱地址" width="200" />
              <el-table-column prop="type" label="类型" width="120" />
              <el-table-column prop="status" label="发送状态">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.status === '成功' ? 'success' : 'danger'"
                  >
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="ip" label="IP地址" width="150" />
              <el-table-column prop="createTime" label="发送时间" />
            </el-table>
          </div>

          <!-- 操作记录表格 -->
          <div v-if="activeTab === 'action'">
            <el-table :data="tableData" border style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="操作用户" width="150" />
              <el-table-column prop="action" label="操作类型" width="150" />
              <el-table-column prop="description" label="操作描述" />
              <el-table-column prop="ip" label="IP地址" width="150" />
              <el-table-column prop="browser" label="浏览器/设备" width="180" />
              <el-table-column prop="createTime" label="操作时间" width="180" />
            </el-table>
          </div>
        </div>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.logs-container {
  position: relative;
  padding: 24px;
  display: flex;
  justify-content: center;

  .logs-card {
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
      border-radius: 12px 12px 0 0;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .icon {
          font-size: 18px;
          color: #409eff;
        }

        .title {
          font-size: 16px;
          font-weight: 600;
          color: #101828;
        }
      }
    }

    .card-body {
      background: #fff;
      padding: 24px;
      border: 1px solid #eaecf0;
      border-top: none;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

      .filter-container {
        margin: 20px 0;
      }

      .pagination-container {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
