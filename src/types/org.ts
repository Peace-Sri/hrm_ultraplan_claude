import type { ID, Satang } from './common'

export interface Department {
  id: ID<'DEPT'>
  nameTh: string
  nameEn: string
  parentId?: ID<'DEPT'>
  managerId?: ID<'EMP'>
  costCenter: string
}

export type PositionLevel = 'entry' | 'junior' | 'senior' | 'lead' | 'manager' | 'director'

export interface Position {
  id: ID<'POS'>
  titleTh: string
  titleEn: string
  level: PositionLevel
  minSalary: Satang
  maxSalary: Satang
}
