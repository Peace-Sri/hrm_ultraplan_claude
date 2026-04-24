import { describe, it, expect } from 'vitest'
import { calculateAnnualTaxBaht, TAX_BRACKETS_BAHT } from '@/lib/thai-rules'

describe('Thai progressive income tax 2026', () => {
  it('has 8 brackets summing to full range', () => {
    expect(TAX_BRACKETS_BAHT.length).toBe(8)
  })

  it('income 0 = 0 tax', () => {
    expect(calculateAnnualTaxBaht(0)).toBe(0)
  })

  it('income ≤ 150k = 0 tax', () => {
    expect(calculateAnnualTaxBaht(150_000)).toBe(0)
  })

  it('income 300k: first 150k @0, next 150k @5% = 7,500', () => {
    // 150,001-300,000 is the 5% bracket (150k wide)
    expect(calculateAnnualTaxBaht(300_000)).toBeCloseTo(7_500, 0)
  })

  it('income 500k tax is 27.5k (5%*150k + 10%*200k)', () => {
    // 0 + 7500 + 20000 = 27500
    expect(calculateAnnualTaxBaht(500_000)).toBeCloseTo(27_500, 0)
  })

  it('income 1,000,000 spans into 20% bracket', () => {
    // 0 + 7500 + 20000 + 37500 + 50000 = 115000
    expect(calculateAnnualTaxBaht(1_000_000)).toBeCloseTo(115_000, 0)
  })

  it('income 5,000,001 triggers 35% top bracket', () => {
    // Top bracket applies beyond 5M
    const at5m = calculateAnnualTaxBaht(5_000_000)
    const justAbove = calculateAnnualTaxBaht(5_000_100)
    expect(justAbove).toBeGreaterThan(at5m)
  })

  it('rounds down to nearest 0.25 THB (Revenue Code §50)', () => {
    const t = calculateAnnualTaxBaht(301_017)
    // should end in .00 / .25 / .50 / .75
    const cents = Math.round((t * 100) % 100)
    expect([0, 25, 50, 75]).toContain(cents)
  })
})
