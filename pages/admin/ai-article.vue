<script setup>
import {
  InfoFilled,
  VideoPlay,
  Document,
  Refresh,
} from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const loading = ref(false)

const aiConfig = reactive({
  apiId: '',
  keywords: '',
  type: '1',
  count: 1,
  wordCount: 1000,
  concurrency: 1,
})

const apiLoading = ref(false)
const apiOptions = ref([])
const taskLoading = ref(false)
const taskData = ref([])
const articleDialogVisible = ref(false)
const articleDialogLoading = ref(false)
const taskArticleData = ref([])
const currentTask = ref(null)
let taskTimer = null

onMounted(() => {
  getApiOptions()
  getTaskList()
  taskTimer = setInterval(() => {
    if (taskData.value.some((item) => item.status === 1)) {
      getTaskList()
    }
  }, 5000)
})

onUnmounted(() => {
  if (taskTimer) {
    clearInterval(taskTimer)
    taskTimer = null
  }
})

const generate = async () => {
  if (!aiConfig.apiId) {
    $msg('请选择要生成文章的接口', 'error')
    return
  }

  if (!aiConfig.type) {
    $msg('请选择文章分类', 'error')
    return
  }

  if (!aiConfig.count || aiConfig.count < 1 || aiConfig.count > 100) {
    $msg('生成数量必须在1到100之间', 'error')
    return
  }

  if (!aiConfig.wordCount || aiConfig.wordCount < 800 || aiConfig.wordCount > 5000) {
    $msg('单篇目标字数必须在800到5000之间', 'error')
    return
  }

  if (
    !aiConfig.concurrency ||
    aiConfig.concurrency < 1 ||
    aiConfig.concurrency > 10
  ) {
    $msg('并发数量必须在1到10之间', 'error')
    return
  }

  loading.value = true

  const body = new URLSearchParams()
  body.append('apiId', String(aiConfig.apiId))
  body.append('keywords', aiConfig.keywords || '')
  body.append('type', aiConfig.type)
  body.append('count', String(aiConfig.count))
  body.append('wordCount', String(aiConfig.wordCount))
  body.append('concurrency', String(aiConfig.concurrency))

  try {
    const res = await $myFetch('GenerateAIArticle', {
      method: 'POST',
      body,
    })

    if (res.code === 200) {
      const taskId = res.data?.task_id ? `，任务ID：${res.data.task_id}` : ''
      $msg(res.msg || `AI文章生成任务已提交${taskId}`, 'success')
      getTaskList()
    } else {
      $msg(res.msg || '文章生成任务提交失败', 'error')
    }
  } catch (error) {
    $msg('文章生成任务提交失败', 'error')
  } finally {
    loading.value = false
  }
}

const normalizeApiOptions = (list = []) =>
  list.map((item) => ({
    id: item.id,
    name: item.name,
    alias: item.alias,
  }))

const getApiOptions = async () => {
  apiLoading.value = true
  try {
    const res = await $myFetch('AIArticleApiList')

    if (res.code === 200) {
      apiOptions.value = normalizeApiOptions(Array.isArray(res.data) ? res.data : [])
    }
  } finally {
    apiLoading.value = false
  }
}

const searchApiOptions = async (keyword) => {
  const query = String(keyword || '').trim()
  if (!query) {
    getApiOptions()
    return
  }

  apiLoading.value = true
  try {
    const res = await $myFetch('AIArticleApiList', {
      params: {
        keyword: query,
      },
    })

    if (res.code === 200) {
      apiOptions.value = normalizeApiOptions(Array.isArray(res.data) ? res.data : [])
    }
  } finally {
    apiLoading.value = false
  }
}

const getTaskList = async () => {
  taskLoading.value = true
  try {
    const res = await $myFetch('AIArticleTaskList', {
      params: {
        page: 1,
        pageSize: 20,
      },
    })

    if (res.code === 200 && res.data) {
      taskData.value = res.data.list || []
    }
  } finally {
    taskLoading.value = false
  }
}

const getArticleStatusText = (status) => {
  const map = {
    1: '开启',
    2: '关闭',
    3: '草稿',
    4: '待审核',
  }
  return map[String(status)] || '未知'
}

const getArticleStatusType = (status) => {
  const map = {
    1: 'success',
    2: 'danger',
    3: 'info',
    4: 'warning',
  }
  return map[String(status)] || 'info'
}

const openTaskArticles = async (row) => {
  currentTask.value = row
  articleDialogVisible.value = true
  articleDialogLoading.value = true
  taskArticleData.value = []

  try {
    const res = await $myFetch('AIArticleTaskArticleList', {
      params: {
        task_id: row.id,
      },
    })

    if (res.code === 200 && res.data) {
      taskArticleData.value = res.data.list || []
    } else {
      $msg(res.msg || '查询任务文章失败', 'error')
    }
  } finally {
    articleDialogLoading.value = false
  }
}

const getTaskStatusText = (status) => {
  const map = {
    1: '生成中',
    2: '已完成',
    3: '部分失败',
    4: '失败',
  }
  return map[status] || '未知'
}

const getTaskStatusType = (status) => {
  const map = {
    1: 'warning',
    2: 'success',
    3: 'warning',
    4: 'danger',
  }
  return map[status] || 'info'
}

const getCategoryName = (type) => {
  const map = {
    1: '公共通知',
    2: '行业资讯',
    3: '产品动态',
    4: '解决方案',
  }
  return map[type] || '未知'
}

const getTaskProgress = (row) => {
  if (!row.total_count) return 0
  return Math.min(
    100,
    Math.round(((row.success_count + row.failed_count) / row.total_count) * 100),
  )
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(Number(timestamp)).toLocaleString()
}

useHead({
  title: 'AI生成文章',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="createarticle-container">
    <div class="article-card">
      <!-- Header -->
      <div class="card-header">
        <div class="header-left">
          <span class="title">AI 生成文章</span>
        </div>
      </div>

      <!-- Configuration Area -->
      <div class="form-container">
        <el-form :model="aiConfig" label-position="top">
          <!-- 1. 核心内容配置 -->
          <div class="config-section">
            <div class="section-header">
              <div class="title-wrapper">
                <div class="icon-box primary">
                  <el-icon><Document /></el-icon>
                </div>
                <span class="section-title">接口选择</span>
              </div>
              <span class="section-desc">选择需要批量生成 SEO 文章的接口</span>
            </div>

            <div class="section-content">
              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="选择接口" required>
                    <el-select
                      v-model="aiConfig.apiId"
                      filterable
                      remote
                      reserve-keyword
                      :remote-method="searchApiOptions"
                      :loading="apiLoading"
                      placeholder="请选择接口，支持输入接口名称或标识搜索"
                      size="large"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in apiOptions"
                        :key="item.id"
                        :label="`${item.name}（${item.alias}）`"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="文章分类" required>
                    <el-select
                      v-model="aiConfig.type"
                      placeholder="请选择分类"
                      style="width: 100%"
                      size="large"
                    >
                      <el-option label="公共通知" value="1"></el-option>
                      <el-option label="行业资讯" value="2"></el-option>
                      <el-option label="产品动态" value="3"></el-option>
                      <el-option label="解决方案" value="4"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="指定关键词">
                    <el-input
                      v-model="aiConfig.keywords"
                      type="textarea"
                      :rows="3"
                      maxlength="512"
                      show-word-limit
                      placeholder="可填写主关键词和长尾关键词，用逗号分隔；留空则使用接口自身关键词"
                    />
                    <div class="form-tip">
                      AI 会优先围绕这些关键词生成选题和文章，避免机械堆砌
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="生成数量" required>
                    <el-input-number
                      v-model="aiConfig.count"
                      :min="1"
                      :max="100"
                      :step="1"
                      step-strictly
                      size="large"
                    />
                    <div class="form-tip">单个任务最多生成100篇文章</div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="单篇目标字数" required>
                    <el-input-number
                      v-model="aiConfig.wordCount"
                      :min="800"
                      :max="5000"
                      :step="100"
                      step-strictly
                      size="large"
                    />
                    <div class="form-tip">
                      建议 SEO 文章不少于800字；字数越高生成时间和模型消耗越大
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="并发数量" required>
                    <el-input-number
                      v-model="aiConfig.concurrency"
                      :min="1"
                      :max="10"
                      :step="1"
                      step-strictly
                      size="large"
                    />
                    <div class="form-tip">
                      单个任务最多10并发，实际并发不会超过生成数量
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

        </el-form>
      </div>
    </div>

    <div class="article-card task-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">生成任务</span>
        </div>
        <div class="header-right">
          <el-button :loading="taskLoading" @click="getTaskList">
            <el-icon class="el-icon--left"><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <client-only>
        <el-table :data="taskData" style="width: 100%" v-loading="taskLoading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column
            prop="topic"
            label="接口"
            min-width="220"
            show-overflow-tooltip
          />
          <el-table-column label="分类" width="110">
            <template #default="scope">
              {{ getCategoryName(scope.row.type) }}
            </template>
          </el-table-column>
          <el-table-column label="数量" width="100">
            <template #default="scope">
              {{ scope.row.success_count + scope.row.failed_count }}/{{
                scope.row.total_count
              }}
            </template>
          </el-table-column>
          <el-table-column label="字数" width="90">
            <template #default="scope">
              {{ scope.row.word_count || 1000 }}
            </template>
          </el-table-column>
          <el-table-column label="并发" width="80">
            <template #default="scope">
              {{ scope.row.concurrency || 1 }}
            </template>
          </el-table-column>
          <el-table-column label="进度" width="180">
            <template #default="scope">
              <el-progress
                :percentage="getTaskProgress(scope.row)"
                :status="scope.row.status === 4 ? 'exception' : undefined"
              />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="scope">
              <el-tag :type="getTaskStatusType(scope.row.status)" size="small">
                {{ getTaskStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="error"
            label="错误信息"
            min-width="180"
            show-overflow-tooltip
          />
          <el-table-column label="创建时间" width="180">
            <template #default="scope">
              {{ formatTimestamp(scope.row.create_time) }}
            </template>
          </el-table-column>
          <el-table-column label="更新时间" width="180">
            <template #default="scope">
              {{ formatTimestamp(scope.row.update_time) }}
            </template>
          </el-table-column>
          <el-table-column label="文章标题" width="110" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="openTaskArticles(scope.row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </client-only>
    </div>

    <el-dialog
      v-model="articleDialogVisible"
      :title="`任务文章：${currentTask?.topic || '-'}`"
      width="720px"
    >
      <el-table
        :data="taskArticleData"
        style="width: 100%"
        v-loading="articleDialogLoading"
      >
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column
          prop="title"
          label="文章标题"
          min-width="260"
          show-overflow-tooltip
        />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getArticleStatusType(scope.row.status)" size="small">
              {{ getArticleStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="scope">
            {{ formatTimestamp(scope.row.create_time) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- Footer -->
    <div class="createarticle-footer">
      <div class="footer-content">
        <div class="left-info">
          <el-icon><InfoFilled /></el-icon>
          <span>提交后将在后台按任务生成文章，完成后进入待审核状态</span>
        </div>
        <div class="right-buttons">
          <el-button
            type="primary"
            size="large"
            @click="generate"
            :loading="loading"
          >
            <el-icon class="el-icon--left"><VideoPlay /></el-icon>
            提交生成任务
          </el-button>
          <el-button size="large" plain @click="navigateTo('/admin/articlelist')"
            >返回列表</el-button
          >
        </div>
      </div>
    </div>
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

      .config-section {
        margin-bottom: 32px;
        &:last-child {
          margin-bottom: 0;
        }

        .section-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f2f4f7;

          .title-wrapper {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;

            .icon-box {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;

              &.primary {
                background: #eff8ff;
                color: #2e90fa;
              }
            }

            .section-title {
              font-size: 18px;
              font-weight: 600;
              color: #101828;
            }
          }

          .section-desc {
            display: block;
            font-size: 14px;
            color: #667085;
            margin-left: 44px;
          }
        }

        .section-content {
          padding-left: 44px;
        }
      }

      .form-tip {
        font-size: 13px;
        color: #667085;
        margin-top: 6px;
        line-height: 1.5;
      }

      .section-header-result {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .section-title-result {
        font-size: 15px;
        font-weight: 600;
        color: #1a1f36;
        margin-bottom: 20px;
        padding-left: 10px;
        border-left: 4px solid #409eff;
      }

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #344054;
        margin-bottom: 6px;
      }

      :deep(.el-input__wrapper),
      :deep(.el-select__wrapper),
      :deep(.el-textarea__inner) {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        border: 1px solid #d0d5dd;
        border-radius: 8px;
        padding-top: 8px;
        padding-bottom: 8px;

        &:hover {
          border-color: #98a2b3;
        }

        &.is-focus {
          border-color: #2e90fa;
          box-shadow: 0 0 0 4px rgba(46, 144, 250, 0.24);
        }
      }

      :deep(.el-input-group__append) {
        background-color: #f9fafb;
        border-left: 1px solid #d0d5dd;
        color: #344054;
        font-weight: 500;
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
      border: 1px solid #ebeef5;
      border-radius: 8px;
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

      .form-container {
        .config-section {
          .section-content {
            padding-left: 0;
          }

          .section-header {
            .section-desc {
              margin-left: 0;
            }
          }
        }
      }
    }
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
