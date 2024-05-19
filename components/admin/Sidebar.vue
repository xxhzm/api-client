<template>
  <div class="sidebar-container">
    <el-menu class="sidebar-menu" @open="handleOpen" @close="handleClose">
      <el-menu-item index="1" @click="navigateTo('/admin')">
        <img
          src="@/assets/images/logo.png"
          alt="logo"
          class="logo"
          style="width: 140px; height: 60px"
        />
      </el-menu-item>
      <div>
        <el-menu-item
          index="1"
          @click="navigateTo('/admin')"
          v-if="routeShow('/admin')"
          style="margin-top: 10px"
        >
          <el-icon><Odometer /></el-icon>
          <template #title>控制台</template>
        </el-menu-item>
        <el-menu-item
          index="2"
          @click="navigateTo('/admin/webset')"
          v-if="routeShow('/admin/webset')"
        >
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>

        <el-sub-menu
          index="3"
          v-if="
            routeShowArr([
              '/admin/apilist',
              '/admin/createapi',
              '/admin/addparam',
              '/admin/manage-categories',
            ])
          "
        >
          <template #title>
            <el-icon><List /></el-icon>
            <span>接口管理</span>
          </template>
          <el-menu-item-group title="接口管理">
            <el-menu-item
              index="3-1"
              @click="navigateTo('/admin/apilist')"
              v-if="routeShow('/admin/apilist')"
              >接口列表</el-menu-item
            >
            <el-menu-item
              index="3-2"
              @click="navigateTo('/admin/createapi')"
              v-if="routeShow('/admin/createapi')"
              >新增接口</el-menu-item
            >
            <el-menu-item
              index="3-2"
              @click="navigateTo('/admin/addparam')"
              v-if="routeShow('/admin/addparam')"
              >添加参数</el-menu-item
            >
            <el-menu-item
              index="3-2"
              @click="navigateTo('/admin/manage-categories')"
              v-if="routeShow('/admin/manage-categories')"
              >管理分类</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>
        <el-sub-menu
          index="4"
          v-if="
            routeShowArr([
              '/admin/userlist',
              '/admin/rolelist',
              '/admin/permissionlist',
            ])
          "
        >
          <template #title>
            <el-icon><Avatar /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item-group title="权限管理">
            <el-menu-item
              index="4-1"
              @click="navigateTo('/admin/userlist')"
              v-if="routeShow('/admin/userlist')"
              >用户列表</el-menu-item
            >
            <el-menu-item
              index="4-2"
              @click="navigateTo('/admin/rolelist')"
              v-if="routeShow('/admin/rolelist')"
              >角色列表</el-menu-item
            >
            <el-menu-item
              index="4-3"
              @click="navigateTo('/admin/permissionlist')"
              v-if="routeShow('/admin/permissionlist')"
              >权限列表</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>
        <el-menu-item
          index="5"
          @click="navigateTo('/admin/links')"
          v-if="routeShow('/admin/links')"
        >
          <el-icon><Connection /></el-icon>
          <template #title>友情链接</template>
        </el-menu-item>
        <el-menu-item index="6" @click="navigateTo('/')">
          <el-icon><Promotion /></el-icon>
          <template #title>访问前台</template>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  List,
  Menu as IconMenu,
  Setting,
  Odometer,
  Promotion,
  Coin,
  Avatar,
  Connection,
} from '@element-plus/icons-vue'

const routeInfo = useCookie('routeInfo')

// 判断是否拥有权限，动态显示左侧边栏
const routeShow = (path) => {
  if (path === undefined) {
    return false
  }

  const state = routeInfo.value.find((obj) => obj.path === path)

  if (state !== undefined) {
    return true
  }

  return false
}

const routeShowArr = (arr) => {
  if (arr === undefined) {
    return false
  }

  const set2 = new Set(arr)

  const state = routeInfo.value.some((obj) => set2.has(obj.path))
  if(state === true){
    return true
  }
  
  return false
}

const handleOpen = (key, keyPath) => {
  // console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  // console.log(key, keyPath)
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
