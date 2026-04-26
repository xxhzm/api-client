<script setup>
import { Clock } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const orderId = computed(() => route.params.id)
const isAdmin = computed(() => route.query.from === 'admin')

const loading = ref(true)
const orderInfo = ref(null)
const orderMessages = ref([])
const replyContent = ref('')
const replyLoading = ref(false)

const { typeMap, priorityMap, statusMap, getStatusTagType, getPriorityTagType, formatTime } = useWorkOrder()

// 获取工单详情（含回复记录）
const fetchDetail = async () => {
  if (!orderId.value) return
  try {
    const res = await $myFetch('WorkOrderDetail', {
      params: { order_id: orderId.value },
    })
    if (res.code === 200 && res.data) {
      const { replies, ...info } = res.data
      orderInfo.value = info
      orderMessages.value = replies || []
    }
  } catch (error) {
    console.error(error)
  }
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    $msg('请输入回复内容', 'warning')
    return
  }

  replyLoading.value = true
  try {
    const apiBodyValue = new URLSearchParams()
    apiBodyValue.append('orderId', orderId.value)
    apiBodyValue.append('content', replyContent.value)

    const fetchOptions = {
      method: 'POST',
      body: apiBodyValue,
    }
    if (isAdmin.value) {
      fetchOptions.params = { action: 'reply' }
    }

    const res = await $myFetch('ReplyWorkOrder', fetchOptions)

    if (res.code === 200) {
      $msg('回复成功', 'success')
      replyContent.value = ''
      await fetchDetail()
    } else {
      $msg(res.msg || '回复失败', 'error')
    }
  } catch (error) {
    $msg('回复失败', 'error')
  } finally {
    replyLoading.value = false
  }
}

// 完结工单
const handleCloseOrder = async () => {
  try {
    const res = await $myFetch('CloseWorkOrder', {
      params: { order_id: orderId.value },
    })

    if (res.code === 200) {
      $msg('工单已完结', 'success')
      await fetchDetail()
    } else {
      $msg(res.msg || '操作失败', 'error')
    }
  } catch (error) {
    $msg('操作失败', 'error')
  }
}

// 返回列表
const goBack = () => {
  navigateTo(isAdmin.value ? '/admin/workorder' : '/admin/myworkorder')
}

// 格式化日期
const formatDate = (time) => {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 格式化时分
const formatHM = (time) => {
  if (!time) return ''
  const d = new Date(time)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 获取头像背景色
const getAvatarColor = (action) => {
  return action === 'reply' ? '#e6a23c' : '#409eff'
}

// 按日期分组消息
const groupedMessages = computed(() => {
  const groups = []
  let currentDate = ''
  for (const msg of orderMessages.value) {
    const date = formatDate(msg.create_time)
    if (date !== currentDate) {
      currentDate = date
      groups.push({ date, messages: [] })
    }
    groups[groups.length - 1].messages.push(msg)
  }
  return groups
})

// 定时刷新消息（每10秒）
let refreshTimer = null
const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    fetchDetail()
  }, 10000)
}

onMounted(async () => {
  if (!orderId.value) {
    $msg('缺少工单ID', 'error')
    goBack()
    return
  }
  await fetchDetail()
  loading.value = false
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

useHead({
  title: '工单详情',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="detail-page" v-loading="loading">
    <template v-if="orderInfo">
      <!-- 工单信息卡片 -->
      <div class="info-card">
        <div class="info-card-header">
          <div class="title-section">
            <h2 class="order-title">{{ orderInfo.title }}</h2>
            <el-tag
              :type="getStatusTagType(orderInfo.status)"
              size="large"
              effect="dark"
            >
              {{ statusMap[orderInfo.status] || '未知' }}
            </el-tag>
          </div>
          <div class="action-section">
            <el-popconfirm
              v-if="String(orderInfo.status) !== '2'"
              title="确定要完结此工单吗？"
              @confirm="handleCloseOrder"
            >
              <template #reference>
                <el-button type="success" plain>完结工单</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">工单编号</span>
            <span class="info-value">#{{ orderInfo.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">工单类型</span>
            <span class="info-value">{{
              typeMap[orderInfo.type] || '未知'
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">优先级</span>
            <span class="info-value">
              <el-tag
                :type="getPriorityTagType(orderInfo.priority)"
                size="small"
              >
                {{ priorityMap[orderInfo.priority] || '普通' }}
              </el-tag>
            </span>
          </div>
          <div class="info-item" v-if="isAdmin">
            <span class="info-label">提交用户</span>
            <span class="info-value">{{
              orderInfo.username || '-'
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{
              formatTime(orderInfo.create_time)
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">更新时间</span>
            <span class="info-value">{{
              formatTime(orderInfo.update_time)
            }}</span>
          </div>
        </div>
      </div>

      <!-- 沟通记录 -->
      <div class="chat-card">
        <div class="chat-card-header">
          <span>沟通记录</span>
          <span class="msg-count">{{ orderMessages.length }} 条</span>
        </div>

        <div class="timeline-container">
          <template v-if="orderMessages.length === 0">
            <div class="empty-msg">暂无沟通记录</div>
          </template>

          <div
            v-for="(group, gIdx) in groupedMessages"
            :key="gIdx"
            class="date-group"
          >
            <div class="date-divider">
              <span>{{ group.date }}</span>
            </div>

            <div
              v-for="(msg, idx) in group.messages"
              :key="idx"
              class="timeline-item"
              :class="{ 'is-admin': msg.action === 'reply' }"
            >
              <div class="timeline-dot">
                <div
                  class="avatar"
                  :style="{ background: getAvatarColor(msg.action) }"
                >
                  {{ msg.action === 'reply' ? '客' : '用' }}
                </div>
              </div>
              <div class="timeline-content">
                <div class="msg-meta">
                  <span class="msg-sender">{{
                    msg.username || '用户'
                  }}</span>
                  <span class="msg-role-tag" v-if="msg.action === 'reply'"
                    >客服</span
                  >
                  <span class="msg-time">{{ formatHM(msg.create_time) }}</span>
                </div>
                <div class="msg-body">{{ msg.content }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 回复区域 -->
      <div class="reply-card" v-if="String(orderInfo.status) !== '2'">
        <div class="reply-card-header">
          <span>回复工单</span>
        </div>
        <div class="reply-body">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="5"
            placeholder="请输入回复内容..."
            resize="vertical"
          />
          <div class="reply-footer">
            <el-button
              type="primary"
              :loading="replyLoading"
              @click="submitReply"
              size="large"
            >
              提交回复
            </el-button>
          </div>
        </div>
      </div>

      <div class="closed-banner" v-else>
        <el-icon><Clock /></el-icon>
        <span>此工单已完结，无法继续回复</span>
      </div>
    </template>
  </div>
</template>

<style lang="less" scoped>
.detail-page {
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;
}

/* 工单信息卡片 */
.info-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;

  .info-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .title-section {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;

      .order-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin: 0;
        line-height: 1.3;
      }
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px 40px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;

    .info-item {
      display: flex;
      align-items: baseline;
      gap: 8px;

      .info-label {
        font-size: 13px;
        color: #8c8c8c;
        flex-shrink: 0;
        min-width: 56px;

        &::after {
          content: '：';
        }
      }

      .info-value {
        font-size: 13px;
        color: #303133;
      }
    }
  }
}

/* 沟通记录卡片 */
.chat-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;

  .chat-card-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    line-height: 1.3;
    margin-bottom: 16px;

    .msg-count {
      font-size: 12px;
      color: #8c8c8c;
      font-weight: 400;
      margin-left: 4px;
    }
  }
}

.timeline-container {
  padding: 0;

  .empty-msg {
    text-align: center;
    color: #909399;
    padding: 40px 0;
    font-size: 13px;
  }
}

/* 日期分组 */
.date-group {
  .date-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 16px 0;

    &:first-child {
      margin-top: 0;
    }

    span {
      background: #f0f0f0;
      color: #8c8c8c;
      font-size: 12px;
      padding: 2px 12px;
      border-radius: 4px;
    }
  }
}

/* 时间线消息 */
.timeline-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .timeline-dot {
    flex-shrink: 0;

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
    }
  }

  .timeline-content {
    flex: 1;
    min-width: 0;

    .msg-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;

      .msg-sender {
        font-size: 13px;
        font-weight: 600;
        color: #303133;
      }

      .msg-role-tag {
        font-size: 11px;
        color: #e6a23c;
        background: #fdf6ec;
        border: 1px solid #f5dab1;
        padding: 0 6px;
        border-radius: 2px;
        font-weight: 500;
        line-height: 18px;
      }

      .msg-time {
        font-size: 12px;
        color: #bfbfbf;
      }
    }

    .msg-body {
      background: #f5f7fa;
      border-left: 3px solid #dcdfe6;
      padding: 12px 14px;
      color: #333;
      font-size: 13px;
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  &.is-admin .timeline-content .msg-body {
    background: #fffbe6;
    border-left-color: #e6a23c;
  }
}

/* 回复区域 */
.reply-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px 20px;

  .reply-card-header {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    line-height: 1.3;
    margin-bottom: 16px;
  }

  .reply-body {
    padding: 0;

    :deep(.el-textarea__inner) {
      font-size: 13px;
      line-height: 1.6;
      border-radius: 6px;
    }
  }

  .reply-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }
}

/* 已完结提示 */
.closed-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px 20px;
  color: #909399;
  font-size: 13px;

  .el-icon {
    font-size: 16px;
  }
}

/* 响应式 */
@media screen and (max-width: 768px) {
  .detail-page {
    padding: 12px;
  }

  .info-card {
    padding: 14px;

    .info-card-header {
      flex-direction: column;
      gap: 12px;
    }

    .info-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }

  .chat-card,
  .reply-card,
  .closed-banner {
    padding: 14px;
  }
}
</style>
