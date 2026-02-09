<script setup>
import { InfoFilled } from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const { typeMap, priorityMap } = useWorkOrder()

const createOrderInfo = reactive({
  title: '',
  type: '1',
  priority: '2',
  content: '',
})

const loading = ref(false)

const submit = async () => {
  if (!createOrderInfo.title || !createOrderInfo.content) {
    $msg('请填写完整信息', 'warning')
    return false
  }

  loading.value = true
  try {
    const body = new URLSearchParams()
    body.append('title', createOrderInfo.title)
    body.append('type', createOrderInfo.type)
    body.append('priority', createOrderInfo.priority)
    body.append('content', createOrderInfo.content)

    const res = await $myFetch('CreateWorkOrder', {
      method: 'POST',
      body: body,
    })

    if (res.code === 200) {
      $msg('工单创建成功', 'success')
      setTimeout(() => {
        navigateTo('/admin/myworkorder')
      }, 500)
    } else {
      $msg(res.msg || '创建失败', 'error')
    }
  } catch (error) {
    $msg('创建失败', 'error')
  } finally {
    loading.value = false
  }
}

useHead({
  title: '新建工单',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="create-page">
    <div class="form-card">
      <div class="form-card-header">
        <span class="header-title">提交工单</span>
        <span class="header-desc">请填写以下信息，我们将尽快为您处理</span>
      </div>

      <div class="form-card-body">
        <div class="form-section">
          <div class="form-row">
            <label class="form-label required">工单标题</label>
            <el-input
              v-model="createOrderInfo.title"
              maxlength="100"
              show-word-limit
              placeholder="请简要描述您遇到的问题"
            />
          </div>

          <div class="form-row-group">
            <div class="form-row half">
              <label class="form-label required">工单类型</label>
              <el-select
                v-model="createOrderInfo.type"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="(label, val) in typeMap"
                  :key="val"
                  :label="label"
                  :value="val"
                />
              </el-select>
            </div>
            <div class="form-row half">
              <label class="form-label required">优先级</label>
              <el-select
                v-model="createOrderInfo.priority"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="(label, val) in priorityMap"
                  :key="val"
                  :label="label"
                  :value="val"
                />
              </el-select>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label required">问题描述</label>
            <el-input
              v-model="createOrderInfo.content"
              type="textarea"
              :rows="8"
              placeholder="请详细描述问题背景、复现步骤等信息，以便我们更快为您解决问题..."
              resize="vertical"
            />
          </div>
        </div>
      </div>

      <div class="form-card-footer">
        <div class="footer-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>提交后我们通常会在 24 小时内回复</span>
        </div>
        <div class="footer-actions">
          <el-button @click="navigateTo('/admin/myworkorder')">取消</el-button>
          <el-button type="primary" :loading="loading" @click="submit">
            提交工单
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.create-page {
  padding: 20px 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.form-card {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 2px;

  .form-card-header {
    padding: 16px 24px;
    border-bottom: 1px solid #e8e8e8;
    background: #fafafa;

    .header-title {
      font-size: 15px;
      font-weight: 600;
      color: #262626;
    }

    .header-desc {
      margin-left: 12px;
      font-size: 12px;
      color: #8c8c8c;
    }
  }

  .form-card-body {
    padding: 24px;
  }

  .form-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 24px;
    border-top: 1px solid #e8e8e8;
    background: #fafafa;

    .footer-tip {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #8c8c8c;

      .el-icon {
        color: #e6a23c;
        font-size: 14px;
      }
    }

    .footer-actions {
      display: flex;
      gap: 8px;
    }
  }
}

/* 表单区域 */
.form-section {

  .form-row {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-row-group {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .half {
      flex: 1;
      margin-bottom: 0;
    }
  }

  .form-label {
    display: block;
    font-size: 13px;
    color: #262626;
    margin-bottom: 8px;
    font-weight: 500;

    &.required::before {
      content: '*';
      color: #f56c6c;
      margin-right: 4px;
    }
  }
}

/* 统一输入框样式 */
:deep(.el-input__wrapper),
:deep(.el-select .el-input__wrapper) {
  border-radius: 2px;
  box-shadow: none;
  border: 1px solid #dcdfe6;

  &:hover {
    border-color: #b0b0b0;
  }

  &.is-focus {
    border-color: #409eff;
  }
}

:deep(.el-textarea__inner) {
  border-radius: 2px;
  font-size: 13px;
  line-height: 1.6;

  &:hover {
    border-color: #b0b0b0;
  }

  &:focus {
    border-color: #409eff;
  }
}

/* 响应式 */
@media screen and (max-width: 768px) {
  .create-page {
    padding: 12px;
  }

  .form-section {
    max-width: 100%;

    .form-row-group {
      flex-direction: column;
      gap: 0;

      .half {
        margin-bottom: 20px;
      }
    }
  }

  .form-card .form-card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .footer-actions {
      justify-content: flex-end;
    }
  }
}
</style>
