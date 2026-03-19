<script setup>
import {
  Key,
  Refresh,
  Document,
  InfoFilled,
  CopyDocument,
} from '@element-plus/icons-vue'
// highlight.js 动态导入，避免静态打包
let hljs = null
const loadHighlightJs = async () => {
  if (hljs) return hljs
  const [
    { default: core },
    { default: javascript },
    { default: python },
    { default: php },
    { default: java },
  ] = await Promise.all([
    import('highlight.js/lib/core'),
    import('highlight.js/lib/languages/javascript'),
    import('highlight.js/lib/languages/python'),
    import('highlight.js/lib/languages/php'),
    import('highlight.js/lib/languages/java'),
  ])
  await import('highlight.js/styles/atom-one-light.css')

  core.registerLanguage('javascript', javascript)
  core.registerLanguage('python', python)
  core.registerLanguage('php', php)
  core.registerLanguage('java', java)
  hljs = core
  return hljs
}

const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const activeTab = ref('referer')
const username = useCookie('username')
const token = useTokenCookie()
const { userAccessKey, fetchUserKey } = useUserKey()

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
const activeCodeTab = ref('js')

const getKeyInfo = async () => {
  if (username.value && token.value) {
    const res = await fetchUserKey()
    if (res.code === 200) {
      keyInfo.value.key = userAccessKey.value
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
  }
}

// 刷新Key
const refreshKey = async () => {
  if (!username.value || !token.value) {
    $msg('请先登录', 'error')
    return
  }

  try {
    await ElMessageBox.confirm(
      '刷新密钥将同时重置您的 Access Key 和 签名密钥 (AppID)，旧的密钥将立即失效。确认要继续吗？',
      '警告',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  } catch (e) {
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

const copyText = (text) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
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

const getCodeContent = (lang) => {
  const appid = securityInfo.value.appid || '您的AppID'

  const codes = {
    js: `const crypto = require('crypto');

// 您的 AppID (请妥善保管)
const appid = "${appid}";

function generateSign(params) {
    // 1. 排序：按照参数名从小到大排序
    const sortedKeys = Object.keys(params).sort();

    // 2. 拼接：按 key=value&key=value 格式拼接
    const paramStr = sortedKeys.map(key => \`\${key}=\${params[key]}\`).join('&');

    // 3. 拼接密钥：在最后直接加上 appid
    const fullStr = paramStr + appid;

    // 4. MD5 加密
    return crypto.createHash('md5').update(fullStr).digest('hex');
}

// 使用示例
const params = { name: '张三', age: 18 };
const sign = generateSign(params);
console.log('Sign:', sign);`,

    python: `import hashlib

# 您的 AppID (请妥善保管)
appid = "${appid}"

def generate_sign(params):
    # 1. 排序
    sorted_keys = sorted(params.keys())

    # 2. 拼接
    param_str = "&".join([f"{k}={params[k]}" for k in sorted_keys])

    # 3. 拼接密钥
    full_str = param_str + appid

    # 4. MD5
    return hashlib.md5(full_str.encode('utf-8')).hexdigest()

# 使用示例
params = {"name": "张三", "age": 18}
sign = generate_sign(params)
print(f"Sign: {sign}")`,

    php: `<?php
// 您的 AppID (请妥善保管)
$appid = "${appid}";

function generateSign($params, $appid) {
    // 1. 排序
    ksort($params);
    
    // 2. 拼接
    $strArr = [];
    foreach ($params as $k => $v) {
        $strArr[] = "$k=$v";
    }
    $paramStr = implode('&', $strArr);
    
    // 3. 拼接密钥
    $fullStr = $paramStr . $appid;
    
    // 4. MD5
    return md5($fullStr);
}

// 使用示例
$params = ['name' => '张三', 'age' => 18];
$sign = generateSign($params, $appid);
echo "Sign: " . $sign;`,

    java: `import java.util.*;
import java.security.MessageDigest;

public class SignUtils {
    // 您的 AppID (请妥善保管)
    private static final String APPID = "${appid}";

    public static String generateSign(Map<String, Object> params) {
        try {
            // 1. 排序
            List<String> keys = new ArrayList<>(params.keySet());
            Collections.sort(keys);

            // 2. 拼接
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < keys.size(); i++) {
                String key = keys.get(i);
                sb.append(key).append("=").append(params.get(key));
                if (i < keys.size() - 1) sb.append("&");
            }

            // 3. 拼接密钥
            sb.append(APPID);

            // 4. MD5
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] bytes = md.digest(sb.toString().getBytes("UTF-8"));

            // 转16进制
            StringBuilder sign = new StringBuilder();
            for (byte b : bytes) {
                String hex = Integer.toHexString(b & 0xff);
                if (hex.length() == 1) sign.append("0");
                sign.append(hex);
            }
            return sign.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
}`,
  }

  return codes[lang]
}

const getHighlightedCode = (lang) => {
  const code = getCodeContent(lang)
  const languageMap = {
    js: 'javascript',
    python: 'python',
    php: 'php',
    java: 'java',
  }
  if (!code) return ''
  if (!hljs) return code
  return hljs.highlight(code, { language: languageMap[lang] }).value
}

onMounted(async () => {
  getKeyInfo()
  getSecurityInfo()
  // 页面挂载后异步加载 highlight.js
  await loadHighlightJs()
})

useHead({
  title: 'API密钥管理',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
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
                  <el-alert
                    type="warning"
                    :closable="false"
                    show-icon
                    class="security-alert"
                  >
                    <template #title>
                      请妥善保管您的密钥，泄露可能导致安全风险
                    </template>
                  </el-alert>

                  <div class="usage-guide">
                    <div class="key-guide-container">
                      <div class="key-guide-inline">
                        <div class="key-guide-header">
                          <span class="key-guide-title">将 Key 放到 Header 中</span>
                          <span class="key-guide-text"
                            >使用 Authorization 请求头，按 Bearer Token 方式传递</span
                          >
                        </div>
                        <div
                          class="key-guide-code"
                          @click="
                            copyText(`Authorization: Bearer ${keyInfo.key}`)
                          "
                        >
                          <div class="key-guide-code-line">
                            <span class="label">Authorization:</span>
                            <span class="value">Bearer {{ keyInfo.key }}</span>
                          </div>
                          <el-icon class="copy-icon"><CopyDocument /></el-icon>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <div class="form-tip">
                    留空表示不限制Referer，设置.a.com代表泛域名
                  </div>
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
                  <el-input v-model="securityInfo.appid" disabled>
                    <template #append>
                      <el-button
                        :icon="CopyDocument"
                        @click="copyText(securityInfo.appid)"
                      />
                    </template>
                  </el-input>
                  <div class="form-tip">
                    签名密钥用于生成API调用签名，请妥善保管
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
        <el-button type="primary" @click="saveSecurityInfo">保存设置</el-button>
      </div>
    </div>

    <el-dialog
      v-model="signMethodVisible"
      title="怎么计算签名？(直接复制代码)"
      width="800px"
      :close-on-click-modal="false"
    >
      <client-only>
        <div class="sign-method">
          <el-alert
            type="success"
            :closable="false"
            show-icon
            class="mb-4"
            style="margin-bottom: 20px"
          >
            <template #title>
              <b>最简单的方法：直接复制下面的代码！</b>
            </template>
          </el-alert>

          <el-tabs v-model="activeCodeTab" type="border-card" class="code-tabs">
            <el-tab-pane label="JavaScript / Node.js" name="js">
              <div class="code-wrapper">
                <pre><code class="hljs language-javascript" v-html="getHighlightedCode('js')"></code></pre>
                <el-button
                  type="primary"
                  link
                  class="copy-btn"
                  @click="copyText(getCodeContent('js'))"
                >
                  <el-icon><CopyDocument /></el-icon> 复制代码
                </el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Python" name="python">
              <div class="code-wrapper">
                <pre><code class="hljs language-python" v-html="getHighlightedCode('python')"></code></pre>
                <el-button
                  type="primary"
                  link
                  class="copy-btn"
                  @click="copyText(getCodeContent('python'))"
                >
                  <el-icon><CopyDocument /></el-icon> 复制代码
                </el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="PHP" name="php">
              <div class="code-wrapper">
                <pre><code class="hljs language-php" v-html="getHighlightedCode('php')"></code></pre>
                <el-button
                  type="primary"
                  link
                  class="copy-btn"
                  @click="copyText(getCodeContent('php'))"
                >
                  <el-icon><CopyDocument /></el-icon> 复制代码
                </el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Java" name="java">
              <div class="code-wrapper">
                <pre><code class="hljs language-java" v-html="getHighlightedCode('java')"></code></pre>
                <el-button
                  type="primary"
                  link
                  class="copy-btn"
                  @click="copyText(getCodeContent('java'))"
                >
                  <el-icon><CopyDocument /></el-icon> 复制代码
                </el-button>
              </div>
            </el-tab-pane>
          </el-tabs>

          <div class="manual-steps" style="margin-top: 30px">
            <el-divider content-position="center"
              >以下原理供参考（不需要看）</el-divider
            >
            <h3>签名算法步骤</h3>
            <p class="step-desc">
              签名的核心思想是：将所有请求参数排序后拼接成字符串，再加上密钥进行
              MD5 运算。
            </p>

            <div class="step-item">
              <h4>第一步：准备参数</h4>
              <p>
                收集所有业务参数（不包括 <code>key</code> 和
                <code>sign</code>），例如：
              </p>
              <div class="example-box">
                <code>name = "张三"</code><br />
                <code>age = 18</code>
              </div>
            </div>

            <div class="step-item">
              <h4>第二步：字典排序</h4>
              <p>将参数名按照 ASCII 码从小到大排序：</p>
              <div class="example-box">
                <code>age</code> 排在 <code>name</code> 前面
              </div>
            </div>

            <div class="step-item">
              <h4>第三步：拼接参数</h4>
              <p>将排序后的参数用 <code>&</code> 连接：</p>
              <div class="example-box">
                <code>age=18&name=张三</code>
              </div>
            </div>

            <div class="step-item">
              <h4>第四步：拼接密钥</h4>
              <p>
                在最后拼接上您的 <b>AppID</b>（假设为
                <code>{{ securityInfo.appid || '您的AppID' }}</code
                >）：
              </p>
              <div class="example-box">
                <code
                  >age=18&name=张三{{ securityInfo.appid || '您的AppID' }}</code
                >
              </div>
            </div>

            <div class="step-item">
              <h4>第五步：MD5 加密</h4>
              <p>对上述字符串进行 MD5 运算（32位小写）：</p>
              <div class="example-box">
                <code>sign = md5("...")</code>
              </div>
            </div>

            <div class="step-item">
              <h4>第六步：发起请求</h4>
              <p>
                将计算得到的 <code>sign</code> 放入请求头（Header），API Key
                也推荐放在 Header：
              </p>
              <div class="example-box code">
                Authorization: Bearer {{ keyInfo.key }}<br />
                sign: d41d8cd98f00b204e9800998ecf8427e
              </div>
            </div>
          </div>

          <div class="notice">
            <el-alert type="warning" :closable="false">
              <template #title>
                1. 请勿在原始请求参数中包含签名密钥；<br />2. key
                参数不参与签名计算，请通过 Header 传递；<br />3.
                sign参数必须放在请求头(Header)中
              </template>
            </el-alert>
          </div>
        </div>
      </client-only>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
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
          padding: 24px;
          background: #fff;
          border-top: 1px solid #edf1f7;

          .security-alert {
            padding: 10px 16px;
            border-radius: 6px;
            background-color: #fff9f0;
            border: 1px solid #ffe7ba;
            margin-bottom: 20px;

            :deep(.el-alert__title) {
              font-size: 13px;
              color: #d48806;
            }

            :deep(.el-alert__icon) {
              color: #faad14;
            }
          }

          .usage-guide {
            margin-top: 20px;

            .key-guide-container {
              margin-top: 16px;
            }

            .key-guide-inline {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 16px;
              padding: 12px 14px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;

              @media (max-width: 768px) {
                flex-direction: column;
                align-items: stretch;
                gap: 10px;
              }
            }

            .key-guide-header {
              display: flex;
              flex-direction: column;
              gap: 4px;
              min-width: 0;
            }

            .key-guide-title {
              font-size: 13px;
              font-weight: 600;
              color: #334155;
            }

            .key-guide-text {
              font-size: 12px;
              line-height: 1.5;
              color: #64748b;
            }

            .key-guide-code {
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              min-width: min(100%, 320px);
              padding: 10px 12px;
              background: #fff;
              border: 1px solid #dbeafe;
              border-radius: 8px;
              cursor: pointer;
              transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;

              &:hover {
                border-color: #93c5fd;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);

                .copy-icon {
                  opacity: 1;
                }
              }

              @media (max-width: 768px) {
                min-width: 0;
                width: 100%;
              }
            }

            .key-guide-code-line {
              min-width: 0;
              font-family: 'Roboto Mono', monospace;
              font-size: 12px;
              line-height: 1.5;
              word-break: break-all;

              .label {
                color: #c2410c;
                margin-right: 8px;
              }

              .value {
                color: #1d4ed8;
                font-weight: 600;
              }
            }

            .key-guide-code .copy-icon {
              flex-shrink: 0;
              font-size: 16px;
              color: #2563eb;
              opacity: 0.6;
              transition: opacity 0.2s ease;
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

@media screen and (max-width: 768px) {
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

  .step-item {
    margin-bottom: 24px;
    padding: 16px;
    background: #fafbfc;
    border-radius: 8px;
    border: 1px solid #edf1f7;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #2e3033;
      margin: 0 0 8px;
    }

    p {
      font-size: 13px;
      color: #5a6478;
      margin: 0 0 12px;
      line-height: 1.6;
    }

    .example-box {
      background: #fff;
      border: 1px solid #e1e5eb;
      border-radius: 4px;
      padding: 10px 14px;
      font-family: 'Roboto Mono', monospace;
      font-size: 13px;
      color: #4096ff;
      line-height: 1.6;

      &.code {
        color: #2e3033;
        background: #f4f6f8;
      }
    }
  }

  .step-desc {
    margin-bottom: 20px;
    color: #5a6478;
    font-size: 14px;
  }
}
</style>
