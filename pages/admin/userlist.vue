<script setup>
const { $msg, $myFetch, $decryptPhone } = useNuxtApp()

definePageMeta({
  layout: 'admin',
})

const loading = ref(false)
const tableData = ref([])
const search = ref('')

// 当前页数
const page = ref(1)
// 总页数
const totalPages = ref(1)
// 总记录
const totalRecords = ref(50)
// 页数loading
const pageLoading = ref(false)
// 每页数量
const pageSize = ref(25)

// 抽屉显示状态
const createUserStatus = ref(false)

const userInfo = ref({
  username: '',
  password: '',
  mail: '',
})

const getData = async () => {
  const res = await $myFetch('UserList', {
    params: {
      page: page.value,
      limit: pageSize.value,
      keyword: search.value.trim() ? search.value.trim() : undefined,
    },
  })

  if (res.code !== 200) {
    return
  }

  // 获取 token 用于解密
  const token = useCookie('token').value

  res.data.userList.forEach((element, key) => {
    if (element.status === '0') {
      res.data.userList[key].status = '启用'
    } else {
      res.data.userList[key].status = '停用'
    }

    res.data.userList[key].login_time = new Date(
      element.login_time,
    ).toLocaleString()
    res.data.userList[key].create_time = new Date(
      element.create_time,
    ).toLocaleString()

    // 解密手机号
    if (element.phone && token) {
      res.data.userList[key].phone = $decryptPhone(element.phone, token)
    }
  })

  tableData.value = res.data.userList
  totalPages.value = res.data.totalPages
  totalRecords.value = res.data.totalRecords
}

onMounted(() => {
  getData()
})

// 搜索用户
const searchUser = async () => {
  const keyword = search.value.trim()
  if (!keyword) {
    page.value = 1
    await getData()
    return
  }

  pageLoading.value = true
  page.value = 1
  try {
    await getData()
  } catch (error) {
    $msg('搜索失败', 'error')
  } finally {
    pageLoading.value = false
  }
}

// 监听搜索输入
const debouncedSearch = ref(null)
watch(search, (newValue) => {
  if (debouncedSearch.value) {
    clearTimeout(debouncedSearch.value)
  }
  debouncedSearch.value = setTimeout(() => {
    searchUser()
  }, 500)
})

// 创建用户
const createUser = async () => {
  if (
    !userInfo.value.username ||
    !userInfo.value.password ||
    !userInfo.value.mail
  ) {
    $msg('请填写内容', 'error')
    return false
  }

  const apiBodyValue = new URLSearchParams()
  apiBodyValue.append('username', userInfo.value.username)
  apiBodyValue.append('password', userInfo.value.password)
  apiBodyValue.append('mail', userInfo.value.mail)

  const res = await $myFetch('CreateUser', {
    method: 'POST',
    body: apiBodyValue,
  })

  createUserStatus.value = false
  getData()

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'error')
  }
}

// 监听抽屉是否关闭
watch(createUserStatus, (newValue) => {
  if (newValue === false) {
    userInfo.value.username = ''
    userInfo.value.password = ''
    userInfo.value.mail = ''
  }
})

// 监听页数变化
watch(
  () => page.value,
  async (newValue) => {
    pageLoading.value = true
    await getData()
    setTimeout(() => {
      pageLoading.value = false
    }, 300)
  },
)

// 监听每页数量变化
watch(pageSize, async () => {
  page.value = 1
  pageLoading.value = true
  await getData()
  setTimeout(() => {
    pageLoading.value = false
  }, 300)
})

const handleUserDetail = (row) => {
  if (import.meta.client) {
    sessionStorage.setItem(
      `admin-user-detail-${row.id}`,
      JSON.stringify({ ...row, __phoneDecrypted: true }),
    )
  }
  navigateTo(`/admin/userdetail/${row.id}`)
}

useHead({
  title: '用户列表',
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
})
</script>

<template>
  <div class="userlist-container" v-loading="loading">
    <div class="user-card">
      <!-- 标题区域 -->
      <div class="card-header">
        <div class="header-left">
          <span class="title">用户列表</span>
        </div>
        <div class="header-right">
          <el-input
            v-model="search"
            class="header-search"
            placeholder="搜索用户名 / 邮箱 / 密钥"
            clearable
          />
          <el-button type="primary" @click="createUserStatus = true">
            <span>新增用户</span>
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
            <el-table-column fixed="right" label="操作" width="80">
              <template #default="scope">
                <el-button
                  type="primary"
                  link
                  @click="handleUserDetail(scope.row)"
                >
                  详情
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="username" label="用户名称" />
            <el-table-column
              prop="mail"
              label="邮箱地址"
              show-overflow-tooltip
            />
            <el-table-column
              prop="key"
              label="Key"
              width="120"
              show-overflow-tooltip
            />
            <el-table-column prop="balance" label="账户余额" width="150">
              <template #default="scope">
                <span class="balance">{{ scope.row.balance }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="65">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === '启用' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="create_time" label="注册时间" width="180" />
            <el-table-column
              prop="login_time"
              label="上次登录时间"
              width="180"
            />
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

      <!-- 新增用户对话框 -->
      <el-dialog
        v-model="createUserStatus"
        title="新增用户"
        width="500px"
        destroy-on-close
      >
        <el-form :model="userInfo" label-width="90px">
          <el-form-item label="用户名称" required>
            <el-input
              v-model="userInfo.username"
              placeholder="请输入用户名称"
            />
          </el-form-item>
          <el-form-item label="密码" required>
            <el-input
              type="password"
              v-model="userInfo.password"
              show-password
              placeholder="请输入密码"
            />
          </el-form-item>
          <el-form-item label="邮箱地址" required>
            <el-input v-model="userInfo.mail" placeholder="请输入邮箱地址" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="createUserStatus = false">取消</el-button>
            <el-button type="primary" @click="createUser">创建</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="less" scoped>
.userlist-container {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;

  .user-card {
    width: 100%;
    padding: 16px 20px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    margin: 0 auto;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .header-left {
        display: flex;
        align-items: flex-start;

        .title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          line-height: 1.3;
        }
      }

      .header-right {
        display: flex;
        gap: 10px;
        align-items: center;

        .header-search {
          width: 220px;
        }

        .el-button {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }

    .table-container {
      padding: 8px 0 0;

      :deep(.el-table) {
        border: none;

        .el-table__header-wrapper {
          th {
            background: #f8fafc;
            color: #1f2937;
            font-weight: 600;
          }
        }

        .balance {
          color: #0ea5e9;
          font-weight: 500;
        }
      }

      .pagination {
        margin-top: 24px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

/* 对话框样式 */
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

    .full-width {
      width: 100%;
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
  .userlist-container {
    padding: 20px;
  }
}

@media screen and (max-width: 768px) {
  .userlist-container {
    padding: 12px;

    .user-card {
      padding: 14px;

      .card-header {
        flex-direction: column;
        gap: 12px;

        .header-right {
          width: 100%;
          align-items: stretch;
          flex-direction: column;

          .header-search {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
