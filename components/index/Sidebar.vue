<template>
  <div class="sidebar-container">
    <el-input v-model="filterText" placeholder="搜索" />
    <el-tree
      ref="treeRef"
      :data="sidebayData"
      :props="defaultProps"
      @node-click="handleNodeClick"
      default-expand-all
      :filter-node-method="filterNode"
    />
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, watch } from 'vue'

const filterText = ref('')
const treeRef = ref()

const defaultProps = {
  children: 'children',
  label: 'label',
}

const sidebayData = ref([])

const getData = async () => {
  const { data: res } = await axios.get('api?type=categoryApiList')

  sidebayData.value = res.data

  sidebayData.value.unshift({
    label: '后台',
    alias: '/admin'
  })

  sidebayData.value.unshift({
    label: '首页',
    alias: '/'
  })
}


await getData()



watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

const handleNodeClick = (data) => {
  if (data.alias === undefined) {
    return false
  }

  if (data.alias === '/') {
    navigateTo('/')
    return false
  }

  if (data.alias === '/admin') {
    navigateTo('/admin')
    return false
  }

  navigateTo('/doc/' + data.alias)
}
</script>

<style lang="less" scoped>
.sidebar-container {
  flex-grow: 0;
  flex-shrink: 0;
  max-height: 100%;
  overflow-y: auto;
  overflow-anchor: none;
  padding-top: 10px;
  border-right: 1px #ccc solid;

  padding-right: 30px;
  .el-input {
    width: 235px;
    height: 30px;
    padding-left: 25px;
  }

  .el-tree {
    padding-top: 15px;
    padding-left: 25px;
    :deep(.el-tree-node__content) {
      height: 32px;
    }
  }
}

@media screen and (max-width: 750px) {
  .sidebar-container {
    display: none;
  }
}
</style>