export type ID<T extends string> = `${T}-${string}`

export type ISODate = string // "2026-04-24"
export type ISODateTime = string // "2026-04-24T08:30:00+07:00"

/** Monetary values stored as integer satang (1 THB = 100 satang). */
export type Satang = number

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export const SATANG_PER_BAHT = 100

export const toBaht = (s: Satang): number => s / SATANG_PER_BAHT
export const toSatang = (baht: number): Satang => Math.round(baht * SATANG_PER_BAHT)
