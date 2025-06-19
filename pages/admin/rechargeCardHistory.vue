<script setup>
import { Wallet, Menu, Calendar } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()
const username = useCookie('username')

// 控制左侧边栏显示隐藏
// 获取页面宽度
const screenWidth = ref(0)
const isSidebarShow = ref(true)
const iscontrolShow = ref(false)
const isoverlay = ref(false)
onMounted(() => {
  screenWidth.value = document.body.clientWidth
  document.body.style.overflow = ''

  if (screenWidth.value < 768) {
    iscontrolShow.value = true
    isSidebarShow.value = false
  }
})

const handleSidebarShow = () => {
  isSidebarShow.value = !isSidebarShow.value
  iscontrolShow.value = !iscontrolShow.value
  isoverlay.value = !isoverlay.value
  // 禁止页面滑动
  if (isSidebarShow.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const totalPages = ref(1)
const totalRecords = ref(0)
const pageLoading = ref(false)

// 格式化时间戳为可读日期时间格式
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

// 获取充值卡使用历史记录
const getHistoryData = async () => {
  pageLoading.value = true
  try {
    const params = {
      page: page.value,
      username: username.value,
    }

    const res = await $myFetch('GetUserRechargeCardHistory', {
      params,
    })

    if (res.code !== 200) {
      $msg(res.msg || '获取数据失败', 'error')
      return
    }

    tableData.value = res.data.list || []
    totalPages.value = res.data.totalPages || 1
    totalRecords.value = res.data.count || 0
  } catch (error) {
    $msg('获取数据失败', 'error')
    console.error(error)
  } finally {
    pageLoading.value = false
  }
}

// 复制充值卡号
const copyCardCode = (code) => {
  navigator.clipboard
    .writeText(code)
    .then(() => {
      $msg('复制成功', 'success')
    })
    .catch(() => {
      $msg('复制失败，请手动复制', 'error')
    })
}

// 监听页数变化
watch(
  () => page.value,
  async () => {
    await getHistoryData()
  }
)

onMounted(() => {
  getHistoryData()
})

useHead({
  title: '充值卡使用记录',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
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
        <el-icon @click="handleSidebarShow"><Menu /></el-icon>
      </div>
      <AdminHeader></AdminHeader>
      <div class="history-container" v-loading="loading">
        <div class="card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Calendar />
              </el-icon>
              <span class="title">充值卡使用记录</span>
            </div>
          </div>

          <!-- 表格区域 -->
          <div class="card-content">
            <client-only>
              <el-table
                :data="tableData"
                style="width: 100%; margin-top: 15px"
                v-loading="pageLoading"
                border
              >
                <el-table-column prop="id" label="ID" width="70" />
                <el-table-column
                  prop="card_code"
                  label="充值卡号"
                  min-width="200"
                  show-overflow-tooltip
                >
                  <template #default="scope">
                    <div class="card-code-cell">
                      <span>{{ scope.row.card_code }}</span>
                      <el-button
                        type="primary"
                        link
                        size="small"
                        @click="copyCardCode(scope.row.card_code)"
                      >
                        复制
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="amount" label="金额" width="100">
                  <template #default="scope">
                    <span class="amount">¥{{ scope.row.amount }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="uid" label="用户ID" width="100" />
                <el-table-column prop="username" label="用户名" width="130" />
                <el-table-column label="使用时间" min-width="180">
                  <template #default="scope">
                    {{ formatTimestamp(scope.row.used_at) }}
                  </template>
                </el-table-column>
                <el-table-column label="创建时间" min-width="180">
                  <template #default="scope">
                    {{ formatTimestamp(scope.row.created_at) }}
                  </template>
                </el-table-column>
                <el-table-column label="过期时间" min-width="180">
                  <template #default="scope">
                    {{ formatTimestamp(scope.row.expired_at) }}
                  </template>
                </el-table-column>
                <el-table-column prop="is_used" label="状态" width="100">
                  <template #default="scope">
                    <el-tag type="success" size="small"> 已使用 </el-tag>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination">
                <el-pagination
                  :page-size="25"
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
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  background: #f5f7fa;

  .right {
    width: 100%;
    min-width: 0;
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
    .history-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .card {
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
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
          margin-bottom: 16px;

          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;

            .icon {
              font-size: 20px;
              color: #4b5563;
            }

            .title {
              font-size: 16px;
              font-weight: 600;
              color: #1a1f36;
            }
          }

          .header-right {
            .el-button {
              display: flex;
              align-items: center;
              gap: 6px;
            }
          }
        }

        .card-content {
          padding: 24px;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

          .filter-container {
            margin-bottom: 15px;
          }

          .card-code-cell {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .amount {
            color: #f56c6c;
            font-weight: 500;
          }

          .pagination {
            margin-top: 24px;
            display: flex;
            justify-content: flex-end;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container .right .history-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .history-container {
    padding: 12px;

    .card .card-content {
      padding: 16px;

      .filter-container {
        .el-button {
          margin-top: 10px;
        }
      }
    }
  }
}
</style>
