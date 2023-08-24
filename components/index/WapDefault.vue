<template>
  <div class="wapdefault-container">
    <div class="wapdefault-cont">
      <div class="wapdefault-box" v-for="item in props.list" :key="item.id">
        <nuxt-link :to="'/doc/' + item.alias">
          <div>
            <h1 class="api_title">{{ item.name }}</h1>
            <span>{{ item.description }}</span>
          </div>
        </nuxt-link>
      </div>
    </div>

    <div style="margin-top: 40px">
      <p style="text-align: center">
        <span
          ><a href="https://beian.miit.gov.cn/">{{
            props.options.icp
          }}</a> </span
        ><span>{{ props.options.gongan }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
const props = defineProps({
  list: Object,
  options: Object
})
</script>

<style lang="less" scoped>
.wapdefault-container {
  width: 90%;
  margin: 20px auto;
  display: none;
  .wapdefault-cont {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }
  .wapdefault-box {
    overflow: hidden;
    width: 100%;
    height: 95px;
    padding-top: 15px;
    margin-bottom: 30px;
    border-radius: 15px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    a {
      width: 100%;
      display: flex;
      color: #555;
      div {
        margin-left: 20px;
        padding-right: 20px;
        h1 {
          color: #555;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        span {
          overflow: hidden;
          font-size: 13px;
          color: #777;
          line-height: 20px;
        }
      }
    }
  }
}

@media screen and (max-width: 750px) {
  .wapdefault-container {
    display: block;
  }
}
</style>