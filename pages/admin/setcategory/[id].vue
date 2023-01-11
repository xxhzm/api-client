<template>
  <AdminHeader></AdminHeader>
  <div style="display: flex">
    <AdminSidebar></AdminSidebar>
    <div class="setcategory-container">
      <div class="setcategory-form">
        <el-form :model="setcategoryInfo" label-width="120px">
          <el-form-item label="接口名称">
            <el-input
              v-model="setcategoryInfo.name"
              maxlength="25"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="接口别名">
            <el-input
              v-model="setcategoryInfo.alias"
              maxlength="25"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="默认分类">
            <el-switch v-model="setcategoryInfo.default" />
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
import axios from "axios"
import { ElNotification } from 'element-plus'

const route = useRoute()

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

const setcategoryInfo = ref({
  name: '',
  alias: '',
  default: true
})

const { data: res } = await axios.get('api/category?type=categoryId', {
  params: {
    id: route.params.id
  }
})

setcategoryInfo.value = res.data[0]

if (res.data[0].default === 1) {
  setcategoryInfo.value.default = true
} else {
  setcategoryInfo.value.default = false
}


const onSubmit = async () => {
  if (!setcategoryInfo.value.name || !setcategoryInfo.value.alias) {
    msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('id', route.params.id)
  bodyValue.append('name', setcategoryInfo.value.name)
  bodyValue.append('alias', setcategoryInfo.value.alias)

  if (setcategoryInfo.value.default === true) {
    bodyValue.append('default', 1)
  }

  const { data: res } = await axios.post('api/category?type=updateCategory&token=' + token.value, bodyValue)
  if (res.code === '200') {
    msg(res.msg, 'success')
    navigateTo('/admin/manage-categories')
  } else {
    msg(res.msg, 'error')
  }
}
</script>

<style  lang="less" scoped>
.setcategory-container {
  width: 100%;
  height: calc(100vh - 65px);
  padding-left: 20px;
  padding-top: 35px;
  .setcategory-form {
    width: 90%;
    height: 100%;
  }
}
</style>