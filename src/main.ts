import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { router } from './router'
import { i18n } from './i18n'
import { useAppStore } from './stores/app'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(i18n)

// Apply persisted theme/locale on boot
const appStore = useAppStore()
appStore.applyTheme()
// vue-i18n composition mode: locale is a Ref
;(i18n.global.locale as unknown as { value: string }).value = appStore.locale
document.documentElement.lang = appStore.locale

// Global error handler → console (extend to notify store later)
app.config.errorHandler = (err, _vm, info) => {
  console.error('[Vue error]', info, err)
}
window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled rejection]', e.reason)
})

app.mount('#app')
