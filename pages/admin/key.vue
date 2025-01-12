<template>
  <div class="container">
    <AdminSidebar></AdminSidebar>
    <div class="right">
      <AdminHeader></AdminHeader>
      <div class="key-container">
        <div class="cont">
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon"><Key /></el-icon>
              <span class="title">API密钥管理</span>
            </div>
          </div>

          <div class="key-info">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-card class="key-card" shadow="never">
                  <div class="key-content">
                    <div class="key-header">
                      <div class="key-title">
                        <el-icon><Key /></el-icon>
                        <span>API Access Key</span>
                      </div>
                    </div>
                    <div class="key-body">
                      <div class="key-display">
                        <span class="key-value">{{ keyInfo.key }}</span>
                      </div>
                      <div class="key-actions">
                        <el-tooltip content="复制密钥" placement="top">
                          <el-button
                            type="primary"
                            @click="copyKey"
                            :icon="Document"
                            circle
                          ></el-button>
                        </el-tooltip>
                        <el-tooltip content="重新生成密钥" placement="top">
                          <el-button
                            type="danger"
                            @click="refreshKey"
                            :icon="Refresh"
                            circle
                          ></el-button>
                        </el-tooltip>
                      </div>
                    </div>
                    <div class="key-footer">
                      <el-alert type="warning" :closable="false" show-icon>
                        <template #title>
                          请妥善保管您的密钥，泄露可能导致安全风险
                        </template>
                      </el-alert>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <div class="security-settings">
            <el-alert type="warning" :closable="false" show-icon>
              <template #title>
                注意：IP白名单优先级最高，其次是Referer，最后为Sign签名
              </template>
            </el-alert>
            <el-tabs
              v-model="activeTab"
              class="setting-tabs"
              style="margin-top: 20px"
            >
              <el-tab-pane label="Referer限制" name="referer">
                <div class="form">
                  <el-form :model="securityInfo" label-position="top">
                    <el-form-item label="Referer白名单">
                      <el-input
                        v-model="securityInfo.allowed_referers"
                        type="textarea"
                        :rows="4"
                        placeholder="使用英文逗号分隔，例如：example.com,example1.com"
                      />
                      <div class="form-tip">留空表示不限制Referer</div>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>

              <el-tab-pane label="IP白名单" name="ip">
                <div class="form">
                  <el-form :model="securityInfo" label-position="top">
                    <el-form-item label="IP白名单">
                      <el-input
                        v-model="securityInfo.allowed_ips"
                        type="textarea"
                        :rows="4"
                        placeholder="使用英文逗号分隔，例如：192.168.1.1,192.168.1.2"
                      />
                      <div class="form-tip">留空表示不限制IP</div>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>

              <el-tab-pane label="Sign签名" name="sign">
                <div class="form">
                  <el-form :model="securityInfo" label-position="top">
                    <el-form-item label="是否启用签名">
                      <div class="sign-header">
                        <el-switch v-model="securityInfo.signed" />
                        <el-button type="info" link @click="showSignMethod">
                          <el-icon><InfoFilled /></el-icon>
                          查看签名方法
                        </el-button>
                      </div>
                    </el-form-item>
                    <el-form-item label="签名密钥" v-if="securityInfo.signed">
                      <el-input v-model="securityInfo.appid" disabled />
                      <div class="form-tip">
                        签名密钥用于生成API调用签名，请妥善保管
                      </div>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>
            </el-tabs>
            <el-button type="primary" @click="saveSecurityInfo"
              >保存设置</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>

  <el-dialog
    v-model="signMethodVisible"
    title="签名方法说明"
    width="600px"
    :close-on-click-modal="false"
  >
    <div class="sign-method">
      <h3>签名步骤</h3>
      <ol>
        <li>在请求参数中必须携带key参数(即您的API密钥)</li>
        <li>将所有参数按照参数名ASCII码从小到大排序（字典序）</li>
        <li>将排序后的参数按照 参数名=参数值 的格式拼接，并用 & 连接</li>
        <li>在参数字符串后直接拼接上您的签名密钥（appid）</li>
        <li>对拼接后的字符串进行MD5加密（32位小写）</li>
        <li>将得到的MD5值作为sign参数添加到请求头中(Header)</li>
      </ol>
      <h3>示例</h3>
      <div class="example">
        <p>假设您的请求参数为：</p>
        <pre>name=张三&age=18&time=1642322222&key={{ keyInfo.key }}</pre>
        <p>您的签名密钥为：</p>
        <pre>{{ securityInfo.appid }}</pre>
        <p>签名步骤：</p>
        <ol>
          <li>
            参数按ASCII码排序：age=18&key={{
              keyInfo.key
            }}&name=张三&time=1642322222
          </li>
          <li>
            拼接密钥：age=18&key={{ keyInfo.key }}&name=张三&time=1642322222{{
              securityInfo.appid
            }}
          </li>
          <li>
            MD5加密：md5("age=18&key={{
              keyInfo.key
            }}&name=张三&time=1642322222{{ securityInfo.appid }}")
          </li>
          <li>添加到请求头：在请求头中添加 sign: 计算得到的md5值</li>
        </ol>
        <p>最终请求：</p>
        <pre>
请求参数：name=张三&age=18&time=1642322222&key={{ keyInfo.key }}
请求头：sign: 计算得到的md5值</pre
        >
        <div class="form-tip">注：最终请求参数的顺序可以不按ASCII排序</div>
      </div>

      <div class="notice">
        <el-alert type="warning" :closable="false">
          <template #title>
            1. 请勿在原始请求参数中包含签名秘钥；<br />2.
            签名计算时必须按ASCII码排序；<br />3.
            开启签名后，必须在请求参数中携带key参数；<br />4.
            sign参数必须放在请求头(Header)中
          </template>
        </el-alert>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { Key, Refresh, Document, InfoFilled } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

const activeTab = ref('referer')
const username = useCookie('username')
const token = useCookie('token')

// Key信息
const keyInfo = ref({
  key: '',
})

// 安全设置信息
const securityInfo = ref({
  referer: '',
  ip: '',
  signed: false,
  appid: '',
})

const signMethodVisible = ref(false)

// 获取Key信息
const getKeyInfo = async () => {
  if (username.value && token.value) {
    const res = await $myFetch('GetUserKey', {
      params: {
        username: username.value,
      },
    })

    if (res.code === 200) {
      keyInfo.value.key = res.data.access_key
    } else {
      $msg(res.msg, 'error')
    }
  }
}

// 获取安全设置
const getSecurityInfo = async () => {
  const res = await $myFetch('GetKeySecurity', {
    params: {
      username: username.value,
    },
  })

  if (res.code === 200) {
    if (res.data.signed == 1) {
      res.data.signed = true
    } else {
      res.data.signed = false
    }

    securityInfo.value = res.data
    console.log(securityInfo.value)
  }
}

// 刷新Key
const refreshKey = async () => {
  if (!username.value || !token.value) {
    $msg('请先登录', 'error')
    return
  }

  const res = await $myFetch('RefreshKey', {
    method: 'post',
    params: {
      username: username.value,
      userKey: keyInfo.value.key,
    },
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    getKeyInfo()
    getSecurityInfo()
  } else {
    $msg(res.msg, 'error')
  }
}

// 复制Key
const copyKey = () => {
  const textArea = document.createElement('textarea')
  textArea.value = keyInfo.value.key
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)

  $msg('复制成功', 'success')
}

// 保存Referer设置
const saveSecurityInfo = async () => {
  const res = await $myFetch('UpdateKeySecurity', {
    method: 'POST',
    params: {
      username: username.value,
      referer: securityInfo.value.allowed_referers || '',
      ip: securityInfo.value.allowed_ips || '',
      signed: securityInfo.value.signed ? 1 : 0,
    },
  })

  if (res.code === 200) {
    $msg('保存成功', 'success')
  } else {
    $msg(res.msg, 'error')
  }
}

const showSignMethod = () => {
  signMethodVisible.value = true
}

onMounted(() => {
  getKeyInfo()
  getSecurityInfo()
})

useHead({
  title: 'API密钥管理',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<style lang="less" scoped>
.container {
  display: flex;

  .right {
    width: 100%;

    .key-container {
      min-height: 100vh;
      padding: 10px;
      background-color: #f8fafc;

      .cont {
        width: 100%;
        height: 100%;
        padding: 20px;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        border-radius: 8px;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #edf1f7;

          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;

            .icon {
              font-size: 20px;
              color: #4096ff;
            }

            .title {
              font-size: 16px;
              font-weight: 600;
              color: #2e3033;
            }
          }
        }

        .key-info {
          margin-bottom: 30px;

          .key-card {
            background: #fff;
            border: 1px solid #edf1f7;
            border-radius: 8px;
            overflow: hidden;

            :deep(.el-card__body) {
              padding: 0;
            }
          }

          .key-content {
            .key-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 20px 24px;
              background: #fafbfc;
              border-bottom: 1px solid #edf1f7;

              .key-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 15px;
                font-weight: 500;
                color: #2e3033;

                .el-icon {
                  font-size: 18px;
                  color: #4096ff;
                }
              }
            }

            .key-body {
              padding: 24px;
              background: #fff;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 20px;

              .key-display {
                flex: 1;
                background: #fafbfc;
                border: 1px solid #edf1f7;
                border-radius: 6px;
                padding: 12px 16px;

                .key-value {
                  font-family: 'Roboto Mono', monospace;
                  font-size: 14px;
                  color: #5a6478;
                  letter-spacing: 0.5px;
                }
              }

              .key-actions {
                display: flex;
                gap: 12px;

                :deep(.el-button) {
                  &.el-button--primary {
                    background-color: #4096ff;
                    border-color: #4096ff;
                    &:hover {
                      background-color: #1677ff;
                      border-color: #1677ff;
                    }
                  }
                  &.el-button--danger {
                    background-color: #ff4d4f;
                    border-color: #ff4d4f;
                    &:hover {
                      background-color: #f5222d;
                      border-color: #f5222d;
                    }
                  }
                }
              }
            }

            .key-footer {
              padding: 16px 24px;
              background: #fff;
              border-top: 1px solid #edf1f7;

              :deep(.el-alert) {
                padding: 12px 16px;
                border-radius: 6px;
                background-color: #fff9f0;
                border: 1px solid #ffe7ba;

                .el-alert__title {
                  font-size: 13px;
                  color: #d48806;
                }

                .el-alert__icon {
                  color: #faad14;
                }
              }
            }
          }
        }

        .security-settings {
          :deep(.el-tabs__nav-wrap::after) {
            height: 1px;
            background-color: #edf1f7;
          }

          :deep(.el-tabs__item) {
            font-size: 14px;
            padding: 0 24px;
            height: 40px;
            line-height: 40px;
            color: #5a6478;

            &.is-active {
              font-weight: 500;
              color: #4096ff;
            }
          }

          :deep(.el-tabs__active-bar) {
            background-color: #4096ff;
          }

          .form {
            max-width: 600px;
            margin-top: 20px;

            :deep(.el-form-item__label) {
              font-weight: 500;
              padding-bottom: 8px;
              color: #2e3033;
            }

            :deep(.el-input__wrapper) {
              background-color: #fafbfc;
              border: 1px solid #edf1f7;
              box-shadow: none;

              &:hover {
                border-color: #d9e1ec;
              }

              &.is-focus {
                border-color: #4096ff;
                box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
              }
            }

            :deep(.el-button--primary) {
              background-color: #4096ff;
              border-color: #4096ff;
              &:hover {
                background-color: #1677ff;
                border-color: #1677ff;
              }
            }

            .form-tip {
              margin-top: 4px;
              color: #8c95a5;
              font-size: 13px;
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .container {
    .right {
      .key-container {
        .cont {
          padding: 15px;

          .card-header {
            padding-bottom: 15px;
            margin-bottom: 15px;

            .header-left {
              .title {
                font-size: 15px;
              }
            }
          }
        }
      }
    }
  }
}

.sign-header {
  display: flex;
  align-items: center;
  gap: 16px;

  .el-button {
    padding: 0;
    height: auto;
    font-size: 13px;

    .el-icon {
      margin-right: 4px;
      font-size: 14px;
    }
  }
}

.sign-method {
  color: #2e3033;

  h3 {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 16px;

    &:not(:first-child) {
      margin-top: 24px;
    }
  }

  ol {
    margin: 0;
    padding-left: 20px;

    li {
      margin-bottom: 8px;
      line-height: 1.6;
      color: #5a6478;
    }
  }

  .example {
    background: #fafbfc;
    border: 1px solid #edf1f7;
    border-radius: 6px;
    padding: 16px;
    margin: 16px 0;

    p {
      margin: 0 0 8px;
      color: #5a6478;
    }

    pre {
      background: #f4f6f8;
      border: 1px solid #edf1f7;
      border-radius: 4px;
      padding: 8px 12px;
      margin: 8px 0 16px;
      font-family: 'Roboto Mono', monospace;
      font-size: 13px;
      color: #2e3033;
      overflow-x: auto;
    }

    ol {
      margin: 8px 0 16px;
    }
  }

  .notice {
    margin-top: 20px;
  }
}
</style>
