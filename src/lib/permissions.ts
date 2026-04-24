import type { RoleKey } from '@/types/user'

export type PermissionKey =
  // Employee
  | 'employee.view_all'
  | 'employee.view_team'
  | 'employee.view_self'
  | 'employee.create'
  | 'employee.edit'
  | 'employee.delete'
  | 'employee.export'
  // Attendance
  | 'attendance.clock_self'
  | 'attendance.view_all'
  | 'attendance.view_team'
  | 'attendance.view_self'
  | 'attendance.correct_any'
  | 'attendance.correct_self'
  | 'attendance.approve_corrections'
  // Leave
  | 'leave.apply_self'
  | 'leave.view_all'
  | 'leave.view_team'
  | 'leave.view_self'
  | 'leave.approve_team'
  | 'leave.cancel_any'
  | 'leave.cancel_self'
  // Payroll
  | 'payroll.run'
  | 'payroll.finalize'
  | 'payroll.export_bank_file'
  | 'payslip.view_all'
  | 'payslip.view_team'
  | 'payslip.view_self'
  // Approval inbox
  | 'approval.view_all'
  | 'approval.view_team'
  // Settings
  | 'settings.company'
  | 'settings.users'
  | 'settings.profile_self'

export const HR_ADMIN_PERMISSIONS: PermissionKey[] = [
  'employee.view_all',
  'employee.view_self',
  'employee.create',
  'employee.edit',
  'employee.delete',
  'employee.export',
  'attendance.clock_self',
  'attendance.view_all',
  'attendance.view_self',
  'attendance.correct_any',
  'attendance.correct_self',
  'attendance.approve_corrections',
  'leave.apply_self',
  'leave.view_all',
  'leave.view_self',
  'leave.approve_team',
  'leave.cancel_any',
  'leave.cancel_self',
  'payroll.run',
  'payroll.finalize',
  'payroll.export_bank_file',
  'payslip.view_all',
  'payslip.view_self',
  'approval.view_all',
  'settings.company',
  'settings.users',
  'settings.profile_self',
]

export const MANAGER_PERMISSIONS: PermissionKey[] = [
  'employee.view_team',
  'employee.view_self',
  'attendance.clock_self',
  'attendance.view_team',
  'attendance.view_self',
  'attendance.correct_self',
  'attendance.approve_corrections',
  'leave.apply_self',
  'leave.view_team',
  'leave.view_self',
  'leave.approve_team',
  'leave.cancel_self',
  'payslip.view_self',
  'approval.view_team',
  'settings.profile_self',
]

export const EMPLOYEE_PERMISSIONS: PermissionKey[] = [
  'employee.view_self',
  'attendance.clock_self',
  'attendance.view_self',
  'attendance.correct_self',
  'leave.apply_self',
  'leave.view_self',
  'leave.cancel_self',
  'payslip.view_self',
  'settings.profile_self',
]

export const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  hr_admin: HR_ADMIN_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  employee: EMPLOYEE_PERMISSIONS,
}

export function hasPermission(
  userPermissions: PermissionKey[],
  required: PermissionKey | PermissionKey[],
): boolean {
  const reqs = Array.isArray(required) ? required : [required]
  return reqs.some((r) => userPermissions.includes(r))
}
