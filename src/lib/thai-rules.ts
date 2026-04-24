/**
 * Thai HR/Payroll business rules per LPA (Labour Protection Act) and
 * Revenue Code, updated for 2026.
 *
 * All monetary inputs/outputs are in satang (1 THB = 100 satang) unless labelled `BAHT`.
 */

import type { Satang } from '@/types/common'
import type { Employee } from '@/types/employee'
import type { LeaveTypeKey } from '@/types/leave'
import { isHoliday } from './thai-holidays'

// ═══════════════════════════════════════════════════════════════════════════
// TAX — Progressive brackets 2026 (annual net taxable income in BAHT)
// ═══════════════════════════════════════════════════════════════════════════

export const TAX_BRACKETS_BAHT: ReadonlyArray<{ min: number; max: number; rate: number }> = [
  { min: 0,         max: 150_000,   rate: 0    },
  { min: 150_001,   max: 300_000,   rate: 0.05 },
  { min: 300_001,   max: 500_000,   rate: 0.10 },
  { min: 500_001,   max: 750_000,   rate: 0.15 },
  { min: 750_001,   max: 1_000_000, rate: 0.20 },
  { min: 1_000_001, max: 2_000_000, rate: 0.25 },
  { min: 2_000_001, max: 5_000_000, rate: 0.30 },
  { min: 5_000_001, max: Infinity,  rate: 0.35 },
]

/** Compute progressive tax on annual taxable income (BAHT) → annual tax (BAHT). */
export function calculateAnnualTaxBaht(taxableBaht: number): number {
  if (taxableBaht <= 0) return 0
  let tax = 0
  for (const bracket of TAX_BRACKETS_BAHT) {
    if (taxableBaht > bracket.min) {
      const upper = Math.min(taxableBaht, bracket.max)
      const slice = upper - (bracket.min - 1)
      tax += slice * bracket.rate
    }
  }
  // Revenue Code §50: round DOWN to nearest 0.25 THB
  return Math.floor(tax * 4) / 4
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPENSE DEDUCTION
// ═══════════════════════════════════════════════════════════════════════════

export const EXPENSE_DEDUCTION_RATE = 0.5
export const EXPENSE_DEDUCTION_CAP_BAHT = 100_000

export function expenseDeductionBaht(annualGrossBaht: number): number {
  return Math.min(annualGrossBaht * EXPENSE_DEDUCTION_RATE, EXPENSE_DEDUCTION_CAP_BAHT)
}

// ═══════════════════════════════════════════════════════════════════════════
// PERSONAL ALLOWANCES (BAHT/year)
// ═══════════════════════════════════════════════════════════════════════════

export const ALLOWANCE = {
  self: 60_000,
  spouse: 60_000,
  childBornBefore2018: 15_000, // +30k if still studying — POC uses base
  childBornAfter2018: 60_000,
  parent: 30_000,
  disabled: 60_000,
  lifeInsuranceCap: 100_000,
  healthInsuranceCap: 25_000,
  homeLoanInterestCap: 100_000,
} as const

// ═══════════════════════════════════════════════════════════════════════════
// SOCIAL SECURITY (SSO)
// ═══════════════════════════════════════════════════════════════════════════

export const SSO = {
  rate: 0.05,
  baseFloorBaht: 1_650,
  baseCeilingBaht: 15_000, // → max employee contribution 750 THB/month
} as const

/** Monthly SSO employee contribution in satang. */
export function calculateMonthlySSOSatang(baseSalarySatang: Satang): Satang {
  const baseBaht = Math.min(
    Math.max(baseSalarySatang / 100, SSO.baseFloorBaht),
    SSO.baseCeilingBaht,
  )
  return Math.round(baseBaht * SSO.rate * 100)
}

// ═══════════════════════════════════════════════════════════════════════════
// OVERTIME (LPA §61-63)
// ═══════════════════════════════════════════════════════════════════════════

export const OT_RATES = {
  weekdayOT: 1.5,
  holidayRegular: 2.0,
  holidayOT: 3.0,
} as const

/** Hourly wage: monthly salary / (30 days * 8 hrs) */
export function hourlyRateSatang(monthlySalarySatang: Satang): Satang {
  return Math.round(monthlySalarySatang / 240)
}

export function otWeekdaySatang(minutes: number, hourlyRate: Satang): Satang {
  return Math.round((minutes / 60) * hourlyRate * OT_RATES.weekdayOT)
}
export function otHolidayRegSatang(minutes: number, hourlyRate: Satang): Satang {
  return Math.round((minutes / 60) * hourlyRate * OT_RATES.holidayRegular)
}
export function otHolidayExtraSatang(minutes: number, hourlyRate: Satang): Satang {
  return Math.round((minutes / 60) * hourlyRate * OT_RATES.holidayOT)
}

// ═══════════════════════════════════════════════════════════════════════════
// ATTENDANCE — LATE / WORKING DAYS
// ═══════════════════════════════════════════════════════════════════════════

export const LATE_GRACE_MINUTES_DEFAULT = 15

/** Calendar working days (Mon-Fri) in a month, minus Thai public holidays. */
export function workingDaysInMonth(year: number, month1to12: number): number {
  const daysInMonth = new Date(year, month1to12, 0).getDate()
  let count = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month1to12 - 1, d)
    const dow = date.getDay() // 0=Sun, 6=Sat
    const iso = `${year}-${String(month1to12).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (dow !== 0 && dow !== 6 && !isHoliday(iso)) count++
  }
  return count
}

// ═══════════════════════════════════════════════════════════════════════════
// LEAVE ENTITLEMENTS (annual days) — LPA §30-41
// ═══════════════════════════════════════════════════════════════════════════

export const LEAVE_ENTITLEMENT_DAYS: Record<LeaveTypeKey, number> = {
  sick: 30,
  personal: 3,
  vacation: 6,
  maternity: 98,
  paternity: 15,
  ordination: 120,
  unpaid: 0, // unlimited unpaid
  bereavement: 5,
}

/** Prorate annual entitlement for mid-year hires. */
export function prorateLeaveDays(
  annualDays: number,
  hireDate: Date,
  year: number,
): number {
  const yearStart = new Date(year, 0, 1)
  if (hireDate <= yearStart) return annualDays
  const monthsRemaining = 12 - hireDate.getMonth()
  return Math.floor((annualDays * monthsRemaining) / 12)
}

// ═══════════════════════════════════════════════════════════════════════════
// UNPAID LEAVE DEDUCTION
// ═══════════════════════════════════════════════════════════════════════════

export function unpaidLeaveDeductionSatang(
  baseSalarySatang: Satang,
  unpaidDays: number,
  workingDays: number,
): Satang {
  if (workingDays === 0) return 0
  return Math.round((baseSalarySatang / workingDays) * unpaidDays)
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL PAYSLIP CALCULATION (annualized withholding, monthly divide)
// ═══════════════════════════════════════════════════════════════════════════

export interface PayslipContext {
  employee: Employee
  year: number
  month: number
  otWeekdayMin: number
  otHolidayRegMin: number
  otHolidayExtraMin: number
  bonusSatang?: Satang
  unpaidDays: number
}

export interface PayslipCalcResult {
  earnings: {
    baseSalary: Satang
    monthlyAllowances: Satang
    otWeekday: Satang
    otHolidayReg: Satang
    otHolidayExtra: Satang
    bonus: Satang
    total: Satang
  }
  deductions: {
    sso: Satang
    pvd: Satang
    tax: Satang
    absence: Satang
    total: Satang
  }
  netPay: Satang
  workingDays: number
}

export function calculatePayslip(ctx: PayslipContext): PayslipCalcResult {
  const { employee: e, year, month } = ctx
  const workingDays = workingDaysInMonth(year, month)
  const hourly = hourlyRateSatang(e.baseSalary)

  const otW = otWeekdaySatang(ctx.otWeekdayMin, hourly)
  const otHR = otHolidayRegSatang(ctx.otHolidayRegMin, hourly)
  const otHE = otHolidayExtraSatang(ctx.otHolidayExtraMin, hourly)
  const bonus = ctx.bonusSatang ?? 0

  const earningsTotal =
    e.baseSalary + e.monthlyAllowances + otW + otHR + otHE + bonus

  const sso = calculateMonthlySSOSatang(e.baseSalary)
  const pvd = Math.round(e.baseSalary * e.pvdRate)
  const absence = unpaidLeaveDeductionSatang(e.baseSalary, ctx.unpaidDays, workingDays)

  // Annualized tax
  const annualGrossBaht = (earningsTotal * 12) / 100
  const a = e.taxAllowances
  const personalAllowBaht =
    ALLOWANCE.self +
    (a.hasSpouse ? ALLOWANCE.spouse : 0) +
    a.childrenBornBefore2018 * ALLOWANCE.childBornBefore2018 +
    a.childrenBornAfter2018 * ALLOWANCE.childBornAfter2018 +
    a.parents * ALLOWANCE.parent +
    a.disabled * ALLOWANCE.disabled +
    Math.min(a.lifeInsurance / 100, ALLOWANCE.lifeInsuranceCap) +
    Math.min(a.healthInsurance / 100, ALLOWANCE.healthInsuranceCap) +
    Math.min(a.homeLoanInterest / 100, ALLOWANCE.homeLoanInterestCap)

  const expenseDed = expenseDeductionBaht(annualGrossBaht)
  const ssoAnnual = (sso * 12) / 100
  const pvdAnnual = (pvd * 12) / 100
  const taxableBaht = Math.max(
    0,
    annualGrossBaht - expenseDed - personalAllowBaht - ssoAnnual - pvdAnnual,
  )
  const annualTaxBaht = calculateAnnualTaxBaht(taxableBaht)
  const monthlyTaxSatang = Math.round((annualTaxBaht * 100) / 12)

  const deductionsTotal = sso + pvd + monthlyTaxSatang + absence

  return {
    earnings: {
      baseSalary: e.baseSalary,
      monthlyAllowances: e.monthlyAllowances,
      otWeekday: otW,
      otHolidayReg: otHR,
      otHolidayExtra: otHE,
      bonus,
      total: earningsTotal,
    },
    deductions: {
      sso,
      pvd,
      tax: monthlyTaxSatang,
      absence,
      total: deductionsTotal,
    },
    netPay: earningsTotal - deductionsTotal,
    workingDays,
  }
}
