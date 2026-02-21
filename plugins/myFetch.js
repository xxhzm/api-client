export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      // 封装useFetch
      myFetch: (request, opts) => {
        const { $msg } = useNuxtApp()

        // 创建一个新的对象
        const obj = {
          headers: {
            Authorization: '',
          },
          onResponse({ request, response, options }) {
            if (
              response._data.code === -5 ||
              response._data.code === -6 ||
              response._data.code === -7
            ) {
              $msg(response._data.msg, 'error')
            }
          },
        }

        const authorization = useState('Authorization')
        if (authorization.value !== undefined) {
          obj.headers.Authorization = authorization.value
        }

        const event = useRequestEvent()
        const host = event?.node?.req?.headers?.host || window?.location?.host

        const baseURL = 'http://127.0.0.1:3005/admin/'
        // const baseURL = 'https://' + host + '/adminapi/'

        return $fetch(baseURL + request, { ...opts, ...obj })
      },
      // 获取更新日志
      fetchChangelog: async (page = 1, pageSize = 10) => {
        const validPage = Math.max(1, Number.parseInt(page, 10) || 1)
        const validPageSize = Math.min(
          50,
          Math.max(1, Number.parseInt(pageSize, 10) || 10),
        )

        try {
          return await $fetch('https://api.yunque.cc/changelog', {
            method: 'GET',
            query: {
              page: validPage,
              pageSize: validPageSize,
            },
          })
        } catch (error) {
          const statusCode = error?.response?.status || 500
          const errorData = error?.response?._data

          throw createError({
            statusCode,
            statusMessage: errorData?.message || '获取更新日志失败',
            data: errorData || null,
          })
        }
      },
    },
  }
})
