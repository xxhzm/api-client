// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  modules: ['@element-plus/nuxt', '@vant/nuxt'],
  experimental: {
    externalVue: true,
  },
  css: ['@/assets/css/app.less'],
  sourcemap: {
    server: false,
    client: false,
  },
  // ssr: false,
})
