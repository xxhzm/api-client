<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
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
            <!-- 套餐卡片列表 -->
            <div v-if="packages.length > 0" class="package-cards">
              <el-card
                v-for="pkg in packages"
                :key="pkg.id"
                class="package-card"
                :body-style="{ padding: '0px' }"
              >
                <div class="card-header">
                  <h3>{{ pkg.name }}</h3>
                  <div class="tag-group">
                    <el-tag :type="getTypeTag(pkg.type)">
                      {{ getTypeText(pkg.type) }}
                    </el-tag>
                    <el-tag :type="getStatusTag(pkg.status)">
                      {{ getStatusText(pkg.status) }}
                    </el-tag>
                  </div>
                </div>

                <div class="card-content">
                  <div class="info-list">
                    <div class="info-item api-name">
                      <span class="label">API名称</span>
                      <span class="value">{{ pkg.api_name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">购买时间</span>
                      <span class="value">{{
                        formatTime(pkg.create_time)
                      }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">到期时间</span>
                      <span class="value">{{
                        formatTime(pkg.expire_time)
                      }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">剩余点数</span>
                      <span class="value">{{
                        pkg.type === 2
                          ? '不限制'
                          : `${pkg.points - pkg.points_used}点`
                      }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">使用情况</span>
                      <div class="progress-wrapper" v-if="pkg.type === 3">
                        <el-progress
                          :percentage="getUsagePercentage(pkg)"
                          :status="getProgressStatus(pkg)"
                        />
                      </div>
                      <span v-else class="value">不限制</span>
                    </div>
                  </div>
                </div>

                <div class="card-footer">
                  <el-button
                    type="primary"
                    @click="handleRenew(pkg)"
                    :disabled="pkg.status === 2"
                  >
                    续费套餐
                  </el-button>
                </div>
              </el-card>
            </div>
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
  </div>
</template>

<script setup>
import { Tickets, Search } from '@element-plus/icons-vue'

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

// 获取我的套餐列表
const getData = async () => {
  loading.value = true
  try {
    const res = await $myFetch('UserPackageList')
    if (res.code === 200) {
      // 将套餐数据按照api_id分组
      const groupedData = {}
      res.data.forEach((pkg) => {
        if (!groupedData[pkg.api_id]) {
          groupedData[pkg.api_id] = {
            id: pkg.api_id,
            name: pkg.api_name,
            packages: [],
          }
        }
        groupedData[pkg.api_id].packages.push(pkg)
      })
      apiList.value = Object.values(groupedData)
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
  if (pkg.type !== 3 || !pkg.points) return 0
  const percentage = (pkg.points_used / pkg.points) * 100
  return Math.round(percentage)
}

// 获取进度条状态
const getProgressStatus = (pkg) => {
  const percentage = getUsagePercentage(pkg)
  if (percentage >= 90) return 'exception'
  if (percentage >= 70) return 'warning'
  return 'success'
}

// 续费套餐
const handleRenew = (pkg) => {
  navigateTo('/admin/buy')
}

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

<style lang="less" scoped>
.container {
  display: flex;

  .right {
    width: 100%;

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
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 24px;
          min-height: 400px;

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

          .package-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            width: 100%;

            .package-card {
              width: 100%;
              transition: all 0.3s ease;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              background: #fff;
              display: flex;
              flex-direction: column;

              .card-header {
                background: #fff;
                padding: 16px;
                border-bottom: 1px solid #e5e7eb;
                text-align: center;
                margin-bottom: 0;

                h3 {
                  margin: 0 0 12px;
                  font-size: 16px;
                  color: #333;
                  font-weight: 600;
                }

                .tag-group {
                  display: flex;
                  gap: 8px;
                  justify-content: center;

                  .el-tag {
                    padding: 2px 12px;
                    font-size: 12px;
                    border-radius: 4px;
                    font-weight: 500;
                  }
                }
              }

              .card-content {
                padding: 16px;
                background: #fff;
                display: flex;
                flex-direction: column;
                gap: 12px;
                flex: 1;

                .info-list {
                  display: flex;
                  flex-direction: column;
                  gap: 10px;
                  flex: 1;

                  .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 10px;
                    background: #f9fafb;
                    border-radius: 6px;
                    font-size: 13px;

                    .label {
                      color: #666;
                      font-size: 12px;
                    }

                    .value {
                      color: #333;
                      font-weight: 500;
                      font-size: 14px;
                      word-break: break-all;
                    }

                    &.api-name {
                      background: #f5f7fa;

                      .label {
                        color: #666;
                      }

                      .value {
                        color: #409eff;
                      }
                    }

                    .progress-wrapper {
                      padding: 8px 0 4px;
                    }
                  }
                }
              }

              .card-footer {
                padding: 14px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                background: #fff;
                margin-top: auto;

                .el-button {
                  width: 90%;
                  padding: 8px 12px;
                  font-size: 14px;
                  font-weight: 500;
                  border-radius: 4px;

                  &:hover {
                    transform: translateY(-1px);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1400px) {
  .package-cards {
    grid-template-columns: repeat(2, 1fr) !important;
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

          .package-list {
            .package-cards {
              grid-template-columns: 1fr !important;
            }
          }
        }
      }
    }
  }
}
</style>
