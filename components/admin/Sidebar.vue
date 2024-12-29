<template>
  <div class="sidebar-container">
    <el-menu
      class="sidebar-menu"
      @open="handleOpen"
      @close="handleClose"
      :unique-opened="true"
    >
      <el-menu-item index="1" @click="navigateTo('/admin')">
        <img
          src="@/assets/images/logo.png"
          alt="logo"
          class="logo"
          style="width: 120px"
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

        <el-sub-menu
          index="2"
          v-if="
            routeShowArr(['/admin/webset', '/admin/mailset', '/admin/sitemap'])
          "
        >
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item-group title="系统设置">
            <el-menu-item
              index="2-1"
              @click="navigateTo('/admin/webset')"
              v-if="routeShow('/admin/webset')"
              >基本设置</el-menu-item
            >
            <el-menu-item
              index="2-2"
              @click="navigateTo('/admin/mailset')"
              v-if="routeShow('/admin/webset')"
              >邮件设置</el-menu-item
            >
            <el-menu-item
              index="2-3"
              @click="navigateTo('/admin/ad')"
              v-if="routeShow('/admin/ad')"
              >广告位管理</el-menu-item
            >
            <el-menu-item
              index="2-4"
              @click="sitemap()"
              v-if="routeShow('/admin/sitemap')"
              >生成网站地图
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu
          index="3"
          v-if="
            routeShowArr([
              '/admin/apilist',
              '/admin/createapi',
              '/admin/addparam',
              '/admin/categories',
              '/admin/prefix',
              '/admin/apilogs',
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
              index="3-3"
              @click="navigateTo('/admin/addparam')"
              v-if="routeShow('/admin/addparam')"
              >添加参数</el-menu-item
            >
            <el-menu-item
              index="3-4"
              @click="navigateTo('/admin/categories')"
              v-if="routeShow('/admin/categories')"
              >管理分类</el-menu-item
            >
            <el-menu-item
              index="3-5"
              @click="navigateTo('/admin/prefix')"
              v-if="routeShow('/admin/prefix')"
              >管理前缀</el-menu-item
            >
            <el-menu-item
              index="3-6"
              @click="navigateTo('/admin/apilogs')"
              v-if="routeShow('/admin/apilogs')"
              >接口日志</el-menu-item
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
          <el-menu-item-group title="用户管理">
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

        <el-sub-menu
          index="5"
          v-if="routeShowArr(['/admin/articlelist', '/admin/createarticle'])"
        >
          <template #title>
            <el-icon><Tickets /></el-icon>
            <span>文章管理</span>
          </template>
          <el-menu-item-group title="文章管理">
            <el-menu-item
              index="5-1"
              @click="navigateTo('/admin/articlelist')"
              v-if="routeShow('/admin/articlelist')"
              >文章列表</el-menu-item
            >
            <el-menu-item
              index="5-2"
              @click="navigateTo('/admin/createarticle')"
              v-if="routeShow('/admin/createarticle')"
              >新增文章</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <el-menu-item
          index="6"
          @click="navigateTo('/admin/links')"
          v-if="routeShow('/admin/links')"
        >
          <el-icon><Connection /></el-icon>
          <template #title>友情链接</template>
        </el-menu-item>
        <el-menu-item index="7" @click="navigateTo('/')">
          <el-icon><Promotion /></el-icon>
          <template #title>访问前台</template>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script setup>
import {
  List,
  Menu as IconMenu,
  Setting,
  Odometer,
  Promotion,
  Tickets,
  Avatar,
  Connection,
  Document,
} from '@element-plus/icons-vue'

const { $msg, $myFetch } = useNuxtApp()
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
  if (state === true) {
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

const sitemap = async () => {
  const res = await $myFetch('Sitemap', {
    method: 'GET',
  })

  if (res.code === 200) {
    $msg(res.msg, 'success')
  } else {
    $msg(res.msg, 'success')
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
