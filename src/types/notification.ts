import type { ID, ISODateTime } from './common'

export type NotificationKind =
  | 'leave_submitted'
  | 'leave_approved'
  | 'leave_rejected'
  | 'attendance_correction'
  | 'payroll_run'
  | 'payslip_ready'
  | 'general'

export interface Notification {
  id: ID<'NTF'>
  recipientId: ID<'EMP'>
  kind: NotificationKind
  titleTh: string
  titleEn: string
  bodyTh: string
  bodyEn: string
  link?: string // route path to navigate
  createdAt: ISODateTime
  readAt?: ISODateTime
}
