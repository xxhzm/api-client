<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="prefix_container">
        <div class="prefix-card">
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Connection />
              </el-icon>
              <span class="title">前缀管理</span>
            </div>
            <div class="header-right">
              <el-button type="primary" @click="createStatus = true">
                <span>新增前缀</span>
              </el-button>
            </div>
          </div>

          <div class="table-container">
            <ClientOnly>
              <el-table :data="filterTableData" style="width: 100%">
                <el-table-column width="160" fixed="right">
                  <template #header>
                    <div class="search-wrapper">
                      <el-input
                        v-model="search"
                        size="default"
                        placeholder="搜索"
                        clearable
                      >
                        <template #prefix>
                          <el-icon>
                            <Search />
                          </el-icon>
                        </template>
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
                        <el-icon>
                          <Edit />
                        </el-icon>
                        编辑
                      </el-button>
                      <el-popconfirm
                        confirm-button-text="确定"
                        cancel-button-text="取消"
                        title="确定要删除吗？"
                        @confirm="handleDelete(scope.$index, scope.row)"
                      >
                        <template #reference>
                          <el-button type="danger" link>
                            <el-icon>
                              <Delete />
                            </el-icon>
                            删除
                          </el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="id" label="ID" width="50" />
                <el-table-column prop="name" label="前缀名称" width="140" />
                <el-table-column
                  prop="prefix"
                  label="前缀地址"
                  min-width="180"
                  show-overflow-tooltip
                />
                <el-table-column prop="request_type" label="类型" width="80">
                  <template #default="scope">
                    <el-tag
                      :type="
                        scope.row.request_type === 'http'
                          ? 'success'
                          : 'warning'
                      "
                      size="small"
                    >
                      {{ scope.row.request_type }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </ClientOnly>
          </div>
        </div>

        <!-- 新增/编辑对话框 -->
        <el-dialog
          v-model="createStatus"
          :title="disabled ? '修改前缀' : '新增前缀'"
          width="500px"
          destroy-on-close
        >
          <el-form :model="prefixInfo" label-width="90px">
            <el-form-item label="前缀名称" required>
              <el-input
                v-model="prefixInfo.name"
                maxlength="32"
                show-word-limit
                placeholder="请输入前缀名称"
              />
            </el-form-item>
            <el-form-item label="前缀地址" required>
              <el-input
                v-model="prefixInfo.prefix"
                show-word-limit
                placeholder="请输入前缀地址"
              />
            </el-form-item>
            <el-form-item label="接口类型" required>
              <el-select
                v-model="prefixInfo.requestType"
                placeholder="请选择接口类型"
                class="full-width"
              >
                <el-option label="HTTP" value="http" />
                <el-option label="gRPC" value="grpc" />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="createStatus = false">取消</el-button>
              <el-button
                type="primary"
                @click="disabled ? updatePrefix() : createPrefix()"
              >
                确定
              </el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $msg, $myFetch } = useNuxtApp()
const msg = $msg

const loading = ref(false)
const tableData = ref([])
const search = ref('')

const getData = async () => {
  const res = await $myFetch('PrefixList')

  if (res.code !== 200) {
    msg(res.msg, 'error')
    return false
  }

  tableData.value = res.data
}

onMounted(() => {
  getData()
})

const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.name.toLowerCase().includes(search.value.toLowerCase()) ||
      data.prefix.toLowerCase().includes(search.value.toLowerCase()) ||
      data.request_type.toLowerCase().includes(search.value.toLowerCase())
  )
)

const handleDelete = async (index, row) => {
  loading.value = true

  const res = await $myFetch('DeletePrefix', {
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

const prefixInfo = ref({
  id: 0,
  name: '',
  prefix: '',
  requestType: '',
})

const createPrefix = async () => {
  disabled.value = false
  if (!prefixInfo.value.name || !prefixInfo.value.requestType) {
    msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('name', prefixInfo.value.name)
  bodyValue.append('prefix', prefixInfo.value.prefix)
  bodyValue.append('requestType', prefixInfo.value.requestType)

  const res = await $myFetch('CreatePrefix', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code !== 200) {
    msg(res.msg, 'error')
    handleClose()
    return false
  }

  handleClose()
  msg(res.msg, 'success')
  await getData()

  createStatus.value = false
}

const updatePrefix = async () => {
  disabled.value = true
  if (
    prefixInfo.value.id === 0 ||
    !prefixInfo.value.name ||
    !prefixInfo.value.requestType
  ) {
    msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('id', prefixInfo.value.id)
  bodyValue.append('name', prefixInfo.value.name)
  bodyValue.append('prefix', prefixInfo.value.prefix)
  bodyValue.append('requestType', prefixInfo.value.requestType)

  const res = await $myFetch('UpdatePrefix', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code !== 200) {
    msg(res.msg, 'error')
    handleClose()
    return false
  }

  handleClose()
  msg(res.msg, 'success')
  await getData()

  createStatus.value = false
}

// 弹窗当前状态,判断新增还是编辑，false为新增，true为编辑
const disabled = ref(false)

// 新增前缀弹窗状态
const createStatus = ref(false)

const handleClose = () => {
  // 初始化值
  prefixInfo.value.id = 0
  prefixInfo.value.name = ''
  prefixInfo.value.prefix = ''
  prefixInfo.value.requestType = ''
}

// 编辑前缀
const handleEdit = (index, row) => {
  disabled.value = true
  createStatus.value = true

  prefixInfo.value.id = row.id
  prefixInfo.value.name = row.name
  prefixInfo.value.prefix = row.prefix
  prefixInfo.value.requestType = row.request_type
}

useHead({
  title: '管理分类',
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

    .prefix_container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .prefix-card {
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
          overflow-x: auto;
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

            .el-input {
              width: 140px;
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
  .container .right .prefix_container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .prefix_container {
    padding: 12px;
  }
}
</style>
