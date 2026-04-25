import type { ID, ISODate, ISODateTime, Satang } from './common'

export type TitleTh = 'นาย' | 'นาง' | 'นางสาว'
export type TitleEn = 'Mr' | 'Mrs' | 'Ms'
export type Gender = 'male' | 'female' | 'other'
export type EmployeeStatus = 'active' | 'inactive' | 'terminated'
export type BankCode = 'SCB' | 'KBANK' | 'BBL' | 'KTB' | 'TTB' | 'BAY'
export type Nationality = 'TH' | 'MM' | 'KH' | 'LA' | 'VN' | 'OTHER'
export type VisaType = 'Non-B' | 'Non-ED' | 'Non-O' | 'LTR' | 'Smart' | 'Other'

export interface ForeignDocuments {
  workPermitNo?: string // บัตรชมพู / WP
  workPermitExpiry?: string // ISODate
  passportNo?: string
  passportExpiry?: string // ISODate
  visaType?: VisaType
  visaExpiry?: string // ISODate
  entryDate?: string // ISODate เข้าประเทศ
}

export type EducationLevel =
  | 'primary'
  | 'secondary'
  | 'vocational'
  | 'bachelor'
  | 'master'
  | 'doctorate'

export interface EmergencyContact {
  name: string
  relationship: string // ภรรยา/สามี/บิดา/มารดา/พี่/น้อง/เพื่อน
  phone: string
}

export interface Education {
  level: EducationLevel
  institution: string
  field?: string
  graduationYear?: number
}

export interface PreviousEmployer {
  company: string
  position: string
  startDate: string // ISODate
  endDate: string // ISODate
}

export interface OnboardingDocs {
  idCardCopy: boolean // สำเนาบัตรประชาชน
  houseRegCopy: boolean // สำเนาทะเบียนบ้าน
  educationCert: boolean // สำเนาวุฒิการศึกษา
  photo: boolean // รูปถ่าย
  medicalCert: boolean // ใบรับรองแพทย์
  drivingLicense: boolean // ใบขับขี่
  bankBookCopy: boolean // สำเนาหน้าสมุดบัญชี
}

export interface Equipment {
  laptop?: string // model / serial
  badge?: string // เลขบัตรพนักงาน
  phone?: string
  other?: string[]
}

export interface OnboardingChecklist {
  contractSigned: boolean // ลงนามสัญญาจ้าง
  safetyTraining: boolean // อบรมความปลอดภัย
  itSetup: boolean // IT setup (email, system access)
  pvdEnrolled: boolean // ลงทะเบียนกองทุนสำรองเลี้ยงชีพ
  ssoEnrolled: boolean // ลงทะเบียนประกันสังคม
  bankAccountSetup: boolean // เปิดบัญชีรับเงินเดือน
}

export interface OnboardingInfo {
  emergencyContact?: EmergencyContact
  education?: Education
  previousEmployers?: PreviousEmployer[]
  documents: OnboardingDocs
  equipment?: Equipment
  checklist: OnboardingChecklist
  notes?: string
}

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
  nationality: Nationality
  thaiId?: string // 13 digits, Mod-11 validated (required if nationality === 'TH')
  foreign?: ForeignDocuments // required if nationality !== 'TH'
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
  onboarding?: OnboardingInfo
  photoUrl?: string
  createdAt: ISODateTime
  updatedAt: ISODateTime
}
