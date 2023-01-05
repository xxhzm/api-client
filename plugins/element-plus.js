import { defineNuxtPlugin } from '#app'
import ElementPlus from 'element-plus'
import { ID_INJECTION_KEY } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import 'element-plus/dist/index.css'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(ElementPlus, {
    locale: zhCn,
  })

  nuxtApp.vueApp.provide(ID_INJECTION_KEY, {
    prefix: 100,
    current: 0,
  })
})
