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

definePageMeta({
  middleware: ["admin"],
})

const { $msg } = useNuxtApp()
const msg = $msg

const token = useCookie('token')

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

  const max = 35
  const min = 15

  const random = Math.floor(Math.random() * (max - min + 1) + min)
  const oldPasswordCode = window.btoa(new Date().getTime() + passwordInfo.oldPassword + new Date().getTime())
  const newPasswordCode = window.btoa(new Date().getTime() + passwordInfo.newPassword + new Date().getTime())

  // 通过随机数打乱顺序，进行数据加密
  const oldPasswordEncryptionCode = oldPasswordCode.substring(random) + oldPasswordCode.slice(0, random)
  const newPasswordEncryptionCode = newPasswordCode.substring(random) + newPasswordCode.slice(0, random)

  const bodyValue = new URLSearchParams()
  bodyValue.append('oldPassword', oldPasswordEncryptionCode)
  bodyValue.append('newPassword', newPasswordEncryptionCode)
  bodyValue.append('random', random)
  bodyValue.append('token', token.value)

  const { data: res } = await axios.post('user/changepasssword', bodyValue)

  if (res.code !== '200') {
    msg(res.msg, 'error')

    token.value = undefined
    navigateTo('/login')

    return false
  }

  msg(res.msg, 'success')
  token.value = undefined
  navigateTo('/login')
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