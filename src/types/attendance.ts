import type { ID, ISODate, ISODateTime } from './common'

export type AttendanceMethod =
  | 'gps'
  | 'wifi'
  | 'face_mock'
  | 'fingerprint_mock'
  | 'manual'

export type AttendanceStatus =
  | 'present'
  | 'late'
  | 'absent'
  | 'leave'
  | 'holiday'
  | 'weekend'

export interface AttendanceRecord {
  id: ID<'ATT'>
  employeeId: ID<'EMP'>
  date: ISODate
  shiftId: ID<'SFT'>
  clockInAt?: ISODateTime
  clockInMethod?: AttendanceMethod
  clockInLat?: number
  clockInLng?: number
  clockInDistanceMeters?: number
  clockOutAt?: ISODateTime
  clockOutMethod?: AttendanceMethod
  clockOutLat?: number
  clockOutLng?: number
  clockOutDistanceMeters?: number
  status: AttendanceStatus
  lateMinutes: number
  workedMinutes: number
  otWeekdayMinutes: number
  otHolidayRegMinutes: number
  otHolidayExtraMinutes: number
  correctionRequestId?: ID<'COR'>
  notes?: string
}

export interface AttendanceCorrectionRequest {
  id: ID<'COR'>
  attendanceId: ID<'ATT'>
  employeeId: ID<'EMP'>
  proposedClockInAt?: ISODateTime
  proposedClockOutAt?: ISODateTime
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: ID<'EMP'>
  reviewedAt?: ISODateTime
}
