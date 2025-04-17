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
      <div class="ipban-container" v-loading="loading">
        <div class="ipban-card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Lock />
              </el-icon>
              <span class="title">IP封禁管理</span>
            </div>
            <div class="header-right">
              <el-button type="primary" @click="createBanStatus = true">
                <span>添加封禁</span>
              </el-button>
            </div>
          </div>

          <!-- 表格区域 -->
          <div class="table-container">
            <client-only>
              <el-table
                :data="filterTableData"
                style="width: 100%"
                v-loading="pageLoading"
              >
                <el-table-column width="200" fixed="right">
                  <template #header>
                    <div class="search-wrapper">
                      <el-input v-model="search" placeholder="搜索IP" clearable>
                      </el-input>
                    </div>
                  </template>
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button
                        type="primary"
                        link
                        @click="handleEdit(scope.$index, scope.row)"
                      >
                        编辑
                      </el-button>
                      <el-popconfirm
                        confirm-button-text="确定"
                        cancel-button-text="取消"
                        title="确定要解除封禁吗？"
                        @confirm="handleUnban(scope.$index, scope.row)"
                      >
                        <template #reference>
                          <el-button type="success" link> 解除封禁 </el-button>
                        </template>
                      </el-popconfirm>
                      <el-popconfirm
                        confirm-button-text="确定"
                        cancel-button-text="取消"
                        title="确定要删除吗？"
                        @confirm="handleDelete(scope.$index, scope.row)"
                      >
                        <template #reference>
                          <el-button type="danger" link> 删除 </el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="id" label="ID" width="55" />
                <el-table-column prop="ip" label="IP地址" width="180" />
                <el-table-column
                  prop="reason"
                  label="封禁原因"
                  min-width="250"
                  show-overflow-tooltip
                />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="
                        scope.row.status === '已封禁'
                          ? 'danger'
                          : scope.row.status === 'IP白名单'
                          ? 'info'
                          : 'success'
                      "
                      size="small"
                    >
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="ban_time"
                  label="开始时间"
                  min-width="200"
                />
                <el-table-column
                  prop="expire_time"
                  label="到期时间"
                  min-width="200"
                />
              </el-table>

              <div class="pagination">
                <el-pagination
                  :page-size="25"
                  :pager-count="5"
                  :total="totalRecords"
                  v-model:current-page="page"
                  :disabled="pageLoading"
                  background
                  layout="total, prev, pager, next, jumper"
                />
              </div>
            </client-only>
          </div>

          <!-- 新增/编辑封禁对话框 -->
          <el-dialog
            v-model="createBanStatus"
            :title="isEdit ? '修改封禁' : '添加封禁'"
            width="500px"
            destroy-on-close
          >
            <el-form :model="banInfo" label-width="90px">
              <el-form-item label="IP地址" required>
                <el-input
                  v-model="banInfo.ip"
                  placeholder="请输入要封禁的IP地址"
                  :disabled="isEdit"
                />
              </el-form-item>
              <el-form-item label="封禁原因" required>
                <el-input
                  v-model="banInfo.reason"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入封禁原因"
                />
                <div class="quick-reason-buttons">
                  <div class="reason-label">快速选择：</div>
                  <div
                    v-for="(reason, index) in quickReasons"
                    :key="index"
                    class="reason-tag"
                    :class="{
                      active:
                        banInfo.reason && banInfo.reason.includes(reason.text),
                    }"
                    @click="addReason(reason.text)"
                  >
                    <el-icon v-if="reason.icon === 'WarningFilled'"
                      ><WarningFilled
                    /></el-icon>
                    <el-icon v-else-if="reason.icon === 'Warning'"
                      ><Warning
                    /></el-icon>
                    <el-icon v-else-if="reason.icon === 'Timer'"
                      ><Timer
                    /></el-icon>
                    <el-icon v-else-if="reason.icon === 'Search'"
                      ><Search
                    /></el-icon>
                    <el-icon v-else-if="reason.icon === 'Connection'"
                      ><Connection
                    /></el-icon>
                    <el-icon v-else-if="reason.icon === 'CircleCloseFilled'"
                      ><CircleCloseFilled
                    /></el-icon>
                    <el-icon v-else-if="reason.icon === 'Delete'"
                      ><Delete
                    /></el-icon>
                    <el-icon v-else-if="reason.icon === 'Position'"
                      ><Position
                    /></el-icon>
                    <span>{{ reason.text }}</span>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="封禁时长">
                <el-select
                  v-model="banInfo.duration"
                  placeholder="请选择封禁时长"
                  class="full-width"
                >
                  <el-option label="1小时" value="1h" />
                  <el-option label="24小时" value="24h" />
                  <el-option label="7天" value="7d" />
                  <el-option label="30天" value="30d" />
                  <el-option label="永久" value="permanent" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="banInfo.statusValue" class="full-width">
                  <el-option :value="1" label="已封禁" />
                  <el-option
                    :value="2"
                    label="已解除"
                    :disabled="!isEdit.value"
                  />
                  <el-option :value="3" label="IP白名单" />
                </el-select>
                <div class="status-tip" v-if="!isEdit.value">
                  <el-icon><InfoFilled /></el-icon>
                  <span>新增IP时可选择"已封禁"或"IP白名单"(信任的IP)</span>
                </div>
              </el-form-item>
            </el-form>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="createBanStatus = false">取消</el-button>
                <el-button type="primary" @click="handleSaveBan">
                  确认
                </el-button>
              </div>
            </template>
          </el-dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Menu,
  Lock,
  WarningFilled,
  Warning,
  Timer,
  Search,
  Connection,
  CircleCloseFilled,
  Delete,
  Position,
  InfoFilled,
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

// 封禁IP列表数据
const loading = ref(true)
const pageLoading = ref(false)
const page = ref(1)
const totalRecords = ref(0)
const search = ref('')
const tableData = ref([])
const createBanStatus = ref(false)
const isEdit = ref(false)

// 封禁信息
const banInfo = ref({
  id: '',
  ip: '',
  reason: '',
  duration: '24h',
  status: '已封禁',
  statusValue: 1,
  ban_time: '',
  expire_time: '',
})

// 搜索过滤
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.ip.toLowerCase().includes(search.value.toLowerCase()) ||
      data.reason.toLowerCase().includes(search.value.toLowerCase())
  )
)

// 获取封禁时长的毫秒数并计算到期时间戳
const getExpirationTime = (duration) => {
  const durations = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    permanent: 0,
  }

  // 如果是永久封禁，返回0
  if (duration === 'permanent') {
    return 0
  }

  // 计算到期时间戳
  const durationMs = durations[duration] || durations['24h']
  return Date.now() + durationMs
}

// 状态值映射
const getStatusValue = (statusText) => {
  const statusMap = {
    已封禁: 1,
    已解除: 2,
    白名单: 3,
  }
  return statusMap[statusText] || 1
}

// 状态文本映射
const getStatusText = (statusValue) => {
  const statusMap = {
    1: '已封禁',
    2: '已解除',
    3: 'IP白名单',
  }
  return statusMap[statusValue] || '已封禁'
}

// 获取封禁IP列表
const getBanList = async () => {
  loading.value = true
  pageLoading.value = true

  try {
    const res = await $myFetch('GetIPBanList', {
      method: 'GET',
      query: {
        page: page.value,
        limit: 25,
      },
    })

    if (res.code === 200 && res.data) {
      // 处理返回数据，转换状态值为文本
      tableData.value = res.data.banipList.map((item) => ({
        id: item.id,
        ip: item.ip,
        reason: item.reason,
        status: getStatusText(item.status),
        // 时间戳转换为可读时间格式
        ban_time: item.create_time
          ? new Date(parseInt(item.create_time)).toLocaleString()
          : '',
        expire_time: item.expiration_time
          ? parseInt(item.expiration_time) === 0
            ? '永久'
            : new Date(parseInt(item.expiration_time)).toLocaleString()
          : '',
      }))
      totalRecords.value = res.data.totalRecords
    } else {
      $msg('获取封禁IP列表失败', 'error')
      tableData.value = []
      totalRecords.value = 0
    }
  } catch (error) {
    $msg('获取封禁IP列表失败', 'error')
    tableData.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
    pageLoading.value = false
  }
}

// 编辑封禁IP
const handleEdit = (index, row) => {
  isEdit.value = true
  banInfo.value = {
    ...row,
    statusValue: getStatusValue(row.status),
  }
  createBanStatus.value = true
}

// 解除封禁
const handleUnban = async (index, row) => {
  try {
    const body = new URLSearchParams()
    body.append('id', row.id.toString())
    body.append('ip', row.ip)

    // 使用专门的解除封禁接口
    const res = await $myFetch('UnbanIP', {
      method: 'POST',
      body,
    })

    if (res.code === 200) {
      $msg('解除封禁成功', 'success')
      // 更新列表
      getBanList()
    } else {
      $msg(res.msg || '解除封禁失败', 'error')
    }
  } catch (error) {
    $msg('解除封禁失败', 'error')
  }
}

// 删除封禁记录
const handleDelete = async (index, row) => {
  try {
    const body = new URLSearchParams()
    body.append('id', row.id.toString())
    body.append('ip', row.ip)

    // 使用专门的删除接口
    const res = await $myFetch('DeleteIPBan', {
      method: 'POST',
      body,
    })

    if (res.code === 200) {
      $msg('删除成功', 'success')
      // 请求数据
      getBanList()
    } else {
      $msg(res.msg || '删除失败', 'error')
    }
  } catch (error) {
    $msg('删除失败', 'error')
  }
}

// 保存封禁
const handleSaveBan = async () => {
  if (!banInfo.value.ip) {
    return $msg('请输入IP地址', 'warning')
  }

  if (!banInfo.value.reason) {
    return $msg('请输入封禁原因', 'warning')
  }

  try {
    // 计算过期时间戳
    const expirationTime = getExpirationTime(banInfo.value.duration)

    // 准备请求参数
    const body = new URLSearchParams()

    // 只在新增时提交IP参数
    if (!isEdit.value) {
      body.append('ip', banInfo.value.ip)
    }

    body.append('reason', banInfo.value.reason)

    // 始终使用用户在界面选择的状态值
    body.append('status', banInfo.value.statusValue.toString())

    body.append('expirationTime', expirationTime.toString())

    // 如果是编辑，添加ID参数
    if (isEdit.value && banInfo.value.id) {
      body.append('id', banInfo.value.id.toString())
    }

    // 实际API调用
    const res = await $myFetch(isEdit.value ? 'UpdateIPBan' : 'AddIPBan', {
      method: 'POST',
      body,
    })

    if (res.code === 200) {
      $msg(isEdit.value ? '更新成功' : '添加成功', 'success')
      createBanStatus.value = false

      // 刷新列表
      getBanList()

      // 重置表单
      resetForm()
    } else {
      $msg(res.msg || (isEdit.value ? '更新失败' : '添加失败'), 'error')
    }
  } catch (error) {
    $msg(isEdit.value ? '更新失败' : '添加失败', 'error')
  }
}

// 重置表单
const resetForm = () => {
  banInfo.value = {
    id: '',
    ip: '',
    reason: '',
    duration: '24h',
    status: '已封禁',
    statusValue: 1,
    ban_time: '',
    expire_time: '',
  }
  isEdit.value = false
}

// 监听页码变化
watch(page, () => {
  getBanList()
})

// 常用封禁原因列表
const quickReasons = ref([
  { text: '非法请求', icon: 'WarningFilled' },
  { text: '恶意攻击', icon: 'Warning' },
  { text: '频繁请求', icon: 'Timer' },
  { text: '扫描漏洞', icon: 'Search' },
  { text: '爬虫行为', icon: 'Connection' },
  { text: 'XSS攻击', icon: 'CircleCloseFilled' },
  { text: 'SQL注入', icon: 'Delete' },
  { text: '代理/VPN', icon: 'Position' },
])

// 快速添加封禁原因
const addReason = (reason) => {
  if (!banInfo.value.reason) {
    banInfo.value.reason = reason
  } else if (!banInfo.value.reason.includes(reason)) {
    banInfo.value.reason += '，' + reason
  }
}

onMounted(() => {
  getBanList()
})

useHead({
  title: 'IP封禁管理',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

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
    .ipban-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .ipban-card {
        width: 100%;
        max-width: 1400px;
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

        .table-container {
          padding: 24px;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

          :deep(.el-table) {
            border: none;

            .search-wrapper {
              padding: 0;
              margin: 0;
              line-height: 1;
            }

            .el-input {
              width: 140px;
              margin: 0;
            }

            .el-table__header-wrapper {
              th {
                background: #f8fafc;
                color: #1f2937;
                font-weight: 600;
              }
            }
          }

          .table-actions {
            display: flex;
            gap: 4px;
            margin: 0;
            padding: 0;
          }

          .pagination {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
          }
        }
      }
    }
  }
}

.full-width {
  width: 100%;
}

.quick-reason-buttons {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;

  .reason-label {
    font-size: 13px;
    color: #606266;
    margin-right: 4px;
  }

  .reason-tag {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
    line-height: 30px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    background-color: #f5f7fa;
    color: #606266;
    cursor: pointer;
    transition: all 0.3s;

    .el-icon {
      margin-right: 4px;
      font-size: 14px;
    }

    &:hover {
      color: #409eff;
      border-color: #c6e2ff;
      background-color: #ecf5ff;
    }

    &.active {
      color: #409eff;
      border-color: #c6e2ff;
      background-color: #ecf5ff;
    }
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
  .container .right .ipban-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .ipban-container {
    padding: 12px;
  }
}

.status-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;

  .el-icon {
    margin-right: 4px;
    font-size: 14px;
    color: #e6a23c;
  }
}
</style>
