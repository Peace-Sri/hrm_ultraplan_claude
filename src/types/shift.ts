import type { ID, ISODate } from './common'

export interface Shift {
  id: ID<'SFT'>
  nameTh: string
  nameEn: string
  startTime: string // "08:30"
  endTime: string // "17:30"
  breakMinutes: number // 60
  lateGraceMinutes: number // 15
  isOvernight: boolean
}

export interface EmployeeShiftAssignment {
  id: ID<'ESA'>
  employeeId: ID<'EMP'>
  shiftId: ID<'SFT'>
  effectiveFrom: ISODate
  effectiveTo?: ISODate
}
