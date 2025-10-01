<script setup>
import { Phone, Menu, Key, Message, Refresh } from '@element-plus/icons-vue'

const { $msg, $myFetch, $logout } = useNuxtApp()

// 控制左侧边栏显示隐藏
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

// 页面数据
const loading = ref(false)
const currentPhone = ref('')
const hasPhone = ref(false)
const currentStep = ref(1) // 1: 验证当前手机号, 2: 输入新手机号
const pageTitle = computed(() => {
  if (!hasPhone.value) return '绑定手机号'
  return currentStep.value === 1 ? '验证当前手机号' : '绑定新手机号'
})
const submitButtonText = computed(() => {
  if (!hasPhone.value) return '绑定手机号'
  return currentStep.value === 1 ? '验证当前手机号' : '绑定新手机号'
})

// 表单数据
const formData = reactive({
  currentPhone: '', // 当前手机号输入
  newPhone: '', // 新手机号输入
  captcha: '',
  currentSmsCode: '', // 当前手机号验证码
  newSmsCode: '', // 新手机号验证码
})

// 验证码相关
const captchaInfo = ref({
  id: '',
  url: '',
})
const getVerifyCodeButtonState = ref(false)
const smsCountdown = ref(0)
const smsTimer = ref(null)
const currentSmsCountdown = ref(0) // 当前手机号验证码倒计时
const currentSmsTimer = ref(null)

// 中国大陆手机号验证规则
const phoneRule = /^1[3-9]\d{9}$/

// 获取图片验证码
const getCaptchaInfo = async () => {
  try {
    const res = await $myFetch('Captcha', {
      method: 'GET',
    })
    if (res.code === 200) {
      captchaInfo.value = res.data
    }
  } catch (error) {
    $msg('获取验证码失败', 'error')
  }
}

// 获取当前用户手机号信息
const getCurrentPhone = async () => {
  loading.value = true
  try {
    const res = await $myFetch('UserPhone', {
      method: 'GET',
    })

    if (res.code === 200) {
      if (res.data && res.data.phone && res.data.phone !== '未绑定手机号') {
        // 已绑定手机号，显示脱敏的手机号
        currentPhone.value = res.data.phone
        hasPhone.value = true
        currentStep.value = 1
      } else {
        // 未绑定手机号
        hasPhone.value = false
        currentPhone.value = ''
        currentStep.value = 1
      }
    } else {
      $msg(res.msg || '获取手机号信息失败', 'error')
    }
  } catch (error) {
    $msg('获取手机号信息失败', 'error')
  } finally {
    loading.value = false
  }
}

// 获取当前手机号的短信验证码
const getCurrentSmsCode = async () => {
  // 验证手机号格式
  if (!phoneRule.test(formData.currentPhone)) {
    $msg('请输入正确的手机号', 'error')
    return
  }

  // 验证图片验证码
  if (!formData.captcha) {
    $msg('请输入图片验证码', 'error')
    return
  }

  getVerifyCodeButtonState.value = true

  try {
    const body = new URLSearchParams()
    body.append('phone', formData.currentPhone)
    body.append('id', captchaInfo.value.id)
    body.append('key', formData.captcha)

    const res = await $myFetch('SendPhoneSMS', {
      method: 'POST',
      body,
    })

    if (res.code === 200) {
      $msg('短信验证码已发送', 'success')
      startCurrentCountdown()
    } else {
      $msg(res.msg || '发送验证码失败', 'error')
      getCaptchaInfo() // 刷新图片验证码
    }
  } catch (error) {
    $msg('发送验证码失败', 'error')
    getCaptchaInfo()
  } finally {
    getVerifyCodeButtonState.value = false
  }
}

// 获取新手机号的短信验证码
const getNewSmsCode = async () => {
  // 验证手机号格式
  if (!phoneRule.test(formData.newPhone)) {
    $msg('请输入正确的手机号', 'error')
    return
  }

  // 验证图片验证码
  if (!formData.captcha) {
    $msg('请输入图片验证码', 'error')
    return
  }

  getVerifyCodeButtonState.value = true

  try {
    const body = new URLSearchParams()
    body.append('phone', formData.newPhone)
    body.append('id', captchaInfo.value.id)
    body.append('key', formData.captcha)

    const res = await $myFetch('SendPhoneSMS', {
      method: 'POST',
      body,
    })

    if (res.code === 200) {
      $msg('短信验证码已发送', 'success')
      startCountdown()
    } else {
      $msg(res.msg || '发送验证码失败', 'error')
      getCaptchaInfo() // 刷新图片验证码
    }
  } catch (error) {
    $msg('发送验证码失败', 'error')
    getCaptchaInfo()
  } finally {
    getVerifyCodeButtonState.value = false
  }
}

// 获取短信验证码（未绑定用户）
const getSmsCode = async () => {
  // 验证手机号格式
  if (!phoneRule.test(formData.newPhone)) {
    $msg('请输入正确的手机号', 'error')
    return
  }

  // 验证图片验证码
  if (!formData.captcha) {
    $msg('请输入图片验证码', 'error')
    return
  }

  getVerifyCodeButtonState.value = true

  try {
    const body = new URLSearchParams()
    body.append('phone', formData.newPhone)
    body.append('id', captchaInfo.value.id)
    body.append('key', formData.captcha)

    const res = await $myFetch('SendPhoneSMS', {
      method: 'POST',
      body,
    })

    if (res.code === 200) {
      $msg('短信验证码已发送', 'success')
      startCountdown()
    } else {
      $msg(res.msg || '发送验证码失败', 'error')
      getCaptchaInfo() // 刷新图片验证码
    }
  } catch (error) {
    $msg('发送验证码失败', 'error')
    getCaptchaInfo()
  } finally {
    getVerifyCodeButtonState.value = false
  }
}

// 开始当前手机号验证码倒计时
const startCurrentCountdown = () => {
  currentSmsCountdown.value = 60
  currentSmsTimer.value = setInterval(() => {
    currentSmsCountdown.value--
    if (currentSmsCountdown.value <= 0) {
      clearInterval(currentSmsTimer.value)
      currentSmsTimer.value = null
    }
  }, 1000)
}

// 开始新手机号验证码倒计时
const startCountdown = () => {
  smsCountdown.value = 60
  smsTimer.value = setInterval(() => {
    smsCountdown.value--
    if (smsCountdown.value <= 0) {
      clearInterval(smsTimer.value)
      smsTimer.value = null
    }
  }, 1000)
}

// 验证当前手机号
const verifyCurrentPhone = async () => {
  // 表单验证
  if (!phoneRule.test(formData.currentPhone)) {
    $msg('请输入正确的手机号', 'error')
    return
  }

  if (!formData.currentSmsCode) {
    $msg('请输入短信验证码', 'error')
    return
  }

  loading.value = true

  try {
    const body = new URLSearchParams()
    body.append('phone', formData.currentPhone)
    body.append('code', formData.currentSmsCode)

    const res = await $myFetch('VerifyCurrentPhone', {
      method: 'POST',
      body,
    })

    if (res.code === 200) {
      $msg('当前手机号验证成功', 'success')
      currentStep.value = 2
      // 清空表单
      formData.captcha = ''
      formData.currentSmsCode = ''
      getCaptchaInfo()
    } else {
      $msg(res.msg || '验证失败', 'error')
    }
  } catch (error) {
    $msg('验证失败', 'error')
  } finally {
    loading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!hasPhone.value) {
    // 未绑定用户直接绑定
    await bindPhone()
  } else if (currentStep.value === 1) {
    // 已绑定用户第一步：验证当前手机号
    await verifyCurrentPhone()
  } else {
    // 已绑定用户第二步：修改手机号
    await updatePhone()
  }
}

// 绑定手机号（未绑定用户）
const bindPhone = async () => {
  // 表单验证
  if (!phoneRule.test(formData.newPhone)) {
    $msg('请输入正确的手机号', 'error')
    return
  }

  if (!formData.newSmsCode) {
    $msg('请输入短信验证码', 'error')
    return
  }

  loading.value = true

  try {
    const body = new URLSearchParams()
    body.append('phone', formData.newPhone)
    body.append('code', formData.newSmsCode)

    const res = await $myFetch('BindPhone', {
      method: 'POST',
      body,
    })

    if (res.code === 200) {
      $msg('手机号绑定成功', 'success')

      // 重新获取手机号信息
      setTimeout(() => {
        getCurrentPhone()
        resetForm()
      }, 1000)
    } else {
      $msg(res.msg || '绑定失败', 'error')
    }
  } catch (error) {
    $msg('绑定失败', 'error')
  } finally {
    loading.value = false
  }
}

// 修改手机号（已绑定用户）
const updatePhone = async () => {
  // 表单验证
  if (!phoneRule.test(formData.newPhone)) {
    $msg('请输入正确的手机号', 'error')
    return
  }

  if (!formData.newSmsCode) {
    $msg('请输入短信验证码', 'error')
    return
  }

  loading.value = true

  try {
    const body = new URLSearchParams()
    body.append('newPhone', formData.newPhone)
    body.append('newSmsCode', formData.newSmsCode)
    body.append('currentPhone', formData.currentPhone)

    const res = await $myFetch('UpdatePhone', {
      method: 'POST',
      body,
    })

    if (res.code === 200) {
      $msg(
        '手机号修改成功，为了您的账户安全，系统将在3秒后自动退出，请重新登录',
        'success'
      )

      // 3秒后强制登出
      setTimeout(() => {
        $logout()
      }, 3000)
    } else {
      $msg(res.msg || '修改失败', 'error')
    }
  } catch (error) {
    $msg('修改失败', 'error')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.currentPhone = ''
  formData.newPhone = ''
  formData.captcha = ''
  formData.currentSmsCode = ''
  formData.newSmsCode = ''
  currentStep.value = 1
  getCaptchaInfo()
}

// 返回上一步
const goBack = () => {
  currentStep.value = 1
  formData.newPhone = ''
  formData.newSmsCode = ''
  formData.captcha = ''
  getCaptchaInfo()
}

// 格式化手机号显示（脱敏）
const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 页面初始化
onMounted(() => {
  getCaptchaInfo()
  getCurrentPhone()
})

// 页面销毁时清理定时器
onUnmounted(() => {
  if (smsTimer.value) {
    clearInterval(smsTimer.value)
  }
  if (currentSmsTimer.value) {
    clearInterval(currentSmsTimer.value)
  }
})

useHead({
  title: '手机号管理',
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

      <div class="phone-container" v-loading="loading">
        <div class="cont">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Phone />
              </el-icon>
              <span class="title">{{ pageTitle }}</span>
            </div>
            <!-- 返回按钮 -->
            <div v-if="hasPhone && currentStep === 2" class="header-right">
              <el-button @click="goBack" size="small">返回上一步</el-button>
            </div>
          </div>

          <!-- 当前手机号显示 -->
          <div class="current-phone" v-if="hasPhone">
            <div class="current-phone-label">当前手机号：</div>
            <div class="current-phone-value">
              {{ formatPhone(currentPhone) }}
            </div>
          </div>

          <!-- 步骤指示器 -->
          <div class="steps" v-if="hasPhone">
            <el-steps :active="currentStep - 1" finish-status="success">
              <el-step
                title="验证当前手机号"
                description="验证您当前绑定的手机号"
              ></el-step>
              <el-step
                title="绑定新手机号"
                description="输入并验证新的手机号"
              ></el-step>
            </el-steps>
          </div>

          <!-- 表单区域 -->
          <div class="form-container">
            <el-form :model="formData" label-position="top" label-width="120px">
              <!-- 未绑定用户或已绑定用户第二步：新手机号输入 -->
              <template v-if="!hasPhone || currentStep === 2">
                <el-form-item :label="hasPhone ? '新手机号' : '手机号'">
                  <el-input
                    v-model="formData.newPhone"
                    :placeholder="hasPhone ? '请输入新手机号' : '请输入手机号'"
                    maxlength="11"
                    clearable
                    :prefix-icon="Phone"
                  >
                    <template #append>
                      <span class="phone-prefix">+86</span>
                    </template>
                  </el-input>
                  <div class="form-tip">仅支持中国大陆手机号</div>
                </el-form-item>
              </template>

              <!-- 已绑定用户第一步：当前手机号输入 -->
              <template v-if="hasPhone && currentStep === 1">
                <el-form-item label="当前手机号">
                  <el-input
                    v-model="formData.currentPhone"
                    placeholder="请输入当前绑定的完整手机号"
                    maxlength="11"
                    clearable
                    :prefix-icon="Phone"
                  >
                    <template #append>
                      <span class="phone-prefix">+86</span>
                    </template>
                  </el-input>
                  <div class="form-tip">请输入您当前绑定的完整手机号码</div>
                </el-form-item>
              </template>

              <!-- 图片验证码 -->
              <el-form-item label="图片验证码">
                <div class="captcha-container">
                  <el-input
                    v-model="formData.captcha"
                    placeholder="请输入验证码"
                    maxlength="4"
                    clearable
                    :prefix-icon="Key"
                    class="captcha-input"
                  />
                  <div class="captcha-image" @click="getCaptchaInfo">
                    <img :src="captchaInfo.url" alt="验证码" />
                    <div class="captcha-refresh">
                      <el-icon><Refresh /></el-icon>
                      <span>点击刷新</span>
                    </div>
                  </div>
                </div>
              </el-form-item>

              <!-- 短信验证码 -->
              <el-form-item label="短信验证码">
                <div class="sms-container">
                  <el-input
                    v-if="!hasPhone || currentStep === 2"
                    v-model="formData.newSmsCode"
                    placeholder="请输入短信验证码"
                    maxlength="6"
                    clearable
                    :prefix-icon="Message"
                    class="sms-input"
                  />
                  <el-input
                    v-else
                    v-model="formData.currentSmsCode"
                    placeholder="请输入短信验证码"
                    maxlength="6"
                    clearable
                    :prefix-icon="Message"
                    class="sms-input"
                  />
                  <el-button
                    type="primary"
                    :loading="getVerifyCodeButtonState"
                    :disabled="
                      (!hasPhone && smsCountdown > 0) ||
                      (hasPhone &&
                        currentStep === 1 &&
                        currentSmsCountdown > 0) ||
                      (hasPhone && currentStep === 2 && smsCountdown > 0)
                    "
                    @click="
                      !hasPhone
                        ? getSmsCode()
                        : currentStep === 1
                        ? getCurrentSmsCode()
                        : getNewSmsCode()
                    "
                    class="sms-button"
                  >
                    <template v-if="!hasPhone">
                      {{
                        smsCountdown > 0
                          ? `${smsCountdown}s后重发`
                          : '获取验证码'
                      }}
                    </template>
                    <template v-else-if="currentStep === 1">
                      {{
                        currentSmsCountdown > 0
                          ? `${currentSmsCountdown}s后重发`
                          : '获取验证码'
                      }}
                    </template>
                    <template v-else>
                      {{
                        smsCountdown > 0
                          ? `${smsCountdown}s后重发`
                          : '获取验证码'
                      }}
                    </template>
                  </el-button>
                </div>
              </el-form-item>

              <!-- 提交按钮 -->
              <el-form-item>
                <div class="button-container">
                  <el-button
                    type="primary"
                    :loading="loading"
                    @click="submitForm"
                    class="submit-button"
                  >
                    {{ submitButtonText }}
                  </el-button>
                  <el-button @click="resetForm" class="reset-button">
                    重置
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <!-- 温馨提示 -->
          <div class="tips">
            <h4>温馨提示：</h4>
            <ul>
              <li v-if="!hasPhone">
                绑定手机号后，可用于账号安全验证和找回密码
              </li>
              <li v-else-if="currentStep === 1">
                请输入您当前绑定的完整手机号码进行身份验证
              </li>
              <li v-else>
                请输入新的手机号码，验证成功后将替换当前绑定的手机号
              </li>
              <li>请确保手机号真实有效，能够正常接收短信</li>
              <li>验证码有效期为5分钟，请及时输入</li>
            </ul>
          </div>
        </div>
      </div>
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
    .phone-container {
      min-height: 100vh;
      padding: 10px;
      background-color: #f8fafc;

      .cont {
        width: 100%;
        height: 100%;
        padding: 20px;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        border-radius: 8px;

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
            :deep(.el-button) {
              border-color: #d9e1ec;
              color: #5a6478;
              &:hover {
                border-color: #4096ff;
                color: #4096ff;
              }
            }
          }
        }

        .steps {
          margin-bottom: 30px;
          padding: 20px;
          background: #fafbfc;
          border: 1px solid #edf1f7;
          border-radius: 6px;

          :deep(.el-steps) {
            .el-step__title {
              font-size: 14px;
              font-weight: 500;
            }

            .el-step__description {
              font-size: 12px;
              color: #8c95a5;
            }

            .el-step__head.is-process {
              .el-step__icon {
                background-color: #4096ff;
                border-color: #4096ff;
              }
            }

            .el-step__head.is-finish {
              .el-step__icon {
                background-color: #52c41a;
                border-color: #52c41a;
              }
            }
          }
        }

        .current-phone {
          padding: 16px 20px;
          background: #fafbfc;
          border: 1px solid #edf1f7;
          border-radius: 6px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;

          .current-phone-label {
            font-weight: 500;
            color: #5a6478;
          }

          .current-phone-value {
            font-size: 16px;
            font-weight: 600;
            color: #4096ff;
          }
        }

        .form-container {
          max-width: 600px;

          :deep(.el-form-item__label) {
            font-weight: 500;
            padding-bottom: 8px;
            color: #2e3033;
          }

          :deep(.el-input__wrapper) {
            background-color: #fafbfc;
            border: 1px solid #edf1f7;
            box-shadow: none;

            &:hover {
              border-color: #d9e1ec;
            }

            &.is-focus {
              border-color: #4096ff;
              box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
            }
          }

          .form-tip {
            margin-top: 4px;
            color: #8c95a5;
            font-size: 13px;
          }

          .phone-prefix {
            color: #5a6478;
            font-weight: 500;
          }

          .captcha-container {
            display: flex;
            gap: 12px;
            align-items: flex-start;

            .captcha-input {
              flex: 1;
            }

            .captcha-image {
              width: 120px;
              height: 40px;
              border: 1px solid #edf1f7;
              border-radius: 4px;
              cursor: pointer;
              position: relative;
              overflow: hidden;

              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }

              .captcha-refresh {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                color: #fff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s;
                font-size: 12px;

                span {
                  margin-top: 2px;
                }
              }

              &:hover .captcha-refresh {
                opacity: 1;
              }
            }
          }

          .sms-container {
            display: flex;
            gap: 12px;

            .sms-input {
              flex: 1;
            }

            .sms-button {
              min-width: 120px;
            }
          }

          .button-container {
            display: flex;
            gap: 16px;
            margin-top: 20px;

            .submit-button {
              min-width: 140px;
            }

            .reset-button {
              min-width: 100px;
            }
          }

          :deep(.el-button--primary) {
            background-color: #4096ff;
            border-color: #4096ff;
            &:hover {
              background-color: #1677ff;
              border-color: #1677ff;
            }
          }
        }

        .tips {
          margin-top: 30px;
          padding: 16px 20px;
          background: #fafbfc;
          border: 1px solid #edf1f7;
          border-radius: 6px;

          h4 {
            margin: 0 0 12px 0;
            color: #2e3033;
            font-size: 14px;
            font-weight: 600;
          }

          ul {
            margin: 0;
            padding-left: 20px;

            li {
              color: #5a6478;
              font-size: 13px;
              line-height: 1.6;
              margin-bottom: 4px;

              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .container {
    .right {
      .phone-container {
        .cont {
          padding: 15px;

          .card-header {
            padding-bottom: 15px;
            margin-bottom: 15px;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;

            .header-left {
              .title {
                font-size: 15px;
              }
            }

            .header-right {
              align-self: flex-end;
            }
          }

          .current-phone {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .steps {
            padding: 15px;
            margin-bottom: 20px;

            :deep(.el-steps) {
              .el-step__title {
                font-size: 13px;
              }

              .el-step__description {
                font-size: 11px;
              }
            }
          }

          .form-container {
            .captcha-container {
              flex-direction: column;

              .captcha-image {
                width: 100%;
                max-width: 200px;
              }
            }

            .sms-container {
              flex-direction: column;

              .sms-button {
                min-width: auto;
              }
            }

            .button-container {
              flex-direction: column;

              .submit-button,
              .reset-button {
                width: 100%;
              }
            }
          }

          .tips {
            padding: 16px;
          }
        }
      }
    }
  }
}
</style>
