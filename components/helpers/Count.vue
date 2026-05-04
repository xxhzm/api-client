<script setup>
const props = defineProps(['end'])

const count = ref(0)
let timer = null

const normalizeNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const getPrecision = (value) => {
  const text = String(value ?? '')
  const decimal = text.split('.')[1]
  return decimal ? Math.min(decimal.length, 2) : 0
}

const stop = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const start = (end) => {
  stop()

  const target = normalizeNumber(end)
  const startValue = normalizeNumber(count.value)
  const precision = Math.max(getPrecision(end), getPrecision(count.value))
  const stepCount = 50
  let currentStep = 0

  if (startValue === target) {
    count.value = target
    return
  }

  timer = setInterval(() => {
    currentStep++

    if (currentStep >= stepCount) {
      count.value = target
      stop()
      return
    }

    count.value = Number(
      (startValue + ((target - startValue) * currentStep) / stepCount).toFixed(
        precision,
      ),
    )
  }, 20)
}

watch(
  () => props.end,
  (value) => {
    start(value)
  },
  {
    immediate: true,
  },
)

onUnmounted(() => {
  stop()
})
</script>

<template>
  <span>{{ count }}</span>
</template>
