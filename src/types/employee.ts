import type { ID, ISODate, ISODateTime, Satang } from './common'

export type TitleTh = 'นาย' | 'นาง' | 'นางสาว'
export type TitleEn = 'Mr' | 'Mrs' | 'Ms'
export type Gender = 'male' | 'female' | 'other'
export type EmployeeStatus = 'active' | 'inactive' | 'terminated'
export type BankCode = 'SCB' | 'KBANK' | 'BBL' | 'KTB' | 'TTB' | 'BAY'

export interface Address {
  addressLine: string
  tambon: string
  amphoe: string
  changwat: string
  zipCode: string
}

export interface TaxAllowances {
  hasSpouse: boolean
  childrenBornBefore2018: number
  childrenBornAfter2018: number
  parents: number
  disabled: number
  lifeInsurance: Satang
  healthInsurance: Satang
  homeLoanInterest: Satang
  rmf: Satang
  ssf: Satang
}

export interface Employee {
  id: ID<'EMP'>
  employeeNo: string // "EMP00042"
  titleTh: TitleTh
  titleEn: TitleEn
  firstNameTh: string
  lastNameTh: string
  firstNameEn: string
  lastNameEn: string
  nicknameTh?: string
  thaiId: string // 13 digits, Mod-11 validated
  dob: ISODate
  gender: Gender
  email: string
  phone: string
  address: Address
  departmentId: ID<'DEPT'>
  positionId: ID<'POS'>
  managerId?: ID<'EMP'>
  startDate: ISODate
  probationEndDate?: ISODate // startDate + 119 days
  status: EmployeeStatus
  terminationDate?: ISODate
  terminationReason?: string
  baseSalary: Satang
  monthlyAllowances: Satang
  pvdRate: number // 0.03 – 0.15
  bankCode: BankCode
  bankAccount: string
  taxAllowances: TaxAllowances
  photoUrl?: string
  createdAt: ISODateTime
  updatedAt: ISODateTime
}
