<script setup>
import { ChatDotRound, Delete, View } from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'AI会话管理',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})

// 会话列表
const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(20)
const totalRecords = ref(0)
const pageLoading = ref(false)

// 获取会话列表
const getData = async () => {
  loading.value = true
  try {
    const res = await $myFetch('ChatConversationList', {
      params: {
        page: page.value,
        pageSize: pageSize.value,
      },
    })

    if (res.code !== 200) {
      $msg(res.msg || '获取会话列表失败', 'error')
      tableData.value = []
      totalRecords.value = 0
      return
    }

    tableData.value = (res.data.list || []).map((item) => ({
      ...item,
      create_time_fmt: formatTimestamp(item.create_time),
      update_time_fmt: formatTimestamp(item.update_time),
    }))
    totalRecords.value = res.data.count || 0
  } catch (error) {
    $msg('获取会话列表失败', 'error')
  } finally {
    loading.value = false
  }
}

// 删除会话
const handleDelete = async (row) => {
  try {
    const res = await $myFetch('ChatConversationDelete', {
      params: {
        conversation_id: row.id,
      },
    })

    if (res.code === 200) {
      $msg('删除成功', 'success')
      await getData()
    } else {
      $msg(res.msg || '删除失败', 'error')
    }
  } catch (error) {
    $msg('删除失败', 'error')
  }
}

// 查看会话消息
const messageDialogVisible = ref(false)
const messageLoading = ref(false)
const messageList = ref([])
const currentConversation = ref(null)

const handleViewMessages = async (row) => {
  currentConversation.value = row
  messageDialogVisible.value = true
  messageLoading.value = true

  try {
    const res = await $myFetch('ChatMessageList', {
      params: {
        conversation_id: row.id,
      },
    })

    if (res.code === 200 && res.data) {
      messageList.value = (res.data.list || []).map((item) => ({
        ...item,
        create_time_fmt: formatTimestamp(item.create_time),
      }))
    } else {
      $msg(res.msg || '获取消息列表失败', 'error')
      messageList.value = []
    }
  } catch (error) {
    $msg('获取消息列表失败', 'error')
    messageList.value = []
  } finally {
    messageLoading.value = false
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

// 监听页数变化
watch(
  () => page.value,
  async () => {
    pageLoading.value = true
    await getData()
    setTimeout(() => {
      pageLoading.value = false
    }, 300)
  },
)

// 监听每页数量变化
watch(pageSize, async () => {
  page.value = 1
  pageLoading.value = true
  await getData()
  setTimeout(() => {
    pageLoading.value = false
  }, 300)
})

// 关闭消息对话框时清空数据
watch(messageDialogVisible, (newValue) => {
  if (!newValue) {
    messageList.value = []
    currentConversation.value = null
  }
})

onMounted(() => {
  getData()
})
</script>

<template>
  <div class="ai-chat-container" v-loading="loading">
    <div class="chat-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon">
            <ChatDotRound />
          </el-icon>
          <span class="title">AI 会话管理</span>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <client-only>
          <el-table
            :data="tableData"
            style="width: 100%"
            v-loading="pageLoading"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="uid" label="用户ID" width="100" />
            <el-table-column
              prop="title"
              label="会话标题"
              min-width="240"
              show-overflow-tooltip
            />
            <el-table-column
              prop="create_time_fmt"
              label="创建时间"
              width="180"
            />
            <el-table-column
              prop="update_time_fmt"
              label="更新时间"
              width="180"
            />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <div class="table-actions">
                  <el-button
                    type="primary"
                    link
                    @click="handleViewMessages(scope.row)"
                  >
                    <el-icon><View /></el-icon>
                    查看
                  </el-button>
                  <el-popconfirm
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    title="确定要删除该会话吗？"
                    @confirm="handleDelete(scope.row)"
                  >
                    <template #reference>
                      <el-button type="danger" link>
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :pager-count="5"
              :total="totalRecords"
              v-model:current-page="page"
              :disabled="pageLoading"
              background
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>
        </client-only>
      </div>

      <!-- 消息详情对话框 -->
      <el-dialog
        v-model="messageDialogVisible"
        :title="
          currentConversation
            ? `会话详情 - ${currentConversation.title}`
            : '会话详情'
        "
        width="700px"
        destroy-on-close
      >
        <div v-loading="messageLoading" class="message-list">
          <el-empty
            v-if="!messageLoading && messageList.length === 0"
            description="暂无消息记录"
          />
          <div
            v-for="item in messageList"
            :key="item.id"
            :class="['message-item', item.role === 'user' ? 'user' : 'assistant']"
          >
            <div class="message-header">
              <el-tag
                :type="item.role === 'user' ? '' : 'success'"
                size="small"
                effect="plain"
              >
                {{ item.role === 'user' ? '用户' : 'AI' }}
              </el-tag>
              <span class="message-time">{{ item.create_time_fmt }}</span>
            </div>
            <div class="message-content">{{ item.content }}</div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ai-chat-container {
  padding: 24px;

  .chat-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #eaecf0;
    overflow: hidden;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #eaecf0;

      .header-left {
        display: flex;
        align-items: center;
        gap: 10px;

        .icon {
          font-size: 20px;
          color: #3b82f6;
        }

        .title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1f36;
        }
      }
    }

    .table-container {
      padding: 24px;

      :deep(.el-table) {
        border: none;

        .el-table__header-wrapper {
          th {
            background: #f8fafc;
            color: #1f2937;
            font-weight: 600;
          }
        }
      }

      .table-actions {
        display: flex;
        gap: 4px;
        margin: 0;
        padding: 0;
      }

      .pagination {
        margin-top: 24px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

/* 消息详情样式 */
.message-list {
  max-height: 500px;
  overflow-y: auto;
  padding: 4px 0;

  .message-item {
    margin-bottom: 16px;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid #eaecf0;

    &.user {
      background: #f0f9ff;
      border-color: #bae6fd;
    }

    &.assistant {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;

      .message-time {
        font-size: 12px;
        color: #94a3b8;
      }
    }

    .message-content {
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 12px;

  .el-dialog__header {
    margin: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #eaecf0;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1f36;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }
}

@media screen and (max-width: 1200px) {
  .ai-chat-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .ai-chat-container {
    padding: 12px;
  }
}
</style>
