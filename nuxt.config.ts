// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  experimental: {
    externalVue: true,
  },
  css: ['@/assets/css/app.less', '@/assets/css/color.less'],
  plugins: [
    {
      src: '~/plugins/element-plus.js',
    },
    {
      src: '~/plugins/vant.js',
    },
  ],
})
