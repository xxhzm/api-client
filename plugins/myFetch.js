export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      // 封装useFetch
      myFetch: (request, opts) => {
        // 创建一个新的对象
        const obj = {
          headers: {
            Authorization: '',
          },
        }

        const authorization = useState('Authorization')
        if (authorization.value !== undefined) {
          obj.headers.Authorization = authorization.value
        }

        const baseURL = 'http://127.0.0.1:3005/admin/'

        return $fetch(baseURL + request, { ...opts, ...obj })
      },
    },
  }
})
