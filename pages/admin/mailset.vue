<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="webset_container">
        <div class="cont">
          <div class="form">
            <el-form :model="mailInfo" label-position="top" label-width="120px">
              <el-form-item label="SMTP服务器地址">
                <el-input v-model="mailInfo.smtp" />
              </el-form-item>

              <el-form-item label="邮箱账户">
                <el-input v-model="mailInfo.user" />
              </el-form-item>

              <el-form-item label="密码">
                <el-input v-model="mailInfo.password" />
              </el-form-item>

              <el-form-item label="发件人">
                <el-input v-model="mailInfo.setfrom" />
              </el-form-item>

              <el-form-item label="服务器端口">
                <el-input v-model="mailInfo.port" />
              </el-form-item>

              <el-form-item label="发信名称">
                <el-input v-model="mailInfo.name" />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="mailInfoSubmit"
                  >提交</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $msg, $myFetch } = useNuxtApp()

const mailInfo = ref({
  smtp: '',
  user: '',
  password: '',
  setfrom: '',
  port: '',
  name: '',
})

const getMailInfo = async () => {
  const res = await $myFetch('MailInfo')
  mailInfo.value = res.data
}

onMounted(() => {
  getMailInfo()
})

const mailInfoSubmit = async () => {
  if (
    !mailInfo.value.smtp ||
    !mailInfo.value.user ||
    !mailInfo.value.password ||
    !mailInfo.value.setfrom ||
    !mailInfo.value.port ||
    !mailInfo.value.name
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('smtp', mailInfo.value.smtp)
  bodyValue.append('user', mailInfo.value.user)
  bodyValue.append('password', mailInfo.value.password)
  bodyValue.append('setfrom', mailInfo.value.setfrom)
  bodyValue.append('port', mailInfo.value.port)
  bodyValue.append('name', mailInfo.value.name)

  const res = await $myFetch('MailInfoUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getMailInfo()
  }
}

useHead({
  title: '邮件设置',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<style lang="less" scoped>
.container {
  display: flex;
  .right {
    width: 100%;
    .webset_container {
      min-height: 100vh;
      padding: 10px;
      background-color: #f7f7f7;
      .cont {
        width: 100%;
        height: 100%;
        padding: 20px 20px;
        background: #fff;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        .form {
          width: 60%;
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container {
    .right {
      .webset_container {
        .cont {
          .form {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
