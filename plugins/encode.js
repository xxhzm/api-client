export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      enCode: (text) => {
        if (text === '') {
          return
        }

        // 对字符串进行 base64 加密
        const base64Text = window.btoa(text)

        return base64Text
      }
    }
  }
})