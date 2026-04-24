import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { formatDate, formatDateTime, formatTime } from '@/lib/format-date'
import { formatTHB, formatBaht } from '@/lib/format-money'

export function useLocale() {
  const app = useAppStore()

  const date = (value: string | Date, pattern?: string) =>
    formatDate(value, pattern, app.dateSystem)
  const dateTime = (value: string | Date) => formatDateTime(value, app.dateSystem)
  const time = formatTime
  const thb = formatTHB
  const baht = formatBaht

  const isTh = computed(() => app.locale === 'th')
  const isEn = computed(() => app.locale === 'en')

  return { date, dateTime, time, thb, baht, isTh, isEn }
}
