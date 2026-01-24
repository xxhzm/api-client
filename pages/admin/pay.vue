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

// 新增：支付通道配置
const payChannels = ref({
  alipay: false,
  weixin: false,
  mpay: '', // 改为字符串类型：空字符串代表未配置，'alipay'代表支付宝，'wxpay'代表微信支付
})

// 表单数据
const form = ref({
  amount: 10,
  customAmount: null,
  payMethod: 'alipay',
})

// 支付状态弹窗
const payStatusDialogVisible = ref(false)

// 新增：微信支付二维码弹窗
const wechatPayDialogVisible = ref(false)
const wechatQrCode = ref('')
const currentOrderId = ref('')

// 新增：易支付二维码弹窗
const mpayDialogVisible = ref(false)
const mpayQrCode = ref('')
const mpayMethod = ref('') // 新增：存储易支付的扫码方式
const mpayAmount = ref('') // 新增：存储易支付的实际支付金额

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
      payChannels.value = res.data

      // 如果当前选择的支付方式不可用，自动切换到可用的支付方式
      if (form.value.payMethod === 'alipay' && !payChannels.value.alipay) {
        if (payChannels.value.weixin) {
          form.value.payMethod = 'wechat'
        } else if (payChannels.value.mpay) {
          form.value.payMethod = 'mpay'
        }
      } else if (
        form.value.payMethod === 'wechat' &&
        !payChannels.value.weixin
      ) {
        if (payChannels.value.alipay) {
          form.value.payMethod = 'alipay'
        } else if (payChannels.value.mpay) {
          form.value.payMethod = 'mpay'
        }
      } else if (form.value.payMethod === 'mpay' && !payChannels.value.mpay) {
        if (payChannels.value.alipay) {
          form.value.payMethod = 'alipay'
        } else if (payChannels.value.weixin) {
          form.value.payMethod = 'wechat'
        }
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

  // 检查支付方式是否可用
  if (
    !payChannels.value.alipay &&
    !payChannels.value.weixin &&
    !payChannels.value.mpay
  ) {
    $msg('暂无可用的支付方式，请联系客服', 'error')
    return
  }

  if (form.value.payMethod === 'alipay' && !payChannels.value.alipay) {
    $msg('支付宝支付暂不可用，请选择其他支付方式', 'error')
    return
  }

  if (form.value.payMethod === 'wechat' && !payChannels.value.weixin) {
    $msg('微信支付暂不可用，请选择其他支付方式', 'error')
    return
  }

  if (form.value.payMethod === 'mpay' && !payChannels.value.mpay) {
    $msg('易支付暂不可用，请选择其他支付方式', 'error')
    return
  }

  loading.value = true
  try {
    const body = new URLSearchParams()
    body.append('amount', form.value.amount)

    // 根据支付方式选择不同的接口
    let apiEndpoint
    if (form.value.payMethod === 'wechat') {
      apiEndpoint = 'WeixinWebPayment'
    } else if (form.value.payMethod === 'mpay') {
      apiEndpoint = 'MPayment'
    } else {
      apiEndpoint = 'AlipayWebPayment'
    }

    const res = await $myFetch(apiEndpoint, {
      method: 'POST',
      body,
      params: {
        username: username.value,
      },
    })

    if (res.code === 200) {
      $msg('订单创建成功', 'success')
      currentOrderId.value = res.data.id

      if (form.value.payMethod === 'wechat') {
        // 微信支付：显示二维码
        wechatQrCode.value = res.data.image_url
        wechatPayDialogVisible.value = true
      } else if (form.value.payMethod === 'mpay') {
        // 易支付：显示二维码
        mpayQrCode.value = res.data.image_url
        mpayMethod.value = res.data.method // 保存扫码方式
        mpayAmount.value = res.data.amount || form.value.amount // 保存实际支付金额
        mpayDialogVisible.value = true
      } else {
        // 支付宝支付：跳转页面
        // 先立即打开一个空白窗口（在用户点击事件中）-防止safari浏览器拦截
        const newWin = window.open('', '_blank')
        newWin.location = res.data.url
        newWin.focus()

        // 显示支付状态确认弹窗
        payStatusDialogVisible.value = true
      }

      // 开始查询支付状态
      startPaymentQuery(res.data.id)
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg(error.message, 'error')
  }
  loading.value = false
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
      wechatPayDialogVisible.value = false
      mpayDialogVisible.value = false
      clearInterval(timer)
    }
  }, 2000)

  // 5分钟后关闭定时器
  setTimeout(
    () => {
      clearInterval(timer)
      payStatusDialogVisible.value = false
      wechatPayDialogVisible.value = false
      mpayDialogVisible.value = false
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

// 新增：关闭微信支付弹窗
const closeWechatPayDialog = () => {
  clearInterval(timer)
  wechatPayDialogVisible.value = false
  $msg('如遇支付问题，请联系客服处理', 'warning')
}

// 新增：关闭易支付弹窗
const closeEpayDialog = () => {
  clearInterval(timer)
  mpayDialogVisible.value = false
  $msg('如遇支付问题，请联系客服处理', 'warning')
}

// 新增：获取易支付弹窗标题
const getPaymentTitle = () => {
  if (mpayMethod.value === 'alipay') {
    return '支付宝扫易支付'
  } else if (mpayMethod.value === 'wechat' || mpayMethod.value === 'wxpay') {
    return '微信扫易支付'
  }
  return '易支付二维码'
}

// 新增：获取易支付提示文字
const getPaymentTips = () => {
  if (mpayMethod.value === 'alipay') {
    return '请使用支付宝扫描二维码进行支付'
  } else if (mpayMethod.value === 'wechat' || mpayMethod.value === 'wxpay') {
    return '请使用微信扫描二维码进行支付'
  }
  return '请使用手机扫描二维码进行支付'
}

// 新增：获取易支付使用说明
const getPaymentInstructions = () => {
  if (mpayMethod.value === 'alipay') {
    return '打开支付宝，使用"扫一扫"功能扫描二维码'
  } else if (mpayMethod.value === 'wechat' || mpayMethod.value === 'wxpay') {
    return '打开微信，使用"扫一扫"功能扫描二维码'
  }
  return '使用手机扫描上方二维码'
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
                    <el-radio value="alipay" v-if="payChannels.alipay">
                      <div class="pay-item">
                        <svg
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
                        <span>支付宝</span>
                      </div>
                    </el-radio>
                    <el-radio value="wechat" v-if="payChannels.weixin">
                      <div class="pay-item">
                        <svg
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
                        <span>微信支付</span>
                      </div>
                    </el-radio>
                    <el-radio value="mpay" v-if="payChannels.mpay">
                      <div class="pay-item">
                        <svg
                          class="pay-icon"
                          viewBox="0 0 1126 1024"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                        >
                          <path
                            d="M1076.736 908.032c0 14.4896-2.4576 28.0064-7.3216 40.6016a100.4544 100.4544 0 0 1-52.7872 55.4496 113.7664 113.7664 0 0 1-42.9056 9.3184H175.6672c-14.3872 0-50.0736-3.9936-62.9248-9.3184a107.2128 107.2128 0 0 1-57.2928-55.4496 97.9968 97.9968 0 0 1-8.4992-40.6016V337.2544c0-29.0304 10.0352-53.6064 30.0032-73.7792 19.968-20.1728 44.1344-22.4768 72.9088-22.4768h823.8592c28.7744 0 52.9408 2.2528 72.9088 22.4768 20.0704 20.224 30.0544 44.7488 30.0544 73.728v161.2288h-257.3312c-28.7744 0-53.0944 4.1984-73.1648 24.064-19.968 19.8144-30.0032 44.1856-30.0032 73.216 0.7168 19.8144 4.9152 37.376 12.4928 52.5824 6.0416 12.9536 16.0768 24.7808 30.0544 35.4304 13.9776 10.7008 34.2528 20.6336 60.672 20.6336h257.536l-0.2048 203.6736zM922.2656 189.5424H407.3472c40.9088-21.3504 79.616-50.8928 115.9168-70.7584 31.7952-16.7936 63.1808-33.536 94.1056-50.3296 30.976-16.8448 55.1936-29.696 72.6016-38.912 26.4192-14.4896 50.0736-21.0944 70.912-19.968 20.7872 1.0752 38.4 4.7616 52.736 10.8032 16.64 8.3968 30.976 19.456 43.1104 33.28l65.536 135.8848z m-154.0096 406.1696c0-14.4896 4.9664-26.7264 14.7456-36.5568a49.0496 49.0496 0 0 1 36.352-14.8992c14.3872 0 26.4192 4.9152 36.352 14.848a50.0736 50.0736 0 0 1 14.6944 36.608c0 14.4896-4.9152 26.9312-14.7456 37.1712a48.3328 48.3328 0 0 1-36.352 15.4624 48.4864 48.4864 0 0 1-36.3008-15.4624 52.0704 52.0704 0 0 1-14.7456-37.1712z"
                            fill="#FF7712"
                          ></path>
                        </svg>
                        <span
                          >易支付{{
                            payChannels.mpay === 'alipay'
                              ? '(支付宝)'
                              : payChannels.mpay === 'wxpay'
                                ? '(微信)'
                                : ''
                          }}</span
                        >
                      </div>
                    </el-radio>
                  </el-radio-group>
                  <!-- 无可用支付方式时的提示 -->
                  <div
                    v-if="
                      !payChannels.alipay &&
                      !payChannels.weixin &&
                      !payChannels.mpay
                    "
                    class="no-payment-tips"
                  >
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
                  <span class="value">{{
                    form.payMethod === 'alipay'
                      ? '支付宝支付'
                      : form.payMethod === 'wechat'
                        ? '微信支付'
                        : form.payMethod === 'mpay'
                          ? '易支付' +
                            (payChannels.mpay === 'alipay'
                              ? '(支付宝)'
                              : payChannels.mpay === 'wxpay'
                                ? '(微信)'
                                : '')
                          : '未知支付方式'
                  }}</span>
                </div>
              </div>
              <el-button
                type="primary"
                @click="submitForm"
                :loading="loading"
                :disabled="
                  !payChannels.alipay &&
                  !payChannels.weixin &&
                  !payChannels.mpay
                "
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
    <!-- 微信支付二维码弹窗 -->
    <el-dialog
      v-model="wechatPayDialogVisible"
      title="微信支付二维码"
      width="400px"
      :close-on-click-modal="false"
      :show-close="false"
      class="wechat-pay-dialog"
    >
      <div class="wechat-pay-content">
        <p class="qr-code-tips">请使用微信扫描二维码进行支付</p>
        <div class="qr-code">
          <img :src="wechatQrCode" alt="微信支付二维码" />
        </div>
        <div class="qr-tips">
          <p>使用说明：</p>
          <p>1. 打开微信，使用"扫一扫"功能扫描二维码</p>
          <p>2. 确认支付金额，点击"确认"完成支付</p>
          <p>3. 支付成功后系统将自动检测并更新余额</p>
        </div>
        <el-button
          type="primary"
          @click="closeWechatPayDialog"
          class="close-btn"
        >
          关闭
        </el-button>
      </div>
    </el-dialog>
    <!-- 易支付二维码弹窗 -->
    <el-dialog
      v-model="mpayDialogVisible"
      :title="getPaymentTitle()"
      width="400px"
      :close-on-click-modal="false"
      :show-close="false"
      class="mpay-dialog"
    >
      <div class="mpay-content">
        <p class="qr-code-tips">{{ getPaymentTips() }}</p>

        <!-- 实际支付金额显示 -->
        <div class="payment-amount-section">
          <div class="amount-display">
            <span class="amount-label">实际支付金额：</span>
            <span class="amount-value">{{ mpayAmount }}</span>
            <span class="amount-unit">元</span>
          </div>
          <div class="amount-warning">
            <el-alert
              title="请按照上方显示的金额进行支付，不要多付或少付"
              type="warning"
              :closable="false"
              show-icon
            />
          </div>
        </div>

        <div class="qr-code">
          <img :src="mpayQrCode" :alt="getPaymentTitle()" />
        </div>
        <div class="qr-tips">
          <p>使用说明：</p>
          <p>1. {{ getPaymentInstructions() }}</p>
          <p>
            2. 确认支付金额为
            <strong>{{ mpayAmount }}元</strong>，点击"确认"完成支付
          </p>
          <p>3. 支付成功后系统将自动检测并更新余额</p>
        </div>
        <el-button type="primary" @click="closeEpayDialog" class="close-btn">
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
  padding: 10px;
  background-color: #f7f7f7;

  .cont {
    width: 100%;

    .form {
      display: flex;
      flex-direction: column;
      gap: 20px;
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
