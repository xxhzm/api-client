// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  modules: ['@element-plus/nuxt'],
  experimental: {
    externalVue: true,
  },
  css: ['@/assets/css/app.less', '@/assets/css/color.less'],
  plugins: [
    {
      src: '~/plugins/vant.js',
    },
  ],
  sourcemap: {
    server: false,
    client: false,
  },
})
