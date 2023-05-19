<template>
  <div class="sidebar-container">
    <el-input v-model="filterText" placeholder="搜索" @input="onQueryChanged" />
    <el-tree-v2
      ref="treeRef"
      :data="sidebarData"
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

const props = defineProps(['list'])

const list = ref({})

const filterText = ref('')
const treeRef = ref()

const defaultProps = {
  children: 'children',
  value: 'label',
  label: 'label',
}

const sidebarData = ref([])
const expanedKeys = []
const categoryArr = ref([])

const getData = async () => {
  list.value = props.list

  list.value = list.value.map(item => {
    return {
      id: item.id,
      label: item.name,
      alias: item.alias,
      category: item.category,
      categoryId: item.categoryId
    }
  })

  // 获取到所有的分类列表，将其 push 到 categoryArr
  // 然后对其进行去重处理
  list.value.forEach(element => {
    categoryArr.value.push(element.category)
  })

  categoryArr.value = [...new Set(categoryArr.value)]


  // 对分类列表进行循环过滤
  categoryArr.value.forEach(element => {
    var children = ref([])
    list.value.forEach(ele => {
      if (element === ele.category) {
        // 删除多余字段
        delete ele.category
        delete ele.categoryId
        children.value.push(ele)
      }
    })

    // 创建对象
    const tmpObj = {
      label: element,
      children: children.value
    }

    sidebarData.value.push(tmpObj)
  })

  // 打乱顺序
  // sidebarData.value.sort(() => {
  //   return Math.random() - 0.5
  // })

  sidebarData.value.unshift({
    label: '友情链接',
    alias: '/links'
  })

  sidebarData.value.unshift({
    label: '后台',
    alias: '/admin'
  })

  sidebarData.value.unshift({
    label: '首页',
    alias: '/'
  })

  sidebarData.value.forEach(element => {
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