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

        // const baseURL = 'https://xxapi.cn/api/'
        const baseURL = 'http://10.6.6.6:3005/admin/'

        return $fetch(baseURL + request, { ...opts, ...obj })
      },
    },
  }
})
