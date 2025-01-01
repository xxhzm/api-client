<script setup>
const search = ref('')
const list = useState('list')
const listSearch = useState('listSearch')

watch(
  () => search.value,
  () => {
    listSearch.value = list.value.filter(
      (data) =>
        !search.value ||
        data.name.toLowerCase().includes(search.value.toLowerCase())
    )
  }
)
</script>

<template>
  <div class="search-box">
    <el-input
      v-model="search"
      placeholder="请输入搜寻的API关键词..."
      clearable
      class="search-box__input"
    >
      <template #suffix>
        <i class="el-icon-search"></i>
      </template>
    </el-input>
  </div>
</template>

<style lang="less" scoped>
.search-box {
  &__input {
    width: 100%;
  }
}
</style>
