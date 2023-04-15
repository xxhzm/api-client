import axios from 'axios'

export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      // 向服务器发送请求判断 token 是否正确
      token: async (token, username) => {
        const { data: res } = await axios.get('Token', {
          params: {
            token,
            username
          }
        })
        if (res.code !== 200 || res.msg !== '数据请求成功') {
          console.log(123)
          return 'false'
        } else if (res.code === 200 && res.msg === '数据请求成功' && res.data === 'true') {
          return 'true'
        }
      }
    }
  }
})