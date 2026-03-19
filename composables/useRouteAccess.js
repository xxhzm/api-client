export const useRouteAccess = () => {
  const routeInfo = useCookie('routeInfo')

  const hasRoute = (path) => {
    if (!routeInfo.value) return false
    return routeInfo.value.some((route) => route.path === path)
  }

  const isAdmin = computed(() => {
    if (!routeInfo.value) return false
    return routeInfo.value.some((r) => r.path === '/admin/system')
  })

  return {
    isAdmin,
    hasRoute,
  }
}
