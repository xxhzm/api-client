export const usePhoneBind = () => {
  const routeInfo = useCookie('routeInfo')

  const onlyPhoneBind = computed(() => {
    if (!routeInfo.value) return false
    const paths = routeInfo.value.map((r) => r.path)
    return paths.every((p) => p === '/admin/phone' || p === '/admin')
  })

  return { onlyPhoneBind }
}
