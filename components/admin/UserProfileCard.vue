<script setup>
import {
  Message,
  Timer,
  Wallet,
  Location,
  Lock,
  Phone,
  Key,
  ArrowRight,
  Refresh,
  CreditCard,
  DataAnalysis,
} from '@element-plus/icons-vue'

const props = defineProps({})

const emit = defineEmits(['loaded'])

const { $myFetch, $msg } = useNuxtApp()
const { userAccessKey } = useUserKey()
const username = useCookie('username')

// User Info State
const userInfo = reactive({
  id: 0,
  username: '',
  mail: '',
  phone: '',
  key: '',
  ip: '',
  login_time: '',
  create_time: '',
})

const total24h = ref(0)
const balance = ref(0)
const currentMonthTopUp = ref(0)
const totalTopUp = ref(0)

// Fetch Profile
const fetchProfile = async () => {
  try {
    const res = await $myFetch('Profile')
    if (res.code === 200) {
      const data = res.data
      userInfo.id = data.id
      userInfo.username = username.value || '用户'
      userInfo.mail = data.mail
      userInfo.ip = data.ip
      // Handle timestamps
      userInfo.create_time = data.create_time
        ? new Date(data.create_time).toLocaleString()
        : '-'
      userInfo.login_time = data.login_time
        ? new Date(data.login_time).toLocaleString()
        : '-'
      userInfo.key = userAccessKey.value
      // Assuming phone might be in data, or leave empty if not provided
      userInfo.phone = data.phone || ''

      // Calculate 24h total
      let total = 0
      ;(data.recent_request || []).forEach((element) => {
        total += Number(element?.number || 0)
      })
      total24h.value = total

      // Emit data for parent charts
      emit('loaded', {
        recent_request: data.recent_request || [],
        today_request: data.today_request || [],
      })
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  }
}

// Fetch Balance
const fetchBalance = async (showTip = false) => {
  try {
    const res = await $myFetch('UserBalance', {
      params: {
        username: username.value,
      },
    })
    if (res.code === 200) {
      const data = res.data || {}
      balance.value = Number(data.AccountBalance || 0)
      currentMonthTopUp.value = Number(data.CurrentMonthTopUp || 0)
      totalTopUp.value = Number(data.TotalTopUp || 0)
      if (showTip) $msg('余额刷新成功', 'success')
    } else {
      if (showTip) $msg(res.msg || '获取余额失败', 'error')
    }
  } catch (error) {
    if (showTip) $msg('获取余额失败', 'error')
  }
}

onMounted(() => {
  fetchProfile()
  fetchBalance()
})

// UI State
const activeTab = ref('details')

// Helper Methods
const formatCNY = (n) => {
  const num = Number(n || 0)
  return (
    '¥ ' +
    num.toLocaleString('zh-CN', {
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    })
  )
}

const handleRefreshBalance = () => {
  fetchBalance(true)
}

const copyKey = async () => {
  try {
    if (!userAccessKey.value) {
      $msg('暂无可复制的秘钥', 'warning')
      return
    }
    await navigator.clipboard.writeText(userAccessKey.value)
    $msg('秘钥已复制', 'success')
  } catch (error) {
    $msg('复制失败', 'error')
  }
}
</script>

<template>
  <div class="profile-section-full">
    <div class="basic-info-card">
      <!-- Left: Profile Summary -->
      <div class="profile-summary">
        <div class="summary-bg-decoration"></div>
        <div class="summary-content">
          <div class="summary-avatar">
            <span>{{
              userInfo.username?.charAt(0)?.toUpperCase() || 'U'
            }}</span>
          </div>
          <h3 class="summary-name">
            {{ userInfo.username || '用户' }}
          </h3>
          <p class="summary-id">UID: {{ userInfo.id || '-' }}</p>

          <div class="balance-card">
            <div class="card-pattern"></div>
            <div class="balance-header">
              <div class="label-wrap">
                <el-icon><Wallet /></el-icon>
                <span>账户余额</span>
              </div>
              <el-icon class="refresh-icon" @click="handleRefreshBalance"
                ><Refresh
              /></el-icon>
            </div>
            <div class="balance-value">
              {{ formatCNY(balance) }}
            </div>
            <div class="balance-footer">
              <el-button
                type="primary"
                size="small"
                round
                class="recharge-btn"
                @click="navigateTo('/admin/pay')"
              >
                充值
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Details & Key -->
      <div class="profile-details">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <el-tab-pane label="详细信息" name="details">
            <div class="info-grid">
              <!-- User Info -->
              <div class="info-item">
                <div class="icon-box green">
                  <el-icon><Phone /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">手机号码</div>
                  <div class="value">
                    {{ userInfo.phone || '未绑定' }}
                  </div>
                </div>
              </div>
              <div class="info-item">
                <div class="icon-box purple">
                  <el-icon><Message /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">邮箱地址</div>
                  <div class="value">
                    {{ userInfo.mail || '未绑定' }}
                  </div>
                </div>
              </div>
              <div class="info-item">
                <div class="icon-box orange">
                  <el-icon><Key /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">Secret Key</div>
                  <div
                    class="value key-value"
                    @click="copyKey"
                    title="点击复制"
                  >
                    {{ userInfo.key || '-' }}
                  </div>
                </div>
              </div>
              <div class="info-item">
                <div class="icon-box blue">
                  <el-icon><Location /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">登录IP</div>
                  <div class="value">{{ userInfo.ip || '-' }}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="icon-box purple">
                  <el-icon><Timer /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">登录时间</div>
                  <div class="value">
                    {{ userInfo.login_time || '-' }}
                  </div>
                </div>
              </div>
              <div class="info-item">
                <div class="icon-box green">
                  <el-icon><Timer /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">注册时间</div>
                  <div class="value">
                    {{ userInfo.create_time || '-' }}
                  </div>
                </div>
              </div>

              <!-- System Stats -->
              <div class="info-item">
                <div class="icon-box purple">
                  <el-icon><Wallet /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">账户余额</div>
                  <div class="value">
                    {{ formatCNY(balance) }}
                  </div>
                </div>
              </div>
              <div class="info-item">
                <div class="icon-box blue">
                  <el-icon><DataAnalysis /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">今日使用量</div>
                  <div class="value">{{ total24h }} 次</div>
                </div>
              </div>
              <div class="info-item">
                <div class="icon-box green">
                  <el-icon><Wallet /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">本月充值</div>
                  <div class="value">
                    {{ formatCNY(currentMonthTopUp) }}
                  </div>
                </div>
              </div>
              <div class="info-item">
                <div class="icon-box purple">
                  <el-icon><CreditCard /></el-icon>
                </div>
                <div class="info-content">
                  <div class="label">累计充值</div>
                  <div class="value">
                    {{ formatCNY(totalTopUp) }}
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="安全设置" name="security">
            <div class="security-list">
              <div class="security-item" @click="navigateTo('/admin/password')">
                <div class="left-info">
                  <div class="icon-box blue">
                    <el-icon><Lock /></el-icon>
                  </div>
                  <div class="text-info">
                    <div class="label">登录密码</div>
                    <div class="desc">定期修改密码以保护账号安全</div>
                  </div>
                </div>
                <el-icon class="arrow-icon"><ArrowRight /></el-icon>
              </div>

              <div class="security-item" @click="navigateTo('/admin/phone')">
                <div class="left-info">
                  <div class="icon-box green">
                    <el-icon><Phone /></el-icon>
                  </div>
                  <div class="text-info">
                    <div class="label">手机绑定</div>
                    <div class="desc">
                      {{
                        userInfo.phone
                          ? '已绑定手机：' + userInfo.phone
                          : '未绑定手机号码'
                      }}
                    </div>
                  </div>
                </div>
                <el-icon class="arrow-icon"><ArrowRight /></el-icon>
              </div>

              <div class="security-item" @click="navigateTo('/admin/email')">
                <div class="left-info">
                  <div class="icon-box purple">
                    <el-icon><Message /></el-icon>
                  </div>
                  <div class="text-info">
                    <div class="label">邮箱绑定</div>
                    <div class="desc">
                      {{
                        userInfo.mail
                          ? '已绑定邮箱：' + userInfo.mail
                          : '未绑定邮箱地址'
                      }}
                    </div>
                  </div>
                </div>
                <el-icon class="arrow-icon"><ArrowRight /></el-icon>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
// Profile Section (New Layout)
.profile-section-full {
  height: 620px;
  margin-bottom: 24px;
}

.basic-info-card {
  height: 100%;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eaecf0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  overflow: hidden;

  .profile-summary {
    width: 340px;
    background: #fff;
    border-right: 1px solid #f0f0f0;
    position: relative;
    flex-shrink: 0;

    .summary-bg-decoration {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 160px;
      background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%);
      z-index: 1;
    }

    .summary-content {
      position: relative;
      z-index: 2;
      padding: 60px 32px 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      height: 100%;
    }

    .summary-avatar {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      border: 4px solid #fff;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-5px);
      }

      span {
        font-size: 44px;
        color: #3b82f6;
        font-weight: 600;
      }
    }

    .summary-name {
      margin: 0 0 8px 0;
      font-size: 22px;
      font-weight: 700;
      color: #1a1f36;
      letter-spacing: -0.5px;
    }

    .summary-id {
      margin: 0 0 16px 0;
      font-size: 13px;
      color: #9ca3af;
      font-family: monospace;
      background: #f3f4f6;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .summary-status {
      margin-bottom: 32px;
      .custom-tag {
        padding: 0 16px;
        height: 28px;
        line-height: 26px;
      }
    }

    .balance-card {
      margin-top: auto;
      width: 100%;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      padding: 24px;
      border-radius: 16px;
      color: #fff;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
      text-align: left;
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-2px);
      }

      .card-pattern {
        position: absolute;
        top: -50px;
        right: -50px;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
      }

      .balance-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        opacity: 0.9;
        font-size: 14px;

        .label-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .refresh-icon {
          cursor: pointer;
          font-size: 16px;
          transition: transform 0.5s ease;

          &:hover {
            transform: rotate(180deg);
          }
        }
      }

      .balance-value {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 24px;
        letter-spacing: -0.5px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .balance-footer {
        display: flex;
        justify-content: flex-end;
        font-size: 12px;
        opacity: 0.9;

        .recharge-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff !important;
          padding: 8px 16px;
          height: auto;
          font-weight: 500 !important;
          backdrop-filter: blur(4px);
          transition: all 0.2s;

          &:hover {
            background: #fff;
            color: #2563eb !important;
            border-color: #fff;
          }
        }
      }
    }
  }

  .profile-details {
    flex: 1;
    padding: 32px 48px;
    overflow-y: auto;

    .profile-tabs {
      height: 100%;
      :deep(.el-tabs__header) {
        margin-bottom: 24px;
      }
      :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
        background-color: #f3f4f6;
      }
      :deep(.el-tabs__item) {
        font-size: 16px;
        color: #64748b;
        &.is-active {
          color: #3b82f6;
          font-weight: 600;
        }
      }
      :deep(.el-tabs__active-bar) {
        background-color: #3b82f6;
        height: 3px;
        border-radius: 3px;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: #f9fafb;
        border-radius: 12px;
        border: 1px solid #f3f4f6;
        transition: all 0.2s;

        &:hover {
          background: #fff;
          border-color: #eaecf0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        .icon-box {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;

          &.blue {
            background: #eff6ff;
            color: #3b82f6;
          }
          &.purple {
            background: #f5f3ff;
            color: #8b5cf6;
          }
          &.green {
            background: #ecfdf5;
            color: #10b981;
          }
          &.orange {
            background: #fff7ed;
            color: #f97316;
          }
        }

        .info-content {
          min-width: 0;
          flex: 1;

          .label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .value {
            font-size: 15px;
            color: #1a1f36;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            &.key-value {
              cursor: pointer;
              font-family: monospace;
              color: #3b82f6;
              &:hover {
                text-decoration: underline;
              }
            }
          }
        }
      }
    }

    .security-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .security-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: #f9fafb;
        border-radius: 12px;
        border: 1px solid #f3f4f6;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #fff;
          border-color: #eaecf0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          transform: translateX(4px);
        }

        .left-info {
          display: flex;
          align-items: center;
          gap: 16px;

          .icon-box {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;

            &.blue {
              background: #eff6ff;
              color: #3b82f6;
            }
            &.green {
              background: #ecfdf5;
              color: #10b981;
            }
            &.purple {
              background: #f5f3ff;
              color: #8b5cf6;
            }
          }

          .text-info {
            .label {
              font-size: 15px;
              font-weight: 600;
              color: #1a1f36;
              margin-bottom: 2px;
            }
            .desc {
              font-size: 13px;
              color: #6b7280;
            }
          }
        }

        .arrow-icon {
          color: #9ca3af;
          font-size: 16px;
        }
      }
    }
  }
}

// Responsive
@media screen and (max-width: 1200px) {
  .profile-section-full {
    height: auto !important;
  }

  .basic-info-card {
    flex-direction: column;
    height: auto !important;

    .profile-summary {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #f0f0f0;

      .summary-content {
        padding: 40px 20px;
      }
    }

    .profile-details {
      padding: 24px;
    }
  }
}

@media screen and (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
