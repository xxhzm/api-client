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
      <p class="text">请输入账号密码进行登录</p>
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
          <el-input v-model="info.email" placeholder="电子邮箱" />
        </el-form-item>
      </el-form>
      <el-button @click="getVerifyCode" :loading="getVerifyCodeButtonState"
        >获取验证码</el-button
      >
      <el-form-item style="margin-top: 20px">
        <el-input v-model="info.code" placeholder="验证码" type="number" />
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
import axios from 'axios'
import { ElNotification } from 'element-plus'

definePageMeta({
  middleware: ["admin"]
})

// 引入加密算法
const { $enCode, $msg } = useNuxtApp()

const router = useRouter()

const username = useCookie('username')
const token = useCookie('token')
const grade = useCookie('grade')

const getVerifyCodeButtonState = ref(false)

// delete username and token
username.value = undefined
token.value = undefined
grade.value = undefined

const info = reactive({
  username: '',
  password: '',
  email: '',
  code: '',
})

const LoginIsRegister = ref(true)
const loginAndRegisterButtonStatus = ref(false)
const rule = /^[A-Za-z\d]+[A-Za-z\d\-_\.]*@([A-Za-z\d]+[A-Za-z\d\-]*\.)+[A-Za-z]{2,4}$/

const msg = $msg

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

  const { data: res } = await axios.post('Login', bodyValue)
  if (res.code !== 200 || res.msg !== '数据请求成功' || res.data === "") {
    msg(res.msg, 'error')
    return false
  } else if (res.code === 200 && res.msg === '数据请求成功' && res.data.username === info.username) {
    // 设置cookie
    username.value = res.data.username
    token.value = res.data.token
    grade.value = res.data.grade

    msg('登录成功', 'success')

    navigateTo('/admin')
  }
}

const register = async () => {
  if (info.username === '' || info.password === '' || info.email === '' || rule.test(info.email) === false) {
    msg('请正确填写账号信息', 'error')
    return false
  }

  if (info.username.length < 6 || info.password.length < 6) {
    msg('请输入6位以上的账号密码', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('username', info.username)
  bodyValue.append('password', info.password)
  bodyValue.append('email', info.email)
  bodyValue.append('code', info.code)

  const { data: res } = await axios.post('user/register', bodyValue)

  // 注册失败
  if (res.code !== '200' && res.msg !== '注册成功，请前往登录') {
    msg(res.msg, 'error')
    return false
  } else if (res.code === '200' && res.msg === '注册成功，3秒后将自动跳转，如未自动跳转请手动前往登录') {
    // 注册成功
    msg(res.msg, 'success')
    setTimeout(() => {
      router.go(0)
    }, 3000)
  }

}

const getVerifyCode = async () => {
  if (rule.test(info.email) === false) {
    msg('请填写正确的信息', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('email', info.email)

  const { data: res } = await axios.post('user/verifycode', bodyValue)
  if (res.code !== '200') {
    msg(res.msg, 'error')
    return false
  }

  setTimeout(() => {
    getVerifyCodeButtonState.value = true
  }, 60000)

  msg(res.msg, 'success')
}
const goBack = () => {
  navigateTo('/')
}

const LoginIsRegisterChange = () => {
  LoginIsRegister.value = !LoginIsRegister.value
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