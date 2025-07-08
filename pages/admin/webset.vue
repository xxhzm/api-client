<script setup>
import { Menu, Search } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()
const activeTab = ref('basic')

// 网站设置相关
const websetInfo = ref({
  title: '',
  subheading: '',
  keywords: '',
  description: '',
  create_time: '',
  icp: '',
  gongan: '',
  website_name: '',
  notice: '',
})

// 邮件设置相关
const mailInfo = ref({
  smtp: '',
  user: '',
  password: '',
  setfrom: '',
  port: '',
  name: '',
})

// 支付宝配置相关
const alipayInfo = ref({
  Appid: '',
  PrivateKey: '',
  PublicKey: '',
})

// 新增：微信支付配置相关
const wechatPayInfo = ref({
  apiV3Key: '',
  appid: '',
  mchid: '',
  privateKey: '',
  serialNo: '',
  wxPublicKeyContent: '',
  wxPublicKeyID: '',
})

// AI配置相关
const aiInfo = ref({
  key: '',
  model: '',
  system_message: '',
  url: '',
})

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

const testMail = ref('')

// 接口置顶相关
const searchApiKeyword = ref('')
const topApiList = ref([])
const topApiLoading = ref(false)
const searchLoading = ref(false)
const searchData = ref([])
const searchOldValue = ref('')
const selectedApi = ref(null)
const addLoading = ref(false)

// 获取网站设置
const getWebsetInfo = async () => {
  const res = await $myFetch('Options')
  websetInfo.value = res.data
}

// 获取邮件设置
const getMailInfo = async () => {
  const res = await $myFetch('MailInfo')
  mailInfo.value = res.data
}

// 获取支付宝配置
const getAlipayInfo = async () => {
  const res = await $myFetch('AlipayInfo')
  if (res.code === 200) {
    alipayInfo.value = res.data
  }
}

// 新增：获取微信支付配置
const getWechatPayInfo = async () => {
  const res = await $myFetch('WechatPayInfo')
  if (res.code === 200) {
    wechatPayInfo.value.apiV3Key = res.data.api_v_3_key
    wechatPayInfo.value.appid = res.data.appid
    wechatPayInfo.value.mchid = res.data.mchid
    wechatPayInfo.value.privateKey = res.data.private_key
    wechatPayInfo.value.serialNo = res.data.serial_no
    wechatPayInfo.value.wxPublicKeyContent = res.data.wx_public_key_content
    wechatPayInfo.value.wxPublicKeyID = res.data.wx_public_key_id
  }
}

// 获取AI配置
const getAIInfo = async () => {
  const res = await $myFetch('AIInfo')
  if (res.code === 200) {
    aiInfo.value = res.data
  }
}

// 接口搜索
const querySearchAsync = async (queryString, cb) => {
  if (queryString === '') {
    searchApiKeyword.value = ''
    selectedApi.value = null
    cb([])
    return false
  }

  if (queryString === searchOldValue.value) {
    cb(searchData.value)
    return false
  }

  searchLoading.value = true
  try {
    const res = await $myFetch('ApiSearch', {
      params: {
        keyword: queryString,
      },
    })

    if (res.code !== 200) {
      $msg(res.msg, 'error')
      cb([])
      return false
    }

    // 遍历数据，将 name 改为 value
    res.data = res.data.map((item) => {
      item.value = item.name
      return item
    })

    searchOldValue.value = queryString
    searchData.value = res.data
    cb(searchData.value)
  } catch (error) {
    cb([])
  } finally {
    searchLoading.value = false
  }
}

// 选择接口
const handleApiSelect = (item) => {
  selectedApi.value = item
}

// 获取置顶列表
const getTopApiList = async () => {
  topApiLoading.value = true
  try {
    const res = await $myFetch('ApiTopList')
    if (res.code === 200) {
      topApiList.value = res.data || []
    }
  } catch (error) {
    $msg('获取置顶列表失败', 'error')
  }
  topApiLoading.value = false
}

// 取消置顶
const removeTopApi = async (index, row) => {
  topApiLoading.value = true
  try {
    const res = await $myFetch('RemoveTopApi', {
      method: 'GET',
      params: {
        id: row.id,
      },
    })

    if (res.code === 200) {
      $msg('取消置顶成功', 'success')
      await getTopApiList()
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('操作失败，请重试', 'error')
  }
  topApiLoading.value = false
}

// 添加置顶接口
const handleAddTopApi = async () => {
  if (!selectedApi.value) {
    $msg('请先选择接口', 'warning')
    return
  }

  // 检查是否已经在置顶列表中
  const exists = topApiList.value.some((api) => api.id === selectedApi.value.id)
  if (exists) {
    $msg('该接口已在置顶列表中', 'warning')
    searchApiKeyword.value = ''
    selectedApi.value = null
    return
  }

  addLoading.value = true
  try {
    const res = await $myFetch('ApiTopAdd', {
      method: 'GET',
      params: {
        id: selectedApi.value.id,
      },
    })

    if (res.code === 200) {
      $msg('添加置顶成功', 'success')
      await getTopApiList()
      searchApiKeyword.value = ''
      selectedApi.value = null
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('添加失败，请重试', 'error')
  } finally {
    addLoading.value = false
  }
}

onMounted(() => {
  getWebsetInfo()
  getMailInfo()
  getTopApiList()
  getAlipayInfo()
  getWechatPayInfo()
  getAIInfo()
})

// 提交网站设置
const websetInfoSubmit = async () => {
  if (
    !websetInfo.value.title ||
    !websetInfo.value.subheading ||
    !websetInfo.value.keywords ||
    !websetInfo.value.description ||
    !websetInfo.value.create_time
  ) {
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
  bodyValue.append('gongan', websetInfo.value.gongan)
  bodyValue.append('websiteName', websetInfo.value.website_name)
  bodyValue.append('notice', websetInfo.value.notice)

  const res = await $myFetch('OptionsUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getWebsetInfo()
  }
}

// 提交邮件设置
const mailInfoSubmit = async () => {
  if (
    !mailInfo.value.smtp ||
    !mailInfo.value.user ||
    !mailInfo.value.password ||
    !mailInfo.value.setfrom ||
    !mailInfo.value.port ||
    !mailInfo.value.name
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  const bodyValue = new URLSearchParams()
  bodyValue.append('smtp', mailInfo.value.smtp)
  bodyValue.append('user', mailInfo.value.user)
  bodyValue.append('password', mailInfo.value.password)
  bodyValue.append('setfrom', mailInfo.value.setfrom)
  bodyValue.append('port', mailInfo.value.port)
  bodyValue.append('name', mailInfo.value.name)

  const res = await $myFetch('MailInfoUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getMailInfo()
  }
}

// 提交支付宝配置
const alipayInfoSubmit = async () => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('appid', alipayInfo.value.Appid || '')
  bodyValue.append('privateKey', alipayInfo.value.PrivateKey || '')
  bodyValue.append('publicKey', alipayInfo.value.PublicKey || '')

  const res = await $myFetch('AlipayOptionUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getAlipayInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

// 新增：提交微信支付配置
const wechatPayInfoSubmit = async () => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('apiV3Key', wechatPayInfo.value.apiV3Key || '')
  bodyValue.append('appid', wechatPayInfo.value.appid || '')
  bodyValue.append('mchid', wechatPayInfo.value.mchid || '')
  bodyValue.append('privateKey', wechatPayInfo.value.privateKey || '')
  bodyValue.append('serialNo', wechatPayInfo.value.serialNo || '')
  bodyValue.append(
    'wxPublicKeyContent',
    wechatPayInfo.value.wxPublicKeyContent || ''
  )
  bodyValue.append('wxPublicKeyID', wechatPayInfo.value.wxPublicKeyID || '')

  const res = await $myFetch('WechatPayOptionUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getWechatPayInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

// 提交AI配置
const aiInfoSubmit = async () => {
  const bodyValue = new URLSearchParams()
  bodyValue.append('key', aiInfo.value.key || '')
  bodyValue.append('model', aiInfo.value.model || '')
  bodyValue.append('systemMessage', aiInfo.value.system_message || '')
  bodyValue.append('url', aiInfo.value.url || '')

  const res = await $myFetch('AIOptionUpdate', {
    method: 'POST',
    body: bodyValue,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getAIInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

// 发送测试邮件
const sendTestMail = async () => {
  if (!testMail.value) {
    $msg('请输入测试邮箱', 'error')
    return false
  }

  const res = await $myFetch('SendTestMail', {
    params: {
      mail: testMail.value,
    },
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    testMail.value = ''
  } else {
    $msg(res.msg, 'error')
  }
}

// 禁用未来日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

useHead({
  title: '系统设置',
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
      <div class="webset_container">
        <div class="cont">
          <el-tabs v-model="activeTab" class="setting-tabs">
            <el-tab-pane label="基本设置" name="basic">
              <div class="form">
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
                    <el-date-picker
                      v-model="websetInfo.create_time"
                      type="datetime"
                      placeholder="选择建站时间"
                      format="YYYY/MM/DD HH:mm:ss"
                      value-format="YYYY/MM/DD HH:mm:ss"
                      :disabled-date="disabledDate"
                    />
                  </el-form-item>
                  <el-form-item label="ICP备案号">
                    <el-input v-model="websetInfo.icp" />
                  </el-form-item>
                  <el-form-item label="公安备案号">
                    <el-input v-model="websetInfo.gongan" />
                  </el-form-item>
                  <el-form-item label="网站名称">
                    <el-input v-model="websetInfo.website_name" />
                  </el-form-item>
                  <el-form-item label="通知信息">
                    <el-input
                      v-model="websetInfo.notice"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入通知信息"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="websetInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="邮件设置" name="mail">
              <div class="form">
                <el-form
                  :model="mailInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="SMTP服务器地址">
                    <el-input v-model="mailInfo.smtp" />
                  </el-form-item>
                  <el-form-item label="邮箱账户">
                    <el-input v-model="mailInfo.user" />
                  </el-form-item>
                  <el-form-item label="密码">
                    <el-input
                      v-model="mailInfo.password"
                      type="password"
                      show-password
                    />
                  </el-form-item>
                  <el-form-item label="发件人">
                    <el-input v-model="mailInfo.setfrom" />
                  </el-form-item>
                  <el-form-item label="服务器端口">
                    <el-input v-model="mailInfo.port" />
                  </el-form-item>
                  <el-form-item label="发信名称">
                    <el-input v-model="mailInfo.name" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="mailInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="发信测试" name="test">
              <div class="form">
                <el-form label-position="top" label-width="120px">
                  <el-form-item label="测试邮箱">
                    <el-input v-model="testMail" placeholder="请输入测试邮箱" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="sendTestMail"
                      >发送测试</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="接口置顶" name="topApi">
              <div class="form">
                <el-form label-position="top" label-width="120px">
                  <el-form-item label="搜索接口">
                    <div class="search-input-group">
                      <el-autocomplete
                        v-model="searchApiKeyword"
                        :fetch-suggestions="querySearchAsync"
                        placeholder="请输入接口名称搜索"
                        @select="handleApiSelect"
                        class="search-input"
                        clearable
                        :loading="searchLoading"
                      >
                        <template #suffix>
                          <el-icon class="search-icon"><Search /></el-icon>
                        </template>
                      </el-autocomplete>
                      <el-button
                        type="primary"
                        @click="handleAddTopApi"
                        :disabled="!selectedApi"
                        :loading="addLoading"
                      >
                        添加置顶
                      </el-button>
                    </div>
                  </el-form-item>
                </el-form>

                <div class="top-api-list">
                  <div class="list-header">
                    <h3>置顶接口列表</h3>
                  </div>
                  <el-table
                    :data="topApiList"
                    style="width: 100%"
                    v-loading="topApiLoading"
                  >
                    <el-table-column
                      type="index"
                      label="排序"
                      width="80"
                      align="center"
                    />
                    <el-table-column
                      prop="name"
                      label="接口名称"
                      min-width="150"
                    >
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                      <template #default="scope">
                        <el-button
                          type="danger"
                          link
                          style="padding: 0; margin: 0"
                          @click="removeTopApi(scope.$index, scope.row)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="支付宝配置" name="alipay">
              <div class="form">
                <el-form
                  :model="alipayInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="支付宝Appid">
                    <el-input
                      v-model="alipayInfo.Appid"
                      placeholder="请输入支付宝Appid"
                    />
                  </el-form-item>
                  <el-form-item label="应用私钥">
                    <el-input
                      v-model="alipayInfo.PrivateKey"
                      type="textarea"
                      :rows="5"
                      placeholder="请输入支付宝私钥"
                    />
                  </el-form-item>
                  <el-form-item label="支付宝公钥">
                    <el-input
                      v-model="alipayInfo.PublicKey"
                      type="textarea"
                      :rows="5"
                      placeholder="请输入支付宝公钥"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="alipayInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="微信支付配置" name="wechatpay">
              <div class="form">
                <el-form
                  :model="wechatPayInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="API V3密钥">
                    <el-input
                      v-model="wechatPayInfo.apiV3Key"
                      placeholder="请输入微信支付API V3密钥"
                    />
                  </el-form-item>
                  <el-form-item label="应用ID(AppId)">
                    <el-input
                      v-model="wechatPayInfo.appid"
                      placeholder="请输入微信小程序/公众号AppId"
                    />
                  </el-form-item>
                  <el-form-item label="商户号(MchId)">
                    <el-input
                      v-model="wechatPayInfo.mchid"
                      placeholder="请输入微信支付商户号"
                    />
                  </el-form-item>
                  <el-form-item label="商户私钥">
                    <el-input
                      v-model="wechatPayInfo.privateKey"
                      type="textarea"
                      :rows="8"
                      placeholder="请输入商户API证书私钥（完整的PEM格式）"
                    />
                  </el-form-item>
                  <el-form-item label="证书序列号">
                    <el-input
                      v-model="wechatPayInfo.serialNo"
                      placeholder="请输入商户API证书序列号"
                    />
                  </el-form-item>
                  <el-form-item label="微信公钥内容">
                    <el-input
                      v-model="wechatPayInfo.wxPublicKeyContent"
                      type="textarea"
                      :rows="8"
                      placeholder="请输入微信支付平台公钥内容（完整的PEM格式）"
                    />
                  </el-form-item>
                  <el-form-item label="微信公钥ID">
                    <el-input
                      v-model="wechatPayInfo.wxPublicKeyID"
                      placeholder="请输入微信支付平台公钥ID"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="wechatPayInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="AI配置" name="ai">
              <div class="form">
                <el-form
                  :model="aiInfo"
                  label-position="top"
                  label-width="120px"
                >
                  <el-form-item label="API密钥">
                    <el-input
                      v-model="aiInfo.key"
                      type="password"
                      show-password
                      placeholder="请输入AI服务API密钥"
                    />
                  </el-form-item>
                  <el-form-item label="模型名称">
                    <el-input
                      v-model="aiInfo.model"
                      placeholder="请输入AI模型名称（如：gpt-3.5-turbo）"
                    />
                  </el-form-item>
                  <el-form-item label="系统消息">
                    <el-input
                      v-model="aiInfo.system_message"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入系统提示消息，用于定义AI助手的行为和角色"
                    />
                  </el-form-item>
                  <el-form-item label="API地址">
                    <el-input
                      v-model="aiInfo.url"
                      placeholder="请输入AI服务API地址（如：https://api.openai.com/v1）"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="aiInfoSubmit"
                      >提交</el-button
                    >
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;

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

    .webset_container {
      min-height: 100vh;
      padding: 10px;
      background-color: #f7f7f7;

      .cont {
        width: 100%;
        height: 100%;
        padding: 20px;
        background: #fff;
        box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
        border-radius: 8px;

        .setting-tabs {
          :deep(.el-tabs__header) {
            margin-bottom: 24px;
          }

          :deep(.el-tabs__nav-wrap::after) {
            height: 1px;
          }

          :deep(.el-tabs__item) {
            font-size: 15px;
            padding: 0 24px;
            height: 40px;
            line-height: 40px;

            &.is-active {
              font-weight: 500;
            }
          }
        }

        .form {
          width: 60%;

          :deep(.el-form-item__label) {
            font-weight: 500;
            padding-bottom: 8px;
          }

          :deep(.el-input__wrapper) {
            box-shadow: 0 0 0 1px #dcdfe6 inset;

            &:hover {
              box-shadow: 0 0 0 1px #c0c4cc inset;
            }

            &.is-focus {
              box-shadow: 0 0 0 1px #409eff inset;
            }
          }

          .el-button {
            padding: 12px 24px;
            font-weight: 500;
          }

          :deep(.el-date-editor) {
            width: 100%;

            .el-input__wrapper {
              padding: 0 12px;
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container {
    .right {
      .webset_container {
        .cont {
          .form {
            width: 100%;
          }
        }
      }
    }
  }
}

.top-api-list {
  margin-top: 24px;

  .list-header {
    margin-bottom: 16px;

    h3 {
      font-size: 16px;
      font-weight: 500;
      color: #1f2937;
      margin: 0;
    }
  }
}

.search-input-group {
  display: flex;
  gap: 12px;
  align-items: flex-start;

  .search-input {
    flex: 1;
  }

  .el-button {
    margin-top: 1px;
  }
}
</style>
