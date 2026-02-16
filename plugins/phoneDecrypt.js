import CryptoJS from 'crypto-js'

export default defineNuxtPlugin(() => {
  function deriveKeyFromToken(token) {
    const salt = 'phone_decrypt_salt_2026'
    return CryptoJS.SHA256(token + salt)
  }

  function decryptPhone(encryptedPhone, token) {
    if (!encryptedPhone || !token) return ''
    try {
      const key = deriveKeyFromToken(token)
      const encrypted = CryptoJS.enc.Base64.parse(encryptedPhone)
      const iv = CryptoJS.lib.WordArray.create(encrypted.words.slice(0, 4))
      const ciphertext = CryptoJS.lib.WordArray.create(encrypted.words.slice(4))

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext },
        key,
        { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 },
      )

      return decrypted.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('手机号解密失败:', error)
      return ''
    }
  }

  return {
    provide: {
      decryptPhone,
    },
  }
})
