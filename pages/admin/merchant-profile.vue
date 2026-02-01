<script setup>
import {
  Shop,
  User,
  Phone,
  Message,
  OfficeBuilding,
  Document,
  Wallet,
  Refresh,
  CircleCheck,
  Clock,
  Coin,
  TrendCharts,
  ArrowRight,
} from '@element-plus/icons-vue'
import { markRaw } from 'vue'

definePageMeta({
  layout: 'admin',
})

const { $myFetch, $msg } = useNuxtApp()

// 加载状态
const loading = ref(true)

// 商户信息
const merchantInfo = reactive({
  id: 0,
  merchant_name: '',
  company_name: '',
  credit_code: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  description: '',
  logo: '',
  commission_rate: 0,
  balance: '0',
  status: 0,
  is_display: 0,
  is_verified: 0,
  created_at: 0,
})

// 获取商户信息
const fetchMerchantProfile = async () => {
  loading.value = true
  try {
    const res = await $myFetch('MerchantProfile')
    if (res.code === 200) {
      const data = res.data || {}
      Object.assign(merchantInfo, {
        id: data.id || 0,
        merchant_name: data.merchant_name || '',
        company_name: data.company_name || '',
        credit_code: data.credit_code || '',
        contact_name: data.contact_name || '',
        contact_phone: data.contact_phone || '',
        contact_email: data.contact_email || '',
        description: data.description || '',
        logo: data.logo || '',
        commission_rate: data.commission_rate || 0,
        balance: data.balance || '0',
        status: data.status || 0,
        is_display: data.is_display || 0,
        is_verified: data.is_verified || 0,
        created_at: data.created_at || 0,
      })
    } else {
      $msg(res.msg || '获取商户信息失败', 'error')
    }
  } catch (error) {
    $msg('获取商户信息失败', 'error')
  } finally {
    loading.value = false
  }
}

// 格式化时间戳
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(Number(timestamp))
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化金额
const formatCNY = (n) => {
  const num = Number(n || 0)
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝',
  }
  return statusMap[status] || '未知'
}

// 刷新数据
const handleRefresh = () => {
  fetchMerchantProfile()
  $msg('刷新成功', 'success')
}

// 计算入驻天数
const getDaysJoined = computed(() => {
  if (!merchantInfo.created_at) return 0
  const now = Date.now()
  const created = Number(merchantInfo.created_at)
  return Math.floor((now - created) / (1000 * 60 * 60 * 24))
})

// 资源统计
const resourceStats = ref([
  { icon: markRaw(Wallet), title: '账户余额', value: 0, unit: '元', color: '#409eff', bgColor: '#ecf5ff' },
  { icon: markRaw(Coin), title: '分成比例', value: 0, unit: '%', color: '#e6a23c', bgColor: '#fdf6ec' },
  { icon: markRaw(Clock), title: '入驻天数', value: 0, unit: '天', color: '#67c23a', bgColor: '#f0f9eb' },
  { icon: markRaw(TrendCharts), title: '分成记录', value: '查看', unit: '', color: '#909399', bgColor: '#f4f4f5', isLink: true },
])

// 更新资源统计数据
watch(merchantInfo, () => {
  resourceStats.value[0].value = formatCNY(merchantInfo.balance)
  resourceStats.value[1].value = merchantInfo.commission_rate
  resourceStats.value[2].value = getDaysJoined.value
}, { immediate: true, deep: true })

onMounted(() => {
  fetchMerchantProfile()
})

useHead({
  title: '商户资料',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="merchant-profile-page" v-loading="loading">
    <div class="page-layout">
      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 资源概览 -->
        <div class="card merchant-resources">
          <div class="card-header">
            <span class="card-title">商户概览</span>
            <span class="card-link" @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </span>
          </div>
          <div class="resource-grid">
            <div
              v-for="stat in resourceStats"
              :key="stat.title"
              class="resource-item"
              :class="{ clickable: stat.isLink }"
              @click="stat.isLink && navigateTo('/admin/merchant-commission-log')"
            >
              <div class="resource-icon" :style="{ backgroundColor: stat.bgColor }">
                <el-icon :style="{ color: stat.color }">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <span class="resource-title">{{ stat.title }}</span>
              <span class="resource-count" v-if="!stat.isLink">
                {{ stat.value }}
                <small>{{ stat.unit }}</small>
              </span>
              <span class="resource-link" v-else>
                {{ stat.value }}
                <el-icon><ArrowRight /></el-icon>
              </span>
            </div>
          </div>
        </div>

        <!-- 企业信息 -->
        <div class="card company-info">
          <div class="card-header">
            <span class="card-title">企业信息</span>
          </div>
          <div class="info-list">
            <div class="info-row">
              <span class="info-label">企业名称</span>
              <span class="info-value">{{ merchantInfo.company_name || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">统一社会信用代码</span>
              <span class="info-value code">{{ merchantInfo.credit_code || '-' }}</span>
            </div>
            <div class="info-row" v-if="merchantInfo.description">
              <span class="info-label">企业简介</span>
              <span class="info-value desc">{{ merchantInfo.description }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">入驻时间</span>
              <span class="info-value">{{ formatTimestamp(merchantInfo.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- 联系信息 -->
        <div class="card contact-info">
          <div class="card-header">
            <span class="card-title">联系信息</span>
          </div>
          <div class="contact-grid">
            <div class="contact-item">
              <div class="contact-icon" style="background-color: #ecf5ff">
                <el-icon style="color: #409eff"><User /></el-icon>
              </div>
              <div class="contact-content">
                <span class="contact-label">联系人</span>
                <span class="contact-value">{{ merchantInfo.contact_name || '-' }}</span>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon" style="background-color: #f0f9eb">
                <el-icon style="color: #67c23a"><Phone /></el-icon>
              </div>
              <div class="contact-content">
                <span class="contact-label">联系电话</span>
                <span class="contact-value">{{ merchantInfo.contact_phone || '-' }}</span>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon" style="background-color: #fdf6ec">
                <el-icon style="color: #e6a23c"><Message /></el-icon>
              </div>
              <div class="contact-content">
                <span class="contact-label">联系邮箱</span>
                <span class="contact-value">{{ merchantInfo.contact_email || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="sidebar">
        <!-- 商户卡片 -->
        <div class="card merchant-card">
          <div class="merchant-header">
            <div class="merchant-avatar">
              <img v-if="merchantInfo.logo" :src="merchantInfo.logo" alt="logo" />
              <el-icon v-else><Shop /></el-icon>
            </div>
            <div class="merchant-meta">
              <div class="merchant-name">
                {{ merchantInfo.merchant_name || '商户名称' }}
                <el-tag v-if="merchantInfo.is_verified" size="small" type="success" effect="dark">已认证</el-tag>
              </div>
              <div class="merchant-id">
                商户 ID
                <span class="id-value">{{ merchantInfo.id || '-' }}</span>
              </div>
            </div>
          </div>
          <div class="merchant-status">
            <div class="status-item">
              <span class="item-label">审核状态</span>
              <span :class="['status', merchantInfo.status === 1 ? 'verified' : 'unverified']">
                <el-icon v-if="merchantInfo.status === 1"><CircleCheck /></el-icon>
                {{ getStatusText(merchantInfo.status) }}
              </span>
            </div>
            <div class="status-item">
              <span class="item-label">平台展示</span>
              <span :class="['status', merchantInfo.is_display ? 'verified' : 'unverified']">
                <el-icon v-if="merchantInfo.is_display"><CircleCheck /></el-icon>
                {{ merchantInfo.is_display ? '已展示' : '未展示' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 费用信息 -->
        <div class="card billing-card">
          <div class="card-header">
            <span class="card-title">费用信息</span>
            <div class="billing-links">
              <span @click="navigateTo('/admin/merchant-commission-log')">分成记录</span>
            </div>
          </div>
          <div class="balance-section">
            <div class="balance-label">账户余额 (元)</div>
            <div class="balance-row">
              <span class="balance-amount">{{ formatCNY(merchantInfo.balance) }}</span>
            </div>
          </div>
          <div class="billing-stats">
            <div class="billing-stat">
              <span class="stat-label">分成比例</span>
              <span class="stat-value">{{ merchantInfo.commission_rate }}%</span>
            </div>
            <div class="billing-stat">
              <span class="stat-label">入驻天数</span>
              <span class="stat-value">{{ getDaysJoined }} 天</span>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="card quick-actions-card">
          <div class="card-header">
            <span class="card-title">快捷操作</span>
          </div>
          <div class="quick-action-list">
            <div class="quick-action-item" @click="navigateTo('/admin/merchant-commission-log')">
              <el-icon><TrendCharts /></el-icon>
              <span>分成记录</span>
            </div>
            <div class="quick-action-item" @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              <span>刷新数据</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.merchant-profile-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.page-layout {
  display: flex;
  gap: 20px;
  width: 100%;
}

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// Card Base
.card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 16px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .card-link {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #409eff;
    cursor: pointer;

    &:hover {
      color: #66b1ff;
    }

    .el-icon {
      font-size: 12px;
    }
  }
}

// 资源概览
.merchant-resources {
  .resource-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .resource-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    transition: all 0.2s;

    &:hover {
      background: #f5f7fa;
      border-color: #e4e7ed;
    }

    &.clickable {
      cursor: pointer;

      &:hover {
        border-color: #409eff;
        background: #ecf5ff;
      }
    }

    .resource-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;

      .el-icon {
        font-size: 20px;
      }
    }

    .resource-title {
      font-size: 13px;
      color: #909399;
      margin-bottom: 6px;
    }

    .resource-count {
      font-size: 22px;
      font-weight: 600;
      color: #303133;

      small {
        font-size: 13px;
        font-weight: 400;
        color: #909399;
        margin-left: 4px;
      }
    }

    .resource-link {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 500;
      color: #409eff;

      .el-icon {
        font-size: 14px;
      }
    }
  }
}

// 企业信息
.company-info {
  .info-list {
    display: flex;
    flex-direction: column;
  }

  .info-row {
    display: flex;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
  }

  .info-label {
    width: 140px;
    flex-shrink: 0;
    font-size: 13px;
    color: #909399;
  }

  .info-value {
    flex: 1;
    font-size: 13px;
    color: #303133;

    &.code {
      font-family: 'SF Mono', SFMono-Regular, ui-monospace, monospace;
    }

    &.desc {
      line-height: 1.6;
      color: #606266;
    }
  }
}

// 联系信息
.contact-info {
  .contact-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
  }

  .contact-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .el-icon {
      font-size: 18px;
    }
  }

  .contact-content {
    flex: 1;
    min-width: 0;
  }

  .contact-label {
    display: block;
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }

  .contact-value {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
    word-break: break-all;
  }
}

// 商户卡片
.merchant-card {
  .merchant-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
  }

  .merchant-avatar {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .el-icon {
      font-size: 28px;
      color: #fff;
    }
  }

  .merchant-meta {
    flex: 1;
    min-width: 0;
  }

  .merchant-name {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .merchant-id {
    font-size: 13px;
    color: #909399;

    .id-value {
      margin-left: 8px;
      color: #606266;
      font-weight: 500;
    }
  }

  .merchant-status {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #606266;
    padding: 10px 12px;
    background: #fafafa;
    border-radius: 6px;
    border: 1px solid #f0f0f0;

    .item-label {
      color: #909399;
      font-size: 12px;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: auto;

      &.verified {
        background: #f0f9eb;
        color: #67c23a;
      }

      &.unverified {
        background: #fdf6ec;
        color: #e6a23c;
      }

      .el-icon {
        font-size: 12px;
      }
    }
  }
}

// 费用信息
.billing-card {
  .billing-links {
    display: flex;
    gap: 12px;

    span {
      font-size: 12px;
      color: #909399;
      cursor: pointer;

      &:hover {
        color: #409eff;
      }
    }
  }

  .balance-section {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
  }

  .balance-label {
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;
  }

  .balance-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .balance-amount {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
  }

  .billing-stats {
    display: flex;
    gap: 16px;
  }

  .billing-stat {
    flex: 1;
    padding: 12px;
    background: #fafafa;
    border-radius: 6px;
    border: 1px solid #f0f0f0;

    .stat-label {
      display: block;
      font-size: 12px;
      color: #909399;
      margin-bottom: 6px;
    }

    .stat-value {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }
}

// 快捷操作
.quick-actions-card {
  .quick-action-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .quick-action-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #ecf5ff;
      border-color: #b3d8ff;
      color: #409eff;

      .el-icon {
        color: #409eff;
      }
    }

    .el-icon {
      font-size: 16px;
      color: #909399;
    }
  }
}

// 响应式
@media screen and (max-width: 1200px) {
  .page-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;

    .card {
      flex: 1;
      min-width: 280px;
    }
  }

  .merchant-resources .resource-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .contact-info .contact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .merchant-profile-page {
    padding: 12px;
  }

  .sidebar {
    flex-direction: column;

    .card {
      min-width: 100%;
    }
  }

  .merchant-resources .resource-grid {
    grid-template-columns: 1fr;
  }

  .contact-info .contact-grid {
    grid-template-columns: 1fr;
  }

  .billing-card .billing-stats {
    flex-direction: column;
  }

  .quick-actions-card .quick-action-list {
    grid-template-columns: 1fr;
  }
}
</style>
