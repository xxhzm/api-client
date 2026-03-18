<script setup>
import { Search, InfoFilled, ShoppingCart, Menu } from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()
const route = useRoute()

definePageMeta({
  layout: 'admin',
})

const TYPE_ORDER = { 2: 0, 3: 1, 4: 2 }
const loading = ref(false)
const searchKeyword = ref('')
const apiList = ref([])
const buyingId = ref(null)
const dialogVisible = ref(false)
const confirmLoading = ref(false)
const selectedPackage = ref({})
const selectedType = ref(null)
const selectedApi = ref(null)
const packageCardRefs = ref({})

const highlightedPackageId = computed(() => {
  const id = Number(route.query.package_id)
  return Number.isFinite(id) && id > 0 ? id : null
})

const normalizePackage = (pkg) => ({
  ...pkg,
  id: Number(pkg.id),
  api_id: Number(pkg.api_id),
  type: Number(pkg.type),
  price: Number(pkg.price || 0),
  points: Number(pkg.points || 0),
  duration: Number(pkg.duration || 0),
  api_name: pkg.api_name || '未命名接口',
  description: pkg.description || '',
})

const sortPackages = (packages = []) =>
  [...packages].sort((a, b) => {
    const typeGap = (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99)
    return typeGap || a.price - b.price
  })

const getTypeText = (type) => {
  const types = {
    2: '时长套餐',
    3: '点数套餐',
    4: '直接扣费',
  }
  return types[type] || '未知类型'
}

const getTypeTag = (type) => {
  const types = {
    2: 'success',
    3: 'primary',
    4: 'warning',
  }
  return types[type] || ''
}

const getQuotaText = (pkg = {}) => {
  if (Number(pkg.type) === 2) return '不限次数'
  if (Number(pkg.type) === 4) return '按次扣费'
  return `${pkg.points || 0} 次`
}

const getDurationText = (pkg = {}) => {
  if (Number(pkg.type) === 4 || !pkg.duration || Number(pkg.duration) <= 0) {
    return '永久有效'
  }
  return `${pkg.duration} 天`
}

const getApiTypeCount = (api, type) =>
  api.packages.filter((pkg) => pkg.type === type).length

const getApiDescription = (api) => {
  if (api.description) return api.description

  const chunks = []
  const monthly = getApiTypeCount(api, 2)
  const points = getApiTypeCount(api, 3)
  const direct = getApiTypeCount(api, 4)

  if (monthly) chunks.push(`${monthly} 个时长套餐`)
  if (points) chunks.push(`${points} 个点数套餐`)
  if (direct) chunks.push(`${direct} 个直接扣费套餐`)

  return chunks.length
    ? `当前接口提供 ${chunks.join('、')}`
    : '当前接口暂无补充说明'
}

const getApiShortDescription = (api) => {
  if (api.description) return api.description
  return '点击查看该接口套餐'
}

const formatPrice = (price) => {
  const num = Number(price || 0)
  return Number.isInteger(num) ? `${num}` : num.toFixed(2).replace(/\.?0+$/, '')
}

const displayList = computed(() => {
  let apis = apiList.value

  if (selectedApi.value) {
    apis = apis.filter((api) => api.id === selectedApi.value)
  }

  return apis
    .map((api) => {
      let pkgs = api.packages

      if (selectedType.value) {
        pkgs = pkgs.filter((pkg) => pkg.type === selectedType.value)
      }

      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase().trim()
        const apiText = `${api.name} ${api.description || ''}`.toLowerCase()

        if (!apiText.includes(keyword)) {
          pkgs = pkgs.filter((pkg) =>
            [
              pkg.name,
              pkg.description,
              getTypeText(pkg.type),
              getQuotaText(pkg),
              getDurationText(pkg),
            ]
              .join(' ')
              .toLowerCase()
              .includes(keyword),
          )
        }
      }

      return {
        ...api,
        packages: pkgs,
      }
    })
    .filter((api) => api.packages.length > 0)
})

const visiblePackageCount = computed(() =>
  displayList.value.reduce((sum, api) => sum + api.packages.length, 0),
)

const shouldShowPackageList = computed(
  () =>
    Boolean(selectedApi.value) ||
    Boolean(searchKeyword.value) ||
    Boolean(selectedType.value) ||
    Boolean(highlightedPackageId.value),
)

const visiblePackageCountMap = computed(() => {
  const map = {}
  displayList.value.forEach((api) => {
    map[api.id] = api.packages.length
  })
  return map
})

const activeFilterCount = computed(
  () =>
    Number(Boolean(searchKeyword.value)) +
    Number(Boolean(selectedType.value)) +
    Number(Boolean(selectedApi.value)),
)

const clearFilters = () => {
  searchKeyword.value = ''
  selectedType.value = null
  selectedApi.value = null
}

const selectApi = (apiId) => {
  selectedApi.value = selectedApi.value === apiId ? null : apiId
}

const isHighlightedPackage = (packageId) =>
  highlightedPackageId.value === packageId

const setPackageCardRef = (packageId, el) => {
  if (el) {
    packageCardRefs.value[packageId] = el
  } else {
    delete packageCardRefs.value[packageId]
  }
}

const findPackageTarget = (packageId) => {
  for (const api of apiList.value) {
    const pkg = api.packages.find((item) => item.id === packageId)
    if (pkg) return { api, pkg }
  }
  return null
}

const focusPackageFromRoute = async () => {
  if (!highlightedPackageId.value || !apiList.value.length) return

  const target = findPackageTarget(highlightedPackageId.value)
  if (!target) return

  selectedApi.value = target.api.id

  await nextTick()
  packageCardRefs.value[highlightedPackageId.value]?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
}

const getData = async () => {
  loading.value = true
  try {
    const res = await $myFetch('ApiPackageList')
    if (res.code === 200) {
      const groupedData = {}
      res.data.forEach((rawPkg) => {
        const pkg = normalizePackage(rawPkg)
        if (!groupedData[pkg.api_id]) {
          groupedData[pkg.api_id] = {
            id: pkg.api_id,
            name: pkg.api_name,
            description: rawPkg.api_description || rawPkg.api_desc || '',
            packages: [],
          }
        }
        groupedData[pkg.api_id].packages.push(pkg)
      })

      apiList.value = Object.values(groupedData)
        .map((api) => ({
          ...api,
          packages: sortPackages(api.packages),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))

      await focusPackageFromRoute()
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('获取数据失败', 'error')
  }
  loading.value = false
}

const handleBuy = (pkg) => {
  selectedPackage.value = pkg
  dialogVisible.value = true
}

const confirmBuy = async () => {
  confirmLoading.value = true
  buyingId.value = selectedPackage.value.id

  try {
    const res = await $myFetch('BuyPackage', {
      method: 'POST',
      body: new URLSearchParams({
        packageId: selectedPackage.value.id,
      }),
    })

    if (res.code === 200) {
      $msg(res.data, 'success')
      dialogVisible.value = false
    } else {
      $msg(res.msg, 'error')
    }
  } catch (error) {
    $msg('购买失败，请重试', 'error')
  }

  confirmLoading.value = false
  buyingId.value = null
}

watch(highlightedPackageId, async () => {
  await focusPackageFromRoute()
})

onMounted(() => {
  getData()
})

useHead({
  title: '购买套餐',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="buy_container">
    <div class="cont">
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon"><ShoppingCart /></el-icon>
          <div>
            <div class="title">购买套餐</div>
            <div class="subtitle">
              按接口查看和筛选套餐，更容易确认自己要购买的接口。
              <el-tooltip
                content="1点数通常等于1次请求，具体以接口规则为准"
                placement="top"
              >
                <el-icon class="info-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
        </div>

        <div class="header-right">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索接口或套餐"
            clearable
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="selectedApi"
            placeholder="选择接口"
            clearable
            filterable
            class="filter-select"
          >
            <template #prefix>
              <el-icon><Menu /></el-icon>
            </template>
            <el-option
              v-for="api in apiList"
              :key="api.id"
              :label="api.name"
              :value="api.id"
            />
          </el-select>
        </div>
      </div>

      <div class="filter-bar">
        <div class="type-toggles">
          <button
            type="button"
            class="type-toggle-item"
            :class="{ active: !selectedType }"
            @click="selectedType = null"
          >
            全部类型
          </button>
          <button
            type="button"
            class="type-toggle-item"
            :class="{ active: selectedType === 2 }"
            @click="selectedType = 2"
          >
            时长套餐
          </button>
          <button
            type="button"
            class="type-toggle-item"
            :class="{ active: selectedType === 3 }"
            @click="selectedType = 3"
          >
            点数套餐
          </button>
        </div>

        <div class="filter-summary">
          <span class="summary-text">
            当前 {{ displayList.length }} 个接口 /
            {{ visiblePackageCount }} 个套餐
          </span>
          <el-button
            v-if="activeFilterCount"
            type="primary"
            link
            @click="clearFilters"
          >
            清空筛选
          </el-button>
        </div>
      </div>

      <div v-if="apiList.length" class="api-overview">
        <div class="section-title">接口目录</div>
        <div class="api-overview-grid">
          <button
            v-for="api in apiList"
            :key="api.id"
            type="button"
            class="api-overview-card"
            :class="{
              active: selectedApi === api.id,
              dimmed: activeFilterCount > 0 && !visiblePackageCountMap[api.id],
            }"
            @click="selectApi(api.id)"
          >
            <div class="api-card-top">
              <span class="api-card-name">{{ api.name }}</span>
              <span class="api-card-count">
                {{
                  activeFilterCount
                    ? visiblePackageCountMap[api.id] || 0
                    : api.packages.length
                }}个套餐
              </span>
            </div>
            <p class="api-card-desc">{{ getApiShortDescription(api) }}</p>
          </button>
        </div>
      </div>

      <div class="package-container" v-loading="loading">
        <div v-if="!shouldShowPackageList" class="guide-state">
          <el-empty description="请先选择接口，再查看对应套餐">
            <template #image>
              <el-icon :size="56" class="empty-icon"><Menu /></el-icon>
            </template>
            <template #default>
              <div class="guide-text">
                可以点击上方接口目录，也可以直接搜索接口或套餐。
              </div>
            </template>
          </el-empty>
        </div>

        <div v-else-if="displayList.length > 0">
          <div v-for="api in displayList" :key="api.id" class="api-section">
            <div class="api-section-header">
              <div class="api-section-main">
                <h2 class="api-name">{{ api.name }}</h2>
                <p v-if="api.description" class="api-desc">
                  {{ api.description }}
                </p>
              </div>

              <div class="api-tags">
                <el-tag
                  v-if="getApiTypeCount(api, 2)"
                  type="success"
                  effect="light"
                  size="small"
                >
                  时长套餐 {{ getApiTypeCount(api, 2) }}
                </el-tag>
                <el-tag
                  v-if="getApiTypeCount(api, 3)"
                  type="primary"
                  effect="light"
                  size="small"
                >
                  点数套餐 {{ getApiTypeCount(api, 3) }}
                </el-tag>
                <el-tag
                  v-if="getApiTypeCount(api, 4)"
                  type="warning"
                  effect="light"
                  size="small"
                >
                  直接扣费 {{ getApiTypeCount(api, 4) }}
                </el-tag>
              </div>
            </div>

            <div class="package-grid">
              <div
                v-for="pkg in api.packages"
                :key="pkg.id"
                :ref="(el) => setPackageCardRef(pkg.id, el)"
                class="package-card"
                :class="{ active: isHighlightedPackage(pkg.id) }"
              >
                <div class="card-head">
                  <div class="card-badges">
                    <el-tag :type="getTypeTag(pkg.type)" size="small">
                      {{ getTypeText(pkg.type) }}
                    </el-tag>
                    <el-tag
                      v-if="isHighlightedPackage(pkg.id)"
                      type="warning"
                      size="small"
                    >
                      文档推荐
                    </el-tag>
                  </div>
                  <div class="card-price">¥{{ formatPrice(pkg.price) }}</div>
                </div>

                <div class="card-title">{{ pkg.name }}</div>
                <div class="card-desc">
                  {{
                    pkg.description ||
                    `${getQuotaText(pkg)} / ${getDurationText(pkg)}`
                  }}
                </div>

                <div class="card-meta">
                  <div class="meta-item">
                    <span class="meta-label">调用范围</span>
                    <span class="meta-value">{{ getQuotaText(pkg) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">有效期</span>
                    <span class="meta-value">{{ getDurationText(pkg) }}</span>
                  </div>
                </div>

                <div class="card-foot">
                  <span class="card-api">适用接口：{{ api.name }}</span>
                  <el-button
                    type="primary"
                    :plain="pkg.type !== 2"
                    @click="handleBuy(pkg)"
                    :loading="pkg.id === buyingId"
                  >
                    立即购买
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <el-empty description="暂无符合条件的套餐">
            <template #image>
              <el-icon :size="60" class="empty-icon"><ShoppingCart /></el-icon>
            </template>
          </el-empty>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="确认购买"
      width="420px"
      destroy-on-close
    >
      <div class="confirm-content">
        <div class="confirm-info">
          <div class="info-row">
            <span class="label">套餐名称：</span>
            <span>{{ selectedPackage.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">所属接口：</span>
            <span>{{ selectedPackage.api_name }}</span>
          </div>
          <div class="info-row">
            <span class="label">套餐类型：</span>
            <el-tag :type="getTypeTag(selectedPackage.type)" size="small">
              {{ getTypeText(selectedPackage.type) }}
            </el-tag>
          </div>
          <div class="info-row">
            <span class="label">调用范围：</span>
            <span>{{ getQuotaText(selectedPackage) }}</span>
          </div>
          <div class="info-row">
            <span class="label">有效期：</span>
            <span>{{ getDurationText(selectedPackage) }}</span>
          </div>
          <div class="info-row">
            <span class="label">价格：</span>
            <span class="confirm-price"
              >¥{{ formatPrice(selectedPackage.price) }}</span
            >
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmBuy"
            :loading="confirmLoading"
          >
            确认购买
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.buy_container {
  min-height: 100vh;
  padding: 20px;
  background-color: #f7f7f7;
}

.cont {
  width: 100%;
  height: 100%;
  padding: 24px;
  background: #fff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.icon {
  margin-top: 2px;
  font-size: 22px;
  color: #3b82f6;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input,
.filter-select {
  width: 220px;
}

.search-input :deep(.el-input__wrapper),
.filter-select :deep(.el-input__wrapper) {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.search-input :deep(.el-input__wrapper.is-focus),
.filter-select :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 14px 16px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 10px;
}

.type-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.type-toggle-item {
  padding: 6px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  color: #606266;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.type-toggle-item:hover {
  color: #409eff;
  border-color: #409eff;
}

.type-toggle-item.active {
  color: #409eff;
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.filter-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.summary-text {
  font-size: 13px;
  color: #606266;
}

.api-overview {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 10px;
}

.section-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.api-overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.api-overview-card {
  text-align: left;
  padding: 14px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.api-overview-card:hover {
  border-color: #409eff;
}

.api-overview-card.active {
  border-color: #409eff;
  background: #f0f7ff;
}

.api-overview-card.dimmed {
  opacity: 0.55;
}

.api-card-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.api-card-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.api-card-count {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.api-card-desc {
  font-size: 12px;
  line-height: 1.6;
  color: #606266;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.package-container {
  min-height: 420px;
}

.api-section {
  margin-bottom: 24px;
}

.api-section:last-child {
  margin-bottom: 0;
}

.api-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.api-name {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.api-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.api-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.package-card {
  padding: 18px;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  background: #fff;
  transition: all 0.2s ease;
}

.package-card:hover {
  border-color: #c6e2ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.package-card.active {
  border-color: #e6a23c;
  background: #fffbf3;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.card-price {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
}

.card-title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-desc {
  min-height: 20px;
  margin-bottom: 14px;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
}

.card-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.meta-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8f9fb;
}

.meta-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #909399;
}

.meta-value {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.card-api {
  font-size: 12px;
  color: #909399;
}

.empty-state {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.guide-state {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.guide-state :deep(.el-empty) {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.guide-text {
  margin-top: 8px;
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
}

.empty-state :deep(.el-empty) {
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.empty-icon {
  color: #909399;
  margin-bottom: 20px;
}

.confirm-info {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #eef2f7;
  font-size: 14px;
}

.info-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.info-row:first-child {
  padding-top: 0;
}

.label {
  color: #606266;
  flex-shrink: 0;
}

.confirm-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.info-icon {
  font-size: 14px;
  color: #909399;
  cursor: help;
}

@media screen and (max-width: 768px) {
  .buy_container {
    padding: 16px;
  }

  .cont {
    padding: 20px;
  }

  .card-header,
  .filter-bar,
  .api-section-header,
  .card-foot {
    flex-direction: column;
    align-items: stretch;
  }

  .header-right {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }

  .filter-summary {
    justify-content: space-between;
  }

  .api-overview-grid,
  .package-grid,
  .card-meta {
    grid-template-columns: 1fr;
  }

  .card-head,
  .api-card-top {
    flex-direction: column;
  }
}
</style>
