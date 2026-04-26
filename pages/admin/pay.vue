<script setup>
import { Refresh, InfoFilled, Wallet } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'admin',
})

const { $msg, $myFetch } = useNuxtApp()

// 加载状态
const loading = ref(false)
const username = useCookie('username')

// 账户余额
const balance = ref(0)

// 支付通道配置列表
const payChannels = ref([])

// 表单数据
const form = ref({
  amount: 10,
  customAmount: null,
  payMethod: '',
})

// 支付状态弹窗
const payStatusDialogVisible = ref(false)

// 二维码支付弹窗
const qrPayDialogVisible = ref(false)
const qrCodeUrl = ref('')
const qrPayAmount = ref('')
const qrPaySoftware = ref('')
const currentOrderId = ref('')

// 处理自定义金额输入
const handleCustomAmount = (val) => {
  if (val) {
    // 允许输入数字和小数点，但限制只能有一个小数点
    let numVal = val.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')

    // 限制小数点后两位
    if (numVal.includes('.')) {
      const parts = numVal.split('.')
      if (parts[1].length > 2) {
        numVal = parts[0] + '.' + parts[1].slice(0, 2)
      }
    }

    // 限制最大金额为100000
    if (parseFloat(numVal) > 100000) {
      numVal = '100000'
    }

    form.value.customAmount = numVal
    // 转换为数字，保留两位小数
    form.value.amount = parseFloat(numVal) || 0
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
      balance.value = res.data.AccountBalance
      if (showTip) {
        $msg('余额刷新成功', 'success')
      }
    }
  } catch (error) {
    $msg(error.message, 'error')
  }
}

// 新增：获取支付通道配置
const getPayChannels = async () => {
  try {
    const res = await $myFetch('GetPayChannels')
    if (res.code === 200) {
      const configs = Array.isArray(res.data?.configs)
        ? res.data.configs.map((config) => ({
            ...config,
            id: String(config.id),
          }))
        : []

      payChannels.value = configs

      const hasCurrentChannel = configs.some(
        (config) => config.id === String(form.value.payMethod),
      )

      if (!hasCurrentChannel) {
        form.value.payMethod = configs[0]?.id || ''
      }
    }
  } catch (error) {
    console.error('获取支付通道失败:', error)
  }
}

// 手动刷新余额
const refreshBalance = () => {
  getBalance(true)
}

// 查询是否支付定时器
let timer = null

const getSelectedChannelConfig = () => {
  return (
    payChannels.value.find(
      (item) => String(item.id) === String(form.value.payMethod),
    ) || null
  )
}

const getPaySoftwareLabel = (channel) => {
  console.log(channel)
  if (channel === 'alipay') {
    return '支付宝'
  }

  if (channel === 'wechat') {
    return '微信'
  }

  return '支付应用'
}

const getSelectedChannelLabel = () => {
  return getSelectedChannelConfig()?.name || '未知支付方式'
}

const getQrDialogTitle = () => {
  return `${qrPaySoftware.value}二维码`
}

const closeQrPayDialog = () => {
  clearInterval(timer)
  qrPayDialogVisible.value = false
  qrCodeUrl.value = ''
  $msg('如遇支付问题，请联系客服处理', 'warning')
}

// 提交充值表单
const submitForm = async () => {
  if (form.value.amount < 0.01) {
    $msg('充值金额不能小于0.01元', 'error')
    return
  }
  if (form.value.amount > 100000) {
    $msg('单次充值金额不能大于100000元', 'error')
    return
  }

  if (!payChannels.value.length) {
    $msg('暂无可用的支付方式，请联系客服', 'error')
    return
  }

  const selectedChannel = getSelectedChannelConfig()
  if (!selectedChannel?.id) {
    $msg('支付通道配置异常，请联系客服', 'error')
    return
  }

  loading.value = true
  try {
    const body = new URLSearchParams()
    body.append('amount', form.value.amount)
    body.append('channelId', selectedChannel.id)

    const res = await $myFetch('WebPayment', {
      method: 'POST',
      body,
      params: {
        username: username.value,
      },
    })

    if (res.code === 200) {
      $msg('订单创建成功', 'success')
      currentOrderId.value = res.data.id
      const responseChannel = res.data.channel || selectedChannel.channel
      const imageUrl = (res.data.image_url || '').trim()
      const paymentUrl = (res.data.url || '').trim()

      if (imageUrl) {
        qrCodeUrl.value = imageUrl
        qrPayAmount.value = res.data.amount || form.value.amount
        qrPaySoftware.value = getPaySoftwareLabel(responseChannel)
        qrPayDialogVisible.value = true
      } else if (paymentUrl) {
        const newWin = window.open('', '_blank')
        if (newWin) {
          newWin.location = paymentUrl
          newWin.focus()
        } else {
          window.location.href = paymentUrl
        }

        payStatusDialogVisible.value = true
      } else {
        $msg('支付信息获取失败，请稍后重试', 'error')
        return
      }

      startPaymentQuery(res.data.id)
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg(error.message, 'error')
  } finally {
    loading.value = false
  }
}

// 新增：开始支付状态查询
const startPaymentQuery = (orderId) => {
  timer = setInterval(async () => {
    const queryRes = await $myFetch('TradeQuery', {
      params: {
        id: orderId,
        username: username.value,
      },
    })

    if (queryRes.code === 200 && queryRes.data === '订单已支付') {
      $msg('支付成功', 'success')
      // 刷新余额
      getBalance(false)
      // 关闭所有弹窗
      payStatusDialogVisible.value = false
      qrPayDialogVisible.value = false
      clearInterval(timer)
    }
  }, 2000)

  // 5分钟后关闭定时器
  setTimeout(
    () => {
      clearInterval(timer)
      payStatusDialogVisible.value = false
      qrPayDialogVisible.value = false
      getBalance(false)
    },
    5 * 60 * 1000,
  )
}

// 处理支付状态
const handlmPayStatus = (isSuccess) => {
  if (isSuccess) {
    clearInterval(timer)
    $msg(
      '支付完成后，请刷新页面查看余额。若未显示入账，请及时联系客服。',
      'success',
    )
  } else {
    clearInterval(timer)
    $msg('如遇支付问题，请联系客服处理', 'warning')
  }
  payStatusDialogVisible.value = false
}

const getChannelIconType = (channel) => {
  return channel === 'alipay' ? 'alipay' : channel === 'wechat' ? 'wechat' : ''
}

// 页面加载时获取数据
onMounted(() => {
  getBalance(false)
  getPayChannels()
})

useHead({
  title: '账户充值',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="pay_container">
    <div class="cont">
      <div class="form">
        <el-card class="page-title-card">
          <div class="page-title">账户充值</div>
        </el-card>

        <!-- 提示信息卡片 -->
        <el-card class="tips-card">
          <div class="tips-info">
            <ul>
              <li>充值最小金额 0.01 元</li>
              <li>支持支付宝和微信支付，请选择合适的支付方式</li>
              <li>支付过程中如遇到各种问题，请及时联系客服处理</li>
            </ul>
          </div>
        </el-card>

        <!-- 余额卡片 -->
        <el-card class="balance-card">
          <div class="section-title">
            <el-icon>
              <InfoFilled />
            </el-icon>
            可用余额
          </div>
          <div class="balance-amount">
            <span class="amount">{{ balance }}</span>
            <span class="unit">元</span>
            <el-button type="primary" link @click="refreshBalance">
              <el-icon>
                <Refresh />
              </el-icon>
            </el-button>
          </div>
        </el-card>

        <!-- 充值卡片 -->
        <el-card class="recharge-card">
          <div class="section-title">
            <el-icon>
              <Wallet />
            </el-icon>
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
                    <el-radio
                      v-for="channel in payChannels"
                      :key="channel.id"
                      :value="channel.id"
                    >
                      <div class="pay-item">
                        <svg
                          v-if="
                            getChannelIconType(channel.channel) === 'alipay'
                          "
                          class="pay-icon"
                          viewBox="0 0 1024 1024"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                        >
                          <path
                            d="M1024.0512 701.0304V196.864A196.9664 196.9664 0 0 0 827.136 0H196.864A196.9664 196.9664 0 0 0 0 196.864v630.272A196.9152 196.9152 0 0 0 196.864 1024h630.272a197.12 197.12 0 0 0 193.8432-162.0992c-52.224-22.6304-278.528-120.32-396.4416-176.64-89.7024 108.6976-183.7056 173.9264-325.3248 173.9264s-236.1856-87.2448-224.8192-194.048c7.4752-70.0416 55.552-184.576 264.2944-164.9664 110.08 10.3424 160.4096 30.8736 250.1632 60.5184 23.1936-42.5984 42.496-89.4464 57.1392-139.264H248.064v-39.424h196.9152V311.1424H204.8V267.776h240.128V165.632s2.1504-15.9744 19.8144-15.9744h98.4576V267.776h256v43.4176h-256V381.952h208.8448a805.9904 805.9904 0 0 1-84.8384 212.6848c60.672 22.016 336.7936 106.3936 336.7936 106.3936zM283.5456 791.6032c-149.6576 0-173.312-94.464-165.376-133.9392 7.8336-39.3216 51.2-90.624 134.4-90.624 95.5904 0 181.248 24.4736 284.0576 74.5472-72.192 94.0032-160.9216 150.016-253.0816 150.016z"
                            fill="#009FE8"
                          ></path>
                        </svg>
                        <svg
                          v-else-if="
                            getChannelIconType(channel.channel) === 'wechat'
                          "
                          class="pay-icon"
                          viewBox="0 0 1024 1024"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                        >
                          <path
                            d="M910.1 317.5l-516 298-3.1 2.1c-4.1 2.1-8.3 3.1-13.5 3.1-11.4 0-20.8-6.2-26-15.6l-2.1-4.1-82-178.7c-1-2.1-1-4.1-1-6.2 0-8.3 6.2-14.6 14.6-14.6 3.1 0 6.2 1 9.3 3.1l96.6 68.6c7.2 4.1 15.6 7.2 24.9 7.2 5.2 0 10.3-1 15.6-3.1l452.8-201.5C799.2 180.4 665.3 118 513.6 118 266.5 118 65 285.3 65 491.9c0 112.1 60.2 213.9 154.7 282.5 7.2 5.2 12.4 14.6 12.4 23.9 0 3.1-1 6.2-2.1 9.3-7.2 28-19.8 73.8-19.8 75.8-1 3.1-2.1 7.2-2.1 11.4 0 8.3 6.2 14.6 14.6 14.6 3.1 0 6.2-1 8.3-3.1l97.6-57.1c7.2-4.1 15.6-7.2 23.9-7.2 4.1 0 9.3 1 13.5 2.1 45.7 13.5 95.6 20.8 146.5 20.8C759.5 864.8 961 697.5 961 491c0-62.4-18.7-121.5-50.9-173.5z"
                            fill="#09BB07"
                          ></path>
                        </svg>
                        <el-icon v-else class="pay-icon">
                          <Wallet />
                        </el-icon>
                        <span>{{ channel.name }}</span>
                      </div>
                    </el-radio>
                  </el-radio-group>
                  <div v-if="!payChannels.length" class="no-payment-tips">
                    <el-alert
                      title="暂无可用的支付方式"
                      type="warning"
                      :closable="false"
                      show-icon
                    />
                  </div>
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
                  <span class="value">{{ getSelectedChannelLabel() }}</span>
                </div>
              </div>
              <el-button
                type="primary"
                @click="submitForm"
                :loading="loading"
                :disabled="!payChannels.length"
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
          <el-button @click="handlmPayStatus(false)">未完成支付</el-button>
          <el-button type="primary" @click="handlmPayStatus(true)">
            已完成支付
          </el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 二维码支付弹窗 -->
    <el-dialog
      v-model="qrPayDialogVisible"
      :title="getQrDialogTitle()"
      width="400px"
      :close-on-click-modal="false"
      :show-close="false"
      class="wechat-pay-dialog"
    >
      <div class="wechat-pay-content">
        <p class="qr-code-tips">请使用{{ qrPaySoftware }}扫码支付</p>
        <div class="payment-amount-section">
          <div class="amount-display">
            <span class="amount-label">实际支付金额：</span>
            <span class="amount-value">{{ qrPayAmount }}</span>
            <span class="amount-unit">元</span>
          </div>
        </div>
        <div class="qr-code">
          <img :src="qrCodeUrl" :alt="getQrDialogTitle()" />
        </div>
        <div class="qr-tips">
          <p>使用说明：</p>
          <p>1. 打开{{ qrPaySoftware }}，使用"扫一扫"功能扫描二维码</p>
          <p>
            2. 确认支付金额为
            <strong>{{ qrPayAmount }}元</strong>，点击"确认"完成支付
          </p>
          <p>3. 支付成功后系统将自动检测并更新余额</p>
        </div>
        <el-button type="primary" @click="closeQrPayDialog" class="close-btn">
          关闭
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.pay_container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;

  .cont {
    width: 100%;

    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;

      :deep(.el-card) {
        border: 1px solid #ebeef5;
        border-radius: 8px;
        box-shadow: none;

        .el-card__body {
          padding: 16px 20px;
        }
      }

      .page-title-card {
        .page-title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          line-height: 1.3;
        }
      }

      .tips-card {
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
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 16px;
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
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 24px;
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
                  display: flex;
                  gap: 15px;

                  .el-radio {
                    margin: 0;
                    width: 150px;
                    height: 56px;
                    border: 1px solid #dcdfe6;
                    border-radius: 4px;
                    padding: 0 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                    background: #fff;

                    &.is-checked {
                      border-color: #409eff;
                      background: #ecf5ff;
                    }

                    .el-radio__input {
                      display: none;
                    }

                    .pay-item {
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      width: 100%;

                      .pay-icon {
                        width: 24px;
                        height: 24px;
                        margin-right: 10px;
                        flex-shrink: 0;
                      }
                    }

                    .el-radio__label {
                      color: #606266;
                      font-size: 15px;
                      font-weight: 500;
                      width: 100%;
                      padding: 0;
                    }

                    &:hover {
                      border-color: #409eff;
                    }
                  }
                }

                .no-payment-tips {
                  margin-top: 10px;

                  :deep(.el-alert) {
                    border-radius: 4px;

                    .el-alert__content {
                      font-size: 14px;
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
        width: 100% !important;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .pay_container {
    padding: 12px;

    .cont {
      .form {
        :deep(.el-card .el-card__body) {
          padding: 14px;
        }
      }
    }
  }

  .payment-method {
    .methods {
      :deep(.el-radio-group) {
        flex-direction: column;
        gap: 10px;

        .el-radio {
          width: 100% !important;
        }
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

.wechat-pay-dialog,
.mpay-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 15px;
  }

  .wechat-pay-content,
  .mpay-content {
    padding: 20px 0;
    text-align: center;

    .qr-code-tips {
      font-size: 16px;
      color: #606266;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .payment-amount-section {
      margin-bottom: 25px;

      .amount-display {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 2px solid #e74c3c;

        .amount-label {
          font-size: 16px;
          color: #606266;
          font-weight: 500;
        }

        .amount-value {
          font-size: 24px;
          font-weight: bold;
          color: #e74c3c;
          margin: 0 5px;
        }

        .amount-unit {
          font-size: 16px;
          color: #606266;
        }
      }

      .amount-warning {
        :deep(.el-alert) {
          .el-alert__content {
            font-size: 13px;
            line-height: 1.5;
          }
        }
      }
    }

    .qr-code {
      margin-bottom: 20px;
      display: flex;
      justify-content: center;

      img {
        max-width: 260px;
        width: 100%;
        height: auto;
        border: 1px solid #ebeef5;
        border-radius: 8px;
        padding: 10px;
        background: #fff;
      }
    }

    .qr-tips {
      font-size: 13px;
      color: #909399;
      margin-bottom: 30px;
      text-align: left;

      p {
        margin: 8px 0;
        line-height: 1.6;

        strong {
          color: #e74c3c;
          font-weight: 600;
        }
      }
    }

    .close-btn {
      width: 100%;
      height: 44px;
      font-size: 16px;
      font-weight: 500;
    }
  }
}
</style>
