<template>
  <div class="ad">
    <el-row :gutter="12">
      <el-col
        :xs="24"
        :sm="12"
        :md="12"
        :lg="12"
        :xl="12"
        v-for="item in adDate"
        :key="item.id"
      >
        <a :href="item.url" target="_blank">
          <img :src="item.image" alt="广告" class="adPic"
        /></a>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
const { $myFetch } = useNuxtApp()

const adDate = ref([])

const res = await $myFetch('AdListForFrontend', {
  method: 'GET',
})

adDate.value = res.data
</script>

<style lang="less">
.ad {
  overflow: hidden;
  width: 100%;
}

.adPic {
  width: 100%;
  height: 60px;
}
</style>
