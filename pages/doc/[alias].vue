<script setup>
const { $myFetch } = useNuxtApp()
import { ElMessage } from 'element-plus'
import {
  CopyDocument,
  VideoPlay,
  Document,
  Connection,
} from '@element-plus/icons-vue'

// highlight.js 动态导入，避免静态打包
let hljs = null
const loadHighlightJs = async () => {
  if (hljs) return hljs
  const [
    { default: core },
    { default: json },
    { default: javascript },
    { default: php },
    { default: python },
    { default: bash },
    { default: java },
    { default: go },
    { default: csharp },
    { default: ruby },
  ] = await Promise.all([
    import('highlight.js/lib/core'),
    import('highlight.js/lib/languages/json'),
    import('highlight.js/lib/languages/javascript'),
    import('highlight.js/lib/languages/php'),
    import('highlight.js/lib/languages/python'),
    import('highlight.js/lib/languages/bash'),
    import('highlight.js/lib/languages/java'),
    import('highlight.js/lib/languages/go'),
    import('highlight.js/lib/languages/csharp'),
    import('highlight.js/lib/languages/ruby'),
  ])
  await import('highlight.js/styles/github.css')

  core.registerLanguage('json', json)
  core.registerLanguage('javascript.js', javascript)
  core.registerLanguage('php', php)
  core.registerLanguage('python', python)
  core.registerLanguage('bash', bash)
  core.registerLanguage('java', java)
  core.registerLanguage('go', go)
  core.registerLanguage('csharp', csharp)
  core.registerLanguage('ruby', ruby)
  hljs = core
  return hljs
}

const activeName = ref('shell')
const jsActiveName = ref('axios')

// 语言列表
const languages = [
  { name: 'shell', label: 'Shell' },
  { name: 'javascript', label: 'JavaScript' },
  { name: 'python', label: 'Python' },
  { name: 'php', label: 'PHP' },
  { name: 'java', label: 'Java' },
  { name: 'go', label: 'Go' },
  { name: 'csharp', label: 'C#' },
  { name: 'ruby', label: 'Ruby' },
]

// JavaScript 库列表
const jsLibraries = [
  { name: 'axios', label: 'axios' },
  { name: 'fetch', label: 'fetch' },
  { name: 'ajax', label: 'jQuery' },
  { name: 'xhr', label: 'xhr' },
  { name: 'nodejs', label: 'Node.js' },
]

const route = useRoute()

const apiInfo = ref({})

const {
  data: { value: res },
} = await useAsyncData('ApiAlias', () =>
  $myFetch('ApiAlias', {
    query: {
      alias: route.params.alias,
    },
  }),
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

const getMethodList = (method) => {
  return [
    ...new Set(
      String(method || '')
        .split('|')
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean),
    ),
  ]
}

const getPreferredMethod = (method) => {
  const methodList = getMethodList(method)

  if (methodList.includes('POST')) {
    return 'POST'
  }

  if (methodList.includes('GET')) {
    return 'GET'
  }

  return methodList[0] || 'GET'
}

const docMethodList = computed(() => getMethodList(apiInfo.value.method))
const preferredMethod = computed(() => getPreferredMethod(apiInfo.value.method))

// 配置项
const options = useState('options')

useHead({
  title: apiInfo.value.name + ' - 免费API',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [
    { name: 'description', content: apiInfo.value.description },
    { name: 'keywords', content: apiInfo.value.keywords },
  ],
  style: [
    {
      children: options.value.css,
    },
  ],
})

onMounted(async () => {
  await loadHighlightJs()
  hljs.highlightAll()
})

// 监听标签页切换，触发代码高亮
watch([activeName, jsActiveName], async () => {
  await nextTick()
  if (hljs) {
    // 只高亮代码展示区域内的代码块
    const codeBlocks = document.querySelectorAll('.code-display code')
    codeBlocks.forEach((block) => {
      hljs.highlightElement(block)
    })
  }
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

// 调试对话框宽度（移动端95%，桌面端60%）
const isMobile = ref(false)
const updateIsMobile = () => {
  isMobile.value = document.body.clientWidth < 768
}
onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})

// 调试对话框组件引用
const debugDialogRef = ref(null)

// 广告显示控制
const adDisplay = ref(true)

// 处理广告数据
const adInfo = (info) => {
  if (info.value.length === 0) {
    adDisplay.value = false
  }
}

// 检测内容是否为HTML格式（来自高级编辑器）
const isHtmlContent = computed(() => {
  if (!apiInfo.value.example) return false

  // 检测是否包含HTML标签
  const htmlRegex = /<[^>]*>/
  return htmlRegex.test(apiInfo.value.example)
})

const formattedExampleText = computed(() => {
  if (!apiInfo.value.example) return ''

  // 如果是HTML内容（来自高级编辑器），直接返回
  if (isHtmlContent.value) {
    return apiInfo.value.example
  }

  try {
    // 如果example是字符串形式的JSON,先解析再格式化
    const parsed =
      typeof apiInfo.value.example === 'string'
        ? JSON.parse(apiInfo.value.example)
        : apiInfo.value.example

    const formatted = JSON.stringify(parsed, null, 2)
    return formatted
  } catch (e) {
    // 如果解析失败,直接返回原始内容
    return apiInfo.value.example
  }
})

const highlightedExample = computed(() => {
  if (!formattedExampleText.value) return ''
  if (isHtmlContent.value) return formattedExampleText.value
  if (hljs) {
    return hljs.highlight(formattedExampleText.value, { language: 'json' })
      .value
  }
  return formattedExampleText.value
})

const responseExampleLines = computed(() => {
  if (!formattedExampleText.value || isHtmlContent.value) return []
  return formattedExampleText.value.split('\n')
})

const getCodeLines = (code) => String(code || '').split('\n')

const jsonBodyParam = computed(() => {
  if (!apiInfo.value.params) return null
  return apiInfo.value.params.find(
    (p) =>
      p.name === 'json' &&
      p.param === 'json' &&
      p.position === 'body' &&
      p.required === '必传',
  )
})

const formattedJsonDocs = computed(() => {
  if (!jsonBodyParam.value || !jsonBodyParam.value.docs) return ''
  try {
    const parsed =
      typeof jsonBodyParam.value.docs === 'string'
        ? JSON.parse(jsonBodyParam.value.docs)
        : jsonBodyParam.value.docs
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    return jsonBodyParam.value.docs
  }
})

// 格式化大数字显示
const formatLargeNumber = (num) => {
  if (num === undefined || num === null) return '-'
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

const hasMetricValue = (value) =>
  value !== undefined && value !== null && value !== -1

const bottomStats = computed(() => {
  const { qps, avg_response_time, today_call_count, total_call_count } =
    apiInfo.value
  const items = []

  if (hasMetricValue(qps)) {
    items.push({
      key: 'qps',
      label: 'QPS 上限',
      value: qps,
      unit: '次/秒',
    })
  }

  if (hasMetricValue(avg_response_time)) {
    items.push({
      key: 'avg_response_time',
      label: '平均响应时间',
      value: avg_response_time,
      unit: 'ms',
    })
  }

  if (hasMetricValue(today_call_count)) {
    items.push({
      key: 'today_call_count',
      label: '今日调用量',
      value: formatLargeNumber(today_call_count),
      unit: '次',
    })
  }

  if (hasMetricValue(total_call_count)) {
    items.push({
      key: 'total_call_count',
      label: '累计调用量',
      value: formatLargeNumber(total_call_count),
      unit: '次',
    })
  }

  return items
})

// 购买套餐
const buyPackage = (pkg) => {
  navigateTo(`/admin/buy?package_id=${pkg.id}`)
}

// 生成请求示例代码
const generateExamples = () => {
  const url = apiInfo.value.url
  const method = getPreferredMethod(apiInfo.value.method)
  const params = apiInfo.value.params || []

  // 分离不同位置的参数
  const headerParams = []
  const bodyParams = []
  const queryParams = []
  let hasKeyParam = false

  params.forEach((param) => {
    if (String(param.name).toLowerCase() === 'key') {
      hasKeyParam = true
      return
    }
    if (param.position === 'header') {
      headerParams.push(param)
    } else if (param.position === 'body') {
      bodyParams.push(param)
    } else {
      queryParams.push(param)
    }
  })

  // 生成 axios 示例
  const generateAxios = () => {
    let code = `import axios from 'axios';\n\n`

    if (method === 'POST') {
      code += `const data = new URLSearchParams();\n`
      const targetParams = bodyParams.length > 0 ? bodyParams : queryParams
      targetParams.forEach((p) => {
        code += `data.append('${p.param}', '${p.docs || ''}');\n`
      })
      code += `\n`
    }

    code += `axios({\n`
    code += `  method: '${method}',\n`

    let finalUrl = url
    if (
      method === 'GET' ||
      (method === 'POST' && bodyParams.length > 0 && queryParams.length > 0)
    ) {
      const qParams =
        method === 'GET' ? [...queryParams, ...bodyParams] : queryParams
      if (qParams.length > 0) {
        const queryStr = qParams
          .map((p) => `${p.name}=\${${p.param}}`)
          .join('&')
        finalUrl += (url.includes('?') ? '&' : '?') + queryStr
      }
    }
    code += `  url: '${finalUrl}',\n`

    if (hasKeyParam || headerParams.length > 0) {
      code += `  headers: {\n`
      if (hasKeyParam) {
        code += `    'Authorization': 'Bearer YOUR_API_KEY',\n`
      }
      headerParams.forEach((p) => {
        code += `    '${p.name}': '${p.docs || ''}',\n`
      })
      code += `  },\n`
    }

    if (method === 'POST') {
      code += `  data: data\n`
    }

    code += `})\n`
    code += `.then(response => {\n`
    code += `  console.log(response.data);\n`
    code += `})\n`
    code += `.catch(error => {\n`
    code += `  console.error(error);\n`
    code += `});`

    return code
  }

  // 生成 ajax 示例
  const generateAjax = () => {
    let code = `$.ajax({\n`
    code += `  type: '${method}',\n`

    let finalUrl = url
    if (
      method === 'GET' ||
      (method === 'POST' && bodyParams.length > 0 && queryParams.length > 0)
    ) {
      const qParams =
        method === 'GET' ? [...queryParams, ...bodyParams] : queryParams
      if (qParams.length > 0) {
        const queryStr = qParams
          .map((p) => `${p.name}=\${${p.param}}`)
          .join('&')
        finalUrl += (url.includes('?') ? '&' : '?') + queryStr
      }
    }
    code += `  url: '${finalUrl}',\n`

    if (hasKeyParam || headerParams.length > 0) {
      code += `  headers: {\n`
      if (hasKeyParam) {
        code += `    'Authorization': 'Bearer YOUR_API_KEY',\n`
      }
      headerParams.forEach((p) => {
        code += `    '${p.name}': '${p.docs || ''}',\n`
      })
      code += `  },\n`
    }

    if (method === 'POST') {
      code += `  data: {\n`
      const targetParams = bodyParams.length > 0 ? bodyParams : queryParams
      targetParams.forEach((p, i) => {
        code += `    '${p.param}': '${p.docs || ''}'${i < targetParams.length - 1 ? ',' : ''}\n`
      })
      code += `  },\n`
    }

    code += `  success: function(data) {\n`
    code += `    console.log(data);\n`
    code += `  },\n`
    code += `  error: function(error) {\n`
    code += `    console.error(error);\n`
    code += `  }\n`
    code += `});`

    return code
  }

  // 生成 fetch 示例
  const generateFetch = () => {
    let finalUrl = url
    let code = ''

    if (
      method === 'GET' ||
      (method === 'POST' && bodyParams.length > 0 && queryParams.length > 0)
    ) {
      const qParams =
        method === 'GET' ? [...queryParams, ...bodyParams] : queryParams
      if (qParams.length > 0) {
        const queryStr = qParams
          .map((p) => `${p.name}=\${${p.param}}`)
          .join('&')
        finalUrl += (url.includes('?') ? '&' : '?') + queryStr
      }
    }

    if (method === 'POST') {
      code += `const formData = new URLSearchParams();\n`
      const targetParams = bodyParams.length > 0 ? bodyParams : queryParams
      targetParams.forEach((p) => {
        code += `formData.append('${p.param}', '${p.docs || ''}');\n`
      })
      code += `\n`
    }

    code += `fetch('${finalUrl}', {\n`
    code += `  method: '${method}',\n`

    if (hasKeyParam || headerParams.length > 0) {
      code += `  headers: {\n`
      if (hasKeyParam) {
        code += `    'Authorization': 'Bearer YOUR_API_KEY',\n`
      }
      headerParams.forEach((p) => {
        code += `    '${p.name}': '${p.docs || ''}',\n`
      })
      code += `  },\n`
    }

    if (method === 'POST') {
      code += `  body: formData\n`
    }

    code += `})\n`
    code += `.then(response => response.json())\n`
    code += `.then(data => {\n`
    code += `  console.log(data);\n`
    code += `})\n`
    code += `.catch(error => {\n`
    code += `  console.error(error);\n`
    code += `});`

    return code
  }

  // 生成 xhr 示例
  const generateXhr = () => {
    let finalUrl = url
    let code = `const xhr = new XMLHttpRequest();\n\n`

    if (
      method === 'GET' ||
      (method === 'POST' && bodyParams.length > 0 && queryParams.length > 0)
    ) {
      const qParams =
        method === 'GET' ? [...queryParams, ...bodyParams] : queryParams
      if (qParams.length > 0) {
        const queryStr = qParams
          .map((p) => `${p.name}=\${${p.param}}`)
          .join('&')
        finalUrl += (url.includes('?') ? '&' : '?') + queryStr
      }
    }

    code += `xhr.open('${method}', '${finalUrl}', true);\n`

    if (hasKeyParam) {
      code += `xhr.setRequestHeader('Authorization', 'Bearer YOUR_API_KEY');\n`
    }
    headerParams.forEach((p) => {
      code += `xhr.setRequestHeader('${p.name}', '${p.docs || ''}');\n`
    })

    if (method === 'POST') {
      code += `xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');\n`
    }

    code += `\nxhr.onload = function() {\n`
    code += `  if (xhr.status === 200) {\n`
    code += `    console.log(JSON.parse(xhr.responseText));\n`
    code += `  } else {\n`
    code += `    console.error('Request failed');\n`
    code += `  }\n`
    code += `};\n\n`

    if (method === 'POST') {
      code += `const data = new URLSearchParams();\n`
      const targetParams = bodyParams.length > 0 ? bodyParams : queryParams
      targetParams.forEach((p) => {
        code += `data.append('${p.param}', '${p.docs || ''}');\n`
      })
      code += `\nxhr.send(data);`
    } else {
      code += `xhr.send();`
    }

    return code
  }

  // 生成 PHP 示例
  const generatePhp = () => {
    let code = `<?php\n\n`
    let finalUrl = url

    if (
      method === 'GET' ||
      (method === 'POST' && bodyParams.length > 0 && queryParams.length > 0)
    ) {
      const qParams =
        method === 'GET' ? [...queryParams, ...bodyParams] : queryParams
      if (qParams.length > 0) {
        const queryStr = qParams
          .map((p) => `${p.name}=\${${p.param}}`)
          .join('&')
        finalUrl += (url.includes('?') ? '&' : '?') + queryStr
      }
    }

    code += `$url = '${finalUrl}';\n\n`

    if (method === 'POST') {
      code += `$data = array(\n`
      const targetParams = bodyParams.length > 0 ? bodyParams : queryParams
      targetParams.forEach((p, i) => {
        code += `    '${p.param}' => '${p.docs || ''}'${i < targetParams.length - 1 ? ',' : ''}\n`
      })
      code += `);\n\n`
    }

    code += `$options = array(\n`
    code += `    'http' => array(\n`
    code += `        'method' => '${method}',\n`

    if (hasKeyParam || headerParams.length > 0) {
      code += `        'header' => `
      const headers = []
      if (hasKeyParam) {
        headers.push(`"Authorization: Bearer YOUR_API_KEY"`)
      }
      headerParams.forEach((p) => {
        headers.push(`"${p.name}: ${p.docs || ''}"`)
      })
      if (method === 'POST') {
        headers.push(`"Content-Type: application/x-www-form-urlencoded"`)
      }
      code += headers.join(' . "\\r\\n" . ') + `,\n`
    }

    if (method === 'POST') {
      code += `        'content' => http_build_query($data)\n`
    }

    code += `    )\n`
    code += `);\n\n`
    code += `$context = stream_context_create($options);\n`
    code += `$result = file_get_contents($url, false, $context);\n\n`
    code += `if ($result === FALSE) {\n`
    code += `    die('Error');\n`
    code += `}\n\n`
    code += `$response = json_decode($result, true);\n`
    code += `print_r($response);\n\n`
    code += `?>`

    return code
  }

  // 生成 Python 示例
  const generatePython = () => {
    let code = `import requests\n\n`
    let finalUrl = url

    if (
      method === 'GET' ||
      (method === 'POST' && bodyParams.length > 0 && queryParams.length > 0)
    ) {
      const qParams =
        method === 'GET' ? [...queryParams, ...bodyParams] : queryParams
      if (qParams.length > 0) {
        const queryStr = qParams
          .map((p) => `${p.name}=\${${p.param}}`)
          .join('&')
        finalUrl += (url.includes('?') ? '&' : '?') + queryStr
      }
    }

    code += `url = '${finalUrl}'\n\n`

    if (hasKeyParam || headerParams.length > 0) {
      code += `headers = {\n`
      if (hasKeyParam) {
        code += `    'Authorization': 'Bearer YOUR_API_KEY',\n`
      }
      headerParams.forEach((p) => {
        code += `    '${p.name}': '${p.docs || ''}',\n`
      })
      code += `}\n\n`
    }

    if (method === 'POST') {
      code += `data = {\n`
      const targetParams = bodyParams.length > 0 ? bodyParams : queryParams
      targetParams.forEach((p, i) => {
        code += `    '${p.param}': '${p.docs || ''}'${i < targetParams.length - 1 ? ',' : ''}\n`
      })
      code += `}\n\n`
    }

    if (method === 'POST') {
      code += `response = requests.post(url`
      if (hasKeyParam || headerParams.length > 0) {
        code += `, headers=headers`
      }
      code += `, data=data)\n`
    } else {
      code += `response = requests.get(url`
      if (hasKeyParam || headerParams.length > 0) {
        code += `, headers=headers`
      }
      code += `)\n`
    }

    code += `\nif response.status_code == 200:\n`
    code += `    print(response.json())\n`
    code += `else:\n`
    code += `    print(f'Error: {response.status_code}')`

    return code
  }

  // 生成 cURL 示例
  const generateCurl = () => {
    let finalUrl = url
    let code = `curl -X ${method}`

    if (
      method === 'GET' ||
      (method === 'POST' && bodyParams.length > 0 && queryParams.length > 0)
    ) {
      const qParams =
        method === 'GET' ? [...queryParams, ...bodyParams] : queryParams
      if (qParams.length > 0) {
        const queryStr = qParams
          .map((p) => `${p.name}=\${${p.param}}`)
          .join('&')
        finalUrl += (url.includes('?') ? '&' : '?') + queryStr
      }
    }

    code += ` '${finalUrl}'`

    if (hasKeyParam) {
      code += ` \\\n  -H 'Authorization: Bearer YOUR_API_KEY'`
    }
    headerParams.forEach((p) => {
      code += ` \\\n  -H '${p.name}: ${p.docs || ''}'`
    })

    if (method === 'POST') {
      const targetParams = bodyParams.length > 0 ? bodyParams : queryParams
      targetParams.forEach((p) => {
        code += ` \\\n  -d '${p.param}=${p.docs || ''}'`
      })
    }

    return code
  }

  // 生成 Java 示例
  const generateJava = () => {
    let finalUrl = url
    let code = `import java.net.http.*;\nimport java.net.URI;\n\n`

    if (
      method === 'GET' ||
      (method === 'POST' && bodyParams.length > 0 && queryParams.length > 0)
    ) {
      const qParams =
        method === 'GET' ? [...queryParams, ...bodyParams] : queryParams
      if (qParams.length > 0) {
        const queryStr = qParams
          .map((p) => `${p.name}=\${${p.param}}`)
          .join('&')
        finalUrl += (url.includes('?') ? '&' : '?') + queryStr
      }
    }

    code += `HttpClient client = HttpClient.newHttpClient();\n\n`
    code += `HttpRequest.Builder builder = HttpRequest.newBuilder()\n`
    code += `    .uri(URI.create("${finalUrl}"))\n`

    if (hasKeyParam) {
      code += `    .header("Authorization", "Bearer YOUR_API_KEY")\n`
    }
    headerParams.forEach((p) => {
      code += `    .header("${p.name}", "${p.docs || ''}")\n`
    })

    if (method === 'POST') {
      const targetParams = bodyParams.length > 0 ? bodyParams : queryParams
      const formData = targetParams
        .map((p) => `"${p.param}=" + "${p.docs || ''}"`)
        .join(' + "&" + ')
      code += `    .header("Content-Type", "application/x-www-form-urlencoded")\n`
      code += `    .POST(HttpRequest.BodyPublishers.ofString(${formData}));\n\n`
    } else {
      code += `    .GET();\n\n`
    }

    code += `HttpRequest request = builder.build();\n\n`
    code += `try {\n`
    code += `    HttpResponse<String> response = client.send(request,\n`
    code += `        HttpResponse.BodyHandlers.ofString());\n`
    code += `    System.out.println(response.body());\n`
    code += `} catch (Exception e) {\n`
    code += `    e.printStackTrace();\n`
    code += `}`

    return code
  }

  // 生成 Go 示例
  const generateGo = () => {
    let finalUrl = url
    let code = `package main\n\nimport (\n    "fmt"\n    "io"\n    "net/http"\n`

    if (method === 'POST') {
      code += `    "net/url"\n    "strings"\n`
    }

    code += `)\n\nfunc main() {\n`

    if (
      method === 'GET' ||
      (method === 'POST' && bodyParams.length > 0 && queryParams.length > 0)
    ) {
      const qParams =
        method === 'GET' ? [...queryParams, ...bodyParams] : queryParams
      if (qParams.length > 0) {
        const queryStr = qParams
          .map((p) => `${p.name}=\${${p.param}}`)
          .join('&')
        finalUrl += (url.includes('?') ? '&' : '?') + queryStr
      }
    }

    code += `    url := "${finalUrl}"\n\n`

    if (method === 'POST') {
      code += `    data := url.Values{}\n`
      const targetParams = bodyParams.length > 0 ? bodyParams : queryParams
      targetParams.forEach((p) => {
        code += `    data.Set("${p.param}", "${p.docs || ''}")\n`
      })
      code += `\n    req, _ := http.NewRequest("POST", url, strings.NewReader(data.Encode()))\n`
      code += `    req.Header.Set("Content-Type", "application/x-www-form-urlencoded")\n`
    } else {
      code += `    req, _ := http.NewRequest("GET", url, nil)\n`
    }

    if (hasKeyParam) {
      code += `    req.Header.Set("Authorization", "Bearer YOUR_API_KEY")\n`
    }
    headerParams.forEach((p) => {
      code += `    req.Header.Set("${p.name}", "${p.docs || ''}")\n`
    })

    code += `\n    client := &http.Client{}\n`
    code += `    resp, err := client.Do(req)\n`
    code += `    if err != nil {\n`
    code += `        panic(err)\n`
    code += `    }\n`
    code += `    defer resp.Body.Close()\n\n`
    code += `    body, _ := io.ReadAll(resp.Body)\n`
    code += `    fmt.Println(string(body))\n`
    code += `}`

    return code
  }

  // 生成 C# 示例
  const generateCsharp = () => {
    let finalUrl = url
    let code = `using System;\nusing System.Net.Http;\nusing System.Collections.Generic;\nusing System.Threading.Tasks;\n\n`
    code += `class Program\n{\n`
    code += `    static async Task Main()\n    {\n`
    code += `        using var client = new HttpClient();\n\n`

    if (
      method === 'GET' ||
      (method === 'POST' && bodyParams.length > 0 && queryParams.length > 0)
    ) {
      const qParams =
        method === 'GET' ? [...queryParams, ...bodyParams] : queryParams
      if (qParams.length > 0) {
        const queryStr = qParams
          .map((p) => `${p.name}=\${${p.param}}`)
          .join('&')
        finalUrl += (url.includes('?') ? '&' : '?') + queryStr
      }
    }

    code += `        var url = "${finalUrl}";\n\n`

    if (hasKeyParam) {
      code += `        client.DefaultRequestHeaders.Add("Authorization", "Bearer YOUR_API_KEY");\n`
    }
    headerParams.forEach((p) => {
      code += `        client.DefaultRequestHeaders.Add("${p.name}", "${p.docs || ''}");\n`
    })

    if (method === 'POST') {
      code += `\n        var data = new Dictionary<string, string>\n        {\n`
      const targetParams = bodyParams.length > 0 ? bodyParams : queryParams
      targetParams.forEach((p, i) => {
        code += `            { "${p.param}", "${p.docs || ''}" }${i < targetParams.length - 1 ? ',' : ''}\n`
      })
      code += `        };\n\n`
      code += `        var content = new FormUrlEncodedContent(data);\n`
      code += `        var response = await client.PostAsync(url, content);\n`
    } else {
      code += `\n        var response = await client.GetAsync(url);\n`
    }

    code += `        var result = await response.Content.ReadAsStringAsync();\n`
    code += `        Console.WriteLine(result);\n`
    code += `    }\n`
    code += `}`

    return code
  }

  // 生成 Ruby 示例
  const generateRuby = () => {
    let finalUrl = url
    let code = `require 'net/http'\nrequire 'uri'\n\n`

    if (
      method === 'GET' ||
      (method === 'POST' && bodyParams.length > 0 && queryParams.length > 0)
    ) {
      const qParams =
        method === 'GET' ? [...queryParams, ...bodyParams] : queryParams
      if (qParams.length > 0) {
        const queryStr = qParams
          .map((p) => `${p.name}=\${${p.param}}`)
          .join('&')
        finalUrl += (url.includes('?') ? '&' : '?') + queryStr
      }
    }

    code += `uri = URI.parse('${finalUrl}')\n`
    code += `http = Net::HTTP.new(uri.host, uri.port)\n`
    if (url.startsWith('https')) {
      code += `http.use_ssl = true\n`
    }
    code += `\n`

    if (method === 'POST') {
      code += `request = Net::HTTP::Post.new(uri.request_uri)\n`
      code += `request['Content-Type'] = 'application/x-www-form-urlencoded'\n`
    } else {
      code += `request = Net::HTTP::Get.new(uri.request_uri)\n`
    }

    if (hasKeyParam) {
      code += `request['Authorization'] = 'Bearer YOUR_API_KEY'\n`
    }
    headerParams.forEach((p) => {
      code += `request['${p.name}'] = '${p.docs || ''}'\n`
    })

    if (method === 'POST') {
      const targetParams = bodyParams.length > 0 ? bodyParams : queryParams
      const formData = targetParams
        .map((p) => `'${p.param}' => '${p.docs || ''}'`)
        .join(', ')
      code += `\nrequest.set_form_data({ ${formData} })\n`
    }

    code += `\nresponse = http.request(request)\n`
    code += `puts response.body`

    return code
  }

  // 生成 Node.js 示例
  const generateNodejs = () => {
    let finalUrl = url
    let code = `const https = require('https');\nconst querystring = require('querystring');\n\n`

    if (
      method === 'GET' ||
      (method === 'POST' && bodyParams.length > 0 && queryParams.length > 0)
    ) {
      const qParams =
        method === 'GET' ? [...queryParams, ...bodyParams] : queryParams
      if (qParams.length > 0) {
        const queryStr = qParams
          .map((p) => `${p.name}=\${${p.param}}`)
          .join('&')
        finalUrl += (url.includes('?') ? '&' : '?') + queryStr
      }
    }

    if (method === 'POST') {
      code += `const postData = querystring.stringify({\n`
      const targetParams = bodyParams.length > 0 ? bodyParams : queryParams
      targetParams.forEach((p, i) => {
        code += `  '${p.param}': '${p.docs || ''}'${i < targetParams.length - 1 ? ',' : ''}\n`
      })
      code += `});\n\n`
    }

    code += `const options = {\n`
    code += `  method: '${method}',\n`
    code += `  headers: {\n`

    if (hasKeyParam) {
      code += `    'Authorization': 'Bearer YOUR_API_KEY',\n`
    }
    headerParams.forEach((p) => {
      code += `    '${p.name}': '${p.docs || ''}',\n`
    })

    if (method === 'POST') {
      code += `    'Content-Type': 'application/x-www-form-urlencoded',\n`
      code += `    'Content-Length': Buffer.byteLength(postData)\n`
    }

    code += `  }\n`
    code += `};\n\n`

    code += `const req = https.request('${finalUrl}', options, (res) => {\n`
    code += `  let data = '';\n`
    code += `  res.on('data', (chunk) => { data += chunk; });\n`
    code += `  res.on('end', () => { console.log(JSON.parse(data)); });\n`
    code += `});\n\n`

    code += `req.on('error', (error) => { console.error(error); });\n`

    if (method === 'POST') {
      code += `req.write(postData);\n`
    }

    code += `req.end();`

    return code
  }

  return {
    axios: generateAxios(),
    ajax: generateAjax(),
    fetch: generateFetch(),
    xhr: generateXhr(),
    php: generatePhp(),
    python: generatePython(),
    curl: generateCurl(),
    java: generateJava(),
    go: generateGo(),
    csharp: generateCsharp(),
    ruby: generateRuby(),
    nodejs: generateNodejs(),
  }
}

// 生成的示例代码
const generatedExamples = computed(() => {
  if (!apiInfo.value.url || !apiInfo.value.params) {
    return {
      axios: apiInfo.value.axios || '',
      ajax: apiInfo.value.ajax || '',
      fetch: apiInfo.value.fetch || '',
      xhr: apiInfo.value.xhr || '',
      php: apiInfo.value.php || '',
      python: apiInfo.value.python || '',
      curl: '',
      java: '',
      go: '',
      csharp: '',
      ruby: '',
      nodejs: '',
    }
  }
  return generateExamples()
})
</script>

<template>
  <div class="doc-container">
    <!-- 导航栏 -->
    <IndexNavbar></IndexNavbar>
    <div class="apiinfo-container">
      <!-- 主要内容 -->
      <div class="main-content">
        <!-- 接口概览 -->
        <div class="box" id="overview">
          <div class="api-header">
            <div class="api-heading">
              <div class="api-title-row">
                <h1>{{ apiInfo.name }}</h1>
                <div class="request-method-tags api-method-tags">
                  <span
                    v-for="method in docMethodList"
                    :key="`header-${method}`"
                    :class="[
                      'request-method-tag',
                      method === 'GET' ? 'is-get' : 'is-post',
                    ]"
                  >
                    {{ method }}
                  </span>
                </div>
              </div>
              <p class="description-text api-description">
                {{ apiInfo.description }}
              </p>
            </div>
            <div class="api-meta">
              <div class="api-actions">
                <el-button
                  type="primary"
                  @click="debugDialogRef?.openDebugDialog()"
                  class="debug-btn"
                >
                  <el-icon><VideoPlay /></el-icon>
                  在线调试
                </el-button>
                <el-button
                  type="info"
                  @click="$router.push(`/markdown/${route.params.alias}`)"
                  class="view-markdown-btn"
                >
                  <el-icon><Document /></el-icon>
                  查看Markdown
                </el-button>
              </div>
            </div>
          </div>

          <div class="api-url-section">
            <label class="url-label">接口地址：</label>
            <el-tooltip effect="dark" content="点击复制" placement="top">
              <div
                class="url-container"
                @click="copy(apiInfo.url)"
                ref="urlDom"
              >
                <code class="api-url">{{ apiInfo.url }}</code>
                <el-icon class="copy-icon"><CopyDocument /></el-icon>
              </div>
            </el-tooltip>
          </div>

          <div class="api-url-section" v-if="apiInfo.example_url">
            <label class="url-label">请求示例：</label>
            <el-tooltip effect="dark" content="点击复制" placement="top">
              <div class="url-container" @click="copy(apiInfo.example_url)">
                <code class="api-url">{{ apiInfo.example_url }}</code>
                <el-icon class="copy-icon"><CopyDocument /></el-icon>
              </div>
            </el-tooltip>
          </div>
        </div>

        <!-- 请求参数 -->
        <div class="box" id="parameters">
          <h2>请求参数</h2>
          <div class="table-container" v-if="!jsonBodyParam">
            <el-table
              :data="apiInfo.params"
              style="width: 100%"
              class="params-table"
            >
              <el-table-column
                prop="name"
                label="参数名"
                :width="isMobile ? 120 : 180"
              />
              <el-table-column
                prop="param"
                label="传递参数"
                :width="isMobile ? 140 : 180"
              />
              <el-table-column
                prop="position"
                label="传入位置"
                :width="isMobile ? 80 : 120"
              />
              <el-table-column
                prop="required"
                label="类型"
                :width="isMobile ? 80 : 100"
              >
                <template #default="scope">
                  <el-tag
                    :type="scope.row.required === '必传' ? 'danger' : 'info'"
                    size="small"
                  >
                    {{ scope.row.required }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="docs"
                label="参数说明"
                :min-width="isMobile ? 160 : 240"
              />
            </el-table>

            <!-- Key传递方式说明 -->
            <div
              v-if="
                apiInfo.params?.some(
                  (p) => String(p.name).toLowerCase() === 'key',
                )
              "
              class="key-guide-container"
            >
              <div class="key-guide-inline">
                <div class="key-guide-header">
                  <span class="key-guide-title">将 Key 放到 Header 中</span>
                  <span class="key-guide-text"
                    >使用 Authorization 请求头，按 Bearer Token 方式传递</span
                  >
                </div>
                <div
                  class="key-guide-code"
                  @click="copy('Authorization: Bearer YOUR_API_KEY')"
                >
                  <div class="key-guide-code-line">
                    <span class="label">Authorization:</span>
                    <span class="value">Bearer YOUR_API_KEY</span>
                  </div>
                  <el-icon class="copy-icon"><CopyDocument /></el-icon>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div style="margin-bottom: 10px">
              请优先使用 {{ preferredMethod }} 请求传递以下 JSON 参数：
            </div>
            <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(formattedJsonDocs)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="json" v-text="formattedJsonDocs"></code></pre>
          </div>
        </div>

        <!-- 返回参数 -->
        <div
          class="box"
          id="response-params"
          v-if="apiInfo.response_params && apiInfo.response_params.length > 0"
        >
          <h2>返回参数</h2>
          <div class="table-container">
            <el-table
              :data="apiInfo.response_params"
              row-key="id"
              :tree-props="{ children: 'children' }"
              default-expand-all
              class="params-table response-params-table"
            >
              <el-table-column
                prop="name"
                label="参数名"
                :min-width="isMobile ? 120 : 160"
              />
              <el-table-column
                prop="param"
                label="类型"
                :width="isMobile ? 80 : 100"
              />
              <el-table-column
                prop="docs"
                label="说明"
                :min-width="isMobile ? 160 : 220"
                show-overflow-tooltip
              />
              <el-table-column
                prop="example"
                label="示例值"
                :width="isMobile ? 120 : 220"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <code v-if="scope.row.example" class="example-value">{{
                    scope.row.example
                  }}</code>
                  <span v-else class="example-empty">—</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 套餐列表 -->
        <div
          class="box"
          id="packages"
          v-if="apiInfo.package_list && apiInfo.package_list.length > 0"
        >
          <h2>相关套餐</h2>
          <div class="table-container">
            <el-table
              :data="apiInfo.package_list"
              style="width: 100%"
              class="package-table"
            >
              <el-table-column prop="name" label="套餐名称" />
              <el-table-column prop="description" label="套餐描述" />
              <el-table-column label="套餐类型" width="100" align="center">
                <template #default="scope">
                  <el-tag
                    v-if="scope.row.type === 4"
                    type="danger"
                    size="small"
                  >
                    直接扣费
                  </el-tag>
                  <el-tag
                    v-else
                    :type="scope.row.type === 2 ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ scope.row.type === 2 ? '时长套餐' : '点数套餐' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="可用次数" width="100" align="center">
                <template #default="scope">
                  <span v-if="scope.row.type === 2">无限制</span>
                  <span v-else-if="scope.row.type === 4">按次扣费</span>
                  <span v-else>{{ scope.row.points }}次</span>
                </template>
              </el-table-column>
              <el-table-column label="有效期" width="100" align="center">
                <template #default="{ row }">
                  <span>
                    <!-- type为4或 duration <= 0 时显示永久 -->
                    {{
                      row.type === 4 || row.duration <= 0
                        ? '永久'
                        : row.duration + '天'
                    }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="price"
                label="价格"
                width="100"
                align="center"
              >
                <template #default="scope">
                  <span v-if="scope.row.type === 4" class="package-price-cell"
                    >¥{{ scope.row.price }}/次</span
                  >
                  <span v-else class="package-price-cell"
                    >¥{{ scope.row.price }}</span
                  >
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="scope">
                  <el-button
                    type="primary"
                    size="small"
                    @click="buyPackage(scope.row)"
                  >
                    购买
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <div v-if="bottomStats.length" class="box api-stats-box" id="api-stats">
          <h2>接口指标</h2>
          <div class="bottom-stats-grid">
            <div
              v-for="stat in bottomStats"
              :key="stat.key"
              class="bottom-stat-card"
            >
              <div class="bottom-stat-label">{{ stat.label }}</div>
              <div class="bottom-stat-value">
                {{ stat.value
                }}<span class="bottom-stat-unit">{{ stat.unit }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 广告位 -->
        <client-only>
          <div
            class="box ad-section"
            v-if="
              adDisplay &&
              !(apiInfo.package_list && apiInfo.package_list.length > 0)
            "
          >
            <h2>推荐内容</h2>
            <Ad @adInfo="adInfo"></Ad>
          </div>
        </client-only>

        <!-- 请求示例 -->
        <div class="box" id="examples">
          <h2>请求示例</h2>
          <div class="examples-container">
            <!-- 主标签页 -->
            <div class="language-tabs">
              <div
                v-for="lang in languages"
                :key="lang.name"
                :class="['language-tab', { active: activeName === lang.name }]"
                @click="activeName = lang.name"
              >
                {{ lang.label }}
              </div>
            </div>

            <!-- JavaScript 子标签页 -->
            <div v-if="activeName === 'javascript'" class="sub-language-tabs">
              <div
                v-for="lib in jsLibraries"
                :key="lib.name"
                :class="[
                  'sub-language-tab',
                  { active: jsActiveName === lib.name },
                ]"
                @click="jsActiveName = lib.name"
              >
                {{ lib.label }}
              </div>
            </div>

            <!-- 代码展示区域 -->
            <div class="code-display">
              <!-- Shell -->
              <div v-if="activeName === 'shell'">
                <div class="example-code-block mac_light">
                  <client-only>
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      content="复制"
                      placement="left"
                    >
                      <div class="copy" @click="copy(generatedExamples.curl)">
                        <el-icon size="14"><CopyDocument /></el-icon>
                      </div>
                    </el-tooltip>
                  </client-only>
                  <div class="example-code-grid">
                    <div class="example-line-numbers" aria-hidden="true">
                      <span
                        v-for="(_, index) in getCodeLines(
                          generatedExamples.curl,
                        )"
                        :key="`curl-line-${index}`"
                        class="example-line-number"
                      >
                        {{ index + 1 }}
                      </span>
                    </div>
                    <pre class="example mac_pre example-code-pre"><code
                        class="bash"
                        v-text="generatedExamples.curl"
                      ></code></pre>
                  </div>
                </div>
              </div>

              <!-- JavaScript -->
              <div v-if="activeName === 'javascript'">
                <div v-if="jsActiveName === 'axios'">
                  <div class="example-code-block mac_light">
                    <client-only>
                      <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="复制"
                        placement="left"
                      >
                        <div
                          class="copy"
                          @click="copy(generatedExamples.axios)"
                        >
                          <el-icon size="14"><CopyDocument /></el-icon>
                        </div>
                      </el-tooltip>
                    </client-only>
                    <div class="example-code-grid">
                      <div class="example-line-numbers" aria-hidden="true">
                        <span
                          v-for="(_, index) in getCodeLines(
                            generatedExamples.axios,
                          )"
                          :key="`axios-line-${index}`"
                          class="example-line-number"
                        >
                          {{ index + 1 }}
                        </span>
                      </div>
                      <pre class="example mac_pre example-code-pre"><code
                          class="javascript.js"
                          v-text="generatedExamples.axios"
                        ></code></pre>
                    </div>
                  </div>
                </div>
                <div v-if="jsActiveName === 'fetch'">
                  <div class="example-code-block mac_light">
                    <client-only>
                      <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="复制"
                        placement="left"
                      >
                        <div
                          class="copy"
                          @click="copy(generatedExamples.fetch)"
                        >
                          <el-icon size="14"><CopyDocument /></el-icon>
                        </div>
                      </el-tooltip>
                    </client-only>
                    <div class="example-code-grid">
                      <div class="example-line-numbers" aria-hidden="true">
                        <span
                          v-for="(_, index) in getCodeLines(
                            generatedExamples.fetch,
                          )"
                          :key="`fetch-line-${index}`"
                          class="example-line-number"
                        >
                          {{ index + 1 }}
                        </span>
                      </div>
                      <pre class="example mac_pre example-code-pre"><code
                          class="javascript.js"
                          v-text="generatedExamples.fetch"
                        ></code></pre>
                    </div>
                  </div>
                </div>
                <div v-if="jsActiveName === 'ajax'">
                  <div class="example-code-block mac_light">
                    <client-only>
                      <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="复制"
                        placement="left"
                      >
                        <div class="copy" @click="copy(generatedExamples.ajax)">
                          <el-icon size="14"><CopyDocument /></el-icon>
                        </div>
                      </el-tooltip>
                    </client-only>
                    <div class="example-code-grid">
                      <div class="example-line-numbers" aria-hidden="true">
                        <span
                          v-for="(_, index) in getCodeLines(
                            generatedExamples.ajax,
                          )"
                          :key="`ajax-line-${index}`"
                          class="example-line-number"
                        >
                          {{ index + 1 }}
                        </span>
                      </div>
                      <pre class="example mac_pre example-code-pre"><code
                          class="javascript.js"
                          v-text="generatedExamples.ajax"
                        ></code></pre>
                    </div>
                  </div>
                </div>
                <div v-if="jsActiveName === 'xhr'">
                  <div class="example-code-block mac_light">
                    <client-only>
                      <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="复制"
                        placement="left"
                      >
                        <div class="copy" @click="copy(generatedExamples.xhr)">
                          <el-icon size="14"><CopyDocument /></el-icon>
                        </div>
                      </el-tooltip>
                    </client-only>
                    <div class="example-code-grid">
                      <div class="example-line-numbers" aria-hidden="true">
                        <span
                          v-for="(_, index) in getCodeLines(
                            generatedExamples.xhr,
                          )"
                          :key="`xhr-line-${index}`"
                          class="example-line-number"
                        >
                          {{ index + 1 }}
                        </span>
                      </div>
                      <pre class="example mac_pre example-code-pre"><code
                          class="javascript.js"
                          v-text="generatedExamples.xhr"
                        ></code></pre>
                    </div>
                  </div>
                </div>
                <div v-if="jsActiveName === 'nodejs'">
                  <div class="example-code-block mac_light">
                    <client-only>
                      <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="复制"
                        placement="left"
                      >
                        <div
                          class="copy"
                          @click="copy(generatedExamples.nodejs)"
                        >
                          <el-icon size="14"><CopyDocument /></el-icon>
                        </div>
                      </el-tooltip>
                    </client-only>
                    <div class="example-code-grid">
                      <div class="example-line-numbers" aria-hidden="true">
                        <span
                          v-for="(_, index) in getCodeLines(
                            generatedExamples.nodejs,
                          )"
                          :key="`nodejs-line-${index}`"
                          class="example-line-number"
                        >
                          {{ index + 1 }}
                        </span>
                      </div>
                      <pre class="example mac_pre example-code-pre"><code
                          class="javascript.js"
                          v-text="generatedExamples.nodejs"
                        ></code></pre>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Python -->
              <div v-if="activeName === 'python'">
                <div class="example-code-block mac_light">
                  <client-only>
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      content="复制"
                      placement="left"
                    >
                      <div class="copy" @click="copy(generatedExamples.python)">
                        <el-icon size="14"><CopyDocument /></el-icon>
                      </div>
                    </el-tooltip>
                  </client-only>
                  <div class="example-code-grid">
                    <div class="example-line-numbers" aria-hidden="true">
                      <span
                        v-for="(_, index) in getCodeLines(
                          generatedExamples.python,
                        )"
                        :key="`python-line-${index}`"
                        class="example-line-number"
                      >
                        {{ index + 1 }}
                      </span>
                    </div>
                    <pre class="example mac_pre example-code-pre"><code
                        class="python"
                        v-text="generatedExamples.python"
                      ></code></pre>
                  </div>
                </div>
              </div>

              <!-- PHP -->
              <div v-if="activeName === 'php'">
                <div class="example-code-block mac_light">
                  <client-only>
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      content="复制"
                      placement="left"
                    >
                      <div class="copy" @click="copy(generatedExamples.php)">
                        <el-icon size="14"><CopyDocument /></el-icon>
                      </div>
                    </el-tooltip>
                  </client-only>
                  <div class="example-code-grid">
                    <div class="example-line-numbers" aria-hidden="true">
                      <span
                        v-for="(_, index) in getCodeLines(
                          generatedExamples.php,
                        )"
                        :key="`php-line-${index}`"
                        class="example-line-number"
                      >
                        {{ index + 1 }}
                      </span>
                    </div>
                    <pre class="example mac_pre example-code-pre"><code
                        class="php"
                        v-text="generatedExamples.php"
                      ></code></pre>
                  </div>
                </div>
              </div>

              <!-- Java -->
              <div v-if="activeName === 'java'">
                <div class="example-code-block mac_light">
                  <client-only>
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      content="复制"
                      placement="left"
                    >
                      <div class="copy" @click="copy(generatedExamples.java)">
                        <el-icon size="14"><CopyDocument /></el-icon>
                      </div>
                    </el-tooltip>
                  </client-only>
                  <div class="example-code-grid">
                    <div class="example-line-numbers" aria-hidden="true">
                      <span
                        v-for="(_, index) in getCodeLines(
                          generatedExamples.java,
                        )"
                        :key="`java-line-${index}`"
                        class="example-line-number"
                      >
                        {{ index + 1 }}
                      </span>
                    </div>
                    <pre class="example mac_pre example-code-pre"><code
                        class="java"
                        v-text="generatedExamples.java"
                      ></code></pre>
                  </div>
                </div>
              </div>

              <!-- Go -->
              <div v-if="activeName === 'go'">
                <div class="example-code-block mac_light">
                  <client-only>
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      content="复制"
                      placement="left"
                    >
                      <div class="copy" @click="copy(generatedExamples.go)">
                        <el-icon size="14"><CopyDocument /></el-icon>
                      </div>
                    </el-tooltip>
                  </client-only>
                  <div class="example-code-grid">
                    <div class="example-line-numbers" aria-hidden="true">
                      <span
                        v-for="(_, index) in getCodeLines(generatedExamples.go)"
                        :key="`go-line-${index}`"
                        class="example-line-number"
                      >
                        {{ index + 1 }}
                      </span>
                    </div>
                    <pre class="example mac_pre example-code-pre"><code
                        class="go"
                        v-text="generatedExamples.go"
                      ></code></pre>
                  </div>
                </div>
              </div>

              <!-- C# -->
              <div v-if="activeName === 'csharp'">
                <div class="example-code-block mac_light">
                  <client-only>
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      content="复制"
                      placement="left"
                    >
                      <div class="copy" @click="copy(generatedExamples.csharp)">
                        <el-icon size="14"><CopyDocument /></el-icon>
                      </div>
                    </el-tooltip>
                  </client-only>
                  <div class="example-code-grid">
                    <div class="example-line-numbers" aria-hidden="true">
                      <span
                        v-for="(_, index) in getCodeLines(
                          generatedExamples.csharp,
                        )"
                        :key="`csharp-line-${index}`"
                        class="example-line-number"
                      >
                        {{ index + 1 }}
                      </span>
                    </div>
                    <pre class="example mac_pre example-code-pre"><code
                        class="csharp"
                        v-text="generatedExamples.csharp"
                      ></code></pre>
                  </div>
                </div>
              </div>

              <!-- Ruby -->
              <div v-if="activeName === 'ruby'">
                <div class="example-code-block mac_light">
                  <client-only>
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      content="复制"
                      placement="left"
                    >
                      <div class="copy" @click="copy(generatedExamples.ruby)">
                        <el-icon size="14"><CopyDocument /></el-icon>
                      </div>
                    </el-tooltip>
                  </client-only>
                  <div class="example-code-grid">
                    <div class="example-line-numbers" aria-hidden="true">
                      <span
                        v-for="(_, index) in getCodeLines(
                          generatedExamples.ruby,
                        )"
                        :key="`ruby-line-${index}`"
                        class="example-line-number"
                      >
                        {{ index + 1 }}
                      </span>
                    </div>
                    <pre class="example mac_pre example-code-pre"><code
                        class="ruby"
                        v-text="generatedExamples.ruby"
                      ></code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 返回示例 -->
        <div class="box" id="response">
          <h2>返回示例</h2>
          <div class="response-container">
            <!-- 高级模式：HTML内容 -->
            <div v-if="isHtmlContent" class="example-html-container">
              <client-only>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="复制"
                  placement="left"
                >
                  <div class="copy" @click="copy(apiInfo.example)">
                    <el-icon size="14"><CopyDocument /></el-icon>
                  </div>
                </el-tooltip>
              </client-only>
              <div class="html-content" v-html="highlightedExample"></div>
            </div>

            <!-- 基础模式：代码格式 -->
            <div v-else class="response-code-block mac_light">
              <client-only>
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="复制"
                  placement="left"
                >
                  <div class="copy" @click="copy(apiInfo.example)">
                    <el-icon size="14"><CopyDocument /></el-icon>
                  </div>
                </el-tooltip>
              </client-only>
              <div class="response-code-grid">
                <div class="response-line-numbers" aria-hidden="true">
                  <span
                    v-for="(_, index) in responseExampleLines"
                    :key="`response-line-${index}`"
                    class="response-line-number"
                  >
                    {{ index + 1 }}
                  </span>
                </div>
                <pre class="example mac_pre response-code-pre"><code
                    class="json"
                    v-html="highlightedExample"
                  ></code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 调试对话框 -->
    <DocApiDebugDialog ref="debugDialogRef" :api-info="apiInfo" />

    <IndexAi :alias="route.params.alias"></IndexAi>
    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<style lang="less" scoped>
.bottom-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.api-stats-box {
  padding-bottom: 0;
}

.bottom-stat-card {
  padding: 18px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.bottom-stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 10px;
  letter-spacing: 0.3px;
}

.bottom-stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.bottom-stat-unit {
  font-size: 14px;
  font-weight: 400;
  color: #94a3b8;
  margin-left: 6px;
}

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
</style>

<style lang="less">
.el-message {
  z-index: 9999 !important;
}

.doc-container {
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';

  .apiinfo-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 24px;
    display: block;

    @media (max-width: 1024px) {
      padding: 24px 16px;
    }

    .main-content {
      display: block;
    }

    .box {
      background: transparent;
      padding: 32px 0;

      &:last-child {
        border-bottom: none;
      }

      .api-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;

        @media (max-width: 768px) {
          flex-direction: column;
          gap: 16px;
        }

        h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }

        .api-heading {
          flex: 1;
          min-width: 0;
        }

        .api-title-row {
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 12px;

          @media (max-width: 768px) {
            align-items: flex-end !important;
          }
        }

        .api-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 12px;
          flex-shrink: 0;

          .api-actions {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 12px;
          }

          @media (max-width: 768px) {
            width: 100%;
            align-items: flex-start;

            .api-actions {
              justify-content: flex-start;
            }
          }

          .debug-btn {
            margin-left: 0;
          }

          .view-markdown-btn {
            margin-left: 0;
          }
        }
      }

      .request-method-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .request-method-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 42px;
        padding: 4px 4px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 700;
        line-height: 1;
      }

      .request-method-tag.is-get {
        color: #17b26a;
        background: #e3f6ed;
      }

      .request-method-tag.is-post {
        color: #ef6820;
        background: #fdede4;
      }

      .api-url-section {
        margin-top: 24px;
        .url-label {
          display: block;
          font-weight: 600;
          color: #475569;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .url-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 0;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease;

          .api-url {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            color: #1e293b;
            background: none;
            border: none;
            flex: 1;
          }

          .copy-icon {
            color: #64748b;

            &:hover {
              color: #409eff;
            }
          }

          &:hover {
            background: #f8fafc;
            border-color: #cdd5df;
          }
        }
      }

      .description-text {
        font-size: 16px;
        line-height: 1.6;
        color: #475569;
        margin: 0;
      }

      .api-description {
        margin-top: 24px;
      }

      .api-method-tags {
        flex-shrink: 0;
      }

      .table-container {
        .params-table,
        .package-table {
          .el-table__header {
            background: #f8fafc;

            th {
              background: #f8fafc !important;
              color: #374151;
              font-weight: 600;
              border-bottom: 1px solid #e2e8f0;
            }
          }

          .el-table__body {
            tr {
              &:hover {
                background: #f8fafc;
              }

              td {
                border-bottom: 1px solid #f1f5f9;
              }
            }
          }
        }

        .example-value {
          display: inline-block;
          padding: 2px 8px;
          font-size: 13px;
          font-family:
            'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          color: #334155;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 3px;
          line-height: 1.5;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .example-empty {
          color: #cbd5e1;
          font-size: 14px;
        }
      }

      .examples-container {
        // 主语言标签页
        .language-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 0;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;

          .language-tab {
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 500;
            color: #64748b;
            background: transparent;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            margin-bottom: -18px;

            &:hover {
              color: #3b82f6;
            }

            &.active {
              color: #3b82f6;
              border-bottom-color: #3b82f6;
            }
          }
        }

        // JavaScript 子标签页
        .sub-language-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 0;
          padding: 16px 0;
          border-bottom: 2px solid #e2e8f0;

          .sub-language-tab {
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 500;
            color: #64748b;
            background: transparent;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            margin-bottom: -18px;

            &:hover {
              color: #3b82f6;
            }

            &.active {
              color: #3b82f6;
              border-bottom-color: #3b82f6;
            }
          }
        }

        // 代码展示区域
        .code-display {
          margin-top: 20px;

          .example-code-block {
            position: relative;
            background: #f9fafb;
            border: 1px solid #f1f5f9;
            border-radius: 8px;
            overflow: hidden;

            .copy {
              position: absolute;
              top: 12px;
              right: 12px;
              padding: 6px;
              background: rgba(255, 255, 255, 0.95);
              border-radius: 4px;
              opacity: 0;
              transition: all 0.3s ease;
              cursor: pointer;
              z-index: 1;

              &:hover {
                background: #fff;
              }
            }

            &:hover .copy {
              opacity: 1;
            }
          }

          .example-code-grid {
            display: grid;
            grid-template-columns: auto minmax(0, 1fr);
          }

          .example-line-numbers {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            padding: 16px 12px 16px 16px;
            background: #f8fafc;
            border-right: 1px solid #e2e8f0;
            user-select: none;
          }

          .example-line-number {
            min-width: 24px;
            font-size: 13px;
            line-height: 1.6;
            color: #94a3b8;
            text-align: right;
            font-variant-numeric: tabular-nums;
          }

          .example-code-pre {
            overflow-x: auto;
            border-radius: 0;
            border: none;

            code {
              display: block;
              white-space: pre;
              word-break: normal;
            }
          }
        }

        .example-tabs {
          .el-tabs__nav-scroll {
            margin-bottom: 15px;
          }

          .el-tabs__header {
            margin-bottom: 20px;

            .el-tabs__nav {
              border-radius: 12px;
              overflow: hidden;

              .el-tabs__item {
                &.is-active {
                  background: #3b82f6;
                  color: white;
                }
              }
            }
          }
        }

        // 子标签页样式
        .sub-tabs {
          margin-top: 20px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;

          :deep(.el-tabs__header) {
            margin-bottom: 20px;
          }

          :deep(.el-tabs__nav-wrap) {
            &::after {
              display: none;
            }
          }

          :deep(.el-tabs__nav) {
            border: none;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          :deep(.el-tabs__item) {
            border: 1px solid #cbd5e1;
            margin-right: 0;
            border-radius: 8px;
            height: 36px;
            line-height: 36px;
            padding: 0 20px;
            font-size: 14px;
            font-weight: 500;
            background: white;
            color: #64748b;
            transition: all 0.3s ease;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

            &.is-active {
              background: linear-gradient(135deg, #3b82f6, #2563eb);
              border-color: #3b82f6;
              color: white;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
              transform: translateY(-2px);
            }

            &:hover:not(.is-active) {
              color: #3b82f6;
              background: #eff6ff;
              border-color: #93c5fd;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
            }
          }

          // 子标签页内容区域
          :deep(.el-tabs__content) {
            .el-tab-pane {
              .example {
                border-radius: 8px;
                overflow: hidden;
              }
            }
          }
        }
      }

      .response-container {
        .response-code-block {
          position: relative;
          background: #f9fafb;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;

          .copy {
            position: absolute;
            top: 12px;
            right: 12px;
            padding: 6px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 4px;
            opacity: 0;
            transition: all 0.3s ease;
            cursor: pointer;
            z-index: 1;

            &:hover {
              background: #fff;
            }
          }

          &:hover .copy {
            opacity: 1;
          }
        }

        .response-code-grid {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
        }

        .response-line-numbers {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding: 16px 12px 16px 16px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          user-select: none;
        }

        .response-line-number {
          min-width: 24px;
          font-size: 13px;
          line-height: 1.6;
          color: #94a3b8;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .response-code-pre {
          overflow-x: auto;
          border-radius: 0;
          border: none;

          code {
            display: block;
            white-space: pre;
            word-break: normal;
          }
        }

        .example-html-container {
          border: 1px solid #e2e8f0;
        }
      }

      .ad-section {
        h2 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: #374151;
        }
      }

      h1 {
        font-size: 28px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 24px 0;
      }

      h2 {
        position: relative;
        font-size: 20px;
        color: #1e293b;
        font-weight: 600;
        margin: 0 0 20px 0;
        padding-left: 12px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e2e8f0;
        line-height: 1.4;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 16px;
          background: #cbd5e1;
          border-radius: 3px;
        }
      }

      .url {
        font-weight: 500;
        margin: 0 12px;
        padding: 6px 12px;
        cursor: pointer;
        color: #475569;
        font-size: 14px;
        user-select: all;
        border-radius: 4px;
        transition: all 0.3s ease;
        text-decoration: none;
        outline: none;
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        border: 1px solid rgba(203, 213, 224, 0.8);

        &:hover {
          opacity: 0.8;
        }

        &:active,
        &:focus {
          outline: none;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
          border-color: #94a3b8;
        }
      }

      .el-tag {
        font-weight: 500;
        height: 28px;
      }

      .el-button {
        margin-left: 12px;

        .el-icon {
          margin-right: 4px;
        }
      }
    }

    .example {
      width: 100%;
      margin: 0;

      code {
        white-space: pre-wrap;
        word-break: break-all;
      }

      .hljs {
        background: transparent;
        padding: 0;
      }
    }

    pre {
      display: block;
      position: relative;
      padding: 16px;
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      border-radius: 8px;

      .copy {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 6px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 4px;
        opacity: 0;
        transition: all 0.3s ease;
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
      background: #f9fafb !important;
      border: 1px solid #f1f5f9;
    }

    .mac_light code {
      background: transparent !important;
    }

    .mac_pre::before {
      display: none;
    }

    // 高级模式HTML容器样式
    .example-html-container {
      position: relative;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
      overflow: hidden;

      &::before {
        content: '';
        display: block;
        height: 12px;
        margin: 10px 0 16px 16px;
        border-radius: 50%;
        background: #ff5f56;
        box-shadow:
          20px 0 #ffbd2e,
          40px 0 #27c93f;
        width: 12px;
      }

      .copy {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 6px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.3s ease;
        cursor: pointer;
        z-index: 10;

        &:hover {
          background: #fff;
        }
      }

      &:hover .copy {
        opacity: 1;
      }

      .html-content {
        padding: 16px;
        padding-top: 0;
        min-height: 60px;
        line-height: 1.6;
        color: #2c3e50;

        // 确保富文本内容的样式
        :deep(p) {
          margin: 0 0 12px 0;
          line-height: 1.6;

          &:last-child {
            margin-bottom: 0;
          }
        }

        :deep(h1, h2, h3, h4, h5, h6) {
          margin: 16px 0 8px 0;
          color: #2c3e50;

          &:first-child {
            margin-top: 0;
          }
        }

        :deep(ul, ol) {
          margin: 8px 0;
          padding-left: 24px;
        }

        :deep(li) {
          margin: 4px 0;
        }

        :deep(strong) {
          font-weight: 600;
          color: #1a202c;
        }

        :deep(em) {
          font-style: italic;
        }

        :deep(code) {
          background: #e2e8f0;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          color: #e53e3e;
        }

        :deep(pre) {
          background: #2d3748;
          color: #e2e8f0;
          padding: 12px;
          border-radius: 6px;
          margin: 12px 0;
          overflow-x: auto;

          code {
            background: transparent;
            color: inherit;
            padding: 0;
          }
        }

        :deep(blockquote) {
          border-left: 4px solid #409eff;
          margin: 12px 0;
          padding: 8px 16px;
          background: #f0f9ff;
          color: #1a365d;
        }

        :deep(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;

          th,
          td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: left;
          }

          th {
            background: #f9fafb;
            border: 1px solid #f1f5f9;
            font-weight: 600;
          }
        }

        :deep(a) {
          color: #409eff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }

        :deep(img) {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 8px 0;
        }
      }
    }

    .el-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 16px;
      }

      :deep(.el-tabs__nav) {
        border: none;
      }

      :deep(.el-tabs__item) {
        border: 1px solid #eaecf0;
        margin-right: 8px;
        border-radius: 8px;
        height: 32px;
        line-height: 32px;

        &.is-active {
          background: #ecf5ff;
          border-color: #b3d8ff;
          color: #409eff;
        }

        &:hover {
          color: #1a1f36;
        }
      }
    }

    .el-table {
      border-radius: 12px;
      overflow: hidden;

      :deep(th) {
        background: #f9fafb;
        color: #1a202c;
        font-weight: 600;
        padding: 8px 16px;
        height: 40px;
      }

      :deep(td) {
        padding: 8px 16px;
        height: 40px;
      }

      :deep(.el-table__header) {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        overflow: hidden;
      }

      :deep(.cell) {
        font-size: 13px;
        line-height: 1.4;
      }
    }
  }

  @media screen and (max-width: 768px) {
    .apiinfo-container {
      width: 92%;
      padding: 20px 0;

      .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .params-table {
        :deep(.el-table__header th),
        :deep(.el-table__body td) {
          padding: 6px 8px;
        }
      }

      :deep(.el-table .cell) {
        font-size: 12px;
        line-height: 1.5;
        white-space: normal;
        word-break: break-word;
      }

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

@media screen and (max-width: 768px) {
  .doc-container {
    .apiinfo-container {
      width: 95%;
      padding: 20px 0;
    }
  }
}
</style>
