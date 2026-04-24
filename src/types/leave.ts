import type { ID, ISODate, ISODateTime } from './common'

export type LeaveTypeKey =
  | 'sick'
  | 'personal'
  | 'vacation'
  | 'maternity'
  | 'paternity'
  | 'ordination'
  | 'unpaid'
  | 'bereavement'

export type LeaveRequestStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'

export interface LeaveType {
  key: LeaveTypeKey
  nameTh: string
  nameEn: string
  isPaid: boolean
  annualEntitlementDays: number
  maxConsecutiveDays?: number
  requiresAttachment: boolean
  carryOver: 'none' | 'capped' | 'unlimited'
  carryOverCapDays?: number
  colorHex: string
}

export interface LeaveBalance {
  employeeId: ID<'EMP'>
  year: number
  leaveTypeKey: LeaveTypeKey
  entitledDays: number
  usedDays: number
  pendingDays: number
  carriedOverDays: number
}

export interface LeaveRequest {
  id: ID<'LVR'>
  employeeId: ID<'EMP'>
  leaveTypeKey: LeaveTypeKey
  startDate: ISODate
  endDate: ISODate
  totalDays: number // business days, excl weekends/holidays
  isHalfDay: boolean
  reason: string
  attachmentUrl?: string
  status: LeaveRequestStatus
  submittedAt: ISODateTime
  reviewedBy?: ID<'EMP'>
  reviewedAt?: ISODateTime
  reviewerComment?: string
}
