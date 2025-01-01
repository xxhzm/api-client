<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
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
                    <el-input v-model="createArticleInfo.title" maxlength="256" show-word-limit placeholder="请输入文章标题" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="关键词" required>
                    <el-input v-model="createArticleInfo.keywords" maxlength="256" show-word-limit
                      placeholder="请输入关键词，英文逗号隔开" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="文章描述" required>
                    <el-input v-model="createArticleInfo.description" type="textarea" :rows="3" placeholder="请输入文章描述" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <div id="vditor" class="editor-container"></div>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="footer-actions">
          <div class="action-buttons">
            <el-button type="primary" size="large" @click="submit">发布文章</el-button>
            <el-button type="warning" size="large" @click="navigateTo('/admin/articlelist')">返回列表</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Vditor from 'vditor'
import 'vditor/dist/index.css'

// 初始化富文本编辑器
const vditor = ref(null)
onMounted(() => {
  vditor.value = new Vditor('vditor', {
    after: () => {
      vditor.value.setValue('')
    },
    height: 640,
    toolbarConfig: {
      pin: false,
    },
    toolbar: [
      'emoji',
      'headings',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      '|',
      'quote',
      'line',
      'code',
      'inline-code',
      'insert-before',
      'insert-after',
      '|',
      'table',
      '|',
      'undo',
      'redo',
      '|',
      'fullscreen',
      'edit-mode',
      {
        name: 'more',
        toolbar: ['export', 'outline', 'preview'],
      },
    ],
  })
})

const username = useCookie('username')
const { $msg, $myFetch } = useNuxtApp()

const createArticleInfo = reactive({
  title: '',
  description: '',
  keywords: '',
})

const submit = async () => {
  if (
    !createArticleInfo.title ||
    !createArticleInfo.description ||
    !createArticleInfo.keywords ||
    !vditor.value.getHTML()
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  const content = window.encodeURIComponent(vditor.value.getHTML())
  const body = new URLSearchParams()
  body.append('title', createArticleInfo.title)
  body.append('content', content)
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

<style lang="less" scoped>
.container {
  display: flex;
  background: #f5f7fa;

  .right {
    width: 100%;
    min-width: 0;

    .createarticle-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      padding-bottom: 100px;
      display: flex;
      justify-content: center;

      .article-card {
        width: 100%;
        max-width: 1400px;
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

            :deep(.vditor-toolbar) {
              border-bottom: 1px solid #eaecf0;
              background: #f8fafc;
              padding: 8px 16px;
            }

            :deep(.vditor-reset) {
              padding: 20px;
              min-height: 500px;
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
