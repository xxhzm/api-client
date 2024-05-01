import { createApp } from 'vue'
import { ID_INJECTION_KEY } from 'element-plus'
import App from './app.vue'

const app = createApp(App)
app.provide(ID_INJECTION_KEY, {
  prefix: 1024,
  current: 0,
})
