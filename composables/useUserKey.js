export const useUserKey = () => {
  const { $myFetch } = useNuxtApp()
  const username = useCookie('username')
  const { onlyPhoneBind } = usePhoneBind()
  const userAccessKey = useCookie('userAccessKey', {
    decode: (v) => v,
    encode: (v) => v,
  })
  const fetchUserKey = async () => {
    const res = await $myFetch('GetUserKey', {
      params: {
        username: username.value,
      },
    })
    if (res.code === 200) {
      userAccessKey.value = res?.data?.access_key || ''
    } else {
      userAccessKey.value = ''
    }
    return res
  }

  if (!userAccessKey.value && !onlyPhoneBind) {
    fetchUserKey()
  }

  return { userAccessKey: readonly(userAccessKey), fetchUserKey }
}
