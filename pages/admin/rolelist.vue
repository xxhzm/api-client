<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="apilist-container" v-loading="loading">
        <el-button
          type="primary"
          style="margin-bottom: 20px"
          size="small"
          @click="dialogStatus = true"
          >新增角色</el-button
        >
        <client-only>
          <el-table :data="tableData" style="width: 100%" height="96%">
            <el-table-column prop="role_id" label="id" width="80" />
            <el-table-column prop="role_name" label="接口名称" width="150" />
            <el-table-column prop="description" label="描述" width="150" />
            <el-table-column prop="status" label="状态" width="100" />
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
                  type="info"
                  @click="handleRoleBindPermissionList(scope.$index, scope.row)"
                  >拥有权限</el-button
                >
                <el-popconfirm
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                  title="您确定要删除吗?"
                  width="160px"
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
            :title="updateRoleStatus ? '修改角色' : '添加角色'"
            width="400"
            center
          >
            <template #default>
              <el-form
                :model="roleInfo"
                label-position="top"
                label-width="120px"
              >
                <el-form-item label="角色名称">
                  <el-input type="input" v-model="roleInfo.role_name" />
                </el-form-item>

                <el-form-item label="角色描述">
                  <el-input v-model="roleInfo.description" />
                </el-form-item>

                <el-form-item label="角色状态">
                  <el-select v-model="roleInfo.status" placeholder="请选择">
                    <el-option label="启用" value="启用" />
                    <el-option label="停用" value="停用" />
                  </el-select>
                </el-form-item>
              </el-form>
            </template>
            <template #footer>
              <div style="flex: auto">
                <el-button @click="dialogStatus = false">取消</el-button>
                <el-button type="primary" @click="submit">{{
                  updateRoleStatus ? '修改' : '创建'
                }}</el-button>
              </div>
            </template>
          </el-dialog>

          <!-- 查看角色拥有权限弹窗 -->
          <el-dialog
            v-model="userBindRoleListStatus"
            title="权限列表"
            width="750"
            center
            destroy-on-close
          >
            <el-table :data="userBindRoleList">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="权限名称" width="200" />
              <el-table-column prop="path" label="权限路径" width="200" />
              <el-table-column
                prop="description"
                label="权限描述"
                width="200"
              />
            </el-table>
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

<style lang="less" scoped>
.container {
  display: flex;
  .right {
    width: 100%;
    overflow-x: hidden;
    .apilist-container {
      width: 100%;
      height: calc(100vh - 65px);
      padding-left: 20px;
      padding-top: 15px;
    }
  }
}
</style>
