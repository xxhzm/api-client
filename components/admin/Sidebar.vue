<template>
  <div class="sidebar-container">
    <el-icon
      size="1.5rem"
      color="#000"
      @click="collapseChange"
      class="collapse"
    >
      <Operation />
    </el-icon>
    <el-menu
      class="sidebar-menu"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
    >
      <div v-if="grade === 0">
        <el-menu-item index="1" @click="navigateTo('/admin')">
          <el-icon><Odometer /></el-icon>
          <template #title>控制台</template>
        </el-menu-item>
        <el-menu-item index="2" @click="navigateTo('/admin/webset')">
          <el-icon><Setting /></el-icon>
          <template #title>网站设置</template>
        </el-menu-item>

        <el-sub-menu index="3">
          <template #title>
            <el-icon><List /></el-icon>
            <span>接口管理</span>
          </template>
          <el-menu-item-group title="接口管理">
            <el-menu-item index="3-1" @click="navigateTo('/admin/apilist')"
              >接口列表</el-menu-item
            >
            <el-menu-item index="3-2" @click="navigateTo('/admin/addapi')"
              >新增接口</el-menu-item
            >
            <el-menu-item index="3-2" @click="navigateTo('/admin/addparameter')"
              >添加参数</el-menu-item
            >
            <el-menu-item
              index="3-2"
              @click="navigateTo('/admin/manage-categories')"
              >管理分类</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>
        <el-menu-item index="4" @click="navigateTo('/')">
          <el-icon><Promotion /></el-icon>
          <template #title>访问前台</template>
        </el-menu-item>
        <el-menu-item index="5" @click="deleteCache()">
          <el-icon><Coin /></el-icon>
          <template #title>清空缓存</template>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import {
  List,
  Operation,
  Menu as IconMenu,
  Setting,
  Odometer,
  UserFilled,
  Promotion,
  Coin
} from '@element-plus/icons-vue'
import axios from 'axios'

const isCollapse = ref(false)
const token = useCookie('token')
const grade = useCookie('grade')

const msg = (message, type) => {
  ElNotification({
    message,
    type,
  })
}

const collapseChange = () => {
  isCollapse.value = !isCollapse.value
}


const handleOpen = (key, keyPath) => {
  // console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  // console.log(key, keyPath)
}

// 清空缓存
const deleteCache = async () => {
  const { data: res } = await axios.get('index/deleteCache?token=' + token.value)
  msg(res.msg + '，3秒后会自动刷新页面', 'success')

  setTimeout(() => {
    window.location.reload()

  }, 3000)
}
</script>

<style lang="less" scoped>
.sidebar-menu {
  height: calc(100vh - 65px);
}
.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}
.collapse {
  position: absolute;
  top: 18px;
  left: 240px;
  cursor: pointer;
}
</style>
