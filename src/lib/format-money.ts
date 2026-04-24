import type { Satang } from '@/types/common'
import { toBaht } from '@/types/common'

const thbFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const plainFormatter = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Format satang as Thai Baht currency string (฿12,345.67). */
export function formatTHB(satang: Satang): string {
  return thbFormatter.format(toBaht(satang))
}

/** Format satang as plain decimal string (12,345.67). */
export function formatBaht(satang: Satang): string {
  return plainFormatter.format(toBaht(satang))
}
