<template>
  <div class="sidebar-container">
    <el-input v-model="filterText" placeholder="搜索" @input="onQueryChanged" />
    <el-tree-v2
      ref="treeRef"
      :data="sidebayData"
      :props="defaultProps"
      @node-click="handleNodeClick"
      :item-size="30"
      :height="1000"
      :default-expanded-keys="defaultExpandedKeys"
      :filter-method="filterMethod"
      empty-text="加载中…………"
    >
      <template #default="{ node }">
        <span>
          {{ node.label }}
        </span>
      </template>
    </el-tree-v2>
  </div>
</template>

<script setup>
import axios from 'axios'

const filterText = ref('')
const treeRef = ref()

const defaultProps = {
  children: 'children',
  value: 'label',
  label: 'label',
}

const sidebayData = ref([])
const expanedKeys = []

const getData = async () => {
  const { data: res } = await axios.get('api?type=categoryApiList')

  sidebayData.value = res.data

  sidebayData.value.unshift({
    label: '友情链接',
    alias: '/links'
  })

  sidebayData.value.unshift({
    label: '后台',
    alias: '/admin'
  })

  sidebayData.value.unshift({
    label: '首页',
    alias: '/'
  })

  sidebayData.value.forEach(element => {
    expanedKeys.push(element.label)
  })
}


await getData()

const defaultExpandedKeys = ref(expanedKeys)
const onQueryChanged = (query) => {
  treeRef.value?.filter(query)
}
const filterMethod = (query, node) => {
  return node.label?.includes(query)
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

  if (data.alias === '/links') {
    navigateTo('/links')
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
  }
}

@media screen and (max-width: 750px) {
  .sidebar-container {
    display: none;
  }
}
</style>