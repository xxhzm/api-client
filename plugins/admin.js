import axios from 'axios'

export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      // 向服务器发送请求判断 token 是否正确
      logout: () => {
        const username = useCookie('username')
        const token = useCookie('token')
        const group = useCookie('group')

        username.value = undefined
        token.value = undefined
        group.value = undefined

        window.location.href = '/login'
      }
    }
  }
})