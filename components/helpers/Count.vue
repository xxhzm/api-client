<script setup>
const props = defineProps(['end'])

const count = ref(props.end)

const start = () => {
  let time = null
  const number = Math.ceil(props.end / 50)
  time = setInterval(() => {
    if (count.value >= props.end) {
      count.value = props.end
      clearInterval(time)
      return
    }
    count.value += number
  }, 20)
}
onMounted(() => {
  count.value = 0
  // 监听，数据变化之后执行函数
  watch(
    () => props.end,
    (newValue) => {
      if (props.end == 1) {
        count.value++
        return
      }
      start()
    },
    {
      immediate: true,
    }
  )
})
</script>

<template>
  <span>{{ count }}</span>
</template>
