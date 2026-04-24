# PLAN — HRM POC (Ultraplan refined)

> **Stack:** Vite + Vue 3 (TS, `<script setup>`) + shadcn-vue + **Tailwind v3.4.17** + Pinia (persisted) + Vue Router 4 + vue-i18n 9 + vee-validate/zod + vue-chartjs + xlsx + jspdf.
>
> **Target:** Demoable HRM POC for Thai SMEs, inspired by HumanSoft / Bplus / Prosoft HRMI. 6 core modules + ESS + approvals + notifications + settings. TH/EN. Mock data persisted in localStorage + IndexedDB.
>
> **Scope tier:** A+B (~13.5 hrs). A = non-negotiable demo path. B = polish (forms, states, inbox, Thai ID validation). C deferred.
>
> **Status:** Phase 0 (git scaffold) done on commit `3e2340c`. Next: Phase 1 project setup.

---

## § 1. Tech stack (locked)

| หมวด | Library | Note |
|---|---|---|
| Build tool | Vite | — |
| Framework | Vue 3 Composition API | — |
| Language | TypeScript | `strict: true` |
| UI | shadcn-vue | Minimum 18 components (see § 9) |
| CSS | **Tailwind v3.4.17** | v4 rejected — shadcn-vue CLI still targets v3 |
| Routing | vue-router 4 | — |
| State | Pinia + `pinia-plugin-persistedstate` | localStorage for app/auth/notif |
| Large-state storage | `idb-keyval` | IndexedDB for attendance/payroll |
| i18n | vue-i18n 9 | Per-module namespaces; Intl for dates/money |
| Icons | lucide-vue-next | — |
| Forms | vee-validate + @vee-validate/zod + zod | — |
| Tables | @tanstack/vue-table + shadcn table | — |
| Charts | vue-chartjs + chart.js | — |
| Export | xlsx, jspdf, jspdf-autotable | NotoSansThai bundled base64 |
| Toast | shadcn-vue Sonner | — |
| Rand seed | seedrandom | Deterministic mock data |
| Tests | Vitest | ~1 hr of Thai-domain tests |

---

## § 2. Data model (TypeScript)

### Conventions

- **IDs:** prefixed opaque strings — `EMP-00042`, `DEPT-03`, `POS-SR-DEV`, `ATT-2026-04-24-EMP-00042`, `LVR-2026-Q2-0017`, `PAY-2026-04-EMP-00042`, `APR-LVR-0017`, `NTF-00123`.
- **Money:** integer **satang** (1 THB = 100 satang). Never float. Display layer divides by 100.
- **Timestamps:** ISO-8601 strings in storage (`2026-04-24T08:30:00+07:00`). Hydrate to `Date` only in components.
- **Enums:** string literal unions (tree-shakes better, serializes cleanly).
- **Relationships:** foreign keys only; joins happen in composables/getters.
- **Soft delete:** `status` field, no hard deletes.

### Interfaces (in `src/types/`)

```typescript
// common.ts
export type ID<T extends string> = `${T}-${string}`;
export type ISODate = string;       // "2026-04-24"
export type ISODateTime = string;   // "2026-04-24T08:30:00+07:00"
export type Satang = number;        // integer

// user.ts
export type RoleKey = 'hr_admin' | 'manager' | 'employee';

export interface Role {
  key: RoleKey;
  labelTh: string; labelEn: string;
  permissions: PermissionKey[];
}

export interface User {
  id: ID<'USR'>;
  employeeId: ID<'EMP'>;
  username: string;
  passwordHash: string;   // POC-only; never ship
  roleKeys: RoleKey[];
  activeRoleKey: RoleKey;
  lastLoginAt?: ISODateTime;
}

// org.ts
export interface Department {
  id: ID<'DEPT'>;
  nameTh: string; nameEn: string;
  parentId?: ID<'DEPT'>;
  managerId?: ID<'EMP'>;
  costCenter: string;
}

export interface Position {
  id: ID<'POS'>;
  titleTh: string; titleEn: string;
  level: 'entry' | 'junior' | 'senior' | 'lead' | 'manager' | 'director';
  minSalary: Satang; maxSalary: Satang;
}

// employee.ts
export interface Employee {
  id: ID<'EMP'>;
  employeeNo: string;                           // human "EMP00042"
  titleTh: 'นาย' | 'นาง' | 'นางสาว';
  titleEn: 'Mr' | 'Mrs' | 'Ms';
  firstNameTh: string; lastNameTh: string;
  firstNameEn: string; lastNameEn: string;
  nicknameTh?: string;
  thaiId: string;                               // 13 digits, Mod-11 validated
  dob: ISODate;
  gender: 'male' | 'female' | 'other';
  email: string; phone: string;
  address: {
    addressLine: string; tambon: string; amphoe: string;
    changwat: string; zipCode: string;
  };
  departmentId: ID<'DEPT'>;
  positionId: ID<'POS'>;
  managerId?: ID<'EMP'>;
  startDate: ISODate;
  probationEndDate?: ISODate;                   // startDate + 119 days
  status: 'active' | 'inactive' | 'terminated';
  terminationDate?: ISODate;
  terminationReason?: string;
  baseSalary: Satang;
  monthlyAllowances: Satang;
  pvdRate: number;                              // 0.03 – 0.15
  bankCode: 'SCB' | 'KBANK' | 'BBL' | 'KTB' | 'TTB' | 'BAY';
  bankAccount: string;
  taxAllowances: {
    hasSpouse: boolean;
    childrenBornBefore2018: number;
    childrenBornAfter2018: number;
    parents: number;
    disabled: number;
    lifeInsurance: Satang;
    healthInsurance: Satang;
    homeLoanInterest: Satang;
    rmf: Satang;
    ssf: Satang;
  };
  photoUrl?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// shift.ts
export interface Shift {
  id: ID<'SFT'>;
  nameTh: string; nameEn: string;
  startTime: string;                            // "08:30"
  endTime: string;                              // "17:30"
  breakMinutes: number;                         // 60
  lateGraceMinutes: number;                     // 15
  isOvernight: boolean;
}

export interface EmployeeShiftAssignment {
  id: ID<'ESA'>;
  employeeId: ID<'EMP'>;
  shiftId: ID<'SFT'>;
  effectiveFrom: ISODate;
  effectiveTo?: ISODate;
}

// attendance.ts
export type AttendanceMethod = 'gps' | 'wifi' | 'face_mock' | 'fingerprint_mock' | 'manual';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'holiday' | 'weekend';

export interface AttendanceRecord {
  id: ID<'ATT'>;
  employeeId: ID<'EMP'>;
  date: ISODate;
  shiftId: ID<'SFT'>;
  clockInAt?: ISODateTime;
  clockInMethod?: AttendanceMethod;
  clockInLat?: number; clockInLng?: number;
  clockInDistanceMeters?: number;
  clockOutAt?: ISODateTime;
  clockOutMethod?: AttendanceMethod;
  clockOutLat?: number; clockOutLng?: number;
  clockOutDistanceMeters?: number;
  status: AttendanceStatus;
  lateMinutes: number;
  workedMinutes: number;
  otWeekdayMinutes: number;
  otHolidayRegMinutes: number;
  otHolidayExtraMinutes: number;
  correctionRequestId?: ID<'COR'>;
  notes?: string;
}

export interface AttendanceCorrectionRequest {
  id: ID<'COR'>;
  attendanceId: ID<'ATT'>;
  employeeId: ID<'EMP'>;
  proposedClockInAt?: ISODateTime;
  proposedClockOutAt?: ISODateTime;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: ID<'EMP'>;
  reviewedAt?: ISODateTime;
}

// leave.ts
export type LeaveTypeKey = 'sick' | 'personal' | 'vacation' | 'maternity'
  | 'paternity' | 'ordination' | 'unpaid' | 'bereavement';

export interface LeaveType {
  key: LeaveTypeKey;
  nameTh: string; nameEn: string;
  isPaid: boolean;
  annualEntitlementDays: number;
  maxConsecutiveDays?: number;
  requiresAttachment: boolean;
  carryOver: 'none' | 'capped' | 'unlimited';
  carryOverCapDays?: number;
  colorHex: string;
}

export interface LeaveBalance {
  employeeId: ID<'EMP'>;
  year: number;
  leaveTypeKey: LeaveTypeKey;
  entitledDays: number;
  usedDays: number;
  pendingDays: number;
  carriedOverDays: number;
  // remainingDays = entitled + carriedOver - used - pending (computed)
}

export interface LeaveRequest {
  id: ID<'LVR'>;
  employeeId: ID<'EMP'>;
  leaveTypeKey: LeaveTypeKey;
  startDate: ISODate;
  endDate: ISODate;
  totalDays: number;                            // business days, excl weekends/holidays
  isHalfDay: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  reason: string;
  attachmentUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: ISODateTime;
  reviewedBy?: ID<'EMP'>;
  reviewedAt?: ISODateTime;
  reviewerComment?: string;
}

// payroll.ts
export interface PayslipEarnings {
  baseSalary: Satang;
  monthlyAllowances: Satang;
  otWeekday: Satang;
  otHolidayReg: Satang;
  otHolidayExtra: Satang;
  bonus: Satang;
  commission: Satang;
  other: Satang;
  grossTotal: Satang;                           // computed
}

export interface PayslipDeductions {
  sso: Satang;
  pvdEmployee: Satang;
  withholdingTax: Satang;
  unpaidLeaveDeduction: Satang;
  lateDeduction: Satang;
  loanRepayment: Satang;
  other: Satang;
  totalDeductions: Satang;                      // computed
}

export interface Payslip {
  id: ID<'PAY'>;
  employeeId: ID<'EMP'>;
  payrollRunId: ID<'PYR'>;
  periodYear: number;
  periodMonth: number;
  payDate: ISODate;
  employeeSnapshot: {
    employeeNo: string;
    fullNameTh: string; fullNameEn: string;
    departmentName: string; positionName: string;
    bankCode: string; bankAccount: string;
  };
  earnings: PayslipEarnings;
  deductions: PayslipDeductions;
  netPay: Satang;
  workedDays: number; absentDays: number;
  otMinutesTotal: number;
  generatedAt: ISODateTime;
  status: 'draft' | 'finalized' | 'paid';
}

export interface PayrollRun {
  id: ID<'PYR'>;
  periodYear: number; periodMonth: number;
  runDate: ISODateTime;
  runBy: ID<'EMP'>;
  status: 'draft' | 'finalized' | 'paid';
  payslipIds: ID<'PAY'>[];
  totalGross: Satang; totalNet: Satang;
  totalTax: Satang; totalSSO: Satang;
  bankFileGeneratedAt?: ISODateTime;
  notes?: string;
}

// approval.ts
export type ApprovalItemType = 'leave_request' | 'attendance_correction' | 'expense_claim';

export interface ApprovalItem {
  id: ID<'APR'>;
  type: ApprovalItemType;
  refId: ID<'LVR'> | ID<'COR'>;
  requesterId: ID<'EMP'>;
  approverId: ID<'EMP'>;
  submittedAt: ISODateTime;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: ISODateTime;
  reviewerComment?: string;
  summary: { titleTh: string; titleEn: string; subtitle: string };
}

// notification.ts
export type NotificationType =
  | 'leave_submitted' | 'leave_approved' | 'leave_rejected'
  | 'attendance_correction_submitted' | 'attendance_correction_reviewed'
  | 'payslip_available' | 'announcement' | 'birthday' | 'probation_ending';

export interface Notification {
  id: ID<'NTF'>;
  userId: ID<'USR'>;
  type: NotificationType;
  titleTh: string; titleEn: string;
  bodyTh: string; bodyEn: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: ISODateTime;
  readAt?: ISODateTime;
}
```

---

## § 3. RBAC — permission matrix + enforcement

### Permission keys (in `src/lib/permissions.ts`)

```typescript
export type PermissionKey =
  // Employee
  | 'employee.view_all' | 'employee.view_team' | 'employee.view_self'
  | 'employee.create' | 'employee.edit' | 'employee.delete' | 'employee.export'
  // Attendance
  | 'attendance.clock_self'
  | 'attendance.view_all' | 'attendance.view_team' | 'attendance.view_self'
  | 'attendance.correct_any' | 'attendance.correct_self' | 'attendance.approve_corrections'
  // Leave
  | 'leave.apply_self'
  | 'leave.view_all' | 'leave.view_team' | 'leave.view_self'
  | 'leave.approve_team' | 'leave.cancel_any' | 'leave.cancel_self'
  // Payroll
  | 'payroll.run' | 'payroll.finalize' | 'payroll.export_bank_file'
  | 'payslip.view_all' | 'payslip.view_team' | 'payslip.view_self'
  // Approval inbox
  | 'approval.view_all' | 'approval.view_team'
  // Settings
  | 'settings.company' | 'settings.users' | 'settings.profile_self';
```

### Role → permission matrix

| Permission | HR Admin | Manager | Employee |
|---|:---:|:---:|:---:|
| `employee.view_all` | ✅ | | |
| `employee.view_team` | | ✅ | |
| `employee.view_self` | ✅ | ✅ | ✅ |
| `employee.create / edit / delete / export` | ✅ | | |
| `attendance.clock_self` | ✅ | ✅ | ✅ |
| `attendance.view_all` | ✅ | | |
| `attendance.view_team` | | ✅ | |
| `attendance.view_self` | ✅ | ✅ | ✅ |
| `attendance.correct_self` | ✅ | ✅ | ✅ |
| `attendance.approve_corrections` | ✅ | ✅ | |
| `leave.apply_self` | ✅ | ✅ | ✅ |
| `leave.view_all` | ✅ | | |
| `leave.view_team` | | ✅ | |
| `leave.view_self` | ✅ | ✅ | ✅ |
| `leave.approve_team` | ✅ | ✅ | |
| `payroll.run / finalize / export_bank_file` | ✅ | | |
| `payslip.view_all` | ✅ | | |
| `payslip.view_self` | ✅ | ✅ | ✅ |
| `approval.view_all` | ✅ | | |
| `approval.view_team` | | ✅ | |
| `settings.company / users` | ✅ | | |
| `settings.profile_self` | ✅ | ✅ | ✅ |

### Three-layer enforcement

1. **Router** — `meta.requiresPermission` on route definitions, checked in `permissionGuard`. ANY-of semantics for arrays. Redirects to `/forbidden`.
2. **UI** — `<RoleGate :requires="['employee.edit']">...</RoleGate>` wraps buttons and sections. Uses `auth.hasPermission(p)`.
3. **Store actions** — every mutating action calls `useAuthStore().requirePermission('...')` at top. Throws on missing. Prevents DevTools bypass.

**Scope filter** (`view_team`): composable `useScopedQuery` auto-filters by `managerId === currentUser.employeeId` when team-only permission is the highest granted.

---

## § 4. Thai business rules (spec'd in `src/lib/thai-rules.ts`)

1. **Income tax brackets 2026** (annual net income):
   - 0 – 150,000: 0%
   - 150,001 – 300,000: 5%
   - 300,001 – 500,000: 10%
   - 500,001 – 750,000: 15%
   - 750,001 – 1,000,000: 20%
   - 1,000,001 – 2,000,000: 25%
   - 2,000,001 – 5,000,000: 30%
   - 5,000,001+: 35%
2. **Expense deduction**: 50% of income, capped 100,000 THB/yr.
3. **Personal allowances**: self 60k, spouse 60k (non-earning), child pre-2018 15k (+30k if still studying), child post-2018 60k, parent 30k each (aged ≥60, income <30k), disabled dependent 60k, life insurance ≤100k, health insurance ≤25k, home-loan interest ≤100k.
4. **SSO (Social Security)**: 5% of salary, floor 1,650 / ceiling 15,000 THB → **min 82.50, max 750 THB/month**.
5. **OT per LPA §61-63**:
   - Weekday OT: **1.5×** hourly
   - Holiday regular hours: **2.0×**
   - Holiday OT (beyond normal hrs on holiday): **3.0×**
   - Hourly wage = `monthlySalary / 240` (30 days × 8 hrs)
6. **Late**: clock in > `shift.startTime + shift.lateGraceMinutes` (default 15 min). Flagged for HR review; no auto-deduction.
7. **Leave entitlements (Thai LPA)**:
   - Vacation: **6 days/yr** (POC grants at start; prorate mid-year hires `entitled × remainingMonths/12`)
   - Sick: **30 days/yr paid**; medical cert for >3 consecutive days
   - Personal (ลากิจ): **3 days/yr paid**
   - Maternity: 98 days (POC shows as unpaid-by-company)
   - Paternity: 15 days
   - Ordination (บวช): 120 days unpaid
   - Bereavement: 5 days (company policy)
   - Unpaid: unlimited
   - Rollover: **none** for POC.
8. **Unpaid leave deduction**: `(baseSalary / workingDaysInMonth) × unpaidDays` where `workingDaysInMonth = calendar - weekends - Thai holidays`.
9. **Withholding tax**: **annualized monthly** method — compute annual tax, divide by 12. No December true-up (flagged in comments).
10. **Rounding**: compute in satang (integer); tax rounded DOWN to nearest 0.25 THB per Revenue Code §50.
11. **Thai ID Mod-11**: sum of (digit × position weight 13→2) mod 11; check digit = (11 - sum) mod 10.
12. **2026 public holidays** (19 dates) hard-coded in `src/lib/thai-holidays.ts`.

**Deferred:** shift rotation, severance §118, PVD vesting, multi-level approval, RMF/SSF advice.

---

## § 5. Modules + Definition of Done (Tier A+B)

### 🔐 Auth + Layout
- Login with 3 quick-login buttons (HR Admin / Manager / Employee) + full form with validation
- MainLayout: collapsible sidebar + header (search, bell, lang, theme, user menu)
- Role switcher in header (demo only)
- Route guards via `permissionGuard`
- **DoD:**
  - [ ] Quick-login switches persona in <300ms
  - [ ] Logout clears persist; refresh → login
  - [ ] Role switcher updates sidebar AND blocks forbidden routes
  - [ ] Sidebar collapses at <1024px
  - [ ] Dark mode persists across refresh

### 📊 Dashboard
- 4 role-scoped KPI cards (HR=all, Manager=team, Employee=self)
- 7-day attendance trend (line chart)
- Leave-by-type (pie chart)
- Recent activities feed (≥10 events from seed)
- Quick actions: Clock In/Out, Request Leave, View Payslip
- **DoD:**
  - [ ] All 4 KPIs render with role-scoped numbers
  - [ ] Chart renders 7 days
  - [ ] Quick actions navigate correctly
  - [ ] Activity feed shows ≥10 events
  - [ ] Empty state handled

### 👥 Employee
- List: DataTable with sort / filter (dept, status) / search (name, empNo, Thai ID) / paginate 25
- Detail: 4 tabs (Personal / Work / Compensation / History)
- Add/Edit form with zod validation + Thai ID Mod-11 check on blur
- Delete → ConfirmDialog → soft delete (`status=terminated`)
- **DoD:**
  - [ ] Sort on name/dept/startDate works
  - [ ] Thai ID Mod-11 shows red border + message on blur when invalid
  - [ ] Delete goes through confirm dialog
  - [ ] Excel export opens in Excel with TH+EN columns

### ⏰ Attendance
- Clock In/Out with real `navigator.geolocation` + distance from office
- GPS denied → fallback "use mock location" button
- Day states: Not-clocked → Working → Done (one-way)
- My Attendance: calendar + list, color-coded status
- Team Attendance (Manager/HR) with filters
- Correction requests → approval queue
- OT calc: weekday 1.5×, holiday 2× / 3× shown in tooltip
- **DoD:**
  - [ ] Clock in captures lat/lng + distance
  - [ ] GPS denied path reachable
  - [ ] State transitions enforce one-way/day
  - [ ] Calendar color-coded
  - [ ] OT tooltip explains multiplier

### 🏖️ Leave
- My Leaves + 8 leave-type balance cards (entitled/used/remaining)
- Apply form: date range picker disabling weekends/holidays, shows computed business days
- Team Calendar (month view)
- Approval queue (Manager): approve/reject with comment
- Cancel pending → refunds balance
- **DoD:**
  - [ ] Date picker disables weekends + Thai holidays
  - [ ] Balance cards show all 8 types
  - [ ] Submit → appears in both My Leaves + manager queue
  - [ ] Approve → balance updates (optimistic + rollback)
  - [ ] Cancel pending refunds balance

### 💰 Payroll
- My Payslip: month/year + BE/CE toggle, full earnings + deductions breakdown
- Thai tax correctness: matches hand-calc for all 6 seeded salary-band reps
- SSO: min(salary, 15000) × 5%, capped 750
- PDF export with Thai rendering (NotoSansThai base64)
- Payroll Run (HR): period pick → auto-calc from attendance+leave → preview → finalize
- **DoD:**
  - [ ] Payslip shows all earnings + deductions lines
  - [ ] Tax matches hand-calc for 6 reps
  - [ ] SSO capped at 750
  - [ ] PDF opens in Chrome / Preview / Acrobat with Thai chars
  - [ ] Payroll Run produces payslips for all active employees

### 🔔 Notifications + Approval
- Bell icon with unread badge
- Dropdown: 10 most recent; click → navigate + mark read; mark-all-read
- Sonner toast for in-session events
- Global approval inbox: leave + attendance corrections, filter by type/status
- **DoD:**
  - [ ] Bell badge shows unread count
  - [ ] Click notification navigates + marks read
  - [ ] Mark-all-read clears badge
  - [ ] Global inbox merges leave + corrections
  - [ ] Toast appears on new event

### 📱 ESS + Settings
- ESS landing page linking to self-service flows (profile, leave, attendance, payslip)
- Settings: language, theme, company info, profile, password (mock), notification prefs
- **DoD:**
  - [ ] Language toggle changes 100% of visible strings (no key leaks)
  - [ ] Theme toggle covers all pages including charts/tables
  - [ ] Profile edit updates header avatar without refresh

**Tier C (deferred, time permitting):** org chart, Excel/PDF for all exports, employee delete UX polish, birthday widget, tax summary Excel, bank file CSV, expense claims, announcements, shift management, leave types CRUD, <640px mobile.

---

## § 6. Folder structure

```
/Users/peace/Desktop/work/rws/poc/hrm/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                         # shadcn-vue (auto-generated)
│   │   ├── layout/                     # MainLayout, AppSidebar, AppHeader
│   │   └── shared/                     # DataTable, ConfirmDialog, EmptyState, PageHeader, RoleGate
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useNotification.ts
│   │   ├── useGeolocation.ts
│   │   ├── useLocale.ts                # Intl wrappers
│   │   └── useScopedQuery.ts           # RBAC scope filter
│   ├── i18n/
│   │   ├── base/{th,en}.json
│   │   ├── register.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── utils.ts                    # cn() helper
│   │   ├── permissions.ts              # PermissionKey taxonomy + matrix
│   │   ├── thai-rules.ts               # tax / SSO / OT / LPA constants
│   │   ├── thai-id.ts                  # Mod-11 validator
│   │   ├── thai-holidays.ts            # 2026 dates
│   │   ├── seed-names.ts               # hand-curated TH names
│   │   ├── mock-seed.ts                # deterministic seed builder
│   │   ├── seed-data.json              # committed output of mock-seed
│   │   ├── format-money.ts             # Intl currency
│   │   ├── format-date.ts              # Intl date (BE/CE)
│   │   ├── export-excel.ts
│   │   └── export-pdf.ts
│   ├── modules/
│   │   ├── auth/{stores,pages}
│   │   ├── dashboard/pages
│   │   ├── employee/{pages,stores,schemas,locales}
│   │   ├── attendance/{pages,stores,schemas,locales}
│   │   ├── leave/{pages,stores,schemas,locales}
│   │   ├── payroll/{pages,stores,schemas,locales}
│   │   ├── ess/pages
│   │   ├── approval/{pages,stores,locales}
│   │   └── settings/pages
│   ├── router/{index.ts, guards.ts}
│   ├── stores/
│   │   ├── app.ts                      # theme, locale, dateSystem
│   │   └── notification.ts
│   ├── types/
│   │   ├── common.ts
│   │   ├── user.ts
│   │   ├── org.ts
│   │   ├── employee.ts
│   │   ├── shift.ts
│   │   ├── attendance.ts
│   │   ├── leave.ts
│   │   ├── payroll.ts
│   │   ├── approval.ts
│   │   └── notification.ts
│   ├── App.vue
│   ├── main.ts
│   └── style.css                       # Tailwind + shadcn CSS vars
├── tests/
│   ├── thai-tax.test.ts
│   ├── thai-id.test.ts
│   ├── ot-calc.test.ts
│   ├── leave-days.test.ts
│   └── stores/*.test.ts                # one smoke test per store
├── components.json
├── tailwind.config.js                  # v3 config
├── postcss.config.js
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

---

## § 7. Execution plan — 13 phases (vertical-slice-first)

| # | Phase | Hrs | Exit criterion |
|---|---|---|---|
| 1 | Project setup + tooling | 0.5 | `npm run dev/build/lint` green |
| 2 | shadcn-vue minimum install (18 components) | 0.25 | Components registered in `src/components/ui` |
| 3 | Core infrastructure | 2.0 | types + thai-rules + permissions + seed + i18n + router scaffolded |
| 4 | **Vertical slice (end-to-end skeleton)** | 1.5 | Login → layout → all routes stubbed; role/lang/theme toggles all work |
| 5 | Auth + layout polish | 0.75 | Real login UX + notification bell placeholder |
| 6 | Dashboard (real) | 1.0 | KPIs + chart + activities from seed |
| 7 | Employee CRUD (real) | 2.0 | List/detail/form/delete + Thai ID validator |
| 8 | Attendance (real) | 2.0 | GPS clock + my/team views + OT calc |
| 9 | Leave (real) | 1.5 | Apply/cancel + approval queue + balance |
| 10 | Payroll (real) | 2.0 | Payslip + real Thai tax + PDF |
| 11 | Notifications + approval inbox | 1.0 | Bell dropdown + toast + global inbox |
| 12 | Settings + dark mode audit + responsive | 0.75 | All breakpoints + full i18n coverage |
| 13 | Vitest domain tests + demo rehearsal | 0.75 | `npm test` green + full demo dry run |

**Total: 13.5 hrs.** Demoable skeleton at hour 4.5.

### Phase 1 — commands

```bash
cd /Users/peace/Desktop/work/rws/poc/hrm
npm create vite@latest . -- --template vue-ts
npm install
# Tailwind v3
npm install -D tailwindcss@3.4.17 postcss autoprefixer
npx tailwindcss init -p
# shadcn-vue prerequisites
npm install class-variance-authority clsx tailwind-merge
npm install -D @types/node
# Core
npm install vue-router@4 pinia pinia-plugin-persistedstate vue-i18n@9
npm install idb-keyval
npm install lucide-vue-next date-fns
npm install vee-validate @vee-validate/zod zod
npm install @tanstack/vue-table
# Charts + export
npm install vue-chartjs chart.js
npm install xlsx jspdf jspdf-autotable
# Seed
npm install seedrandom
npm install -D @types/seedrandom
# Tests
npm install -D vitest @vue/test-utils happy-dom
# shadcn-vue init
npx shadcn-vue@latest init
```

### Phase 2 — install only 18 components

```bash
npx shadcn-vue@latest add button input label textarea select checkbox
npx shadcn-vue@latest add card dialog alert-dialog
npx shadcn-vue@latest add table tabs badge avatar separator
npx shadcn-vue@latest add dropdown-menu popover sonner
npx shadcn-vue@latest add form calendar skeleton sidebar
```

**Skip:** radio-group, switch, sheet, drawer, progress, command, breadcrumb, tooltip, standalone date-picker.

### Phase 3 — infrastructure deliverables

Write these in order (each de-risks the next):

1. `src/types/*.ts` — all interfaces from § 2
2. `src/lib/permissions.ts` — PermissionKey + role matrix + helpers
3. `src/lib/thai-rules.ts` — tax brackets, SSO, OT, LPA constants, `calculateMonthlyNet()`
4. `src/lib/thai-id.ts` — Mod-11 validator
5. `src/lib/thai-holidays.ts` — 2026 dates
6. `src/lib/seed-names.ts` — TH name pools
7. `src/lib/mock-seed.ts` — seed builder → `src/lib/seed-data.json`
8. `src/lib/format-money.ts`, `format-date.ts` — Intl wrappers
9. `src/i18n/{base/{th,en}.json, register.ts, index.ts}`
10. `src/stores/{app.ts, notification.ts}`
11. `src/modules/auth/stores/auth.ts`
12. `src/router/{index.ts, guards.ts}` — all routes with `meta.requiresPermission`
13. `src/main.ts` + `src/App.vue`

### Phase 4 — vertical slice

- Login page (mock — 3 quick-login buttons, no form validation polish yet)
- MainLayout + AppSidebar + AppHeader + role switcher
- Each top-level route wired with a **stub page**: title + "coming in phase X" card + one realistic placeholder
- Bell stub with empty state
- Theme + language toggles both functional
- `permissionGuard` wired (Employee role → `/employees` redirects to `/ess`)

### Phases 5-12 — swap stubs for real

Each phase replaces stubs with full implementation following the § 5 DoD. Commit at end of each phase.

### Phase 13 — tests + demo rehearsal

- Write Vitest tests (§ 8)
- Record full demo dry-run via screen capture; if it plays end-to-end without manual intervention, shippable

---

## § 8. Testing (Vitest only)

```
tests/thai-tax.test.ts    — 7 tests pinning values across all brackets
tests/thai-id.test.ts     — valid + invalid Mod-11
tests/ot-calc.test.ts     — weekday 1.5×, holiday reg 2×, holiday OT 3×
tests/leave-days.test.ts  — weekend + Thai holiday exclusion
tests/stores/*.test.ts    — 1 smoke test per store (load seed → action → assert state)
```

**Pinned payroll example:**

```typescript
test('Somchai (55k, spouse + 2 kids post-2018) — Apr 2026 net', () => {
  const result = calculateMonthlyNet(seedEmp('EMP-00001'), 2026, 4, attendance, leave);
  expect(result.deductions.sso).toBe(750_00);
  expect(result.deductions.withholdingTax).toBe(/* hand-calced */);
  expect(result.netPay).toBe(/* hand-calced */);
});
```

No Playwright, no component tests. ~1 hr total.

---

## § 9. Seed data spec

| Entity | Count | Notes |
|---|---|---|
| Departments | 7 | HR 4, Finance 5, Sales 12, Marketing 6, IT 10, Ops 15, Prod 8 |
| Positions | 18 | 2-3 per dept + exec tier |
| Employees | **60** | 2 HR Admin, 8 Managers, 50 Employees |
| Shifts | 3 | Standard 8:30-17:30, Early 6:00-15:00, Late 14:00-23:00 |
| Attendance | ~5,400 | 60 × 90 days |
| Leave requests | ~240 | avg 4/employee |
| Leave balances | 480 | 60 × 8 types |
| Payslips | 180 | 60 × 3 months |
| Notifications | ~50 | spread across users |

**Salary bands** (exercise every tax bracket): 20-25k×15, 25-40k×25, 40-65k×12, 65-100k×5, 100-150k×2, 200k×1.

**Hand-crafted 5 edge cases:**
- `EMP-00001` สมชาย ใจดี — HR Admin, 55k, spouse+2 kids post-2018 (canonical hero)
- `EMP-00007` นภา สุวรรณ — IT Manager, 85k, 3 direct reports (approval demo)
- `EMP-00042` วีรพล จันทร์เพ็ญ — Employee, **on probation** (started 60d ago)
- `EMP-00050` ปิยะดา ทองคำ — Employee, **currently on maternity leave**
- `EMP-00060` เอกชัย เศรษฐี — CEO, 200k, 30% bracket

**Deterministic:** `seedrandom('hrm-poc-2026')` + hand-curated names → serialize once to `seed-data.json`. Enables pinned test values.

---

## § 10. Pinia store surfaces (conventions)

- Entity stores: `byId: Record<ID, T>` + `allIds: ID[]` (Redux entity-adapter style)
- Actions always async; call through repositories (pure functions over JSON)
- Getters for joined views; never store joins
- **localStorage** for `app`, `auth`, `notification`
- **IndexedDB (idb-keyval)** for `employee`, `attendance`, `leave`, `payroll` (large data)
- Every mutating action starts with `useAuthStore().requirePermission('...')`

Full signatures for `useEmployeeStore` and `usePayrollStore` spec'd in implementation session (follows same pattern as § 2).

---

## § 11. i18n strategy

- **Per-module namespaces** merged via `registerModuleMessages(ns, th, en)`
- Primary locale `th`, fallback `en`, dev warnings on missing keys
- **Intl APIs** (NOT i18n) for formatting:
  - Dates: `Intl.DateTimeFormat('th-TH-u-ca-buddhist', …)` for BE
  - Currency: `Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' })` → "฿43,842.50"
  - Numbers: `Intl.NumberFormat('th-TH')`
  - Relative time: `Intl.RelativeTimeFormat`
- Wrapped in `useLocale()` composable
- **Not translated via i18n** (data, not UI): employee names, department/position names, leave type names, holiday names — stored as dual `nameTh/nameEn` on entity

Expected i18n JSON size: <400 keys total.

---

## § 12. Verification

1. `npm run build` — zero errors
2. `npm test` — all Vitest tests green
3. `npm run dev` → demo script:
   - Login as HR / Manager / Employee in turn → sidebar changes per role
   - Employee: add → list → edit → detail → delete (full flow)
   - Clock in → clock out → calendar shows entry
   - Apply leave → manager approves → balance decreases
   - Run payroll → view payslip → export PDF (opens in Chrome/Preview)
   - Switch language → all strings change
   - Switch theme → dark mode on all pages
   - Refresh browser → state persists (localStorage + IndexedDB)
4. **Responsive:** tablet (768px) + desktop (1280px). Mobile <640px is Tier C.

---

## § 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| 13.5 hrs still tight | Tier A+B has ~1 hr slack; cut Tier C first; Tier A is non-negotiable |
| Tailwind + shadcn-vue setup | v3.4 chosen (stable path); v4 rejected |
| Thai tax correctness | Vitest pins 6 hand-calculated values; seeded edge cases exercise every bracket |
| Face / Fingerprint are mocks | Labeled "Demo mode" in UI; GPS is real |
| PDF Thai rendering | `jspdf` + NotoSansThai base64-bundled; test in Phase 10 (fail fast) |
| Refresh-test failures | IndexedDB adapter tested in Phase 3 before modules depend on it |
| Role-switcher desync | Permission check in 3 layers (router + UI + store); DevTools bypass blocked |

---

## § 14. Critical files (write first — de-risks everything)

1. `src/types/employee.ts` — data model for 4+ modules
2. `src/lib/thai-rules.ts` — payroll correctness
3. `src/lib/permissions.ts` — RBAC referenced by router/UI/stores
4. `src/lib/mock-seed.ts` + `seed-data.json` — deterministic demos + test fixtures
5. `src/modules/payroll/stores/payroll.ts` — most complex store; pattern for others

---

## § 15. Permissions requested

| Ask | Why |
|---|---|
| `Bash(npm:*)`, `Bash(npx:*)` | Install, scripts, shadcn-vue CLI |
| `Bash(mkdir:*)`, `Bash(ls:*)`, `Bash(pwd)` | Basic FS |
| `Write(*)`, `Edit(*)` inside `/Users/peace/Desktop/work/rws/poc/hrm/**` | Source files |
| npm registry network | `npm install` |

**Not needed:** git push, deploy, out-of-repo edits, other network.

---

## § 16. Sources

- [HumanSoft](https://www.humansoft.co.th/th)
- [Bplus HRM](https://www.businessplus.co.th/Product/hrm-payroll-c008)
- [Prosoft HRMI](https://www.prosofthrmi.com/)
- [shadcn-vue](https://www.shadcn-vue.com/)
- [Tailwind CSS v3](https://v3.tailwindcss.com/)
- [Vite](https://vite.dev/)
- Thai Labour Protection Act §34, §61-63, §118
- Thai Revenue Code §40, §50 (withholding tax)
- Social Security Act B.E. 2533
