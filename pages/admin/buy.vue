<script setup>
import {
  Search,
  Menu,
  InfoFilled,
  ShoppingCart,
  Check,
} from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()

const loading = ref(false)
const searchKeyword = ref('')
const apiList = ref([])
const buyingId = ref(null)
const dialogVisible = ref(false)
const confirmLoading = ref(false)
const selectedPackage = ref({})
const selectedType = ref(null)
const selectedApi = ref(null)

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

// 获取所有接口及其套餐信息
const getData = async () => {
  loading.value = true
  try {
    const res = await $myFetch('ApiPackageList')
    if (res.code === 200) {
      // 将套餐数据按照api_id分组
      const groupedData = {}
      res.data.forEach((pkg) => {
        if (!groupedData[pkg.api_id]) {
          groupedData[pkg.api_id] = {
            id: pkg.api_id,
            name: pkg.api_name,
            description: pkg.description,
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
const displayList = computed(() => {
  // 1. 先根据 API 筛选
  let apis = apiList.value
  if (selectedApi.value) {
    apis = apis.filter((api) => api.id === selectedApi.value)
  }

  // 2. 处理每个 API 下的套餐
  const result = apis
    .map((api) => {
      let pkgs = api.packages

      // 按类型筛选
      if (selectedType.value) {
        pkgs = pkgs.filter((pkg) => pkg.type === selectedType.value)
      }

      // 按关键字筛选
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        const apiNameMatch = api.name.toLowerCase().includes(keyword)
        if (!apiNameMatch) {
          // 如果 API 名字不匹配，则只保留名字匹配的套餐
          pkgs = pkgs.filter((pkg) => pkg.name.toLowerCase().includes(keyword))
        }
        // 如果 API 名字匹配，则保留所有套餐（已经经过类型筛选）
      }

      return {
        ...api,
        packages: pkgs,
      }
    })
    .filter((api) => api.packages.length > 0) // 只显示有套餐的 API

  return result
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

// 点击购买按钮
const handleBuy = (pkg) => {
  selectedPackage.value = pkg
  dialogVisible.value = true
}

// 确认购买
const confirmBuy = async () => {
  confirmLoading.value = true
  buyingId.value = selectedPackage.value.id

  try {
    const res = await $myFetch('BuyPackage', {
      method: 'POST',
      body: new URLSearchParams({
        packageId: selectedPackage.value.id,
      }),
    })

    if (res.code === 200) {
      $msg(res.data, 'success')
      dialogVisible.value = false
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('购买失败，请重试', 'error')
  }

  confirmLoading.value = false
  buyingId.value = null
}

onMounted(() => {
  getData()
})

useHead({
  title: '购买套餐',
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
      <div class="buy_container">
        <div class="cont">
          <!-- 顶部标题栏 -->
          <div class="page-header">
            <div class="header-content">
              <div class="title-row">
                <div class="icon-wrapper">
                  <el-icon><ShoppingCart /></el-icon>
                </div>
                <h1 class="page-title">套餐选购</h1>
              </div>
              <p class="page-subtitle">
                选择适合您的 API 套餐，支持包月订阅与按量计费
                <el-tooltip content="1点数等于1请求次数" placement="top">
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </p>
            </div>
          </div>

          <!-- 筛选工具栏 -->
          <div class="filter-toolbar">
            <div class="filter-main">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索接口名称或套餐..."
                clearable
                class="search-input-large"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <div class="filter-actions">
              <!-- 快速分类切换 -->
              <div class="type-toggles">
                <div
                  class="type-toggle-item"
                  :class="{ active: !selectedType }"
                  @click="selectedType = null"
                >
                  全部
                </div>
                <div
                  class="type-toggle-item"
                  :class="{ active: selectedType === 2 }"
                  @click="selectedType = 2"
                >
                  包月计费
                </div>
                <div
                  class="type-toggle-item"
                  :class="{ active: selectedType === 3 }"
                  @click="selectedType = 3"
                >
                  点数包
                </div>
              </div>

              <el-select
                v-model="selectedApi"
                placeholder="全部接口"
                clearable
                class="api-select"
                filterable
              >
                <template #prefix>
                  <el-icon><Menu /></el-icon>
                </template>
                <el-option
                  v-for="api in apiList"
                  :key="api.id"
                  :label="api.name"
                  :value="api.id"
                />
              </el-select>
            </div>
          </div>

          <!-- 套餐列表 -->
          <div class="package-container" v-loading="loading">
            <div v-if="displayList.length > 0">
              <div v-for="api in displayList" :key="api.id" class="api-section">
                <div class="api-title-bar">
                  <div class="bar-left">
                    <h2 class="api-name">{{ api.name }}</h2>
                    <span class="api-desc">{{
                      api.description || '暂无描述'
                    }}</span>
                  </div>
                </div>

                <div class="package-grid">
                  <div
                    v-for="pkg in api.packages"
                    :key="pkg.id"
                    class="pricing-card"
                    :class="{ 'is-popular': pkg.type === 2 }"
                  >
                    <div class="card-top">
                      <div class="pkg-type">
                        <span
                          class="badge"
                          :class="pkg.type === 2 ? 'monthly' : 'points'"
                        >
                          {{ getTypeText(pkg.type) }}
                        </span>
                      </div>
                      <h3 class="pkg-name">{{ pkg.name }}</h3>
                      <div class="pkg-price">
                        <span class="currency">¥</span>
                        <span class="amount">{{ pkg.price }}</span>
                        <span class="unit" v-if="pkg.type === 2">/月</span>
                      </div>
                      <p class="pkg-sub">
                        {{ pkg.description || '适合大多数开发者使用' }}
                      </p>
                    </div>

                    <div class="card-features">
                      <div class="feature-item">
                        <el-icon class="check-icon"><Check /></el-icon>
                        <span
                          >调用次数:
                          <b>{{
                            pkg.type === 2 ? '不限次数' : `${pkg.points}次`
                          }}</b></span
                        >
                      </div>
                      <div class="feature-item">
                        <el-icon class="check-icon"><Check /></el-icon>
                        <span
                          >有效期:
                          <b>{{
                            pkg.type === 2 ? `${pkg.duration}天` : '永久有效'
                          }}</b></span
                        >
                      </div>
                      <div class="feature-item">
                        <el-icon class="check-icon"><Check /></el-icon>
                        <span>API: {{ api.name }}</span>
                      </div>
                      <div class="feature-item">
                        <el-icon class="check-icon"><Check /></el-icon>
                        <span>如果接口不可用，请联系客服</span>
                      </div>
                    </div>

                    <div class="card-action">
                      <el-button
                        class="buy-btn"
                        :type="pkg.type === 2 ? 'primary' : 'default'"
                        :class="{ 'is-outline': pkg.type !== 2 }"
                        @click="handleBuy(pkg)"
                        :loading="pkg.id === buyingId"
                      >
                        立即购买
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 暂无套餐时的空状态 -->
            <div v-else class="empty-state">
              <el-empty description="暂无符合条件的套餐">
                <template #image>
                  <el-icon :size="60" class="empty-icon"
                    ><ShoppingCart
                  /></el-icon>
                </template>
              </el-empty>
            </div>
          </div>
        </div>
      </div>

      <!-- 购买确认对话框 -->
      <el-dialog
        v-model="dialogVisible"
        title="确认购买"
        width="400px"
        destroy-on-close
      >
        <div class="confirm-content">
          <p>您确定要购买以下套餐吗？</p>
          <div class="confirm-info">
            <div class="info-row">
              <span class="label">套餐名称：</span>
              <span>{{ selectedPackage.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">接口名称：</span>
              <span>{{ selectedPackage.api_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">套餐类型：</span>
              <el-tag :type="getTypeTag(selectedPackage.type)" size="small">
                {{ getTypeText(selectedPackage.type) }}
              </el-tag>
            </div>
            <div class="info-row">
              <span class="label">价格：</span>
              <span class="confirm-price">¥{{ selectedPackage.price }}</span>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              @click="confirmBuy"
              :loading="confirmLoading"
            >
              确认购买
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
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
    .buy_container {
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

        .page-header {
          margin-bottom: 32px;
          text-align: center;

          .header-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;

            .title-row {
              display: flex;
              align-items: center;
              gap: 12px;

              .icon-wrapper {
                width: 40px;
                height: 40px;
                border-radius: 12px;
                background: #eff6ff;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #3b82f6;
                font-size: 20px;
              }

              .page-title {
                font-size: 24px;
                font-weight: 700;
                color: #111827;
                margin: 0;
              }
            }

            .page-subtitle {
              color: #6b7280;
              font-size: 14px;
              margin: 0;
              display: flex;
              align-items: center;
              gap: 6px;

              .info-icon {
                color: #9ca3af;
                cursor: help;
                font-size: 14px;
                &:hover {
                  color: #3b82f6;
                }
              }
            }
          }
        }

        .filter-toolbar {
          background: #f8fafc;
          border-radius: 12px;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          border: 1px solid #e5e7eb;
          gap: 16px;

          .filter-main {
            flex: 1;
            max-width: 400px;

            .search-input-large {
              :deep(.el-input__wrapper) {
                box-shadow: none;
                background: transparent;
                padding-left: 8px;

                &.is-focus {
                  box-shadow: none;
                }
              }

              :deep(.el-input__inner) {
                font-size: 15px;
                color: #1f2937;
              }

              :deep(.el-input__prefix) {
                color: #9ca3af;
                font-size: 18px;
              }
            }
          }

          .filter-actions {
            display: flex;
            align-items: center;
            gap: 16px;

            .type-toggles {
              display: flex;
              background: #fff;
              padding: 4px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;

              .type-toggle-item {
                padding: 6px 16px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                color: #6b7280;
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                  color: #1f2937;
                }

                &.active {
                  background: #eff6ff;
                  color: #3b82f6;
                  font-weight: 600;
                }
              }
            }

            .api-select {
              width: 200px;

              :deep(.el-input__wrapper) {
                background: #fff;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                border: 1px solid #e5e7eb;
                border-radius: 8px;

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

        .package-container {
          min-height: 400px;
          padding: 20px 0;

          .api-section {
            margin-bottom: 48px;

            .api-title-bar {
              margin-bottom: 24px;
              padding-bottom: 12px;
              border-bottom: 1px dashed #e5e7eb;

              .api-name {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 8px 0;
              }

              .api-desc {
                color: #6b7280;
                font-size: 14px;
              }
            }

            .package-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
              gap: 24px;
              justify-items: center;
            }
          }

          .pricing-card {
            width: 100%;
            max-width: 320px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;

            &:hover {
              transform: translateY(-4px);
              box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
              border-color: #3b82f6;
            }

            &.is-popular {
              border-color: #3b82f6;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);

              .card-top {
                .pkg-type {
                  .badge {
                    background: #eff6ff;
                    color: #3b82f6;
                  }
                }
              }
            }

            .card-top {
              text-align: center;
              margin-bottom: 24px;

              .pkg-type {
                margin-bottom: 12px;
                .badge {
                  display: inline-block;
                  padding: 4px 12px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 600;
                  background: #f3f4f6;
                  color: #4b5563;

                  &.monthly {
                    background: #ecfdf5;
                    color: #059669;
                  }
                  &.points {
                    background: #eff6ff;
                    color: #2563eb;
                  }
                }
              }

              .pkg-name {
                font-size: 18px;
                font-weight: 700;
                color: #111827;
                margin: 0 0 16px 0;
              }

              .pkg-price {
                display: flex;
                align-items: baseline;
                justify-content: center;
                color: #111827;
                margin-bottom: 8px;

                .currency {
                  font-size: 20px;
                  font-weight: 600;
                  margin-right: 2px;
                }

                .amount {
                  font-size: 42px;
                  font-weight: 800;
                  line-height: 1;
                }

                .unit {
                  font-size: 14px;
                  color: #6b7280;
                  margin-left: 4px;
                }
              }

              .pkg-sub {
                font-size: 13px;
                color: #6b7280;
                margin: 0;
                min-height: 20px;
              }
            }

            .card-features {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 12px;
              margin-bottom: 24px;

              .feature-item {
                display: flex;
                align-items: center;
                font-size: 14px;
                color: #4b5563;

                .check-icon {
                  color: #10b981;
                  margin-right: 8px;
                  flex-shrink: 0;
                }

                b {
                  color: #111827;
                  margin-left: 4px;
                }
              }
            }

            .card-action {
              .buy-btn {
                width: 100%;
                height: 44px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 15px;

                &.is-outline {
                  border-color: #e5e7eb;
                  color: #374151;

                  &:hover {
                    border-color: #3b82f6;
                    color: #3b82f6;
                    background: #eff6ff;
                  }
                }
              }
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
              }
            }
          }
        }
      }
    }
  }
}

// 确认对话框样式
:deep(.el-dialog) {
  margin-top: 30vh !important;
}

.confirm-content {
  .confirm-info {
    background: #f8fafc;
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
    border: 1px solid #e5e7eb;

    .info-row {
      display: flex;
      margin-bottom: 16px;
      align-items: center;
      padding: 8px 0;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #4b5563;
        width: 90px;
        font-weight: 500;
      }

      .confirm-price {
        color: #f56c6c;
        font-weight: 600;
        font-size: 18px;
      }

      .el-tag {
        padding: 4px 12px;
        font-weight: 500;
        border-radius: 6px;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .container {
    .right {
      .buy_container {
        padding: 16px;

        .cont {
          padding: 20px;

          .filter-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            padding: 12px;

            .filter-main {
              max-width: 100%;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 12px;
            }

            .filter-actions {
              flex-direction: column;
              align-items: stretch;

              .type-toggles {
                display: flex;
                justify-content: space-between;

                .type-toggle-item {
                  flex: 1;
                  text-align: center;
                }
              }

              .api-select {
                width: 100%;
              }
            }
          }

          .package-container {
            .package-grid {
              grid-template-columns: 1fr;
            }
          }
        }
      }
    }
  }
}

.info-icon {
  font-size: 14px;
  color: #909399;
  margin-left: 4px;
  cursor: help;
}
</style>
