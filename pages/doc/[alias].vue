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
const methodGuideText = computed(() => {
  if (docMethodList.value.length <= 1) {
    return `当前接口使用 ${preferredMethod.value} 请求`
  }

  return `当前接口支持 ${docMethodList.value.join(' / ')}，推荐优先使用 ${preferredMethod.value}`
})

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

// 添加新的计算属性
const highlightedExample = computed(() => {
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
    // 使用highlight.js进行代码高亮
    if (hljs) return hljs.highlight(formatted, { language: 'json' }).value
    return formatted
  } catch (e) {
    // 如果解析失败,直接返回原始内容
    return apiInfo.value.example
  }
})

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

// 检查是否显示服务指标模块
const shouldShowStats = computed(() => {
  const { qps, avg_response_time, today_call_count, total_call_count } =
    apiInfo.value
  // 如果所有指标都是-1或undefined，则不显示
  const allInvalid =
    (qps === -1 || qps === undefined) &&
    (avg_response_time === -1 || avg_response_time === undefined) &&
    (today_call_count === -1 || today_call_count === undefined) &&
    (total_call_count === -1 || total_call_count === undefined)
  return !allInvalid
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
      <!-- 侧边导航 -->
      <div class="sidebar">
        <div class="nav-title">{{ apiInfo.name }}</div>
        <ul class="nav-menu">
          <li class="nav-item">
            <a href="#overview" class="active">接口概览</a>
          </li>
          <li class="nav-item" v-if="shouldShowStats">
            <a href="#stats">服务指标</a>
          </li>
          <li class="nav-item">
            <a href="#request-method">请求方法</a>
          </li>
          <li class="nav-item">
            <a href="#description">接口描述</a>
          </li>
          <li class="nav-item">
            <a href="#parameters">请求参数</a>
          </li>
          <li
            class="nav-item"
            v-if="apiInfo.response_params && apiInfo.response_params.length > 0"
          >
            <a href="#response-params">返回参数</a>
          </li>
          <li
            class="nav-item"
            v-if="apiInfo.package_list && apiInfo.package_list.length > 0"
          >
            <a href="#packages">相关套餐</a>
          </li>
          <li class="nav-item">
            <a href="#examples">请求示例</a>
          </li>
          <li class="nav-item">
            <a href="#response">返回示例</a>
          </li>
        </ul>
      </div>

      <!-- 主要内容 -->
      <div class="main-content">
        <!-- 接口概览 -->
        <div class="box" id="overview">
          <div class="api-header">
            <h1>{{ apiInfo.name }}</h1>
            <div class="api-meta">
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

        <!-- 服务指标 -->
        <div class="box" id="stats" v-if="shouldShowStats">
          <h2>服务指标</h2>
          <div class="stats-grid">
            <div
              class="stat-card"
              v-if="apiInfo.qps !== undefined && apiInfo.qps !== -1"
            >
              <div class="stat-icon qps-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">QPS 上限</div>
                <div class="stat-value">
                  {{ apiInfo.qps }}<span class="stat-unit">次/秒</span>
                </div>
              </div>
            </div>

            <div
              class="stat-card"
              v-if="
                apiInfo.avg_response_time !== undefined &&
                apiInfo.avg_response_time !== -1
              "
            >
              <div class="stat-icon time-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">平均响应时间</div>
                <div class="stat-value">
                  {{ apiInfo.avg_response_time
                  }}<span class="stat-unit">ms</span>
                </div>
              </div>
            </div>

            <div
              class="stat-card"
              v-if="
                apiInfo.today_call_count !== undefined &&
                apiInfo.today_call_count !== -1
              "
            >
              <div class="stat-icon today-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">今日调用量</div>
                <div class="stat-value">
                  {{ formatLargeNumber(apiInfo.today_call_count)
                  }}<span class="stat-unit">次</span>
                </div>
              </div>
            </div>

            <div
              class="stat-card"
              v-if="
                apiInfo.total_call_count !== undefined &&
                apiInfo.total_call_count !== -1
              "
            >
              <div class="stat-icon total-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                  />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">累计调用量</div>
                <div class="stat-value">
                  {{ formatLargeNumber(apiInfo.total_call_count)
                  }}<span class="stat-unit">次</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 请求方法 -->
        <div class="box" id="request-method">
          <h2>请求方法</h2>
          <div class="request-method-panel">
            <div class="request-method-header">
              <span class="request-method-label">调用方式</span>
              <div class="request-method-tags">
                <span
                  v-for="method in docMethodList"
                  :key="`box-${method}`"
                  :class="[
                    'request-method-tag',
                    method === 'GET' ? 'is-get' : 'is-post',
                  ]"
                >
                  {{ method }}
                </span>
              </div>
            </div>
            <p class="request-method-text">{{ methodGuideText }}</p>
          </div>
        </div>

        <!-- 接口描述 -->
        <div class="box" id="description">
          <h2>接口描述</h2>
          <p class="description-text">{{ apiInfo.description }}</p>
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
              <div class="usage-guide">
                <div class="guide-title">
                  <el-icon><Connection /></el-icon>
                  <span>怎么传递这个 Key？</span>
                </div>
                <div class="method-cards">
                  <!-- 方法1 -->
                  <div class="method-card recommended">
                    <div class="card-badge">推荐</div>
                    <div class="card-title">方法 1：Bearer Token (Header)</div>
                    <div class="card-desc">标准规范，兼容性最好，最安全</div>
                    <div
                      class="code-block"
                      @click="copy('Authorization: Bearer Key')"
                    >
                      <div class="code-line">
                        <span class="label">Authorization:</span>
                        <span class="value">Bearer Key</span>
                      </div>
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </div>
                  </div>

                  <!-- 方法2 -->
                  <div class="method-card">
                    <div class="card-title">方法 2：放在请求头 (Header)</div>
                    <div class="card-desc">
                      直接使用 Authorization，无需前缀
                    </div>
                    <div class="code-block" @click="copy('Authorization: Key')">
                      <div class="code-line">
                        <span class="label">Authorization:</span>
                        <span class="value">Key</span>
                      </div>
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </div>
                  </div>

                  <!-- 方法3 -->
                  <div class="method-card">
                    <div class="card-title">方法 3：放在请求头 (Header)</div>
                    <div class="card-desc">自定义 Header key 字段</div>
                    <div class="code-block" @click="copy('key: Key')">
                      <div class="code-line">
                        <span class="label">key:</span>
                        <span class="value">Key</span>
                      </div>
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </div>
                  </div>

                  <!-- 方法4 -->
                  <!-- <div class="method-card deprecated">
                    <div class="card-badge">不推荐</div>
                    <div class="card-title">方法 4：放在网址后面 (Query)</div>
                    <div class="card-desc">
                      不安全，可能泄露 Key，<span class="danger-text"
                        >即将弃用</span
                      >
                    </div>
                    <div class="code-block" @click="copy('?key=Key')">
                      <div class="code-line">
                        <span class="label">网址?key=</span>
                        <span class="value">Key</span>
                      </div>
                      <el-icon class="copy-icon"><CopyDocument /></el-icon>
                    </div>
                  </div> -->
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
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(generatedExamples.curl)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="bash" v-text="generatedExamples.curl"></code></pre>
              </div>

              <!-- JavaScript -->
              <div v-if="activeName === 'javascript'">
                <div v-if="jsActiveName === 'axios'">
                  <pre
                    class="example mac_light mac_pre"
                  ><client-only><el-tooltip
                  class="box-item"
                  effect="dark"
                  content="复制"
                  placement="left"
                ><div class="copy" @click="copy(generatedExamples.axios)"><el-icon size="14"><CopyDocument /></el-icon></div
                ></el-tooltip></client-only><code class="javascript.js" v-text="generatedExamples.axios"></code></pre>
                </div>
                <div v-if="jsActiveName === 'fetch'">
                  <pre
                    class="example mac_light mac_pre"
                  ><client-only><el-tooltip
                  class="box-item"
                  effect="dark"
                  content="复制"
                  placement="left"
                ><div class="copy" @click="copy(generatedExamples.fetch)"><el-icon size="14"><CopyDocument /></el-icon></div
                ></el-tooltip></client-only><code class="javascript.js" v-text="generatedExamples.fetch"></code></pre>
                </div>
                <div v-if="jsActiveName === 'ajax'">
                  <pre
                    class="example mac_light mac_pre"
                  ><client-only><el-tooltip
                  class="box-item"
                  effect="dark"
                  content="复制"
                  placement="left"
                ><div class="copy" @click="copy(generatedExamples.ajax)"><el-icon size="14"><CopyDocument /></el-icon></div
                ></el-tooltip></client-only><code class="javascript.js" v-text="generatedExamples.ajax"></code></pre>
                </div>
                <div v-if="jsActiveName === 'xhr'">
                  <pre
                    class="example mac_light mac_pre"
                  ><client-only><el-tooltip
                  class="box-item"
                  effect="dark"
                  content="复制"
                  placement="left"
                ><div class="copy" @click="copy(generatedExamples.xhr)"><el-icon size="14"><CopyDocument /></el-icon></div
                ></el-tooltip></client-only><code class="javascript.js" v-text="generatedExamples.xhr"></code></pre>
                </div>
                <div v-if="jsActiveName === 'nodejs'">
                  <pre
                    class="example mac_light mac_pre"
                  ><client-only><el-tooltip
                  class="box-item"
                  effect="dark"
                  content="复制"
                  placement="left"
                ><div class="copy" @click="copy(generatedExamples.nodejs)"><el-icon size="14"><CopyDocument /></el-icon></div
                ></el-tooltip></client-only><code class="javascript.js" v-text="generatedExamples.nodejs"></code></pre>
                </div>
              </div>

              <!-- Python -->
              <div v-if="activeName === 'python'">
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(generatedExamples.python)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="python" v-text="generatedExamples.python"></code></pre>
              </div>

              <!-- PHP -->
              <div v-if="activeName === 'php'">
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(generatedExamples.php)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="php" v-text="generatedExamples.php"></code></pre>
              </div>

              <!-- Java -->
              <div v-if="activeName === 'java'">
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(generatedExamples.java)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="java" v-text="generatedExamples.java"></code></pre>
              </div>

              <!-- Go -->
              <div v-if="activeName === 'go'">
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(generatedExamples.go)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="go" v-text="generatedExamples.go"></code></pre>
              </div>

              <!-- C# -->
              <div v-if="activeName === 'csharp'">
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(generatedExamples.csharp)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="csharp" v-text="generatedExamples.csharp"></code></pre>
              </div>

              <!-- Ruby -->
              <div v-if="activeName === 'ruby'">
                <pre class="example mac_light mac_pre"><client-only><el-tooltip
                class="box-item"
                effect="dark"
                content="复制"
                placement="left"
              ><div class="copy" @click="copy(generatedExamples.ruby)"><el-icon size="14"><CopyDocument /></el-icon></div
              ></el-tooltip></client-only><code class="ruby" v-text="generatedExamples.ruby"></code></pre>
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
            <pre
              v-else
              class="example mac_light mac_pre"
            ><client-only><el-tooltip class="box-item" effect="dark" content="复制" placement="left"
           ><div class="copy" @click="copy(apiInfo.example)"><el-icon size="14"><CopyDocument /></el-icon></div
           ></el-tooltip></client-only><code class="json" v-text="apiInfo.example"></code></pre>
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
// 服务指标网格布局
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;

    &::before {
      opacity: 1;
    }

    .stat-icon {
      transform: scale(1.1);
    }
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.3s ease;

    svg {
      width: 24px;
      height: 24px;
    }

    &.qps-icon {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }

    &.time-icon {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
    }

    &.today-icon {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    &.total-icon {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }
  }

  .stat-content {
    flex: 1;
    min-width: 0;
  }

  .stat-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
    margin-bottom: 8px;
    letter-spacing: 0.3px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1;
    font-variant-numeric: tabular-nums;

    .stat-unit {
      font-size: 14px;
      font-weight: 400;
      color: #94a3b8;
      margin-left: 6px;
    }
  }

  @media (max-width: 768px) {
    padding: 20px;

    .stat-icon {
      width: 40px;
      height: 40px;

      svg {
        width: 20px;
        height: 20px;
      }
    }

    .stat-label {
      font-size: 12px;
      margin-bottom: 6px;
    }

    .stat-value {
      font-size: 24px;

      .stat-unit {
        font-size: 12px;
      }
    }
  }
}

.key-guide-container {
  margin-top: 24px;

  .usage-guide {
    .guide-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: 600;
      color: #2e3033;

      .el-icon {
        color: #4096ff;
        font-size: 20px;
      }
    }

    .method-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;

      .method-card {
        position: relative;
        background: #fff;
        border: 1px solid #edf1f7;
        border-radius: 12px;
        padding: 20px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #d9e1ec;

          .code-block {
            background: #ecf5ff;
            border-color: #c6e2ff;

            .copy-icon {
              opacity: 1;
            }
          }
        }

        &.recommended {
          border: 1px solid #b3d8ff;
          background: #f0f9ff;

          .card-badge {
            background: #4096ff;
            color: #fff;
          }
        }

        &.deprecated {
          border: 1px solid #ffccc7;
          background: #fff2f0;

          .card-badge {
            background: #ff4d4f;
            color: #fff;
          }

          .danger-text {
            color: #ff4d4f;
            font-weight: 500;
          }
        }

        .card-badge {
          position: absolute;
          top: 0;
          right: 0;
          font-size: 12px;
          padding: 2px 10px;
          border-bottom-left-radius: 8px;
          border-top-right-radius: 12px;
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: #2e3033;
          margin-bottom: 8px;
        }

        .card-desc {
          font-size: 13px;
          color: #8c95a5;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .code-block {
          background: #f8fafc;
          border: 1px solid #e1e5eb;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;

          .code-line {
            font-family: 'Roboto Mono', monospace;
            font-size: 13px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 10px;

            .label {
              color: #d63200;
              margin-right: 8px;
            }

            .value {
              color: #0052d9;
              font-weight: 500;
            }
          }

          .copy-icon {
            font-size: 16px;
            color: #4096ff;
            opacity: 0.5;
            transition: all 0.2s;
          }
        }
      }
    }
  }
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
    max-width: 1600px;
    margin: 0 auto;
    padding: 40px 24px;
    display: grid;
    grid-template-columns: 260px 1fr;
    column-gap: 24px;
    row-gap: 0;
    align-items: start;

    @media (max-width: 1024px) {
      padding: 24px 16px;
      display: block;
    }

    .sidebar {
      display: block;
      position: sticky;
      top: 24px;
      align-self: start;

      @media (max-width: 1024px) {
        display: none;
      }

      .nav-title {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e2e8f0;
      }

      .nav-menu {
        list-style: none;
        padding: 0;
        margin: 0;

        .nav-item {
          margin-bottom: 8px;

          a {
            display: block;
            padding: 12px 16px;
            color: #64748b;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s ease;
            font-weight: 500;

            &:hover {
              background: #f1f5f9;
              color: #3b82f6;
              transform: translateX(4px);
            }

            &.active {
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
          }
        }
      }
    }

    .main-content {
      display: block;
    }

    .box {
      background: transparent;
      padding: 32px 0;
      border-bottom: 1px solid #e2e8f0;

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

        .api-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 12px;

          .debug-btn {
            margin-left: 0;
          }

          .view-markdown-btn {
            margin-left: 0;
          }
        }
      }

      .request-method-panel {
        padding: 24px;
        background: linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%);
        border: 1px solid #dbeafe;
        border-radius: 16px;
      }

      .request-method-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;

        @media (max-width: 768px) {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      .request-method-label {
        font-size: 14px;
        font-weight: 700;
        color: #1e3a8a;
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
        min-width: 52px;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        line-height: 1;
      }

      .request-method-tag.is-get {
        color: #166534;
        background: #dcfce7;
      }

      .request-method-tag.is-post {
        color: #b45309;
        background: #fef3c7;
      }

      .request-method-text {
        margin: 0;
        font-size: 15px;
        line-height: 1.8;
        color: #475569;
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
