<script setup>
import { ElMessage } from 'element-plus'
import { CopyDocument, VideoPlay, Download } from '@element-plus/icons-vue'

const props = defineProps({
  apiInfo: {
    type: Object,
    required: true,
  },
})

const { userAccessKey } = useUserKey()

// 调试相关的响应式变量
const debugVisible = ref(false)

// 调试对话框宽度（移动端95%，桌面端60%）
const isMobile = ref(false)
const debugDialogWidth = computed(() => (isMobile.value ? '95%' : '60%'))
const updateIsMobile = () => {
  isMobile.value = document.body.clientWidth < 768
}
onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})

const debugForm = ref({})
const loading = ref(false)
const response = ref(null)
const responseCode = ref(null)

// 格式化响应结果
const formatResponse = computed(() => {
  if (!response.value) return ''
  if (typeof response.value === 'string') return response.value
  return JSON.stringify(response.value, null, 2)
})

// 打开调试对话框
const openDebugDialog = () => {
  debugVisible.value = true
  debugForm.value = {}
  response.value = null
  const i = props.apiInfo?.params?.findIndex(
    (p) => String(p.name).toLowerCase() === 'key',
  )
  if (i !== undefined && i !== -1 && userAccessKey.value) {
    debugForm.value[i] = userAccessKey.value
  }
}

// 暴露给父组件
defineExpose({ openDebugDialog })

const preElement = ref(null)

// 添加响应类型相关的变量
const isImageResponse = ref(false)
const imageUrl = ref('')
const isVideoResponse = ref(false)
const videoUrl = ref('')

// highlight.js 动态导入
let hljs = null
const loadHighlightJs = async () => {
  if (hljs) return hljs
  const [{ default: core }, { default: json }] = await Promise.all([
    import('highlight.js/lib/core'),
    import('highlight.js/lib/languages/json'),
  ])
  await import('highlight.js/styles/github.css')
  core.registerLanguage('json', json)
  hljs = core
  return hljs
}

const copy = (value) => {
  const textArea = document.createElement('textarea')
  textArea.value = value
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)

  ElMessage({
    message: '复制成功',
    type: 'success',
  })
}

// 修改发送请求函数
const sendRequest = async () => {
  loading.value = true
  try {
    // 检查必填参数
    const missingParams = props.apiInfo.params
      .filter(
        (param, index) => param.required === '必传' && !debugForm.value[index],
      )
      .map((param) => param.param)

    if (missingParams.length > 0) {
      ElMessage.error(`请填写必填参数: ${missingParams.join(', ')}`)
      loading.value = false
      return
    }

    let url = props.apiInfo.url
    let options = {
      method: props.apiInfo.method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }

    // 分离不同位置的参数
    const headerParams = []
    const bodyParams = []
    const queryParams = []

    for (let i = 0; i < props.apiInfo.params.length; i++) {
      const param = props.apiInfo.params[i]
      const value = debugForm.value[i]
      if (value) {
        // 特殊处理 Key 参数，将其放入 Authorization header
        if (String(param.name).toLowerCase() === 'key') {
          options.headers['Authorization'] = `Bearer ${value}`
          continue
        }

        if (param.position === 'header') {
          headerParams.push({ name: param.name, value })
        } else if (param.position === 'body') {
          bodyParams.push({ name: param.name, value })
        } else {
          // 默认为query参数
          queryParams.push({ name: param.name, value })
        }
      }
    }

    // 添加header参数到请求头
    headerParams.forEach((param) => {
      options.headers[param.name] = param.value
    })

    // 处理 POST 请求
    if (props.apiInfo.method === 'POST') {
      const formData = new URLSearchParams()
      // 添加body参数
      bodyParams.forEach((param) => {
        formData.append(param.name, param.value)
      })
      // 如果没有专门的body参数，将query参数也放到body中
      if (bodyParams.length === 0) {
        queryParams.forEach((param) => {
          formData.append(param.name, param.value)
        })
      }
      options.body = formData

      // 如果有query参数且有body参数，query参数仍然放到URL中
      if (bodyParams.length > 0 && queryParams.length > 0) {
        const params = new URLSearchParams()
        queryParams.forEach((param) => {
          params.append(param.name, param.value)
        })
        const queryString = params.toString()
        if (queryString) {
          url += (url.includes('?') ? '&' : '?') + queryString
        }
      }
    } else {
      // GET 请求，将query和body参数都添加到 URL
      const params = new URLSearchParams()
      queryParams.forEach((param) => {
        params.append(param.name, param.value)
      })
      bodyParams.forEach((param) => {
        params.append(param.name, param.value)
      })

      const queryString = params.toString()
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString
      }
    }

    // 发送请求
    const res = await fetch(url, options)

    // 获取响应类型
    const contentType = res.headers.get('content-type')

    // 处理重定向
    if (res.status === 302) {
      const redirectUrl = res.headers.get('location')
      if (redirectUrl) {
        // 检查是否是视频URL（扩展支持的格式）
        if (
          redirectUrl.match(/\.(mp4|webm|ogg|m3u8|mov|avi)$/i) ||
          redirectUrl.includes('video')
        ) {
          isVideoResponse.value = true
          isImageResponse.value = false
          videoUrl.value = redirectUrl
          response.value = { code: 200, msg: '视频获取成功' }
          ElMessage.success('请求成功')
          return
        } else if (redirectUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          isVideoResponse.value = false
          isImageResponse.value = true
          imageUrl.value = redirectUrl
          response.value = { code: 200, msg: '图片获取成功' }
          ElMessage.success('请求成功')
          return
        }
      }
    }

    // 处理直接返回的媒体类型
    if (contentType) {
      if (
        contentType.includes('video/') ||
        contentType.includes('application/x-mpegURL')
      ) {
        isVideoResponse.value = true
        isImageResponse.value = false
        const blob = await res.blob()
        videoUrl.value = URL.createObjectURL(blob)
        response.value = { code: 200, msg: '视频获取成功' }
      } else if (contentType.includes('image/')) {
        isVideoResponse.value = false
        isImageResponse.value = true
        const blob = await res.blob()
        imageUrl.value = URL.createObjectURL(blob)
        response.value = { code: 200, msg: '图片获取成功' }
      } else {
        // 处理 JSON 或文本响应
        isVideoResponse.value = false
        isImageResponse.value = false

        const text = await res.text()
        let data
        try {
          data = JSON.parse(text)
        } catch (e) {
          data = text
        }

        response.value = data
        imageUrl.value = ''
        videoUrl.value = ''

        // 等待 DOM 更新后再进行高亮
        await nextTick()
        await loadHighlightJs()
        if (preElement.value && responseCode.value) {
          const newCode = document.createElement('code')

          if (typeof data === 'object') {
            newCode.className = 'json'
            newCode.textContent = JSON.stringify(data, null, 2)
            if (hljs) hljs.highlightElement(newCode)
          } else {
            newCode.className = 'text'
            newCode.textContent = data
          }

          preElement.value.innerHTML = ''
          preElement.value.appendChild(newCode)

          responseCode.value = newCode
        }
      }
    }

    ElMessage.success('请求成功')
  } catch (error) {
    ElMessage.error('请求失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 下载图片
const downloadImage = async () => {
  try {
    const response = await fetch(imageUrl.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'image.' + blob.type.split('/')[1] // 根据实际类型设置扩展名
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下载失败：' + error.message)
  }
}

// 复制图片链接
const copyImageUrl = () => {
  copy(imageUrl.value)
}

const openInNewWindow = (url) => {
  window.open(url, '_blank')
}

// 监听对话框关闭时清理资源
watch(debugVisible, (val) => {
  if (!val) {
    debugForm.value = {}
    response.value = null
    isImageResponse.value = false
    isVideoResponse.value = false
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
      imageUrl.value = ''
    }
    if (videoUrl.value) {
      URL.revokeObjectURL(videoUrl.value)
      videoUrl.value = ''
    }
  }
})
</script>

<template>
  <!-- 调试对话框 -->
  <el-dialog
    v-model="debugVisible"
    title="接口调试"
    :width="debugDialogWidth"
    :close-on-click-modal="false"
  >
    <div class="debug-container">
      <!-- 请求参数表单 -->
      <div class="params-form">
        <h3>请求参数</h3>
        <el-form :model="debugForm" label-width="100px">
          <el-form-item
            v-for="(param, index) in apiInfo.params"
            :key="index"
            :label="param.name"
            :required="param.required === '必传'"
          >
            <el-input v-model="debugForm[index]" :placeholder="param.param" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 发送按钮 -->
      <div class="debug-actions">
        <el-button type="primary" @click="sendRequest" :loading="loading">
          发送请求
        </el-button>
      </div>

      <!-- 响应结果 -->
      <div class="response-container" v-if="response">
        <h3>响应结果</h3>
        <template v-if="isVideoResponse">
          <div class="video-response">
            <video
              controls
              autoplay
              style="max-width: 100%"
              controlsList="nodownload"
              :src="videoUrl"
            >
              <source :src="videoUrl" type="video/mp4" />
              <source :src="videoUrl" type="video/webm" />
              <source :src="videoUrl" type="video/ogg" />
              <source :src="videoUrl" type="application/x-mpegURL" />
              您的浏览器不支持视频播放。
            </video>
            <div class="video-actions">
              <el-button
                type="primary"
                size="small"
                @click="openInNewWindow(videoUrl)"
              >
                <el-icon><VideoPlay /></el-icon>
                在新窗口打开
              </el-button>
              <el-button size="small" @click="copy(videoUrl)">
                <el-icon><CopyDocument /></el-icon>
                复制视频链接
              </el-button>
            </div>
          </div>
        </template>
        <template v-else-if="isImageResponse">
          <div class="image-response">
            <img :src="imageUrl" alt="接口返回图片" />
            <div class="image-actions">
              <el-button type="primary" size="small" @click="downloadImage">
                <el-icon>
                  <Download />
                </el-icon>
                下载图片
              </el-button>
              <el-button size="small" @click="copyImageUrl">
                <el-icon>
                  <CopyDocument />
                </el-icon>
                复制图片链接
              </el-button>
            </div>
          </div>
        </template>
        <template v-else>
          <pre class="example mac_light mac_pre" ref="preElement">
              <code class="json" ref="responseCode">{{ formatResponse }}</code>
            </pre>
        </template>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="less">
.debug-container {
  .params-form {
    margin-bottom: 32px;

    h3 {
      font-size: 16px;
      font-weight: 500;
      color: #2c3e50;
      margin: 0 0 20px 0;
      position: relative;
      padding-left: 12px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background: #475569;
        border-radius: 3px;
      }
    }

    :deep(.el-form) {
      max-width: 600px;
    }

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #2c3e50;
    }

    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px #dcdfe6 inset;
      transition: all 0.3s ease;

      &.is-focus {
        box-shadow: 0 0 0 1px #475569 inset;
      }
    }
  }

  .debug-actions {
    margin-bottom: 32px;
    padding-top: 8px;
    border-top: 1px dashed #e2e8f0;

    .el-button {
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .response-container {
    h3 {
      font-size: 16px;
      font-weight: 500;
      color: #2c3e50;
      margin: 0 0 20px 0;
      position: relative;
      padding-left: 12px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background: #0f766e;
        border-radius: 3px;
      }
    }

    pre {
      margin: 0;
      max-height: 400px;
      overflow: auto;
    }

    .video-response {
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
      padding: 16px;
      margin-top: 16px;

      video {
        border-radius: 8px;
        background: #000;
        width: 100%;
        max-height: 500px;
        display: block;
        margin: 0 auto;
      }

      .video-actions {
        margin-top: 16px;
        display: flex;
        gap: 12px;
        justify-content: center;

        .el-button {
          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }

    .image-response {
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
      padding: 16px;

      img {
        max-width: 100%;
        max-height: 400px;
        display: block;
        margin: 0 auto;
        border-radius: 4px;
      }

      .image-actions {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 16px;

        .el-button {
          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }

    // 套餐表格样式
    .package-price-cell {
      font-weight: 600;
      color: #e53e3e;
      font-size: 14px;
    }
  }
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;

  .el-dialog__header {
    margin: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }

    .el-dialog__close {
      color: #64748b;
      font-size: 18px;

      &:hover {
        color: #2c3e50;
      }
    }
  }

  .el-dialog__body {
    padding: 24px;
  }
}

@media screen and (max-width: 768px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 0 auto;
  }

  .debug-container {
    .params-form {
      :deep(.el-form) {
        max-width: 100%;
      }
    }
  }
}
</style>
