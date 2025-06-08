<template>
  <div class="container">
    <AdminSidebar v-show="isSidebarShow"></AdminSidebar>

    <div class="right">
      <!-- 遮罩层 -->
      <div class="overlay" v-show="isoverlay" @click="handleSidebarShow"></div>
      <!-- 侧边栏控制按钮 -->
      <div class="control-sidebar" v-show="iscontrolShow">
        <el-icon @click="handleSidebarShow">
          <Menu />
        </el-icon>
      </div>
      <AdminHeader></AdminHeader>
      <div class="package-container" v-loading="loading">
        <div class="package-card">
          <!-- 标题区域 -->
          <div class="card-header">
            <div class="header-left">
              <el-icon class="icon">
                <Tickets />
              </el-icon>
              <span class="title">套餐管理</span>
            </div>
            <div class="header-right">
              <el-button type="primary" @click="dialogStatus = true">
                <span>新增套餐</span>
              </el-button>
            </div>
          </div>

          <!-- 表格区域 -->
          <div class="table-container">
            <client-only>
              <el-table :data="filterTableData" style="width: 100%">
                <el-table-column width="160" fixed="right">
                  <template #header>
                    <div class="search-wrapper">
                      <el-input v-model="search" placeholder="搜索" clearable>
                      </el-input>
                    </div>
                  </template>
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button type="primary" link @click="handleEdit(scope.$index, scope.row)">
                        编辑
                      </el-button>
                      <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" title="确定要删除吗？"
                        @confirm="handleDelete(scope.$index, scope.row)">
                        <template #reference>
                          <el-button type="danger" link> 删除 </el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="套餐名称" min-width="120" />
                <el-table-column prop="api_name" label="接口名称" min-width="120" />
                <el-table-column prop="type" label="类型" width="120">
                  <template #default="scope">
                    <el-tag :type="getTypeTag(scope.row.type)">
                      {{ getTypeText(scope.row.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="price" label="价格" width="100">
                  <template #default="scope">
                    <span class="price">¥{{ scope.row.price }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="duration" label="有效期" width="100">
                  <template #default="scope">
                    <span class="duration">{{ scope.row.duration }}天</span>
                  </template>
                </el-table-column>
                <el-table-column prop="points" label="点数" width="80">
                  <template #default="scope">
                    <span class="points">{{ scope.row.points }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" class="status-tag"
                      @click="handleStatusChange(scope.row)" style="cursor: pointer">
                      {{ scope.row.status === 1 ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="create_time" label="创建时间" width="180" />
                <el-table-column prop="update_time" label="修改时间" width="180" />
              </el-table>
            </client-only>
          </div>

          <!-- 新增/编辑套餐对话框 -->
          <el-dialog v-model="dialogStatus" :title="updatePackageStatus ? '修改套餐' : '新增套餐'" width="600px"
            destroy-on-close class="package-dialog">
            <div class="dialog-content">
              <el-form :model="packageInfo" label-width="100px">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="套餐名称" required>
                      <el-input v-model="packageInfo.name" placeholder="请输入套餐名称" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="接口名称" required>
                      <el-autocomplete v-model="packageInfo.api_name" :fetch-suggestions="querySearchAsync"
                        placeholder="请输入接口名称" @select="handleSearchSelect" class="full-width" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="套餐类型" required>
                      <el-select v-model="packageInfo.type" placeholder="请选择套餐类型" class="full-width">
                        <el-option label="包月计费" :value="2" />
                        <el-option label="点数包" :value="3" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="套餐价格" required>
                      <el-input v-model="packageInfo.price" placeholder="请输入价格(整数)" class="full-width"
                        @input="handleCustomAmount('price')">
                        <template #suffix>¥</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="包含点数" v-if="packageInfo.type === 3" required>
                      <el-input v-model="packageInfo.points" placeholder="请输入点数" class="full-width"
                        @input="validateNumber('points')">
                        <template #suffix>点</template>
                      </el-input>
                    </el-form-item>
                    <el-form-item label="有效期" required v-if="packageInfo.type === 2">
                      <el-input v-model="packageInfo.duration" placeholder="请输入有效期(天)" class="full-width"
                        @input="validateNumber('duration')">
                        <template #suffix>天</template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12"> </el-col>
                </el-row>

                <el-form-item label="状态">
                  <el-switch v-model="packageInfo.status" :active-value="1" :inactive-value="0" />
                </el-form-item>

                <el-form-item label="描述">
                  <el-input v-model="packageInfo.description" type="textarea" :rows="3" placeholder="请输入套餐描述" />
                </el-form-item>
              </el-form>
            </div>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="dialogStatus = false">取消</el-button>
                <el-button type="primary" @click="submit">
                  {{ updatePackageStatus ? '修改' : '创建' }}
                </el-button>
              </div>
            </template>
          </el-dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Tickets, Menu } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

// 控制左侧边栏显示隐藏
// 获取页面宽度
const screenWidth = ref(0)
const isSidebarShow = ref(true)
const iscontrolShow = ref(false)
const isoverlay = ref(false)
onMounted(() => {
  screenWidth.value = document.body.clientWidth
  document.body.style.overflow = ''

  if (screenWidth.value < 768) {
    iscontrolShow.value = true
    isSidebarShow.value = false
  }
})

const handleSidebarShow = () => {
  isSidebarShow.value = !isSidebarShow.value
  iscontrolShow.value = !iscontrolShow.value
  isoverlay.value = !isoverlay.value
  // 禁止页面滑动
  if (isSidebarShow.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const tableData = ref([])
const search = ref('')
const loading = ref(false)

// 弹窗显示状态
const dialogStatus = ref(false)
const updatePackageStatus = ref(false)

// 套餐信息
const packageInfo = ref({
  id: 0,
  name: '',
  api_name: '',
  api_id: 0,
  type: 2,
  price: 0,
  duration: 30,
  points: 0,
  status: 1,
  description: '',
})

// 搜索相关
const searchData = ref({})
const searchOldValue = ref('')

// 接口搜索
const querySearchAsync = async (queryString, cb) => {
  if (queryString === '') {
    packageInfo.value.api_name = ''
    cb([])
    return false
  }

  if (queryString === searchOldValue.value) {
    cb(searchData.value)
    return false
  }

  const res = await $myFetch('ApiSearch', {
    params: {
      keyword: queryString,
    },
  })

  if (res.code !== 200) {
    $msg(res.msg, 'error')
  }

  // 遍历数据，将 name 改为 value
  res.data = res.data.map((item) => {
    item.value = item.name
    delete item.name
    return item
  })

  searchOldValue.value = queryString
  searchData.value = res.data
  cb(searchData.value)
}

// 选择接口
const handleSearchSelect = (item) => {
  packageInfo.value.api_name = item.value
  packageInfo.value.api_id = item.id
}

// 获取数据信息
const getData = async () => {
  loading.value = true
  const res = await $myFetch('PackageList')

  if (res.code === 200) {
    res.data.forEach((element, key) => {
      res.data[key].create_time = new Date(
        element.created_time
      ).toLocaleString()
      res.data[key].update_time = new Date(
        element.updated_time
      ).toLocaleString()
    })
    tableData.value = res.data
  } else {
    $msg(res.msg, 'error')
  }
  loading.value = false
}

onMounted(() => {
  getData()
})

// 搜索框
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.name.toLowerCase().includes(search.value.toLowerCase()) ||
      data.api_name.toLowerCase().includes(search.value.toLowerCase())
  )
)

// 获取类型文字
const getTypeText = (type) => {
  const types = {
    2: '包月计费',
    3: '点数包',
  }
  return types[type] || '未知'
}

// 获取类型标签样式
const getTypeTag = (type) => {
  const types = {
    2: 'success',
    3: 'primary',
  }
  return types[type] || ''
}

// 编辑套餐
const handleEdit = (index, row) => {
  dialogStatus.value = true
  updatePackageStatus.value = true

  packageInfo.value = { ...row }
}

// 删除套餐
const handleDelete = async (index, row) => {
  loading.value = true
  const res = await $myFetch('DeletePackage', {
    params: {
      id: row.id,
    },
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    await getData()
  } else {
    $msg(res.msg, 'error')
  }
  loading.value = false
}

// 修改状态
const handleStatusChange = async (row) => {
  loading.value = true
  const body = new URLSearchParams()
  body.append('id', row.id)
  body.append('name', row.name)
  body.append('apiId', row.api_id)
  body.append('type', row.type)
  body.append('price', row.price)
  body.append('duration', row.duration)
  body.append('points', row.points || 0)
  body.append('status', row.status === 1 ? 0 : 1)
  body.append('description', row.description || '')

  const res = await $myFetch('UpdatePackage', {
    method: 'POST',
    body,
  })

  if (res.code === 200) {
    row.status = row.status === 1 ? 0 : 1
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }
  loading.value = false
}

// 提交
const submit = async () => {
  // 验证必填信息
  if (!packageInfo.value.name) {
    $msg('请输入套餐名称', 'error')
    return
  }
  if (!packageInfo.value.api_name) {
    $msg('请输入接口名称', 'error')
    return
  }
  if (packageInfo.value.price < 0) {
    $msg('价格不能小于0', 'error')
    return
  }
  if (packageInfo.value.type === 2 && packageInfo.value.duration < 1) {
    $msg('有效期不能小于1天', 'error')
    return
  }
  if (packageInfo.value.type === 3 && packageInfo.value.points <= 0) {
    $msg('请输入正确的点数', 'error')
    return
  }

  loading.value = true
  const body = new URLSearchParams()
  body.append('name', packageInfo.value.name)
  body.append('apiId', packageInfo.value.api_id)
  body.append('type', packageInfo.value.type)
  body.append('price', packageInfo.value.price)
  body.append('duration', packageInfo.value.duration)
  body.append('points', packageInfo.value.points || 0)
  body.append('status', packageInfo.value.status)
  body.append('description', packageInfo.value.description || '')

  const url = updatePackageStatus.value ? 'UpdatePackage' : 'CreatePackage'
  if (updatePackageStatus.value) {
    body.append('id', packageInfo.value.id)
  }

  const res = await $myFetch(url, {
    method: 'POST',
    body,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
    dialogStatus.value = false
    await getData()
  } else {
    $msg(res.msg, 'error')
  }
  loading.value = false
}

// 监听弹窗关闭，重置表单
watch(dialogStatus, (newValue) => {
  if (!newValue) {
    updatePackageStatus.value = false
    packageInfo.value = {
      id: 0,
      name: '',
      api_name: '',
      api_id: 0,
      type: 2,
      price: 0,
      duration: 30,
      points: 0,
      status: 1,
      description: '',
    }
  }
})

// 数字验证
// 自定义金额
const handleCustomAmount = (field) => {
  if (packageInfo.value[field]) {
    // 允许输入数字和小数点，但限制只能有一个小数点
    const numVal = packageInfo.value[field].toString().replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
    // 只更新显示值，不立即转换为数字
    packageInfo.value[field] = numVal
  } else {
    // 当输入框为空时，设置金额为0
    packageInfo.value[field] = ''
  }
}

const validateNumber = (field) => {
  // 移除非数字字符
  packageInfo.value[field] = packageInfo.value[field]
    .toString()
    .replace(/[^\d]/g, '')

  // 转换为数字
  if (packageInfo.value[field] !== '') {
    packageInfo.value[field] = parseInt(packageInfo.value[field])
  }
}

useHead({
  title: '套餐管理',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<style lang="less" scoped>
.container {
  display: flex;
  background: #f5f7fa;

  .right {
    width: 100%;
    min-width: 0;

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 998;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .control-sidebar {
      position: absolute;
      width: 35px;
      height: 35px;
      top: 10px;
      left: 10px;
      z-index: 9999;
      text-align: center;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

      .el-icon {
        margin-top: 10px;
        font-size: 16px;
      }
    }

    .package-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      justify-content: center;

      .package-card {
        width: 100%;
        max-width: 1400px;
        border-radius: 12px;
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

            .icon {
              font-size: 20px;
              color: #4b5563;
            }

            .title {
              font-size: 16px;
              font-weight: 600;
              color: #1a1f36;
            }
          }

          .header-right {
            .el-button {
              display: flex;
              align-items: center;
              gap: 6px;
            }
          }
        }

        .table-container {
          padding: 24px;
          background: #fff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

          :deep(.el-table) {
            border: none;

            .search-wrapper {
              padding: 0;
              margin: 0;
              line-height: 1;
            }

            .el-input {
              width: 140px;
              margin: 0;
            }

            .el-table__header-wrapper {
              th {
                background: #f8fafc;
                color: #1f2937;
                font-weight: 600;
              }
            }
          }

          .table-actions {
            display: flex;
            gap: 4px;
            margin: 0;
            padding: 0;
          }
        }
      }
    }
  }
}

// 表格中的价格样式
.price {
  color: #f56c6c;
  font-weight: 500;
}

.duration,
.points {
  color: #67c23a;
  font-weight: 500;
}

// 对话框样式
:deep(.package-dialog) {
  border-radius: 12px;
  overflow: hidden;

  .el-dialog__header {
    margin: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #eaecf0;
    background: #f8fafc;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1f36;
    }
  }

  .el-dialog__body {
    padding: 24px;

    .dialog-content {
      .el-form {
        .el-form-item__label {
          font-weight: 500;
          color: #374151;
          padding-bottom: 8px;
        }

        .el-input__wrapper,
        .el-textarea__inner {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #d1d5db;
          border-radius: 6px;

          &:hover {
            border-color: #9ca3af;
          }

          &.is-focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }

        .el-input-number.full-width {
          width: 100%;

          .el-input__wrapper {
            padding-left: 8px;
          }
        }

        .el-select.full-width {
          width: 100%;
        }
      }
    }
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #eaecf0;
    background: #f8fafc;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        padding: 8px 20px;
        font-weight: 500;
        min-width: 88px;

        &.el-button--primary {
          background: #3b82f6;
          border-color: #3b82f6;

          &:hover {
            background: #2563eb;
            border-color: #2563eb;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .container .right .package-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .package-container {
    padding: 12px;
  }
}

.status-tag {
  padding: 4px 12px;
  font-size: 13px;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    opacity: 0.8;
  }
}
</style>
