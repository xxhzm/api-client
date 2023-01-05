<template>
  <AdminHeader></AdminHeader>
  <div style="display: flex">
    <AdminSidebar></AdminSidebar>
    <div class="addapi-container">
      <div class="addapi-form">
        <el-form :model="addparameter" label-width="120px">
          <el-form-item label="接口id">
            <el-input v-model="addparameter.id" />
          </el-form-item>
          <el-form-item label="参数名称">
            <el-input v-model="addparameter.name" />
          </el-form-item>
          <el-form-item label="参数描述">
            <el-input v-model="addparameter.docs" />
          </el-form-item>
          <el-form-item label="是否必传">
            <el-switch v-model="addparameter.required" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ElNotification } from 'element-plus'

const token = useCookie('token')

definePageMeta({
  middleware: ["admin"],
})


const msg = (message, type) => {
  ElNotification({
    message,
    type,
  })
}

const addparameter = reactive({
  id: 0,
  name: '',
  docs: '',
  required: true,
})

watch(() => addparameter.id, (newValue) => {
  addparameter.id = newValue.replace(/[^\d]/g, "")
})


const onSubmit = async () => {
  if (!addparameter.id || !addparameter.name || !addparameter.docs) {
    msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('aid', addparameter.id)
  bodyValue.append('name', addparameter.name)
  bodyValue.append('docs', addparameter.docs)

  if (!addparameter.required) {
    bodyValue.append('required', 0)
  }

  const { data: res } = await axios.post('api/addparameter?token=' + token.value, bodyValue)

  if (res.code === '200') {
    msg(res.msg, 'success')
    navigateTo('/admin/apilist')
  } else {
    msg(res.msg, 'error')
  }
}
</script>

<style  lang="less" scoped>
.addapi-container {
  width: 100%;
  height: calc(100vh - 65px);
  padding: 20px 40px;
  background-color: #f7f7f7;
  .addapi-form {
    width: 100%;
    height: 100%;
    padding: 40px 50px;
    background: #fff;
    box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
  }
}
</style>