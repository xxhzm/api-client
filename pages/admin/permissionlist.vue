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
          @click=";(createPermissionStatus = true), (disabled = true)"
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
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDelete(scope.$index, scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-drawer v-model="disabled" direction="rtl">
            <template #header>
              <h2>{{ createPermissionStatus ? '添加规则' : '修改规则' }}</h2>
            </template>
            <template #default>
              <el-form
                :model="permissionInfo"
                label-position="top"
                label-width="120px"
              >
                <el-form-item label="规则ID" v-if="!createPermissionStatus">
                  <el-input v-model="permissionInfo.id" :disabled="disabled" />
                </el-form-item>

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
                <el-button @click="createPermissionStatus = false"
                  >取消</el-button
                >
                <el-button type="primary" @click="submit">{{
                  disabled ? '修改' : '创建'
                }}</el-button>
              </div>
            </template>
          </el-drawer>

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

// 抽屉显示状态
const createPermissionStatus = ref(true)
const disabled = ref(false)

// 抽屉信息
const permissionInfo = ref({
  id: 0,
  name: '',
  path: '',
  description: '',
})

const getData = async () => {
  const {
    data: { value: res },
  } = await useAsyncData('PermissionList', () => $myFetch('PermissionList'))

  tableData.value = res.data
}

await getData()

const handleEdit = (index, row) => {
  // createPermissionStatus.value = false
  // disabled.value = true
  // roleInfo.value.role_id = row.role_id
  // roleInfo.value.role_name = row.role_name
  // roleInfo.value.description = row.description
  // roleInfo.value.status = row.status
}

const handleDelete = async (index, row) => {
  console.log(index, row)
}

const updateRole = async () => {
  // if (
  //   !roleInfo.value.role_name ||
  //   !roleInfo.value.description ||
  //   !roleInfo.value.status
  // ) {
  //   $msg('请填写内容', 'error')
  //   return false
  // }
  // const body = new URLSearchParams()
  // body.append('roleId', roleInfo.value.role_id)
  // body.append('roleName', roleInfo.value.role_name)
  // body.append('description', roleInfo.value.description)
  // if (roleInfo.value.status === '启用') {
  //   body.append('status', '0')
  // } else {
  //   body.append('status', '1')
  // }
  // const res = await $myFetch('UpdateRole', {
  //   method: 'POST',
  //   body,
  // })
  // if (res.code === 200) {
  //   $msg(res.data, 'success')
  // } else {
  //   $msg(res.data, 'error')
  // }
  // // 请求新的数据
  // const { data: res1 } = await $myFetch('RoleList')
  // tableData.value = res1
  // tableData.value.forEach((element, k) => {
  //   if (element.status === '0' || element.status === '启用') {
  //     tableData.value[k].status = '启用'
  //   } else {
  //     tableData.value[k].status = '停用'
  //   }
  // })
  // disabled.value = false
}

const createRole = async () => {
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

  const res = await $myFetch('CreatePermission', {
    method: 'POST',
    body,
  })

  if (res.code === 200) {
    $msg(res.data, 'success')
  } else {
    $msg(res.data, 'error')
  }
}

// 抽屉按钮点击事件
const submit = () => {
  if (createPermissionStatus.value) {
    createRole()
  } else {
    updateRole()
  }

  disabled.value = false
}

// 监听抽屉是否关闭
watch(disabled, (newValue) => {
  if (newValue === false) {
    permissionInfo.value.id = 0
    permissionInfo.value.name = ''
    permissionInfo.value.path = ''
    permissionInfo.value.description = '启用'
  }
})

// 绑定角色
const bindRoleDialogStatus = ref(false)
const bindRoleInfo = ref({})
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

  const res = await $myFetch(
    'BindRole?info=' +
      JSON.stringify(bindRoleInfo.value) +
      '&permissionId=' +
      permissionId.value
  )

  if (res.code === 200) {
    $msg(res.data, 'success')
  } else {
    $msg(res.data, 'error')
  }
}
loading.value = false
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
