import type { ID, ISODateTime } from './common'

export type ApprovalKind = 'leave' | 'attendance_correction' | 'overtime'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalItem {
  id: ID<'APR'>
  kind: ApprovalKind
  sourceId: string // LVR-... / COR-... / OT-...
  employeeId: ID<'EMP'>
  summary: string
  submittedAt: ISODateTime
  status: ApprovalStatus
  reviewedBy?: ID<'EMP'>
  reviewedAt?: ISODateTime
  comment?: string
}
