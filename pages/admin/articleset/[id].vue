<script setup>
import { InfoFilled } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const { $msg, $myFetch } = useNuxtApp()

const editorRef = ref(null)

const updateArticleInfo = ref({
  id: 0,
  title: '',
  description: '',
  keywords: '',
  content: '',
  status: '1',
  type: '1',
})

const getData = async () => {
  const res = await $myFetch('ArticleId', {
    params: {
      id: route.params.id,
    },
  })

  updateArticleInfo.value = res.data
  // 确保 type 为字符串，以便 select 组件正确显示
  if (updateArticleInfo.value.type) {
    updateArticleInfo.value.type = String(updateArticleInfo.value.type)
  }
}

onMounted(async () => {
  await getData()
})

const submit = async () => {
  if (
    !updateArticleInfo.value.title ||
    !updateArticleInfo.value.description ||
    !updateArticleInfo.value.keywords ||
    !updateArticleInfo.value.content ||
    !updateArticleInfo.value.status ||
    !updateArticleInfo.value.type
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  // 确保获取最新内容
  if (editorRef.value) {
    updateArticleInfo.value.content = editorRef.value.getContent()
  }

  const body = new URLSearchParams()
  body.append('id', updateArticleInfo.value.id)
  body.append('title', updateArticleInfo.value.title)
  body.append('content', updateArticleInfo.value.content)
  body.append('description', updateArticleInfo.value.description)
  body.append('keywords', updateArticleInfo.value.keywords)
  body.append('status', updateArticleInfo.value.status)
  body.append('type', updateArticleInfo.value.type)

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
            <el-form-item label="文章分类">
              <el-select
                v-model="updateArticleInfo.type"
                placeholder="请选择分类"
              >
                <el-option label="公共通知" value="1"></el-option>
                <el-option label="行业资讯" value="2"></el-option>
                <el-option label="产品动态" value="3"></el-option>
                <el-option label="解决方案" value="4"></el-option>
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
              <TinyMCEEditor
                ref="editorRef"
                v-model="updateArticleInfo.content"
                :height="600"
              />
            </div>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="createArticle-footer">
      <div class="footer-content">
        <div class="left-info">
          <el-icon><InfoFilled /></el-icon>
          <span>请仔细检查信息后再提交</span>
        </div>
        <div class="right-buttons">
          <el-button size="large" type="primary" @click="submit"
            >提交</el-button
          >
          <el-button size="large" plain @click="navigateTo('/admin')"
            >取消</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
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
      // TinyMCE 编辑器组件自带样式，这里不需要额外样式
    }
  }

  .createArticle-footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: right;
    padding: 0 20px 20px;
    background: transparent;
    z-index: 999;
    pointer-events: none;

    .footer-content {
      width: calc(100% - 240px);
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
          min-width: 96px;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .createArticle-footer {
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
