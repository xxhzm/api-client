<template>
  <AdminHeader></AdminHeader>
  <div style="display: flex">
    <AdminSidebar></AdminSidebar>
    <div class="password-container">
      <div class="password-form">
        <el-form :model="passwordInfo" label-width="120px">
          <el-form-item label="请输入旧密码">
            <el-input v-model="passwordInfo.oldPassword" />
          </el-form-item>
          <el-form-item label="请输入新密码">
            <el-input v-model="passwordInfo.newPassword" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios"
import { ElNotification } from 'element-plus'



const { $enCode, $msg } = useNuxtApp()
const msg = $msg

const username = useCookie('username')
const token = useCookie('token')
const grade = useCookie('grade')

const passwordInfo = reactive({
  oldPassword: '',
  newPassword: '',
})

const onSubmit = async () => {
  if (!passwordInfo.oldPassword || !passwordInfo.newPassword) {
    msg('请填写表单信息', 'error')
    return false
  }

  if (passwordInfo.newPassword.length < 6) {
    msg('请输入6位以上的密码', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('oldPassword', $enCode(passwordInfo.oldPassword))
  bodyValue.append('newPassword', $enCode(passwordInfo.newPassword))
  bodyValue.append('token', token.value)
  bodyValue.append('username', username.value)

  const { data: res } = await axios.post('ChangePassword', bodyValue)

  if (res.code !== 200) {
    username.value = undefined
    token.value = undefined
    grade.value = undefined
    window.location.href = '/login'

    return false
  }

  username.value = undefined
  token.value = undefined
  grade.value = undefined

  msg(res.msg, 'success')
  setTimeout(() => {
    window.location.href = '/login'
  }, 1500)

}
</script>

<style  lang="less" scoped>
.password-container {
  overflow-y: hidden;
  width: 100%;
  height: calc(100vh - 65px);
  padding: 20px 40px;
  background-color: #f7f7f7;
  .password-form {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    padding: 40px 50px;
    background: #fff;
    box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
  }
}
</style>