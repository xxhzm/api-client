<script setup>
import { Lock, Key } from '@element-plus/icons-vue'
const { $enCode, $msg, $myFetch } = useNuxtApp()
const msg = $msg

definePageMeta({
  layout: 'admin',
})

const username = useCookie('username')
const token = useTokenCookie()

const passwordInfo = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '', // Added confirm password for better UX
})

const loading = ref(false)

const onSubmit = async () => {
  if (!passwordInfo.oldPassword || !passwordInfo.newPassword) {
    msg('请填写完整表单信息', 'error')
    return false
  }

  if (passwordInfo.newPassword.length < 6) {
    msg('请输入6位以上的密码', 'error')
    return false
  }

  if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
    msg('两次输入的密码不一致', 'error')
    return false
  }

  loading.value = true

  const bodyValue = new URLSearchParams()
  bodyValue.append('oldPassword', $enCode(passwordInfo.oldPassword))
  bodyValue.append('newPassword', $enCode(passwordInfo.newPassword))
  bodyValue.append('token', token.value)
  bodyValue.append('username', username.value)

  try {
    const res = await $myFetch('ChangePassword', {
      method: 'POST',
      body: bodyValue,
    })

    if (res.code === 200) {
      msg('修改成功，请重新登录', 'success')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)

      username.value = undefined
      token.value = undefined
    } else {
      msg(res.msg, 'error')
    }
  } catch (error) {
    msg('修改失败，请重试', 'error')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  passwordInfo.oldPassword = ''
  passwordInfo.newPassword = ''
  passwordInfo.confirmPassword = ''
}
</script>

<template>
  <div class="password-container">
    <div class="cont">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon">
            <Lock />
          </el-icon>
          <span class="title">修改密码</span>
        </div>
      </div>

      <!-- 表单区域 -->
      <div class="form-container">
        <el-form
          :model="passwordInfo"
          label-position="top"
          label-width="120px"
        >
          <el-form-item label="旧密码">
            <el-input
              v-model="passwordInfo.oldPassword"
              type="password"
              show-password
              placeholder="请输入当前使用的密码"
              :prefix-icon="Key"
            />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input
              v-model="passwordInfo.newPassword"
              type="password"
              show-password
              placeholder="请输入新密码（至少6位）"
              :prefix-icon="Lock"
            />
          </el-form-item>
          <el-form-item label="确认新密码">
            <el-input
              v-model="passwordInfo.confirmPassword"
              type="password"
              show-password
              placeholder="请再次输入新密码"
              :prefix-icon="Lock"
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
          <li>为了您的账户安全，建议定期更换密码</li>
          <li>新密码长度至少为6位，建议包含字母和数字</li>
          <li>修改密码后，需要重新登录才能生效</li>
          <li>请牢记您的新密码，如果忘记密码，可以通过绑定的手机号找回</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.password-container {
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

@media screen and (max-width: 768px) {
  .password-container {
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
</style>
