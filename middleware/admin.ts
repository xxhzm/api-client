export default defineNuxtRouteMiddleware((to, from) => {
  const rule = /admin/

  const token = useCookie('token')
  const username = useCookie('username')

  if (rule.test(to.path) === true) {
    if (token.value?.length !== 32 || username.value === undefined) {
      //停止当前导航
      abortNavigation()

      return navigateTo('/login')
    }
  }
  if (to.path === '/login') {
    if (token.value !== undefined && username.value !== undefined) {
      if (token.value?.length === 32) {
        //停止当前导航
        abortNavigation()
        return navigateTo('/admin')
      }
    }
  }
})
