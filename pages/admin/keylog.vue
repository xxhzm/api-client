<script setup>
import { Key, Search } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

// 表格数据
const tableData = ref([])
const pageLoading = ref(false)

// 分页相关
const page = ref(1)
const pageSize = ref(20)
const totalRecords = ref(0)

// 搜索相关
const searchKey = ref('')
const isSearching = ref(false)

// 获取数据
const getData = async () => {
  pageLoading.value = true
  try {
    const res = await $myFetch('GetUserHistoryKey', {
      params: {
        page: page.value,
        page_size: pageSize.value,
      },
    })

    if (res.code === 200) {
      tableData.value = res.data.data
      totalRecords.value = res.data.total
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('获取数据失败', 'error')
  } finally {
    pageLoading.value = false
  }
}

// 搜索数据
const searchData = async () => {
  if (!searchKey.value) {
    isSearching.value = false
    await getData()
    return
  }

  pageLoading.value = true
  try {
    const res = await $myFetch('SearchHistoryKey', {
      params: {
        access_key: searchKey.value,
      },
    })

    if (res.code === 200) {
      tableData.value = res.data
      totalRecords.value = res.data.length
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('搜索失败', 'error')
  } finally {
    pageLoading.value = false
  }
}

// 处理搜索
const handleSearch = async () => {
  page.value = 1
  isSearching.value = true
  await searchData()
}

// 监听页数变化
watch(
  () => page.value,
  async () => {
    if (isSearching.value) {
      await searchData()
    } else {
      await getData()
    }
  },
)

// 监听搜索框清空
watch(
  () => searchKey.value,
  (newValue) => {
    if (!newValue && isSearching.value) {
      isSearching.value = false
      getData()
    }
  },
)

// 格式化时间戳
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(Number(timestamp))
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  getData()
})

useHead({
  title: '秘钥历史记录',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="keylog-container">
    <div class="cont">
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon">
            <Key />
          </el-icon>
          <span class="title">秘钥历史记录</span>
        </div>
        <div class="header-right">
          <el-input
            v-model="searchKey"
            placeholder="请输入 Access Key"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon>
                  <Search />
                </el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <client-only>
          <el-table
            :data="tableData"
            style="width: 100%"
            v-loading="pageLoading"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column
              prop="access_key"
              label="Access Key"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              prop="appid"
              label="AppID"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column prop="update_time" label="更新时间" width="180">
              <template #default="scope">
                {{ formatTimestamp(scope.row.update_time) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              :page-size="pageSize"
              :pager-count="5"
              :total="totalRecords"
              v-model:current-page="page"
              :disabled="pageLoading"
              background
              layout="total, prev, pager, next, jumper"
            />
          </div>
        </client-only>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.keylog-container {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;

  .cont {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    padding: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #edf1f7;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .icon {
          font-size: 20px;
          color: #4096ff;
        }

        .title {
          font-size: 16px;
          font-weight: 600;
          color: #2e3033;
        }
      }

      .header-right {
        .search-input {
          width: 300px;
        }
      }
    }

    .table-container {
      .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .keylog-container {
    padding: 10px;

    .cont {
      padding: 15px;

      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;

        .header-right {
          width: 100%;
          .search-input {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
