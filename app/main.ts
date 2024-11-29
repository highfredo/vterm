// Import icon libraries
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'

// Snimations from Animate.css
import '@quasar/extras/animate/slideInDown.css'
import '@quasar/extras/animate/slideOutUp.css'

// Import Quasar css
import 'quasar/src/css/index.sass'
import '@/css/app.scss'

import { createApp } from 'vue'
import { Dialog, QTabs, Quasar, Notify } from 'quasar'
import App from './App.vue'
import routes from '@/routes'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { useConfigStore } from '@/stores/config-store'

const app = createApp(App)

app.use(Quasar, {
  plugins: {
    Dialog,
    Notify
  }
})

const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  history: createWebHashHistory()
})
app.use(router)

const pinia = createPinia()
pinia.use(() => ({ $router: router }))
app.use(pinia)

// Es necesario registrarlo globalmente para que draggable lo pueda usar
app.component('QTabs', QTabs)

await useConfigStore().load()

app.mount('#app')
