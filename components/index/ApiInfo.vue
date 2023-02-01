<template>
  <div class="apiinfo-container">
    <div class="box">
      <h1>{{ apiInfo.name }}</h1>
    </div>

    <div class="box">
      <el-tag type="success">{{ apiInfo.method }}</el-tag>

      <client-only>
        <el-tooltip effect="dark" content="点击复制" placement="top">
          <span class="url" @click="copy(apiInfo.url)" ref="urlDom">{{
            apiInfo.url
          }}</span>
        </el-tooltip>
      </client-only>

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
      <el-table :data="apiInfo.params" border style="width: 70%">
        <el-table-column prop="name" label="参数名" width="180" />
        <el-table-column prop="param" label="传递参数" width="150" />
        <el-table-column prop="position" label="传入位置" width="100" />
        <el-table-column prop="required" label="类型" width="80" />
        <el-table-column prop="docs" label="参数说明" />
      </el-table>
    </div>

    <img
      src="@/assets/images/banner.jpg"
      alt=""
      style="width: 70%; height: 250px"
    />

    <div class="box">
      <h2>返回示例</h2>
      <pre class="example mac_light mac_pre"><client-only><el-tooltip
        class="box-item"
        effect="dark"
        content="复制"
        placement="left"
      ><div class="copy" @click="copy(apiInfo.example)"><el-icon size="14"><CopyDocument /></el-icon></div
      ></el-tooltip></client-only><code class="json" v-html="apiInfo.example"></code></pre>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import {
  CopyDocument
} from '@element-plus/icons-vue'

import 'highlight.js/styles/github.css'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'

onMounted(() => {
  hljs.registerLanguage('json', json)
  hljs.highlightAll()
})


const { apiInfo } = defineProps(['apiInfo'])

const urlDom = ref()

const copy = (value) => {
  navigator.clipboard.writeText(value).then(() => {
    ElMessage({
      message: '复制成功',
      type: 'success',
    })
  }).catch(() => {
    ElMessage({
      message: '复制失败',
      type: 'error',
    })
  })
}
</script>

<style lang="less" scoped>
.apiinfo-container {
  flex: 1;
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
    content: "";
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
}
</style>