<script setup>
import { InfoFilled, Service, Plus } from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const createOrderInfo = reactive({
  title: '',
  type: '1',
  priority: '2',
  content: '',
  files: [],
})

const loading = ref(false)
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const typeMap = {
  1: '业务咨询',
  2: '故障报修',
  3: '产品建议',
  4: '其他事务',
}

const priorityMap = {
  1: '普通',
  2: '重要',
  3: '紧急',
}

// 模拟上传处理
const handleUploadChange = (uploadFile, uploadFiles) => {
  createOrderInfo.files = uploadFiles
}

const handleRemove = (uploadFile, uploadFiles) => {
  createOrderInfo.files = uploadFiles
}

const handlePictureCardPreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url
  dialogVisible.value = true
}

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

    // 如果有文件，实际应使用 FormData 或先上传文件获取 URL
    if (createOrderInfo.files.length > 0) {
      const fileNames = createOrderInfo.files.map((f) => f.name).join(',')
      body.append('files', fileNames)
    }

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
  <div class="createworkorder-container">
    <!-- 基础信息卡片 -->
    <div class="createworkorder-cont">
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon"><Service /></el-icon>
          <span class="title">工单基础信息</span>
        </div>
        <div class="header-right">
          <el-tag size="small" effect="plain" type="info">必填项</el-tag>
        </div>
      </div>

      <el-form :model="createOrderInfo" label-width="100px" class="main-form">
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="工单标题" required>
              <el-input
                v-model="createOrderInfo.title"
                maxlength="100"
                show-word-limit
                placeholder="请简要描述您遇到的问题"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="工单类型" required>
              <el-select
                v-model="createOrderInfo.type"
                placeholder="请选择工单类型"
                style="width: 100%"
              >
                <el-option
                  v-for="(label, val) in typeMap"
                  :key="val"
                  :label="label"
                  :value="val"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <el-form-item label="优先级" required>
              <el-select
                v-model="createOrderInfo.priority"
                placeholder="请选择优先级"
                style="width: 100%"
              >
                <el-option
                  v-for="(label, val) in priorityMap"
                  :key="val"
                  :label="label"
                  :value="val"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="详细描述" required>
              <el-input
                v-model="createOrderInfo.content"
                type="textarea"
                :rows="8"
                placeholder="请详细描述问题背景、复现步骤等信息，以便我们更快为您解决问题..."
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="附件信息">
              <div class="upload-area">
                <el-upload
                  v-model:file-list="createOrderInfo.files"
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  :on-preview="handlePictureCardPreview"
                  :on-remove="handleRemove"
                  :on-change="handleUploadChange"
                  :limit="3"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
                <div class="form-tip">
                  <el-text type="info" size="small">
                    最多上传 3 张图片，支持 jpg/png 格式，单张不超过 2MB
                  </el-text>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 底部操作栏 -->
    <div class="createworkorder-footer">
      <div class="footer-content">
        <div class="left-info">
          <el-icon><InfoFilled /></el-icon>
          <span>我们通常会在 24 小时内回复您的工单</span>
        </div>
        <div class="right-buttons">
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="submit"
            >提交工单</el-button
          >
          <el-button plain size="large" @click="navigateTo('/admin/workorder')"
            >取消</el-button
          >
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <el-dialog v-model="dialogVisible">
      <img
        w-full
        :src="dialogImageUrl"
        alt="Preview Image"
        style="width: 100%"
      />
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.createworkorder-container {
  position: relative;
  min-height: 100vh;
  padding: 24px 32px;
  padding-bottom: 100px;

  .createworkorder-cont {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    margin-bottom: 24px;
    border: 1px solid #eaecf0;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #eaecf0;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .icon {
          font-size: 20px;
          color: #4b5563;
        }

        .title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1f36;
        }
      }
    }

    :deep(.main-form) {
      padding: 24px;

      .el-form-item {
        margin-bottom: 24px;

        .el-form-item__label {
          font-weight: 500;
          color: #374151;
        }

        .el-input__wrapper {
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

        .el-textarea__inner {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #d1d5db;
          border-radius: 6px;

          &:hover {
            border-color: #9ca3af;
          }

          &:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }

        .el-select,
        .el-autocomplete {
          width: 100%;
        }
      }
    }

    .upload-area {
      padding: 24px;
    }
  }

  .createworkorder-footer {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: calc(100% - 240px);
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 8px;
    padding: 16px 32px;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .footer-content {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 24px;

      .left-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #6b7280;
        font-size: 14px;
        margin-right: auto;

        .el-icon {
          color: #e6a23c;
        }
      }

      .right-buttons {
        display: flex;
        gap: 12px;

        .el-button {
          padding: 12px 24px;
          font-weight: 500;
          font-size: 14px;

          &.el-button--primary {
            background: #3b82f6;
            border: none;
            min-width: 88px;

            &:hover {
              background: #2563eb;
            }
          }

          &.el-button--default {
            min-width: 88px;
          }
        }
      }
    }
  }
}

// 表单提示样式
.form-tip {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #e0f2fe;
  border-radius: 4px;

  .el-text {
    color: #0369a1;
    line-height: 1.5;
  }
}

// 响应式设计
@media screen and (max-width: 1200px) {
  .createworkorder-container {
    padding: 20px;
    padding-bottom: 100px;
  }
}

@media screen and (max-width: 768px) {
  .createworkorder-container {
    padding: 16px;
    padding-bottom: 100px;

    .createworkorder-footer {
      bottom: 10px;
      right: 10px;
      left: 10px;
      width: auto;
      padding: 12px 16px;

      .footer-content {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;

        .right-buttons {
          flex-direction: column;

          .el-button {
            width: 100%;
            margin-left: 0;
          }
        }
      }
    }
  }
}
</style>
