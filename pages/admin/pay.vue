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
      <div class="pay_container">
        <div class="cont">
          <div class="form">
            <!-- 提示信息卡片 -->
            <el-card class="tips-card">
              <div class="tips-info">
                <ul>
                  <li>充值最小金额 1 元，充值金额必须为整数</li>
                  <li>支付过程中如遇到各种问题，请及时联系客服处理</li>
                </ul>
              </div>
            </el-card>

            <!-- 余额卡片 -->
            <el-card class="balance-card">
              <div class="section-title">
                <el-icon><InfoFilled /></el-icon>
                可用余额
              </div>
              <div class="balance-amount">
                <span class="amount">{{ balance }}</span>
                <span class="unit">元</span>
                <el-button type="primary" link @click="refreshBalance">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </el-card>

            <!-- 充值卡片 -->
            <el-card class="recharge-card">
              <div class="section-title">
                <el-icon><Wallet /></el-icon>
                在线充值
              </div>

              <div class="recharge-content">
                <!-- 左侧充值表单 -->
                <div class="recharge-form">
                  <!-- 快捷金额选择 -->
                  <div class="amount-options">
                    <div class="label">快捷金额</div>
                    <div class="options">
                      <el-radio-group
                        v-model="form.amount"
                        class="amount-radio-group"
                      >
                        <el-radio :value="10" required>
                          <span class="amount-label">
                            <span class="amount">10</span>
                            <span class="unit">元</span>
                          </span>
                        </el-radio>
                        <el-radio :value="50">
                          <span class="amount-label">
                            <span class="amount">50</span>
                            <span class="unit">元</span>
                          </span>
                        </el-radio>
                        <el-radio :value="100">
                          <span class="amount-label">
                            <span class="amount">100</span>
                            <span class="unit">元</span>
                          </span>
                        </el-radio>
                        <el-radio :value="500">
                          <span class="amount-label">
                            <span class="amount">500</span>
                            <span class="unit">元</span>
                          </span>
                        </el-radio>
                      </el-radio-group>
                    </div>
                  </div>

                  <!-- 其他金额 -->
                  <div class="custom-amount-section">
                    <div class="label">其他金额</div>
                    <el-input
                      v-model="form.customAmount"
                      placeholder="请输入充值金额"
                      @input="handleCustomAmount"
                    >
                      <template #append>元</template>
                    </el-input>
                  </div>

                  <!-- 支付方式 -->
                  <div class="payment-method">
                    <div class="label">支付方式</div>
                    <div class="methods">
                      <el-radio-group v-model="form.payMethod">
                        <el-radio value="alipay"> 支付宝支付 </el-radio>
                      </el-radio-group>
                    </div>
                  </div>
                </div>

                <!-- 右侧订单确认 -->
                <div class="order-section">
                  <div class="order-preview">
                    <div class="preview-title">订单预览</div>
                    <div class="preview-amount">
                      <span class="label">充值金额：</span>
                      <span class="value">{{ form.amount }}</span>
                      <span class="unit">元</span>
                    </div>
                    <div class="preview-method">
                      <span class="label">支付方式：</span>
                      <span class="value">支付宝支付</span>
                    </div>
                  </div>
                  <el-button
                    type="primary"
                    @click="submitForm"
                    :loading="loading"
                    class="submit-btn"
                  >
                    确认支付
                  </el-button>
                  <div class="order-tips">温馨提示：支付成功后5分钟内到账</div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>
    <!-- 支付状态确认弹窗 -->
    <el-dialog
      v-model="payStatusDialogVisible"
      title="支付确认"
      width="400px"
      :close-on-click-modal="false"
      :show-close="false"
      class="pay-status-dialog"
    >
      <div class="pay-status-content">
        <p class="status-tips">请确认支付是否完成</p>
        <div class="status-buttons">
          <el-button @click="handlePayStatus(false)">未完成支付</el-button>
          <el-button type="primary" @click="handlePayStatus(true)">
            已完成支付
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { Refresh, InfoFilled, Wallet, Menu } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
const { $msg, $myFetch } = useNuxtApp()

// 加载状态
const loading = ref(false)
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
// 账户余额
const balance = ref(0)

// 表单数据
const formRef = ref(null)
const form = ref({
  amount: 10,
  customAmount: null,
  payMethod: 'alipay',
})

// 支付状态弹窗
const payStatusDialogVisible = ref(false)

// 处理自定义金额输入
const handleCustomAmount = (val) => {
  if (val) {
    // 移除非数字字符
    const numVal = val.replace(/[^\d]/g, '')
    form.value.customAmount = numVal
    // 直接更新金额，不设置最小值限制
    form.value.amount = parseInt(numVal) || 0
  } else {
    // 当输入框为空时，设置金额为0
    form.value.amount = 0
    form.value.customAmount = null
  }
}

// 获取账户余额
const getBalance = async (showTip = false) => {
  try {
    const res = await $myFetch('UserBalance', {
      params: {
        username: username.value,
      },
    })

    if (res.code === 200) {
      balance.value = res.data
      if (showTip) {
        $msg('余额刷新成功', 'success')
      }
    }
  } catch (error) {
    $msg(error.message, 'error')
  }
}

// 手动刷新余额
const refreshBalance = () => {
  getBalance(true)
}

// 查询是否支付定时器
let timer = null

// 提交充值表单
const submitForm = async () => {
  if (form.value.amount < 1) {
    $msg('充值金额不能小于1元', 'error')
    return
  }
  if (form.value.amount > 100000) {
    $msg('单次充值金额不能大于100000元', 'error')
    return
  }

  loading.value = true
  try {
    const body = new URLSearchParams()
    body.append('amount', form.value.amount)

    const res = await $myFetch('AlipayWebPayment', {
      method: 'POST',
      body,
      params: {
        username: username.value,
      },
    })

    if (res.code === 200) {
      $msg('订单创建成功，正在跳转支付页面', 'success')
      // 在新窗口打开支付链接
      window.open(res.data.url, '_blank')
      // 显示支付状态确认弹窗
      payStatusDialogVisible.value = true
      // 查询接口
      timer = setInterval(async () => {
        const queryRes = await $myFetch('AlipayTradeQuery', {
          params: {
            id: res.data.id,
            username: username.value,
          },
        })

        if (queryRes.code === 200 && queryRes.data === '订单已支付') {
          $msg('支付成功', 'success')
          // 刷新余额
          getBalance(false)
          // 关闭弹窗
          payStatusDialogVisible.value = false
          clearInterval(timer)
        }
      }, 2000)

      // 5分钟后关闭定时器
      setTimeout(() => {
        clearInterval(timer)
        payStatusDialogVisible.value = false
        getBalance(false)
      }, 5 * 60 * 1000)
    }
  } catch (error) {
    $msg(error.message, 'error')
  }
  loading.value = false
}

// 处理支付状态
const handlePayStatus = (isSuccess) => {
  if (isSuccess) {
    clearInterval(timer)
    $msg(
      '支付完成后，请刷新页面查看余额。若未显示入账，请及时联系客服。',
      'success'
    )
  } else {
    clearInterval(timer)
    $msg('如遇支付问题，请联系客服处理', 'warning')
  }
  payStatusDialogVisible.value = false
}

// 页面加载时获取数据
onMounted(() => {
  getBalance(false)
})

useHead({
  title: '账户充值',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<style lang="less" scoped>
.container {
  display: flex;
  width: 100%;
  height: 100vh;

  .right {
    flex: 1;
    height: 100vh;
    background: #f5f5f5;
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

    .pay_container {
      padding: 20px;

      .cont {
        .form {
          .tips-card {
            margin-bottom: 20px;

            .tips-info {
              ul {
                margin: 0;
                padding-left: 20px;

                li {
                  color: #666;
                  line-height: 1.8;
                  font-size: 13px;
                }
              }
            }
          }

          .balance-card {
            margin-bottom: 20px;

            .section-title {
              font-size: 16px;
              font-weight: 500;
              margin-bottom: 20px;
              display: flex;
              align-items: center;

              .el-icon {
                margin-right: 8px;
                font-size: 18px;
                color: #409eff;
              }
            }

            .balance-amount {
              display: flex;
              align-items: center;
              padding: 0 20px;

              .amount {
                font-size: 32px;
                font-weight: bold;
                color: #ff6b00;
              }

              .unit {
                font-size: 14px;
                color: #999;
                margin: 0 10px;
              }
            }
          }

          .recharge-card {
            .section-title {
              font-size: 16px;
              font-weight: 500;
              margin-bottom: 30px;
              display: flex;
              align-items: center;
              border-bottom: 1px solid #ebeef5;
              padding-bottom: 15px;

              .el-icon {
                margin-right: 8px;
                font-size: 18px;
                color: #409eff;
              }
            }

            .recharge-content {
              display: flex;
              gap: 40px;

              .recharge-form {
                flex: 1;
                padding-right: 40px;
                border-right: 1px solid #ebeef5;

                .label {
                  font-size: 14px;
                  color: #606266;
                  margin-bottom: 15px;
                  font-weight: 500;
                }

                .amount-options {
                  margin-bottom: 30px;

                  .amount-radio-group {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;

                    :deep(.el-radio) {
                      margin: 0;
                      height: 60px;
                      border: 1px solid #dcdfe6;
                      border-radius: 4px;
                      padding: 0;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      transition: all 0.3s;

                      &.is-checked {
                        border-color: #409eff;
                        background: #ecf5ff;

                        .amount-label {
                          .amount {
                            color: #409eff;
                          }
                        }
                      }

                      .el-radio__input {
                        display: none;
                      }

                      .el-radio__label {
                        padding: 0;
                        color: inherit;
                      }

                      .amount-label {
                        text-align: center;

                        .amount {
                          font-size: 20px;
                          font-weight: 500;
                          color: #606266;
                          transition: color 0.3s;
                        }

                        .unit {
                          font-size: 14px;
                          color: #909399;
                          margin-left: 2px;
                        }
                      }

                      &:hover {
                        border-color: #409eff;
                      }
                    }
                  }
                }

                .custom-amount-section {
                  margin-bottom: 30px;

                  :deep(.el-input) {
                    .el-input__wrapper {
                      box-shadow: 0 0 0 1px #dcdfe6 inset;
                      padding: 0 15px;
                      height: 40px;

                      &.is-focus {
                        box-shadow: 0 0 0 1px #409eff inset;
                      }
                    }

                    .el-input-group__append {
                      background-color: #f5f7fa;
                      color: #909399;
                      padding: 0 15px;
                    }
                  }
                }

                .payment-method {
                  .methods {
                    :deep(.el-radio-group) {
                      .el-radio {
                        margin: 0;
                        height: 50px;
                        border: 1px solid #dcdfe6;
                        border-radius: 4px;
                        padding: 0 25px;
                        display: flex;
                        align-items: center;
                        transition: all 0.3s;
                        background: #fff;

                        &.is-checked {
                          border-color: #409eff;
                          background: #ecf5ff;
                        }

                        .el-radio__input {
                          display: none;
                        }

                        .el-icon {
                          font-size: 24px;
                          color: #1677ff;
                          margin-right: 8px;
                        }

                        .el-radio__label {
                          color: #606266;
                          font-size: 15px;
                          font-weight: 500;
                        }
                      }
                    }
                  }
                }
              }

              .order-section {
                width: 300px;

                .order-preview {
                  background: #f7f7f7;
                  border-radius: 4px;
                  padding: 20px;
                  margin-bottom: 20px;

                  .preview-title {
                    font-size: 15px;
                    font-weight: 500;
                    color: #606266;
                    margin-bottom: 15px;
                  }

                  .preview-amount,
                  .preview-method {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                    font-size: 14px;

                    .label {
                      color: #909399;
                    }

                    .value {
                      color: #606266;
                      font-weight: 500;
                      margin: 0 4px;
                    }

                    .unit {
                      color: #909399;
                    }
                  }

                  .preview-amount {
                    .value {
                      font-size: 24px;
                      color: #ff6b00;
                    }
                  }
                }

                .submit-btn {
                  width: 100%;
                  height: 44px;
                  font-size: 16px;
                  font-weight: 500;
                  margin-bottom: 15px;
                }

                .order-tips {
                  text-align: center;
                  font-size: 12px;
                  color: #909399;
                }
              }
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .recharge-card {
    .recharge-content {
      flex-direction: column;
      gap: 30px;

      .recharge-form {
        padding-right: 0;
        border-right: none;
        border-bottom: 1px solid #ebeef5;
        padding-bottom: 30px;

        .amount-radio-group {
          grid-template-columns: 1fr !important;
        }
      }

      .order-section {
        width: 100%;
      }
    }
  }
}

.pay-dialog,
.pay-dialog-content {
  display: none;
}

.pay-status-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 15px;
  }

  .pay-status-content {
    padding: 20px 0;
    text-align: center;

    .status-tips {
      font-size: 16px;
      color: #606266;
      margin-bottom: 30px;
    }

    .status-buttons {
      display: flex;
      justify-content: center;
      gap: 20px;

      .el-button {
        min-width: 120px;
      }
    }
  }
}
</style>
