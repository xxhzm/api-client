<script setup>
import { Menu } from '@element-plus/icons-vue'

// 控制左侧边栏显示隐藏
// 获取页面宽度
const screenWidth = ref(0)
const isSidebarShow = ref(true)
const iscontrolShow = ref(false)
const isoverlay = ref(false)
const editorInstance = ref(null)
const editorError = ref(null)
const editorInitialized = ref(false)
const editorReady = ref(false)

onMounted(() => {
  screenWidth.value = document.body.clientWidth
  document.body.style.overflow = ''

  if (screenWidth.value < 768) {
    iscontrolShow.value = true
    isSidebarShow.value = false
  }
})

// 使用nextTick确保DOM已渲染
onMounted(() => {
  // 延迟初始化编辑器，确保DOM已完全渲染
  setTimeout(() => {
    editorReady.value = true
  }, 500)
})

// 监听editorReady变化，当准备好时初始化编辑器
watch(editorReady, (isReady) => {
  if (isReady) {
    initEditor()
  }
})

const handleSidebarShow = () => {
  isSidebarShow.value = !isSidebarShow.value
  iscontrolShow.value = !iscontrolShow.value
  isoverlay.value = !isoverlay.value
  // 禁止页面滑动
  if (isSidebarShow.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const username = useCookie('username')
const { $msg, $myFetch } = useNuxtApp()

const createArticleInfo = reactive({
  title: '',
  description: '',
  keywords: '',
  content: '',
})

// 加载TinyMCE脚本
const loadTinyMCEScript = () => {
  return new Promise((resolve, reject) => {
    // 如果已经加载过，直接返回
    if (window.tinymce) {
      resolve(window.tinymce)
      return
    }

    // 检查是否已存在脚本标签
    const existingScript = document.querySelector(
      'script[src="/tinymce/tinymce.min.js"]'
    )
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.tinymce))
      existingScript.addEventListener('error', (e) => reject(e))
      return
    }

    // 创建新的脚本标签
    const script = document.createElement('script')
    script.src = '/tinymce/tinymce.min.js'
    script.async = true
    script.defer = true

    script.addEventListener('load', () => {
      resolve(window.tinymce)
    })

    script.addEventListener('error', (e) => {
      reject(new Error('Failed to load TinyMCE script'))
    })

    document.head.appendChild(script)
  })
}

// 初始化编辑器
const initEditor = async () => {
  // 确保在客户端环境
  if (process.client) {
    try {
      // 检查DOM元素是否存在
      const editorElement = document.getElementById('editor')
      if (!editorElement) {
        editorError.value = 'Editor element not found'
        return
      }

      // 如果已有编辑器实例，先移除
      if (window.tinymce && window.tinymce.get('editor')) {
        window.tinymce.remove('#editor')
      }

      // 加载TinyMCE脚本
      await loadTinyMCEScript()

      // 初始化TinyMCE
      initTinyMCE()
    } catch (error) {
      editorError.value = `Error initializing TinyMCE: ${error.message}`
    }
  }
}

// 初始化TinyMCE
const initTinyMCE = () => {
  try {
    if (!window.tinymce) {
      editorError.value = 'TinyMCE is not loaded'
      return
    }

    // 配置TinyMCE
    window.tinymce
      .init({
        selector: '#editor',
        license_key: '',
        height: 600,
        menubar: true,
        promotion: false,
        plugins: [
          'advlist',
          'autolink',
          'lists',
          'link',
          'image',
          'charmap',
          'preview',
          'anchor',
          'searchreplace',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'help',
          'wordcount',
        ],
        toolbar:
          'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | image | help',
        language: 'zh_CN',
        language_url: '/tinymce/zh_CN.js',
        content_style:
          'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        branding: false,
        base_url: '/tinymce',
        suffix: '.min',
        setup: function (editor) {
          editorInstance.value = editor
          editor.on('init', function () {
            editor.setContent(createArticleInfo.content)
            editorInitialized.value = true
          })
          editor.on('change', function () {
            createArticleInfo.content = editor.getContent()
          })
        },
      })
      .then((editors) => {})
      .catch((err) => {
        editorError.value = `编辑器加载失败: ${err.message || '未知错误'}`
      })
  } catch (error) {
    editorError.value = `Error in TinyMCE initialization: ${error.message}`
  }
}

// 组件卸载时销毁编辑器
onBeforeUnmount(() => {
  if (window.tinymce && editorInstance.value) {
    try {
      window.tinymce.remove(editorInstance.value)
    } catch (error) {}
  }
})

const submit = async () => {
  if (
    !createArticleInfo.title ||
    !createArticleInfo.description ||
    !createArticleInfo.keywords ||
    !createArticleInfo.content
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  // 确保获取最新内容
  if (editorInstance.value) {
    createArticleInfo.content = editorInstance.value.getContent()
  }

  const body = new URLSearchParams()
  body.append('title', createArticleInfo.title)
  body.append('content', createArticleInfo.content)
  body.append('description', createArticleInfo.description)
  body.append('keywords', createArticleInfo.keywords)
  body.append('username', username.value)

  const res = await $myFetch('CreateArticle', {
    method: 'POST',
    body: body,
  })

  if (res.code !== 200) {
    $msg(res.msg, 'error')
  } else {
    $msg(res.msg, 'success')
  }

  setTimeout(() => {
    navigateTo('/admin/articlelist')
  }, 500)
}

useHead({
  title: '新增文章',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="container">
    <AdminSidebar v-show="isSidebarShow"></AdminSidebar>

    <div class="right">
      <!-- 遮罩层 -->
      <div class="overlay" v-show="isoverlay" @click="handleSidebarShow"></div>
      <!-- 侧边栏控制按钮 -->
      <div class="control-sidebar" v-show="iscontrolShow">
        <el-icon @click="handleSidebarShow"><Menu /></el-icon>
      </div>
      <AdminHeader></AdminHeader>
      <div class="createarticle-container">
        <div class="article-card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <span class="title">新增文章</span>
            </div>
          </div>

          <!-- 表单区域 -->
          <div class="form-container">
            <el-form :model="createArticleInfo" label-width="90px">
              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="文章标题" required>
                    <el-input
                      v-model="createArticleInfo.title"
                      maxlength="256"
                      show-word-limit
                      placeholder="请输入文章标题"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="关键词" required>
                    <el-input
                      v-model="createArticleInfo.keywords"
                      maxlength="256"
                      show-word-limit
                      placeholder="请输入关键词，英文逗号隔开"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="文章描述" required>
                    <el-input
                      v-model="createArticleInfo.description"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入文章描述"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <div class="editor-container">
                    <client-only>
                      <div v-if="editorError" class="editor-error">
                        {{ editorError }}
                      </div>
                      <textarea id="editor"></textarea>
                    </client-only>
                  </div>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="footer-actions">
          <div class="action-buttons">
            <el-button type="primary" size="large" @click="submit"
              >发布文章</el-button
            >
            <el-button
              type="warning"
              size="large"
              @click="navigateTo('/admin/articlelist')"
              >返回列表</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  background: #f5f7fa;
  .right {
    width: 100%;
    min-width: 0;
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 998;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }
    .control-sidebar {
      position: absolute;
      width: 35px;
      height: 35px;
      top: 10px;
      left: 10px;
      z-index: 9999;
      text-align: center;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      .el-icon {
        margin-top: 10px;
        font-size: 16px;
      }
    }
    .createarticle-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      padding-bottom: 100px;
      display: flex;
      justify-content: center;
      .article-card {
        width: 100%;
        margin: 0 auto;
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
          margin-bottom: 16px;

          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;

            .title {
              font-size: 16px;
              font-weight: 600;
              color: #1a1f36;
            }
          }
        }

        .form-container {
          padding: 24px;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

          :deep(.el-form-item__label) {
            font-weight: 500;
            color: #374151;
          }

          :deep(.el-input__wrapper),
          :deep(.el-textarea__inner) {
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            border: 1px solid #d1d5db;
            border-radius: 6px;

            &:hover {
              border-color: #9ca3af;
            }

            &.is-focus {
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
          }

          .editor-container {
            margin-top: 16px;
            border: 1px solid #eaecf0;
            border-radius: 12px;
            overflow: hidden;
            min-height: 400px;
            background-color: #f9fafb;

            .editor-error {
              padding: 20px;
              color: #ef4444;
              font-weight: 500;
            }

            :deep(.tox-tinymce) {
              border: none;
              border-radius: 12px;
            }
          }
        }
      }

      .footer-actions {
        position: fixed;
        left: 200px;
        bottom: 0;
        right: 0;
        padding: 16px 24px;
        background: #fff;
        border-top: 1px solid #eaecf0;
        box-shadow: 0 -1px 2px 0 rgba(0, 0, 0, 0.03);
        z-index: 10;

        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          max-width: 1400px;
          margin: 0 auto;

          .el-button {
            min-width: 100px;
            font-weight: 500;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container .right .createarticle-container {
    padding: 16px;
    padding-bottom: 100px;
  }

  .footer-actions {
    left: 0 !important;
  }
}

@media screen and (max-width: 768px) {
  .container .right .createarticle-container {
    padding: 12px;
    padding-bottom: 100px;
  }
}
</style>

padding-bottom: 100px;
