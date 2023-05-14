<template>
  <div class="sidebar-container">
    <el-menu class="sidebar-menu" @open="handleOpen" @close="handleClose">
      <el-menu-item index="1" @click="navigateTo('/admin')">
        <img
          src="https://cdn.xxhzm.cn/img/title.png"
          alt="logo"
          class="logo"
          style="width: 140px; height: 60px"
        />
      </el-menu-item>
      <div v-if="grade === 0">
        <el-menu-item
          index="1"
          @click="navigateTo('/admin')"
          style="margin-top: 10px"
        >
          <el-icon><Odometer /></el-icon>
          <template #title>控制台</template>
        </el-menu-item>
        <el-menu-item index="2" @click="navigateTo('/admin/webset')">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
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
            <el-menu-item index="3-2" @click="navigateTo('/admin/addparam')"
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
  Menu as IconMenu,
  Setting,
  Odometer,
  UserFilled,
  Promotion,
  Coin
} from '@element-plus/icons-vue'
import axios from 'axios'

const token = useCookie('token')
const grade = useCookie('grade')

const { $msg } = useNuxtApp()
const msg = $msg

const handleOpen = (key, keyPath) => {
  // console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  // console.log(key, keyPath)
}

// 清空缓存
const deleteCache = async () => {
  const { data: res } = await axios.get('ClearCache')
  if (res.code === 200) {
    msg(res.data + '，3秒后会自动刷新页面', 'success')

    setTimeout(() => {
      window.location.reload()
    }, 3000)
  }
}
</script>

<style lang="less" scoped>
.sidebar-container {
  .sidebar-menu {
    height: 100%;
  }

  .sidebar-menu:not(.el-menu--collapse) {
    width: 200px;
  }
}
</style>
