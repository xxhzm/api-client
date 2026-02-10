<script setup>
import {
  Refresh,
  Download,
  SuccessFilled,
  Warning,
  Monitor,
  Document,
} from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const { $msg, $myFetch } = useNuxtApp()

onMounted(() => {
  // 页面加载时获取系统信息
  getSystemInfo()
  getChangelogList()
})

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
const changelogLoading = ref(false)

const changelogList = ref([])
const changelogPage = ref(1)
const changelogPageSize = ref(10)
const changelogTotal = ref(0)

const formatChangelogTime = (timestamp) => {
  const numeric = Number(timestamp)
  if (Number.isNaN(numeric)) {
    return '--'
  }
  return new Date(numeric).toLocaleString()
}

const normalizeChangelog = (item = {}) => {
  const contentLines = String(item.content || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return {
    ...item,
    contentLines: contentLines.length > 0 ? contentLines : ['暂无更新说明'],
    createdAtText: formatChangelogTime(item.created_time),
  }
}

const getChangelogList = async (page = changelogPage.value) => {
  changelogLoading.value = true
  try {
    const res = await $fetch('/api/yunque/changelog', {
      method: 'GET',
      params: {
        page,
        pageSize: changelogPageSize.value,
      },
    })

    if (res.code === 200) {
      changelogList.value = Array.isArray(res.data)
        ? res.data.map((item) => normalizeChangelog(item))
        : []
      changelogTotal.value = Number(res.total) || 0
      changelogPage.value = page
      return
    }

    changelogList.value = []
    changelogTotal.value = 0
    $msg(res.message || '获取更新日志失败', 'error')
  } catch (error) {
    console.error('获取更新日志失败:', error)
    changelogList.value = []
    changelogTotal.value = 0
    $msg('获取更新日志失败', 'error')
  } finally {
    changelogLoading.value = false
  }
}

const handleChangelogCurrentChange = (page) => {
  getChangelogList(page)
}

const handleChangelogSizeChange = (size) => {
  changelogPageSize.value = size
  getChangelogList(1)
}

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
    },
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
          },
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
              <div class="version-date" v-if="systemInfo.currentReleaseDate">
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

      <div class="changelog-section">
        <div class="changelog-list" v-loading="changelogLoading">
          <el-empty
            v-if="!changelogList.length"
            description="暂无更新日志"
            class="changelog-empty"
          />

          <div v-else class="timeline">
            <div
              v-for="(item, index) in changelogList"
              :key="item.id"
              class="timeline-item"
            >
              <div class="timeline-point"></div>
              <div class="timeline-content">
                <h4>
                  <span class="version">{{ item.version }}</span>
                  <span class="date">{{ item.createdAtText }}</span>
                </h4>
                <p class="title">{{ item.title }}</p>
                <p
                  v-for="(line, lIndex) in item.contentLines"
                  :key="lIndex"
                  class="detail"
                >
                  {{ line }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="changelog-pagination" v-if="changelogTotal > 0">
          <el-pagination
            v-model:current-page="changelogPage"
            v-model:page-size="changelogPageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="changelogTotal"
            @current-change="handleChangelogCurrentChange"
            @size-change="handleChangelogSizeChange"
          />
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
</template>

<style lang="less" scoped>
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

  .changelog-section {
    margin: 0 24px 24px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    overflow: hidden;

    .changelog-list {
      min-height: 140px;
      padding: 32px 32px 24px;
      background-color: #fff;

      .timeline {
        position: relative;
        padding: 0;

        &::before {
          content: '';
          position: absolute;
          left: 20px;
          top: 6px;
          bottom: 0;
          width: 2px;
          background: #ebeef5;
        }

        .timeline-item {
          position: relative;
          padding-left: 45px;
          margin-bottom: 32px;

          &:last-child {
            margin-bottom: 0;
          }
        }

        .timeline-point {
          position: absolute;
          left: 13px;
          top: 6px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #409eff;
        }

        .timeline-content {
          h4 {
            font-size: 16px;
            color: #303133;
            margin: 0 0 12px 0;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 12px;

            .version {
              color: #409eff;
              font-weight: 600;
            }

            .date {
              font-size: 13px;
              color: #909399;
              font-weight: normal;
            }
          }

          p {
            font-size: 14px;
            color: #606266;
            line-height: 1.6;
            margin: 0 0 8px 0;

            &.title {
              color: #303133;
              font-weight: 500;
              margin-bottom: 8px;
            }

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }

    .changelog-empty {
      padding: 40px 0;
    }

    .changelog-pagination {
      display: flex;
      justify-content: flex-end;
      padding: 16px 24px;
      background-color: #fff;
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

    .changelog-section {
      margin: 0 0 16px;

      .changelog-list {
        padding: 20px 16px 8px;

        .timeline {
          .timeline-item {
            padding-left: 35px;
            margin-bottom: 24px;
          }

          .timeline-point {
            width: 12px;
            height: 12px;
            left: 11px;
            top: 5px;
          }

          .timeline-content {
            h4 {
              font-size: 15px;
              margin-bottom: 8px;
            }

            p {
              font-size: 13px;
            }
          }
        }
      }

      .changelog-pagination {
        justify-content: center;
        padding: 12px 14px;
      }
    }
  }
}
</style>
