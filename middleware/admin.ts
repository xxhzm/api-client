import axios from 'axios'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { $token } = useNuxtApp()

  const rule = /admin/

  const token = useCookie('token')
  const username = useCookie('username')

  if (rule.test(to.path) === true) {
    if ((await $token(token.value, username.value)) === 'false') {
      abortNavigation()
      return navigateTo('/login')
    }

    // 设置请求拦截器，给 url 中添加 token
    axios.interceptors.request.use(
      (config) => {
        if (token.value !== undefined && config.url !== 'Token') {
          config.url += '?token=' + token.value
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }
  if (to.path === '/login') {
    if (token.value !== undefined && username.value !== undefined) {
      if ((await $token(token.value, username.value)) === 'true') {
        //停止当前导航
        abortNavigation()
        return navigateTo('/admin')
      }
    }
  }
})
