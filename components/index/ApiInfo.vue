<template>
  
</template>

<script setup>

</script>

<style lang="less" scoped>
.apiinfo-container {
  width: 70%;
  flex: 1;
  margin-top: 20px;
  padding-left: 40px;
  padding-right: 40px;
  .box {
    margin-bottom: 30px;
  }

  h1 {
    font-size: 26px;
    font-weight: normal;
  }

  h2 {
    font-size: 20px;
    color: #181819b3;
    font-weight: normal;
    margin-bottom: 30px;
  }

  .url {
    font-weight: 700;
    margin: 0 10px;
    cursor: pointer;
    color: rgba(24, 24, 25, 0.7);
    font-size: 14px;
    user-select: none;
  }

  .url:hover {
    text-decoration: underline;
  }

  .example {
    width: 70%;
  }

  pre {
    display: block;
    overflow: hidden;
    position: relative;
    padding: 0;
    margin: 1.5em 0;
    font-size: 13px;
    line-height: 1.4;
    color: #333;
    word-break: break-all;
    word-wrap: break-word;
    cursor: pointer;
  }

  pre .copy {
    display: none;
    position: absolute;
    top: 40px;
    right: 10px;
    cursor: pointer;
  }

  pre:hover .copy {
    display: block;
  }

  .mac_light {
    background: #eee !important;
    border-radius: 5px !important;
  }

  .mac_light code {
    background: #f3f3f3 !important;
  }

  .mac_pre::before {
    content: "";
    display: block;
    background-size: 40px;
    margin-bottom: 8px;
    margin-left: 8px;
    margin-top: 8px;
    border-radius: 50%;
    background: #ff0800 no-repeat 10px 10px;
    width: 12px;
    height: 12px;
    -webkit-box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
    box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b;
    z-index: 3;
  }

  .adPic {
    width: 70%;
    height: 120px;
    margin-bottom: 20px;
  }
}

@media screen and (max-width: 750px) {
  .apiinfo-container {
    width: 100%;
    .adPic {
      width: 100%;
      height: 40px;
    }

    .example {
      width: 100%;
    }
  }
}
</style>