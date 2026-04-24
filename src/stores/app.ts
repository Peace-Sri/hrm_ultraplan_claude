import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { DateSystem } from '@/lib/format-date'

export type Theme = 'light' | 'dark' | 'system'
export type Locale = 'th' | 'en'

export const useAppStore = defineStore(
  'app',
  () => {
    const theme = ref<Theme>('system')
    const locale = ref<Locale>('th')
    const dateSystem = ref<DateSystem>('CE')
    const sidebarCollapsed = ref(false)

    function applyTheme() {
      const html = document.documentElement
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const isDark = theme.value === 'dark' || (theme.value === 'system' && systemDark)
      html.classList.toggle('dark', isDark)
    }

    function setTheme(t: Theme) {
      theme.value = t
      applyTheme()
    }

    function setLocale(l: Locale) {
      locale.value = l
      document.documentElement.lang = l
    }

    watch(theme, applyTheme, { immediate: false })

    return {
      theme,
      locale,
      dateSystem,
      sidebarCollapsed,
      applyTheme,
      setTheme,
      setLocale,
    }
  },
  {
    persist: {
      pick: ['theme', 'locale', 'dateSystem', 'sidebarCollapsed'],
    },
  },
)
