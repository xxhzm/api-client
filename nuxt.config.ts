// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  modules: ['@element-plus/nuxt'],

  experimental: {
    externalVue: true,
  },

  css: ['@/assets/css/app.less'],

  sourcemap: {
    server: false,
    client: false,
  },

  // ssr: false,
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },

  compatibilityDate: '2024-11-08',

  runtimeConfig: {
    public: {
      isDev: process.env.NODE_ENV === 'development',
    },
  },

  dev:
    process.env.NODE_ENV === 'development'
      ? {
          globalError: false,
        }
      : undefined,
})
