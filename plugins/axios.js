import axios from 'axios'

export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      // 向服务器发送请求判断 token 是否正确
      axiosDefault: () => {
        const { $msg } = useNuxtApp()
        // axios.defaults.baseURL = 'https://www.api-m.com/'
        axios.defaults.baseURL = 'http://10.6.6.6:3005/api/'

        axios.interceptors.response.use(response => {

          const { data: res } = response

          if (res.code !== 200) {
            $msg(res.msg, 'error')
          }

          return response
        })
      }
    }
  }
})