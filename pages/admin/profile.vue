<script setup>
// --- Imports ---
import { Menu } from '@element-plus/icons-vue'

// --- Nuxt Composables ---
const { $msg, $myFetch } = useNuxtApp()
const username = useCookie('username')
const { userAccessKey, fetchUserKey } = useUserKey()

// --- State Management ---
const loading = ref(false)

const userInfo = reactive({
  id: 0,
  username: '',
  mail: '',
  phone: '',
  key: '',
  balance: 0,
  status: '',
  rawStatus: '',
  create_time: '',
  login_time: '',
  ip: '',
})

// --- Balance State ---
const balance = ref(0)
const currentMonthTopUp = ref(0)
const totalTopUp = ref(0)
const total24h = ref(0) // Note: Profile page might not have chart data source for this, so it might stay 0 or need fetching

// --- Sidebar & Layout Control ---
const screenWidth = ref(0)
const isSidebarShow = ref(true)
const iscontrolShow = ref(false)
const isoverlay = ref(false)

// --- Lifecycle Hooks ---
onMounted(() => {
  screenWidth.value = document.body.clientWidth
  document.body.style.overflow = ''

  if (screenWidth.value < 768) {
    iscontrolShow.value = true
    isSidebarShow.value = false
  }

  getData()
})

// --- Methods ---

/**
 * Handle sidebar visibility on mobile
 */
const handleSidebarShow = () => {
  isSidebarShow.value = !isSidebarShow.value
  iscontrolShow.value = !iscontrolShow.value
  isoverlay.value = !isoverlay.value
  if (isSidebarShow.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

/**
 * Fetch user data
 */
const getData = async () => {
  loading.value = true
  try {
    const res = await $myFetch('UserList', {
      params: {
        page: 1,
        limit: 10,
        keyword: username.value,
      },
    })

    if (res.code === 200 && res.data.userList && res.data.userList.length > 0) {
      // Find the exact user
      const currentUser = res.data.userList.find(
        (u) => u.username === username.value
      )

      if (currentUser) {
        userInfo.id = currentUser.id
        userInfo.username = currentUser.username
        userInfo.mail = currentUser.mail
        userInfo.phone = currentUser.phone
        userInfo.balance = currentUser.balance
        // Store raw status for update, display text in template
        userInfo.rawStatus = currentUser.status
        userInfo.status = currentUser.status === '0' ? '启用' : '停用'
        userInfo.create_time = new Date(
          currentUser.create_time
        ).toLocaleString()
        userInfo.login_time = new Date(currentUser.login_time).toLocaleString()
        userInfo.ip = currentUser.ip

        // Sync balance refs
        balance.value = Number(currentUser.balance || 0)

        // 获取用户Key
        userInfo.key = userAccessKey.value

        // Fetch detailed balance info
        await getBalance()
      }
    }
  } catch (error) {
    $msg('获取用户信息失败', 'error')
  } finally {
    loading.value = false
  }
}

// Get Balance (Dedicated refresh)
const getBalance = async (showTip = false) => {
  try {
    const res = await $myFetch('UserBalance', {
      params: {
        username: username.value,
      },
    })
    if (res.code === 200) {
      const data = res.data || {}
      balance.value = Number(data.AccountBalance || 0)
      userInfo.balance = balance.value // Sync
      currentMonthTopUp.value = Number(data.CurrentMonthTopUp || 0)
      totalTopUp.value = Number(data.TotalTopUp || 0)
      if (showTip) $msg('余额刷新成功', 'success')
    } else {
      if (showTip) $msg(res.msg || '获取余额失败', 'error')
    }
  } catch (error) {
    if (showTip) $msg('获取余额失败', 'error')
  }
}
</script>

<template>
  <div class="container">
    <AdminSidebar v-show="isSidebarShow"></AdminSidebar>

    <div class="right">
      <!-- 遮罩层 -->
      <div class="overlay" v-show="isoverlay" @click="handleSidebarShow"></div>

      <!-- 侧边栏控制按钮 -->
      <div class="control-sidebar" v-show="iscontrolShow">
        <el-icon @click="handleSidebarShow"><Menu /></el-icon>
      </div>

      <AdminHeader></AdminHeader>

      <div class="profile-container" v-loading="loading">
        <AdminUserProfileCard
          :user-info="userInfo"
          :balance="balance"
          :current-month-top-up="currentMonthTopUp"
          :total-top-up="totalTopUp"
          :total24h="total24h"
          @refresh-balance="getBalance(true)"
        />
      </div>
    </div>
  </div>
</template>

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
      border-radius: 4px;

      .el-icon {
        margin-top: 10px;
        font-size: 16px;
        cursor: pointer;
      }
    }

    .profile-container {
      position: relative;
      min-height: 100vh;
      padding: 24px;
      margin: 0 auto;
    }
  }
}

// 响应式
@media screen and (max-width: 992px) {
  .container .right .profile-container {
    padding: 16px;
  }
}

@media screen and (max-width: 768px) {
  .container .right .profile-container {
    padding: 16px;
  }
}
</style>
