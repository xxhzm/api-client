<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  height: {
    type: Number,
    default: 600,
  },
})

const emit = defineEmits(['update:modelValue'])

const editorInstance = ref(null)
const editorError = ref(null)
const editorInitialized = ref(false)
const editorReady = ref(false)
const editorId = `editor-${Math.random().toString(36).substr(2, 9)}`

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

// 监听modelValue变化，更新编辑器内容
watch(
  () => props.modelValue,
  (newValue) => {
    if (editorInstance.value && editorInitialized.value) {
      const currentContent = editorInstance.value.getContent()
      if (currentContent !== newValue) {
        editorInstance.value.setContent(newValue || '')
      }
    }
  }
)

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
      const editorElement = document.getElementById(editorId)
      if (!editorElement) {
        editorError.value = 'Editor element not found'
        return
      }

      // 如果已有编辑器实例，先移除
      if (window.tinymce && window.tinymce.get(editorId)) {
        window.tinymce.remove(`#${editorId}`)
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
        selector: `#${editorId}`,
        license_key: '',
        height: props.height,
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
            editor.setContent(props.modelValue || '')
            editorInitialized.value = true
          })
          editor.on('change input', function () {
            const content = editor.getContent()
            emit('update:modelValue', content)
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

// 获取编辑器内容的方法
const getContent = () => {
  if (editorInstance.value) {
    return editorInstance.value.getContent()
  }
  return ''
}

// 设置编辑器内容的方法
const setContent = (content) => {
  if (editorInstance.value && editorInitialized.value) {
    editorInstance.value.setContent(content || '')
  }
}

// 暴露方法给父组件
defineExpose({
  getContent,
  setContent,
  editorInstance: readonly(editorInstance),
})

// 组件卸载时销毁编辑器
onBeforeUnmount(() => {
  if (window.tinymce && editorInstance.value) {
    try {
      window.tinymce.remove(editorInstance.value)
    } catch (error) {}
  }
})
</script>

<template>
  <div class="tinymce-editor-container">
    <client-only>
      <div v-if="editorError" class="editor-error">
        {{ editorError }}
      </div>
      <textarea :id="editorId"></textarea>
    </client-only>
  </div>
</template>

<style lang="less" scoped>
.tinymce-editor-container {
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
</style>
