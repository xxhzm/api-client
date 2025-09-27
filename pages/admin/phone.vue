<script setup>
import {
  Phone,
  Menu,
  Key,
  Message,
  Refresh,
} from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()

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
const pageTitle = computed(() => hasPhone.value ? '修改手机号' : '绑定手机号')
const submitButtonText = computed(() => hasPhone.value ? '修改手机号' : '绑定手机号')

// 表单数据
const formData = reactive({
  phone: '',
  captcha: '',
  smsCode: '',
})

// 验证码相关
const captchaInfo = ref({
  id: '',
  url: '',
})
const getVerifyCodeButtonState = ref(false)
const smsCountdown = ref(0)
const smsTimer = ref(null)

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
    const res = await $myFetch('GetUserPhone', {
      method: 'GET',
    })
    
    if (res.code === 200) {
      if (res.data && res.data.phone) {
        currentPhone.value = res.data.phone
        hasPhone.value = true
        // 如果已有手机号，显示脱敏的手机号
        formData.phone = res.data.phone
      } else {
        hasPhone.value = false
        currentPhone.value = ''
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

// 获取短信验证码
const getSmsCode = async () => {
  // 验证手机号格式
  if (!phoneRule.test(formData.phone)) {
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
    body.append('phone', formData.phone)
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

// 开始倒计时
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

// 提交表单
const submitForm = async () => {
  // 表单验证
  if (!phoneRule.test(formData.phone)) {
    $msg('请输入正确的手机号', 'error')
    return
  }

  if (!formData.smsCode) {
    $msg('请输入短信验证码', 'error')
    return
  }

  loading.value = true

  try {
    const body = new URLSearchParams()
    body.append('phone', formData.phone)
    body.append('smsCode', formData.smsCode)

    const res = await $myFetch('BindOrUpdatePhone', {
      method: 'POST',
      body,
    })

    if (res.code === 200) {
      const successMsg = hasPhone.value ? '手机号修改成功' : '手机号绑定成功'
      $msg(successMsg, 'success')
      
      // 重新获取手机号信息
      setTimeout(() => {
        getCurrentPhone()
        resetForm()
      }, 1000)
    } else {
      $msg(res.msg || '操作失败', 'error')
    }
  } catch (error) {
    $msg('操作失败', 'error')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (!hasPhone.value) {
    formData.phone = ''
  }
  formData.captcha = ''
  formData.smsCode = ''
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
})

useHead({
  title: '手机号管理',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
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
          </div>

          <!-- 当前手机号显示 -->
          <div class="current-phone" v-if="hasPhone">
            <div class="current-phone-label">当前手机号：</div>
            <div class="current-phone-value">{{ formatPhone(currentPhone) }}</div>
          </div>

          <!-- 表单区域 -->
          <div class="form-container">
            <el-form :model="formData" label-position="top" label-width="120px">
              <!-- 手机号输入 -->
              <el-form-item label="手机号">
                <el-input
                  v-model="formData.phone"
                  placeholder="请输入手机号"
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
                    v-model="formData.smsCode"
                    placeholder="请输入短信验证码"
                    maxlength="6"
                    clearable
                    :prefix-icon="Message"
                    class="sms-input"
                  />
                  <el-button
                    type="primary"
                    :loading="getVerifyCodeButtonState"
                    :disabled="smsCountdown > 0"
                    @click="getSmsCode"
                    class="sms-button"
                  >
                    {{ smsCountdown > 0 ? `${smsCountdown}s后重发` : '获取验证码' }}
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
                  <el-button
                    @click="resetForm"
                    class="reset-button"
                  >
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
              <li v-if="!hasPhone">绑定手机号后，可用于账号安全验证和找回密码</li>
              <li v-else>修改手机号需要验证新手机号的短信验证码</li>
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

            .header-left {
              .title {
                font-size: 15px;
              }
            }
          }

          .current-phone {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
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