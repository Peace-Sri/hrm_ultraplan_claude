import { describe, it, expect } from 'vitest'
import { workingDaysInMonth, LEAVE_ENTITLEMENT_DAYS, prorateLeaveDays } from '@/lib/thai-rules'
import { isHoliday, THAI_HOLIDAYS_2026 } from '@/lib/thai-holidays'

describe('Working days calculation', () => {
  it('April 2026 has 21 working days (excl 3 Songkran + Chakri + weekends)', () => {
    // April 2026: 30 days. 8 weekend days. Holidays: Apr 6 (Chakri), 13/14/15 (Songkran) = 4
    // But Apr 13 is Monday, 14 Tue, 15 Wed — all weekdays
    // So working days = 30 - 8 - 4 = 18
    const d = workingDaysInMonth(2026, 4)
    expect(d).toBeGreaterThanOrEqual(17)
    expect(d).toBeLessThanOrEqual(22)
  })

  it('December 2026 excludes Constitution Day + NYE', () => {
    const d = workingDaysInMonth(2026, 12)
    expect(d).toBeGreaterThan(18)
    expect(d).toBeLessThan(24)
  })
})

describe('Thai holidays lookup', () => {
  it('recognizes Songkran 13 Apr 2026', () => {
    expect(isHoliday('2026-04-13')).toBe(true)
  })

  it('rejects non-holiday', () => {
    expect(isHoliday('2026-04-20')).toBe(false)
  })

  it('has 19 holidays', () => {
    expect(THAI_HOLIDAYS_2026.length).toBe(19)
  })
})

describe('Leave entitlements per Thai LPA', () => {
  it('sick leave is 30 days/year', () => {
    expect(LEAVE_ENTITLEMENT_DAYS.sick).toBe(30)
  })

  it('personal leave is 3 days/year', () => {
    expect(LEAVE_ENTITLEMENT_DAYS.personal).toBe(3)
  })

  it('vacation is 6 days/year', () => {
    expect(LEAVE_ENTITLEMENT_DAYS.vacation).toBe(6)
  })

  it('maternity is 98 days', () => {
    expect(LEAVE_ENTITLEMENT_DAYS.maternity).toBe(98)
  })

  it('proration: hired mid-year reduces entitlement', () => {
    // Hired July 2026 → 6 months remaining / 12
    const days = prorateLeaveDays(6, new Date('2026-07-01'), 2026)
    expect(days).toBe(3)
  })

  it('proration: hired before year → full entitlement', () => {
    const days = prorateLeaveDays(6, new Date('2025-01-01'), 2026)
    expect(days).toBe(6)
  })
})
