import axios from 'axios'

export default defineNuxtRouteMiddleware((to, from) => {
  const rule = /admin/

  let myInterceptor = 0

  if (rule.test(to.path) === true) {
    // 设置请求拦截器，给 url 中添加 token
    myInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = useCookie('token')
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

  if (to.fullPath === '/login?logout') {
    window.location.href = '/login'
  }

  if (myInterceptor !== 0) {
    axios.interceptors.request.eject(myInterceptor)
  }
})
