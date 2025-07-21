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
    !updateArticleInfo.value.status
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
          // TinyMCE 编辑器组件自带样式，这里不需要额外样式
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
