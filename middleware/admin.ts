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
