export default defineNuxtPlugin((/* nuxtApp */) => {
  return {
    provide: {
      enCode: (text) => {
        if (text === '') {
          return
        }

        // 对字符串进行 base64 加密
        const base64Text = window.btoa(text)

        // 字母大小写转换 将所有小写字母（a-z）转换为大写字母（A-Z）将所有大写字母（A-Z）转换为小写字母（a-z）
        // 字母后移10位 对于每个字母，转换后，将其 Unicode 编码值增加 10（即字符后移 10 位）。
        // 对字符串中的数字字符（0-9），每个数字的值加上 5。
        // 非字母和数字字符不变
        let result = ''
        for (let i = 0; i < base64Text.length; i++) {
          let char = base64Text[i]

          if (/[a-zA-Z]/.test(char)) {
            // 字母后移1位
            if (char >= 'a' && char <= 'z') {
              char = String.fromCharCode(
                ((char.charCodeAt(0) - 97 + 1) % 26) + 97
              )
            } else if (char >= 'A' && char <= 'Z') {
              char = String.fromCharCode(
                ((char.charCodeAt(0) - 65 + 1) % 26) + 65
              )
            }

            // 字母大小写互换
            char =
              char === char.toLowerCase()
                ? char.toUpperCase()
                : char.toLowerCase()
          } else if (/[0-9]/.test(char)) {
            // 数字加1
            char = (parseInt(char) + 1) % 10
          }

          result += char
        }

        return result
      },
    },
  }
})
