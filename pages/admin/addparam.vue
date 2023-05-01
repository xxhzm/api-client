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
            <el-input v-model="addparameter.name" placeholder="return" />
          </el-form-item>
          <el-form-item label="可传参数">
            <el-input v-model="addparameter.param" placeholder="json | 302" />
          </el-form-item>
          <client-only>
            <el-form-item label="传入位置">
              <el-select v-model="addparameter.position" placeholder="传入位置">
                <el-option
                  v-for="item in position"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </client-only>
          <el-form-item label="参数描述">
            <el-input
              v-model="addparameter.docs"
              placeholder="返回json数据 | 重定义到图片"
            />
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

const { $msg } = useNuxtApp()
const msg = $msg

const addparameter = reactive({
  id: 0,
  name: '',
  param: '',
  position: '',
  docs: '',
  required: true,
})

const position = [
  {
    value: 'query',
    label: 'query',
  },
  {
    value: 'body',
    label: 'body',
  }
]

watch(() => addparameter.id, (newValue) => {
  addparameter.id = newValue.replace(/[^\d]/g, "")
})


const onSubmit = async () => {
  if (!addparameter.id || !addparameter.name || !addparameter.param || !addparameter.docs || !addparameter.position) {
    msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('aid', addparameter.id)
  bodyValue.append('name', addparameter.name)
  bodyValue.append('param', addparameter.param)
  bodyValue.append('position', addparameter.position)
  bodyValue.append('docs', addparameter.docs)

  if (addparameter.required) {
    bodyValue.append('required', 1)
  } else {
    bodyValue.append('required', 2)
  }

  const { data: res } = await axios.post('ParamCreate', bodyValue)

  if (res.code === 200) {
    msg(res.msg, 'success')
    navigateTo('/admin/apilist')
  }
}
</script>

<style  lang="less" scoped>
.addapi-container {
  overflow-y: hidden;
  width: 100%;
  height: calc(100vh - 65px);
  padding: 20px 40px;
  background-color: #f7f7f7;
  .addapi-form {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    padding: 40px 50px;
    background: #fff;
    box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
  }
}
</style>