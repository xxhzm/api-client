<script setup>
import { Setting, InfoFilled, Menu } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()
const msg = $msg

// 控制左侧边栏显示隐藏
// 获取页面宽度
const screenWidth = ref(0)
const isSidebarShow = ref(true)
const iscontrolShow = ref(false)
const isoverlay = ref(false)
onMounted(() => {
  screenWidth.value = document.body.clientWidth
  document.body.style.overflow = ''

  if (screenWidth.value < 768) {
    iscontrolShow.value = true
    isSidebarShow.value = false
  }
})

const handleSidebarShow = () => {
  isSidebarShow.value = !isSidebarShow.value
  iscontrolShow.value = !iscontrolShow.value
  isoverlay.value = !isoverlay.value
  // 禁止页面滑动
  if (isSidebarShow.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const searchData = ref({})
const searchOldValue = ref('')

const addparameter = reactive({
  id: 0,
  apiName: '',
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

// 搜索
const querySearchAsync = async (queryString, cb) => {
  if (queryString === '') {
    addparameter.apiName = ''
    cb([])
    return false
  }

  if (queryString === searchOldValue.value) {
    cb(searchData.value)
    return false
  }
  const res = await $myFetch('ApiSearch', {
    params: {
      keyword: queryString,
    },
  })

  if (res.code !== 200) {
    $msg(res.msg, 'error')
  }

  // 遍历数据，将 name 改为 value
  res.data = res.data.map((item) => {
    item.value = item.name
    delete item.name
    return item
  })

  searchOldValue.value = queryString
  searchData.value = res.data
  cb(searchData.value)
}

const handleSearchSelect = (item) => {
  addparameter.id = item.id
}

useHead({
  title: '添加参数',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="container">
    <AdminSidebar v-show="isSidebarShow"></AdminSidebar>

    <div class="right">
      <!-- 遮罩层 -->
      <div class="overlay" v-show="isoverlay" @click="handleSidebarShow"></div>
      <!-- 侧边栏控制按钮 -->
      <div class="control-sidebar" v-show="iscontrolShow">
        <el-icon @click="handleSidebarShow"><Menu /></el-icon>
      </div>
      <AdminHeader></AdminHeader>
      <div class="addparam_container">
        <div class="param-card">
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Setting />
              </el-icon>
              <span class="title">参数配置</span>
            </div>
            <div class="header-right">
              <el-tag size="small" effect="plain" type="info">必填项</el-tag>
            </div>
          </div>

          <div class="form">
            <el-form
              :model="addparameter"
              label-position="top"
              label-width="120px"
            >
              <el-form-item label="接口名称">
                <el-autocomplete
                  v-model="addparameter.apiName"
                  :fetch-suggestions="querySearchAsync"
                  placeholder="请输入接口名称"
                  @select="handleSearchSelect"
                  class="full-width"
                />
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
                    class="full-width"
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
                  type="textarea"
                  :rows="3"
                  placeholder="返回json数据 | 重定义到图片"
                />
              </el-form-item>
              <el-form-item label="是否必传">
                <el-switch v-model="addparameter.required" />
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="param-footer">
          <div class="footer-content">
            <div class="left-info">
              <el-icon>
                <InfoFilled />
              </el-icon>
              <span>请仔细检查信息后再提交</span>
            </div>
            <div class="right-buttons">
              <el-button type="primary" size="large" @click="onSubmit"
                >提交</el-button
              >
              <el-button
                plain
                size="large"
                @click="navigateTo('/admin/apilist')"
                >取消</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  background: #f5f7fa;

  .right {
    width: 100%;
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 998;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }
    .control-sidebar {
      position: absolute;
      width: 35px;
      height: 35px;
      top: 10px;
      left: 10px;
      z-index: 9999;
      text-align: center;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      .el-icon {
        margin-top: 10px;
        font-size: 16px;
      }
    }
    .addparam_container {
      position: relative;
      min-height: 100vh;
      padding: 24px 32px;
      padding-bottom: 80px;

      .param-card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
        border: 1px solid #eaecf0;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #eaecf0;

          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;

            .icon {
              font-size: 20px;
              color: #4b5563;
            }

            .title {
              font-size: 16px;
              font-weight: 600;
              color: #1a1f36;
            }
          }
        }

        .form {
          width: 60%;
          padding: 24px;

          :deep(.el-form-item) {
            margin-bottom: 24px;

            &:last-child {
              margin-bottom: 0;
            }

            .el-form-item__label {
              font-weight: 500;
              color: #374151;
              padding-bottom: 8px;
            }

            .el-input__wrapper,
            .el-textarea__inner {
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              border: 1px solid #d1d5db;
              border-radius: 6px;

              &:hover {
                border-color: #9ca3af;
              }

              &.is-focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
              }
            }

            .full-width {
              width: 100%;
            }
          }
        }
      }

      .param-footer {
        position: fixed;
        bottom: 0;
        right: 0;
        width: calc(100% - 200px);
        background: #fff;
        border-top: 1px solid #eaecf0;
        padding: 16px 32px;
        z-index: 10;

        .footer-content {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 24px;

          .left-info {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #6b7280;
            font-size: 14px;
            margin-right: auto;

            .el-icon {
              color: #9ca3af;
            }
          }

          .right-buttons {
            display: flex;
            gap: 12px;

            .el-button {
              padding: 12px 24px;
              font-weight: 500;
              font-size: 14px;
              min-width: 88px;

              &.el-button--primary {
                background: #3b82f6;
                border: none;

                &:hover {
                  background: #2563eb;
                }
              }
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container .right .addparam_container {
    padding: 20px;

    .param-card .form {
      width: 100%;
    }
  }
}

@media screen and (max-width: 768px) {
  .container .right .addparam_container {
    padding: 16px;
  }
}
</style>
