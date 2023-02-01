<template>
  <div class="notice-container" v-if="NoticeShow">
    <div class="notice__text">
      <p>
        小小API是一个稳定 快速 的 API 接口服务 &nbsp;
        <a href="https://jq.qq.com/?_wv=1027&k=92BF8Ndr" target="_blank"
          >点击加入QQ群</a
        >
      </p>
    </div>
    <div class="notice__icon">
      <el-icon :size="23" @click="closeNotice"><Close /></el-icon>
    </div>
  </div>
  <div class="wap-notice">
    <van-notice-bar
      color="#ffffff"
      background="#409eff"
      scrollable
      text="小小API是一个稳定 快速 的 API 接口服务"
      mode="closeable"
      speed="70"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Close } from '@element-plus/icons-vue'

const NoticeShow = useCookie('NoticeShow')

if (NoticeShow.value === undefined) {
  NoticeShow.value = true
}

const closeNotice = () => {
  NoticeShow.value = !NoticeShow.value
}
</script>

<style lang="less" scoped>
.notice-container {
  position: relative;
  width: 100%;
  height: 35px;
  line-height: 35px;
  text-align: center;
  background: var(--main--color);
  box-shadow: 0 0 0 1px #dcdfe6;
  .notice__text {
    color: var(--font--color);
    font-size: 1em;
    a {
      color: var(--font--color);
    }
  }
  .notice__icon {
    position: absolute;
    width: 15px;
    height: 15px;
    top: 6px;
    right: 30px;
    color: var(--font--color);
  }
}

.wap-notice {
  display: none;
}

@media screen and (max-width: 750px) {
  .notice-container {
    display: none;
  }

  .wap-notice {
    display: block;
  }
}
</style>
