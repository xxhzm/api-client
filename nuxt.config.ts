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

  // ========== 路由级缓存策略 ==========
  routeRules: {
    // 静态页面使用 ISR 缓存，减少重复渲染
    '/about': { isr: 3600 },
    '/privacy': { isr: 3600 },
    '/terms': { isr: 3600 },
    '/links': { isr: 3600 },
    // 地图 JSON 数据设置长缓存
    '/data/**': { headers: { 'cache-control': 'public, max-age=86400, immutable' } },
  },

  // ========== 构建性能优化 ==========
  vite: {
    build: {
      // 提高 chunk 大小警告阈值
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // 手动分包：将大型依赖拆分为独立 chunk，按需加载
          manualChunks(id) {
            // ECharts 单独分包（~1MB），仅在使用 echarts 的页面加载
            if (id.includes('node_modules/echarts') || id.includes('node_modules/zrender')) {
              return 'vendor-echarts'
            }
            // highlight.js 单独分包，仅在需要代码高亮的页面加载
            if (id.includes('node_modules/highlight.js')) {
              return 'vendor-hljs'
            }
            // Element Plus 单独分包
            if (id.includes('node_modules/element-plus')) {
              return 'vendor-element-plus'
            }
          },
        },
      },
    },
  },
})
