export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      // 封装useFetch
      myFetch: (request, opts) => {
        const baseURL = 'http://127.0.0.1:3005/admin/'

        return $fetch(baseURL + request, opts)
      },
    },
  }
})
