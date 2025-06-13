<script setup>
// 引入加密算法
const { $enCode, $msg, $myFetch } = useNuxtApp()

const router = useRouter()

const username = useCookie('username')
const token = useCookie('token')

if (username.value != undefined && token.value != undefined) {
  navigateTo('/admin')
} else {
  username.value = undefined
  token.value = undefined
}

const info = reactive({
  username: '',
  password: '',
  mail: '',
  captcha: '',
  mailCode: '',
  sign: '',
})

const LoginIsRegister = ref(true)
const loginAndRegisterButtonStatus = ref(false)

const goBack = () => {
  navigateTo('/')
}

const routeInfo = useCookie('routeInfo')

const login = async () => {
  if (info.username === '' || info.password === '') {
    return false
  }

  if (info.username.length < 6 || info.password.length < 6) {
    $msg('请输入6位以上的账号密码', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('username', info.username)

  // 使用加密算法对数据进行加密
  bodyValue.append('password', $enCode(info.password))
  const res = await $myFetch('Login', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200 && res.data.username === info.username) {
    // 设置cookie
    username.value = res.data.username
    token.value = res.data.token

    // 将 token 同时保存到 usestate
    const authorization = useState('Authorization')
    authorization.value = res.data.token

    $msg('登录成功', 'success')

    routeInfo.value = res.data.routeInfo
    navigateTo('/admin')
    return false
  }

  $msg(res.msg, 'error')
}

// 登录注册切换
const LoginIsRegisterChange = () => {
  LoginIsRegister.value = !LoginIsRegister.value
}

// 以下全部为注册

// 获取验证码按钮的状态
const getVerifyCodeButtonState = ref(false)

// 图片验证码信息
const captchaInfo = ref({
  id: '',
  url: '',
})

// 获取图片验证码
const getCaptchaInfo = async () => {
  // 接口文档 https://xxapi.cn/doc/captcha
  const res = await $fetch(
    'https://v2.xxapi.cn/api/captcha?type=math&options=3'
  )
  captchaInfo.value = res.data
}

// 监听用户是否切换了显示
watch(
  LoginIsRegister,
  (newValue) => {
    if (newValue === false) {
      info.captcha = ''
      getCaptchaInfo()
    }
  },
  {
    immediate: true,
  }
)

// 获取邮箱验证码
const rule =
  /^[A-Za-z\d]+[A-Za-z\d\-_\.]*@([A-Za-z\d]+[A-Za-z\d\-]*\.)+[A-Za-z]{2,4}$/

const getMailCode = async () => {
  getVerifyCodeButtonState.value = true

  if (rule.test(info.mail) === false) {
    $msg('请填写正确的信息', 'error')
    return false
  }

  const body = new URLSearchParams()
  body.append('id', captchaInfo.value.id)
  body.append('key', info.captcha)
  body.append('mail', info.mail)

  const res = await $myFetch('MailCode', {
    method: 'POST',
    body,
  })

  if (res.code != 200) {
    $msg(res.msg, 'error')
    getCaptchaInfo()

    getVerifyCodeButtonState.value = false
    return false
  }

  $msg('验证码已发送', 'success')

  info.sign = res.data
  getVerifyCodeButtonState.value = false
}

const register = async () => {
  if (
    info.username === '' ||
    info.password === '' ||
    info.mail === '' ||
    rule.test(info.mail) === false ||
    info.mailCode === ''
  ) {
    $msg('请正确填写账号信息', 'error')
    return false
  }

  if (info.username.length < 6 || info.password.length < 6) {
    $msg('请输入6位以上的账号密码', 'error')
    return false
  }

  const body = new URLSearchParams()
  body.append('username', info.username)
  body.append('password', $enCode(info.password))
  body.append('mail', info.mail)
  body.append('mailCode', info.mailCode)
  body.append('sign', info.sign)

  const res = await $myFetch('Register', {
    method: 'POST',
    body,
  })

  if (res.code === 200) {
    $msg('注册成功，请登录', 'success')
    setTimeout(() => {
      router.go(0)
    }, 500)
  } else {
    $msg(res.msg, 'error')
  }
}
useHead({
  title: '用户登录',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="login-container">
    <div class="login-card" :class="{ 'is-register': !LoginIsRegister }">
      <div class="card-header">
        <span class="back-btn" @click="goBack">
          <img src="@/assets/images/goback.svg" alt="返回" />
          返回首页
        </span>
        <div class="header-content">
          <h2 class="title">{{ LoginIsRegister ? '账号登录' : '注册账号' }}</h2>
          <p class="subtitle">
            {{
              LoginIsRegister
                ? '欢迎使用小小API，请登录您的账号'
                : '欢迎加入小小API，请完成注册'
            }}
          </p>
        </div>
      </div>

      <div v-if="LoginIsRegister" class="form-container">
        <el-form :model="info" size="large">
          <el-form-item>
            <el-input
              v-model="info.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="info.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password
            />
          </el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            @click="login"
            :loading="loginAndRegisterButtonStatus"
          >
            登录
          </el-button>
        </el-form>
        <div class="form-footer">
          <span>还没有账号？</span>
          <a @click="LoginIsRegisterChange">立即注册</a>
        </div>
      </div>
      <div v-else class="form-container">
        <el-form :model="info" size="large">
          <el-form-item>
            <el-input
              v-model="info.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="info.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="info.mail"
              placeholder="请输入电子邮箱"
              prefix-icon="el-icon-message"
            />
          </el-form-item>
          <el-form-item>
            <div class="captcha-container">
              <el-input
                v-model="info.captcha"
                placeholder="图片验证码"
                prefix-icon="el-icon-picture"
              />
              <img
                :src="captchaInfo.url"
                alt="验证码"
                class="captcha-img"
                @click="getCaptchaInfo()"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="verify-code-container">
              <el-input
                v-model="info.mailCode"
                placeholder="邮件验证码"
                prefix-icon="el-icon-key"
              />
              <el-button
                @click="getMailCode"
                :loading="getVerifyCodeButtonState"
                class="verify-code-btn"
              >
                获取验证码
              </el-button>
            </div>
          </el-form-item>
          <el-button type="primary" class="submit-btn" @click="register">
            注册
          </el-button>
        </el-form>
        <div class="form-footer">
          <span>已有账号？</span>
          <a @click="LoginIsRegisterChange">立即登录</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  padding: 20px;

  .login-card {
    width: 100%;
    max-width: 420px;
    height: 440px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: height 0.3s ease;
    display: flex;
    flex-direction: column;

    &.is-register {
      height: 620px;
    }

    .card-header {
      padding: 32px 32px 24px;
      position: relative;
      background: #fff;
      flex-shrink: 0;

      .back-btn {
        display: inline-flex;
        align-items: center;
        color: #98a6ad;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
        transition: color 0.3s;
        position: absolute;
        left: 32px;
        top: 32px;

        img {
          width: 13px;
          height: 13px;
          margin-right: 2px;
          opacity: 0.8;
        }

        &:hover {
          color: #409eff;
          img {
            opacity: 1;
          }
        }
      }

      .header-content {
        text-align: center;
        padding-top: 48px;

        .title {
          margin: 0 0 12px;
          font-size: 24px;
          font-weight: 600;
          color: #606266;
        }

        .subtitle {
          margin: 0;
          font-size: 14px;
          color: #909399;
        }
      }
    }

    .form-container {
      padding: 0 32px 32px;
      flex: 1;

      .el-form-item {
        margin-bottom: 20px;
      }

      .el-input {
        --el-input-height: 40px;

        :deep(.el-input__wrapper) {
          box-shadow: 0 0 0 1px #dcdfe6 inset;

          &.is-focus {
            box-shadow: 0 0 0 1px #409eff inset;
          }
        }

        :deep(.el-input__inner) {
          font-size: 14px;
        }
      }

      .captcha-container {
        display: flex;
        gap: 12px;

        .captcha-img {
          height: 40px;
          border-radius: 4px;
          cursor: pointer;
        }
      }

      .verify-code-container {
        display: flex;
        gap: 12px;

        .el-input {
          flex: 1;
        }

        .verify-code-btn {
          width: 120px;
          height: 40px;
        }
      }

      .submit-btn {
        width: 100%;
        height: 40px;
        font-size: 15px;
        margin-top: 16px;
      }
    }

    .form-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #606266;

      a {
        color: #409eff;
        margin-left: 4px;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .login-container {
    padding: 16px;

    .login-card {
      height: 420px;

      &.is-register {
        height: 580px;
      }

      .card-header {
        padding: 24px 24px 16px;

        .back-btn {
          left: 24px;
          top: 24px;
        }

        .header-content {
          padding-top: 40px;

          .title {
            font-size: 20px;
          }
        }
      }

      .form-container {
        padding: 0 24px 24px;

        .el-form-item {
          margin-bottom: 16px;
        }
      }
    }
  }
}
</style>
