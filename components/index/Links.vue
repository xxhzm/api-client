<template>
  <div class="links-container">
    <h1>友情链接</h1>
    <div class="link-cont">
      <div class="link-box" v-for="item in links" :key="item.id">
        <a :href="item.url">
          <img :src="item.image" :alt="item.name" />
          <div>
            <p>{{ item.name }}</p>
            <span>{{ item.description }}</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['options'])

const links = reactive([
  {
    id: 0,
    name: "桑帛云API",
    description: "免费快速的API",
    url: "http://api.caonm.net/",
    image: "http://api.caonm.net/favicon.ico"
  },
  {
    id: 1,
    name: "小小孩子们的Blog",
    description: "记录美好生活",
    url: "https://www.xxhzm.cn/",
    image: "https://q2.qlogo.cn/headimg_dl?dst_uin=2595557847&spec=100"
  }
])
</script>

<style lang="less" scoped>
.links-container {
  width: calc(100% - 270px);
  padding-right: 50px;
  margin-top: 20px;
  margin-left: 40px;
  color: var(--title--color);

  h1 {
    font-size: 24px;
    margin-bottom: 50px;
  }

  .link-cont {
    display: flex;
  }

  .link-box {
    overflow: hidden;
    width: 270px;
    height: 80px;
    padding: 10px;
    border-radius: 15px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.5s;
    margin-right: 30px;
    a {
      width: 100%;
      display: flex;
      color: #555;
      img {
        width: 60px;
        height: 60px;
        border-radius: 15px;
      }
      div {
        margin-left: 20px;
        padding-right: 20px;
        p {
          font-size: 18px;
          color: #555;
          margin-bottom: 5px;
        }
        span {
          overflow: hidden;
          font-size: 12px;
          color: #777;
          line-height: 20px;
        }
      }
    }
  }

  .link-box:hover {
    transform: translateY(-5px);
  }
}

@media screen and (max-width: 750px) {
  .links-container {
    width: 100%;
  }
}

@media screen and (max-width: 500px) {
  .links-container {
    .link-cont {
      flex-direction: column;
      align-items: center;
      .link-box {
        margin-bottom: 20px;
      }
    }
  }
}
</style>