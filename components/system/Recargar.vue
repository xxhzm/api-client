<template>
  <div class="recargar-info">
    <div class="recargar-info__row">
      <div
        class="recargar-info__col"
        v-for="(item, index) in cards"
        :key="index"
      >
        <div class="info-card">
          <div class="info-card__category">{{ item.tag }}</div>
          <div class="info-card__content">
            <h3 class="info-card__title">{{ item.title }}</h3>
            <div class="info-card__value">
              <template v-if="item.isCount">
                <HelpersCount :end="item.value" />
              </template>
              <template v-else>
                {{ item.value }}
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const recargarInfo = ref({
  total_order: 0,
  total_money: 0,
  recently_order: 0,
  recently_money: 0,
})

const props = defineProps(['info'])

recargarInfo.value = props.info

// 定义卡片数据
const cards = computed(() => [
  {
    title: '历史有效订单总数',
    tag: '总数',
    value: recargarInfo.value.total_order,
    isCount: true,
  },
  {
    title: '历史有效订单金额',
    tag: '总金额',
    value: recargarInfo.value.total_money,
    isCount: true,
  },
  {
    title: '当月有效订单总数',
    tag: '总数',
    value: recargarInfo.value.recently_order,
    isCount: true,
  },
  {
    title: '当月有效订单金额',
    tag: '总金额',
    value: recargarInfo.value.recently_money,
    isCount: true,
  },
])
</script>

<style lang="less" scoped>
.recargar-info {
  &__row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;
  }

  &__col {
    width: 25%;
    padding: 0 10px;
    margin-bottom: 20px;

    @media screen and (max-width: 1200px) {
      width: 33.333%;
    }

    @media screen and (max-width: 992px) {
      width: 50%;
    }

    @media screen and (max-width: 576px) {
      width: 100%;
    }
  }
}

.info-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  height: 100px;
  padding: 16px;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #ebeef5;

    .info-card__category {
      background: #409eff;
      color: #fff;
    }
  }

  &__category {
    position: absolute;
    right: -28px;
    top: 12px;
    background: #e6f7ff;
    color: #409eff;
    padding: 4px 30px;
    font-size: 12px;
    transform: rotate(45deg);
    transition: all 0.3s ease;
  }

  &__content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__title {
    font-size: 14px;
    font-weight: normal;
    color: #909399;
    margin: 0;
    padding-right: 40px;
  }

  &__value {
    font-size: 18px;
    color: #303133;
    font-weight: 500;
  }
}

@media screen and (max-width: 768px) {
  .info-card {
    height: 90px;
    padding: 14px;

    &__title {
      font-size: 13px;
    }

    &__value {
      font-size: 16px;
    }
  }
}
</style>
