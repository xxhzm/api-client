<script setup>
import { Menu } from '@element-plus/icons-vue'

// --- State Management ---

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

      <div class="profile-container">
        <AdminUserProfileCard />
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
