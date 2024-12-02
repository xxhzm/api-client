<template>
  <div class="about-container">
    <!-- 公告 -->
    <IndexNotice></IndexNotice>
    <div class="container">
      <h1 style="color: #1f2d3d; font-size: 18px">服务说明</h1>
      <div class="text">
        <p>
          小小 API 是 滕州市星语软件开发工作室 支持并维护的 API
          接口项目，致力于为用户提供稳定、快速的 API 接口服务平台。
        </p>
        <p>反馈或建议请发送邮件至：admin@xxhzm.cn</p>
        <p>
          <a href="https://jq.qq.com/?_wv=1027&k=92BF8Ndr" target="_blank"
            >点击加入QQ群</a
          >
        </p>
        <p>
          可提供独享域名接口（无限频），具体请联系微信
          xiaoxiaohaizimen（备注需求）
        </p>
      </div>
      <h1 style="color: #1f2d3d; font-size: 18px">服务地址</h1>
      <div class="text">
        <p>https://xxapi.cn</p>
      </div>

      <div class="text">
        <p>
          小小API以下简称本平台,所提供的各项服务的所有权和运作权归
          滕州市星语软件开发工作室 所有
        </p>
      </div>
      <h1 style="color: #1f2d3d; font-size: 18px">API服务说明</h1>
      <div class="text">
        <p>
          1.
          由于API的功能不同所以API具有不同的请求频次，本平台自营的API一般按本平台自有的策略进行限流。
        </p>
        <p>
          2.
          若用户发起恶意请求或恶意采集本平台数据的，本平台有权利停止您的使用并封禁IP。
        </p>
        <p>
          3. 本平台有权根据市场运作、服务内容、发展规划等因素调整相应 API
          收费标准，用户在购买相应的API服务时，应关注最新收费标准，当API的收费发生变更时本平台不会单独通知使用API的用户
        </p>
        <p>
          4.
          为提高用户体验，将根据需要合理使用用户产生的数据，但不会作出泄露用户隐私的行为。您注册成为本平台用户，即视为您已同意并充分有效授权API相关数据在不违反客户隐私保护义务的前提下对您在本平台的数据和信信息进行合理使用。
        </p>
      </div>
      <h1 style="color: #1f2d3d; font-size: 18px">隐私政策</h1>
      <div class="text">
        <p>
          1. 在您使用本平台网络服务, 或访问本平台网页时,
          我们会自动接收并记录的您的浏览器和计算机上的信息,
          包括但不限于您的IP地址、浏览器的类型、使用的语言、访问日期和时间、软硬件特征信息及您需求的网页记录等数据
        </p>
        <p>
          2. 我们收集有关您的信息和资料将保存在我们的服务器上,
          这些信息和资料可能传送至您所在国家、地区或我们收集信息和资料所在地的境外,
          并在境外被访问、存储和展示。
        </p>
      </div>
      <h1 style="color: #1f2d3d; font-size: 18px">Cookie的使用</h1>
      <div class="text">
        <p>
          1. 在您未拒绝cookies的情况下, 我们会在您的计算机上设定或取用cookies ,
          以便您能登录或使用依赖于cookies的我们的平台服务或功能。我们使用cookies可为您提供更加周到的个性化服务。
        </p>
        <p>
          2.
          您有权选择接受或拒绝接受cookies。您可以通过修改浏览器设置的方式拒绝接受cookies。但如果您选择拒绝接受cookies,
          则您可能无法登录或使用依赖于cookies的我们的网络服务或功能。
        </p>
      </div>
      <h1 style="color: #1f2d3d; font-size: 18px">隐私政策的更改</h1>
      <div class="text">
        <p>
          1. 如果决定更改隐私政策,
          我们会在本政策中、官方网站中以及我们认为适当的位置发布这些更改,
          以便您了解我们如何收集、使用您的个人信息, 哪些人可以访问这些信息,
          以及在什么情况下我们会透露这些信息。
        </p>
        <p>
          2. 我们保留随时修改本政策的权利,
          因此请经常查看。如对本政策作出重大更改，本平台不会对此另做通知
        </p>
        <p>
          3. 当隐私政策更改时, 我们可能不会主动通知您, 但您继续使用,
          则代表您同意本政策.
        </p>
      </div>
    </div>

    <IndexFooter :options="options"></IndexFooter>
  </div>
</template>

<script setup>
const { $myFetch } = useNuxtApp()

// 配置项
const options = ref({})

const {
  data: { value: res },
} = await useAsyncData('Options', () => $myFetch('Options'))

options.value = res.data

useHead({
  title: '关于我们' + ' - ' + options.value.title,
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
  charset: 'utf-8',
  meta: [{ name: 'description', content: '小小API-关于我们' }],
})
</script>

<style lang="less" scoped>
.about-container {
  width: 100%;
  min-height: 100vh;
  background: #f7f9fe;
  .container {
    width: 80%;
    height: 100%;
    margin: 0 auto;
    .text {
      color: #777;
      margin-top: 15px;
      p {
        font-size: 14px;
        margin-bottom: 15px;
      }
    }
    a {
      color: #9999ff;
    }
  }
}
</style>
