import axios from 'axios'

export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      // 向服务器发送请求判断 token 是否正确
      axiosInit: () => {
        // axios.defaults.baseURL = 'https://www.api-m.com/'
        // axios.defaults.baseURL = 'http://127.0.0.1:8000/admin/'
        axios.defaults.baseURL = 'http://127.0.0.1:3005/api/'

        axios.interceptors.response.use(response => {
          const { data: res } = response
          if (res.code === '-5' || res.code === '-6') {
            ElNotification({
              type: 'error',
              message: res.msg
            })

            const username = useCookie('username')
            const token = useCookie('token')
            const grade = useCookie('grade')

            username.value = undefined
            token.value = undefined
            grade.value = undefined

            navigateTo('/login')
            return false
          }

          if (res.code === '-3') {
            ElNotification({
              type: 'error',
              message: res.msg
            })

            return false
          }
          return response
        })

      }
    }
  }
})