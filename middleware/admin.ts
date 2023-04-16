import axios from 'axios'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { $token } = useNuxtApp()

  const rule = /admin/

  const username = useCookie('username')
  const token = useCookie('token')
  const grade = useCookie('grade')

  let myInterceptor = 0

  if (rule.test(to.path) === true) {
    // 设置请求拦截器，给 url 中添加 token
    myInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token.value !== '' && config.url !== 'Token') {
          config.url += '?token=' + token.value
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  if (myInterceptor !== 0) {
    axios.interceptors.request.eject(myInterceptor)
  }
})
