import axios from 'axios'

export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      // 向服务器发送请求判断 token 是否正确
      axiosDefault: () => {
        // axios.defaults.baseURL = 'https://www.api-m.com/'
        axios.defaults.baseURL = 'http://127.0.0.1:3005/api/'
      }
    }
  }
})