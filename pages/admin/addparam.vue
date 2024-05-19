<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="addparam_container">
        <div class="cont">
          <div class="form">
            <el-form
              :model="addparameter"
              label-position="top"
              label-width="120px"
            >
              <el-form-item label="接口id">
                <el-input v-model="addparameter.id" />
              </el-form-item>
              <el-form-item label="参数名称">
                <el-input v-model="addparameter.name" placeholder="return" />
              </el-form-item>
              <el-form-item label="可传参数">
                <el-input
                  v-model="addparameter.param"
                  placeholder="json | 302"
                />
              </el-form-item>
              <client-only>
                <el-form-item label="传入位置">
                  <el-select
                    v-model="addparameter.position"
                    placeholder="传入位置"
                  >
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
    </div>
  </div>
</template>

<script setup>
const { $msg, $myFetch } = useNuxtApp()
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
  },
]

watch(
  () => addparameter.id,
  (newValue) => {
    addparameter.id = newValue.replace(/[^\d]/g, '')
  }
)

const onSubmit = async () => {
  if (
    !addparameter.id ||
    !addparameter.name ||
    !addparameter.param ||
    !addparameter.docs ||
    !addparameter.position
  ) {
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

  const res = await $myFetch('ParamCreate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    msg(res.msg, 'success')
  } else {
    msg(res.msg, 'error')
  }

  setTimeout(() => {
    navigateTo('/admin/apilist')
  }, 500)
}

useHead({
  title: '添加参数',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<style lang="less" scoped>
.container {
  display: flex;
  height: 100%;
  .right {
    width: 100%;
    .addparam_container {
      height: 100%;
      padding: 10px;
      background-color: #f7f7f7;
      .cont {
        width: 100%;
        height: 100%;
        padding: 20px 20px;
        background: #fff;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        .form {
          width: 60%;
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container {
    .right {
      .addparam_container {
        .cont {
          .form {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
