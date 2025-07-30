<script setup>
import {
  Menu,
  Refresh,
  Download,
  SuccessFilled,
  Warning,
  Monitor,
} from '@element-plus/icons-vue'

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

  // 页面加载时获取系统信息
  getSystemInfo()
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

// 系统信息
const systemInfo = ref({
  currentVersion: '1.0.0',
  latestVersion: '1.0.0',
  releaseDate: '',
  updateAvailable: false,
  lastCheckTime: '',
})

// 加载状态
const loading = ref(false)
const checkingUpdate = ref(false)
const updating = ref(false)

// 获取系统信息
const getSystemInfo = async () => {
  loading.value = true
  try {
    const res = await $myFetch('GetVersion', {
      method: 'GET',
    })

    if (res.code === 200) {
      systemInfo.value = {
        ...systemInfo.value,
        currentVersion: res.data.current_version,
        latestVersion: res.data.new_version,
        updateAvailable: res.data.current_version !== res.data.new_version,
        lastCheckTime: new Date().toLocaleString(),
      }
    }
  } catch (error) {
    console.error('获取系统信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 检查更新
const checkUpdate = async () => {
  checkingUpdate.value = true
  try {
    const res = await $myFetch('GetVersion', {
      method: 'GET',
    })

    if (res.code === 200) {
      const updateAvailable = res.data.current_version !== res.data.new_version
      systemInfo.value = {
        ...systemInfo.value,
        currentVersion: res.data.current_version,
        latestVersion: res.data.new_version,
        updateAvailable: updateAvailable,
        lastCheckTime: new Date().toLocaleString(),
      }

      if (updateAvailable) {
        $msg(`发现新版本 ${res.data.new_version}`, 'success')
      } else {
        $msg('当前已是最新版本', 'info')
      }
    } else {
      $msg(res.msg || '检查更新失败', 'error')
    }
  } catch (error) {
    $msg('检查更新失败', 'error')
  } finally {
    checkingUpdate.value = false
  }
}

// 执行更新
const performUpdate = async () => {
  if (!systemInfo.value.updateAvailable) {
    $msg('没有可用的更新', 'warning')
    return
  }

  ElMessageBox.confirm(
    `确定要更新到版本 ${systemInfo.value.latestVersion} 吗？\n\n注意：更新完成后需要手动重启以下服务：\n• 网关服务\n• 后端服务\n• 前端服务`,
    '确认更新',
    {
      confirmButtonText: '确定更新',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: false,
    }
  ).then(async () => {
    updating.value = true

    try {
      const res = await $myFetch('PerformUpdate', {
        method: 'GET',
      })

      if (res.code === 200) {
        ElMessageBox.alert(
          '更新成功！请手动重启以下服务以完成更新：\n\n1. 网关服务\n2. 后端服务\n3. 前端服务\n\n重启完成后，请刷新页面查看最新版本。',
          '更新成功',
          {
            confirmButtonText: '我知道了',
            type: 'success',
            dangerouslyUseHTMLString: false,
          }
        )

        // 刷新系统信息
        await getSystemInfo()
      } else {
        $msg(res.msg || '更新失败', 'error')
      }
    } catch (error) {
      $msg('更新失败', 'error')
    } finally {
      updating.value = false
    }
  })
}

useHead({
  title: '在线更新 - 管理后台',
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
        <el-icon @click="handleSidebarShow">
          <Menu />
        </el-icon>
      </div>
      <AdminHeader></AdminHeader>

      <div class="update-container" v-loading="loading">
        <div class="update-card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Refresh />
              </el-icon>
              <span class="title">在线更新</span>
            </div>
            <div class="header-right">
              <el-button
                type="primary"
                @click="checkUpdate"
                :loading="checkingUpdate"
                :icon="Refresh"
              >
                检查更新
              </el-button>
            </div>
          </div>

          <!-- 系统版本信息 -->
          <div class="version-info">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-card">
                  <div class="info-header">
                    <el-icon class="info-icon current">
                      <Monitor />
                    </el-icon>
                    <span class="info-title">当前版本</span>
                  </div>
                  <div class="version-number">
                    {{ systemInfo.currentVersion }}
                  </div>
                  <div
                    class="version-date"
                    v-if="systemInfo.currentReleaseDate"
                  >
                    发布时间: {{ systemInfo.currentReleaseDate }}
                  </div>
                </div>
              </el-col>

              <el-col :span="12">
                <div class="info-card">
                  <div class="info-header">
                    <el-icon
                      class="info-icon latest"
                      :class="{ available: systemInfo.updateAvailable }"
                    >
                      <SuccessFilled v-if="!systemInfo.updateAvailable" />
                      <Warning v-else />
                    </el-icon>
                    <span class="info-title">最新版本</span>
                  </div>
                  <div class="version-number">
                    {{ systemInfo.latestVersion }}
                  </div>
                  <div class="version-date" v-if="systemInfo.releaseDate">
                    发布时间: {{ systemInfo.releaseDate }}
                  </div>
                  <div class="update-status">
                    <el-tag
                      v-if="!systemInfo.updateAvailable"
                      type="success"
                      size="small"
                    >
                      已是最新版本
                    </el-tag>
                    <el-tag v-else type="warning" size="small">
                      有新版本可用
                    </el-tag>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 更新操作区域 -->
          <div class="update-actions" v-if="systemInfo.updateAvailable">
            <el-alert
              title="发现新版本"
              :description="`版本 ${systemInfo.latestVersion} 已可用，建议及时更新以获得最新功能和安全修复。`"
              type="warning"
              :closable="false"
              show-icon
            />

            <el-alert
              title="重要提示"
              description="更新完成后，请手动重启网关服务、后端服务和前端服务以完成更新流程。"
              type="info"
              :closable="false"
              show-icon
              style="margin-top: 12px"
            />

            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                @click="performUpdate"
                :loading="updating"
                :icon="Download"
              >
                立即更新
              </el-button>
            </div>
          </div>

          <!-- 最后检查时间 -->
          <div class="check-info" v-if="systemInfo.lastCheckTime">
            <el-text type="info" size="small">
              最后检查时间: {{ systemInfo.lastCheckTime }}
            </el-text>
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
    position: relative;

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
        cursor: pointer;
      }
    }
  }
}

.update-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);

  .update-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;

      .header-left {
        display: flex;
        align-items: center;

        .icon {
          font-size: 20px;
          color: #409eff;
          margin-right: 8px;
        }

        .title {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }

  .version-info {
    padding: 24px;

    .info-card {
      background: #fafafa;
      border-radius: 8px;
      padding: 20px;
      text-align: center;

      .info-header {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 16px;

        .info-icon {
          font-size: 24px;
          margin-right: 8px;

          &.current {
            color: #409eff;
          }

          &.latest {
            color: #67c23a;

            &.available {
              color: #e6a23c;
            }
          }
        }

        .info-title {
          font-size: 14px;
          color: #666;
        }
      }

      .version-number {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 8px;
      }

      .version-date {
        font-size: 12px;
        color: #909399;
        margin-bottom: 12px;
      }

      .update-status {
        margin-top: 8px;
      }
    }
  }

  .update-actions {
    padding: 0 24px 24px;

    .el-alert {
      margin-bottom: 16px;
    }

    .action-buttons {
      text-align: center;

      .el-button {
        padding: 12px 32px;
        font-size: 16px;
      }
    }
  }

  .check-info {
    padding: 0 24px 24px;
    text-align: center;
  }
}

@media screen and (max-width: 768px) {
  .update-container {
    padding: 10px;

    .version-info {
      .el-col {
        margin-bottom: 16px;
      }
    }
  }
}
</style>
