import seedrandom from 'seedrandom'
import type { Department, Position } from '@/types/org'
import type { Employee } from '@/types/employee'
import type { Shift } from '@/types/shift'
import type { LeaveType, LeaveRequest, LeaveBalance } from '@/types/leave'
import type { AttendanceRecord } from '@/types/attendance'
import type { User } from '@/types/user'
import type { Payslip } from '@/types/payroll'
import { toSatang } from '@/types/common'
import { generateValidThaiID } from './thai-id'
import { isHoliday } from './thai-holidays'
import { calculatePayslip, LEAVE_ENTITLEMENT_DAYS } from './thai-rules'
import {
  THAI_MALE_FIRST_NAMES,
  THAI_FEMALE_FIRST_NAMES,
  THAI_LAST_NAMES,
  THAI_DEPARTMENTS,
  THAI_POSITIONS,
  THAI_CHANGWAT_SAMPLES,
} from './seed-names'

const RNG = seedrandom('hrm-poc-2026')
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(RNG() * arr.length)]
const rand = (min: number, max: number) => Math.floor(RNG() * (max - min + 1)) + min

const now = new Date('2026-04-24T00:00:00+07:00').toISOString()

// ═══ DEPARTMENTS ═══
export function buildDepartments(): Department[] {
  return THAI_DEPARTMENTS.map((d) => ({
    id: d.id as Department['id'],
    nameTh: d.th,
    nameEn: d.en,
    costCenter: d.costCenter,
  }))
}

// ═══ POSITIONS ═══
export function buildPositions(): Position[] {
  return THAI_POSITIONS.map((p) => ({
    id: p.id as Position['id'],
    titleTh: p.th,
    titleEn: p.en,
    level: p.level,
    minSalary: toSatang(p.minBaht),
    maxSalary: toSatang(p.maxBaht),
  }))
}

// ═══ SHIFTS ═══
export function buildShifts(): Shift[] {
  return [
    {
      id: 'SFT-DAY',
      nameTh: 'กะเช้า',
      nameEn: 'Day Shift',
      startTime: '08:30',
      endTime: '17:30',
      breakMinutes: 60,
      lateGraceMinutes: 15,
      isOvernight: false,
    },
    {
      id: 'SFT-AFT',
      nameTh: 'กะบ่าย',
      nameEn: 'Afternoon Shift',
      startTime: '14:00',
      endTime: '23:00',
      breakMinutes: 60,
      lateGraceMinutes: 15,
      isOvernight: false,
    },
    {
      id: 'SFT-NGT',
      nameTh: 'กะดึก',
      nameEn: 'Night Shift',
      startTime: '22:00',
      endTime: '07:00',
      breakMinutes: 60,
      lateGraceMinutes: 15,
      isOvernight: true,
    },
  ]
}

// ═══ LEAVE TYPES ═══
export function buildLeaveTypes(): LeaveType[] {
  return [
    { key: 'sick', nameTh: 'ลาป่วย', nameEn: 'Sick', isPaid: true, annualEntitlementDays: 30, requiresAttachment: false, carryOver: 'none', colorHex: '#ef4444' },
    { key: 'personal', nameTh: 'ลากิจ', nameEn: 'Personal', isPaid: true, annualEntitlementDays: 3, requiresAttachment: false, carryOver: 'none', colorHex: '#f59e0b' },
    { key: 'vacation', nameTh: 'ลาพักร้อน', nameEn: 'Vacation', isPaid: true, annualEntitlementDays: 6, requiresAttachment: false, carryOver: 'none', colorHex: '#10b981' },
    { key: 'maternity', nameTh: 'ลาคลอด', nameEn: 'Maternity', isPaid: false, annualEntitlementDays: 98, requiresAttachment: true, carryOver: 'none', colorHex: '#ec4899' },
    { key: 'paternity', nameTh: 'ลาเพื่อดูแลภรรยา', nameEn: 'Paternity', isPaid: false, annualEntitlementDays: 15, requiresAttachment: true, carryOver: 'none', colorHex: '#8b5cf6' },
    { key: 'ordination', nameTh: 'ลาบวช', nameEn: 'Ordination', isPaid: false, annualEntitlementDays: 120, requiresAttachment: true, carryOver: 'none', colorHex: '#f97316' },
    { key: 'bereavement', nameTh: 'ลางานศพ', nameEn: 'Bereavement', isPaid: true, annualEntitlementDays: 5, requiresAttachment: false, carryOver: 'none', colorHex: '#6b7280' },
    { key: 'unpaid', nameTh: 'ลาไม่รับเงิน', nameEn: 'Unpaid', isPaid: false, annualEntitlementDays: 0, requiresAttachment: false, carryOver: 'none', colorHex: '#94a3b8' },
  ]
}

// ═══ EMPLOYEES ═══
function buildOneEmployee(i: number, override?: Partial<Employee>): Employee {
  const isMale = RNG() > 0.5
  const first = isMale ? pick(THAI_MALE_FIRST_NAMES) : pick(THAI_FEMALE_FIRST_NAMES)
  const last = pick(THAI_LAST_NAMES)
  const dept = pick(THAI_DEPARTMENTS)
  const pos = pick(THAI_POSITIONS)
  const addr = pick(THAI_CHANGWAT_SAMPLES)
  const baseSalaryBaht = rand(pos.minBaht, pos.maxBaht)
  const employeeNo = `EMP${String(i + 1).padStart(5, '0')}`
  const id = `EMP-${String(i + 1).padStart(5, '0')}` as Employee['id']
  const startDate = new Date(2020 + rand(0, 6), rand(0, 11), rand(1, 28))
  const dobYear = 1970 + rand(0, 35)
  const dob = new Date(dobYear, rand(0, 11), rand(1, 28))

  return {
    id,
    employeeNo,
    titleTh: isMale ? 'นาย' : Math.random() > 0.5 ? 'นาง' : 'นางสาว',
    titleEn: isMale ? 'Mr' : Math.random() > 0.5 ? 'Mrs' : 'Ms',
    firstNameTh: first.th,
    lastNameTh: last.th,
    firstNameEn: first.en,
    lastNameEn: last.en,
    nicknameTh: first.nickname,
    thaiId: generateValidThaiID(RNG),
    dob: dob.toISOString().slice(0, 10),
    gender: isMale ? 'male' : 'female',
    email: `${first.en.toLowerCase()}.${last.en.toLowerCase()}@acme.co.th`,
    phone: `08${rand(1, 9)}-${String(rand(1000000, 9999999))}`,
    address: {
      addressLine: `${rand(1, 999)}/${rand(1, 99)} ${pick(['ถนนสุขุมวิท', 'ถนนพระราม 4', 'ซอยอารีย์', 'ถนนลาดพร้าว'])}`,
      tambon: addr.tambon,
      amphoe: addr.amphoe,
      changwat: addr.th,
      zipCode: addr.zip,
    },
    departmentId: dept.id as Employee['departmentId'],
    positionId: pos.id as Employee['positionId'],
    startDate: startDate.toISOString().slice(0, 10),
    status: 'active',
    baseSalary: toSatang(baseSalaryBaht),
    monthlyAllowances: toSatang(rand(0, 5000)),
    pvdRate: [0.03, 0.05, 0.07, 0.1, 0.15][rand(0, 4)],
    bankCode: pick(['SCB', 'KBANK', 'BBL', 'KTB', 'TTB', 'BAY'] as const),
    bankAccount: String(rand(1000000000, 9999999999)),
    taxAllowances: {
      hasSpouse: RNG() > 0.6,
      childrenBornBefore2018: rand(0, 2),
      childrenBornAfter2018: rand(0, 2),
      parents: rand(0, 2),
      disabled: 0,
      lifeInsurance: toSatang(rand(0, 30000)),
      healthInsurance: toSatang(rand(0, 10000)),
      homeLoanInterest: toSatang(rand(0, 50000)),
      rmf: 0,
      ssf: 0,
    },
    createdAt: now,
    updatedAt: now,
    ...override,
  }
}

export function buildEmployees(count = 60): Employee[] {
  const emps: Employee[] = []
  // 5 hand-crafted edge-case employees first
  emps.push(
    buildOneEmployee(0, {
      id: 'EMP-00001',
      employeeNo: 'EMP00001',
      firstNameTh: 'สมชาย',
      lastNameTh: 'ใจดี',
      firstNameEn: 'Somchai',
      lastNameEn: 'Jaidee',
      nicknameTh: 'ชาย',
      titleTh: 'นาย',
      titleEn: 'Mr',
      gender: 'male',
      email: 'somchai.jaidee@acme.co.th',
      departmentId: 'DEPT-IT',
      positionId: 'POS-IT-DEV',
      baseSalary: toSatang(35000),
      monthlyAllowances: toSatang(2000),
      pvdRate: 0.05,
    }),
  )
  emps.push(
    buildOneEmployee(1, {
      id: 'EMP-00002',
      employeeNo: 'EMP00002',
      firstNameTh: 'อรทัย',
      lastNameTh: 'รักษ์ไทย',
      firstNameEn: 'Orathai',
      lastNameEn: 'Rakthai',
      nicknameTh: 'อร',
      titleTh: 'นางสาว',
      titleEn: 'Ms',
      gender: 'female',
      email: 'orathai.rakthai@acme.co.th',
      departmentId: 'DEPT-HR',
      positionId: 'POS-HR-MGR',
      baseSalary: toSatang(85000),
      pvdRate: 0.1,
    }),
  )
  emps.push(
    buildOneEmployee(2, {
      id: 'EMP-00003',
      employeeNo: 'EMP00003',
      firstNameTh: 'พิมพ์ใจ',
      lastNameTh: 'สุขสวัสดิ์',
      firstNameEn: 'Pimjai',
      lastNameEn: 'Suksawat',
      nicknameTh: 'พิม',
      titleTh: 'นางสาว',
      titleEn: 'Ms',
      gender: 'female',
      email: 'pimjai.suksawat@acme.co.th',
      departmentId: 'DEPT-IT',
      positionId: 'POS-IT-LEAD',
      managerId: undefined,
      baseSalary: toSatang(120000),
      pvdRate: 0.1,
    }),
  )
  emps.push(
    buildOneEmployee(3, {
      id: 'EMP-00004',
      employeeNo: 'EMP00004',
      firstNameTh: 'ธนา',
      lastNameTh: 'เจริญผล',
      firstNameEn: 'Thana',
      lastNameEn: 'Jaroenphon',
      nicknameTh: 'ธนา',
      titleTh: 'นาย',
      titleEn: 'Mr',
      gender: 'male',
      departmentId: 'DEPT-SAL',
      positionId: 'POS-CEO',
      baseSalary: toSatang(250000),
      pvdRate: 0.15,
      taxAllowances: {
        hasSpouse: true,
        childrenBornBefore2018: 1,
        childrenBornAfter2018: 1,
        parents: 2,
        disabled: 0,
        lifeInsurance: toSatang(100000),
        healthInsurance: toSatang(25000),
        homeLoanInterest: toSatang(100000),
        rmf: 0,
        ssf: 0,
      },
    }),
  )
  // Probation employee
  const probationStart = new Date('2026-02-15')
  emps.push(
    buildOneEmployee(4, {
      id: 'EMP-00005',
      employeeNo: 'EMP00005',
      firstNameTh: 'นพพร',
      lastNameTh: 'ทองสุข',
      firstNameEn: 'Nopporn',
      lastNameEn: 'Thongsuk',
      nicknameTh: 'นพ',
      gender: 'female',
      titleTh: 'นางสาว',
      titleEn: 'Ms',
      startDate: probationStart.toISOString().slice(0, 10),
      probationEndDate: new Date(probationStart.getTime() + 119 * 86400000)
        .toISOString()
        .slice(0, 10),
      baseSalary: toSatang(22000),
    }),
  )
  // Generate the rest with some linking to manager #2 (Orathai) and #3 (Pimjai)
  for (let i = 5; i < count; i++) {
    const managerId =
      i % 2 === 0 ? ('EMP-00002' as Employee['id']) : ('EMP-00003' as Employee['id'])
    emps.push(buildOneEmployee(i, { managerId }))
  }
  return emps
}

// ═══ ATTENDANCE HISTORY ═══
export function buildAttendance(employees: Employee[], daysBack = 30): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  const today = new Date('2026-04-24T00:00:00+07:00')
  for (let d = daysBack; d >= 0; d--) {
    const date = new Date(today.getTime() - d * 86400000)
    const iso = date.toISOString().slice(0, 10)
    const dow = date.getDay()
    const isWeekend = dow === 0 || dow === 6
    const isHol = isHoliday(iso)

    for (const emp of employees) {
      // 5% absent, 10% late, 3% on leave, rest present
      const roll = RNG()
      let status: AttendanceRecord['status'] = 'present'
      let lateMinutes = 0
      let workedMinutes = 480
      let otWeekdayMinutes = 0
      const otHolidayRegMinutes = 0
      const otHolidayExtraMinutes = 0
      let clockInAt: string | undefined
      let clockOutAt: string | undefined
      let clockInMethod: AttendanceRecord['clockInMethod']

      if (isWeekend) {
        status = 'weekend'
      } else if (isHol) {
        status = 'holiday'
      } else if (roll < 0.03) {
        status = 'leave'
      } else if (roll < 0.08) {
        status = 'absent'
      } else {
        const shiftStart = new Date(date)
        shiftStart.setHours(8, 30, 0, 0)
        if (roll < 0.18) {
          // late
          lateMinutes = rand(5, 45)
          status = lateMinutes > 15 ? 'late' : 'present'
          shiftStart.setMinutes(shiftStart.getMinutes() + lateMinutes)
        }
        clockInAt = shiftStart.toISOString()
        clockInMethod = pick(['gps', 'wifi', 'fingerprint_mock'] as const)

        const shiftEnd = new Date(shiftStart)
        shiftEnd.setHours(17, rand(20, 55), 0, 0)
        const otMin = Math.max(0, (shiftEnd.getTime() - (shiftStart.getTime() + 9 * 3600000)) / 60000)
        otWeekdayMinutes = Math.floor(otMin)
        clockOutAt = shiftEnd.toISOString()
        workedMinutes = Math.floor((shiftEnd.getTime() - shiftStart.getTime()) / 60000) - 60
      }

      records.push({
        id: `ATT-${iso}-${emp.id}` as AttendanceRecord['id'],
        employeeId: emp.id,
        date: iso,
        shiftId: 'SFT-DAY',
        clockInAt,
        clockInMethod,
        clockOutAt,
        clockOutMethod: clockInMethod,
        status,
        lateMinutes,
        workedMinutes,
        otWeekdayMinutes,
        otHolidayRegMinutes,
        otHolidayExtraMinutes,
      })
    }
  }
  return records
}

// ═══ LEAVE REQUESTS ═══
export function buildLeaveRequests(employees: Employee[]): LeaveRequest[] {
  const leaves: LeaveRequest[] = []
  // Generate some historical and pending leaves
  const types = ['sick', 'personal', 'vacation'] as const
  const today = new Date('2026-04-24T00:00:00+07:00')
  let counter = 1
  for (const emp of employees) {
    const numLeaves = rand(0, 4)
    for (let i = 0; i < numLeaves; i++) {
      const daysAgo = rand(-30, 90) // some future, some past
      const start = new Date(today.getTime() - daysAgo * 86400000)
      const duration = rand(1, 3)
      const end = new Date(start.getTime() + (duration - 1) * 86400000)
      const type = pick(types)
      const isPast = daysAgo > 0
      const status: LeaveRequest['status'] = isPast
        ? pick(['approved', 'approved', 'rejected'] as const)
        : pick(['pending', 'pending', 'approved'] as const)

      leaves.push({
        id: `LVR-2026-${String(counter++).padStart(5, '0')}` as LeaveRequest['id'],
        employeeId: emp.id,
        leaveTypeKey: type,
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        totalDays: duration,
        isHalfDay: false,
        reason: pick([
          'ไม่สบาย',
          'ธุระครอบครัว',
          'พักผ่อนกับครอบครัว',
          'ธุระส่วนตัว',
          'ไปพบหมอ',
        ]),
        status,
        submittedAt: new Date(start.getTime() - 2 * 86400000).toISOString(),
        reviewedAt: status !== 'pending' ? new Date(start.getTime() - 1 * 86400000).toISOString() : undefined,
        reviewedBy: status !== 'pending' ? emp.managerId : undefined,
      })
    }
  }
  return leaves
}

// ═══ LEAVE BALANCES ═══
export function buildLeaveBalances(employees: Employee[]): LeaveBalance[] {
  const balances: LeaveBalance[] = []
  const year = 2026
  for (const emp of employees) {
    for (const [key, days] of Object.entries(LEAVE_ENTITLEMENT_DAYS)) {
      if (key === 'unpaid') continue
      balances.push({
        employeeId: emp.id,
        year,
        leaveTypeKey: key as keyof typeof LEAVE_ENTITLEMENT_DAYS,
        entitledDays: days,
        usedDays: rand(0, Math.min(days / 2, 5)),
        pendingDays: 0,
        carriedOverDays: 0,
      })
    }
  }
  return balances
}

// ═══ PAYSLIPS (3 months history) ═══
export function buildPayslips(
  employees: Employee[],
  attendance: AttendanceRecord[],
): Payslip[] {
  const payslips: Payslip[] = []
  const now = new Date('2026-04-24T00:00:00+07:00').toISOString()
  for (const month of [2, 3, 4]) {
    const period = `2026-${String(month).padStart(2, '0')}-01`
    for (const emp of employees) {
      const monthAttendance = attendance.filter(
        (a) => a.employeeId === emp.id && a.date.startsWith(`2026-${String(month).padStart(2, '0')}`),
      )
      const otWeekdayMin = monthAttendance.reduce((s, a) => s + a.otWeekdayMinutes, 0)
      const calc = calculatePayslip({
        employee: emp,
        year: 2026,
        month,
        otWeekdayMin,
        otHolidayRegMin: 0,
        otHolidayExtraMin: 0,
        unpaidDays: 0,
      })
      payslips.push({
        id: `PAY-2026-${String(month).padStart(2, '0')}-${emp.id}` as Payslip['id'],
        employeeId: emp.id,
        payrollRunId: `RUN-2026-${String(month).padStart(2, '0')}` as Payslip['payrollRunId'],
        period,
        year: 2026,
        month,
        workingDaysInMonth: calc.workingDays,
        paidDays: calc.workingDays,
        unpaidLeaveDays: 0,
        earnings: {
          baseSalary: calc.earnings.baseSalary,
          monthlyAllowances: calc.earnings.monthlyAllowances,
          otWeekday: calc.earnings.otWeekday,
          otHolidayReg: calc.earnings.otHolidayReg,
          otHolidayExtra: calc.earnings.otHolidayExtra,
          bonus: calc.earnings.bonus,
          otherEarnings: 0,
          total: calc.earnings.total,
        },
        deductions: {
          sso: calc.deductions.sso,
          pvd: calc.deductions.pvd,
          withholdingTax: calc.deductions.tax,
          absence: calc.deductions.absence,
          loan: 0,
          other: 0,
          total: calc.deductions.total,
        },
        netPay: calc.netPay,
        issuedAt: now,
      })
    }
  }
  return payslips
}

// ═══ USERS (for quick-login) ═══
export function buildUsers(): User[] {
  return [
    {
      id: 'USR-HR01',
      employeeId: 'EMP-00002', // Orathai - HR Manager
      username: 'hr',
      passwordHash: 'poc-hash',
      roleKeys: ['hr_admin'],
      activeRoleKey: 'hr_admin',
    },
    {
      id: 'USR-MGR01',
      employeeId: 'EMP-00003', // Pimjai - IT Lead
      username: 'manager',
      passwordHash: 'poc-hash',
      roleKeys: ['manager'],
      activeRoleKey: 'manager',
    },
    {
      id: 'USR-EMP01',
      employeeId: 'EMP-00001', // Somchai - Developer
      username: 'employee',
      passwordHash: 'poc-hash',
      roleKeys: ['employee'],
      activeRoleKey: 'employee',
    },
  ]
}
