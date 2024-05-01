import { ElNotification } from 'element-plus'

export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      // 向服务器发送请求判断 token 是否正确
      msg: (message, type) => {
        ElNotification({
          message,
          type
        })
      }
    }
  }
})