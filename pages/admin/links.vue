<script setup>
import { Link } from '@element-plus/icons-vue'
const { $msg, $myFetch } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const tableData = ref([])
const search = ref('')

const loading = ref(false)

// 弹窗显示状态
const dialogStatus = ref(false)
const updateLinkStatus = ref(false)

const linkInfo = ref({
  id: 0,
  name: '',
  description: '',
  url: '',
  image: '',
  type: 1,
})

// 获取数据信息
const getData = async () => {
  const res = await $myFetch('LinkList')
  tableData.value = res.data
}

onMounted(() => {
  getData()
})

// 搜索框
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
)

// 编辑链接
const handleEdit = (index, row) => {
  dialogStatus.value = true
  updateLinkStatus.value = true

  linkInfo.value.id = row.id
  linkInfo.value.name = row.name
  linkInfo.value.description = row.description
  linkInfo.value.url = row.url
  linkInfo.value.image = row.image
  linkInfo.value.type = row.type || 1
}

// 删除链接
const handleDelete = async (index, row) => {
  loading.value = true
  const res = await $myFetch('DeleteLink', {
    params: {
      id: row.id,
    },
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }

  await getData()
  loading.value = false
}

const submit = async () => {
  // 判断信息是否填写
  if (
    linkInfo.value.name === '' ||
    linkInfo.value.url === '' ||
    linkInfo.value.image === '' ||
    linkInfo.value.description === ''
  ) {
    $msg('请填写完整信息', 'error')
    return
  }

  loading.value = true
  const body = new URLSearchParams()
  body.append('name', linkInfo.value.name)
  body.append('description', linkInfo.value.description)
  body.append('url', linkInfo.value.url)
  body.append('image', linkInfo.value.image)
  body.append('type', linkInfo.value.type)

  const url = ref('')

  // 判断是添加链接还是修改链接
  if (updateLinkStatus.value === true) {
    url.value = 'UpdateLink'

    // 判断id是否存在
    if (linkInfo.value.id === 0) {
      $msg('请填写完整信息', 'error')
      return
    }

    body.append('id', linkInfo.value.id)
  } else {
    url.value = 'CreateLink'
  }

  const res = await $myFetch(url.value, {
    method: 'POST',
    body,
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }

  await getData()
  dialogStatus.value = false
  loading.value = false
}

// 监听弹窗是否关闭，将信息设置为默认
watch(dialogStatus, (newValue) => {
  if (newValue === false) {
    updateLinkStatus.value = false

    linkInfo.value.id = 0
    linkInfo.value.name = ''
    linkInfo.value.description = ''
    linkInfo.value.url = ''
    linkInfo.value.image = ''
    linkInfo.value.type = 1
  }
})

useHead({
  title: '友情链接',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="links-container" v-loading="loading">
    <div class="links-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <el-icon class="icon">
            <Link />
          </el-icon>
          <span class="title">友情链接</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="dialogStatus = true">
            <span>新增链接</span>
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
                  <el-button
                    type="primary"
                    link
                    @click="handleEdit(scope.$index, scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-popconfirm
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    title="确定要删除吗？"
                    @confirm="handleDelete(scope.$index, scope.row)"
                  >
                    <template #reference>
                      <el-button type="danger" link> 删除 </el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" width="50" />
            <el-table-column label="类型" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.type === 1 ? 'success' : 'info'">
                  {{ scope.row.type === 1 ? '全站友链' : '内页友链' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="name"
              label="链接名称"
              width="130"
              show-overflow-tooltip
            />
            <el-table-column
              prop="url"
              label="链接地址"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="image"
              label="头像地址"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="description"
              label="描述"
              min-width="200"
              show-overflow-tooltip
            />
          </el-table>
        </client-only>
      </div>

      <!-- 新增/编辑链接对话框 -->
      <el-dialog
        v-model="dialogStatus"
        :title="updateLinkStatus ? '修改链接' : '新增链接'"
        width="500px"
        destroy-on-close
      >
        <el-form :model="linkInfo" label-width="90px">
          <el-form-item label="链接类型" required>
            <el-select
              v-model="linkInfo.type"
              placeholder="请选择链接类型"
              style="width: 100%"
            >
              <el-option label="全站友链" :value="1" />
              <el-option label="内页友链" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="链接名称" required>
            <el-input v-model="linkInfo.name" placeholder="请输入链接名称" />
          </el-form-item>
          <el-form-item label="链接地址" required>
            <el-input v-model="linkInfo.url" placeholder="请输入链接地址" />
          </el-form-item>
          <el-form-item label="头像地址" required>
            <el-input v-model="linkInfo.image" placeholder="请输入头像地址" />
          </el-form-item>
          <el-form-item label="链接描述" required>
            <el-input
              v-model="linkInfo.description"
              type="textarea"
              :rows="3"
              placeholder="请输入链接描述"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogStatus = false">取消</el-button>
            <el-button type="primary" @click="submit">{{
              updateLinkStatus ? '修改' : '创建'
            }}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="less" scoped>
.links-container {
  position: relative;
  min-height: 100vh;
  padding: 24px;
  display: flex;
  justify-content: center;

  .links-card {
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

// 对话框样式
:deep(.el-dialog) {
  border-radius: 12px;

  .el-dialog__header {
    margin: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #eaecf0;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1f36;
    }
  }

  .el-dialog__body {
    padding: 24px;

    .el-form-item__label {
      font-weight: 500;
      color: #374151;
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
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #eaecf0;

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        padding: 8px 16px;
        font-weight: 500;
        min-width: 80px;
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .links-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .links-container {
    padding: 12px;
  }
}
</style>
