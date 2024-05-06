<template>
  <div class="login-container">
    <div class="login cont" v-if="LoginIsRegister">
      <span class="back" @click="goBack"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-box-arrow-right"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
          />
          <path
            fill-rule="evenodd"
            d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
          /></svg
        >返回首页</span
      >
      <h4 class="title">登录</h4>
      <p class="text">请输入账号密码进行登录<br />无法登录请刷新此页面</p>
      <el-form
        label-position="top"
        label-width="100px"
        :model="info"
        size="large"
      >
        <el-form-item>
          <el-input v-model="info.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="info.password"
            type="password"
            placeholder="密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <el-button
        type="primary"
        style="display: block; margin-top: 30px"
        @click="login"
        :loading="loginAndRegisterButtonStatus"
        >点击登录</el-button
      >
      <p class="text" style="margin-top: 15px">
        还没有账号?<span style="margin-left: 5px" @click="LoginIsRegisterChange"
          >注册</span
        >
      </p>
    </div>
    <div class="register cont" v-if="!LoginIsRegister">
      <span class="back" @click="goBack"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-box-arrow-right"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
          />
          <path
            fill-rule="evenodd"
            d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
          /></svg
        >返回首页</span
      >
      <h4 class="title">注册</h4>
      <p class="text">请输入账号密码进行注册</p>
      <el-form label-position="top" label-width="100px" :model="info">
        <el-form-item>
          <el-input v-model="info.username" placeholder="用户名" />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="info.password"
            type="password"
            placeholder="密码"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-input v-model="info.mail" placeholder="电子邮箱" />
        </el-form-item>
      </el-form>

      <el-form-item style="margin-top: 20px">
        <el-input
          v-model="info.captcha"
          placeholder="图片验证码"
          type="number"
        />
      </el-form-item>

      <el-form-item style="margin-top: 20px">
        <img
          :src="captchaInfo.url"
          alt="验证码"
          style="width: 100%; height: 40px; cursor: pointer"
          @click="getCaptchaInfo()"
        />
      </el-form-item>

      <el-button @click="getMailCode" :loading="getVerifyCodeButtonState"
        >获取验证码</el-button
      >

      <el-form-item style="margin-top: 20px">
        <el-input v-model="info.mailCode" placeholder="邮件验证码" />
      </el-form-item>

      <el-button type="primary" style="display: block" @click="register"
        >点击注册</el-button
      >

      <p class="text" style="margin-top: 15px">
        已有账号?<span style="margin-left: 5px" @click="LoginIsRegisterChange"
          >登录</span
        >
      </p>
    </div>
  </div>
</template>

<script setup>
// 引入加密算法
const { $enCode, $msg, $myFetch } = useNuxtApp()

const router = useRouter()

const username = useCookie('username')
const token = useCookie('token')

// delete username and token
username.value = undefined
token.value = undefined

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

const msg = $msg

const goBack = () => {
  navigateTo('/')
}

const login = async () => {
  if (info.username === '' || info.password === '') {
    return false
  }

  if (info.username.length < 6 || info.password.length < 6) {
    msg('请输入6位以上的账号密码', 'error')
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

    window.location.href = '/admin'
  }
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
  // 接口文档 https://api-m.com/doc/captcha
  const { data: res } = await $myFetch(
    'https://v2.api-m.com/api/captcha?type=digit'
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
    msg('请填写正确的信息', 'error')
    return false
  }

  const body = new URLSearchParams()
  body.append('id', captchaInfo.value.id)
  body.append('key', info.captcha)
  body.append('mail', info.mail)

  const { data: res } = await$myFetch('MailCode', {
    method: 'POST',
    body,
  })

  if (res.code != 200) {
    getCaptchaInfo()

    getVerifyCodeButtonState.value = false
    return false
  }

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
    msg('请正确填写账号信息', 'error')
    return false
  }

  if (info.username.length < 6 || info.password.length < 6) {
    msg('请输入6位以上的账号密码', 'error')
    return false
  }

  const body = new URLSearchParams()
  body.append('username', info.username)
  body.append('password', info.password)
  body.append('mail', info.mail)
  body.append('mailCode', info.mailCode)
  body.append('sign', info.sign)

  const { data: res } = await $myFetch('Register', {
    method: 'POST',
    body,
  })
  
  if (res.code === 200) {
    setTimeout(() => {
      router.go(0)
    }, 1000)
  }
}
</script>

<style lang="less">
.login-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #f3f4f6;
  .cont {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 420px;
    height: auto;
    background: #fff;
    padding: 2.25rem;
    text-align: center;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
    .back {
      float: left;
      font-size: 13px;
      font-weight: bold;
      color: #98a6ad;
      cursor: pointer;
      margin-bottom: 48px;
      svg {
        display: inline-block;
        position: relative;
        top: 2px;
        width: 13px;
        margin-right: 2px;
      }
    }
    .title {
      clear: both;
      font-weight: 700;
      font-size: 1.125rem;
      color: #585a63;
    }
    .text {
      color: #98a6ad;
      font-size: 0.9rem;
      margin: 12px 0 16px 0;
    }
    .tips {
      float: left;
      color: #98a6ad;
      font-weight: 700;
      font-size: 0.9rem;
    }
    button {
      width: 100%;
      height: 40px;
      clear: both;
    }
    .text {
      span {
        cursor: pointer;
        color: #0084ff;
      }
    }
  }
}
</style>
