<script setup>
import {
  Wallet,
  Check,
  InfoFilled,
  Tickets,
  CircleCheckFilled,
} from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const { $msg, $myFetch } = useNuxtApp()

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
  <div class="use-rechargecard-page" v-loading="loading">
    <div class="page-shell">
      <el-card class="page-title-card" shadow="never">
        <div class="page-title-row">
          <div class="page-title">使用充值卡</div>
        </div>
      </el-card>

      <el-card class="tips-card" shadow="never">
        <div class="tips-info">
          <ul>
            <li>充值卡号区分大小写，建议直接粘贴完整卡号后提交。</li>
            <li>系统核销成功后将立即把金额计入当前账户，无需额外确认。</li>
            <li>充值卡通常仅可使用一次，如提示异常请联系管理员核查状态。</li>
          </ul>
        </div>
      </el-card>

      <div class="content-grid">
        <el-card class="main-card" shadow="never">
          <div class="section-title">
            <el-icon><Wallet /></el-icon>
            充值卡核销
          </div>
          <div class="section-subtitle">
            请确认当前操作账户及卡号信息，提交后系统将直接执行充值。
          </div>

          <div class="recharge-content">
            <div class="recharge-form">
              <div class="hero-panel">
                <div class="hero-icon">
                  <el-icon><Tickets /></el-icon>
                </div>
                <div class="hero-copy">
                  <h3>输入充值卡号，快速完成资金入账</h3>
                  <p>请确认卡号有效且未被使用，提交后系统将立即完成核销。</p>
                </div>
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

                <el-alert
                  title="卡号提交后将立即核销，请确认卡片尚未使用。"
                  type="info"
                  :closable="false"
                  show-icon
                  class="form-alert"
                />

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
            </div>

            <div class="side-panel">
              <el-card class="info-card" shadow="never">
                <div class="info-card-title">
                  <el-icon><InfoFilled /></el-icon>
                  使用说明
                </div>
                <ul class="instruction-list">
                  <li>
                    <el-icon><CircleCheckFilled /></el-icon>
                    <span>输入您收到的充值卡号，建议保持原始格式完整提交。</span>
                  </li>
                  <li>
                    <el-icon><CircleCheckFilled /></el-icon>
                    <span>点击“立即充值”后系统会实时校验并完成金额入账。</span>
                  </li>
                  <li>
                    <el-icon><CircleCheckFilled /></el-icon>
                    <span>每张充值卡通常仅可使用一次，过期或已使用卡将无法重复核销。</span>
                  </li>
                  <li>
                    <el-icon><CircleCheckFilled /></el-icon>
                    <span>若充值异常，请保留卡号并联系管理员进一步排查。</span>
                  </li>
                </ul>
              </el-card>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.use-rechargecard-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;

  .page-shell {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;

    :deep(.el-card) {
      border: 1px solid #ebeef5;
      border-radius: 8px;
      box-shadow: none;

      .el-card__body {
        padding: 16px 20px;
      }
    }

    .page-title-card {
      .page-title-row {
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }

      .page-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        line-height: 1.3;
      }

    }

    .tips-card {
      .tips-info {
        ul {
          margin: 0;
          padding-left: 20px;

          li {
            color: #606266;
            line-height: 1.8;
            font-size: 13px;
          }
        }
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
    }

    .main-card {
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-bottom: 15px;
        margin-bottom: 10px;
        border-bottom: 1px solid #ebeef5;
        font-size: 14px;
        font-weight: 600;
        color: #303133;

        .el-icon {
          color: #409eff;
          font-size: 18px;
        }
      }

      .section-subtitle {
        margin-bottom: 24px;
        color: #909399;
        font-size: 13px;
        line-height: 1.7;
      }

      .recharge-content {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
        gap: 20px;
        align-items: start;
      }

      .recharge-form {
        padding-right: 20px;
        border-right: 1px solid #ebeef5;

        .hero-panel {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding: 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #f4f8ff 0%, #eef5ff 100%);
          border: 1px solid #d9ecff;

          .hero-icon {
            width: 56px;
            height: 56px;
            border-radius: 14px;
            background: #409eff;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            .el-icon {
              font-size: 28px;
            }
          }

          .hero-copy {
            h3 {
              margin: 0 0 8px;
              font-size: 18px;
              font-weight: 600;
              color: #303133;
            }

            p {
              margin: 0;
              color: #606266;
              line-height: 1.7;
              font-size: 13px;

              span {
                color: #303133;
                font-weight: 600;
              }
            }
          }
        }

        :deep(.el-form-item__label) {
          font-weight: 500;
          color: #303133;
        }

        :deep(.el-input__wrapper) {
          min-height: 44px;
        }

        .form-alert {
          margin-bottom: 22px;
        }

        .submit-button {
          width: 100%;
          height: 44px;
          font-size: 15px;
          font-weight: 600;
        }
      }

      .side-panel {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .info-card {
          :deep(.el-card__body) {
            padding: 18px 20px;
          }
        }

        .info-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 600;
          color: #303133;

          .el-icon {
            color: #409eff;
            font-size: 18px;
          }
        }

        .instruction-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;

          li {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            color: #606266;
            line-height: 1.7;
            font-size: 13px;

            .el-icon {
              margin-top: 2px;
              color: #67c23a;
              font-size: 16px;
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .use-rechargecard-page {
    .page-shell {
      .main-card {
        .recharge-content {
          grid-template-columns: 1fr;
        }

        .recharge-form {
          padding-right: 0;
          padding-bottom: 8px;
          border-right: 0;
          border-bottom: 1px solid #ebeef5;
        }

        .side-panel {
          padding-top: 12px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .use-rechargecard-page {
    padding: 12px;

    .page-shell {
      :deep(.el-card .el-card__body) {
        padding: 14px;
      }

      .page-title-card {
        .page-title-row {
          flex-direction: column;
        }
      }

      .main-card {
        .recharge-form {
          .hero-panel {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      }
    }
  }
}
</style>
