<script setup>
const { $myFetch } = useNuxtApp()
const route = useRoute()

const apiInfo = ref({})
const markdownContent = ref('')

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

// 生成Markdown内容
const generateMarkdown = () => {
  let markdown = `# ${apiInfo.value.name}\n\n`
  markdown += `**请求方式：** ${apiInfo.value.method}\n\n`
  markdown += `**接口地址：** ${apiInfo.value.url}\n\n`
  markdown += `**接口描述：** ${apiInfo.value.description}\n\n`

  // 添加参数信息
  if (apiInfo.value.params && apiInfo.value.params.length > 0) {
    markdown += `## 请求参数\n\n`
    markdown += `| 参数名 | 传递参数 | 传入位置 | 类型 | 参数说明 |\n`
    markdown += `|--------|----------|----------|------|----------|\n`

    apiInfo.value.params.forEach((param) => {
      markdown += `| ${param.name} | ${param.param} | ${param.position} | ${param.required} | ${param.docs} |\n`
    })
    markdown += `\n`
  }

  // 添加返回示例
  if (apiInfo.value.example) {
    markdown += `## 返回示例\n\n`
    markdown += `\`\`\`json\n${apiInfo.value.example}\n\`\`\`\n\n`
  }

  return markdown
}

markdownContent.value = generateMarkdown()

// 配置项
const options = useState('options')

useHead({
  title: `${apiInfo.value.name} - Markdown文档`,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    {
      name: 'description',
      content: `${apiInfo.value.name} API接口的Markdown文档`,
    },
    { name: 'keywords', content: `${apiInfo.value.name}, API, Markdown, 文档` },
  ],
  style: [
    {
      children: options.value.css,
    },
  ],
})
</script>

<template>
  <div class="markdown-container">
    <pre>{{ markdownContent }}</pre>
  </div>
</template>

<style scoped>
.markdown-container {
  margin: 0;
  padding: 0;
}

.markdown-container pre {
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  border: none;
  background: none;
  margin-left: 12px;
  margin-top: 12px;
}
</style>
