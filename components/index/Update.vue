<template>
  <div class="default-container">
    <h1>更新日志</h1>
    <h2>v1版本</h2>
    <el-switch
      v-model="v1"
      style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
      active-text="展开"
      inactive-text="关闭"
      size="small"
    />
    <div class="text" v-show="v1">
      <p>Date: Sat Feb 4 20:05:22 2023 +0800 增加请求示例</p>
      <p>Date: Thu Feb 2 11:27:09 2023 +0800 增加ua接口</p>
      <p>
        Date: Thu Feb 2 10:27:32 2023 +0800
        接口增加redis缓存，输出json新增请求耗时
      </p>
      <p>Date: Thu Feb 2 01:08:59 2023 +0800 增加移动端请求接口</p>
      <p>Date: Wed Feb 1 19:39:35 2023 +0800 增加ip查询后进行redis缓存</p>
      <p>Date: Wed Feb 1 19:25:10 2023 +0800 增加ip查询接口</p>
      <p>Date: Wed Feb 1 12:36:33 2023 +0800 增加自增</p>
      <p>Date: Wed Feb 1 12:11:58 2023 +0800 优化内容审核接口</p>
      <p>Date: Tue Jan 31 20:55:09 2023 +0800 增加base64加密与解密</p>
      <p>Date: Tue Jan 31 20:54:10 2023 +0800 增加base64加密解密</p>
      <p>
        Date: Tue Jan 31 18:56:39 2023 +0800
        请求接口增加开发者信息，增加内容审核接口
      </p>
      <p>Date: Wed Jan 18 12:32:20 2023 +0800 增加whois查询接口</p>
      <p>Date: Tue Jan 17 12:07:16 2023 +0800 增加图片APi，增加接口限频</p>
      <p>Date: Tue Jan 17 11:26:34 2023 +0800 优化代码可读性</p>
      <p>Date: Tue Jan 17 11:19:03 2023 +0800 增加自增</p>
      <p>
        Date: Tue Jan 17 11:17:53 2023 +0800
        增加查询ICP备案接口,增加数据库跟redis切换
      </p>
      <p>Date: Mon Jan 16 19:06:45 2023 +0800 增加tcping、qq信息接口</p>
      <p>Date: Mon Jan 16 16:17:28 2023 +0800 ...</p>
      <p>Date: Mon Jan 16 12:59:46 2023 +0800 无...</p>
      <p>
        Date: Mon Jan 16 00:53:31 2023 +0800
        接口新增keywords、method字段、修复接口状态关闭查询错误
      </p>
      <p>Date: Sat Jan 14 12:24:38 2023 +0800 更新配置文件</p>
      <p>Date: Fri Jan 13 21:24:25 2023 +0800 更新依赖</p>
      <p>Date: Fri Jan 13 21:21:23 2023 +0800 依赖目录</p>
      <p>Date: Fri Jan 13 21:06:30 2023 +0800 v1版本增加生成二维码API</p>
      <p>Date: Fri Jan 13 20:25:04 2023 +0800 过滤词库</p>
      <p>Date: Fri Jan 13 10:55:19 2023 +0800 更新词库</p>
      <p>Date: Thu Jan 12 16:50:01 2023 +0800 增加前端sidebar请求数据格式</p>
      <p>Date: Wed Jan 11 21:54:31 2023 +0800 更新登录策略</p>
      <p>Date: Wed Jan 11 21:19:10 2023 +0800 增加token验证，增加log写入通道</p>
      <p>Date: Wed Jan 11 21:18:02 2023 +0800 增加token验证，增加log写入通道</p>
      <p>Date: Wed Jan 11 16:17:47 2023 +0800 增加代码可读性</p>
      <p>
        Date: Wed Jan 11 16:16:09 2023 +0800 增加代码可读性，修复修改分类时bug
      </p>
      <p>
        Date: Tue Jan 10 22:28:54 2023 +0800
        使用request接受type参数，case判断type参数来进行调用对应函数，增加代码可读性
      </p>
      <p>Date: Tue Jan 10 22:28:13 2023 +0800 使用tp自带的Request来获取token</p>
      <p>Date: Tue Jan 10 18:22:12 2023 +0800 增加缓存标签</p>
      <p>
        Date: Tue Jan 10 18:17:26 2023 +0800
        增加每一个接口的注释，设置缓存标签，设置缓存有效期为3600秒
      </p>
      <p>Date: Tue Jan 10 12:57:48 2023 +0800 新增接口时增加分类功能</p>
      <p>
        Date: Mon Jan 9 20:51:06 2023 +0800 增加功能：更新接口内容时新增接口分类
      </p>
      <p>
        Date: Sun Jan 8 21:40:51 2023 +0800
        获取接口列表时增加分类字段，将apiLIST函数分离
      </p>
      <p>Date: Thu Jan 5 16:51:07 2023 +0800 增加修改分类接口</p>
    </div>

    <h2>v2版本</h2>
    <el-switch
      v-model="v2"
      style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
      active-text="展开"
      inactive-text="关闭"
      size="small"
    />
    <div class="text" v-show="v2">
      <p>Date: Wed Mar 8 23:30:36 2023 +0800 优化redis set函数</p>
      <p>
        Date: Wed Mar 8 22:58:46 2023 +0800
        去除请求限制，新增我在人间凑数的日子，网易云热歌榜接口
      </p>
      <p>Date: Sun Mar 5 16:19:41 2023 +0800 修复whois</p>
      <p>
        Date: Sat Mar 4 21:49:08 2023 +0800
        增加百度热搜，微博热搜，bing每日一图接口
      </p>
      <p>Date: Wed Mar 1 20:24:14 2023 +0800 增加ChatGPT接口</p>
      <p>Date: Tue Feb 28 21:26:25 2023 +0800 增加ping接口</p>
      <p>
        Date: Mon Feb 27 22:47:48 2023 +0800
        增加bmi身体指数计算接口，修复跨域问题
      </p>
      <p>Date: Sun Feb 26 15:47:05 2023 +0800 优化网易云传参</p>
      <p>
        Date: Sun Feb 26 15:35:52 2023 +0800
        增加文本转语音接口，优化二维码输出路径
      </p>
      <p>Date: Sun Feb 26 14:25:56 2023 +0800 新增图灵机器人</p>
      <p>
        Date: Sat Feb 25 20:08:41 2023 +0800
        增加获取网站所有图片API，uuid生成API
      </p>
      <p>
        Date: Sat Feb 25 13:04:21 2023 +0800 增加百度翻译接口,增加接口维护中设置
      </p>
      <p>Date: Mon Feb 20 23:24:41 2023 +0800 增加短网址生成接口</p>
      <p>
        Date: Mon Feb 20 22:19:38 2023 +0800 增加蓝奏云解析，修复直接访问url报错
      </p>
      <p>
        Date: Sun Feb 19 23:38:32 2023 +0800
        增加网易云音乐解析，增加皮皮虾视频解析
      </p>
      <p>Date: Sat Feb 18 23:25:45 2023 +0800 优化端口扫描</p>
      <p>Date: Fri Feb 17 21:35:31 2023 +0800 增加获取网站状态码接口</p>
      <p>
        Date: Thu Feb 16 17:00:38 2023 +0800
        新增毒鸡汤接口，新增获取网站状态码接口
      </p>
      <p>Date: Thu Feb 16 16:22:39 2023 +0800 增加天气接口</p>
      <p>
        Date: Tue Feb 14 21:47:56 2023 +0800
        增加端口扫描接口，增加获取网站标题接口，增加网站测速接口，增加舔狗日记，增加随机密码接口
      </p>
      <p>Date: Tue Feb 14 15:25:25 2023 +0800 增加whois接口</p>
      <p>
        Date: Mon Feb 13 16:21:09 2023 +0800
        增加icp备案接口，修复抖音存入redis失败
      </p>
      <p>
        Date: Sun Feb 12 21:27:32 2023 +0800
        代码整体优化，将同样功能的代码封装为函数，增加tcping接口
      </p>
      <p>
        Date: Sun Feb 12 15:30:01 2023 +0800
        新增三个图片接口，一个视频接口，修改抖音视频解析返回的结果
      </p>
      <p>Date: Fri Feb 10 23:14:12 2023 +0800 增加哈希加密接口</p>
      <p>Date: Fri Feb 10 22:59:28 2023 +0800 增加qq信息接口</p>
      <p>Date: Fri Feb 10 17:54:29 2023 +0800 增加抖音视频解析</p>
      <p>Date: Thu Feb 9 20:17:51 2023 +0800 增加ip查询接口</p>
      <p>Date: Thu Feb 9 14:43:28 2023 +0800 增加接口统计</p>
      <p>
        Date: Wed Feb 8 11:33:42 2023 +0800
        将redis，set，get，ttl挂载到api接口上
      </p>
      <p>
        Date: Mon Feb 6 20:31:46 2023 +0800
        增加随机4k图片，随机二次元图片，base64加密解密
      </p>
      <p>Date: Mon Feb 6 18:16:52 2023 +0800 重写路由，去除锁</p>
      <p>
        Date: Sun Feb 5 00:59:33 2023 +0800
        修复高并发下map错误情况，关闭接口限流
      </p>
      <p>Date: Sat Feb 4 17:01:36 2023 +0800 增加限流</p>
      <p>
        Date: Sat Feb 4 13:49:55 2023 +0800 增加二维码接口，增加redis封装调用
      </p>
      <p>Date: Sat Feb 4 11:56:33 2023 +0800 增加二维码接口</p>
      <p>Date: Sat Feb 4 09:18:22 2023 +0800 init</p>
    </div>
    <div style="margin-top: 40px">
      <p style="text-align: center">
        <span>{{ props.options.icp }}</span
        ><span>{{ props.options.gongan }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['options'])
const v1 = ref(false)
const v2 = ref(false)
</script>

<style lang="less" scoped>
.default-container {
  width: calc(100% - 270px);
  padding-right: 50px;
  margin-top: 20px;
  margin-left: 40px;
  color: var(--title--color);

  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 16px;
    margin-top: 25px;
  }

  .text {
    margin-top: 15px;
    p {
      margin-bottom: 15px;
    }
  }

  a {
    text-decoration: navajowhite;
    color: #9999ff;
  }

  .ad {
    width: 90%;
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    .ad-box {
      width: 120px;
      height: 30px;
      background: #9999ff;
      color: var(--font--color);
      text-align: center;
      line-height: 30px;
    }
  }

  .adPic {
    width: 70%;
    height: 120px;
    margin-bottom: 20px;
  }
}

@media screen and (max-width: 750px) {
  .default-container {
    width: 100%;
    .adPic {
      width: 100%;
      height: 40px;
    }
  }
}
</style>