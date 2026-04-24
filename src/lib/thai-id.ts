/**
 * Thai National ID (13-digit) Mod-11 checksum validator.
 *
 * Algorithm (Revenue Dept / Ministry of Interior):
 *   check = (11 - (Σ digit[i] * (13 - i))_{i=0..11} % 11) % 10
 *   valid iff check === digit[12]
 */
export function validateThaiID(id: string): boolean {
  const digits = id.replace(/-/g, '').split('').map(Number)
  if (digits.length !== 13) return false
  if (digits.some((d) => Number.isNaN(d))) return false
  let sum = 0
  for (let i = 0; i < 12; i++) sum += digits[i] * (13 - i)
  const check = (11 - (sum % 11)) % 10
  return check === digits[12]
}

export function formatThaiID(id: string): string {
  const d = id.replace(/-/g, '')
  if (d.length !== 13) return id
  return `${d[0]}-${d.slice(1, 5)}-${d.slice(5, 10)}-${d.slice(10, 12)}-${d[12]}`
}

/** Generate a valid 13-digit Thai ID for seed data (NOT for production). */
export function generateValidThaiID(rng: () => number = Math.random): string {
  const first12: number[] = []
  for (let i = 0; i < 12; i++) first12.push(Math.floor(rng() * 10))
  let sum = 0
  for (let i = 0; i < 12; i++) sum += first12[i] * (13 - i)
  const check = (11 - (sum % 11)) % 10
  return [...first12, check].join('')
}
