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

      <Ad></Ad>

      <div class="box">
        <h2>请求示例</h2>
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane label="ajax" name="first">
            <pre class="example mac_light mac_pre"><client-only><el-tooltip
            class="box-item"
            effect="dark"
            content="复制"
            placement="left"
          ><div class="copy" @click="copy(apiInfo.ajax)"><el-icon size="14"><CopyDocument /></el-icon></div
          ></el-tooltip></client-only><code class="javascript.js" v-text="apiInfo.ajax"></code></pre>
          </el-tab-pane>

          <el-tab-pane label="axios" name="axios">
            <pre class="example mac_light mac_pre"><client-only><el-tooltip
            class="box-item"
            effect="dark"
            content="复制"
            placement="left"
          ><div class="copy" @click="copy(apiInfo.axios)"><el-icon size="14"><CopyDocument /></el-icon></div
          ></el-tooltip></client-only><code class="javascript.js" v-text="apiInfo.axios"></code></pre>
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

const activeName = ref('first')
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

// 判断参数是否必传
res.data.params = res.data.params.map((item) => {
  return {
    id: item.id,
    aid: item.aid,
    name: item.name,
    param: item.param,
    position: item.position,
    docs: item.docs,
    required: item.required === 1 ? '必传' : '可选',
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
    { description: apiInfo.value.description },
    { keywords: apiInfo.value.keywords },
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
  height: 100%;
  .apiinfo-container {
    width: 70%;
    flex: 1;
    padding-left: 40px;
    padding-right: 40px;
    margin: 0 auto;
    margin-top: 20px;
    .box {
      margin-bottom: 30px;
    }

    h1 {
      font-size: 26px;
      font-weight: normal;
    }

    h2 {
      font-size: 20px;
      color: #181819b3;
      font-weight: normal;
      margin-bottom: 30px;
    }

    .url {
      font-weight: 700;
      margin: 0 10px;
      cursor: pointer;
      color: rgba(24, 24, 25, 0.7);
      font-size: 14px;
      user-select: none;
    }

    .url:hover {
      text-decoration: underline;
    }

    .example {
      width: 70%;
    }

    pre {
      display: block;
      overflow: hidden;
      position: relative;
      padding: 0;
      margin: 1.5em 0;
      font-size: 13px;
      line-height: 1.4;
      color: #333;
      word-break: break-all;
      word-wrap: break-word;
      cursor: pointer;
    }

    pre .copy {
      display: none;
      position: absolute;
      top: 40px;
      right: 10px;
      cursor: pointer;
    }

    pre:hover .copy {
      display: block;
    }

    .mac_light {
      background: #eee !important;
      border-radius: 5px !important;
    }

    .mac_light code {
      background: #f3f3f3 !important;
    }

    .mac_pre::before {
      content: '';
      display: block;
      background-size: 40px;
      margin-bottom: 8px;
      margin-left: 8px;
      margin-top: 8px;
      border-radius: 50%;
      background: #ff0800 no-repeat 10px 10px;
      width: 12px;
      height: 12px;
      -webkit-box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
      box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
      z-index: 3;
    }

    .adPic {
      width: 70%;
      height: 120px;
      margin-bottom: 20px;
    }
  }

  @media screen and (max-width: 750px) {
    .apiinfo-container {
      width: 100%;

      .example {
        width: 100%;
      }
    }
  }
}
</style>
