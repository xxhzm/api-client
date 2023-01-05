<template>
  <div class="footer-container">
    <p>
      <span>{{ props.options.icp }}</span
      ><span>{{ props.options.gongan }}</span>
    </p>
  </div>
</template>

<script setup>
const props = defineProps(['options'])
</script>

<style lang="less" scoped>
.footer-container {
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  color: var(--title--color);
}
</style>