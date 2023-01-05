<template>
  <div class="sidebar-container">
    <el-input v-model="filterText" placeholder="搜索" />
    <el-tree
      ref="treeRef"
      :data="data"
      :props="defaultProps"
      @node-click="handleNodeClick"
      default-expand-all
      :filter-node-method="filterNode"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const filterText = ref('')
const treeRef = ref()

const defaultProps = {
  children: 'children',
  label: 'label',
}

watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

const data = [
  {
    label: '首页',
    alias: '/'
  },
  {
    label: '默认分类',
    children: [
      {
        id: 1,
        label: '一言',
        alias: 'yiyan'
      }
    ]
  }
]

const handleNodeClick = (data) => {
  if (data.alias === undefined) {
    return false
  }

  if (data.alias === '/') {
    navigateTo('/')
    return false
  }

  console.log(data.alias)
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
  margin-right: 40px;
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
</style>