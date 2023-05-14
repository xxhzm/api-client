<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="webset-container">
        <div class="webset-cont">
          <div class="webset-form">
            <el-tabs v-model="activeName">
              <el-tab-pane label="基础设置" name="first">
                <el-form
                  :model="websetInfo"
                  label-position="top"
                  label-width="120px"
                >
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
              </el-tab-pane>

              <el-tab-pane label="邮件设置" name="second">
                <el-form
                  :model="websetInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="网站标题">
                    <el-input v-model="websetInfo.title" />
                  </el-form-item>
                  <!-- <el-form-item label="网站副标题">
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
                  </el-form-item> -->
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'

const { $msg } = useNuxtApp()

const activeName = ref('first')

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
.container {
  display: flex;
  .right {
    width: 100%;
    .webset-container {
      height: 100%;
      padding: 10px;
      background-color: #f7f7f7;
      .webset-cont {
        width: 100%;
        height: 100%;
        padding: 20px 20px;
        background: #fff;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        .webset-form {
          width: 60%;
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container {
    .right {
      .webset-container {
        .webset-cont {
          .webset-form {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>