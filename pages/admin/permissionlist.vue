<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="permissionlist-container" v-loading="loading">
        <el-button
          type="primary"
          style="margin-bottom: 20px"
          size="small"
          @click="dialogStatus = true"
          >新增规则</el-button
        >
        <client-only>
          <el-table :data="tableData" style="width: 100%" height="96%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="名称名称" width="150" />
            <el-table-column prop="path" label="规则地址" width="150" />
            <el-table-column prop="description" label="描述" width="150" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button
                  size="small"
                  @click="handleEdit(scope.$index, scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  @click="handleRole(scope.$index, scope.row)"
                >
                  绑定角色
                </el-button>
                <el-popconfirm
                  confirm-button-text="Yes"
                  cancel-button-text="No"
                  title="你确定要删除吗?"
                  @confirm="handleDelete(scope.$index, scope.row)"
                >
                  <template #reference>
                    <el-button size="small" type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>

          <el-dialog
            v-model="dialogStatus"
            :title="updatePermissionStatus ? '修改链接' : '添加链接'"
            width="400"
            center
          >
            <template #default>
              <el-form
                :model="permissionInfo"
                label-position="top"
                label-width="120px"
              >
                <el-form-item label="规则名称">
                  <el-input type="input" v-model="permissionInfo.name" />
                </el-form-item>

                <el-form-item label="规则地址">
                  <el-input v-model="permissionInfo.path" />
                </el-form-item>

                <el-form-item label="规则描述">
                  <el-input v-model="permissionInfo.description" />
                </el-form-item>
              </el-form>
            </template>
            <template #footer>
              <div style="flex: auto">
                <el-button @click="dialogStatus = false">取消</el-button>
                <el-button type="primary" @click="submit">{{
                  updatePermissionStatus ? '修改' : '创建'
                }}</el-button>
              </div>
            </template>
          </el-dialog>

          <!-- 绑定角色对话框 -->
          <el-dialog
            v-model="bindRoleDialogStatus"
            title="绑定角色"
            width="500"
          >
            <el-select
              v-model="bindRoleInfo"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择要绑定的角色"
              style="width: 240px"
            >
              <el-option
                v-for="item in roleList"
                :key="item.role_id"
                :label="item.role_name"
                :value="item.role_id"
              />
            </el-select>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="bindRoleDialogStatus = false"
                  >取消</el-button
                >
                <el-button type="primary" @click="handlebindRoleSubmit">
                  确定
                </el-button>
              </div>
            </template>
          </el-dialog>
        </client-only>
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

  const { data: res } = await $myFetch('DeletePermission', {
    params: {
      id: row.id,
    },
  })

  $msg(res.msg, 'success')
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
</script>

<style lang="less" scoped>
.container {
  display: flex;
  .right {
    width: 100%;
    overflow-x: hidden;
    .permissionlist-container {
      width: 100%;
      height: calc(100vh - 65px);
      padding-left: 20px;
      padding-top: 15px;
    }
  }
}
</style>
