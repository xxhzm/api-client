<script setup>
const { $myFetch } = useNuxtApp()

const list = useState('list')
const listSearch = useState('listSearch')

const {
  data: { value: res },
} = await useAsyncData('List', () => $myFetch('List'))

list.value = res.data
listSearch.value = res.data
</script>

<template>
  <div class="apilist">
    <el-button type="primary" style="margin-top: 10px; margin-bottom: 10px"
      ><a
        href="https://jq.qq.com/?_wv=1027&k=92BF8Ndr"
        style="text-decoration: none; color: #fff"
        target="_blank"
        >接口反馈</a
      ></el-button
    >
    <el-row :gutter="12">
      <el-col
        :xs="24"
        :sm="12"
        :md="12"
        :lg="6"
        :xl="6"
        v-for="item in listSearch"
        :key="item.id"
        ><nuxt-link :to="'/doc/' + item.alias" class="item">
          <div class="apilist_box">
            <div class="apilist_category">{{ item.category }}</div>
            <div>
              <h2>{{ item.name }}</h2>
              <span>{{ item.description }}</span>
            </div>
          </div></nuxt-link
        >
      </el-col>
    </el-row>
  </div>
</template>

<style lang="less">
.apilist {
  width: 100%;
  padding-bottom: 20px;
  .item {
    width: 100%;
    display: flex;
    color: #555;
    text-decoration: none;
    .apilist_box {
      overflow: hidden;
      position: relative;
      width: 100%;
      height: 100px;
      padding-top: 15px;
      margin-bottom: 20px;
      border-radius: 15px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      background: #fff;
      transition: all 0.3s;
      .apilist_category {
        position: absolute;
        right: 0;
        top: 0;
        width: 90px;
        height: 25px;
        padding-top: 2px;
        padding-left: 15px;
        background: #faecd8;
        color: #e6a23c;
        border-radius: 0 0 0 12px;
        font-size: 13px;
      }
      div {
        margin-left: 20px;
        padding-right: 20px;
        h2 {
          color: #555;
          font-size: 18px;
          font-weight: bold;
        }
        span {
          position: absolute;
          bottom: 10px;
          padding-right: 15px;
          overflow: hidden;
          font-size: 13px;
          color: #777;
          line-height: 15px;
        }
      }
    }
  }
  a:hover {
    .apilist_box {
      transform: translateY(-5px);
    }
  }
}
</style>
