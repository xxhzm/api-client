<script setup>
import { Menu } from '@element-plus/icons-vue'

const route = useRoute()
const { $msg, $myFetch } = useNuxtApp()

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

const updateArticleInfo = ref({
  id: 0,
  title: '',
  description: '',
  keywords: '',
  content: '',
  status: '1',
})

const getData = async () => {
  const res = await $myFetch('ArticleId', {
    params: {
      id: route.params.id,
    },
  })

  updateArticleInfo.value = res.data

  // 获取数据后准备初始化编辑器
  editorReady.value = true
}

// 监听editorReady变化，当准备好时初始化编辑器
watch(editorReady, (isReady) => {
  if (isReady) {
    // 延迟初始化编辑器，确保DOM已完全渲染
    setTimeout(() => {
      initEditor()
    }, 500)
  }
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
            editor.setContent(updateArticleInfo.value.content)
            editorInitialized.value = true
          })
          editor.on('change', function () {
            updateArticleInfo.value.content = editor.getContent()
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

onMounted(async () => {
  await getData()
})

const submit = async () => {
  if (
    !updateArticleInfo.value.title ||
    !updateArticleInfo.value.description ||
    !updateArticleInfo.value.keywords ||
    !updateArticleInfo.value.content ||
    !updateArticleInfo.value.status
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  // 确保获取最新内容
  if (editorInstance.value) {
    updateArticleInfo.value.content = editorInstance.value.getContent()
  }

  const body = new URLSearchParams()
  body.append('id', updateArticleInfo.value.id)
  body.append('title', updateArticleInfo.value.title)
  body.append('content', updateArticleInfo.value.content)
  body.append('description', updateArticleInfo.value.description)
  body.append('keywords', updateArticleInfo.value.keywords)
  body.append('status', updateArticleInfo.value.status)

  const res = await $myFetch('UpdateArticle', {
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
      <div class="createArticle-container">
        <div class="createArticle-cont">
          <el-form :model="updateArticleInfo" label-width="100px">
            <el-row :gutter="12">
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <el-form-item label="文章标题">
                  <el-input
                    v-model="updateArticleInfo.title"
                    maxlength="256"
                    show-word-limit
                  /> </el-form-item
              ></el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <el-form-item label="文章状态">
                  <el-select
                    v-model="updateArticleInfo.status"
                    placeholder="请选择状态"
                  >
                    <el-option label="开启" value="1"></el-option>
                    <el-option label="关闭" value="2"></el-option>
                    <el-option label="草稿" value="3"></el-option>
                  </el-select> </el-form-item
              ></el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <el-form-item label="文章关键词">
                  <el-input
                    v-model="updateArticleInfo.keywords"
                    maxlength="256"
                    show-word-limit
                    placeholder="英文逗号隔开"
                  /> </el-form-item
              ></el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <el-form-item label="文章描述">
                  <el-input
                    v-model="updateArticleInfo.description"
                  /> </el-form-item
              ></el-col>
              <el-col
                :xs="23"
                :sm="23"
                :md="23"
                :lg="23"
                :xl="23"
                style="margin: 0 auto"
              >
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
        <div class="createArticle-footer">
          <div class="button">
            <el-button
              size="large"
              color="#626aef"
              type="primary"
              @click="submit"
              >提交</el-button
            >

            <el-button
              size="large"
              color="#ff9e08"
              style="color: #fff"
              type="primary"
              @click="navigateTo('/admin')"
              >返回</el-button
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
  .right {
    width: 100%;
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
    .createArticle-container {
      position: relative;
      width: 100%;
      min-height: 100vh;
      padding: 10px;
      background-color: #f7f7f7;
      .createArticle-cont {
        width: 100%;
        padding: 20px 20px;
        background: #fff;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        margin-top: 20px;

        .editor-container {
          min-height: 400px;
          background-color: #f9fafb;
          border: 1px solid #eaecf0;
          border-radius: 8px;
          overflow: hidden;

          .editor-error {
            padding: 20px;
            color: #ef4444;
            font-weight: 500;
          }

          :deep(.tox-tinymce) {
            border: none;
            border-radius: 8px;
          }
        }
      }

      .createArticle-footer {
        position: fixed;
        left: 200px;
        bottom: 0;
        width: calc(100% - 200px);
        height: 80px;
        background: #fff;
        box-shadow: 2px 2px 2px rgb(0 0 0 / 10%);
        .button {
          position: absolute;
          right: 50px;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .createArticle-footer {
    left: 0 !important;
    width: 100% !important;
  }
}
</style>
