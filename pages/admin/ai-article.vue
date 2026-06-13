<script setup>
import { VideoPlay, Document, Refresh } from '@element-plus/icons-vue';

const { $msg, $myFetch } = useNuxtApp();

definePageMeta({
  layout: 'admin',
});

const loading = ref(false);

const aiConfig = reactive({
  apiId: '',
  keywords: '',
  type: '1',
  count: 1,
  wordCount: 1000,
  concurrency: 1,
});

const apiLoading = ref(false);
const apiOptions = ref([]);
const taskLoading = ref(false);
const taskData = ref([]);
const articleDialogVisible = ref(false);
const articleDialogLoading = ref(false);
const taskArticleData = ref([]);
const currentTask = ref(null);
let taskTimer = null;

const taskOverview = computed(() => {
  const rows = taskData.value || [];
  const statusOf = (item) => Number(item.status);
  return [
    {
      label: '当前任务',
      value: rows.length,
      desc: '最近 20 条记录',
    },
    {
      label: '生成中',
      value: rows.filter((item) => statusOf(item) === 1).length,
      desc: '自动刷新进度',
    },
    {
      label: '已完成',
      value: rows.filter((item) => statusOf(item) === 2).length,
      desc: '可查看文章',
    },
    {
      label: '异常任务',
      value: rows.filter((item) => [3, 4].includes(statusOf(item))).length,
      desc: '部分失败或失败',
    },
  ];
});

onMounted(() => {
  getApiOptions();
  getTaskList();
  taskTimer = setInterval(() => {
    if (taskData.value.some((item) => item.status === 1)) {
      getTaskList();
    }
  }, 5000);
});

onUnmounted(() => {
  if (taskTimer) {
    clearInterval(taskTimer);
    taskTimer = null;
  }
});

const generate = async () => {
  if (!aiConfig.apiId) {
    $msg('请选择要生成文章的接口', 'error');
    return;
  }

  if (!aiConfig.type) {
    $msg('请选择文章分类', 'error');
    return;
  }

  if (!aiConfig.count || aiConfig.count < 1 || aiConfig.count > 100) {
    $msg('生成数量必须在1到100之间', 'error');
    return;
  }

  if (
    !aiConfig.wordCount ||
    aiConfig.wordCount < 800 ||
    aiConfig.wordCount > 5000
  ) {
    $msg('单篇目标字数必须在800到5000之间', 'error');
    return;
  }

  if (
    !aiConfig.concurrency ||
    aiConfig.concurrency < 1 ||
    aiConfig.concurrency > 10
  ) {
    $msg('并发数量必须在1到10之间', 'error');
    return;
  }

  if (Number(aiConfig.concurrency) >= Number(aiConfig.count)) {
    $msg('并发数量必须小于生成数量', 'error');
    return;
  }

  loading.value = true;

  const body = new URLSearchParams();
  body.append('apiId', String(aiConfig.apiId));
  body.append('keywords', aiConfig.keywords || '');
  body.append('type', aiConfig.type);
  body.append('count', String(aiConfig.count));
  body.append('wordCount', String(aiConfig.wordCount));
  body.append('concurrency', String(aiConfig.concurrency));

  try {
    const res = await $myFetch('GenerateAIArticle', {
      method: 'POST',
      body,
    });

    if (res.code === 200) {
      const taskId = res.data?.task_id ? `，任务ID：${res.data.task_id}` : '';
      $msg(res.msg || `AI文章生成任务已提交${taskId}`, 'success');
      getTaskList();
    } else {
      $msg(res.msg || '文章生成任务提交失败', 'error');
    }
  } catch (error) {
    $msg('文章生成任务提交失败', 'error');
  } finally {
    loading.value = false;
  }
};

const normalizeApiOptions = (list = []) =>
  list.map((item) => ({
    id: item.id,
    name: item.name,
    alias: item.alias,
  }));

const getApiOptions = async () => {
  apiLoading.value = true;
  try {
    const res = await $myFetch('AIArticleApiList');

    if (res.code === 200) {
      apiOptions.value = normalizeApiOptions(
        Array.isArray(res.data) ? res.data : [],
      );
    }
  } finally {
    apiLoading.value = false;
  }
};

const searchApiOptions = async (keyword) => {
  const query = String(keyword || '').trim();
  if (!query) {
    getApiOptions();
    return;
  }

  apiLoading.value = true;
  try {
    const res = await $myFetch('AIArticleApiList', {
      params: {
        keyword: query,
      },
    });

    if (res.code === 200) {
      apiOptions.value = normalizeApiOptions(
        Array.isArray(res.data) ? res.data : [],
      );
    }
  } finally {
    apiLoading.value = false;
  }
};

const getTaskList = async () => {
  taskLoading.value = true;
  try {
    const res = await $myFetch('AIArticleTaskList', {
      params: {
        page: 1,
        pageSize: 20,
      },
    });

    if (res.code === 200 && res.data) {
      taskData.value = res.data.list || [];
    }
  } finally {
    taskLoading.value = false;
  }
};

const getArticleStatusText = (status) => {
  const map = {
    1: '开启',
    2: '关闭',
    3: '草稿',
    4: '待审核',
  };
  return map[String(status)] || '未知';
};

const getArticleStatusType = (status) => {
  const map = {
    1: 'success',
    2: 'danger',
    3: 'info',
    4: 'warning',
  };
  return map[String(status)] || 'info';
};

const openTaskArticles = async (row) => {
  currentTask.value = row;
  articleDialogVisible.value = true;
  articleDialogLoading.value = true;
  taskArticleData.value = [];

  try {
    const res = await $myFetch('AIArticleTaskArticleList', {
      params: {
        task_id: row.id,
      },
    });

    if (res.code === 200 && res.data) {
      taskArticleData.value = res.data.list || [];
    } else {
      $msg(res.msg || '查询任务文章失败', 'error');
    }
  } finally {
    articleDialogLoading.value = false;
  }
};

const getTaskStatusText = (status) => {
  const map = {
    1: '生成中',
    2: '已完成',
    3: '部分失败',
    4: '失败',
  };
  return map[status] || '未知';
};

const getTaskStatusType = (status) => {
  const map = {
    1: 'warning',
    2: 'success',
    3: 'warning',
    4: 'danger',
  };
  return map[status] || 'info';
};

const getCategoryName = (type) => {
  const map = {
    1: '公共通知',
    2: '行业资讯',
    3: '产品动态',
    4: '解决方案',
  };
  return map[type] || '未知';
};

const getTaskProgress = (row) => {
  if (!row.total_count) return 0;
  return Math.min(
    100,
    Math.round(
      ((row.success_count + row.failed_count) / row.total_count) * 100,
    ),
  );
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-';
  return new Date(Number(timestamp)).toLocaleString();
};

useHead({
  title: 'AI生成文章',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
});
</script>

<template>
  <div class="createarticle-container">
    <div class="article-card generator-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">AI 生成文章</span>
          <span class="subtitle">按接口关键词批量生成待审核文章</span>
        </div>
        <div class="header-right">
          <el-button plain @click="navigateTo('/admin/articlelist')">
            文章列表
          </el-button>
        </div>
      </div>

      <div class="form-container">
        <el-form :model="aiConfig" label-width="96px">
          <el-row :gutter="24">
            <el-col :xs="24" :md="12">
              <el-form-item label="选择接口" required>
                <el-select
                  v-model="aiConfig.apiId"
                  filterable
                  remote
                  reserve-keyword
                  :remote-method="searchApiOptions"
                  :loading="apiLoading"
                  placeholder="输入接口名称或标识搜索"
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
            <el-col :xs="24" :md="12">
              <el-form-item label="文章分类" required>
                <el-select
                  v-model="aiConfig.type"
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
                  AI 会优先围绕这些关键词生成选题和文章，避免机械堆砌。
                </div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="生成数量" required>
                <el-input
                  v-model="aiConfig.count"
                  type="number"
                  :min="1"
                  :max="100"
                  inputmode="numeric"
                  placeholder="1-100"
                >
                  <template #append>篇</template>
                </el-input>
                <div class="form-tip">单个任务最多 100 篇</div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="目标字数" required>
                <el-input
                  v-model="aiConfig.wordCount"
                  type="number"
                  :min="800"
                  :max="5000"
                  inputmode="numeric"
                  placeholder="800-5000"
                >
                  <template #append>字</template>
                </el-input>
                <div class="form-tip">建议不少于 800 字</div>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :md="8">
              <el-form-item label="并发数量" required>
                <el-input
                  v-model="aiConfig.concurrency"
                  type="number"
                  :min="1"
                  :max="10"
                  inputmode="numeric"
                  placeholder="1-10"
                >
                  <template #append>并发</template>
                </el-input>
                <div class="form-tip">最多 10 并发，且必须小于生成数量</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <div class="article-card task-card">
      <div class="card-header">
        <div class="header-left">
          <span class="title">生成任务</span>
          <span class="subtitle">查看最近提交任务的执行状态</span>
        </div>
        <div class="header-right">
          <el-button :loading="taskLoading" @click="getTaskList">
            <el-icon class="el-icon--left"><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <div class="overview-grid">
        <div
          v-for="item in taskOverview"
          :key="item.label"
          class="overview-item"
        >
          <div class="overview-label">{{ item.label }}</div>
          <div class="overview-value">{{ item.value }}</div>
          <div class="overview-desc">{{ item.desc }}</div>
        </div>
      </div>

      <client-only>
        <el-table
          :data="taskData"
          style="width: 100%"
          v-loading="taskLoading"
          empty-text="暂无生成任务"
        >
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
              <el-tag
                :type="getTaskStatusType(scope.row.status)"
                size="small"
                effect="plain"
              >
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
          <el-table-column label="操作" width="110" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                link
                @click="openTaskArticles(scope.row)"
              >
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
      class="task-article-dialog"
      destroy-on-close
    >
      <el-table
        :data="taskArticleData"
        style="width: 100%"
        v-loading="articleDialogLoading"
        empty-text="暂无文章"
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
            <el-tag
              :type="getArticleStatusType(scope.row.status)"
              size="small"
              effect="plain"
            >
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

    <AdminSubmitFooter
      message="提交后将在后台按任务生成文章，完成后进入待审核状态"
    >
      <el-button
        type="primary"
        size="large"
        @click="generate"
        :loading="loading"
      >
        <el-icon class="el-icon--left"><VideoPlay /></el-icon>
        提交生成任务
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

    & + .article-card {
      margin-top: 16px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .header-left {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        .title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          line-height: 1.3;
        }

        .subtitle {
          font-size: 13px;
          color: #909399;
          line-height: 1.4;
        }
      }

      .header-right {
        display: flex;
        gap: 12px;
      }
    }

    .form-container {
      padding: 8px 0 0;

      .form-tip {
        font-size: 13px;
        color: #909399;
        margin-top: 6px;
        line-height: 1.5;
      }

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #374151;
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

      :deep(.el-input) {
        width: 100%;
      }
    }
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;

    .overview-item {
      padding: 12px 14px;
      background: #f8fafc;
      border: 1px solid #eef2f7;
      border-radius: 8px;
    }

    .overview-label {
      font-size: 13px;
      color: #606266;
      line-height: 1.4;
    }

    .overview-value {
      margin-top: 6px;
      font-size: 22px;
      font-weight: 700;
      color: #303133;
      line-height: 1.2;
    }

    .overview-desc {
      margin-top: 4px;
      font-size: 12px;
      color: #909399;
      line-height: 1.4;
    }
  }

  .task-card {
    :deep(.el-table) {
      border: none;

      .el-table__header-wrapper {
        th {
          background: #f8fafc;
          color: #1f2937;
          font-weight: 600;
        }
      }
    }
  }
}

:deep(.task-article-dialog) {
  border-radius: 12px;

  .el-dialog__header {
    margin: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #eaecf0;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1f36;
    }
  }

  .el-dialog__body {
    padding: 24px;
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
        :deep(.el-form-item) {
          display: block;
        }

        :deep(.el-form-item__label) {
          width: auto !important;
          display: block;
          margin-bottom: 6px;
          text-align: left;
        }

        :deep(.el-form-item__content) {
          margin-left: 0 !important;
        }
      }
    }

    .overview-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
