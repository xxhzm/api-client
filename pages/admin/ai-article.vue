<script setup>
import {
  InfoFilled,
  VideoPlay,
  Edit,
  Setting,
  Monitor,
  Document,
  Picture,
  Operation,
  PictureFilled,
} from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const editorRef = ref(null)
const loading = ref(false)
const hasGenerated = ref(false)

const aiConfig = reactive({
  topic: '',
  keywords: '',
  tone: 'professional',
  language: 'zh',
  model: '',
  imageModel: '',
  imageCount: 0,
})

const imageCountMode = ref('none')

watch(
  () => aiConfig.imageCount,
  (val) => {
    // If current mode is custom, do not auto-switch back to presets
    if (imageCountMode.value === 'custom') return

    if (val === 0) imageCountMode.value = 'none'
    else if (val === 1) imageCountMode.value = 'single'
    else if (val === 3) imageCountMode.value = 'rich'
    else imageCountMode.value = 'custom'
  },
  { immediate: true },
)

watch(imageCountMode, (val) => {
  if (val === 'none') aiConfig.imageCount = 0
  else if (val === 'single') aiConfig.imageCount = 1
  else if (val === 'rich') aiConfig.imageCount = 3
  // custom case is handled by input directly
})

const recentModels = ref([])
const recentImageModels = ref([])

onMounted(() => {
  const savedTextModels = localStorage.getItem('ai_article_recent_text_models')
  if (savedTextModels) {
    try {
      recentTextModels.value = JSON.parse(savedTextModels)
    } catch (e) {
      console.error('Failed to parse recent text models', e)
    }
  }

  const savedImageModels = localStorage.getItem(
    'ai_article_recent_image_models',
  )
  if (savedImageModels) {
    try {
      recentImageModels.value = JSON.parse(savedImageModels)
    } catch (e) {
      console.error('Failed to parse recent image models', e)
    }
  }
})

const saveModelToHistory = (model, type = 'text') => {
  if (!model) return

  const list = type === 'text' ? recentTextModels : recentImageModels
  const storageKey =
    type === 'text'
      ? 'ai_article_recent_text_models'
      : 'ai_article_recent_image_models'

  // Remove if exists to move to top
  const index = list.value.indexOf(model)
  if (index > -1) {
    list.value.splice(index, 1)
  }

  // Add to top
  list.value.unshift(model)

  // Keep only last 5
  if (list.value.length > 5) {
    list.value = list.value.slice(0, 5)
  }

  localStorage.setItem(storageKey, JSON.stringify(list.value))
}

const generatedArticle = reactive({
  title: '',
  description: '',
  keywords: '',
  content: '',
  type: '1',
})

const generate = async () => {
  if (!aiConfig.topic) {
    $msg('请输入文章主题', 'error')
    return
  }

  loading.value = true

  // Save model to history
  if (aiConfig.textModel) {
    saveModelToHistory(aiConfig.textModel, 'text')
  }
  if (aiConfig.imageModel) {
    saveModelToHistory(aiConfig.imageModel, 'image')
  }

  // Mock generation process
  setTimeout(() => {
    loading.value = false
    hasGenerated.value = true

    // Fill with dummy data based on input
    generatedArticle.title = `关于"${aiConfig.topic}"的深度解析`
    generatedArticle.keywords =
      aiConfig.keywords || `${aiConfig.topic}, AI生成, 深度好文`
    generatedArticle.description = `本文深入探讨了${aiConfig.topic}的相关内容，从多个角度进行了分析。`

    let imagesHtml = ''
    if (aiConfig.imageCount > 0) {
      for (let i = 0; i < aiConfig.imageCount; i++) {
        imagesHtml += `<div style="text-align: center; margin: 20px 0;"><img src="https://via.placeholder.com/800x400?text=AI+Generated+Image+${i + 1}" alt="AI配图${i + 1}" style="max-width: 100%; border-radius: 8px;" /><p style="color: #666; font-size: 14px;">（图${i + 1}：AI根据主题自动生成的配图）</p></div>`
      }
    }

    generatedArticle.content = `
      <h2>引言</h2>
      <p>在当今快速发展的时代，<strong>${aiConfig.topic}</strong>已经成为一个不可忽视的话题。</p>
      <h2>主要内容</h2>
      <p>这是一个由AI生成的关于${aiConfig.topic}的示例文章内容。${aiConfig.tone === 'professional' ? '我们从专业的角度来看待这个问题。' : '让我们轻松地聊聊这个话题。'}</p>
      ${imagesHtml}
      <ul>
        <li>第一点：重要性</li>
        <li>第二点：应用场景</li>
        <li>第三点：未来展望</li>
      </ul>
      <h2>结论</h2>
      <p>综上所述，${aiConfig.topic}具有深远的影响。</p>
    `
    $msg('文章生成成功', 'success')
  }, 2000)
}

const submit = async () => {
  if (
    !generatedArticle.title ||
    !generatedArticle.description ||
    !generatedArticle.keywords ||
    !generatedArticle.type
  ) {
    $msg('请填写完整文章信息', 'error')
    return false
  }

  // Ensure content is up to date from editor
  if (editorRef.value) {
    generatedArticle.content = editorRef.value.getContent()
  }

  if (!generatedArticle.content) {
    $msg('文章内容不能为空', 'error')
    return false
  }

  const body = new URLSearchParams()
  body.append('title', generatedArticle.title)
  body.append('content', generatedArticle.content)
  body.append('description', generatedArticle.description)
  body.append('keywords', generatedArticle.keywords)
  body.append('type', generatedArticle.type)

  const res = await $myFetch('CreateArticle', {
    method: 'POST',
    body: body,
  })

  if (res.code !== 200) {
    $msg(res.msg, 'error')
  } else {
    $msg('文章发布成功', 'success')
    setTimeout(() => {
      navigateTo('/admin/articlelist')
    }, 500)
  }
}

useHead({
  title: 'AI生成文章',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="createarticle-container">
    <div class="article-card">
      <!-- Header -->
      <div class="card-header">
        <div class="header-left">
          <span class="title">AI 生成文章</span>
        </div>
      </div>

      <!-- Configuration Area -->
      <div class="form-container" v-if="!hasGenerated">
        <el-form :model="aiConfig" label-position="top">
          <!-- 1. 核心内容配置 -->
          <div class="config-section">
            <div class="section-header">
              <div class="title-wrapper">
                <div class="icon-box primary">
                  <el-icon><Document /></el-icon>
                </div>
                <span class="section-title">核心内容</span>
              </div>
              <span class="section-desc">定义文章的主题与核心关键词</span>
            </div>

            <div class="section-content">
              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="文章主题" required>
                    <el-input
                      v-model="aiConfig.topic"
                      maxlength="100"
                      show-word-limit
                      placeholder="请输入想要生成的文章主题，例如：2024年人工智能行业发展趋势与展望"
                      size="large"
                      class="topic-input"
                    >
                      <template #prefix>
                        <el-icon class="el-input__icon"><Edit /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="关键词">
                    <el-input
                      v-model="aiConfig.keywords"
                      placeholder="指定关键词，用逗号分隔（可选）"
                      size="large"
                    />
                    <div class="form-tip">
                      AI 将围绕这些关键词展开论述，提高内容相关性
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- 2. AI 引擎配置 -->
          <div class="config-section">
            <div class="section-header">
              <div class="title-wrapper">
                <div class="icon-box success">
                  <el-icon><Monitor /></el-icon>
                </div>
                <span class="section-title">AI 引擎</span>
              </div>
              <span class="section-desc">选择合适的模型与语言环境</span>
            </div>

            <div class="section-content">
              <el-row :gutter="24">
                <el-col :span="12" :xs="24">
                  <el-form-item label="文本模型 (Text Model)">
                    <div class="model-input-wrapper">
                      <el-input
                        v-model="aiConfig.textModel"
                        placeholder="如 gpt-4o, claude-3-5"
                        size="large"
                        clearable
                      >
                        <template #prefix>
                          <el-icon class="el-input__icon"><Monitor /></el-icon>
                        </template>
                      </el-input>
                      <div
                        class="history-tags"
                        v-if="recentTextModels && recentTextModels.length > 0"
                      >
                        <span class="history-label">最近使用：</span>
                        <div class="tags-list">
                          <el-tag
                            v-for="model in recentTextModels"
                            :key="model"
                            type="info"
                            effect="plain"
                            class="model-tag"
                            @click="aiConfig.textModel = model"
                          >
                            {{ model }}
                          </el-tag>
                        </div>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12" :xs="24">
                  <el-form-item label="配图模型 (Image Model)">
                    <div class="model-input-wrapper">
                      <el-input
                        v-model="aiConfig.imageModel"
                        placeholder="如 midjourney-v6, dall-e-3"
                        size="large"
                        clearable
                      >
                        <template #prefix>
                          <el-icon class="el-input__icon"><Picture /></el-icon>
                        </template>
                      </el-input>
                      <div
                        class="history-tags"
                        v-if="recentImageModels && recentImageModels.length > 0"
                      >
                        <span class="history-label">最近使用：</span>
                        <div class="tags-list">
                          <el-tag
                            v-for="model in recentImageModels"
                            :key="model"
                            type="info"
                            effect="plain"
                            class="model-tag"
                            @click="aiConfig.imageModel = model"
                          >
                            {{ model }}
                          </el-tag>
                        </div>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="输出语言">
                    <el-select
                      v-model="aiConfig.language"
                      style="width: 100%"
                      size="large"
                    >
                      <el-option
                        label="简体中文 (Simplified Chinese)"
                        value="zh"
                      />
                      <el-option label="English (US)" value="en" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- 3. 呈现方式配置 -->
          <div class="config-section">
            <div class="section-header">
              <div class="title-wrapper">
                <div class="icon-box warning">
                  <el-icon><Setting /></el-icon>
                </div>
                <span class="section-title">呈现方式</span>
              </div>
              <span class="section-desc">调整文章风格与多媒体元素</span>
            </div>

            <div class="section-content">
              <el-row :gutter="24">
                <el-col :span="12" :xs="24">
                  <el-form-item label="文章风格">
                    <el-select
                      v-model="aiConfig.tone"
                      style="width: 100%"
                      size="large"
                    >
                      <el-option
                        label="专业严谨 (Professional)"
                        value="professional"
                      />
                      <el-option label="轻松活泼 (Casual)" value="casual" />
                      <el-option label="新闻报道 (Journalistic)" value="news" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="配图数量">
                    <div class="image-mode-container">
                      <el-radio-group
                        v-model="imageCountMode"
                        size="large"
                        class="image-mode-group"
                      >
                        <el-radio-button label="none">
                          <div class="mode-item">
                            <el-icon><CircleClose /></el-icon>
                            <span>无配图</span>
                          </div>
                        </el-radio-button>
                        <el-radio-button label="single">
                          <div class="mode-item">
                            <el-icon><Picture /></el-icon>
                            <span>单张</span>
                          </div>
                        </el-radio-button>
                        <el-radio-button label="rich">
                          <div class="mode-item">
                            <el-icon><PictureFilled /></el-icon>
                            <span>丰富 (3张)</span>
                          </div>
                        </el-radio-button>
                        <el-radio-button label="custom">
                          <div class="mode-item">
                            <el-icon><Operation /></el-icon>
                            <span>自定义</span>
                          </div>
                        </el-radio-button>
                      </el-radio-group>

                      <div
                        v-if="imageCountMode === 'custom'"
                        class="custom-image-input"
                      >
                        <el-slider
                          v-model="aiConfig.imageCount"
                          :min="0"
                          :max="10"
                          show-stops
                          class="custom-slider"
                        />
                        <span class="slider-value"
                          >{{ aiConfig.imageCount }} 张</span
                        >
                      </div>

                      <div class="form-tip">
                        {{
                          aiConfig.imageCount === 0
                            ? '纯文字模式，不生成图片'
                            : `AI 将根据内容自动生成 ${aiConfig.imageCount} 张插图`
                        }}
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-form>
      </div>

      <!-- Result Area (Editable) -->
      <div class="form-container" v-else>
        <div class="section-header">
          <div class="section-title">生成结果</div>
          <el-button type="primary" link @click="hasGenerated = false"
            >重新生成</el-button
          >
        </div>

        <el-form :model="generatedArticle" label-width="90px">
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="文章标题" required>
                <el-input
                  v-model="generatedArticle.title"
                  maxlength="256"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="文章分类" required>
                <el-select
                  v-model="generatedArticle.type"
                  placeholder="请选择分类"
                  style="width: 100%"
                >
                  <el-option label="公共通知" value="1"></el-option>
                  <el-option label="行业资讯" value="2"></el-option>
                  <el-option label="产品动态" value="3"></el-option>
                  <el-option label="解决方案" value="4"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="关键词" required>
                <el-input
                  v-model="generatedArticle.keywords"
                  maxlength="256"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="文章描述" required>
                <el-input
                  v-model="generatedArticle.description"
                  type="textarea"
                  :rows="3"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <div class="editor-container">
                <TinyMCEEditor
                  ref="editorRef"
                  v-model="generatedArticle.content"
                  :height="600"
                />
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <!-- Footer -->
    <div class="createarticle-footer">
      <div class="footer-content">
        <div class="left-info">
          <el-icon><InfoFilled /></el-icon>
          <span v-if="!hasGenerated">配置AI参数以生成文章</span>
          <span v-else>请检查并编辑生成的内容，确认无误后发布</span>
        </div>
        <div class="right-buttons">
          <template v-if="!hasGenerated">
            <el-button
              type="primary"
              size="large"
              @click="generate"
              :loading="loading"
            >
              <el-icon class="el-icon--left"><VideoPlay /></el-icon>
              开始生成
            </el-button>
          </template>
          <template v-else>
            <el-button type="primary" size="large" @click="submit"
              >发布文章</el-button
            >
            <el-button
              size="large"
              plain
              @click="navigateTo('/admin/articlelist')"
              >取消</el-button
            >
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.createarticle-container {
  position: relative;
  min-height: 100vh;
  padding: 24px;
  padding-bottom: 100px;
  display: flex;
  justify-content: center;
  background-color: #f5f7fa;

  .article-card {
    width: 100%;
    margin: 0 auto;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: #fff;
      border: 1px solid #eaecf0;
      border-radius: 12px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
      margin-bottom: 16px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1f36;
        }
      }
    }

    .form-container {
      padding: 32px;
      background: #fff;
      border: 1px solid #eaecf0;
      border-radius: 12px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

      .config-section {
        margin-bottom: 32px;
        &:last-child {
          margin-bottom: 0;
        }

        .section-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f2f4f7;

          .title-wrapper {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;

            .icon-box {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;

              &.primary {
                background: #eff8ff;
                color: #2e90fa;
              }
              &.success {
                background: #ecfdf3;
                color: #12b76a;
              }
              &.warning {
                background: #fffaeb;
                color: #b54708;
              }
            }

            .section-title {
              font-size: 18px;
              font-weight: 600;
              color: #101828;
            }
          }

          .section-desc {
            display: block;
            font-size: 14px;
            color: #667085;
            margin-left: 44px;
          }
        }

        .section-content {
          padding-left: 44px;
        }
      }

      .form-tip {
        font-size: 13px;
        color: #667085;
        margin-top: 6px;
        line-height: 1.5;
      }

      .image-mode-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .image-mode-group {
          width: 100%;

          :deep(.el-radio-button__inner) {
            width: 100%;
            padding: 10px 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 40px;
          }

          :deep(.el-radio-button) {
            flex: 1;
          }
        }

        .mode-item {
          display: flex;
          align-items: center;
          gap: 6px;

          .el-icon {
            font-size: 16px;
          }
        }

        .custom-image-input {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 8px 12px;
          background: #fff;
          margin-top: 8px;
          animation: slideDown 0.2s ease-out;

          .custom-slider {
            flex: 1;
            margin-right: 12px;
          }

          .slider-value {
            font-size: 14px;
            font-weight: 500;
            color: #344054;
            min-width: 40px;
            text-align: right;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-tip {
          font-size: 12px;
          color: #98a2b3;
        }
      }

      .section-header-result {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .section-title-result {
        font-size: 15px;
        font-weight: 600;
        color: #1a1f36;
        margin-bottom: 20px;
        padding-left: 10px;
        border-left: 4px solid #409eff;
      }

      .model-input-wrapper {
        width: 100%;

        .history-tags {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;

          .history-label {
            color: #98a2b3;
            white-space: nowrap;
          }

          .tags-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;

            .model-tag {
              cursor: pointer;
              border-color: #eaecf0;
              color: #344054;
              transition: all 0.2s;

              &:hover {
                color: #2e90fa;
                border-color: #b2ddff;
                background-color: #eff8ff;
              }
            }
          }
        }
      }

      :deep(.el-form-item__label) {
        font-weight: 500;
        color: #344054;
        margin-bottom: 6px;
      }

      :deep(.el-input__wrapper),
      :deep(.el-textarea__inner) {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        border: 1px solid #d0d5dd;
        border-radius: 8px;
        padding-top: 8px;
        padding-bottom: 8px;

        &:hover {
          border-color: #98a2b3;
        }

        &.is-focus {
          border-color: #2e90fa;
          box-shadow: 0 0 0 4px rgba(46, 144, 250, 0.24);
        }
      }

      :deep(.el-input-group__append) {
        background-color: #f9fafb;
        border-left: 1px solid #d0d5dd;
        color: #344054;
        font-weight: 500;
      }

      .editor-container {
        margin-top: 16px;
      }
    }
  }

  .createarticle-footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    padding: 0 20px 20px;
    background: transparent;
    z-index: 999;
    pointer-events: none;

    .footer-content {
      width: 100%;
      max-width: 1200px;
      background: #fff;
      border: 1px solid var(--el-border-color);
      border-radius: 12px;
      box-shadow: var(--el-box-shadow-light);
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: auto;

      .left-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--el-text-color-secondary);
        font-size: 14px;
        .el-icon {
          color: var(--el-color-warning);
        }
      }

      .right-buttons {
        display: flex;
        gap: 12px;
        .el-button {
          min-width: 100px;
          font-weight: 500;
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .createarticle-container {
    padding: 16px;
    padding-bottom: 100px;
  }
}

@media screen and (max-width: 768px) {
  .createarticle-container {
    padding: 12px;
    padding-bottom: 100px;
  }
  .createarticle-footer {
    padding: 0 12px 12px;
    .footer-content {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      .right-buttons {
        flex-direction: column;
        .el-button {
          width: 100%;
        }
      }
    }
  }
}
</style>
