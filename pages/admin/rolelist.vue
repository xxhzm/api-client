<script setup>
import { UserFilled } from '@element-plus/icons-vue'
definePageMeta({
  layout: 'admin',
})
const { $myFetch } = useNuxtApp()
const { $msg } = useNuxtApp()

onMounted(() => {
  //
})

const loading = ref(false)
const tableData = ref([])

// 弹窗显示状态
const dialogStatus = ref(false)
const updateRoleStatus = ref(false)

// 弹窗信息
const roleInfo = ref({
  role_id: 0,
  role_name: '',
  status: '启用',
  description: '',
})

const getData = async () => {
  const res = await $myFetch('RoleList')

  if (res.code !== 200) {
    return
  }

  tableData.value = res.data

  tableData.value.forEach((element, k) => {
    if (element.status === '0' || element.status === '启用') {
      tableData.value[k].status = '启用'
    } else {
      tableData.value[k].status = '停用'
    }
  })
}

onMounted(async () => {
  await getData()
})

const handleEdit = (index, row) => {
  dialogStatus.value = true
  updateRoleStatus.value = true

  roleInfo.value.role_id = row.role_id
  roleInfo.value.role_name = row.role_name
  roleInfo.value.description = row.description
  roleInfo.value.status = row.status
}

const handleDelete = async (index, row) => {
  loading.value = true

  const res = await $myFetch('DeleteRole', {
    params: {
      id: row.role_id,
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

// 弹窗按钮点击事件
const submit = async () => {
  if (
    !roleInfo.value.role_name ||
    !roleInfo.value.description ||
    !roleInfo.value.status
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  const body = new URLSearchParams()
  body.append('roleName', roleInfo.value.role_name)
  body.append('description', roleInfo.value.description)
  if (roleInfo.value.status === '启用') {
    body.append('status', '0')
  } else {
    body.append('status', '1')
  }

  const url = ref('')

  // 判断是添加还是修改
  if (updateRoleStatus.value === true) {
    url.value = 'UpdateRole'

    // 判断id是否存在
    if (roleInfo.value.id === 0) {
      $msg('请填写完整信息', 'error')
      return
    }

    body.append('roleId', roleInfo.value.role_id)
  } else {
    url.value = 'CreateRole'
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
    updateRoleStatus.value = false

    roleInfo.value.role_id = 0
    roleInfo.value.role_name = ''
    roleInfo.value.description = ''
    roleInfo.value.status = '启用'
  }
})

// 查询角色拥有的权限
const userBindRoleListStatus = ref(false)
const userBindRoleList = ref({})

const handleRoleBindPermissionList = async (index, row) => {
  loading.value = true

  const res = await $myFetch('RoleBindPermissionList', {
    params: {
      id: row.role_id,
    },
  })

  if (typeof res.data === 'string') {
    userBindRoleList.value = []
  } else {
    userBindRoleList.value = res.data
  }

  userBindRoleListStatus.value = true
  loading.value = false
}

loading.value = false

useHead({
  title: '角色列表',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="rolelist-container" v-loading="loading">
    <div class="role-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon">
            <UserFilled />
          </el-icon>
          <span class="title">角色列表</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="dialogStatus = true">
            <span>新增角色</span>
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <client-only>
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="role_id" label="ID" width="80" />
            <el-table-column prop="role_name" label="角色名称" width="150" />
            <el-table-column
              prop="description"
              label="描述"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === '启用' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column width="200" fixed="right">
              <template #default="scope">
                <div class="table-actions">
                  <el-button
                    type="primary"
                    link
                    @click="handleEdit(scope.$index, scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="info"
                    link
                    @click="
                      handleRoleBindPermissionList(scope.$index, scope.row)
                    "
                  >
                    权限
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
          </el-table>
        </client-only>
      </div>

      <!-- 新增/编辑角色对话框 -->
      <el-dialog
        v-model="dialogStatus"
        :title="updateRoleStatus ? '修改角色' : '新增角色'"
        width="500px"
        destroy-on-close
      >
        <el-form :model="roleInfo" label-width="90px">
          <el-form-item label="角色名称" required>
            <el-input
              v-model="roleInfo.role_name"
              placeholder="请输入角色名称"
            />
          </el-form-item>
          <el-form-item label="角色描述" required>
            <el-input
              v-model="roleInfo.description"
              type="textarea"
              :rows="3"
              placeholder="请输入角色描述"
            />
          </el-form-item>
          <el-form-item label="角色状态" required>
            <el-select
              v-model="roleInfo.status"
              placeholder="请选择角色状态"
              class="full-width"
            >
              <el-option label="启用" value="启用" />
              <el-option label="停用" value="停用" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogStatus = false">取消</el-button>
            <el-button type="primary" @click="submit">{{
              updateRoleStatus ? '修改' : '创建'
            }}</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 权限列表对话框 -->
      <el-dialog
        v-model="userBindRoleListStatus"
        title="权限列表"
        width="750px"
        destroy-on-close
      >
        <el-table :data="userBindRoleList">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="权限名称" width="200" />
          <el-table-column
            prop="path"
            label="权限路径"
            width="200"
            show-overflow-tooltip
          />
          <el-table-column
            prop="description"
            label="权限描述"
            min-width="200"
            show-overflow-tooltip
          />
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="less" scoped>
.rolelist-container {
  position: relative;
  min-height: 100vh;
  padding: 24px;
  display: flex;
  justify-content: center;

  .role-card {
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
  .container .right .rolelist-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .rolelist-container {
    padding: 12px;
  }
}
</style>
