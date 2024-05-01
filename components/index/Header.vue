<template>
  <div class="header-container">
    <div class="header">
      <el-dropdown @command="handleCommand">
        <el-button>
          菜单<el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="a">Action 1</el-dropdown-item>
            <el-dropdown-item command="b">Action 2</el-dropdown-item>
            <el-dropdown-item command="c">Action 3</el-dropdown-item>
            <el-dropdown-item command="d">Action 4</el-dropdown-item>
            <el-dropdown-item command="e">Action 5</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue'

const handleCommand = (command) => {
  alert(command)
}
</script>

<style lang="less" scoped>
.header-container {
  width: 100%;
  background: #fff;
  padding-top: 5px;
  padding-bottom: 5px;
  margin-bottom: 10px;
  .header {
    width: 80%;
    margin: 0 auto;
  }
}
</style>
