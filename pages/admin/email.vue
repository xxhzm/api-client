<script setup>
import { Menu, Message } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()
const username = useCookie('username')

const loading = ref(false)
const userInfo = reactive({
  id: 0,
  username: '',
  mail: '',
  balance: 0,
  rawStatus: '',
})

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
  
  initData()
})

const handleSidebarShow = () => {
  isSidebarShow.value = !isSidebarShow.value
  iscontrolShow.value = !iscontrolShow.value
  isoverlay.value = !isoverlay.value
  if (isSidebarShow.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const initData = async () => {
  try {
    const res = await $myFetch('UserList', {
      params: {
        page: 1,
        limit: 10,
        keyword: username.value,
      },
    })

    if (res.code === 200 && res.data.userList && res.data.userList.length > 0) {
      const currentUser = res.data.userList.find(
        (u) => u.username === username.value
      )

      if (currentUser) {
        userInfo.id = currentUser.id
        userInfo.username = currentUser.username
        userInfo.mail = currentUser.mail
        userInfo.balance = currentUser.balance
        userInfo.rawStatus = currentUser.status
      }
    }
  } catch (error) {
    // Silent error
  }
}

const onSubmit = async () => {
  if (!userInfo.mail) {
    $msg('请输入邮箱地址', 'error')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(userInfo.mail)) {
    $msg('请输入有效的邮箱地址', 'error')
    return
  }

  loading.value = true

  const apiBodyValue = new URLSearchParams()
  apiBodyValue.append('id', userInfo.id)
  apiBodyValue.append('mail', userInfo.mail)
  apiBodyValue.append('balance', userInfo.balance)
  apiBodyValue.append('status', userInfo.rawStatus)

  try {
    const res = await $myFetch('UpdateUser', {
      method: 'POST',
      body: apiBodyValue,
    })

    if (res.code === 200) {
      $msg('修改成功', 'success')
      // 刷新数据
      initData()
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('修改失败', 'error')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  initData() // Reload original data
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

      <div class="email-container-page">
        <div class="cont">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Message />
              </el-icon>
              <span class="title">修改邮箱</span>
            </div>
          </div>

          <!-- 表单区域 -->
          <div class="form-container">
            <el-form :model="userInfo" label-position="top" label-width="120px">
              <el-form-item label="邮箱地址">
                <el-input
                  v-model="userInfo.mail"
                  placeholder="请输入新的邮箱地址"
                  :prefix-icon="Message"
                />
              </el-form-item>
              <el-form-item>
                <div class="button-container">
                  <el-button
                    type="primary"
                    @click="onSubmit"
                    class="submit-button"
                    :loading="loading"
                  >
                    确认修改
                  </el-button>
                   <el-button @click="resetForm" class="reset-button">
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
              <li>邮箱可用于接收重要通知和找回密码</li>
              <li>请确保输入的邮箱地址真实有效</li>
              <li>修改成功后可能需要重新验证</li>
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

    .email-container-page {
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
      .email-container-page {
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
        }
      }
    }
  }
}
</style>
