<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="password-container">
        <div class="cont">
          <div class="form">
            <el-form
              :model="passwordInfo"
              label-position="top"
              label-width="120px"
            >
              <el-form-item label="请输入旧密码">
                <el-input
                  v-model="passwordInfo.oldPassword"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item label="请输入新密码">
                <el-input
                  v-model="passwordInfo.newPassword"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onSubmit">修改</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $enCode, $msg, $myFetch } = useNuxtApp()
const msg = $msg

const username = useCookie('username')
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

  const bodyValue = new URLSearchParams()
  bodyValue.append('oldPassword', $enCode(passwordInfo.oldPassword))
  bodyValue.append('newPassword', $enCode(passwordInfo.newPassword))
  bodyValue.append('token', token.value)
  bodyValue.append('username', username.value)

  const res = await $myFetch('ChangePassword', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    msg('修改成功', 'success')
    setTimeout(() => {
      window.location.href = '/login'
    }, 1500)

    username.value = undefined
    token.value = undefined
  } else {
    msg(res.msg, 'error')
  }
}
</script>

<style lang="less" scoped>
.container {
  display: flex;

  .right {
    width: 100%;

    .password-container {
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
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container {
    .right {
      .password-container {
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
