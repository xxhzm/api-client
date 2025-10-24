<script setup>
const props = defineProps({
  systemInfo: {
    type: Object,
    default: () => ({
      day: 0,
      total_api: 0,
      recent_request: [],
      total_request_number: 0,
      cpu: '0%',
      memory_used: '0MB',
      memory_available: '0MB',
      total_network_transmission: '0GB',
    }),
  },
})

// 计算24小时请求总数（基于传入的 props）
const total24h = computed(() => {
  let total = 0
  ;(props.systemInfo?.recent_request || []).forEach((element) => {
    total += Number(element?.number || 0)
  })
  return total
})

// 定义卡片数据（当对应值为空时不显示系统信息相关卡片）
const cards = computed(() => {
  const list = [
    {
      title: '平台接口',
      tag: '接口',
      value: props.systemInfo.total_api,
      isCount: true,
    },
    {
      title: '24小时内总请求',
      tag: '24H',
      value: total24h.value,
      isCount: true,
    },
    {
      title: '请求总调用',
      tag: '总数',
      value: props.systemInfo.total_request_number,
      isCount: true,
    },
    {
      title: '已稳定运营',
      tag: '天数',
      value: props.systemInfo.day,
      isCount: true,
    },
  ]

  const isPresent = (v) => v !== undefined && v !== null && String(v).trim() !== ''
  const {
    cpu,
    memory_used,
    memory_available,
    total_network_transmission,
  } = props.systemInfo || {}

  if (isPresent(cpu)) {
    list.push({ title: 'CPU使用率', tag: 'CPU', value: cpu, isCount: false })
  }
  if (isPresent(memory_used)) {
    list.push({ title: '已用内存', tag: '已用', value: memory_used, isCount: false })
  }
  if (isPresent(memory_available)) {
    list.push({ title: '可用内存', tag: '可用', value: memory_available, isCount: false })
  }
  if (isPresent(total_network_transmission)) {
    list.push({ title: '已发送', tag: '总量', value: total_network_transmission, isCount: false })
  }

  return list
})


</script>

<template>
  <div class="system-info">
    <div class="system-info__row">
      <div class="system-info__col" v-for="(item, index) in cards" :key="index">
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

<style lang="less" scoped>
.system-info {
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
