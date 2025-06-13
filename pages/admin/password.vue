<script setup>
import { Menu } from '@element-plus/icons-vue'
const { $enCode, $msg, $myFetch } = useNuxtApp()
const msg = $msg

const username = useCookie('username')
const token = useCookie('token')

const passwordInfo = reactive({
  oldPassword: '',
  newPassword: '',
})

// 控制左侧边栏显示隐藏
// 获取页面宽度
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
