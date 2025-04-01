<template>
  <div class="ai-chat-container">
    <!-- 聊天悬浮按钮 -->
    <div class="chat-button" @click="toggleChat" v-if="!chatVisible">
      <el-badge :value="unreadCount" :hidden="unreadCount === 0">
        <el-button type="primary" circle>
          <el-icon><ChatDotRound /></el-icon>
        </el-button>
      </el-badge>
    </div>

    <!-- 聊天窗口 -->
    <div class="chat-window" v-if="chatVisible">
      <!-- 聊天窗口标题栏 -->
      <div
        class="chat-header"
        @mousedown="handleMouseDown"
        :style="{ cursor: 'ns-resize' }"
      >
        <div class="title">
          <el-icon><Service /></el-icon>
          <span>AI 智能助手</span>
        </div>
        <div class="actions">
          <el-button type="text" @click="toggleChat" class="close-button">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="chatMessagesContainer">
        <el-empty
          v-if="chatMessages.length === 0"
          description="开始与AI助手聊天吧！"
          :image-size="100"
        />
        <div
          v-for="(message, index) in chatMessages"
          :key="index"
          :class="[
            'message',
            message.role === 'user' ? 'user-message' : 'ai-message',
          ]"
        >
          <div class="message-content">
            <div class="message-avatar">
              <el-avatar
                :icon="message.role === 'user' ? UserFilled : Service"
                :size="36"
                :color="message.role === 'user' ? '#409EFF' : '#67C23A'"
              />
            </div>
            <div class="message-text">
              <div class="message-bubble">
                <div
                  v-if="message.role === 'assistant'"
                  class="formatted-content"
                  v-html="formatMessageContent(message.content)"
                ></div>
                <p v-else>{{ message.content }}</p>
              </div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>
        </div>

        <!-- 加载指示器 -->
        <div class="loading-indicator" v-if="isLoading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>AI正在思考中...</span>
        </div>
      </div>

      <!-- AI免责声明提示 -->
      <div class="ai-disclaimer">
        <el-icon><InfoFilled /></el-icon>
        <span>AI生成的内容仅供参考，不对其准确性或完整性做保证</span>
      </div>

      <!-- 输入框区域 -->
      <div class="chat-input">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="2"
          placeholder="请输入您的问题..."
          @keyup.enter.exact="sendMessage"
          resize="none"
        />
        <el-button
          type="primary"
          :disabled="!userInput.trim() || isLoading"
          @click="sendMessage"
          class="send-button"
        >
          <el-icon><Position /></el-icon>
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import {
  ChatDotRound,
  Service,
  UserFilled,
  Position,
  Close,
  Loading,
  InfoFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import go from 'highlight.js/lib/languages/go'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import markdown from 'highlight.js/lib/languages/markdown'
import yaml from 'highlight.js/lib/languages/yaml'
import rust from 'highlight.js/lib/languages/rust'
import kotlin from 'highlight.js/lib/languages/kotlin'
import 'highlight.js/styles/github.css'

// 注册多种编程语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript) // 别名
hljs.registerLanguage('go', go)
hljs.registerLanguage('golang', go) // 别名
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python) // 别名
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c++', cpp) // 别名
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('rb', ruby) // 别名
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript) // 别名
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash) // 别名
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown) // 别名
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml) // 别名
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('rs', rust) // 别名
hljs.registerLanguage('kotlin', kotlin)
hljs.registerLanguage('kt', kotlin) // 别名

const { $myFetch } = useNuxtApp()

// 聊天状态
const chatVisible = ref(false)
const userInput = ref('')
const chatMessages = ref([])
const isLoading = ref(false)
const unreadCount = ref(0)
const chatMessagesContainer = ref(null)

// 拖动相关状态
const isDragging = ref(false)
const startY = ref(0)
const startTop = ref(350) // 初始位置调整为更低
const currentTop = ref(350) // 同步调整当前位置

// 默认欢迎消息
const welcomeMessage = {
  role: 'assistant',
  content: '您好！我是 AI 智能助手，有什么可以帮助您的吗？',
  time: formatTime(new Date()),
}

// 切换聊天窗口
const toggleChat = () => {
  chatVisible.value = !chatVisible.value

  // 保存当前聊天窗口状态到localStorage
  localStorage.setItem('chatVisible', chatVisible.value ? 'true' : 'false')

  if (chatVisible.value) {
    unreadCount.value = 0

    // 如果消息为空，添加欢迎消息
    if (chatMessages.value.length === 0) {
      chatMessages.value.push(welcomeMessage)
    }

    // 滚动到最新消息
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 发送消息
const sendMessage = async () => {
  const message = userInput.value.trim()
  if (!message || isLoading.value) return

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: message,
    time: formatTime(new Date()),
  })

  // 清空输入框
  userInput.value = ''

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })

  // 设置加载状态
  isLoading.value = true

  try {
    // 调用实际的Chat API接口
    const res = await $myFetch('Chat', {
      query: {
        message: message,
      },
    })

    // 检查响应状态
    if (res.code === 200 && res.data) {
      // 添加AI回复
      chatMessages.value.push({
        role: 'assistant',
        content: res.data,
        time: formatTime(new Date()),
      })
    } else {
      // 处理错误响应
      chatMessages.value.push({
        role: 'assistant',
        content: res.msg || '抱歉，我遇到了一些问题，请稍后再试。',
        time: formatTime(new Date()),
      })
    }

    // 如果聊天窗口不可见，增加未读计数
    if (!chatVisible.value) {
      unreadCount.value++
    }

    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    ElMessage.error('获取AI回复失败，请稍后再试')

    // 添加错误提示到聊天
    chatMessages.value.push({
      role: 'assistant',
      content: '网络连接出现问题，请检查您的网络连接并稍后再试。',
      time: formatTime(new Date()),
    })

    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } finally {
    isLoading.value = false
  }
}

// 滚动到最新消息
const scrollToBottom = () => {
  if (chatMessagesContainer.value) {
    chatMessagesContainer.value.scrollTop =
      chatMessagesContainer.value.scrollHeight
  }
}

// 格式化时间
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 监听消息变化，保存到本地存储
watch(
  chatMessages,
  (newMessages) => {
    if (newMessages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(newMessages))
    }
  },
  { deep: true }
)

// 挂载时从本地存储加载历史消息
onMounted(() => {
  // 加载聊天历史
  const savedMessages = localStorage.getItem('chatHistory')
  if (savedMessages) {
    try {
      chatMessages.value = JSON.parse(savedMessages)
    } catch (e) {}
  }

  // 恢复聊天窗口的可见状态
  const savedChatVisible = localStorage.getItem('chatVisible')
  if (savedChatVisible === 'true') {
    chatVisible.value = true

    // 滚动到最新消息
    nextTick(() => {
      scrollToBottom()
    })
  }

  // 添加鼠标事件监听器到document
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

// 处理鼠标按下事件
const handleMouseDown = (e) => {
  // 只在主鼠标按键（左键）点击时启用拖动
  if (e.button !== 0) return

  isDragging.value = true
  startY.value = e.clientY
  startTop.value = currentTop.value

  // 防止文本选择等默认行为
  e.preventDefault()
}

// 处理鼠标移动事件
const handleMouseMove = (e) => {
  if (!isDragging.value) return

  // 计算移动的距离（仅Y轴）
  const deltaY = e.clientY - startY.value

  // 更新位置（仅Y轴）
  const newTop = startTop.value + deltaY

  // 限制拖动范围，不让窗口拖出视口
  if (newTop < 10) return // 顶部边界

  // 确保窗口底部不会拖出视口
  const windowHeight = window.innerHeight
  const chatWindowHeight = 500 // 与CSS中的高度保持一致

  if (newTop > windowHeight - chatWindowHeight - 10) return

  currentTop.value = newTop
}

// 处理鼠标释放事件
const handleMouseUp = () => {
  isDragging.value = false
}

// 在组件卸载前移除事件监听器
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

// 格式化消息内容，处理代码块和特殊格式
const formatMessageContent = (content) => {
  if (!content) return ''

  let formattedContent = content

  // 处理代码块 (```code```)
  formattedContent = formattedContent.replace(
    /```(\w*)([\s\S]*?)```/g,
    (match, language, code) => {
      const validLang = language || 'plaintext'
      let highlightedCode = code.trim()

      try {
        if (validLang !== 'plaintext') {
          highlightedCode = hljs.highlight(code.trim(), {
            language: validLang,
          }).value
        }
      } catch (e) {}

      return `<pre class="code-block"><code class="hljs language-${validLang}">${highlightedCode}</code></pre>`
    }
  )

  // 处理加粗文本 (**text**)
  formattedContent = formattedContent.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="bold-text">$1</strong>'
  )

  // 处理行内代码 (`code`)
  formattedContent = formattedContent.replace(
    /`([^`]+)`/g,
    '<code class="inline-code">$1</code>'
  )

  // 处理换行符
  formattedContent = formattedContent.replace(/\n/g, '<br>')

  return formattedContent
}
</script>

<style lang="less" scoped>
.ai-chat-container {
  position: fixed;
  right: 20px;
  bottom: 50px;
  z-index: 999;

  .chat-button {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }

    .el-button {
      width: 50px;
      height: 50px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

      .el-icon {
        font-size: 20px;
      }
    }
  }

  .chat-window {
    position: fixed;
    right: 20px;
    bottom: unset; // 取消底部固定
    top: v-bind('currentTop + "px"'); // 使用动态计算的顶部位置
    width: 370px;
    height: 500px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: none; // 移除过渡效果以便拖动更流畅

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #409eff;
      color: #fff;
      user-select: none; // 防止拖动时选择文本

      .title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        font-size: 16px;

        .el-icon {
          font-size: 18px;
        }
      }

      .actions {
        .close-button {
          color: #fff;

          &:hover {
            opacity: 0.8;
          }

          .el-icon {
            font-size: 18px;
          }
        }
      }
    }

    .chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9f9f9;
      font-size: 12px;

      .message {
        margin-bottom: 16px;

        &.user-message {
          .message-content {
            flex-direction: row-reverse;

            .message-bubble {
              background: #e1f3ff;
              color: #333;
              border-radius: 12px 12px 2px 12px;
            }

            .message-time {
              text-align: right;
            }
          }
        }

        &.ai-message {
          .message-bubble {
            background: #f0f9eb;
            color: #333;
            border-radius: 12px 12px 12px 2px;
          }
        }

        .message-content {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;

          .message-text {
            max-width: 80%;

            .message-bubble {
              padding: 10px 12px;
              word-break: break-word;

              p {
                margin: 0;
                line-height: 1.5;
              }

              .formatted-content {
                line-height: 1.5;

                .bold-text {
                  font-weight: 700;
                }

                .code-block {
                  margin: 10px 0;
                  border-radius: 6px;
                  background: #f8f8f8;
                  padding: 8px;
                  overflow-x: auto;
                  border: 1px solid #eaeaea;

                  code {
                    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
                    font-size: 13px;
                    white-space: pre;
                  }
                }

                .inline-code {
                  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
                  background: #f0f0f0;
                  padding: 2px 4px;
                  border-radius: 3px;
                  font-size: 13px;
                  color: #e83e8c;
                }

                a {
                  color: #409eff;
                  text-decoration: none;

                  &:hover {
                    text-decoration: underline;
                  }
                }
              }
            }

            .message-time {
              font-size: 12px;
              color: #999;
              margin-top: 4px;
            }
          }
        }
      }

      .loading-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
        font-size: 14px;
        margin-top: 8px;

        .el-icon {
          font-size: 16px;
          color: #409eff;
        }
      }
    }

    .ai-disclaimer {
      padding: 8px 12px;
      background: #f9f9f9;
      border-top: 1px dashed #e0e0e0;
      font-size: 12px;
      color: #909399;
      display: flex;
      align-items: center;
      gap: 6px;

      .el-icon {
        font-size: 14px;
        color: #909399;
      }

      span {
        line-height: 1.4;
      }
    }

    .chat-input {
      padding: 12px;
      background: #fff;
      border-top: 1px solid #f0f0f0;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .el-textarea {
        :deep(.el-textarea__inner) {
          resize: none;
          border-radius: 8px;
          padding: 8px 12px;
          height: 60px;

          &:focus {
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
          }
        }
      }

      .send-button {
        align-self: flex-end;

        .el-icon {
          margin-right: 6px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .ai-chat-container {
    .chat-window {
      width: 90%;
      height: 70vh;
      right: 5%;
      bottom: unset; // 移除底部定位
      top: 100px; // 设置固定顶部距离，让窗口显示在更高的位置
    }
  }
}
</style>
