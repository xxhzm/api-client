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
          @click=";(createRoleStatus = true), (disabled = true)"
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
              <h2>{{ createRoleStatus ? '添加角色' : '修改角色' }}</h2>
            </template>
            <template #default>
              <el-form
                :model="roleInfo"
                label-position="top"
                label-width="120px"
              >
                <el-form-item label="角色ID">
                  <el-input v-model="roleInfo.role_id" :disabled="disabled" />
                </el-form-item>

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
                <el-button @click="createRoleStatus = false">取消</el-button>
                <el-button type="primary" @click="submit">{{
                  disabled ? '修改' : '创建'
                }}</el-button>
              </div>
            </template>
          </el-drawer>
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
const createRoleStatus = ref(true)
const disabled = ref(false)

// 抽屉信息
const roleInfo = ref({
  role_id: 0,
  role_name: '',
  status: '启用',
  description: '',
})

const getData = async () => {
  const {
    data: { value: res },
  } = await useAsyncData('RoleList', () => $myFetch('RoleList'))

  tableData.value = res.data

  tableData.value.forEach((element, k) => {
    if (element.status === '0' || element.status === '启用') {
      tableData.value[k].status = '启用'
    } else {
      tableData.value[k].status = '停用'
    }
  })
}

await getData()

const handleEdit = (index, row) => {
  createRoleStatus.value = false
  disabled.value = true

  roleInfo.value.role_id = row.role_id
  roleInfo.value.role_name = row.role_name
  roleInfo.value.description = row.description
  roleInfo.value.status = row.status
}

const handleDelete = async (index, row) => {
  console.log(index, row)
}

const updateRole = async () => {
  if (
    !roleInfo.value.role_name ||
    !roleInfo.value.description ||
    !roleInfo.value.status
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  const body = new URLSearchParams()
  body.append('roleId', roleInfo.value.role_id)
  body.append('roleName', roleInfo.value.role_name)
  body.append('description', roleInfo.value.description)
  if (roleInfo.value.status === '启用') {
    body.append('status', '0')
  } else {
    body.append('status', '1')
  }

  const res = await $myFetch('UpdateRole', {
    method: 'POST',
    body,
  })

  if (res.code === 200) {
    $msg(res.data, 'success')
  } else {
    $msg(res.data, 'error')
  }

  // 请求新的数据
  const { data: res1 } = await $myFetch('RoleList')

  tableData.value = res1

  tableData.value.forEach((element, k) => {
    if (element.status === '0' || element.status === '启用') {
      tableData.value[k].status = '启用'
    } else {
      tableData.value[k].status = '停用'
    }
  })

  disabled.value = false
}

const createRole = () => {
  console.log(2)
}

// 抽屉按钮点击事件
const submit = () => {
  if (createRoleStatus.value) {
    createRole()
  } else {
    updateRole()
  }
}

// 监听抽屉是否关闭
watch(disabled, (newValue) => {
  if (newValue === false) {
    disabled.value = false
    roleInfo.value.role_id = 0
    roleInfo.value.role_name = ''
    roleInfo.value.description = ''
    roleInfo.value.status = '启用'
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
    .apilist-container {
      width: 100%;
      height: calc(100vh - 65px);
      padding-left: 20px;
      padding-top: 15px;
    }
  }
}
</style>
