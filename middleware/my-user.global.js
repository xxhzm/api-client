export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) {
    return
  }

  const { $msg, $myFetch } = useNuxtApp()

  // 判断用户是否访问后台页面，如果访问则进行验证
  if (to.path.includes('admin')) {
    // 向服务器发送请求
    const res = await $myFetch('CheckUserPathPermission', {
      params: {
        path: 'route' + to.path,
      },
    })

    if (res.code !== 200) {
      const username = useCookie('username')
      const token = useCookie('token')

      username.value = undefined
      token.value = undefined
      $msg('您没有权限访问该页面', 'error')
      setTimeout(() => {
        return navigateTo('/login')
      }, 500)
    }
  }
})
