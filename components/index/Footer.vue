<template>
  <div class="footer-container">
    <div class="footer">
      <p style="text-align: center">
        <span v-if="props.options.icp"><a href="https://beian.miit.gov.cn/" target="_blank">{{
          props.options.icp
        }}</a> </span><br />
        <span v-if="props.options.gongan"><img src="@/assets/images/gongan.png" width="15" height="15" alt="" /><a
            target="_blank" :href="'https://beian.mps.gov.cn/#/query/webSearch?code=' +
              props.options.gongan
              ">{{ props.options.gongan }}</a></span>
      </p>
    </div>
    <nav class="custom-tabbar">
      <a class="tabbar-item" @click="handleNavigate('/')" :class="{ active: currentPath === '/' }">
        <el-icon>
          <House />
        </el-icon>
        <span>首页</span>
      </a>
      <a class="tabbar-item" @click="handleNavigate('/links')" :class="{ active: currentPath === '/links' }">
        <el-icon>
          <Link />
        </el-icon>
        <span>友情链接</span>
      </a>
      <a class="tabbar-item" @click="handleNavigate('/articles')" :class="{ active: currentPath === '/articles' }">
        <el-icon>
          <Document />
        </el-icon>
        <span>文章</span>
      </a>
      <a class="tabbar-item" @click="handleNavigate('/about')" :class="{ active: currentPath === '/about' }">
        <el-icon>
          <InfoFilled />
        </el-icon>
        <span>关于我们</span>
      </a>
      <a class="tabbar-item" @click="handleNavigate('/login')">
        <el-icon>
          <Monitor />
        </el-icon>
        <span>实时监控</span>
      </a>
      <a class="tabbar-item" @click="handleNavigate('/login')" :class="{ active: currentPath === '/login' }">
        <el-icon>
          <User />
        </el-icon>
        <span>登录</span>
      </a>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  House,
  Link,
  Document,
  InfoFilled,
  User,
  Monitor
} from '@element-plus/icons-vue'

const currentPath = ref('/')
const route = useRoute()

onMounted(() => {
  currentPath.value = route.path
})

const qq = () => {
  window.open('https://jq.qq.com/?_wv=1027&k=92BF8Ndr', '_blank')
}

const router = useRouter()
const handleNavigate = (path) => {
  currentPath.value = path
  router.push(path)
}

const props = defineProps(['options'])
</script>

<style lang="less" scoped>
.footer {
  padding-bottom: 50px;
  margin-bottom: 20px;

  a {
    color: #9999ff;
    transition: all 0.5s;

    &:hover {
      color: #0000ff;
    }
  }
}

.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  height: 50px;
  padding: 5px 0;
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #646566;
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;

  .el-icon {
    font-size: 18px;
    margin-bottom: 4px;
  }

  &.active {
    color: #1989fa;
  }

  &:hover {
    color: #1989fa;
  }
}
</style>
