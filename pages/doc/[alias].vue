<script setup>
const { $myFetch } = useNuxtApp()
import { ElMessage } from 'element-plus'
import { CopyDocument, VideoPlay, Download, Document } from '@element-plus/icons-vue'

import 'highlight.js/styles/github.css'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import javascript from 'highlight.js/lib/languages/javascript'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'

const activeName = ref('axios')
const route = useRoute()

const apiInfo = ref({})

const {
  data: { value: res },
} = await useAsyncData('ApiAlias', () =>
  $myFetch('ApiAlias', {
    query: {
      alias: route.params.alias,
    },
  })
)

if (res.code !== 200) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
  })
}

// 判断参数是否必传
res.data.params = res.data.params.map((item) => {
  let requiredText
  if (item.required === 1 || item.required === '必传') {
    requiredText = '必传'
  } else {
    requiredText = '可选'
  }

  return {
    id: item.id,
    aid: item.aid,
    name: item.name,
    param: item.param,
    position: item.position,
    docs: item.docs,
    required: requiredText,
  }
})

apiInfo.value = res.data

// 配置项
const options = useState('options')

useHead({
  title: apiInfo.value.name + ' - 免费API',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    { name: 'description', content: apiInfo.value.description },
    { name: 'keywords', content: apiInfo.value.keywords },
  ],
  style: [
    {
      children: options.value.css,
    },
  ],
})

onMounted(() => {
  hljs.registerLanguage('json', json)
  hljs.registerLanguage('javascript.js', javascript)
  hljs.registerLanguage('php', php)
  hljs.registerLanguage('python', python)
  hljs.highlightAll()
})

const urlDom = ref()

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

// 调试相关的响应式变量
const debugVisible = ref(false)

// 广告显示控制
const adDisplay = ref(true)

// 处理广告数据
const adInfo = (info) => {
  if (info.value.length === 0) {
    adDisplay.value = false
  }
}
const debugForm = ref({})
const loading = ref(false)
const response = ref(null)
const responseCode = ref(null)

// 格式化响应结果
const formatResponse = computed(() => {
  if (!response.value) return ''
  return JSON.stringify(response.value, null, 2)
})

// 打开调试对话框
const openDebugDialog = () => {
  debugVisible.value = true
  debugForm.value = {}
  response.value = null
}

const preElement = ref(null)

// 添加响应类型相关的变量
const isImageResponse = ref(false)
const imageUrl = ref('')
const isVideoResponse = ref(false)
const videoUrl = ref('')

// 修改发送请求函数
const sendRequest = async () => {
  loading.value = true
  try {
    // 检查必填参数
    const missingParams = apiInfo.value.params
      .filter(
        (param, index) => param.required === '必传' && !debugForm.value[index]
      )
      .map((param) => param.param)

    if (missingParams.length > 0) {
      ElMessage.error(`请填写必填参数: ${missingParams.join(', ')}`)
      loading.value = false
      return
    }

    let url = apiInfo.value.url
    let options = {
      method: apiInfo.value.method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }

    // 处理 POST 请求
    if (apiInfo.value.method === 'POST') {
      const formData = new URLSearchParams()
      for (let i = 0; i < apiInfo.value.params.length; i++) {
        const param = apiInfo.value.params[i]
        const value = debugForm.value[i]
        if (value) {
          formData.append(param.name, value)
        }
      }
      options.body = formData
    } else {
      // GET 请求，将参数添加到 URL
      const params = new URLSearchParams()
      for (let i = 0; i < apiInfo.value.params.length; i++) {
        const param = apiInfo.value.params[i]
        const value = debugForm.value[i]
        if (value) {
          params.append(param.name, value)
        }
      }

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
        // 处理 JSON 响应
        isVideoResponse.value = false
        isImageResponse.value = false
        const data = await res.json()
        response.value = data
        imageUrl.value = ''
        videoUrl.value = ''

        // 等待 DOM 更新后再进行高亮
        await nextTick()
        if (preElement.value && responseCode.value) {
          const newCode = document.createElement('code')
          newCode.className = 'json'
          newCode.textContent = formatResponse.value

          preElement.value.innerHTML = ''
          preElement.value.appendChild(newCode)

          hljs.registerLanguage('json', json)
          hljs.highlightElement(newCode)

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

// 检测内容是否为HTML格式（来自高级编辑器）
const isHtmlContent = computed(() => {
  if (!apiInfo.value.example) return false

  // 检测是否包含HTML标签
  const htmlRegex = /<[^>]*>/
  return htmlRegex.test(apiInfo.value.example)
})

// 添加新的计算属性
const highlightedExample = computed(() => {
  if (!apiInfo.value.example) return ''

  // 如果是HTML内容（来自高级编辑器），直接返回
  if (isHtmlContent.value) {
    return apiInfo.value.example
  }

  try {
    // 如果example是字符串形式的JSON,先解析再格式化
    const parsed =
      typeof apiInfo.value.example === 'string'
        ? JSON.parse(apiInfo.value.example)
        : apiInfo.value.example

    const formatted = JSON.stringify(parsed, null, 2)
    // 使用highlight.js进行代码高亮
    return hljs.highlight(formatted, { language: 'json' }).value
  } catch (e) {
    // 如果解析失败,直接返回原始内容
    return apiInfo.value.example
  }
})

const openInNewWindow = (url) => {
  window.open(url, '_blank')
}

// 购买套餐
const buyPackage = (pkg) => {
  navigateTo(`/admin/buy?package_id=${pkg.id}`)
}
</script>

<template>
  <div class="doc-container">
    <!-- 公告 -->
    <IndexNotice :content="options.notice"></IndexNotice>

    <div class="apiinfo-container">
      <!-- 侧边导航 -->
      <div class="sidebar">
        <div class="nav-title">{{ apiInfo.name }}</div>
        <ul class="nav-menu">
          <li class="nav-item">
            <a href="#overview" class="active">接口概览</a>
          </li>
          <li class="nav-item">
            <a href="#description">接口描述</a>
          </li>
          <li class="nav-item">
            <a href="#parameters">请求参数</a>
          </li>
          <li
            class="nav-item"
            v-if="apiInfo.package_list && apiInfo.package_list.length > 0"
          >
            <a href="#packages">相关套餐</a>
          </li>
          <li class="nav-item">
            <a href="#examples">请求示例</a>
          </li>
          <li class="nav-item">
            <a href="#response">返回示例</a>
          </li>
        </ul>
      </div>

      <!-- 主要内容 -->
      <div class="main-content">
        <!-- 接口概览 -->
        <div class="box" id="overview">
          <div class="api-header">
            <h1>{{ apiInfo.name }}</h1>
            <div class="api-meta">
              <el-tag type="success" size="large">{{ apiInfo.method }}</el-tag>
              <el-button
                type="primary"
                @click="openDebugDialog"
                class="debug-btn"
              >
                <el-icon><VideoPlay /></el-icon>
                在线调试
              </el-button>
              <el-button
                type="info"
                @click="$router.push(`/markdown/${route.params.alias}`)"
                class="view-markdown-btn"
              >
                <el-icon><Document /></el-icon>
                查看Markdown
              </el-button>
            </div>
          </div>

          <div class="api-url-section">
            <label class="url-label">接口地址：</label>
            <el-tooltip effect="dark" content="点击复制" placement="top">
              <div
                class="url-container"
                @click="copy(apiInfo.url)"
                ref="urlDom"
              >
                <code class="api-url">{{ apiInfo.url }}</code>
                <el-icon class="copy-icon"><CopyDocument /></el-icon>
              </div>
            </el-tooltip>
          </div>
        </div>

        <!-- 接口描述 -->
        <div class="box" id="description">
          <h2>接口描述</h2>
          <p class="description-text">{{ apiInfo.description }}</p>
        </div>

        <!-- 请求参数 -->
        <div class="box" id="parameters">
          <h2>请求参数</h2>
          <div class="table-container">
            <el-table
              :data="apiInfo.params"
              style="width: 100%"
              class="params-table"
            >
              <el-table-column prop="name" label="参数名" width="180" />
              <el-table-column prop="param" label="传递参数" width="180" />
              <el-table-column prop="position" label="传入位置" width="120" />
              <el-table-column prop="required" label="类型" width="100">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.required === '必传' ? 'danger' : 'info'"
                    size="small"
                  >
                    {{ scope.row.required }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="docs" label="参数说明" />
            </el-table>
          </div>
        </div>

        <!-- 广告位 -->
        <client-only>
          <div class="box ad-section" v-if="adDisplay">
            <h2>推荐内容</h2>
            <Ad @adInfo="adInfo"></Ad>
          </div>
        </client-only>

        <!-- 套餐列表 -->
        <div
          class="box"
          id="packages"
          v-if="apiInfo.package_list && apiInfo.package_list.length > 0"
        >
          <h2>相关套餐</h2>
          <div class="table-container">
            <el-table
              :data="apiInfo.package_list"
              style="width: 100%"
              class="package-table"
            >
              <el-table-column prop="name" label="套餐名称" width="180" />
              <el-table-column
                prop="description"
                label="套餐描述"
                min-width="200"
              />
              <el-table-column label="套餐类型" width="100" align="center">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.type === 2 ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ scope.row.type === 2 ? '时长套餐' : '点数套餐' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="可用次数" width="100" align="center">
                <template #default="scope">
                  <span v-if="scope.row.type === 2">无限制</span>
                  <span v-else>{{ scope.row.points }}次</span>
                </template>
              </el-table-column>
              <el-table-column label="有效期" width="100" align="center">
                <template #default="scope">
                  <span v-if="scope.row.duration > 0"
                    >{{ scope.row.duration }}天</span
                  >
                  <span v-else>永久</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="price"
                label="价格"
                width="80"
                align="center"
              >
                <template #default="scope">
                  <span class="package-price-cell">¥{{ scope.row.price }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="scope">
                  <el-button
                    type="primary"
                    size="small"
                    @click="buyPackage(scope.row)"
                  >
                    购买
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 请求示例 -->
        <div class="box" id="examples">
          <h2>请求示例</h2>
          <div class="examples-container">
            <el-tabs v-model="activeName" type="card" class="example-tabs">
              <el-tab-pane label="axios" name="axios">
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(apiInfo.axios)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="javascript.js" v-text="apiInfo.axios"></code></pre>
              </el-tab-pane>

              <el-tab-pane label="ajax" name="ajax">
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(apiInfo.ajax)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="javascript.js" v-text="apiInfo.ajax"></code></pre>
              </el-tab-pane>

              <el-tab-pane label="fetch" name="fetch">
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="copy"
                placement="left"
              ><div class="copy" @click="copy(apiInfo.fetch)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="javascript.js" v-text="apiInfo.fetch"></code></pre>
              </el-tab-pane>

              <el-tab-pane label="xhr" name="xhr">
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(apiInfo.xhr)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="javascript.js" v-text="apiInfo.xhr"></code></pre>
              </el-tab-pane>

              <el-tab-pane label="php" name="php">
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(apiInfo.php)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="php" v-text="apiInfo.php"></code></pre>
              </el-tab-pane>

              <el-tab-pane label="python" name="python">
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(apiInfo.python)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="python" v-text="apiInfo.python"></code></pre>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- 返回示例 -->
        <div class="box" id="response">
          <h2>返回示例</h2>
          <div class="response-container">
            <!-- 高级模式：HTML内容 -->
            <div v-if="isHtmlContent" class="example-html-container">
              <client-only>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="复制"
                  placement="left"
                >
                  <div class="copy" @click="copy(apiInfo.example)">
                    <el-icon size="14"><CopyDocument /></el-icon>
                  </div>
                </el-tooltip>
              </client-only>
              <div class="html-content" v-html="highlightedExample"></div>
            </div>

            <!-- 基础模式：代码格式 -->
            <pre
              v-else
              class="example mac_light mac_pre"
            ><client-only><el-tooltip class="box-item" effect="dark" content="复制" placement="left"
           ><div class="copy" @click="copy(apiInfo.example)"><el-icon size="14"><CopyDocument /></el-icon></div
           ></el-tooltip></client-only><code class="json" v-text="apiInfo.example"></code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 调试对话框 -->
    <el-dialog
      v-model="debugVisible"
      title="接口调试"
      width="60%"
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

    <IndexAi></IndexAi>
    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less">
.el-message {
  z-index: 9999 !important;
}

.doc-container {
  width: 100%;
  min-height: 100vh;
  background: #ffffff;

  .apiinfo-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 24px;

    @media (max-width: 1024px) {
      padding: 24px 16px;
    }

    .sidebar {
      display: none;

      @media (max-width: 1024px) {
        display: none;
      }

      .nav-title {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e2e8f0;
      }

      .nav-menu {
        list-style: none;
        padding: 0;
        margin: 0;

        .nav-item {
          margin-bottom: 8px;

          a {
            display: block;
            padding: 12px 16px;
            color: #64748b;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s ease;
            font-weight: 500;

            &:hover {
              background: #f1f5f9;
              color: #3b82f6;
              transform: translateX(4px);
            }

            &.active {
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
          }
        }
      }
    }

    .main-content {
      display: block;
    }

    .box {
      background: transparent;
      padding: 32px 0;
      border-bottom: 1px solid #f1f5f9;

      &:last-child {
        border-bottom: none;
      }

      .api-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;

        @media (max-width: 768px) {
          flex-direction: column;
          gap: 16px;
        }

        h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }

        .api-meta {
          display: flex;
          align-items: center;
          gap: 16px;

          .debug-btn {
            margin-left: 12px;
          }

          .view-markdown-btn {
            margin-left: 8px;
          }
        }
      }

      .api-url-section {
        .url-label {
          display: block;
          font-weight: 600;
          color: #475569;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .url-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          padding: 16px;
          border: 1px solid #e2e8f0;
          cursor: pointer;

          .api-url {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            color: #1e293b;
            background: none;
            border: none;
            flex: 1;
          }

          .copy-icon {
            color: #64748b;

            &:hover {
              color: #3b82f6;
            }
          }
        }
      }

      .description-text {
        font-size: 16px;
        line-height: 1.6;
        color: #475569;
        margin: 0;
      }

      .table-container {
        .params-table,
        .package-table {
          .el-table__header {
            background: #f8fafc;

            th {
              background: #f8fafc !important;
              color: #374151;
              font-weight: 600;
              border-bottom: 1px solid #e2e8f0;
            }
          }

          .el-table__body {
            tr {
              &:hover {
                background: #f8fafc;
              }

              td {
                border-bottom: 1px solid #f1f5f9;
              }
            }
          }
        }
      }

      .examples-container {
        .example-tabs {
          .el-tabs__nav-scroll {
            margin-bottom: 15px;
          }

          .el-tabs__header {
            margin-bottom: 20px;

            .el-tabs__nav {
              border-radius: 12px;
              overflow: hidden;

              .el-tabs__item {
                &.is-active {
                  background: #3b82f6;
                  color: white;
                }
              }
            }
          }
        }
      }

      .response-container {
        .example-html-container {
          border: 1px solid #e2e8f0;
        }
      }

      .ad-section {
        h2 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: #374151;
        }
      }

      h1 {
        font-size: 28px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 24px 0;
      }

      h2 {
        position: relative;
        font-size: 20px;
        color: #1e293b;
        font-weight: 600;
        margin: 0 0 20px 0;
        padding-left: 12px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e2e8f0;
        line-height: 1.4;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 16px;
          background: #334155;
          border-radius: 3px;
        }
      }

      .url {
        font-weight: 500;
        margin: 0 12px;
        padding: 6px 12px;
        cursor: pointer;
        color: #475569;
        font-size: 14px;
        user-select: all;
        border-radius: 4px;
        transition: all 0.3s ease;
        text-decoration: none;
        outline: none;
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        border: 1px solid rgba(203, 213, 224, 0.8);

        &:hover {
          opacity: 0.8;
        }

        &:active,
        &:focus {
          outline: none;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
          border-color: #94a3b8;
        }
      }

      .el-tag {
        font-weight: 500;
        height: 28px;
      }

      .el-button {
        margin-left: 12px;

        .el-icon {
          margin-right: 4px;
        }
      }
    }

    .example {
      width: 100%;
      margin: 0;

      code {
        white-space: pre-wrap;
        word-break: break-all;
      }

      .hljs {
        background: transparent;
        padding: 0;
      }
    }

    pre {
      display: block;
      position: relative;
      padding: 16px;
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      border-radius: 8px;

      .copy {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 6px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 4px;
        opacity: 0;
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          background: #fff;
        }
      }

      &:hover .copy {
        opacity: 1;
      }
    }

    .mac_light {
      background: #f9fafb !important;
      border: 1px solid #f1f5f9;
    }

    .mac_light code {
      background: transparent !important;
    }

    .mac_pre::before {
      content: '';
      display: block;
      height: 12px;
      margin: 0 0 16px 4px;
      border-radius: 50%;
      background: #ff5f56;
      box-shadow: 20px 0 #ffbd2e, 40px 0 #27c93f;
      width: 12px;
    }

    // 高级模式HTML容器样式
    .example-html-container {
      position: relative;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
      overflow: hidden;

      &::before {
        content: '';
        display: block;
        height: 12px;
        margin: 10px 0 16px 16px;
        border-radius: 50%;
        background: #ff5f56;
        box-shadow: 20px 0 #ffbd2e, 40px 0 #27c93f;
        width: 12px;
      }

      .copy {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 6px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.3s ease;
        cursor: pointer;
        z-index: 10;

        &:hover {
          background: #fff;
        }
      }

      &:hover .copy {
        opacity: 1;
      }

      .html-content {
        padding: 16px;
        padding-top: 0;
        min-height: 60px;
        line-height: 1.6;
        color: #2c3e50;

        // 确保富文本内容的样式
        :deep(p) {
          margin: 0 0 12px 0;
          line-height: 1.6;

          &:last-child {
            margin-bottom: 0;
          }
        }

        :deep(h1, h2, h3, h4, h5, h6) {
          margin: 16px 0 8px 0;
          color: #2c3e50;

          &:first-child {
            margin-top: 0;
          }
        }

        :deep(ul, ol) {
          margin: 8px 0;
          padding-left: 24px;
        }

        :deep(li) {
          margin: 4px 0;
        }

        :deep(strong) {
          font-weight: 600;
          color: #1a202c;
        }

        :deep(em) {
          font-style: italic;
        }

        :deep(code) {
          background: #e2e8f0;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          color: #e53e3e;
        }

        :deep(pre) {
          background: #2d3748;
          color: #e2e8f0;
          padding: 12px;
          border-radius: 6px;
          margin: 12px 0;
          overflow-x: auto;

          code {
            background: transparent;
            color: inherit;
            padding: 0;
          }
        }

        :deep(blockquote) {
          border-left: 4px solid #409eff;
          margin: 12px 0;
          padding: 8px 16px;
          background: #f0f9ff;
          color: #1a365d;
        }

        :deep(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;

          th,
          td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: left;
          }

          th {
            background: #f9fafb;
            border: 1px solid #f1f5f9;
            font-weight: 600;
          }
        }

        :deep(a) {
          color: #409eff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }

        :deep(img) {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 8px 0;
        }
      }
    }

    .el-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 16px;
      }

      :deep(.el-tabs__nav) {
        border: none;
      }

      :deep(.el-tabs__item) {
        border: 1px solid #e2e8f0;
        margin-right: 8px;
        border-radius: 4px;
        height: 32px;
        line-height: 32px;

        &.is-active {
          border-color: #475569;
          color: #475569;
        }

        &:hover {
          color: #475569;
        }
      }
    }

    .el-table {
      border-radius: 8px;
      overflow: hidden;

      :deep(th) {
        background: #f9fafb;
        color: #1a202c;
        font-weight: 600;
        padding: 8px 16px;
        height: 40px;
      }

      :deep(td) {
        padding: 8px 16px;
        height: 40px;
      }

      :deep(.el-table__header) {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        overflow: hidden;
      }

      :deep(.cell) {
        font-size: 13px;
        line-height: 1.4;
      }
    }
  }

  @media screen and (max-width: 768px) {
    .apiinfo-container {
      width: 92%;
      padding: 20px 0;

      .box {
        margin-bottom: 32px;

        h1 {
          font-size: 24px;
          margin-bottom: 20px;
        }

        h2 {
          font-size: 18px;
          margin-bottom: 20px;
        }
      }
    }
  }
}

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

  .doc-container {
    .apiinfo-container {
      width: 95%;
      padding: 20px 0;
    }
  }
}
</style>
