<script setup>
import { Menu } from '@element-plus/icons-vue'

const route = useRoute()
const screenWidth = ref(0)
const isSidebarShow = ref(true)
const iscontrolShow = ref(false)
const isoverlay = ref(false)

const handleResize = () => {
  const width = document.body.clientWidth
  screenWidth.value = width
  const isMobile = width < 768

  // 从桌面端切换到移动端
  if (isMobile && !iscontrolShow.value) {
    iscontrolShow.value = true
    isSidebarShow.value = false
    isoverlay.value = false
    document.body.style.overflow = ''
  }
  // 从移动端切换到桌面端
  else if (!isMobile && iscontrolShow.value) {
    iscontrolShow.value = false
    isSidebarShow.value = true
    isoverlay.value = false
    document.body.style.overflow = ''
  }
}

onMounted(() => {
  screenWidth.value = document.body.clientWidth
  document.body.style.overflow = ''

  if (screenWidth.value < 768) {
    iscontrolShow.value = true
    isSidebarShow.value = false
  }

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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

// 监听路由变化，移动端跳转后自动关闭侧边栏
watch(
  () => route.path,
  () => {
    if (screenWidth.value < 768) {
      isSidebarShow.value = false
      iscontrolShow.value = true
      isoverlay.value = false
      document.body.style.overflow = ''
    }
  },
)
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

      <!-- 页面内容 -->
      <slot />
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  background: #f5f7fa;
  min-height: 100vh;

  .right {
    width: 100%;
    min-width: 0;
    // 确保遮罩层能正确覆盖
    position: relative;

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
      width: 50px;
      height: 50px;
      top: 0;
      left: 0;
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
      cursor: pointer;
      transition: background-color 0.3s;

      .el-icon {
        font-size: 20px;
        color: #303133;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.025);
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
  }
}
</style>
