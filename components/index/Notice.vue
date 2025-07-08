<template>
  <div class="notice-container">
    <div class="notice_text">
      <clientOnly>
        <p v-html="content"></p>
      </clientOnly>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  content: {
    type: String,
    required: true,
  },
})
</script>

<style lang="less">
.notice-container {
  position: relative;
  width: 100%;
  height: 35px;
  line-height: 35px;
  text-align: center;
  background: var(--main--color);
  box-shadow: 0 0 0 1px #dcdfe6;
  margin-bottom: 1rem;
  .notice_text {
    color: var(--font--color);
    font-size: 1em;
    a {
      color: var(--font--color);
    }
  }
}
</style>
