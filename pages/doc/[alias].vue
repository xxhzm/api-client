<script setup>
const { $myFetch } = useNuxtApp()
import { ElMessage } from 'element-plus'
import {
  CopyDocument,
  VideoPlay,
  Download,
  Document,
  InfoFilled,
  Connection,
} from '@element-plus/icons-vue'

import 'highlight.js/styles/github.css'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import javascript from 'highlight.js/lib/languages/javascript'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'

const activeName = ref('axios')
const route = useRoute()

const apiInfo = ref({})
const { userAccessKey } = useUserKey()

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
  if (typeof response.value === 'string') return response.value
  return JSON.stringify(response.value, null, 2)
})

// 打开调试对话框
const openDebugDialog = () => {
  debugVisible.value = true
  debugForm.value = {}
  response.value = null
  const i = apiInfo.value?.params?.findIndex(
    (p) => String(p.name).toLowerCase() === 'key'
  )
  if (i !== undefined && i !== -1 && userAccessKey.value) {
    debugForm.value[i] = userAccessKey.value
  }
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

    // 分离不同位置的参数
    const headerParams = []
    const bodyParams = []
    const queryParams = []

    for (let i = 0; i < apiInfo.value.params.length; i++) {
      const param = apiInfo.value.params[i]
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
    if (apiInfo.value.method === 'POST') {
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
        if (preElement.value && responseCode.value) {
          const newCode = document.createElement('code')

          if (typeof data === 'object') {
            newCode.className = 'json'
            newCode.textContent = JSON.stringify(data, null, 2)
            hljs.registerLanguage('json', json)
            hljs.highlightElement(newCode)
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

const jsonBodyParam = computed(() => {
  if (!apiInfo.value.params) return null
  return apiInfo.value.params.find(
    (p) =>
      p.name === 'json' &&
      p.param === 'json' &&
      p.position === 'body' &&
      p.required === '必传'
  )
})

const formattedJsonDocs = computed(() => {
  if (!jsonBodyParam.value || !jsonBodyParam.value.docs) return ''
  try {
    const parsed =
      typeof jsonBodyParam.value.docs === 'string'
        ? JSON.parse(jsonBodyParam.value.docs)
        : jsonBodyParam.value.docs
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    return jsonBodyParam.value.docs
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
    <!-- 导航栏 -->
    <IndexNavbar></IndexNavbar>
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
          <div class="table-container" v-if="!jsonBodyParam">
            <el-table
              :data="apiInfo.params"
              style="width: 100%"
              class="params-table"
            >
              <el-table-column
                prop="name"
                label="参数名"
                :width="isMobile ? 120 : 180"
              />
              <el-table-column
                prop="param"
                label="传递参数"
                :width="isMobile ? 140 : 180"
              />
              <el-table-column
                prop="position"
                label="传入位置"
                :width="isMobile ? 80 : 120"
              />
              <el-table-column
                prop="required"
                label="类型"
                :width="isMobile ? 80 : 100"
              >
                <template #default="scope">
                  <el-tag
                    :type="scope.row.required === '必传' ? 'danger' : 'info'"
                    size="small"
                  >
                    {{ scope.row.required }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="docs"
                label="参数说明"
                :min-width="isMobile ? 160 : 240"
              />
            </el-table>

            <!-- Key传递方式说明 -->
            <div
              v-if="
                apiInfo.params?.some(
                  (p) => String(p.name).toLowerCase() === 'key'
                )
              "
              class="key-guide-container"
            >
              <div class="usage-guide">
                <div class="guide-title">
                  <el-icon><Connection /></el-icon>
                  <span>怎么传递这个 Key？</span>
                </div>
                <div class="method-cards">
                  <!-- 方法1 -->
                  <div class="method-card recommended">
                    <div class="card-badge">推荐</div>
                    <div class="card-title">方法 1：Bearer Token (Header)</div>
                    <div class="card-desc">标准规范，兼容性最好，最安全</div>
                    <div
                      class="code-block"
                      @click="copy('Authorization: Bearer Key')"
                    >
                      <div class="code-line">
                        <span class="label">Authorization:</span>
                        <span class="value">Bearer Key</span>
                      </div>
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </div>
                  </div>

                  <!-- 方法2 -->
                  <div class="method-card">
                    <div class="card-title">方法 2：放在请求头 (Header)</div>
                    <div class="card-desc">
                      直接使用 Authorization，无需前缀
                    </div>
                    <div class="code-block" @click="copy('Authorization: Key')">
                      <div class="code-line">
                        <span class="label">Authorization:</span>
                        <span class="value">Key</span>
                      </div>
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </div>
                  </div>

                  <!-- 方法3 -->
                  <div class="method-card">
                    <div class="card-title">方法 3：放在请求头 (Header)</div>
                    <div class="card-desc">自定义 Header key 字段</div>
                    <div class="code-block" @click="copy('key: Key')">
                      <div class="code-line">
                        <span class="label">key:</span>
                        <span class="value">Key</span>
                      </div>
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </div>
                  </div>

                  <!-- 方法4 -->
                  <div class="method-card deprecated">
                    <div class="card-badge">不推荐</div>
                    <div class="card-title">方法 4：放在网址后面 (Query)</div>
                    <div class="card-desc">
                      不安全，可能泄露 Key，<span class="danger-text"
                        >即将弃用</span
                      >
                    </div>
                    <div class="code-block" @click="copy('?key=Key')">
                      <div class="code-line">
                        <span class="label">网址?key=</span>
                        <span class="value">Key</span>
                      </div>
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div style="margin-bottom: 10px">
              请使用 POST 请求传递以下 JSON 参数：
            </div>
            <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(formattedJsonDocs)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="json" v-text="formattedJsonDocs"></code></pre>
          </div>
        </div>

        <!-- 广告位 -->
        <client-only>
          <div
            class="box ad-section"
            v-if="
              adDisplay &&
              !(apiInfo.package_list && apiInfo.package_list.length > 0)
            "
          >
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
              <el-table-column prop="name" label="套餐名称" />
              <el-table-column prop="description" label="套餐描述" />
              <el-table-column label="套餐类型" width="100" align="center">
                <template #default="scope">
                  <el-tag
                    v-if="scope.row.type === 4"
                    type="danger"
                    size="small"
                  >
                    直接扣费
                  </el-tag>
                  <el-tag
                    v-else
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
                  <span v-else-if="scope.row.type === 4">按次扣费</span>
                  <span v-else>{{ scope.row.points }}次</span>
                </template>
              </el-table-column>
              <el-table-column label="有效期" width="100" align="center">
                <template #default="{ row }">
                  <span>
                    <!-- type为4或 duration <= 0 时显示永久 -->
                    {{
                      row.type === 4 || row.duration <= 0
                        ? '永久'
                        : row.duration + '天'
                    }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="price"
                label="价格"
                width="100"
                align="center"
              >
                <template #default="scope">
                  <span v-if="scope.row.type === 4" class="package-price-cell"
                    >¥{{ scope.row.price }}/次</span
                  >
                  <span v-else class="package-price-cell"
                    >¥{{ scope.row.price }}</span
                  >
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

    <IndexAi></IndexAi>
    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less" scoped>
.key-guide-container {
  margin-top: 24px;

  .usage-guide {
    .guide-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: 600;
      color: #2e3033;

      .el-icon {
        color: #4096ff;
        font-size: 20px;
      }
    }

    .method-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;

      .method-card {
        position: relative;
        background: #fff;
        border: 1px solid #edf1f7;
        border-radius: 12px;
        padding: 20px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #d9e1ec;

          .code-block {
            background: #ecf5ff;
            border-color: #c6e2ff;

            .copy-icon {
              opacity: 1;
            }
          }
        }

        &.recommended {
          border: 1px solid #b3d8ff;
          background: #f0f9ff;

          .card-badge {
            background: #4096ff;
            color: #fff;
          }
        }

        &.deprecated {
          border: 1px solid #ffccc7;
          background: #fff2f0;

          .card-badge {
            background: #ff4d4f;
            color: #fff;
          }

          .danger-text {
            color: #ff4d4f;
            font-weight: 500;
          }
        }

        .card-badge {
          position: absolute;
          top: 0;
          right: 0;
          font-size: 12px;
          padding: 2px 10px;
          border-bottom-left-radius: 8px;
          border-top-right-radius: 12px;
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: #2e3033;
          margin-bottom: 8px;
        }

        .card-desc {
          font-size: 13px;
          color: #8c95a5;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .code-block {
          background: #f8fafc;
          border: 1px solid #e1e5eb;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;

          .code-line {
            font-family: 'Roboto Mono', monospace;
            font-size: 13px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 10px;

            .label {
              color: #d63200;
              margin-right: 8px;
            }

            .value {
              color: #0052d9;
              font-weight: 500;
            }
          }

          .copy-icon {
            font-size: 16px;
            color: #4096ff;
            opacity: 0.5;
            transition: all 0.2s;
          }
        }
      }
    }
  }
}
</style>

<style lang="less">
.el-message {
  z-index: 9999 !important;
}

.doc-container {
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji',
    'Segoe UI Symbol';

  .apiinfo-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 40px 24px;
    display: grid;
    grid-template-columns: 260px 1fr;
    column-gap: 24px;
    row-gap: 0;
    align-items: start;

    @media (max-width: 1024px) {
      padding: 24px 16px;
      display: block;
    }

    .sidebar {
      display: block;
      position: sticky;
      top: 24px;
      align-self: start;

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
      border-bottom: 1px solid #e2e8f0;

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
          border-radius: 0;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;

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
              color: #409eff;
            }
          }

          &:hover {
            background: #f8fafc;
            border-color: #cdd5df;
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
          width: 2px;
          height: 16px;
          background: #cbd5e1;
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
      display: none;
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
        border: 1px solid #eaecf0;
        margin-right: 8px;
        border-radius: 8px;
        height: 32px;
        line-height: 32px;

        &.is-active {
          background: #ecf5ff;
          border-color: #b3d8ff;
          color: #409eff;
        }

        &:hover {
          color: #1a1f36;
        }
      }
    }

    .el-table {
      border-radius: 12px;
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
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
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

      .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .params-table {
        :deep(.el-table__header th),
        :deep(.el-table__body td) {
          padding: 6px 8px;
        }
      }

      :deep(.el-table .cell) {
        font-size: 12px;
        line-height: 1.5;
        white-space: normal;
        word-break: break-word;
      }

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
