<script setup>
import { Menu, Connection, Plus } from '@element-plus/icons-vue'
import { ref, onMounted, reactive } from 'vue'

const { $msg, $myFetch } = useNuxtApp()

// 控制左侧边栏显示隐藏
const screenWidth = ref(0)
const isSidebarShow = ref(true)
const iscontrolShow = ref(false)
const isoverlay = ref(false)

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
  if (isSidebarShow.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 页面数据
const loading = ref(false)
const importLoading = ref(false)

// 导入表单
const importForm = reactive({
  website: '',
  apiKey: '',
})

const importDialogVisible = ref(false)

// 系统对接信息
const systemInfo = ref({
  website: '',
  apiKey: '',
})

// 获取系统对接信息
const getSystemInfo = async () => {
  try {
    // 自动获取当前网站地址
    const currentUrl = window.location.origin
    systemInfo.value.website = currentUrl

    // 获取API密钥
    const res = await $myFetch('ExportKey')
    if (res.code === 200) {
      systemInfo.value.apiKey = res.data
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('获取系统信息失败', 'error')
  }
}

// 生成新的API密钥
const generateNewApiKey = async () => {
  try {
    const res = await $myFetch('ExportKey', {
      params: {
        action: 'refresh',
      },
    })

    if (res.code === 200) {
      systemInfo.value.apiKey = res.data
      $msg('API密钥已更新', 'success')
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('生成密钥失败', 'error')
  }
}

// 复制到剪贴板
const copyToClipboard = async (text, type) => {
  try {
    // 优先使用现代API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      $msg(`${type}已复制到剪贴板`, 'success')
    } else {
      // 备用方案：创建临时输入框
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        const successful = document.execCommand('copy')
        if (successful) {
          $msg(`${type}已复制到剪贴板`, 'success')
        } else {
          throw new Error('execCommand failed')
        }
      } catch (err) {
        // 最后的备用方案：提示用户手动复制
        $msg(`请手动复制：${text}`, 'warning')
      } finally {
        document.body.removeChild(textArea)
      }
    }
  } catch (error) {
    // 如果所有方案都失败，显示文本让用户手动复制
    ElMessageBox.alert(text, `请手动复制${type}`, {
      confirmButtonText: '确定',
      showClose: false,
      customClass: 'copy-fallback-dialog',
    })
  }
}

// 一键导入API
const handleImportApi = async () => {
  if (!importForm.website || !importForm.apiKey) {
    $msg('请填写完整信息', 'warning')
    return
  }

  importLoading.value = true
  try {
    const res = await $myFetch('Import', {
      method: 'POST',
      params: {
        url: importForm.website,
        key: importForm.apiKey,
      },
    })

    if (res.code === 200) {
      $msg(res.msg, 'success')
      importDialogVisible.value = false
      resetImportForm()
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('导入API失败', 'error')
  } finally {
    importLoading.value = false
  }
}

// 重置表单
const resetImportForm = () => {
  Object.assign(importForm, {
    website: '',
    apiKey: '',
  })
}

onMounted(() => {
  getSystemInfo()
})

useHead({
  title: '一键对接',
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
      <div class="import-container" v-loading="loading">
        <div class="import-card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Connection />
              </el-icon>
              <span class="title">一键对接</span>
            </div>
            <div class="header-right">
              <el-button type="primary" @click="importDialogVisible = true">
                <el-icon><Plus /></el-icon>
                <span>开始对接</span>
              </el-button>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="content-container">
            <div class="system-info-section">
              <div class="section-header">
                <h3>本系统对接信息</h3>
                <p>其他系统可以使用以下信息对接本系统的API</p>
              </div>

              <div class="info-cards">
                <div class="info-card">
                  <div class="card-title">
                    <span>系统地址</span>
                  </div>
                  <div class="card-content">
                    <div class="value-display">
                      <span class="value">{{ systemInfo.website }}</span>
                      <el-button
                        type="primary"
                        link
                        @click="copyToClipboard(systemInfo.website, '系统地址')"
                      >
                        复制
                      </el-button>
                    </div>
                  </div>
                </div>

                <div class="info-card">
                  <div class="card-title">
                    <span>API密钥</span>
                    <el-button
                      type="primary"
                      link
                      @click="generateNewApiKey"
                      size="small"
                    >
                      重新生成
                    </el-button>
                  </div>
                  <div class="card-content">
                    <div class="value-display">
                      <span class="value api-key">{{ systemInfo.apiKey }}</span>
                      <el-button
                        type="primary"
                        link
                        @click="copyToClipboard(systemInfo.apiKey, 'API密钥')"
                      >
                        复制
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="usage-tips">
                <h4>对接说明</h4>
                <div class="tips-content">
                  <div class="section">
                    <h5>注意事项</h5>
                    <ul>
                      <li style="color: red">对接成功后，请重启网关服务</li>
                      <li style="color: red">如果别名重复将会自动跳过该接口</li>
                      <li>请确保网络连接正常，能够访问对方系统</li>
                      <li>API密钥具有敏感性，请妥善保管</li>
                      <li>建议定期更新密钥以确保安全性</li>
                      <li>对接失败时请检查地址和密钥是否正确</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加对接网站对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="添加对接网站"
      width="500px"
      destroy-on-close
    >
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="网站地址" required>
          <el-input
            v-model="importForm.website"
            placeholder="请输入要对接的网站地址，如：https://api.example.com"
          />
          <div class="form-tip">要对接的目标网站地址</div>
        </el-form-item>

        <el-form-item label="API密钥" required>
          <el-input
            v-model="importForm.apiKey"
            type="password"
            placeholder="请输入对方系统提供的API密钥"
            show-password
          />
          <div class="form-tip">用于身份验证的API密钥</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="importLoading"
            @click="handleImportApi"
            :disabled="!importForm.website || !importForm.apiKey"
          >
            开始对接
          </el-button>
        </div>
      </template>
    </el-dialog>
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
    .import-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .import-card {
        width: 100%;
        border-radius: 12px;
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

          .header-right {
            .el-button {
              display: flex;
              align-items: center;
              gap: 6px;
            }
          }
        }

        .content-container {
          padding: 24px;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

          .system-info-section {
            padding: 30px;

            .section-header {
              text-align: center;
              margin-bottom: 30px;

              h3 {
                margin: 0 0 8px 0;
                color: #1a1f36;
                font-size: 20px;
                font-weight: 600;
              }

              p {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
                line-height: 1.5;
              }
            }

            .info-cards {
              display: grid;
              gap: 20px;
              margin-bottom: 30px;

              .info-card {
                border: 1px solid #eaecf0;
                border-radius: 8px;
                padding: 20px;
                background: #f9fafb;

                .card-title {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 12px;

                  span {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                  }
                }

                .card-content {
                  .value-display {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    .value {
                      flex: 1;
                      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                      font-size: 13px;
                      color: #1a1f36;
                      background: #fff;
                      padding: 8px 12px;
                      border: 1px solid #d1d5db;
                      border-radius: 4px;
                      word-break: break-all;

                      &.api-key {
                        letter-spacing: 1px;
                      }
                    }
                  }
                }
              }
            }

            .usage-tips {
              border-top: 1px solid #eaecf0;
              padding-top: 30px;

              h4 {
                margin: 0 0 20px 0;
                color: #1a1f36;
                font-size: 16px;
                font-weight: 600;
              }

              .tips-content {
                .section {
                  margin-bottom: 24px;

                  &:last-child {
                    margin-bottom: 0;
                  }

                  h5 {
                    margin: 0 0 12px 0;
                    color: #374151;
                    font-size: 14px;
                    font-weight: 600;
                  }

                  p {
                    margin: 8px 0;
                    color: #6b7280;
                    font-size: 14px;
                    line-height: 1.6;
                  }

                  ul {
                    margin: 8px 0;
                    padding-left: 20px;

                    li {
                      margin: 6px 0;
                      color: #6b7280;
                      font-size: 14px;
                      line-height: 1.6;

                      strong {
                        color: #374151;
                      }

                      code {
                        background: #f3f4f6;
                        color: #e96900;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                        font-size: 12px;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.form-tip {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
  line-height: 1.4;
}

// 复制失败时的对话框样式
:deep(.copy-fallback-dialog) {
  .el-message-box__content {
    word-break: break-all;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #eaecf0;
  }
}

// 对话框样式
:deep(.el-dialog) {
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

    .el-form-item__label {
      font-weight: 500;
      color: #374151;
    }

    .el-input__wrapper,
    .el-textarea__inner {
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
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #eaecf0;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        padding: 8px 16px;
        font-weight: 500;
        min-width: 80px;
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container .right .import-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .import-container {
    padding: 12px;

    .import-card {
      .content-container {
        .system-info-section {
          padding: 20px 15px;

          .section-header {
            h3 {
              font-size: 18px;
            }
          }

          .info-cards {
            .info-card {
              padding: 16px;

              .card-content {
                .value-display {
                  flex-direction: column;
                  align-items: stretch;
                  gap: 8px;
                }
              }
            }
          }

          .usage-tips {
            padding-top: 20px;
          }
        }
      }
    }
  }
}
</style>
