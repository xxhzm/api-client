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
  User,
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
  const key = userInfo.key || userAccessKey.value
  if (!key) {
    $msg('暂无可复制的秘钥', 'warning')
    return
  }

  try {
    // 优先使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(key)
      $msg('秘钥已复制', 'success')
      return
    }

    // Fallback: 使用传统方式
    const textArea = document.createElement('textarea')
    textArea.value = key
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    textArea.style.top = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (successful) {
      $msg('秘钥已复制', 'success')
    } else {
      $msg('复制失败，请手动复制', 'error')
    }
  } catch (error) {
    $msg('复制失败，请手动复制', 'error')
  }
}
</script>

<template>
  <div class="enterprise-profile-card">
    <!-- Left Panel: User Overview -->
    <div class="profile-panel">
      <div class="panel-header">
        <div class="header-pattern"></div>
        <div class="header-content">
          <div class="avatar-wrapper">
            <div class="avatar">
              <span>{{ userInfo.username?.charAt(0)?.toUpperCase() || 'U' }}</span>
            </div>
            <div class="status-indicator"></div>
          </div>
          <div class="user-meta">
            <h2 class="username">{{ userInfo.username || '用户' }}</h2>
            <div class="user-id">
              <el-icon><User /></el-icon>
              <span>UID: {{ userInfo.id || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Balance Widget -->
      <div class="balance-widget">
        <div class="widget-header">
          <div class="widget-title">
            <el-icon class="wallet-icon"><Wallet /></el-icon>
            <span>账户资产</span>
          </div>
          <button class="refresh-btn" @click="handleRefreshBalance">
            <el-icon><Refresh /></el-icon>
          </button>
        </div>
        <div class="balance-amount">
          <span class="currency">¥</span>
          <span class="amount">{{ balance.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        </div>
        <div class="balance-stats">
          <div class="stat-item">
            <span class="stat-label">本月充值</span>
            <span class="stat-value">{{ formatCNY(currentMonthTopUp) }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">累计充值</span>
            <span class="stat-value">{{ formatCNY(totalTopUp) }}</span>
          </div>
        </div>
        <el-button type="primary" class="recharge-action" @click="navigateTo('/admin/pay')">
          立即充值
        </el-button>
      </div>

    </div>

    <!-- Right Panel: Details -->
    <div class="details-panel">
      <el-tabs v-model="activeTab" class="enterprise-tabs">
        <el-tab-pane label="账户信息" name="details">
          <div class="info-section">
            <h3 class="section-title">
              <el-icon><User /></el-icon>
              基本信息
            </h3>
            <div class="info-table">
              <div class="info-row">
                <div class="info-cell">
                  <span class="cell-label">手机号码</span>
                  <span class="cell-value">{{ userInfo.phone || '未绑定' }}</span>
                </div>
                <div class="info-cell">
                  <span class="cell-label">邮箱地址</span>
                  <span class="cell-value">{{ userInfo.mail || '未绑定' }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-cell">
                  <span class="cell-label">登录 IP</span>
                  <span class="cell-value mono">{{ userInfo.ip || '-' }}</span>
                </div>
                <div class="info-cell">
                  <span class="cell-label">最近登录</span>
                  <span class="cell-value">{{ userInfo.login_time || '-' }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-cell">
                  <span class="cell-label">注册时间</span>
                  <span class="cell-value">{{ userInfo.create_time || '-' }}</span>
                </div>
                <div class="info-cell">
                  <span class="cell-label">今日调用</span>
                  <span class="cell-value highlight">{{ total24h }} 次</span>
                </div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3 class="section-title">
              <el-icon><Key /></el-icon>
              API 密钥
            </h3>
            <div class="key-display">
              <div class="key-content">
                <code class="key-text">{{ userInfo.key || '-' }}</code>
              </div>
              <el-button type="primary" plain size="small" @click="copyKey">
                复制密钥
              </el-button>
            </div>
            <p class="key-hint">请妥善保管您的 API 密钥，不要泄露给他人</p>
          </div>

        </el-tab-pane>

        <el-tab-pane label="安全中心" name="security">
          <div class="security-section">
            <div class="security-header">
              <el-icon><Lock /></el-icon>
              <div class="security-meta">
                <h3>账号安全</h3>
                <p>管理您的账号安全设置，保护账户资产</p>
              </div>
            </div>

            <div class="security-options">
              <div class="security-option" @click="navigateTo('/admin/password')">
                <div class="option-icon blue">
                  <el-icon><Lock /></el-icon>
                </div>
                <div class="option-content">
                  <h4>登录密码</h4>
                  <p>定期修改密码以保护账号安全</p>
                </div>
                <div class="option-action">
                  <span class="action-text">修改</span>
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>

              <div class="security-option" @click="navigateTo('/admin/phone')">
                <div class="option-icon green">
                  <el-icon><Phone /></el-icon>
                </div>
                <div class="option-content">
                  <h4>手机绑定</h4>
                  <p>{{ userInfo.phone ? '已绑定：' + userInfo.phone : '未绑定手机号码' }}</p>
                </div>
                <div class="option-action">
                  <span class="action-text">{{ userInfo.phone ? '更换' : '绑定' }}</span>
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>

              <div class="security-option" @click="navigateTo('/admin/email')">
                <div class="option-icon purple">
                  <el-icon><Message /></el-icon>
                </div>
                <div class="option-content">
                  <h4>邮箱绑定</h4>
                  <p>{{ userInfo.mail ? '已绑定：' + userInfo.mail : '未绑定邮箱地址' }}</p>
                </div>
                <div class="option-action">
                  <span class="action-text">{{ userInfo.mail ? '更换' : '绑定' }}</span>
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style lang="less" scoped>
.enterprise-profile-card {
  display: flex;
  gap: 24px;
  min-height: 580px;
  align-items: stretch;
}

// Left Panel Styles
.profile-panel {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-header {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  position: relative;

  .header-pattern {
    height: 80px;
    background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
  }

  .header-content {
    padding: 0 24px 24px;
    margin-top: -40px;
    position: relative;
    z-index: 1;
  }

  .avatar-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 16px;
  }

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 4px solid #fff;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);

    span {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
    }
  }

  .status-indicator {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #10b981;
    border: 3px solid #fff;
  }

  .user-meta {
    .username {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.025em;
    }

    .user-id {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: #f3f4f6;
      border-radius: 6px;
      font-size: 13px;
      color: #6b7280;

      .el-icon {
        font-size: 14px;
      }
    }
  }
}

.balance-widget {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  display: flex;
  flex-direction: column;

  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .widget-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;

    .wallet-icon {
      font-size: 18px;
      color: #2563eb;
    }
  }

  .refresh-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.2s;

    &:hover {
      border-color: #2563eb;
      color: #2563eb;
      background: #eff6ff;
    }

    .el-icon {
      font-size: 16px;
    }
  }

  .balance-amount {
    margin-bottom: 20px;

    .currency {
      font-size: 18px;
      font-weight: 600;
      color: #6b7280;
      margin-right: 4px;
    }

    .amount {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.025em;
    }
  }

  .balance-stats {
    display: flex;
    align-items: center;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 20px;

    .stat-item {
      flex: 1;
      text-align: center;

      .stat-label {
        display: block;
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 4px;
      }

      .stat-value {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      }
    }

    .stat-divider {
      width: 1px;
      height: 32px;
      background: #e5e7eb;
    }
  }

  .recharge-action {
    width: 100%;
    height: 44px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 8px;
    margin-top: auto;
  }
}

// Right Panel Styles
.details-panel {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px 32px;
  overflow: hidden;

  .enterprise-tabs {
    height: 100%;

    :deep(.el-tabs__header) {
      margin-bottom: 28px;
      border-bottom: 1px solid #e5e7eb;
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-tabs__item) {
      font-size: 15px;
      font-weight: 500;
      color: #6b7280;
      padding: 0 4px;
      height: 48px;

      &.is-active {
        color: #2563eb;
        font-weight: 600;
      }

      &:hover {
        color: #2563eb;
      }
    }

    :deep(.el-tabs__active-bar) {
      background: #2563eb;
      height: 2px;
      border-radius: 1px;
    }
  }
}

.info-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f3f4f6;

    .el-icon {
      font-size: 18px;
      color: #2563eb;
    }
  }
}

.info-table {
  .info-row {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .info-cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 16px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #f3f4f6;

    &.full {
      flex: 100%;
    }

    .cell-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .cell-value {
      font-size: 14px;
      color: #111827;
      font-weight: 500;

      &.mono {
        font-family: 'SF Mono', SFMono-Regular, ui-monospace, monospace;
      }

      &.highlight {
        color: #2563eb;
        font-weight: 600;
      }
    }
  }
}

.key-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;

  .key-content {
    flex: 1;
    overflow: hidden;
  }

  .key-text {
    display: block;
    font-family: 'SF Mono', SFMono-Regular, ui-monospace, monospace;
    font-size: 13px;
    color: #334155;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: none;
  }
}

.key-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '•';
    color: #cbd5e1;
  }
}

// Security Section
.security-section {
  .security-header {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-radius: 12px;
    margin-bottom: 24px;

    > .el-icon {
      width: 48px;
      height: 48px;
      background: #fff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #059669;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(5, 150, 105, 0.15);
    }

    .security-meta {
      h3 {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 600;
        color: #065f46;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: #047857;
      }
    }
  }
}

.security-options {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .security-option {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px 20px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #d1d5db;
      background: #fafafa;

      .option-action {
        color: #2563eb;
      }
    }

    .option-icon {
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
        color: #2563eb;
      }

      &.green {
        background: #ecfdf5;
        color: #059669;
      }

      &.purple {
        background: #f5f3ff;
        color: #7c3aed;
      }
    }

    .option-content {
      flex: 1;
      min-width: 0;

      h4 {
        margin: 0 0 4px;
        font-size: 15px;
        font-weight: 600;
        color: #111827;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: #6b7280;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .option-action {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #9ca3af;
      transition: color 0.2s;

      .action-text {
        font-size: 13px;
        font-weight: 500;
      }

      .el-icon {
        font-size: 16px;
      }
    }
  }
}

// Responsive Styles
@media screen and (max-width: 1200px) {
  .enterprise-profile-card {
    flex-direction: column;
  }

  .profile-panel {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;

    .panel-header {
      flex: 1;
      min-width: 280px;
    }

    .balance-widget {
      flex: 1;
      min-width: 280px;
    }

    .quick-stats {
      width: 100%;
    }
  }
}

@media screen and (max-width: 768px) {
  .enterprise-profile-card {
    gap: 16px;
    min-height: auto;
  }

  .profile-panel {
    flex-direction: column;

    .panel-header,
    .balance-widget {
      min-width: 100%;
    }
  }

  .details-panel {
    padding: 20px;
  }

  .info-table .info-row {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
