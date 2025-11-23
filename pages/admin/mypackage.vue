<script setup>
import { Tickets, Menu, Refresh } from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()

// 时间戳转换函数
const formatTime = (timestamp) => {
  if (!timestamp) return '暂无'
  const date = new Date(Number(timestamp))
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

const loading = ref(false)
const apiList = ref([])
const selectedApi = ref(null)
const selectedType = ref(null)
const selectedStatus = ref(null)

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

// 获取我的套餐列表
const getData = async () => {
  loading.value = true
  try {
    const startTime = Date.now()
    const res = await $myFetch('UserPackageList')
    if (res.code === 200) {
      // 将套餐数据按照api_id分组
      const groupedData = {}
      if (!res.data || !Array.isArray(res.data)) {
        apiList.value = []
        const endTime = Date.now()
        const loadingTime = endTime - startTime
        if (loadingTime < 500) {
          await new Promise((resolve) => setTimeout(resolve, 500 - loadingTime))
        }
        loading.value = false
        return
      }

      res.data.forEach((pkg) => {
        if (!groupedData[pkg.api_id]) {
          groupedData[pkg.api_id] = {
            id: pkg.api_id || 0, // 确保id有值
            name: pkg.api_name || '未知接口', // 确保name有值
            packages: [],
          }
        }
        groupedData[pkg.api_id].packages.push(pkg)
      })
      apiList.value = Object.values(groupedData)

      // 确保最少显示500ms的loading状态
      const endTime = Date.now()
      const loadingTime = endTime - startTime
      if (loadingTime < 500) {
        await new Promise((resolve) => setTimeout(resolve, 500 - loadingTime))
      }
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('获取数据失败', 'error')
  }
  loading.value = false
}

// 搜索过滤
const packages = computed(() => {
  // 先按接口筛选
  let filteredByApi = apiList.value.reduce((acc, api) => {
    if (selectedApi.value && api.id !== selectedApi.value) {
      return acc
    }
    return acc.concat(api.packages)
  }, [])

  // 再按类型筛选
  if (selectedType.value) {
    filteredByApi = filteredByApi.filter(
      (pkg) => pkg.type === selectedType.value
    )
  }

  // 最后按状态筛选
  if (selectedStatus.value) {
    filteredByApi = filteredByApi.filter(
      (pkg) => pkg.status === selectedStatus.value
    )
  }

  return filteredByApi
})

// 获取类型文字
const getTypeText = (type) => {
  const types = {
    2: '包月计费',
    3: '点数包',
  }
  return types[type] || '未知'
}

// 获取类型标签样式
const getTypeTag = (type) => {
  const types = {
    2: 'success',
    3: 'primary',
  }
  return types[type] || ''
}

// 获取状态文字
const getStatusText = (status) => {
  const statuses = {
    1: '使用中',
    2: '已过期',
  }
  return statuses[status] || '未知'
}

// 获取状态标签样式
const getStatusTag = (status) => {
  const statuses = {
    1: 'success',
    2: 'danger',
  }
  return statuses[status] || ''
}

// 计算使用百分比
const getUsagePercentage = (pkg) => {
  if (pkg.status === 2) return 100 // 已过期状态显示100%
  if (pkg.type !== 3 || !pkg.points) return 0
  const percentage = (pkg.points_used / pkg.points) * 100
  return Math.round(percentage)
}

// 获取进度条状态
const getProgressStatus = (pkg) => {
  if (pkg.status === 2) return 'exception' // 已过期状态显示红色
  const percentage = getUsagePercentage(pkg)
  if (percentage >= 90) return 'exception'
  if (percentage >= 70) return 'warning'
  return 'success'
}

// 续费套餐
const handleRenew = (pkg) => {
  selectedPackage.value = {
    ...pkg,
    amount: Number(pkg.amount || 0), // 使用amount参数
  }
  renewalAmount.value = Number(pkg.amount || 0) // 使用amount参数
  dialogVisible.value = true
}

// 确认续费
const confirmRenew = async () => {
  try {
    const res = await $myFetch('RenewalPackage', {
      method: 'POST',
      body: new URLSearchParams({
        packageId: selectedPackage.value.id,
      }),
    })

    if (res.code === 200) {
      $msg(res.msg, 'success')
      dialogVisible.value = false
      await getData()
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('续费失败，请重试', 'error')
  }
}

const dialogVisible = ref(false)
const selectedPackage = ref(null)
const renewalAmount = ref(0)

onMounted(() => {
  getData()
})

useHead({
  title: '我的套餐',
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
      <div class="package_container">
        <div class="cont">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon"><Tickets /></el-icon>
              <span class="title">我的套餐</span>
            </div>
            <div class="header-right">
              <el-button
                type="primary"
                :icon="Refresh"
                circle
                @click="getData"
                :loading="loading"
              />
              <el-select
                v-model="selectedApi"
                placeholder="选择接口"
                clearable
                class="filter-select"
              >
                <el-option
                  v-for="api in apiList"
                  :key="api.id"
                  :label="api.name"
                  :value="api.id"
                />
              </el-select>
              <el-select
                v-model="selectedType"
                placeholder="套餐类型"
                clearable
                class="filter-select"
              >
                <el-option label="包月计费" :value="2" />
                <el-option label="点数包" :value="3" />
              </el-select>
              <el-select
                v-model="selectedStatus"
                placeholder="套餐状态"
                clearable
                class="filter-select"
              >
                <el-option label="使用中" :value="1" />
                <el-option label="已过期" :value="2" />
              </el-select>
            </div>
          </div>

          <!-- 套餐列表 -->
          <div class="package-list" v-loading="loading">
            <el-table
              v-if="packages.length > 0"
              :data="packages"
              style="width: 100%"
              border
            >
              <el-table-column
                prop="id"
                label="ID"
                width="100"
                align="center"
              />
              <el-table-column prop="name" label="套餐名称" min-width="280">
                <template #default="{ row }">
                  <div class="name-cell">
                    <div class="name-wrapper">
                      <span class="name">{{ row.name }}</span
                      ><br />
                      <div class="tags">
                        <el-tag
                          :type="getTypeTag(row.type)"
                          size="small"
                          effect="light"
                        >
                          {{ getTypeText(row.type) }}
                        </el-tag>
                        <el-tag type="info" size="small" effect="light">
                          {{ row.type === 3 ? '永久使用' : '不限次数' }}
                        </el-tag>
                        <el-tag
                          :type="getStatusTag(row.status)"
                          size="small"
                          effect="light"
                        >
                          {{ getStatusText(row.status) }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="api_name"
                label="API名称"
                min-width="150"
              />
              <el-table-column label="购买时间" min-width="160">
                <template #default="{ row }">
                  {{ formatTime(row.create_time) }}
                </template>
              </el-table-column>
              <el-table-column label="有效期" min-width="160">
                <template #default="{ row }">
                  {{
                    row.status === 2
                      ? '已过期'
                      : row.type === 3
                      ? '永久使用'
                      : formatTime(row.expire_time)
                  }}
                </template>
              </el-table-column>
              <el-table-column label="总点数" min-width="120">
                <template #default="{ row }">
                  <span v-if="row.type === 2">不限次数</span>
                  <span v-else>{{ row.points }}点</span>
                </template>
              </el-table-column>
              <el-table-column label="剩余点数" min-width="120">
                <template #default="{ row }">
                  <span v-if="row.type === 2">不限次数</span>
                  <span v-else>{{ row.points - row.points_used }}点</span>
                </template>
              </el-table-column>
              <el-table-column label="使用情况" min-width="200">
                <template #default="{ row }">
                  <div v-if="row.type === 3" class="progress-cell">
                    <el-progress
                      :percentage="getUsagePercentage(row)"
                      :status="getProgressStatus(row)"
                    />
                  </div>
                  <span v-else>不限制</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    link
                    :disabled="row.status === 2"
                    @click="handleRenew(row)"
                  >
                    续费套餐
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 暂无套餐时的空状态 -->
            <div v-else class="empty-state">
              <el-empty description="暂无套餐">
                <template #image>
                  <el-icon :size="60" class="empty-icon"><Tickets /></el-icon>
                </template>
                <template #default>
                  <el-button type="primary" @click="navigateTo('/admin/buy')">
                    立即购买
                  </el-button>
                </template>
              </el-empty>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 续费确认对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="续费套餐"
      width="500px"
      destroy-on-close
      :modal-append-to-body="false"
      append-to-body
      :close-on-click-modal="false"
      class="renew-dialog"
    >
      <div class="renew-content">
        <div class="info-section">
          <div class="info-row">
            <span class="label">套餐名称：</span>
            <span class="value">{{ selectedPackage.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">API名称：</span>
            <span class="value">{{ selectedPackage.api_name }}</span>
          </div>
          <div class="info-row">
            <span class="label">套餐类型：</span>
            <el-tag :type="getTypeTag(selectedPackage.type)" size="small">
              {{ getTypeText(selectedPackage.type) }}
            </el-tag>
          </div>
          <div class="info-row" v-if="selectedPackage.type === 2">
            <span class="label">当前到期时间：</span>
            <span class="value">{{
              formatTime(selectedPackage.expire_time)
            }}</span>
          </div>
          <div class="info-row" v-if="selectedPackage.type === 3">
            <span class="label">可使用点数：</span>
            <span class="value"
              >{{
                selectedPackage.points - selectedPackage.points_used
              }}点</span
            >
          </div>
          <div class="info-row">
            <span class="label">续费金额：</span>
            <span class="value price">¥{{ renewalAmount.toFixed(2) }}</span>
          </div>
        </div>
        <div class="tip-section">
          <el-alert title="续费说明" type="info" :closable="false" show-icon>
            <p v-if="selectedPackage.type === 2">
              续费后有效期将在原到期时间基础上延长
            </p>
            <p v-if="selectedPackage.type === 3">
              续费后点数将在原有点数基础上累加
            </p>
          </el-alert>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRenew">确认续费</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;

  .right {
    width: 100%;
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
    .package_container {
      min-height: 100vh;
      padding: 20px;
      background-color: #f7f7f7;

      .cont {
        width: 100%;
        height: 100%;
        padding: 24px;
        background: #fff;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
        border-radius: 12px;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;

          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;

            .icon {
              font-size: 24px;
              color: #3b82f6;
            }

            .title {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
            }
          }

          .header-right {
            display: flex;
            gap: 12px;
            align-items: center;

            .filter-select {
              width: 160px;
              :deep(.el-input__wrapper) {
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                border: 1px solid #e5e7eb;
                &:hover {
                  border-color: #3b82f6;
                }
                &.is-focus {
                  border-color: #3b82f6;
                  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }
              }
            }
          }
        }

        .package-list {
          :deep(.el-table) {
            border-radius: 8px;
            overflow: hidden;

            .el-table__header {
              background-color: #f5f7fa;
              th {
                background-color: #f5f7fa;
                color: #606266;
                font-weight: 500;
                padding: 12px 0;
              }
            }

            .el-table__row {
              td {
                padding: 16px;
              }
              .el-button {
                padding: 4px 0;
                font-size: 13px;
              }
            }
          }

          .name-cell {
            .name-wrapper {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 8px;

              .name {
                font-weight: 500;
                color: #303133;
                min-width: 120px;
              }

              .tags {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;

                :deep(.el-tag) {
                  white-space: nowrap;
                  border: none;
                  padding: 0 8px;
                  height: 22px;
                  line-height: 22px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: normal;
                }
              }
            }
          }

          .progress-cell {
            padding: 6px 0;
          }
        }

        .empty-state {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 0;

          :deep(.el-empty) {
            padding: 40px;
            background: #fff;
            border-radius: 12px;
            border: 1px solid #e5e7eb;

            .empty-icon {
              color: #909399;
              margin-bottom: 20px;
            }

            .el-empty__description {
              color: #606266;
              font-size: 14px;
              margin-bottom: 20px;
            }
          }
        }
      }
    }
  }
}

// 续费对话框样式
.renew-content {
  .info-section {
    background: #f8fafc;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;

    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 100px;
        color: #606266;
        font-size: 14px;
      }

      .value {
        color: #303133;
        font-size: 14px;
        font-weight: 500;
      }

      .price {
        color: #f56c6c;
        font-size: 20px;
        font-weight: 600;
      }
    }
  }

  .tip-section {
    :deep(.el-alert) {
      margin: 0;
      padding: 16px;
      border-radius: 8px;

      .el-alert__title {
        font-size: 14px;
        font-weight: 500;
      }

      p {
        color: #606266;
        font-size: 13px;
        margin: 8px 0 0;
        padding: 0;
        line-height: 1.6;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .container {
    .right {
      .package_container {
        padding: 16px;

        .cont {
          padding: 20px;

          .card-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;

            .header-right {
              width: 100%;
              flex-wrap: wrap;

              .filter-select {
                width: 100%;
              }
            }
          }
        }
      }
    }
  }
}
</style>
