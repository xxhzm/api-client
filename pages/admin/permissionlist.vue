<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="permissionlist-container" v-loading="loading">
        <div class="permission-card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Lock />
              </el-icon>
              <span class="title">权限列表</span>
            </div>
            <div class="header-right">
              <el-button type="primary" @click="dialogStatus = true">
                <span>新增规则</span>
              </el-button>
            </div>
          </div>

          <!-- 表格区域 -->
          <div class="table-container">
            <client-only>
              <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="规则名称" width="200" show-overflow-tooltip />
                <el-table-column prop="path" label="规则地址" min-width="200" show-overflow-tooltip />
                <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
                <el-table-column width="200" fixed="right">
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button type="primary" link @click="handleEdit(scope.$index, scope.row)">
                        <el-icon>
                          <Edit />
                        </el-icon>
                        编辑
                      </el-button>
                      <el-button type="info" link @click="handleRole(scope.$index, scope.row)">
                        <el-icon>
                          <UserFilled />
                        </el-icon>
                        绑定角色
                      </el-button>
                      <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" title="确定要删除吗？"
                        @confirm="handleDelete(scope.$index, scope.row)">
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
              </el-table>
            </client-only>
          </div>

          <!-- 新增/编辑规则对话框 -->
          <el-dialog v-model="dialogStatus" :title="updatePermissionStatus ? '修改规则' : '新增规则'" width="500px"
            destroy-on-close>
            <el-form :model="permissionInfo" label-width="90px">
              <el-form-item label="规则名称" required>
                <el-input v-model="permissionInfo.name" placeholder="请输入规则名称" />
              </el-form-item>
              <el-form-item label="规则地址" required>
                <el-input v-model="permissionInfo.path" placeholder="请输入规则地址" />
              </el-form-item>
              <el-form-item label="规则描述" required>
                <el-input v-model="permissionInfo.description" type="textarea" :rows="3" placeholder="请输入规则描述" />
              </el-form-item>
            </el-form>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="dialogStatus = false">取消</el-button>
                <el-button type="primary" @click="submit">{{ updatePermissionStatus ? '修改' : '创建' }}</el-button>
              </div>
            </template>
          </el-dialog>

          <!-- 绑定角色对话框 -->
          <el-dialog v-model="bindRoleDialogStatus" title="绑定角色" width="500px" destroy-on-close>
            <el-form label-width="90px">
              <el-form-item label="选择角色">
                <el-select v-model="bindRoleInfo" multiple collapse-tags collapse-tags-tooltip placeholder="请选择要绑定的角色"
                  class="full-width">
                  <el-option v-for="item in roleList" :key="item.role_id" :label="item.role_name"
                    :value="item.role_id" />
                </el-select>
              </el-form-item>
            </el-form>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="bindRoleDialogStatus = false">取消</el-button>
                <el-button type="primary" @click="handlebindRoleSubmit">确定</el-button>
              </div>
            </template>
          </el-dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $myFetch } = useNuxtApp()
const { $msg } = useNuxtApp()

const loading = ref(false)
const tableData = ref([])

// 弹窗显示状态
const dialogStatus = ref(false)
const updatePermissionStatus = ref(false)

// 信息
const permissionInfo = ref({
  id: 0,
  name: '',
  path: '',
  description: '',
})

const getData = async () => {
  const res = await $myFetch('PermissionList')
  if (res.code !== 200) {
    return
  }
  tableData.value = res.data
}
onMounted(() => {
  getData()
})

const handleEdit = (index, row) => {
  dialogStatus.value = true
  updatePermissionStatus.value = true

  permissionInfo.value.id = row.id
  permissionInfo.value.name = row.name
  permissionInfo.value.path = row.path
  permissionInfo.value.description = row.description
}

const handleDelete = async (index, row) => {
  loading.value = true

  const res = await $myFetch('DeletePermission', {
    params: {
      id: row.id,
    },
  })

  $msg(res.data, 'success')
  await getData()
  loading.value = false
}

// 抽屉按钮点击事件
const submit = async () => {
  if (
    !permissionInfo.value.name ||
    !permissionInfo.value.path ||
    !permissionInfo.value.description
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  const body = new URLSearchParams()
  body.append('name', permissionInfo.value.name)
  body.append('path', permissionInfo.value.path)
  body.append('description', permissionInfo.value.description)

  const url = ref('')

  // 判断是添加链接还是修改链接
  if (updatePermissionStatus.value === true) {
    url.value = 'UpdatePermission'

    // 判断id是否存在
    if (permissionInfo.value.id === 0) {
      $msg('请填写完整信息', 'error')
      return
    }

    body.append('id', permissionInfo.value.id)
  } else {
    url.value = 'CreatePermission'
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

// 监听弹窗是否关闭
watch(dialogStatus, (newValue) => {
  if (newValue === false) {
    updatePermissionStatus.value = false

    permissionInfo.value.id = 0
    permissionInfo.value.name = ''
    permissionInfo.value.path = ''
    permissionInfo.value.description = ''
  }
})

// 绑定角色
const bindRoleDialogStatus = ref(false)
const bindRoleInfo = ref([])
const roleList = ref({})
const permissionId = ref()

// 规则绑定角色表格按钮
const handleRole = async (index, row) => {
  permissionId.value = row.id
  bindRoleDialogStatus.value = true

  // 向服务器获取角色列表
  const { data: res } = await $myFetch('RoleList')
  roleList.value = res
}

const handlebindRoleSubmit = async () => {
  if (bindRoleInfo.value[0] === undefined) {
    $msg('请选择要绑定的角色', 'error')
    return
  }

  const res = await $myFetch('BindRole', {
    params: {
      info: JSON.stringify(bindRoleInfo.value),
      permissionId: permissionId.value,
    },
  })

  bindRoleDialogStatus.value = false

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }
}

// 监听绑定角色弹窗是否关闭
watch(bindRoleDialogStatus, (newValue) => {
  if (newValue === false) {
    // 将数据恢复默认
    bindRoleInfo.value = []
    permissionId.value = null
  }
})

loading.value = false

useHead({
  title: '权限列表',
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

    .permissionlist-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .permission-card {
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
  .container .right .permissionlist-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .permissionlist-container {
    padding: 12px;
  }
}
</style>
