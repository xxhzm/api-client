<script setup>
import { Wallet, Check, Menu } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

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

const loading = ref(false)
const cardCode = ref('')
const username = useCookie('username') // 从cookie中获取用户名
const rechargeAmount = ref(0)

// 使用充值卡
const useRechargeCard = async () => {
  if (!cardCode.value.trim()) {
    $msg('请输入充值卡号', 'error')
    return
  }

  loading.value = true

  try {
    const res = await $myFetch('UseRechargeCard', {
      params: {
        card_code: cardCode.value.trim(),
        username: username.value, // 从cookie中获取的用户名
      },
    })

    if (res.code === 200) {
      // 从返回消息中提取充值金额
      if (typeof res.data === 'string' && res.data.includes('元')) {
        const match = res.data.match(/(\d+(\.\d+)?)/)
        if (match && match[1]) {
          rechargeAmount.value = parseFloat(match[1])
          $msg(`充值成功，账户已增加 ¥${rechargeAmount.value}`, 'success')
        } else {
          $msg(res.data || res.msg || '充值成功', 'success')
        }
      } else {
        $msg(res.data || res.msg || '充值成功', 'success')
      }

      // 清空输入框
      cardCode.value = ''
    } else {
      $msg(res.msg || '充值失败', 'error')
    }
  } catch (error) {
    $msg('系统错误，请稍后再试', 'error')
    console.error(error)
  } finally {
    loading.value = false
  }
}

useHead({
  title: '使用充值卡',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
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
      <div class="use-rechargecard-container" v-loading="loading">
        <div class="card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Wallet />
              </el-icon>
              <span class="title">使用充值卡</span>
            </div>
          </div>

          <!-- 充值卡使用区域 -->
          <div class="card-content">
            <div class="form-container">
              <div class="card-illustration">
                <div class="icon-placeholder">
                  <el-icon :size="50" color="#409EFF"><Wallet /></el-icon>
                </div>
                <h2>使用充值卡</h2>
                <p>输入您的充值卡号，立即为账户充值</p>
              </div>

              <el-form label-position="top">
                <el-form-item label="充值卡号">
                  <el-input
                    v-model="cardCode"
                    placeholder="请输入充值卡号，例如：XXXX-XXXX-XXXX-XXXX-XXXX"
                    clearable
                    @keyup.enter="useRechargeCard"
                    size="large"
                  >
                    <template #prefix>
                      <el-icon><Wallet /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    @click="useRechargeCard"
                    :loading="loading"
                    :disabled="!cardCode.trim()"
                    size="large"
                    class="submit-button"
                  >
                    <el-icon class="icon"><Check /></el-icon>
                    立即充值
                  </el-button>
                </el-form-item>
              </el-form>

              <!-- 使用说明 -->
              <div class="instruction-box">
                <h3>使用说明</h3>
                <ul class="feature-list">
                  <li>
                    <div class="feature-icon">1</div>
                    <div class="feature-text">
                      输入您收到的充值卡号（区分大小写）
                    </div>
                  </li>
                  <li>
                    <div class="feature-icon">2</div>
                    <div class="feature-text">点击"立即充值"按钮</div>
                  </li>
                  <li>
                    <div class="feature-icon">3</div>
                    <div class="feature-text">
                      充值成功后，金额将自动添加到您的账户余额中
                    </div>
                  </li>
                  <li>
                    <div class="feature-icon">4</div>
                    <div class="feature-text">
                      每张充值卡只能使用一次，充值卡可能有有效期限制，请及时使用
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  background: #f5f7fa;

  .right {
    width: 100%;
    min-width: 0;
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
    .use-rechargecard-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .card {
        width: 100%;
        border-radius: 12px;
        margin: 0 auto;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
          margin-bottom: 16px;

          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;

            .icon {
              font-size: 20px;
              color: #4b5563;
            }

            .title {
              font-size: 16px;
              font-weight: 600;
              color: #1a1f36;
            }
          }
        }

        .card-content {
          padding: 40px;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

          .form-container {
            max-width: 600px;
            margin: 0 auto;

            .card-illustration {
              text-align: center;
              margin-bottom: 30px;

              .icon-placeholder {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background-color: #ecf5ff;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
              }

              h2 {
                font-size: 24px;
                font-weight: 600;
                color: #303133;
                margin: 0 0 10px;
              }

              p {
                color: #606266;
                margin: 0;
              }
            }

            .submit-button {
              width: 100%;
              padding: 12px 0;
              margin-top: 10px;
              font-size: 16px;
            }

            .instruction-box {
              margin-top: 40px;
              padding: 25px;
              background-color: #f8f9fa;
              border-radius: 12px;
              border-left: 4px solid #409eff;

              h3 {
                margin-top: 0;
                margin-bottom: 20px;
                color: #303133;
                font-size: 18px;
              }

              .feature-list {
                list-style: none;
                padding: 0;
                margin: 0;

                li {
                  display: flex;
                  align-items: flex-start;
                  margin-bottom: 16px;

                  &:last-child {
                    margin-bottom: 0;
                  }

                  .feature-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    background-color: #409eff;
                    color: white;
                    border-radius: 50%;
                    font-weight: bold;
                    margin-right: 12px;
                    flex-shrink: 0;
                  }

                  .feature-text {
                    color: #606266;
                    line-height: 1.6;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container .right .use-rechargecard-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .use-rechargecard-container {
    padding: 12px;

    .card .card-content {
      padding: 25px;
    }
  }
}
</style>
