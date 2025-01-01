<template>
  <div class="container">
    <!-- 公告 -->
    <IndexNotice></IndexNotice>

    <div class="apiinfo-container">
      <div class="box">
        <h1>{{ apiInfo.name }}</h1>
      </div>

      <div class="box">
        <el-tag type="success">{{ apiInfo.method }}</el-tag>

        <el-tooltip effect="dark" content="点击复制" placement="top">
          <span class="url" @click="copy(apiInfo.url)" ref="urlDom">{{
            apiInfo.url
          }}</span>
        </el-tooltip>

        <!-- <el-button color="#626aef">调试</el-button> -->
      </div>

      <el-divider border-style="dashed" />

      <div class="box">
        <h2>接口描述</h2>
        <span>{{ apiInfo.description }}</span>
      </div>

      <el-divider border-style="dashed" />

      <div class="box">
        <h2>请求参数</h2>
        <el-table :data="apiInfo.params" border style="width: 100%">
          <el-table-column prop="name" label="参数名" width="180" />
          <el-table-column prop="param" label="传递参数" width="180" />
          <el-table-column prop="position" label="传入位置" width="100" />
          <el-table-column prop="required" label="类型" width="100" />
          <el-table-column prop="docs" label="参数说明" />
        </el-table>
      </div>

      <client-only>
        <Ad></Ad>
      </client-only>

      <div class="box">
        <h2>请求示例</h2>
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane label="axios" name="axios">
            <pre class="example mac_light mac_pre"><client-only><el-tooltip
            class="box-item"
            effect="dark"
            content="复制"
            placement="left"
          ><div class="copy" @click="copy(apiInfo.axios)"><el-icon size="14"><CopyDocument /></el-icon></div
          ></el-tooltip></client-only><code class="javascript.js" v-text="apiInfo.axios"></code></pre>
          </el-tab-pane>

          <el-tab-pane label="ajax" name="ajax">
            <pre class="example mac_light mac_pre"><client-only><el-tooltip
            class="box-item"
            effect="dark"
            content="复制"
            placement="left"
          ><div class="copy" @click="copy(apiInfo.ajax)"><el-icon size="14"><CopyDocument /></el-icon></div
          ></el-tooltip></client-only><code class="javascript.js" v-text="apiInfo.ajax"></code></pre>
          </el-tab-pane>

          <el-tab-pane label="fetch" name="fetch">
            <pre class="example mac_light mac_pre"><client-only><el-tooltip
            class="box-item"
            effect="dark"
            content="复制"
            placement="left"
          ><div class="copy" @click="copy(apiInfo.fetch)"><el-icon size="14"><CopyDocument /></el-icon></div
          ></el-tooltip></client-only><code class="javascript.js" v-text="apiInfo.fetch"></code></pre>
          </el-tab-pane>

          <el-tab-pane label="xhr" name="xhr">
            <pre class="example mac_light mac_pre"><client-only><el-tooltip
            class="box-item"
            effect="dark"
            content="复制"
            placement="left"
          ><div class="copy" @click="copy(apiInfo.xhr)"><el-icon size="14"><CopyDocument /></el-icon></div
          ></el-tooltip></client-only><code class="javascript.js" v-text="apiInfo.xhr"></code></pre>
          </el-tab-pane>

          <el-tab-pane label="php" name="php">
            <pre class="example mac_light mac_pre"><client-only><el-tooltip
            class="box-item"
            effect="dark"
            content="复制"
            placement="left"
          ><div class="copy" @click="copy(apiInfo.php)"><el-icon size="14"><CopyDocument /></el-icon></div
          ></el-tooltip></client-only><code class="php" v-text="apiInfo.php"></code></pre>
          </el-tab-pane>

          <el-tab-pane label="python" name="python">
            <pre class="example mac_light mac_pre"><client-only><el-tooltip
            class="box-item"
            effect="dark"
            content="复制"
            placement="left"
          ><div class="copy" @click="copy(apiInfo.python)"><el-icon size="14"><CopyDocument /></el-icon></div
          ></el-tooltip></client-only><code class="python" v-text="apiInfo.python"></code></pre>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="box">
        <h2>返回示例</h2>
        <pre class="example mac_light mac_pre"><client-only><el-tooltip
        class="box-item"
        effect="dark"
        content="复制"
        placement="left"
      ><div class="copy" @click="copy(apiInfo.example)"><el-icon size="14"><CopyDocument /></el-icon></div
      ></el-tooltip></client-only><code class="json" v-text="apiInfo.example"></code></pre>
      </div>
    </div>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<script setup>
const { $myFetch } = useNuxtApp()
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'

import 'highlight.js/styles/github.css'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import javascript from 'highlight.js/lib/languages/javascript'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'

const activeName = ref('axios')
const route = useRoute()

const apiInfo = ref({})

const {
  data: { value: res },
} = await useAsyncData('ApiAlias', () =>
  $myFetch('ApiAlias', {
    query: {
      alias: route.params.alias,
    },
  })
)

if (res.code !== 200) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
  })
}

// 判断参数是否必传
res.data.params = res.data.params.map((item) => {
  let requiredText
  if (item.required === 1 || item.required === '必传') {
    requiredText = '必传'
  } else {
    requiredText = '可选'
  }

  return {
    id: item.id,
    aid: item.aid,
    name: item.name,
    param: item.param,
    position: item.position,
    docs: item.docs,
    required: requiredText,
  }
})

apiInfo.value = res.data

// 配置项
const options = ref({})

const {
  data: { value: res1 },
} = await useAsyncData('Options', () => $myFetch('Options'))

options.value = res1.data

useHead({
  title: apiInfo.value.name + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    { name: 'description', content: apiInfo.value.description },
    { name: 'keywords', content: apiInfo.value.keywords },
  ],
})

onMounted(() => {
  hljs.registerLanguage('json', json)
  hljs.registerLanguage('javascript.js', javascript)
  hljs.registerLanguage('php', php)
  hljs.registerLanguage('python', python)
  hljs.highlightAll()
})

const urlDom = ref()

const copy = (value) => {
  const textArea = document.createElement('textarea')
  textArea.value = value
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)

  ElMessage({
    message: '复制成功',
    type: 'success',
  })
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background: #ffffff;

  .apiinfo-container {
    width: 90%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 32px 0;

    .box {
      margin-bottom: 40px;

      h1 {
        font-size: 28px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0 0 24px 0;
      }

      h2 {
        position: relative;
        font-size: 20px;
        color: #2c3e50;
        font-weight: 500;
        margin: 0 0 24px 0;
        padding-left: 12px;
        line-height: 1.4;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 16px;
          background: #409eff;
          border-radius: 3px;
        }
      }

      .url {
        font-weight: 500;
        margin: 0 12px;
        padding: 6px 12px;
        cursor: pointer;
        color: #181819b3;
        font-size: 14px;
        user-select: all;
        border-radius: 4px;
        transition: all 0.3s ease;
        text-decoration: none;
        outline: none;

        &:hover {
          opacity: 0.8;
        }

        &:active,
        &:focus {
          outline: none;
          background: transparent;
        }
      }

      .el-tag {
        font-weight: 500;
        height: 28px;
      }
    }

    .example {
      width: 100%;
      margin: 0;
    }

    pre {
      display: block;
      position: relative;
      padding: 16px;
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #2c3e50;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #edf2f7;
      
      .copy {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 6px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        opacity: 0;
        transition: opacity 0.3s ease;
        cursor: pointer;

        &:hover {
          background: #fff;
        }
      }

      &:hover .copy {
        opacity: 1;
      }
    }

    .mac_light {
      background: #f8fafc !important;
    }

    .mac_light code {
      background: transparent !important;
    }

    .mac_pre::before {
      content: '';
      display: block;
      height: 12px;
      margin: 0 0 16px 4px;
      border-radius: 50%;
      background: #ff5f56;
      box-shadow: 20px 0 #ffbd2e, 40px 0 #27c93f;
      width: 12px;
    }

    .el-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 16px;
      }

      :deep(.el-tabs__nav) {
        border: none;
      }

      :deep(.el-tabs__item) {
        border: 1px solid #e2e8f0;
        margin-right: 8px;
        border-radius: 4px;
        height: 32px;
        line-height: 32px;
        
        &.is-active {
          border-color: #409eff;
          color: #409eff;
        }

        &:hover {
          color: #409eff;
        }
      }
    }

    .el-table {
      border-radius: 8px;
      overflow: hidden;
      
      :deep(th) {
        background: #f8fafc;
        color: #2c3e50;
        font-weight: 500;
      }

      :deep(td) {
        color: #4a5568;
      }
    }
  }

  @media screen and (max-width: 768px) {
    .apiinfo-container {
      width: 92%;
      padding: 20px 0;

      .box {
        margin-bottom: 32px;

        h1 {
          font-size: 24px;
          margin-bottom: 20px;
        }

        h2 {
          font-size: 18px;
          margin-bottom: 20px;
        }
      }
    }
  }
}
</style>
