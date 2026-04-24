import type { ID, ISODate, ISODateTime, Satang } from './common'

export interface PayslipEarnings {
  baseSalary: Satang
  monthlyAllowances: Satang
  otWeekday: Satang
  otHolidayReg: Satang
  otHolidayExtra: Satang
  bonus: Satang
  otherEarnings: Satang
  total: Satang
}

export interface PayslipDeductions {
  sso: Satang
  pvd: Satang
  withholdingTax: Satang
  absence: Satang
  loan: Satang
  other: Satang
  total: Satang
}

export interface Payslip {
  id: ID<'PAY'>
  employeeId: ID<'EMP'>
  payrollRunId: ID<'RUN'>
  period: ISODate // first day of month, e.g. "2026-04-01"
  year: number
  month: number // 1-12
  workingDaysInMonth: number
  paidDays: number
  unpaidLeaveDays: number
  earnings: PayslipEarnings
  deductions: PayslipDeductions
  netPay: Satang
  issuedAt: ISODateTime
  note?: string
}

export type PayrollRunStatus = 'draft' | 'calculated' | 'finalized' | 'paid'

export interface PayrollRun {
  id: ID<'RUN'>
  period: ISODate
  year: number
  month: number
  status: PayrollRunStatus
  employeeIds: ID<'EMP'>[]
  totalEarnings: Satang
  totalDeductions: Satang
  totalNet: Satang
  calculatedAt?: ISODateTime
  finalizedAt?: ISODateTime
  finalizedBy?: ID<'EMP'>
}
