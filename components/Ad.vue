<script setup>
const { $myFetch } = useNuxtApp()

const adDate = ref([])

const res = await $myFetch('AdListForFrontend', {
  method: 'GET',
})

adDate.value = res.data

const emit = defineEmits(['adInfo'])

emit('adInfo', adDate)
</script>

<template>
  <div class="ad">
    <el-row :gutter="20">
      <el-col
        :xs="24"
        :sm="12"
        :md="12"
        :lg="12"
        :xl="12"
        v-for="item in adDate"
        :key="item.id"
      >
        <a :href="item.url" target="_blank" class="ad-link">
          <img :src="item.image" alt="广告" class="ad-image" />
        </a>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="less" scoped>
.ad {
  margin-top: 10px;
  .el-col {
    margin-bottom: 3px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.ad-image {
  width: 100%;
  height: 40px;
}

@media screen and (max-width: 768px) {
  .ad {
    .el-col {
      margin-bottom: 1px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .ad-image {
    height: 35px;
  }
}
</style>
