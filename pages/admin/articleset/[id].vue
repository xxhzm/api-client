<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
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
                <div id="vditor"></div>
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

<script setup>
import Vditor from 'vditor'
import 'vditor/dist/index.css'
const route = useRoute()
const { $msg, $myFetch } = useNuxtApp()

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

  res.data.content = window.decodeURIComponent(res.data.content)
  updateArticleInfo.value = res.data
}

// 初始化富文本编辑器
const vditor = ref(null)
onMounted(async () => {
  await getData()
  vditor.value = new Vditor('vditor', {
    after: () => {
      vditor.value.setValue(updateArticleInfo.value.content)
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

const submit = async () => {
  if (
    !updateArticleInfo.value.title ||
    !updateArticleInfo.value.description ||
    !updateArticleInfo.value.keywords ||
    !vditor.value.getHTML() ||
    !updateArticleInfo.value.status
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  const content = window.encodeURIComponent(vditor.value.getHTML())
  const body = new URLSearchParams()
  body.append('id', updateArticleInfo.value.id)
  body.append('title', updateArticleInfo.value.title)
  body.append('content', content)
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

<style lang="less" scoped>
.container {
  display: flex;
  .right {
    width: 100%;
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
        :deep(.vditor-reset) {
          padding: 10px 20px !important;
        }
        :deep(.vditor-toolbar) {
          padding-left: 20px !important;
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
</style>
