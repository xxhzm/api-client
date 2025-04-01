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
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon"><ShoppingCart /></el-icon>
              <span class="title">套餐购买</span>
              <el-tooltip content="1点数等于1请求次数" placement="top">
                <el-icon class="info-icon"><InfoFilled /></el-icon>
              </el-tooltip>
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
              <el-input
                v-model="searchKeyword"
                placeholder="搜索接口或套餐名称"
                clearable
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
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
                  <el-tag :type="getTypeTag(pkg.type)">
                    {{ getTypeText(pkg.type) }}
                  </el-tag>
                </div>

                <div class="card-content">
                  <div class="price-section">
                    <div class="price">
                      <span class="currency">¥</span>{{ pkg.price }}
                    </div>
                  </div>

                  <div class="info-list">
                    <div class="info-item api-name">
                      <span class="label">API名称</span>
                      <span class="value">{{ pkg.api_name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">调用次数</span>
                      <span class="value">{{
                        pkg.type === 2 ? '不限次数' : `${pkg.points}点`
                      }}</span>
                    </div>
                    <div class="info-item" v-if="pkg.type === 3">
                      <span class="label">有效期</span>
                      <span class="value">永久使用</span>
                    </div>
                    <div class="info-item" v-if="pkg.type === 2">
                      <span class="label">有效期</span>
                      <span class="value">{{ pkg.duration }}天</span>
                    </div>
                    <div class="info-item">
                      <span class="label">描述</span>
                      <span class="value">{{
                        pkg.description || '暂无描述'
                      }}</span>
                    </div>
                  </div>
                </div>

                <div class="card-footer">
                  <el-button
                    type="primary"
                    @click="handleBuy(pkg)"
                    :loading="pkg.id === buyingId"
                  >
                    立即购买
                  </el-button>
                </div>
              </el-card>
            </div>
            <!-- 暂无套餐时的空状态 -->
            <div v-else class="empty-state">
              <el-empty description="暂无套餐">
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

<script setup>
import { Search, Menu, InfoFilled, ShoppingCart } from '@element-plus/icons-vue'

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
const packages = computed(() => {
  // 先按接口筛选
  let filteredByApi = apiList.value.reduce((acc, api) => {
    if (selectedApi.value && api.id !== selectedApi.value) {
      return acc
    }
    return acc.concat(api.packages)
  }, [])

  // 再按类型筛选
  let filteredByType = filteredByApi
  if (selectedType.value) {
    filteredByType = filteredByApi.filter(
      (pkg) => pkg.type === selectedType.value
    )
  }

  // 最后按关键字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    return filteredByType.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(keyword) ||
        pkg.api_name.toLowerCase().includes(keyword)
    )
  }

  return filteredByType
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

            .info-icon {
              font-size: 16px;
              color: #909399;
              cursor: help;
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

            .search-input {
              width: 320px;
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
              }
            }
          }

          .package-cards {
            display: grid;
            grid-template-columns: repeat(4, 360px);
            gap: 40px;
            width: 100%;
            margin: 0 -24px;
            padding: 0 24px;
            justify-content: space-between;

            .package-card {
              width: 100%;
              transition: all 0.3s ease;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              background: #fff;
              display: flex;
              flex-direction: column;
              cursor: pointer;

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
              }

              .card-header {
                background: #fff;
                padding: 16px;
                border-bottom: 1px solid #e5e7eb;
                text-align: center;
                margin-bottom: 0;

                h3 {
                  margin: 0;
                  font-size: 16px;
                  color: #333;
                  font-weight: 600;
                }

                .el-tag {
                  margin-top: 8px;
                  padding: 2px 12px;
                  font-size: 12px;
                  border-radius: 4px;
                  font-weight: 500;
                }
              }

              .card-content {
                padding: 16px;
                background: #fff;
                display: flex;
                flex-direction: column;
                gap: 12px;
                flex: 1;
                min-height: 260px;

                .price-section {
                  text-align: center;
                  padding: 12px;
                  background: #f9fafb;
                  border-radius: 6px;

                  .price {
                    font-size: 24px;
                    font-weight: 600;
                    color: #f56c6c;
                    line-height: 1;

                    .currency {
                      font-size: 14px;
                      margin-right: 4px;
                    }
                  }
                }

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

          .card-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;

            .header-right {
              width: 100%;

              .filter-select,
              .search-input {
                width: 100%;
              }
            }
          }

          .package-list {
            .package-cards {
              grid-template-columns: 1fr;
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1600px) {
  .package-cards {
    grid-template-columns: repeat(3, 360px) !important;
  }
}

@media screen and (max-width: 1200px) {
  .package-cards {
    grid-template-columns: repeat(2, 360px) !important;
    gap: 32px !important;
  }
}

@media screen and (max-width: 768px) {
  .package-cards {
    grid-template-columns: 360px !important;
    gap: 24px !important;
    justify-content: center;
  }
}

.info-icon {
  font-size: 14px;
  color: #909399;
  margin-left: 4px;
  cursor: help;
}
</style>
