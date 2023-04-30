<template>
  <AdminHeader></AdminHeader>
  <div style="display: flex">
    <AdminSidebar></AdminSidebar>
    <div class="addcategory-container">
      <div class="addcategory-form">
        <el-form :model="addcategoryInfo" label-width="120px">
          <el-form-item label="分类名称">
            <el-input
              v-model="addcategoryInfo.name"
              maxlength="32"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="分类别名">
            <el-input
              v-model="addcategoryInfo.alias"
              maxlength="32"
              show-word-limit
            />
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

  const { data: res } = await axios.post('api/category?type=insertCategory&token=' + token.value, bodyValue)
  if (res.code === '200') {
    msg(res.msg, 'success')
    navigateTo('/admin/manage-categories')
  } else {
    msg(res.msg, 'error')
  }
}
</script>

<style  lang="less" scoped>
.addcategory-container {
  width: 100%;
  height: calc(100vh - 65px);
  padding: 20px 40px;
  background-color: #f7f7f7;
  .addcategory-form {
    width: 100%;
    height: 100%;
    padding: 40px 50px;
    background: #fff;
    box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
  }
}
</style>