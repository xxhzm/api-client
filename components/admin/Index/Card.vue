<script setup>
const type = ref('info')

const typeArr = ref(['', 'success', 'info', 'warning', 'danger'])

const random = Math.round(Math.random() * 5)


type.value = typeArr.value[random]
</script>

<template>
  <el-card shadow="hover" class="box-card">
    <template #header>
      <div class="card-header">
        <span><slot name="title"></slot></span>
        <div class="tag">
          <el-tag :type="type"><slot name="tag"></slot></el-tag>
        </div>
      </div>
    </template>
    <slot name="content"></slot>
  </el-card>
</template>

<style lang="less" scoped>
.box-card {
  height: 130px;
  .tag {
    float: right;
  }
}
</style>