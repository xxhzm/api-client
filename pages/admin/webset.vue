<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="webset_container">
        <div class="cont">
          <el-tabs v-model="activeTab" class="setting-tabs">
            <el-tab-pane label="基本设置" name="basic">
              <div class="form">
                <el-form
                  :model="websetInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="网站标题">
                    <el-input v-model="websetInfo.title" />
                  </el-form-item>
                  <el-form-item label="网站副标题">
                    <el-input v-model="websetInfo.subheading" />
                  </el-form-item>
                  <el-form-item label="网站关键词">
                    <el-input v-model="websetInfo.keywords" />
                  </el-form-item>
                  <el-form-item label="网站描述">
                    <el-input v-model="websetInfo.description" />
                  </el-form-item>
                  <el-form-item label="建站时间">
                    <el-date-picker
                      v-model="websetInfo.create_time"
                      type="datetime"
                      placeholder="选择建站时间"
                      format="YYYY/MM/DD HH:mm:ss"
                      value-format="YYYY/MM/DD HH:mm:ss"
                      :disabled-date="disabledDate"
                    />
                  </el-form-item>
                  <el-form-item label="ICP备案号">
                    <el-input v-model="websetInfo.icp" />
                  </el-form-item>
                  <el-form-item label="公安备案号">
                    <el-input v-model="websetInfo.gongan" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="websetInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="邮件设置" name="mail">
              <div class="form">
                <el-form
                  :model="mailInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="SMTP服务器地址">
                    <el-input v-model="mailInfo.smtp" />
                  </el-form-item>
                  <el-form-item label="邮箱账户">
                    <el-input v-model="mailInfo.user" />
                  </el-form-item>
                  <el-form-item label="密码">
                    <el-input
                      v-model="mailInfo.password"
                      type="password"
                      show-password
                    />
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
            </el-tab-pane>

            <el-tab-pane label="发信测试" name="test">
              <div class="form">
                <el-form label-position="top" label-width="120px">
                  <el-form-item label="测试邮箱">
                    <el-input v-model="testMail" placeholder="请输入测试邮箱" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="sendTestMail"
                      >发送测试</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $msg, $myFetch } = useNuxtApp()
const activeTab = ref('basic')

// 网站设置相关
const websetInfo = ref({
  title: '',
  subheading: '',
  keywords: '',
  description: '',
  create_time: '',
  icp: '',
  gongan: '',
})

// 邮件设置相关
const mailInfo = ref({
  smtp: '',
  user: '',
  password: '',
  setfrom: '',
  port: '',
  name: '',
})

const testMail = ref('')

// 获取网站设置
const getWebsetInfo = async () => {
  const res = await $myFetch('Options')
  websetInfo.value = res.data
}

// 获取邮件设置
const getMailInfo = async () => {
  const res = await $myFetch('MailInfo')
  mailInfo.value = res.data
}

onMounted(() => {
  getWebsetInfo()
  getMailInfo()
})

// 提交网站设置
const websetInfoSubmit = async () => {
  if (
    !websetInfo.value.title ||
    !websetInfo.value.subheading ||
    !websetInfo.value.keywords ||
    !websetInfo.value.description ||
    !websetInfo.value.create_time
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('title', websetInfo.value.title)
  bodyValue.append('subheading', websetInfo.value.subheading)
  bodyValue.append('keywords', websetInfo.value.keywords)
  bodyValue.append('description', websetInfo.value.description)
  bodyValue.append('createTime', websetInfo.value.create_time)
  bodyValue.append('icp', websetInfo.value.icp)
  bodyValue.append('gongan', websetInfo.value.gongan)

  const res = await $myFetch('OptionsUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getWebsetInfo()
  }
}

// 提交邮件设置
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

// 发送测试邮件
const sendTestMail = async () => {
  if (!testMail.value) {
    $msg('请输入测试邮箱', 'error')
    return false
  }

  const res = await $myFetch('SendTestMail', {
    params: {
      mail: testMail.value,
    },
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    testMail.value = ''
  } else {
    $msg(res.msg, 'error')
  }
}

// 禁用未来日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

useHead({
  title: '系统设置',
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
        padding: 20px;
        background: #fff;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        border-radius: 8px;

        .setting-tabs {
          :deep(.el-tabs__header) {
            margin-bottom: 24px;
          }

          :deep(.el-tabs__nav-wrap::after) {
            height: 1px;
          }

          :deep(.el-tabs__item) {
            font-size: 15px;
            padding: 0 24px;
            height: 40px;
            line-height: 40px;

            &.is-active {
              font-weight: 500;
            }
          }
        }

        .form {
          width: 60%;

          :deep(.el-form-item__label) {
            font-weight: 500;
            padding-bottom: 8px;
          }

          :deep(.el-input__wrapper) {
            box-shadow: 0 0 0 1px #dcdfe6 inset;

            &:hover {
              box-shadow: 0 0 0 1px #c0c4cc inset;
            }

            &.is-focus {
              box-shadow: 0 0 0 1px #409eff inset;
            }
          }

          .el-button {
            padding: 12px 24px;
            font-weight: 500;
          }

          :deep(.el-date-editor) {
            width: 100%;

            .el-input__wrapper {
              padding: 0 12px;
            }
          }
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
