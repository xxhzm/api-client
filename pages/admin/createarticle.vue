<script setup>
const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const editorRef = ref(null)

const createArticleInfo = reactive({
  title: '',
  description: '',
  keywords: '',
  content: '',
  type: '1',
})

const submit = async () => {
  if (
    !createArticleInfo.title ||
    !createArticleInfo.description ||
    !createArticleInfo.keywords ||
    !createArticleInfo.content ||
    !createArticleInfo.type
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
  body.append('type', createArticleInfo.type)

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
              <el-form-item label="文章分类" required>
                <el-select
                  v-model="createArticleInfo.type"
                  placeholder="请选择分类"
                  style="width: 100%"
                >
                  <el-option label="公共通知" value="1"></el-option>
                  <el-option label="行业资讯" value="2"></el-option>
                  <el-option label="产品动态" value="3"></el-option>
                  <el-option label="解决方案" value="4"></el-option>
                </el-select>
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

    <AdminSubmitFooter>
      <el-button type="primary" size="large" @click="submit">
        发布文章
      </el-button>
      <el-button size="large" plain @click="navigateTo('/admin/articlelist')">
        返回列表
      </el-button>
    </AdminSubmitFooter>
  </div>
</template>

<style lang="less" scoped>
.createarticle-container {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  padding-bottom: 100px;
  background-color: #f5f7fa;

  .article-card {
    width: 100%;
    padding: 16px 20px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    margin: 0 auto;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .header-left {
        display: flex;
        align-items: flex-start;

        .title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          line-height: 1.3;
        }
      }
    }

    .form-container {
      padding: 8px 0 0;

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #374151;
        padding-bottom: 8px;
      }

      :deep(.el-form-item) {
        margin-bottom: 24px;
      }

      :deep(.el-input__wrapper),
      :deep(.el-select__wrapper),
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

}

@media screen and (max-width: 1200px) {
  .createarticle-container {
    padding: 20px;
    padding-bottom: 100px;
  }
}

@media screen and (max-width: 768px) {
  .createarticle-container {
    padding: 12px;
    padding-bottom: 100px;

    .article-card {
      padding: 14px;

      .card-header {
        flex-direction: column;
        gap: 12px;
      }
    }
  }

}
</style>
