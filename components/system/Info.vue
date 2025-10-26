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
      title: '今日使用量',
      value: total24h.value,
      isCount: true,
    },
    {
      title: '系统总调用',
      value: props.systemInfo.total_request_number,
      isCount: true,
    },
    {
      title: '平台接口',
      value: props.systemInfo.total_api,
      isCount: true,
    },

    {
      title: '已稳定运营',
      value: props.systemInfo.day,
      isCount: true,
    },
  ]

  const isPresent = (v) =>
    v !== undefined && v !== null && String(v).trim() !== ''
  const { cpu, memory_used, memory_available, total_network_transmission } =
    props.systemInfo || {}

  if (isPresent(cpu)) {
    list.push({ title: 'CPU使用率', value: cpu, isCount: false })
  }
  if (isPresent(memory_used)) {
    list.push({
      title: '已用内存',
      value: memory_used,
      isCount: false,
    })
  }
  if (isPresent(memory_available)) {
    list.push({
      title: '可用内存',
      value: memory_available,
      isCount: false,
    })
  }
  if (isPresent(total_network_transmission)) {
    list.push({
      title: '已发送',
      value: total_network_transmission,
      isCount: false,
    })
  }

  return list
})
</script>

<template>
  <div class="system-info">
    <div class="system-info__row">
      <div class="system-info__col" v-for="(item, index) in cards" :key="index">
        <div class="info-card">
          <div class="info-card__icon"><span>∿</span></div>
          <div class="info-card__body">
            <h3 class="info-card__label">{{ item.title }}</h3>
            <div class="info-card__value">
              <client-only>
                <template v-if="item.isCount">
                  <HelpersCount :end="item.value" />
                </template>
                <template v-else>
                  {{ item.value }}
                </template>
              </client-only>
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
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eaecf0;
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 24, 40, 0.1);
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #eef4ff;
    color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }

  &__body {
    position: relative;
    flex: 1;
    margin-left: 16px;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    margin: 0;
  }

  &__value {
    margin-top: 6px;
    font-size: 24px;
    color: #111827;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
}

@media screen and (max-width: 768px) {
  .info-card {
    padding: 16px;

    &__icon {
      width: 40px;
      height: 40px;
      font-size: 20px;
    }

    &__label {
      font-size: 13px;
    }

    &__value {
      font-size: 20px;
    }
  }
}
</style>
