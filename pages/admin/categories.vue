<script setup>
import { Menu } from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()
const msg = $msg

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

const loading = ref(false)
const tableData = ref([])
const search = ref('')

const getData = async () => {
  const res = await $myFetch('CategoryList')

  if (res.code !== 200) {
    msg(res.msg, 'error')
    return false
  }

  res.data = res.data.map((item) => {
    return {
      id: item.id,
      alias: item.alias,
      name: item.name,
      default: item.default === 1 ? '是' : '否',
      count: item.count,
      createTime: new Date(Number(item.createTime)).toLocaleString(),
    }
  })

  tableData.value = res.data
}

onMounted(() => {
  getData()
})

const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

const handleDelete = async (index, row) => {
  loading.value = true

  const res = await $myFetch('CategoryDelete', {
    params: {
      id: row.id,
    },
  })

  if (res.code !== 200) {
    msg(res.msg, 'error')
    loading.value = false
    return false
  }

  msg(res.msg, 'success')

  await getData()

  loading.value = false
}

// 查看当前分类下的接口
const handleViewApis = async (index, row) => {
  loading.value = true
  try {
    const res = await $myFetch('SearchAPI', {
      params: {
        category: row.id,
      },
    })

    if (res.code !== 200) {
      msg(res.msg, 'error')
      return
    }

    // 仅保留并展示 id 与 name 字段
    viewApiList.value = Array.isArray(res.data)
      ? res.data.map((item) => ({ id: item.id, name: item.name }))
      : []
    viewApiDialogVisible.value = true
  } catch (error) {
    msg('查询失败', 'error')
  } finally {
    loading.value = false
  }
}

const addcategoryInfo = reactive({
  name: '',
  alias: '',
})

const onSubmit = async () => {
  if (!addcategoryInfo.name || !addcategoryInfo.alias) {
    msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('name', addcategoryInfo.name)
  bodyValue.append('alias', addcategoryInfo.alias)

  const res = await $myFetch('CategoryCreate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code !== 200) {
    msg(res.msg, 'error')
  } else {
    msg(res.msg, 'success')
  }

  getData()
}

useHead({
  title: '管理分类',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})

// 展示接口列表弹窗数据
const viewApiDialogVisible = ref(false)
const viewApiList = ref([])
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
      <div class="categories-container" v-loading="loading">
        <div class="categories-card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <span class="title">分类管理</span>
            </div>
          </div>

          <!-- 表格区域 -->
          <div class="table-container">
            <client-only>
              <el-table :data="filterTableData" style="width: 100%">
                <el-table-column fixed="right">
                  <template #header>
                    <div class="search-wrapper">
                      <el-input v-model="search" placeholder="搜索" clearable>
                      </el-input>
                    </div>
                  </template>
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button type="primary" link @click="handleViewApis(scope.$index, scope.row)"> 查看接口 </el-button>
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
                <el-table-column prop="id" label="ID" />
                <el-table-column
                  prop="name"
                  label="分类名称"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="alias"
                  label="别名"
                  show-overflow-tooltip
                />
                <el-table-column prop="count" label="接口数" />
                <el-table-column prop="createTime" label="创建时间" />
                <el-table-column prop="default" label="默认分类">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.default === '是' ? 'success' : 'info'"
                      size="small"
                    >
                      {{ scope.row.default }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </client-only>
          </div>

          <!-- 查看接口弹窗 -->
          <el-dialog v-model="viewApiDialogVisible" title="分类接口列表" width="600px">
            <client-only>
              <el-table :data="viewApiList" style="width: 100%">
                <el-table-column prop="id" label="ID" width="100" />
                <el-table-column prop="name" label="接口名称" />
              </el-table>
            </client-only>
          </el-dialog>

          <!-- 新增分类表单 -->
          <div class="form-container">
            <div class="form-header">
              <span class="title">新增分类</span>
            </div>
            <div class="form-content">
              <el-form :model="addcategoryInfo" label-width="90px">
                <el-form-item label="分类名称" required>
                  <el-input
                    v-model="addcategoryInfo.name"
                    maxlength="32"
                    show-word-limit
                    placeholder="请输入分类名称"
                  />
                </el-form-item>
                <el-form-item label="分类别名" required>
                  <el-input
                    v-model="addcategoryInfo.alias"
                    maxlength="32"
                    show-word-limit
                    placeholder="请输入分类别名"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="onSubmit"
                    >创建分类</el-button
                  >
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    .categories-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .categories-card {
        width: 100%;
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

            .title {
              font-size: 16px;
              font-weight: 600;
              color: #1a1f36;
            }
          }
        }

        .table-container {
          padding: 24px;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
          margin-bottom: 16px;

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

        .form-container {
          padding: 24px;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

          .form-header {
            margin-bottom: 24px;

            .title {
              font-size: 16px;
              font-weight: 600;
              color: #1a1f36;
            }
          }

          .form-content {
            max-width: 600px;

            :deep(.el-form-item__label) {
              font-weight: 500;
              color: #374151;
            }

            :deep(.el-input__wrapper) {
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

            .el-button {
              padding: 8px 16px;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container .right .categories-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .categories-container {
    padding: 12px;
  }
}
</style>
