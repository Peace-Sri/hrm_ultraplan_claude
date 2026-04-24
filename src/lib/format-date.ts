import { format, parseISO } from 'date-fns'

export type DateSystem = 'CE' | 'BE'

export function toBuddhistYear(ceYear: number): number {
  return ceYear + 543
}

/** Format date string with CE/BE option.  */
export function formatDate(
  value: string | Date,
  pattern = 'd MMM yyyy',
  system: DateSystem = 'CE',
): string {
  const date = typeof value === 'string' ? parseISO(value) : value
  const formatted = format(date, pattern)
  if (system === 'CE') return formatted
  const ceYear = date.getFullYear()
  const beYear = toBuddhistYear(ceYear)
  return formatted.replace(String(ceYear), String(beYear))
}

export function formatTime(value: string | Date): string {
  const date = typeof value === 'string' ? parseISO(value) : value
  return format(date, 'HH:mm')
}

export function formatDateTime(
  value: string | Date,
  system: DateSystem = 'CE',
): string {
  const date = typeof value === 'string' ? parseISO(value) : value
  return `${formatDate(date, 'd MMM yyyy', system)} ${formatTime(date)}`
}
