import { describe, it, expect } from 'vitest'
import {
  hourlyRateSatang,
  otWeekdaySatang,
  otHolidayRegSatang,
  otHolidayExtraSatang,
  calculateMonthlySSOSatang,
  OT_RATES,
  SSO,
} from '@/lib/thai-rules'
import { toSatang } from '@/types/common'

describe('Thai OT rates per LPA §61-63', () => {
  it('has correct multipliers', () => {
    expect(OT_RATES.weekdayOT).toBe(1.5)
    expect(OT_RATES.holidayRegular).toBe(2.0)
    expect(OT_RATES.holidayOT).toBe(3.0)
  })

  it('hourly rate = monthly / 240', () => {
    const monthly = toSatang(24_000) // 24,000 THB
    expect(hourlyRateSatang(monthly)).toBe(10_000) // 100 THB/hr in satang
  })

  it('weekday OT 60 min at 100 THB/hr = 150 THB', () => {
    const hourly = toSatang(100)
    expect(otWeekdaySatang(60, hourly)).toBe(toSatang(150))
  })

  it('holiday regular 60 min at 100 THB/hr = 200 THB', () => {
    const hourly = toSatang(100)
    expect(otHolidayRegSatang(60, hourly)).toBe(toSatang(200))
  })

  it('holiday OT extra 60 min at 100 THB/hr = 300 THB', () => {
    const hourly = toSatang(100)
    expect(otHolidayExtraSatang(60, hourly)).toBe(toSatang(300))
  })
})

describe('Social Security (SSO) cap', () => {
  it('rate is 5%, ceiling 15,000 → max 750 THB/month', () => {
    expect(SSO.rate).toBe(0.05)
    expect(SSO.baseCeilingBaht).toBe(15_000)
  })

  it('capped at 750 THB/mo for 50,000 salary', () => {
    const sso = calculateMonthlySSOSatang(toSatang(50_000))
    expect(sso).toBe(toSatang(750))
  })

  it('capped at 750 for 15,001 salary too', () => {
    const sso = calculateMonthlySSOSatang(toSatang(15_001))
    expect(sso).toBe(toSatang(750))
  })

  it('proportional below cap — 10k → 500 THB', () => {
    const sso = calculateMonthlySSOSatang(toSatang(10_000))
    expect(sso).toBe(toSatang(500))
  })

  it('floor at 1,650 — anything below uses floor', () => {
    const sso = calculateMonthlySSOSatang(toSatang(1_000))
    expect(sso).toBe(toSatang(82.5))
  })
})
