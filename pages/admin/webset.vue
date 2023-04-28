<template>
  <AdminHeader></AdminHeader>
  <div style="display: flex">
    <AdminSidebar></AdminSidebar>
    <div class="webset-container">
      <div class="webset-form">
        <el-form :model="websetInfo" label-width="120px">
          <el-form-item label="网站标题">
            <el-input v-model="websetInfo.title" />
          </el-form-item>
          <el-form-item label="网站副标题">
            <el-input v-model="websetInfo.subheading" />
          </el-form-item>
          <el-form-item label="网站关键词">
            <el-input v-model="websetInfo.keywords" />
          </el-form-item>
          <el-form-item label="网站描述">
            <el-input v-model="websetInfo.description" />
          </el-form-item>
          <el-form-item label="建站时间">
            <el-input v-model="websetInfo.create_time" />
          </el-form-item>
          <el-form-item label="ICP备案号">
            <el-input v-model="websetInfo.icp" />
          </el-form-item>
          <el-form-item label="公安备案号">
            <el-input v-model="websetInfo.gongan" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'

definePageMeta({
  middleware: ["admin"],
})

const { $msg } = useNuxtApp()

const websetInfo = ref({
  title: '',
  subheading: '',
  keywords: '',
  description: '',
  create_time: '',
  icp: '',
  gongan: ''
})

const getData = async () => {
  const { data: res } = await axios.get('Options')
  websetInfo.value = res.data
}

onMounted(() => {
  getData()
})

const onSubmit = async () => {
  if (!websetInfo.value.title || !websetInfo.value.subheading || !websetInfo.value.keywords || !websetInfo.value.description || !websetInfo.value.create_time) {
    $msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('title', websetInfo.value.title)
  bodyValue.append('subheading', websetInfo.value.subheading)
  bodyValue.append('keywords', websetInfo.value.keywords)
  bodyValue.append('description', websetInfo.value.description)
  bodyValue.append('createTime', websetInfo.value.create_time)
  bodyValue.append('icp', websetInfo.value.icp)
  bodyValue.append('gongAn', websetInfo.value.gongan)

  const { data: res } = await axios.post('OptionsUpdate', bodyValue)
  if (res.code === 200) {
    $msg(res.msg, 'success')

    getData()
  }
}

</script>

<style  lang="less" scoped>
.webset-container {
  width: 100%;
  height: calc(100vh - 65px);
  padding: 20px 40px;
  background-color: #f7f7f7;
  .webset-form {
    width: 100%;
    height: 100%;
    padding: 40px 50px;
    background: #fff;
    box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
  }
}
</style>