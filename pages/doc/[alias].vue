<template>
  <div class="container">
    <!-- 公告 -->
    <IndexNotice></IndexNotice>

    <div class="apiinfo-container">
      <div class="box">
        <h1>{{ apiInfo.name }}</h1>
      </div>

      <div class="box">
        <el-tag type="success">{{ apiInfo.method }}</el-tag>

        <el-tooltip effect="dark" content="点击复制" placement="top">
          <span class="url" @click="copy(apiInfo.url)" ref="urlDom">{{
            apiInfo.url
          }}</span>
        </el-tooltip>

        <el-button type="primary" size="small" @click="openDebugDialog">
          <el-icon><VideoPlay /></el-icon>
          调试
        </el-button>
      </div>

      <el-divider border-style="dashed" />

      <div class="box">
        <h2>接口描述</h2>
        <span>{{ apiInfo.description }}</span>
      </div>

      <el-divider border-style="dashed" />

      <div class="box">
        <h2>请求参数</h2>
        <el-table :data="apiInfo.params" border style="width: 100%">
          <el-table-column prop="name" label="参数名" width="180" />
          <el-table-column prop="param" label="传递参数" width="180" />
          <el-table-column prop="position" label="传入位置" width="120" />
          <el-table-column prop="required" label="类型" width="100" />
          <el-table-column prop="docs" label="参数说明" />
        </el-table>
      </div>

      <client-only>
        <Ad></Ad>
      </client-only>

      <div class="box">
        <h2>请求示例</h2>
        <el-tabs v-model="activeName" type="card">
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
            content="复制"
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

      <div class="box">
        <h2>返回示例</h2>
        <pre class="example mac_light mac_pre"><client-only><el-tooltip
        class="box-item"
        effect="dark"
        content="复制"
        placement="left"
      ><div class="copy" @click="copy(apiInfo.example)"><el-icon size="14"><CopyDocument /></el-icon></div
      ></el-tooltip></client-only><code class="json" v-text="apiInfo.example"></code></pre>
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
              v-for="param in apiInfo.params"
              :key="param.id"
              :label="param.name"
              :required="param.required === '必传'"
            >
              <el-input
                v-model="debugForm[param.param]"
                :placeholder="param.param"
              />
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
          <template v-if="isImageResponse">
            <div class="image-response">
              <img :src="imageUrl" alt="接口返回图片" />
              <div class="image-actions">
                <el-button type="primary" size="small" @click="downloadImage">
                  <el-icon><Download /></el-icon>
                  下载图片
                </el-button>
                <el-button size="small" @click="copyImageUrl">
                  <el-icon><CopyDocument /></el-icon>
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

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<script setup>
const { $myFetch } = useNuxtApp()
import { ElMessage } from 'element-plus'
import { CopyDocument, VideoPlay, Download } from '@element-plus/icons-vue'

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
const options = ref({})

const {
  data: { value: res1 },
} = await useAsyncData('Options', () => $myFetch('Options'))

options.value = res1.data

useHead({
  title: apiInfo.value.name + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    { name: 'description', content: apiInfo.value.description },
    { name: 'keywords', content: apiInfo.value.keywords },
  ],
})

onMounted(() => {
  hljs.registerLanguage('json', json)
  hljs.registerLanguage('javascript.js', javascript)
  hljs.registerLanguage('php', php)
  hljs.registerLanguage('python', python)
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

// 修改发送请求函数
const sendRequest = async () => {
  loading.value = true
  try {
    // 检查必填参数
    const missingParams = apiInfo.value.params
      .filter(
        (param) => param.required === '必传' && !debugForm.value[param.param]
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
      for (const param of apiInfo.value.params) {
        const value = debugForm.value[param.param]
        if (value) {
          formData.append(param.name, value)
        }
      }
      options.body = formData
    } else {
      // GET 请求，将参数添加到 URL
      const params = new URLSearchParams()
      for (const param of apiInfo.value.params) {
        const value = debugForm.value[param.param]
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
        isImageResponse.value = true
        imageUrl.value = redirectUrl
        response.value = { code: 200, msg: '图片获取成功' }
        ElMessage.success('请求成功')
        return
      }
    }

    // 处理直接返回的图片
    if (contentType && contentType.includes('image/')) {
      isImageResponse.value = true
      const blob = await res.blob()
      imageUrl.value = URL.createObjectURL(blob)
      response.value = { code: 200, msg: '图片获取成功' }
    } else {
      // 处理 JSON 响应
      isImageResponse.value = false
      const data = await res.json()
      response.value = data
      imageUrl.value = ''

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
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
      imageUrl.value = ''
    }
  }
})
</script>

<style lang="less">
.el-message {
  z-index: 9999 !important;
}

.container {
  width: 100%;
  min-height: 100vh;
  background: #ffffff;

  .apiinfo-container {
    width: 90%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 32px 0;

    .box {
      margin-bottom: 40px;

      h1 {
        font-size: 28px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0 0 24px 0;
      }

      h2 {
        position: relative;
        font-size: 20px;
        color: #2c3e50;
        font-weight: 500;
        margin: 0 0 24px 0;
        padding-left: 12px;
        line-height: 1.4;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 16px;
          background: #409eff;
          border-radius: 3px;
        }
      }

      .url {
        font-weight: 500;
        margin: 0 12px;
        padding: 6px 12px;
        cursor: pointer;
        color: #181819b3;
        font-size: 14px;
        user-select: all;
        border-radius: 4px;
        transition: all 0.3s ease;
        text-decoration: none;
        outline: none;

        &:hover {
          opacity: 0.8;
        }

        &:active,
        &:focus {
          outline: none;
          background: transparent;
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
    }

    pre {
      display: block;
      position: relative;
      padding: 16px;
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #2c3e50;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #edf2f7;

      .copy {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 6px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        opacity: 0;
        transition: opacity 0.3s ease;
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
      background: #f8fafc !important;
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
          border-color: #409eff;
          color: #409eff;
        }

        &:hover {
          color: #409eff;
        }
      }
    }

    .el-table {
      border-radius: 8px;
      overflow: hidden;

      :deep(th) {
        background: #f8fafc;
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
        background: #409eff;
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
        box-shadow: 0 0 0 1px #409eff inset;
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
        background: #67c23a;
        border-radius: 3px;
      }
    }

    pre {
      margin: 0;
      max-height: 400px;
      overflow: auto;
    }

    .image-response {
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #edf2f7;
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
  }
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);

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
