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
  <div class="apiSearch">
    <el-input
      v-model="search"
      style="width: 100%"
      size="large"
      placeholder="请输入接口名称"
    />
  </div>
</template>

<style lang="less">
.apiSearch {
  margin-top: 1.5rem;
  width: 100%;
  height: 100px;
  padding: 30px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
</style>
