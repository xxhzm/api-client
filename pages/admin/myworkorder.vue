<script setup>
import { Service } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const loading = ref(false)
const tableData = ref([])
const search = ref('')

// 分页相关
const page = ref(1)
const pageSize = ref(25)
const totalRecords = ref(0)
const pageLoading = ref(false)


const { typeMap, priorityMap, statusMap, getStatusTagType, getPriorityTagType, formatTime } = useWorkOrder()

// 获取工单列表
const getData = async () => {
  loading.value = true
  try {
    const res = await $myFetch('MyWorkOrderList', {
      params: {
        page: page.value,
        limit: pageSize.value,
        keyword: search.value.trim() || undefined,
      },
    })

    if (res.code === 200) {
      tableData.value = res.data.list || []
      totalRecords.value = res.data.count || 0
    } else {
      tableData.value = []
      totalRecords.value = 0
    }
  } catch (error) {
    console.error(error)
    $msg('获取工单列表失败', 'error')
  } finally {
    loading.value = false
    pageLoading.value = false
  }
}

onMounted(() => {
  getData()
})

// 搜索
const handleSearch = () => {
  page.value = 1
  getData()
}

// 监听搜索输入防抖
const debouncedSearch = ref(null)
watch(search, () => {
  if (debouncedSearch.value) clearTimeout(debouncedSearch.value)
  debouncedSearch.value = setTimeout(() => {
    handleSearch()
  }, 500)
})

// 分页变化
watch([page, pageSize], () => {
  getData()
})

// 查看工单详情
const handleView = (row) => {
  navigateTo(`/admin/workorderdetail/${row.id}?from=user`)
}

// 结单/关闭工单
const handleCloseOrder = async (row) => {
  try {
    const res = await $myFetch('CloseWorkOrder', {
      params: { order_id: row.id },
    })

    if (res.code === 200) {
      $msg('工单已完结', 'success')
      getData()
    } else {
      $msg(res.msg || '操作失败', 'error')
    }
  } catch (error) {
    $msg('操作失败', 'error')
  }
}

// 格式化时间

useHead({
  title: '我的工单',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="workorder-container" v-loading="loading">
    <div class="main-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon"><Service /></el-icon>
          <span class="title">我的工单</span>
        </div>
        <div class="header-right">
          <el-button
            type="primary"
            @click="navigateTo('/admin/createworkorder')"
          >
            <span>新建工单</span>
          </el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <client-only>
          <el-table
            :data="tableData"
            style="width: 100%"
            v-loading="pageLoading"
          >
            <el-table-column fixed="right" width="220">
              <template #header>
                <div class="search-wrapper">
                  <el-input
                    v-model="search"
                    placeholder="搜索标题或工单号"
                    clearable
                    style="width: 100%"
                  />
                </div>
              </template>
              <template #default="scope">
                <div class="table-actions">
                  <el-button type="primary" link @click="handleView(scope.row)">
                    查看/回复
                  </el-button>
                  <el-popconfirm
                    v-if="String(scope.row.status) !== '2'"
                    title="确定要完结此工单吗？"
                    @confirm="handleCloseOrder(scope.row)"
                  >
                    <template #reference>
                      <el-button type="success" link>完结</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column
              prop="title"
              label="工单标题"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column label="类型" width="100">
              <template #default="scope">
                {{ typeMap[scope.row.type] || '未知' }}
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="100">
              <template #default="scope">
                <el-tag
                  :type="getPriorityTagType(scope.row.priority)"
                  size="small"
                >
                  {{ priorityMap[scope.row.priority] || '普通' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ statusMap[scope.row.status] || '未知' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="180">
              <template #default="scope">
                {{ formatTime(scope.row.create_time) }}
              </template>
            </el-table-column>
            <el-table-column label="更新时间" width="180">
              <template #default="scope">
                {{ formatTime(scope.row.update_time) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:page-size="pageSize"
              :page-sizes="[10, 25, 50, 100]"
              :pager-count="5"
              :total="totalRecords"
              v-model:current-page="page"
              :disabled="pageLoading"
              background
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>
        </client-only>
      </div>

    </div>
  </div>
</template>

<style lang="less" scoped>
.workorder-container {
  position: relative;
  min-height: 100vh;
  padding: 24px;
  display: flex;
  justify-content: center;
  background: #f5f7fa;

  .main-card {
    width: 100%;
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
          margin: 0;
          line-height: 1;
        }
        .el-input {
          width: 220px;
          margin: 0;
        }
        .el-table__header-wrapper th {
          background: #f8fafc;
          color: #1f2937;
          font-weight: 600;
        }
      }

      .table-actions {
        display: flex;
        gap: 8px;
      }

      .pagination {
        margin-top: 24px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

/* 响应式适配 */
@media screen and (max-width: 1200px) {
  .workorder-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .workorder-container {
    padding: 12px;
  }
}
</style>