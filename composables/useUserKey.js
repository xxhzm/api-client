export const useUserKey = () => {
  const { $myFetch } = useNuxtApp()
  const username = useCookie('username')
  const userAccessKey = useCookie('userAccessKey', () => '')
  const fetchUserKey = async (name) => {
    const uname = name ?? username.value
    const res = await $myFetch('GetUserKey', {
      params: {
        username: uname,
      },
    })
    if (res.code === 200) {
      userAccessKey.value = res?.data?.access_key || ''
    } else {
      userAccessKey.value = ''
    }
    return res
  }
  return { userAccessKey: readonly(userAccessKey), fetchUserKey }
}
