<template>
  <div v-if="!isHidden && content" class="notice-banner">
    <div class="notice-container">
      <div class="notice-content">
        <div class="notice-icon">
          <el-icon><InfoFilled /></el-icon>
        </div>
        <div class="notice-text">
          <clientOnly>
            <p v-html="content"></p>
          </clientOnly>
        </div>
        <button class="notice-close" @click="hideNotice" aria-label="关闭通知">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { InfoFilled, Close } from '@element-plus/icons-vue'

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
})

// 本地存储键名
const NOTICE_STORAGE_KEY = 'notice_hidden_timestamp'

// 一周的毫秒数 (7天 * 24小时 * 60分钟 * 60秒 * 1000毫秒)
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

// 控制通知显示状态
const isHidden = ref(false)

// 检查是否应该显示通知
const checkShouldShowNotice = () => {
  if (process.client) {
    const hiddenTimestamp = localStorage.getItem(NOTICE_STORAGE_KEY)
    
    if (hiddenTimestamp) {
      const hiddenTime = parseInt(hiddenTimestamp)
      const currentTime = Date.now()
      const timeDiff = currentTime - hiddenTime
      
      // 如果距离关闭时间超过一周，重新显示通知
      if (timeDiff >= ONE_WEEK_MS) {
        localStorage.removeItem(NOTICE_STORAGE_KEY)
        return true
      } else {
        return false
      }
    }
    
    // 如果没有存储记录，显示通知
    return true
  }
  
  return true
}

// 隐藏通知并记录时间
const hideNotice = () => {
  isHidden.value = true
  
  if (process.client) {
    // 记录关闭时间到本地存储
    localStorage.setItem(NOTICE_STORAGE_KEY, Date.now().toString())
  }
}

// 初始化显示状态
onMounted(() => {
  if (!props.content || props.content.trim() === '') {
    isHidden.value = true
    return
  }
  
  // 检查是否应该显示通知
  isHidden.value = !checkShouldShowNotice()
})

// 监听内容变化
watch(
  () => props.content,
  (newContent) => {
    if (!newContent || newContent.trim() === '') {
      isHidden.value = true
    } else {
      // 当内容变化时，重新检查是否应该显示
      isHidden.value = !checkShouldShowNotice()
    }
  }
)
</script>

<style lang="less">
.notice-banner {
  width: 100%;
  padding: 16px 0;
  background: transparent;

  .notice-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .notice-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #e8f4fd 0%, #f0f9ff 100%);
    border: 1px solid #b3d8ff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    position: relative;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      transform: translateY(-1px);
    }
  }

  .notice-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    color: #409eff;
    font-size: 16px;
    margin-top: 2px;
  }

  .notice-text {
    flex: 1;
    p {
      margin: 0;
      color: #2c3e50;
      font-size: 14px;
      line-height: 1.6;
      font-weight: 500;
      a {
        color: #409eff;
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: all 0.3s ease;

        &:hover {
          border-bottom-color: #409eff;
          opacity: 0.8;
        }
      }
    }
  }

  .notice-close {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border: none;
    background: rgba(64, 158, 255, 0.1);
    border-radius: 6px;
    color: #409eff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    font-size: 14px;

    &:hover {
      background: rgba(64, 158, 255, 0.2);
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .notice-banner {
    padding: 12px 0;

    .notice-container {
      padding: 0 16px;
    }

    .notice-content {
      padding: 12px 16px;
      gap: 10px;
    }

    .notice-text p {
      font-size: 13px;
    }

    .notice-close {
      width: 22px;
      height: 22px;
      font-size: 12px;
    }
  }
}

@media (max-width: 480px) {
  .notice-banner {
    .notice-content {
      padding: 10px 12px;
      border-radius: 8px;
    }

    .notice-text p {
      font-size: 12px;
      line-height: 1.5;
    }
  }
}
</style>
