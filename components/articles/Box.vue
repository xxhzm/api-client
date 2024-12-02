<template>
  <a :href="props.link">
    <div class="article_box">
      <h2>{{ props.title }}</h2>
      <p>
        <span><van-icon name="contact-o" />{{ props.author }}</span>
        <span><van-icon name="clock-o" />{{ props.time }}</span>
      </p>
    </div></a
  >
</template>

<script setup>
const props = defineProps(['link', 'title', 'time', 'author'])
</script>

<style lang="less" scoped>
.article_box {
  position: relative;
  width: 100%;
  height: 120px;
  padding: 20px;
  margin-top: 35px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.5s;
  h2 {
    font-size: 22px;
    font-weight: normal;
    color: #555555;
    font-weight: bold;
  }
  p {
    position: absolute;
    bottom: 15px;
    font-size: 13px;
    color: #a0a0a0;
    span {
      padding-left: 18px;
    }
    span:nth-child(1) {
      padding-left: 0;
    }
  }
}

.article_box:hover {
  transform: translateY(-10px);
}
</style>
