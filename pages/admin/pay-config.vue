<script setup>
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

definePageMeta({
  layout: 'admin',
})

const { $msg, $myFetch } = useNuxtApp()

const channelOptions = [
  {
    label: '支付宝配置',
    value: 'alipay',
    defaultName: '支付宝主通道',
  },
  {
    label: '微信支付配置',
    value: 'wechat',
    defaultName: '微信支付主通道',
  },
  {
    label: '易支付配置',
    value: 'epay',
    defaultName: '易支付主通道',
  },
  {
    label: '虎皮椒支付配置',
    value: 'hupi',
    defaultName: '虎皮椒主通道',
  },
]

const activeChannel = ref('alipay')
const loadedMap = reactive({
  alipay: false,
  wechat: false,
  epay: false,
  hupi: false,
})
const loadingMap = reactive({
  alipay: false,
  wechat: false,
  epay: false,
  hupi: false,
})
const submitLoadingMap = reactive({
  alipay: false,
  wechat: false,
  epay: false,
  hupi: false,
})
const paymentLists = reactive({
  alipay: [],
  wechat: [],
  epay: [],
  hupi: [],
})
const formDialogVisible = ref(false)
const dialogMode = ref('create')
const editingChannel = ref('alipay')

const getDefaultConfigName = (channel) =>
  channelOptions.find((item) => item.value === channel)?.defaultName || ''

const createEmptyPaymentForm = (channel) => ({
  id: '',
  channel,
  name: getDefaultConfigName(channel),
  status: 1,
  appid: '',
  private_key: '',
  public_key: '',
  api_v_3_key: '',
  mchid: '',
  serial_no: '',
  wx_public_key_content: '',
  wx_public_key_id: '',
  key: '',
  pid: '',
  type: channel === 'epay' ? 'alipay' : '',
  url: '',
  app_secret: '',
  host: '',
  method: channel === 'hupi' ? 'wechat' : '',
})

const paymentForms = reactive({
  alipay: createEmptyPaymentForm('alipay'),
  wechat: createEmptyPaymentForm('wechat'),
  epay: createEmptyPaymentForm('epay'),
  hupi: createEmptyPaymentForm('hupi'),
})

const normalizePaymentConfig = (channel, config = {}) => {
  const defaultForm = createEmptyPaymentForm(channel)

  return {
    ...defaultForm,
    ...config,
    id: config.id || '',
    channel,
    name: config.name || defaultForm.name,
    appid: config.appid ?? config.appId ?? defaultForm.appid,
    private_key:
      config.private_key ?? config.privateKey ?? defaultForm.private_key,
    public_key: config.public_key ?? config.publicKey ?? defaultForm.public_key,
    api_v_3_key:
      config.api_v_3_key ?? config.apiV3Key ?? defaultForm.api_v_3_key,
    mchid: config.mchid ?? config.mchId ?? defaultForm.mchid,
    serial_no: config.serial_no ?? config.serialNo ?? defaultForm.serial_no,
    wx_public_key_content:
      config.wx_public_key_content ??
      config.wxPublicKeyContent ??
      defaultForm.wx_public_key_content,
    wx_public_key_id:
      config.wx_public_key_id ??
      config.wxPublicKeyId ??
      defaultForm.wx_public_key_id,
    app_secret: config.app_secret ?? config.appSecret ?? defaultForm.app_secret,
    status:
      config.status === 0 || config.status === 1
        ? config.status
        : Number(config.status || defaultForm.status),
  }
}

const applyConfigToForm = (channel, config) => {
  paymentForms[channel] = normalizePaymentConfig(channel, config)
}

const resetChannelForm = (channel) => {
  paymentForms[channel] = createEmptyPaymentForm(channel)
}

const pickConfigByName = (channel, name) => {
  if (!name) {
    return null
  }

  const matchedList = paymentLists[channel].filter((item) => item.name === name)

  if (!matchedList.length) {
    return null
  }

  return matchedList.sort((a, b) => {
    const aTime = Number(a.update_time || a.create_time || 0)
    const bTime = Number(b.update_time || b.create_time || 0)
    return bTime - aTime
  })[0]
}

const loadChannelConfigs = async (channel, preferredId = '') => {
  loadingMap[channel] = true

  try {
    const res = await $myFetch('PaymentConfigList', {
      params: {
        channel,
      },
    })

    if (res.code !== 200) {
      $msg(res.msg, 'error')
      return
    }

    paymentLists[channel] = Array.isArray(res.data)
      ? res.data.map((item) => normalizePaymentConfig(channel, item))
      : []

    if (preferredId) {
      const currentConfig = paymentLists[channel].find(
        (item) => String(item.id) === String(preferredId),
      )

      if (currentConfig) {
        applyConfigToForm(channel, currentConfig)
      }
    }
  } finally {
    loadingMap[channel] = false
  }
}

const openCreateConfigDialog = (channel) => {
  editingChannel.value = channel
  dialogMode.value = 'create'
  resetChannelForm(channel)
  formDialogVisible.value = true
}

const openEditConfigDialog = (channel, config) => {
  editingChannel.value = channel
  dialogMode.value = 'edit'
  applyConfigToForm(channel, config)
  formDialogVisible.value = true
}

const validateChannelForm = (channel) => {
  const form = paymentForms[channel]

  if (!form.name?.trim()) {
    $msg('请填写配置名称', 'error')
    return false
  }

  const requiredFieldsMap = {
    alipay: [
      ['appid', '支付宝 AppID'],
      ['private_key', '应用私钥'],
      ['public_key', '支付宝公钥'],
    ],
    wechat: [
      ['appid', '应用 ID'],
      ['api_v_3_key', 'API V3 密钥'],
      ['mchid', '商户号'],
      ['private_key', '商户私钥'],
      ['serial_no', '证书序列号'],
      ['wx_public_key_content', '微信支付平台公钥内容'],
      ['wx_public_key_id', '微信支付平台公钥 ID'],
    ],
    epay: [
      ['key', '密钥'],
      ['pid', '商户 ID'],
      ['type', '支付类型'],
      ['url', '支付地址'],
    ],
    hupi: [
      ['appid', '应用 ID'],
      ['app_secret', '应用密钥'],
      ['host', '支付网关'],
      ['method', '支付方式'],
    ],
  }

  const missingField = requiredFieldsMap[channel].find(
    ([key]) => !String(form[key] ?? '').trim(),
  )

  if (missingField) {
    $msg(`请填写${missingField[1]}`, 'error')
    return false
  }

  if (![0, 1].includes(Number(form.status))) {
    $msg('通道状态只能是启用或停用', 'error')
    return false
  }

  if (channel === 'epay' && !['wxpay', 'alipay'].includes(form.type)) {
    $msg('易支付类型只能是 wxpay 或 alipay', 'error')
    return false
  }

  if (channel === 'hupi' && !['wechat', 'alipay'].includes(form.method)) {
    $msg('虎皮椒支付方式只能是 wechat 或 alipay', 'error')
    return false
  }

  return true
}

const buildPayload = (channel) => {
  const form = paymentForms[channel]
  const payload = {
    channel,
    name: form.name.trim(),
    status: Number(form.status),
  }

  if (form.id) {
    payload.id = form.id
  }

  if (channel === 'alipay') {
    payload.appid = form.appid.trim()
    payload.privateKey = form.private_key
    payload.publicKey = form.public_key
  } else if (channel === 'wechat') {
    payload.appid = form.appid.trim()
    payload.apiV3Key = form.api_v_3_key.trim()
    payload.mchid = form.mchid.trim()
    payload.privateKey = form.private_key
    payload.serialNo = form.serial_no.trim()
    payload.wxPublicKeyContent = form.wx_public_key_content
    payload.wxPublicKeyID = form.wx_public_key_id.trim()
  } else if (channel === 'epay') {
    payload.key = form.key.trim()
    payload.pid = form.pid.trim()
    payload.type = form.type
    payload.url = form.url.trim()
  } else if (channel === 'hupi') {
    payload.appid = form.appid.trim()
    payload.appSecret = form.app_secret.trim()
    payload.host = form.host.trim()
    payload.method = form.method
  }

  return payload
}

const buildRequestBody = (payload) => {
  const body = new URLSearchParams()

  Object.entries(payload).forEach(([key, value]) => {
    body.append(key, value == null ? '' : String(value))
  })

  return body
}

const submitChannelConfig = async (channel) => {
  if (!validateChannelForm(channel)) {
    return
  }

  const formSnapshot = { ...paymentForms[channel] }
  const requestName = formSnapshot.id
    ? 'PaymentConfigUpdate'
    : 'PaymentConfigCreate'

  submitLoadingMap[channel] = true

  try {
    const res = await $myFetch(requestName, {
      method: 'POST',
      body: buildRequestBody(buildPayload(channel)),
    })

    if (res.code !== 200) {
      $msg(res.msg, 'error')
      return
    }

    $msg(res.msg, 'success')

    const preferredId = res.data?.id
      ? String(res.data.id)
      : formSnapshot.id
        ? String(formSnapshot.id)
        : pickConfigByName(channel, formSnapshot.name)?.id

    await loadChannelConfigs(channel, preferredId)
    formDialogVisible.value = false
  } finally {
    submitLoadingMap[channel] = false
  }
}

const deleteConfig = async (channel, config) => {
  try {
    await ElMessageBox.confirm(
      `确定删除「${config.name}」吗？删除后无法恢复。`,
      '删除支付配置',
      {
        type: 'warning',
      },
    )
  } catch {
    return
  }

  try {
    const res = await $myFetch('PaymentConfigDelete', {
      method: 'POST',
      params: {
        id: config.id,
      },
    })

    if (res.code !== 200) {
      $msg(res.msg, 'error')
      return
    }

    $msg(res.msg, 'success')
    await loadChannelConfigs(channel)

    if (paymentForms[channel].id === config.id) {
      resetChannelForm(channel)
    }
  } catch (error) {
    $msg(error?.data?.msg || error?.message || '删除失败', 'error')
  }
}

const formatTime = (value) => {
  if (!value) {
    return '-'
  }

  if (typeof value === 'string') {
    return value
  }

  const date = new Date(Number(value))

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  const pad = (num) => String(num).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const getConfigSummary = (channel, config) => {
  if (channel === 'alipay') {
    return `AppID: ${config.appid || '-'}`
  }

  if (channel === 'wechat') {
    return `AppID: ${config.appid || '-'} / 商户号: ${config.mchid || '-'}`
  }

  if (channel === 'epay') {
    return `PID: ${config.pid || '-'} / 类型: ${config.type || '-'} / 地址: ${config.url || '-'}`
  }

  if (channel === 'hupi') {
    return `AppID: ${config.appid || '-'} / 方式: ${config.method || '-'} / 网关: ${config.host || '-'}`
  }

  return '-'
}

const dialogTitle = computed(() =>
  dialogMode.value === 'edit' ? '编辑支付配置' : '新增支付配置',
)

watch(
  activeChannel,
  async (channel) => {
    if (!loadedMap[channel]) {
      await loadChannelConfigs(channel)
      loadedMap[channel] = true
    }
  },
  { immediate: true },
)

useHead({
  title: '支付配置',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="pay-config-container">
    <div class="cont">
      <div class="page-header">
        <div>
          <h2>支付配置</h2>
          <p>每个通道支持多条配置，当前页面可切换、创建、更新和删除。</p>
        </div>
        <div class="page-actions">
          <el-button
            type="primary"
            :icon="Plus"
            @click="openCreateConfigDialog(activeChannel)"
          >
            新增配置
          </el-button>
        </div>
      </div>

      <el-tabs v-model="activeChannel" class="setting-tabs sub-tabs">
        <el-tab-pane
          v-for="channel in channelOptions"
          :key="channel.value"
          :label="channel.label"
          :name="channel.value"
        >
          <div class="table-card">
            <div class="table-toolbar">
              <div class="table-toolbar__title">配置列表</div>
              <div class="form-help">表格展示当前通道下的全部支付配置。</div>
            </div>

            <el-table
              :data="paymentLists[channel.value]"
              v-loading="loadingMap[channel.value]"
              border
              stripe
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="配置名称" min-width="180" />
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'">
                    {{ row.status === 1 ? '启用' : '停用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="关键信息"
                min-width="320"
                show-overflow-tooltip
              >
                <template #default="{ row }">
                  {{ getConfigSummary(channel.value, row) }}
                </template>
              </el-table-column>
              <el-table-column label="更新时间" min-width="180">
                <template #default="{ row }">
                  {{ formatTime(row.update_time || row.create_time) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" fixed="right">
                <template #default="{ row }">
                  <div class="table-actions">
                    <el-button
                      type="primary"
                      link
                      @click="openEditConfigDialog(channel.value, row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      link
                      @click="deleteConfig(channel.value, row)"
                    >
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-dialog
        v-model="formDialogVisible"
        :title="dialogTitle"
        width="720px"
        destroy-on-close
      >
        <div class="form">
          <el-form
            :model="paymentForms[editingChannel]"
            label-position="top"
            label-width="120px"
          >
            <el-form-item label="配置名称" required>
              <el-input
                v-model="paymentForms[editingChannel].name"
                placeholder="请输入配置名称"
              />
            </el-form-item>

            <el-form-item label="通道状态" required>
              <el-switch
                v-model="paymentForms[editingChannel].status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="停用"
              />
            </el-form-item>

            <template v-if="editingChannel === 'alipay'">
              <el-form-item label="支付宝 AppID" required>
                <el-input
                  v-model="paymentForms.alipay.appid"
                  placeholder="请输入支付宝 AppID"
                />
              </el-form-item>
              <el-form-item label="应用私钥" required>
                <el-input
                  v-model="paymentForms.alipay.private_key"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入应用私钥"
                />
              </el-form-item>
              <el-form-item label="支付宝公钥" required>
                <el-input
                  v-model="paymentForms.alipay.public_key"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入支付宝公钥"
                />
              </el-form-item>
            </template>

            <template v-else-if="editingChannel === 'wechat'">
              <el-form-item label="应用 ID" required>
                <el-input
                  v-model="paymentForms.wechat.appid"
                  placeholder="请输入微信支付应用 ID"
                />
              </el-form-item>
              <el-form-item label="API V3 密钥" required>
                <el-input
                  v-model="paymentForms.wechat.api_v_3_key"
                  placeholder="请输入 API V3 密钥"
                />
              </el-form-item>
              <el-form-item label="商户号" required>
                <el-input
                  v-model="paymentForms.wechat.mchid"
                  placeholder="请输入微信支付商户号"
                />
              </el-form-item>
              <el-form-item label="商户私钥" required>
                <el-input
                  v-model="paymentForms.wechat.private_key"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入商户私钥"
                />
              </el-form-item>
              <el-form-item label="证书序列号" required>
                <el-input
                  v-model="paymentForms.wechat.serial_no"
                  placeholder="请输入证书序列号"
                />
              </el-form-item>
              <el-form-item label="微信支付平台公钥内容" required>
                <el-input
                  v-model="paymentForms.wechat.wx_public_key_content"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入微信支付平台公钥内容"
                />
              </el-form-item>
              <el-form-item label="微信支付平台公钥 ID" required>
                <el-input
                  v-model="paymentForms.wechat.wx_public_key_id"
                  placeholder="请输入微信支付平台公钥 ID"
                />
              </el-form-item>
            </template>

            <template v-else-if="editingChannel === 'epay'">
              <el-form-item label="商户 ID" required>
                <el-input
                  v-model="paymentForms.epay.pid"
                  placeholder="请输入商户 ID"
                />
              </el-form-item>
              <el-form-item label="密钥" required>
                <el-input
                  v-model="paymentForms.epay.key"
                  type="password"
                  show-password
                  placeholder="请输入易支付密钥"
                />
              </el-form-item>
              <el-form-item label="支付类型" required>
                <el-select
                  v-model="paymentForms.epay.type"
                  style="width: 100%"
                  placeholder="请选择支付类型"
                >
                  <el-option label="微信支付" value="wxpay" />
                  <el-option label="支付宝" value="alipay" />
                </el-select>
              </el-form-item>
              <el-form-item label="支付地址" required>
                <el-input
                  v-model="paymentForms.epay.url"
                  placeholder="请输入易支付地址"
                />
              </el-form-item>
            </template>

            <template v-else-if="editingChannel === 'hupi'">
              <el-form-item label="应用 ID" required>
                <el-input
                  v-model="paymentForms.hupi.appid"
                  placeholder="请输入虎皮椒应用 ID"
                />
              </el-form-item>
              <el-form-item label="应用密钥" required>
                <el-input
                  v-model="paymentForms.hupi.app_secret"
                  type="password"
                  show-password
                  placeholder="请输入虎皮椒应用密钥"
                />
              </el-form-item>
              <el-form-item label="支付网关" required>
                <el-input
                  v-model="paymentForms.hupi.host"
                  placeholder="请输入虎皮椒支付网关地址"
                />
              </el-form-item>
              <el-form-item label="支付方式" required>
                <el-select
                  v-model="paymentForms.hupi.method"
                  style="width: 100%"
                  placeholder="请选择支付方式"
                >
                  <el-option label="微信支付" value="wechat" />
                  <el-option label="支付宝" value="alipay" />
                </el-select>
              </el-form-item>
            </template>
          </el-form>
        </div>

        <template #footer>
          <div class="form-actions">
            <el-button @click="formDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              :loading="submitLoadingMap[editingChannel]"
              @click="submitChannelConfig(editingChannel)"
            >
              {{ paymentForms[editingChannel].id ? '保存修改' : '创建配置' }}
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="less" scoped>
.pay-config-container {
  min-height: 100vh;
  padding: 10px;
  background: #f7f7f7;

  .cont {
    width: 100%;
    height: 100%;
    padding: 20px;
    background: #fff;
    box-shadow: 0 2px 2px rgb(0 0 0 / 10%);
    border-radius: 8px;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;

  h2 {
    margin: 0 0 8px;
    font-size: 22px;
    color: #1f2937;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
  }
}

.page-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.setting-tabs {
  &.sub-tabs {
    margin-top: 16px;

    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }

    :deep(.el-tabs__nav-wrap) {
      &::after {
        height: 1px;
      }
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      padding: 0 20px;
      height: 36px;
      line-height: 36px;
      color: #606266;

      &.is-active {
        color: #409eff;
        font-weight: 500;
      }
    }
  }
}

.form {
  :deep(.el-form-item__label) {
    font-weight: 500;
    padding-bottom: 8px;
  }

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dcdfe6 inset;

    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px #409eff inset;
    }
  }
}

.table-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.table-toolbar {
  margin-bottom: 16px;
}

.table-toolbar__title {
  margin-bottom: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.form-help {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media screen and (max-width: 900px) {
  .page-header {
    flex-direction: column;
  }

  .page-actions,
  .form-actions {
    width: 100%;
  }
}
</style>
