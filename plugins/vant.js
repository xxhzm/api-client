import { defineNuxtPlugin } from '#app'
import { Tabbar, TabbarItem, ActionSheet, NoticeBar } from 'vant'

import 'vant/lib/index.css'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(Tabbar)
  nuxtApp.vueApp.use(TabbarItem)
  nuxtApp.vueApp.use(ActionSheet)
  nuxtApp.vueApp.use(NoticeBar)
})
