<script setup>
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'admin',
})

const { $msg } = useNuxtApp()

// 标签页状态
const activeName = ref('apply')

// 加载状态
const loading = ref(false)
const applyTableRef = ref()
const invoicePreviewVisible = ref(false)
const invoiceDocumentPanelRef = ref()
const invoicePreviewScale = ref(0.82)
let invoicePreviewResizeObserver = null

// === 索取发票数据 ===
// 按明细数据
const applyData = ref([
  {
    id: 'ORD202310010001',
    amount: 199.0,
    create_time: '2023-10-01 10:23:00',
    type: '消费',
    status: '可开票',
  },
  {
    id: 'ORD202310150002',
    amount: 500.0,
    create_time: '2023-10-15 14:30:00',
    type: '充值',
    status: '可开票',
  },
])

const selectedApply = ref([])
const totalApplyAmountValue = computed(() => {
  return selectedApply.value.reduce((sum, item) => sum + item.amount, 0)
})
const totalApplyAmount = computed(() => {
  return totalApplyAmountValue.value.toFixed(2)
})

const invoiceTaxRate = 0.01
const invoiceAmountWithoutTax = computed(() => {
  return totalApplyAmountValue.value / (1 + invoiceTaxRate)
})
const invoiceTaxAmount = computed(() => {
  return totalApplyAmountValue.value - invoiceAmountWithoutTax.value
})
const formatLocalDate = (date = new Date(), separator = '-') => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return [year, month, day].join(separator)
}
const invoicePreviewNumber = computed(() => {
  return `INV${formatLocalDate(new Date(), '')}0001`
})
const invoicePreviewDate = computed(() => {
  return formatLocalDate()
})
const invoiceTypeOptions = [
  '数字化电子普票 (电子)',
  '数字化电子专票 (电子)',
]
const specModelOptions = [
  { label: '空白(发票上空白，不显示内容)', value: 'blank' },
  { label: '无(发票上显示为“无”)', value: '无' },
]

const handleSelectionChange = (val) => {
  selectedApply.value = val
}

// === 开票记录数据 ===
const recordsData = ref([
  {
    id: 'INV202310200001',
    amount: 699.0,
    title: '广州某某科技有限公司',
    type: '数字化电子普票 (电子)',
    status: '已开具',
    create_time: '2023-10-20 16:00:00',
  },
])

const showInvoiceRecordDetail = (row) => {
  navigateTo(`/admin/invoicedetail/${row.id}`)
}

// === 发票抬头数据 ===
const infoData = ref([
  {
    id: 1,
    title: '广州某某科技有限公司',
    tax_id: '91440101MA59XXXXXX',
    type: '企业',
    bank_name: '工行零庄滕州支行营业室',
    bank_account: '1605003109200855862',
    is_default: true,
  },
])

const invoiceTitleDialogVisible = ref(false)
const invoiceTitleSubmitting = ref(false)
const invoiceTitleFormRef = ref()
const invoiceTitleForm = reactive({
  title: '',
  type: '企业',
  tax_id: '',
  bank_name: '',
  bank_account: '',
  is_default: false,
})

const validateTaxId = (rule, value, callback) => {
  if (invoiceTitleForm.type === '企业' && !String(value || '').trim()) {
    callback(new Error('请输入纳税人识别号'))
    return
  }
  callback()
}

const invoiceTitleRules = {
  title: [{ required: true, message: '请输入发票抬头', trigger: 'blur' }],
  type: [{ required: true, message: '请选择抬头类型', trigger: 'change' }],
  tax_id: [{ validator: validateTaxId, trigger: 'blur' }],
}

const resetInvoiceTitleForm = () => {
  invoiceTitleForm.title = ''
  invoiceTitleForm.type = '企业'
  invoiceTitleForm.tax_id = ''
  invoiceTitleForm.bank_name = ''
  invoiceTitleForm.bank_account = ''
  invoiceTitleForm.is_default = false
  invoiceTitleFormRef.value?.clearValidate?.()
}

const openInvoiceTitleDialog = () => {
  resetInvoiceTitleForm()
  invoiceTitleDialogVisible.value = true
}

const handleInvoiceTitleTypeChange = () => {
  if (invoiceTitleForm.type === '个人') {
    invoiceTitleForm.tax_id = ''
    invoiceTitleForm.bank_name = ''
    invoiceTitleForm.bank_account = ''
  }
  invoiceTitleFormRef.value?.clearValidate?.('tax_id')
}

const submitInvoiceTitle = async () => {
  if (!invoiceTitleFormRef.value) return

  try {
    await invoiceTitleFormRef.value.validate()
  } catch {
    return
  }

  invoiceTitleSubmitting.value = true
  try {
    if (invoiceTitleForm.is_default) {
      infoData.value.forEach((item) => {
        item.is_default = false
      })
    }

    const nextId = Math.max(0, ...infoData.value.map((item) => item.id)) + 1
    infoData.value.push({
      id: nextId,
      title: invoiceTitleForm.title.trim(),
      type: invoiceTitleForm.type,
      tax_id:
        invoiceTitleForm.type === '企业' ? invoiceTitleForm.tax_id.trim() : '',
      bank_name:
        invoiceTitleForm.type === '企业'
          ? invoiceTitleForm.bank_name.trim()
          : '',
      bank_account:
        invoiceTitleForm.type === '企业'
          ? invoiceTitleForm.bank_account.trim()
          : '',
      is_default: invoiceTitleForm.is_default,
    })

    invoiceTitleDialogVisible.value = false
    $msg('发票抬头新增成功', 'success')
  } finally {
    invoiceTitleSubmitting.value = false
  }
}

const invoiceApplySubmitting = ref(false)
const invoiceApplyFormRef = ref()
const invoiceApplyForm = reactive({
  title_id: null,
  invoice_type: invoiceTypeOptions[0],
  content: '软件服务费',
  spec_model: 'blank',
  email: '',
  remark: '',
})

const invoiceApplyRules = {
  title_id: [
    { required: true, message: '请选择发票抬头', trigger: 'change' },
  ],
  email: [
    { required: true, message: '请输入接收邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
}

const defaultInvoiceTitle = computed(() => {
  return (
    infoData.value.find((item) => item.is_default) || infoData.value[0] || null
  )
})

const selectedInvoiceTitle = computed(() => {
  return (
    infoData.value.find((item) => item.id === invoiceApplyForm.title_id) || null
  )
})
const isSpecialInvoice = computed(() => {
  return invoiceApplyForm.invoice_type.includes('专票')
})
const selectedTitleBankText = computed(() => {
  const bankName = selectedInvoiceTitle.value?.bank_name
  const bankAccount = selectedInvoiceTitle.value?.bank_account

  if (!bankName && !bankAccount) {
    return '购方开户银行：-；银行账号：-；'
  }

  return `购方开户银行：${bankName || '-'}；银行账号：${bankAccount || '-'}；`
})
const invoiceSpecModelText = computed(() => {
  return invoiceApplyForm.spec_model === 'blank' ? '' : invoiceApplyForm.spec_model
})

const resetInvoiceApplyForm = () => {
  invoiceApplyForm.title_id = defaultInvoiceTitle.value?.id ?? null
  invoiceApplyForm.invoice_type = invoiceTypeOptions[0]
  invoiceApplyForm.content = '软件服务费'
  invoiceApplyForm.spec_model = 'blank'
  invoiceApplyForm.email = ''
  invoiceApplyForm.remark = ''
  invoiceApplyFormRef.value?.clearValidate?.()
}

const formatMoney = (value) => Number(value || 0).toFixed(2)

const toChineseCurrency = (value) => {
  const fraction = ['角', '分']
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ]
  const head = value < 0 ? '负' : ''
  let amount = Math.abs(Number(value || 0))
  let suffix = ''

  fraction.forEach((item, index) => {
    suffix +=
      (digit[Math.floor(amount * 10 * 10 ** index) % 10] + item).replace(
        /零./,
        '',
      )
  })
  suffix = suffix || '整'
  amount = Math.floor(amount)

  let integerText = ''
  for (let i = 0; i < unit[0].length && amount > 0; i += 1) {
    let partText = ''
    for (let j = 0; j < unit[1].length && amount > 0; j += 1) {
      partText = digit[amount % 10] + unit[1][j] + partText
      amount = Math.floor(amount / 10)
    }
    integerText =
      partText.replace(/(零.)*零$/, '').replace(/^$/, '零') +
      unit[0][i] +
      integerText
  }

  return (
    head +
    integerText
      .replace(/(零.)*零元/, '元')
      .replace(/(零.)+/g, '零')
      .replace(/^整$/, '零元整') +
    suffix
  )
}

const openInvoicePreview = async () => {
  if (!selectedApply.value.length) {
    $msg('请先选择开票明细', 'warning')
    return
  }

  if (totalApplyAmountValue.value < 100) {
    $msg('开票金额需满 100 元', 'warning')
    return
  }

  if (!infoData.value.length) {
    activeName.value = 'info'
    $msg('请先新增发票抬头', 'warning')
    return
  }

  resetInvoiceApplyForm()
  invoicePreviewVisible.value = true
  await nextTick()
  invoiceApplyFormRef.value?.clearValidate?.()
  updateInvoicePreviewScale()
}

const backToInvoiceApplyList = () => {
  invoicePreviewVisible.value = false
}

const updateInvoicePreviewScale = async () => {
  await nextTick()

  const panelWidth = invoiceDocumentPanelRef.value?.clientWidth || 0
  if (!panelWidth) return

  const previewBaseWidth = 980
  const previewHorizontalPadding = 28
  const availableWidth = Math.max(panelWidth - previewHorizontalPadding, 1)
  const nextScale = Math.min(
    1.15,
    Math.max(0.1, availableWidth / previewBaseWidth),
  )

  invoicePreviewScale.value = Number(nextScale.toFixed(3))
}

const stopInvoicePreviewObserver = () => {
  invoicePreviewResizeObserver?.disconnect()
  invoicePreviewResizeObserver = null
}

const startInvoicePreviewObserver = async () => {
  await nextTick()
  stopInvoicePreviewObserver()

  if (
    typeof ResizeObserver === 'undefined' ||
    !invoiceDocumentPanelRef.value
  ) {
    updateInvoicePreviewScale()
    return
  }

  invoicePreviewResizeObserver = new ResizeObserver(updateInvoicePreviewScale)
  invoicePreviewResizeObserver.observe(invoiceDocumentPanelRef.value)
  updateInvoicePreviewScale()
}

const submitInvoiceApply = async () => {
  if (!invoiceApplyFormRef.value) return

  try {
    await invoiceApplyFormRef.value.validate()
  } catch {
    return
  }

  if (
    isSpecialInvoice.value &&
    (!selectedInvoiceTitle.value?.bank_name ||
      !selectedInvoiceTitle.value?.bank_account)
  ) {
    $msg('申请专票请先在发票抬头中设置开户银行和银行账号', 'warning')
    activeName.value = 'info'
    invoicePreviewVisible.value = false
    return
  }

  invoiceApplySubmitting.value = true
  try {
    const nextNumber = recordsData.value.length + 1
    const nextId = `INV${formatLocalDate(new Date(), '')}${String(
      nextNumber,
    ).padStart(4, '0')}`

    recordsData.value.unshift({
      id: nextId,
      amount: totalApplyAmountValue.value,
      title: selectedInvoiceTitle.value?.title || '-',
      type: invoiceApplyForm.invoice_type,
      status: '审核中',
      create_time: new Date().toLocaleString('zh-CN', {
        hour12: false,
      }),
    })

    const selectedIds = new Set(selectedApply.value.map((item) => item.id))
    applyData.value = applyData.value.filter((item) => !selectedIds.has(item.id))
    selectedApply.value = []
    applyTableRef.value?.clearSelection?.()

    invoicePreviewVisible.value = false
    activeName.value = 'records'
    $msg('开票申请已提交', 'success')
  } finally {
    invoiceApplySubmitting.value = false
  }
}

// 模拟获取数据
const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', updateInvoicePreviewScale)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateInvoicePreviewScale)
  stopInvoicePreviewObserver()
})

watch(invoicePreviewVisible, (visible) => {
  if (visible) {
    startInvoicePreviewObserver()
    return
  }

  stopInvoicePreviewObserver()
})

useHead({
  title: '发票管理',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="invoice-container">
    <div class="invoice-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <span class="title">发票管理</span>
        </div>
        <span class="header-meta">开票金额需满 100 元</span>
      </div>

      <!-- 内容区域 -->
      <div class="card-content">
        <el-tabs
          v-model="activeName"
          class="invoice-tabs"
          @tab-change="fetchData"
        >
          <!-- 索取发票 -->
          <el-tab-pane label="索取发票" name="apply">
            <div class="tab-pane-content" v-loading="loading">
              <template v-if="!invoicePreviewVisible">
                <el-alert
                  title="温馨提示：当前仅支持按消费明细申请发票。电子发票开具后将发送至您的邮箱，纸质发票将通过快递寄送。开票金额需满100元。"
                  type="info"
                  show-icon
                  :closable="false"
                  class="invoice-alert"
                />

                <div class="action-bar">
                  <div class="action-left">
                    <span class="selected-info">
                      已选金额：<span class="amount"
                        >¥{{ totalApplyAmount }}</span
                      >
                    </span>
                    <el-button
                      type="primary"
                      :disabled="selectedApply.length === 0"
                      @click="openInvoicePreview"
                    >
                      下一步
                    </el-button>
                  </div>
                  <div class="action-right">
                    <el-date-picker
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      class="date-range"
                    />
                    <el-button type="primary">
                      <el-icon><Search /></el-icon>
                      查询
                    </el-button>
                  </div>
                </div>

                <el-table
                  ref="applyTableRef"
                  :data="applyData"
                  @selection-change="handleSelectionChange"
                  class="invoice-table"
                  style="width: 100%"
                  empty-text="暂无可开票明细"
                >
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="id" label="订单号/流水号" width="180" />
                  <el-table-column prop="type" label="业务类型" width="100" />
                  <el-table-column
                    prop="create_time"
                    label="交易时间"
                    width="180"
                  />
                  <el-table-column prop="amount" label="可开票金额" width="150">
                    <template #default="scope">
                      <span class="table-amount"
                        >¥{{ scope.row.amount.toFixed(2) }}</span
                      >
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态">
                    <template #default="scope">
                      <el-tag type="success" size="small">{{
                        scope.row.status
                      }}</el-tag>
                    </template>
                  </el-table-column>
                </el-table>

                <div class="pagination">
                  <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :total="applyData.length"
                  />
                </div>
              </template>

              <template v-else>
                <div class="preview-step-header">
                  <div class="preview-step-title">
                    <span>确认开票信息</span>
                    <strong>¥{{ totalApplyAmount }}</strong>
                  </div>
                  <div class="preview-step-actions">
                    <el-button @click="backToInvoiceApplyList">
                      返回选择
                    </el-button>
                    <el-button
                      type="primary"
                      :loading="invoiceApplySubmitting"
                      @click="submitInvoiceApply"
                    >
                      提交申请
                    </el-button>
                  </div>
                </div>

                <div class="invoice-preview-layout">
                  <div class="invoice-config-panel">
                    <el-form
                      ref="invoiceApplyFormRef"
                      :model="invoiceApplyForm"
                      :rules="invoiceApplyRules"
                      label-width="90px"
                      class="invoice-preview-form"
                    >
                      <el-form-item label="发票抬头" prop="title_id">
                        <el-select
                          v-model="invoiceApplyForm.title_id"
                          placeholder="请选择发票抬头"
                          class="full-width"
                        >
                          <el-option
                            v-for="item in infoData"
                            :key="item.id"
                            :label="item.title"
                            :value="item.id"
                          />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="发票类型">
                        <el-select
                          v-model="invoiceApplyForm.invoice_type"
                          placeholder="请选择发票类型"
                          class="full-width"
                        >
                          <el-option
                            v-for="item in invoiceTypeOptions"
                            :key="item"
                            :label="item"
                            :value="item"
                          />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="接收邮箱" prop="email">
                        <el-input
                          v-model="invoiceApplyForm.email"
                          placeholder="请输入接收发票的邮箱"
                        />
                      </el-form-item>
                      <el-form-item label="开票内容">
                        <el-input v-model="invoiceApplyForm.content" disabled />
                      </el-form-item>
                      <el-form-item label="规格型号">
                        <div class="spec-model-field">
                          <el-select
                            v-model="invoiceApplyForm.spec_model"
                            placeholder="请选择规格型号"
                            class="full-width"
                          >
                            <el-option
                              v-for="item in specModelOptions"
                              :key="item.label"
                              :label="item.label"
                              :value="item.value"
                            />
                          </el-select>
                          <div class="field-tip">
                            选择“空白”时发票上不显示内容；选择“无”时发票上显示“无”。
                          </div>
                        </div>
                      </el-form-item>
                      <el-form-item label="备注">
                        <el-input
                          v-model="invoiceApplyForm.remark"
                          type="textarea"
                          :rows="4"
                          maxlength="120"
                          show-word-limit
                          resize="none"
                          placeholder="选填，填写开票备注"
                        />
                      </el-form-item>
                    </el-form>
                  </div>

                  <div
                    ref="invoiceDocumentPanelRef"
                    class="invoice-document-panel"
                  >
                    <div
                      class="invoice-document-wrap"
                      :style="{
                        '--invoice-preview-scale': invoicePreviewScale,
                      }"
                    >
                      <div class="invoice-document">
                        <div class="invoice-doc-top">
                          <div class="invoice-doc-title">
                            {{ invoiceApplyForm.invoice_type }}
                          </div>
                          <div class="invoice-doc-meta">
                            <div>
                              <span>发票号码：</span>
                              <strong>{{ invoicePreviewNumber }}</strong>
                            </div>
                            <div>
                              <span>开票日期：</span>
                              <strong>{{ invoicePreviewDate }}</strong>
                            </div>
                          </div>
                        </div>

                        <div class="invoice-doc-party">
                          <div class="party-label">购买方信息</div>
                          <div class="party-content">
                            <div>
                              <span>名称：</span>
                              <strong>{{
                                selectedInvoiceTitle?.title || '-'
                              }}</strong>
                            </div>
                            <div>
                              <span>统一社会信用代码/纳税人识别号：</span>
                              <strong>{{
                                selectedInvoiceTitle?.tax_id || '-'
                              }}</strong>
                            </div>
                          </div>
                          <div class="party-label">销售方信息</div>
                          <div class="party-content">
                            <div>
                              <span>名称：</span>
                              <strong>xxxxxxxxxxxxxxxx</strong>
                            </div>
                            <div>
                              <span>统一社会信用代码/纳税人识别号：</span>
                              <strong>xxxxxxxxxxxxxxxx</strong>
                            </div>
                          </div>
                        </div>

                        <div class="invoice-doc-items">
                          <div class="doc-cell doc-head">
                            货物或应税劳务、服务名称
                          </div>
                          <div class="doc-cell doc-head">规格型号</div>
                          <div class="doc-cell doc-head">单位</div>
                          <div class="doc-cell doc-head">数量</div>
                          <div class="doc-cell doc-head">金 额</div>
                          <div class="doc-cell doc-head">税率</div>
                          <div class="doc-cell doc-head">税额</div>

                          <div class="doc-cell doc-value">
                            {{ invoiceApplyForm.content || '-' }}
                          </div>
                          <div class="doc-cell doc-value">
                            {{ invoiceSpecModelText }}
                          </div>
                          <div class="doc-cell doc-value">套</div>
                          <div class="doc-cell doc-value">1</div>
                          <div class="doc-cell doc-value">
                            ¥ {{ formatMoney(invoiceAmountWithoutTax) }}
                          </div>
                          <div class="doc-cell doc-value">1.00%</div>
                          <div class="doc-cell doc-value">
                            ¥ {{ formatMoney(invoiceTaxAmount) }}
                          </div>

                          <div class="doc-cell doc-total-label">合计</div>
                          <div class="doc-cell doc-total"></div>
                          <div class="doc-cell doc-total"></div>
                          <div class="doc-cell doc-total"></div>
                          <div class="doc-cell doc-total">
                            ¥ {{ formatMoney(invoiceAmountWithoutTax) }}
                          </div>
                          <div class="doc-cell doc-total"></div>
                          <div class="doc-cell doc-total">
                            ¥ {{ formatMoney(invoiceTaxAmount) }}
                          </div>
                        </div>

                        <div class="invoice-doc-amount">
                          <div class="amount-label">价税合计（大写）</div>
                          <div class="amount-cn">
                            {{ toChineseCurrency(totalApplyAmountValue) }}
                          </div>
                          <div class="amount-small">
                            （小写）¥ {{ totalApplyAmount }}
                          </div>
                        </div>

                        <div class="invoice-doc-remark">
                          <div class="remark-label">备 注</div>
                          <div class="remark-content">
                            <div>
                              {{ selectedTitleBankText }}
                            </div>
                            <div v-if="invoiceApplyForm.remark">
                              {{ invoiceApplyForm.remark }}
                            </div>
                          </div>
                        </div>

                        <div class="invoice-doc-footer">
                          <span>开票人：</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </el-tab-pane>

          <!-- 开票记录 -->
          <el-tab-pane label="开票记录" name="records">
            <div class="tab-pane-content" v-loading="loading">
              <div class="action-bar action-bar--right">
                <el-input
                  placeholder="请输入发票流水号/抬头"
                  class="search-input"
                >
                  <template #append>
                    <el-button :icon="Search" />
                  </template>
                </el-input>
              </div>

              <el-table
                :data="recordsData"
                class="invoice-table"
                style="width: 100%"
                empty-text="暂无开票记录"
              >
                <el-table-column prop="id" label="发票流水号" width="180" />
                <el-table-column
                  prop="title"
                  label="发票抬头"
                  show-overflow-tooltip
                />
                <el-table-column prop="type" label="发票类型" width="160" />
                <el-table-column prop="amount" label="开票金额" width="120">
                  <template #default="scope">
                    <span class="table-amount"
                      >¥{{ scope.row.amount.toFixed(2) }}</span
                    >
                  </template>
                </el-table-column>
                <el-table-column
                  prop="create_time"
                  label="申请时间"
                  width="180"
                />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag type="success" size="small">{{
                      scope.row.status
                    }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="scope">
                    <el-button
                      type="primary"
                      link
                      @click="showInvoiceRecordDetail(scope.row)"
                      >查看详情</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination">
                <el-pagination
                  background
                  layout="total, prev, pager, next"
                  :total="recordsData.length"
                />
              </div>
            </div>
          </el-tab-pane>

          <!-- 发票信息管理 -->
          <el-tab-pane label="发票信息管理" name="info">
            <div class="tab-pane-content" v-loading="loading">
              <div class="action-bar action-bar--left">
                <el-button type="primary" @click="openInvoiceTitleDialog">
                  <el-icon><Plus /></el-icon>
                  新增发票抬头
                </el-button>
              </div>

              <el-table
                :data="infoData"
                class="invoice-table"
                style="width: 100%"
                empty-text="暂无发票抬头"
              >
                <el-table-column prop="title" label="发票抬头" />
                <el-table-column prop="type" label="抬头类型" width="120">
                  <template #default="scope">
                    <el-tag size="small">{{ scope.row.type }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="tax_id" label="纳税人识别号">
                  <template #default="scope">
                    {{ scope.row.tax_id || '-' }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="bank_name"
                  label="开户银行"
                  min-width="180"
                  show-overflow-tooltip
                >
                  <template #default="scope">
                    {{ scope.row.bank_name || '-' }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="bank_account"
                  label="银行账号"
                  min-width="180"
                  show-overflow-tooltip
                >
                  <template #default="scope">
                    {{ scope.row.bank_account || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="默认抬头" width="100">
                  <template #default="scope">
                    <el-tag
                      v-if="scope.row.is_default"
                      type="warning"
                      size="small"
                      >默认</el-tag
                    >
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default>
                    <el-button type="primary" link :icon="Edit">编辑</el-button>
                    <el-button type="danger" link :icon="Delete"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-dialog
      v-model="invoiceTitleDialogVisible"
      title="新增发票抬头"
      width="520px"
      class="invoice-title-dialog"
      @closed="resetInvoiceTitleForm"
    >
      <el-form
        ref="invoiceTitleFormRef"
        :model="invoiceTitleForm"
        :rules="invoiceTitleRules"
        label-width="110px"
        class="invoice-title-form"
      >
        <el-form-item label="抬头类型" prop="type">
          <el-radio-group
            v-model="invoiceTitleForm.type"
            @change="handleInvoiceTitleTypeChange"
          >
            <el-radio-button value="企业">企业</el-radio-button>
            <el-radio-button value="个人">个人</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发票抬头" prop="title">
          <el-input
            v-model="invoiceTitleForm.title"
            maxlength="80"
            show-word-limit
            placeholder="请输入发票抬头"
          />
        </el-form-item>
        <el-form-item
          v-if="invoiceTitleForm.type === '企业'"
          label="纳税人识别号"
          prop="tax_id"
        >
          <el-input
            v-model="invoiceTitleForm.tax_id"
            maxlength="32"
            placeholder="请输入纳税人识别号"
          />
        </el-form-item>
        <el-form-item
          v-if="invoiceTitleForm.type === '企业'"
          label="开户银行"
        >
          <el-input
            v-model="invoiceTitleForm.bank_name"
            maxlength="80"
            placeholder="请输入开户银行"
          />
        </el-form-item>
        <el-form-item
          v-if="invoiceTitleForm.type === '企业'"
          label="银行账号"
        >
          <el-input
            v-model="invoiceTitleForm.bank_account"
            maxlength="40"
            placeholder="请输入银行账号"
          />
        </el-form-item>
        <el-form-item label="默认抬头">
          <el-switch v-model="invoiceTitleForm.is_default" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="invoiceTitleDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="invoiceTitleSubmitting"
            @click="submitInvoiceTitle"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.invoice-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.invoice-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 16px 20px;
}

.card-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: flex-start;
}

.header-left .title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.header-meta {
  position: absolute;
  top: 0;
  right: 0;
  padding: 3px 8px;
  background: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 4px;
  font-size: 12px;
  color: #e6a23c;
  white-space: nowrap;
}

.card-content {
  min-width: 0;
}

.invoice-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tabs__item) {
    color: #606266;
    font-weight: 500;
  }

  :deep(.el-tabs__item.is-active) {
    color: #409eff;
  }
}

.tab-pane-content {
  min-height: 260px;
}

.invoice-alert {
  margin-bottom: 16px;
  border-radius: 8px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.action-bar--left {
  justify-content: flex-start;
}

.action-bar--right {
  justify-content: flex-end;
}

.action-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.selected-info {
  font-size: 14px;
  color: #606266;

  .amount {
    color: #f56c6c;
    font-size: 18px;
    font-weight: 600;
    margin-left: 5px;
  }
}

.date-range {
  width: 260px;
}

.search-input {
  width: 280px;
}

.invoice-table {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;

  :deep(.el-table__header th) {
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }

  :deep(.el-table__row:hover > td.el-table__cell) {
    background: #f5f7fa;
  }
}

.table-amount {
  color: #f56c6c;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.invoice-title-form {
  padding: 4px 4px 0 0;
}

.full-width {
  width: 100%;
}

.preview-step-header {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.preview-step-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;

  strong {
    color: #f56c6c;
    font-size: 20px;
    font-weight: 600;
  }
}

.preview-step-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

.invoice-preview-layout {
  display: grid;
  grid-template-columns: clamp(360px, 28vw, 560px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.invoice-config-panel,
.invoice-document-panel {
  min-width: 0;
}

.invoice-preview-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.spec-model-field {
  width: 100%;
}

.field-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}

.invoice-document-wrap {
  overflow: hidden;
  display: flex;
  justify-content: flex-end;
  padding: 18px 14px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.invoice-document {
  width: 980px;
  box-sizing: border-box;
  padding: 14px;
  background: #fff;
  border: 1px solid #d8d8d8;
  color: #1f2933;
  zoom: var(--invoice-preview-scale, 0.82);
}

.invoice-doc-top {
  position: relative;
  min-height: 72px;
  padding-top: 4px;
}

.invoice-doc-title {
  width: 420px;
  margin: 0 auto;
  padding-bottom: 8px;
  border-bottom: 2px solid #b45309;
  color: #b45309;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0;
}

.invoice-doc-meta {
  position: absolute;
  top: 6px;
  right: 72px;
  color: #b45309;
  font-size: 13px;
  line-height: 1.8;

  strong {
    color: #303133;
    font-weight: 600;
  }
}

.invoice-doc-party {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) 46px minmax(0, 1fr);
  border: 1px solid #ea580c;
  color: #303133;
  font-size: 13px;
}

.party-label {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 92px;
  padding: 8px 0;
  border-right: 1px solid #ea580c;
  color: #b45309;
  font-weight: 600;
  line-height: 1.2;
  writing-mode: vertical-rl;
}

.party-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  padding: 14px 12px;
  border-right: 1px solid #ea580c;
  word-break: break-all;

  span {
    color: #b45309;
    font-weight: 600;
  }

  strong {
    font-weight: 500;
  }
}

.party-content:last-child {
  border-right: none;
}

.invoice-doc-items {
  display: grid;
  grid-template-columns:
    minmax(240px, 1.8fr) minmax(120px, 0.8fr) minmax(78px, 0.5fr)
    minmax(78px, 0.5fr) minmax(120px, 0.8fr) minmax(90px, 0.6fr)
    minmax(110px, 0.7fr);
  border-right: 1px solid #ea580c;
  border-left: 1px solid #ea580c;
  color: #303133;
  font-size: 13px;
}

.doc-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 8px 10px;
  word-break: break-all;
}

.doc-head {
  min-height: 40px;
  color: #b45309;
  font-weight: 600;
}

.doc-value {
  min-height: 74px;
}

.doc-total,
.doc-total-label {
  min-height: 38px;
  border-bottom: 1px solid #ea580c;
  color: #b45309;
}

.doc-total-label {
  justify-content: flex-start;
  padding-left: 56px;
  letter-spacing: 28px;
  font-weight: 600;
}

.invoice-doc-amount {
  display: grid;
  grid-template-columns: 300px 1fr 370px;
  min-height: 36px;
  border-right: 1px solid #ea580c;
  border-bottom: 1px solid #ea580c;
  border-left: 1px solid #ea580c;
  color: #b45309;
  font-size: 13px;
}

.amount-label,
.amount-cn,
.amount-small {
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.amount-label {
  font-weight: 600;
}

.amount-cn {
  border-left: 1px solid #ea580c;
  color: #303133;
  font-weight: 600;
}

.amount-small {
  justify-content: center;
  color: #b45309;
}

.invoice-doc-remark {
  display: grid;
  grid-template-columns: 46px 1fr;
  min-height: 90px;
  border-right: 1px solid #ea580c;
  border-bottom: 1px solid #ea580c;
  border-left: 1px solid #ea580c;
}

.remark-label {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ea580c;
  color: #b45309;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  writing-mode: vertical-rl;
}

.remark-content {
  padding: 12px;
  color: #303133;
  font-size: 13px;
  line-height: 1.7;
  word-break: break-all;
}

.invoice-doc-footer {
  padding: 12px 0 4px 62px;
  color: #b45309;
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.invoice-title-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    margin-right: 0;
    padding: 18px 20px 14px;
    border-bottom: 1px solid #ebeef5;
  }

  .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .el-dialog__body {
    padding: 20px 20px 8px;
  }

  .el-dialog__footer {
    padding: 12px 20px 18px;
  }
}

@media screen and (max-width: 768px) {
  .invoice-container {
    padding: 12px;
  }

  .invoice-card {
    padding: 14px;
  }

  .card-header {
    position: static;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .header-meta {
    position: static;
    white-space: normal;
  }

  .action-bar,
  .action-left,
  .action-right {
    align-items: stretch;
    flex-direction: column;
  }

  .date-range,
  .search-input {
    width: 100%;
  }

  .pagination {
    justify-content: flex-start;
    overflow-x: auto;
  }

  :deep(.invoice-title-dialog) {
    width: calc(100vw - 24px) !important;

    .el-dialog__body {
      padding: 16px 16px 4px;
    }
  }

  .preview-step-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .preview-step-actions {
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .invoice-preview-form {
    gap: 14px;
  }

  .invoice-preview-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .invoice-document-wrap {
    justify-content: flex-start;
    padding: 12px;
  }

  .invoice-title-form {
    :deep(.el-form-item) {
      display: block;
    }

    :deep(.el-form-item__label) {
      justify-content: flex-start;
      width: 100% !important;
      margin-bottom: 6px;
    }

    :deep(.el-form-item__content) {
      margin-left: 0 !important;
    }
  }

  .invoice-preview-form {
    :deep(.el-form-item) {
      display: block;
    }

    :deep(.el-form-item__label) {
      justify-content: flex-start;
      width: 100% !important;
      margin-bottom: 6px;
    }

    :deep(.el-form-item__content) {
      margin-left: 0 !important;
    }
  }
}
</style>
