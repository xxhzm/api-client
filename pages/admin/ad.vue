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
      <div class="ad-container" v-loading="loading">
        <div class="ad-card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Picture />
              </el-icon>
              <span class="title">广告位列表</span>
            </div>
            <div class="header-right">
              <el-button type="primary" @click="dialogStatus = true">
                <span>新增广告位</span>
              </el-button>
            </div>
          </div>

          <!-- 表格区域 -->
          <div class="table-container">
            <client-only>
              <el-table :data="filterTableData" style="width: 100%">
                <el-table-column width="160" fixed="right">
                  <template #header>
                    <div class="search-wrapper">
                      <el-input v-model="search" placeholder="搜索" clearable>
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
                <el-table-column prop="id" label="ID" width="50" />
                <el-table-column
                  prop="url"
                  label="广告地址"
                  min-width="200"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="image"
                  label="图像地址"
                  min-width="200"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="create_time"
                  label="添加时间"
                  width="180"
                />
                <el-table-column
                  prop="expiration_time"
                  label="到期时间"
                  width="180"
                />
              </el-table>
            </client-only>
          </div>

          <!-- 新增/编辑广告对话框 -->
          <el-dialog
            v-model="dialogStatus"
            :title="updateAdStatus ? '修改广告' : '新增广告'"
            width="500px"
            destroy-on-close
          >
            <el-form :model="adInfo" label-width="90px">
              <el-form-item label="广告地址" required>
                <el-input v-model="adInfo.url" placeholder="请输入广告地址" />
              </el-form-item>
              <el-form-item label="广告图像" required>
                <el-input v-model="adInfo.image" placeholder="请输入图像地址" />
              </el-form-item>
              <el-form-item label="到期时间" required>
                <el-date-picker
                  v-model="adInfo.expiration_time"
                  type="date"
                  format="YYYY/MM/DD"
                  value-format="x"
                  placeholder="请选择日期"
                  class="full-width"
                />
              </el-form-item>
            </el-form>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="dialogStatus = false">取消</el-button>
                <el-button type="primary" @click="submit">{{
                  updateAdStatus ? '修改' : '创建'
                }}</el-button>
              </div>
            </template>
          </el-dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Picture, Menu } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

const tableData = ref([])
const search = ref('')

const loading = ref(false)

// 弹窗显示状态
const dialogStatus = ref(false)
const updateAdStatus = ref(false)

const adInfo = ref({
  id: 0,
  url: '',
  image: '',
  create_time: '',
  expiration_time: '',
})

// 控制左侧边栏显示隐藏
// 获取页面宽度
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
  // 禁止页面滑动
  if (isSidebarShow.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 获取数据信息
const getData = async () => {
  const res = await $myFetch('AdList')

  res.data.forEach((element, key) => {
    res.data[key].create_time = new Date(
      Number(element.create_time)
    ).toLocaleString()
    res.data[key].expiration_time = new Date(
      Number(element.expiration_time)
    ).toLocaleString()
  })

  tableData.value = res.data
}

onMounted(() => {
  getData()
})

// 搜索框
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.url.toLowerCase().includes(search.value.toLowerCase())
  )
)

// 编辑广告
const handleEdit = (index, row) => {
  dialogStatus.value = true
  updateAdStatus.value = true

  adInfo.value.id = row.id
  adInfo.value.url = row.url
  adInfo.value.image = row.image
  adInfo.value.expiration_time = new Date(row.expiration_time).getTime()
}

// 删除广告
const handleDelete = async (index, row) => {
  loading.value = true
  const res = await $myFetch('DeleteAd', {
    params: {
      id: row.id,
    },
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }

  await getData()
  loading.value = false
}

const submit = async () => {
  // 判断信息是否填写
  if (
    adInfo.value.url === '' ||
    adInfo.value.image === '' ||
    adInfo.value.expiration_time === ''
  ) {
    $msg('请填写完整信息', 'error')
    return
  }

  loading.value = true
  const body = new URLSearchParams()
  body.append('url', adInfo.value.url)
  body.append('image', adInfo.value.image)
  body.append('expirationTime', adInfo.value.expiration_time)

  const url = ref('')

  // 判断是添加广告还是修改广告
  if (updateAdStatus.value === true) {
    url.value = 'UpdateAd'

    // 判断id是否存在
    if (adInfo.value.id === 0) {
      $msg('请填写完整信息', 'error')
      return
    }

    body.append('id', adInfo.value.id)
  } else {
    url.value = 'CreateAd'
  }

  const res = await $myFetch(url.value, {
    method: 'POST',
    body,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }

  await getData()
  dialogStatus.value = false
  loading.value = false
}

// 监听弹窗是否关闭，将信息设置为默认
watch(dialogStatus, (newValue) => {
  if (newValue === false) {
    updateAdStatus.value = false

    adInfo.value.id = 0
    adInfo.value.url = ''
    adInfo.value.image = ''
    adInfo.value.expiration_time = ''
  }
})

useHead({
  title: '广告位列表',
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
    .ad-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .ad-card {
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
        }
      }
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

    .full-width {
      width: 100%;
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
  .container .right .ad-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .ad-container {
    padding: 12px;
  }
}
</style>
