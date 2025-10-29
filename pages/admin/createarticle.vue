<script setup>
import { Menu, InfoFilled } from '@element-plus/icons-vue'

// 控制左侧边栏显示隐藏
// 获取页面宽度
const screenWidth = ref(0)
const isSidebarShow = ref(true)
const iscontrolShow = ref(false)
const isoverlay = ref(false)
const editorRef = ref(null)

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

const username = useCookie('username')
const { $msg, $myFetch } = useNuxtApp()

const createArticleInfo = reactive({
  title: '',
  description: '',
  keywords: '',
  content: '',
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
  if (editorRef.value) {
    createArticleInfo.content = editorRef.value.getContent()
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
                    <TinyMCEEditor
                      ref="editorRef"
                      v-model="createArticleInfo.content"
                      :height="600"
                    />
                  </div>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="createarticle-footer">
          <div class="footer-content">
            <div class="left-info">
              <el-icon><InfoFilled /></el-icon>
              <span>请仔细检查信息后再提交</span>
            </div>
            <div class="right-buttons">
              <el-button type="primary" size="large" @click="submit">发布文章</el-button>
              <el-button size="large" plain @click="navigateTo('/admin/articlelist')">返回列表</el-button>
            </div>
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
          }
        }
      }

      .createarticle-footer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        padding: 0 20px 20px;
        background: transparent;
        z-index: 999;
        pointer-events: none;

        .footer-content {
          width: 100%;
          max-width: 1200px;
          background: #fff;
          border: 1px solid var(--el-border-color);
          border-radius: 12px;
          box-shadow: var(--el-box-shadow-light);
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          pointer-events: auto;

          .left-info {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--el-text-color-secondary);
            font-size: 14px;
            .el-icon {
              color: var(--el-color-warning);
            }
          }

          .right-buttons {
            display: flex;
            gap: 12px;
            .el-button {
              min-width: 100px;
              font-weight: 500;
            }
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
}

@media screen and (max-width: 768px) {
  .container .right .createarticle-container {
    padding: 12px;
    padding-bottom: 100px;
  }
  .createarticle-footer {
    padding: 0 12px 12px;
    .footer-content {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      .right-buttons {
        flex-direction: column;
        .el-button {
          width: 100%;
        }
      }
    }
  }
}
</style>
