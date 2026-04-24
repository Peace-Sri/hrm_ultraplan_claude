import type { ID, ISODateTime } from './common'
import type { PermissionKey } from '@/lib/permissions'

export type RoleKey = 'hr_admin' | 'manager' | 'employee'

export interface Role {
  key: RoleKey
  labelTh: string
  labelEn: string
  permissions: PermissionKey[]
}

export interface User {
  id: ID<'USR'>
  employeeId: ID<'EMP'>
  username: string
  passwordHash: string // POC only
  roleKeys: RoleKey[]
  activeRoleKey: RoleKey
  lastLoginAt?: ISODateTime
}
