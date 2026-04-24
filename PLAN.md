# Plan v2 (Refined): HRM POC — Vue 3 + Vite + shadcn-vue + Tailwind

> **Refined จาก v1** โดยรวม feedback จาก 3 specialized agents (Architecture, Scope/Feasibility, Thai HR Domain) — เพื่อความแม่นยำและ realistic
>
> **⚠️ หมายเหตุ:** การ refine นี้ **ไม่ใช่ Ultraplan ของ Anthropic** แต่เป็น multi-agent review workflow ที่ทำใน CLI — ได้ผลลัพธ์คล้ายแต่ไม่ใช่ product เดียวกัน

## 📝 สรุปการเปลี่ยนแปลงจาก v1

| ประเด็น | v1 | v2 (Refined) | เหตุผล |
|---|---|---|---|
| Tailwind | v4 | **v3.4.x** | v4 ใหม่เกินไป — ลด debug risk ใน POC |
| State storage | localStorage ทุก store | **localStorage + IndexedDB แบบ selective** | Attendance × 90 วัน × 50 คน ใหญ่เกิน localStorage 5-10MB |
| Excel | `xlsx` | **`exceljs`** | `xlsx` มี known CVE |
| API pattern | Store เขียนตรง mock | **Repository pattern + `src/lib/api/`** | เปลี่ยน backend ภายหลังไม่ต้อง rewrite store |
| i18n | Monolithic `th.json` | **Per-module locales + lazy merge** | 1,200+ keys ในไฟล์เดียวไม่ scale |
| Scope | 6 modules full (10-15 ชม.) | **MVP cut 15-20 ชม. + deferred list** | Original scope ~30-45 ชม. จริงๆ |
| Thai tax | "simplified" | **8-bracket progressive ถูกต้อง + deductions ครบ** | Domain accuracy สำคัญ |
| OT rates | Single multiplier | **Weekday 1.5x / Holiday 2x / Holiday OT 3x** | ตรงตาม กม. แรงงานไทย |
| SS cap | ไม่ระบุ | **MIN(salary, 15,000) × 5% = max 750฿** | ตรง กฎ ประกันสังคม |
| Missing infra | หลายรายการ | **เพิ่ม ESLint/Prettier/ErrorBoundary/logger/guards** | Production-grade baseline |

---

## Context
สร้างโปรแกรม HRM (Human Resource Management) POC ในโฟลเดอร์
`/Users/peace/Desktop/work/rws/poc/hrm`
ได้แรงบันดาลใจจาก **HumanSoft + Bplus HRM + Prosoft HRMI**

**เป้าหมาย:**
- Scope: **MVP Core Modules** (ทำ 7 flow หลักให้เสร็จสมบูรณ์ ก่อนเพิ่ม feature อื่น)
- **ทุกปุ่มกดได้ + ทุก action ทำงาน** (no dead buttons)
- รองรับภาษา TH + EN
- Mock data ผ่าน Pinia + persist แบบ selective
- **Thai HR domain ถูกต้อง** (tax, SS, OT, leave per กม.แรงงาน)

---

## 🛠️ Tech Stack (Final Versions)

```json
{
  "dependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^2.3.0",
    "pinia-plugin-persistedstate": "^4.1.3",
    "vue-i18n": "^9.14.2",
    "@tanstack/vue-table": "^8.21.2",
    "vue-chartjs": "^5.3.2",
    "chart.js": "^4.4.7",
    "vee-validate": "^4.15.0",
    "@vee-validate/zod": "^4.15.0",
    "zod": "^3.24.1",
    "exceljs": "^4.4.0",
    "jspdf": "^2.5.2",
    "jspdf-autotable": "^3.8.4",
    "lucide-vue-next": "^0.468.0",
    "date-fns": "^4.1.0",
    "idb-keyval": "^6.2.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "vite": "^6.0.7",
    "typescript": "~5.6.3",
    "@vitejs/plugin-vue": "^5.2.1",
    "vue-tsc": "^2.2.0",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20",
    "@types/node": "^22.10.5",
    "eslint": "^9.17.0",
    "eslint-plugin-vue": "^9.32.0",
    "@vue/eslint-config-typescript": "^14.2.0",
    "prettier": "^3.4.2"
  }
}
```

**Node:** 20.x (pin via `.nvmrc`)

---

## 🎯 Scope: MVP (15-20 ชม.) + Deferred List

### ✅ MVP — Demo-Critical Flows (จะ build ให้เสร็จสมบูรณ์)

| # | Flow | Persona | Screens |
|---|---|---|---|
| 1 | **Login + Role Switcher** | ทุก role | LoginPage, user menu, role badge |
| 2 | **Dashboard** | ทุก role | KPI cards (4), 1 chart (attendance trend), recent activity |
| 3 | **Employee CRUD** | HR | List (sort/filter/search/pagination), Detail, Add/Edit form (single step, ไม่ใช่ wizard), Delete |
| 4 | **Clock In/Out (GPS)** | Employee | Clock page (GPS real), My Attendance list |
| 5 | **Apply Leave → Approve** | Employee → Manager | Apply form, My Leaves, Approval Queue, Approve/Reject |
| 6 | **Payslip + PDF** | Employee | My Payslip view, Historical list, Download PDF (with Thai tax/SS/PVD คำนวณถูก) |
| 7 | **Notifications + Approval Inbox** | ทุก role | Bell dropdown, Toast, Global Approval Inbox |

### 🗓️ Demo Script (7 screens flawless)
```
1. Login เป็น Employee (สมชาย)
   → 2. Clock In (GPS โชว์พิกัด + office distance)
   → 3. Apply Leave (ลาป่วย 1 วัน)
4. สลับ role เป็น Manager
   → 5. Approval Queue → Approve ใบลา
6. สลับ role เป็น HR
   → 7. ดู Employee List + Download Payslip PDF
```

### 🔄 Supporting (ต้องทำครบเพื่อให้ flow MVP ทำงาน)
- Auth store + role-based menu
- Notification store + Toast system
- i18n TH/EN ทุกหน้า
- Theme light/dark + persist
- Router guards ตาม role
- Seed data (50 พนักงาน × 90 วัน attendance/leave + 3 เดือน payroll)
- Global error handler
- Loading/Empty/Error states ทุกหน้า
- Confirmation dialogs ทุก destructive action

### ⏸️ Deferred (เก็บไว้ทำต่อหลัง MVP ผ่าน review)
- Multi-step Employee wizard (ใช้ single form ก่อน)
- Organization Chart tree view
- Face Recognition + Fingerprint mock
- Shift Management + Roster Calendar
- Leave Types CRUD settings
- Tax Summary ภ.ง.ด.1 export
- Payroll Run full UI (batch calculate for all employees)
- Excel Import
- Expense Claims
- Bulk actions + bulk delete
- Company settings, notification preferences
- Announcements
- Organization structure (multi-level)
- Career Path

---

## 🇹🇭 Thai HR Domain Layer (NEW — Critical)

### `src/lib/thai-tax.ts` — Progressive tax engine (2026 brackets)

```typescript
export const TAX_BRACKETS = [
  { min: 0,         max: 150_000,   rate: 0    },
  { min: 150_001,   max: 300_000,   rate: 0.05 },
  { min: 300_001,   max: 500_000,   rate: 0.10 },
  { min: 500_001,   max: 750_000,   rate: 0.15 },
  { min: 750_001,   max: 1_000_000, rate: 0.20 },
  { min: 1_000_001, max: 2_000_000, rate: 0.25 },
  { min: 2_000_001, max: 5_000_000, rate: 0.30 },
  { min: 5_000_001, max: Infinity,  rate: 0.35 },
];

export const ALLOWANCES = {
  self:            60_000,
  spouse:          60_000,
  childFirstBorn:  30_000,
  childSecondPlus: 60_000,   // born ≥ 2018
  parent:          30_000,
  disabled:        60_000,
};

export const EXPENSE_DEDUCTION = { rate: 0.5, cap: 100_000 };
export const SSO = { rate: 0.05, baseFloor: 1_650, baseCeiling: 15_000 };

export function calculateMonthlyNet(emp, month, attendance, leave) {
  const grossEarnings = emp.baseSalary
    + sumOT(attendance, { weekday: 1.5, holidayReg: 2, holidayOT: 3 })
    + emp.monthlyAllowances
    + (month.bonus || 0);

  const sso = Math.min(emp.baseSalary, SSO.baseCeiling) * SSO.rate;   // max 750
  const pvd = emp.baseSalary * emp.pvdRate;                            // 0.03–0.15

  // Annualized tax calculation
  const annualGross = grossEarnings * 12;
  const expenseDed = Math.min(annualGross * EXPENSE_DEDUCTION.rate, EXPENSE_DEDUCTION.cap);
  const personalDed = ALLOWANCES.self
    + (emp.allowances.spouse ? ALLOWANCES.spouse : 0)
    + emp.allowances.childrenBornBefore2018 * ALLOWANCES.childFirstBorn
    + emp.allowances.childrenBornAfter2018 * ALLOWANCES.childSecondPlus
    + emp.allowances.parents * ALLOWANCES.parent
    + (emp.allowances.disabled * ALLOWANCES.disabled)
    + (sso * 12) + (pvd * 12)
    + Math.min(emp.allowances.lifeInsurance || 0, 100_000)
    + Math.min(emp.allowances.homeLoanInterest || 0, 100_000);

  const taxable = Math.max(0, annualGross - expenseDed - personalDed);
  const annualTax = applyBrackets(taxable, TAX_BRACKETS);
  const monthlyTax = annualTax / 12;

  const absenceDed = (emp.baseSalary / workingDaysInMonth(month)) * countUnpaidLeave(leave);

  return {
    grossEarnings,
    deductions: { sso, pvd, tax: monthlyTax, absence: absenceDed },
    netPay: grossEarnings - sso - pvd - monthlyTax - absenceDed,
  };
}
```

### `src/lib/thai-id.ts` — Mod-11 checksum validator

```typescript
export function validateThaiID(id: string): boolean {
  const d = id.replace(/-/g, '').split('').map(Number);
  if (d.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += d[i] * (13 - i);
  return ((11 - (sum % 11)) % 10) === d[12];
}

export function formatThaiID(id: string): string {
  const d = id.replace(/-/g, '');
  return `${d[0]}-${d.slice(1,5)}-${d.slice(5,10)}-${d.slice(10,12)}-${d[12]}`;
}

export function generateValidThaiID(): string { /* for seed data */ }
```

### `src/lib/thai-date.ts` — Buddhist Era helper

```typescript
export const toBE = (ce: number) => ce + 543;
export const fromBE = (be: number) => be - 543;
export function formatDate(date: Date, useBE = false, locale = 'th'): string { /* ... */ }
```

### `src/lib/thai-holidays.ts` — Public holidays 2026

```typescript
export const THAI_HOLIDAYS_2026 = [
  { date: '2026-01-01', name: 'วันขึ้นปีใหม่', nameEn: 'New Year' },
  { date: '2026-02-13', name: 'วันมาฆบูชา', nameEn: 'Makha Bucha' },
  { date: '2026-04-06', name: 'วันจักรี', nameEn: 'Chakri Day' },
  { date: '2026-04-13', name: 'วันสงกรานต์', nameEn: 'Songkran' },
  { date: '2026-04-14', name: 'วันสงกรานต์', nameEn: 'Songkran' },
  { date: '2026-04-15', name: 'วันสงกรานต์', nameEn: 'Songkran' },
  { date: '2026-05-01', name: 'วันแรงงาน', nameEn: 'Labour Day' },
  { date: '2026-05-04', name: 'วันฉัตรมงคล', nameEn: 'Coronation Day' },
  { date: '2026-05-11', name: 'วันวิสาขบูชา', nameEn: 'Visakha Bucha' },
  { date: '2026-06-03', name: 'วันเฉลิมพระชนมพรรษา พระราชินี', nameEn: 'Queen\'s Birthday' },
  { date: '2026-07-10', name: 'วันอาสาฬหบูชา', nameEn: 'Asahna Bucha' },
  { date: '2026-07-11', name: 'วันเข้าพรรษา', nameEn: 'Khao Phansa' },
  { date: '2026-07-28', name: 'วันเฉลิมพระชนมพรรษา ร.10', nameEn: 'King\'s Birthday' },
  { date: '2026-08-12', name: 'วันแม่', nameEn: 'Mother\'s Day' },
  { date: '2026-10-13', name: 'วันคล้ายสวรรคต ร.9', nameEn: 'King Bhumibol Memorial' },
  { date: '2026-10-23', name: 'วันปิยมหาราช', nameEn: 'Chulalongkorn Day' },
  { date: '2026-12-05', name: 'วันพ่อ', nameEn: 'Father\'s Day' },
  { date: '2026-12-10', name: 'วันรัฐธรรมนูญ', nameEn: 'Constitution Day' },
  { date: '2026-12-31', name: 'วันสิ้นปี', nameEn: 'NYE' },
];
```

### Employee schema additions (Thai-specific)

```typescript
export interface Employee {
  id: string;
  titleTh: 'นาย' | 'นาง' | 'นางสาว';
  titleEn: 'Mr' | 'Mrs' | 'Ms';
  firstNameTh: string; lastNameTh: string;
  firstNameEn: string; lastNameEn: string;
  nicknameTh?: string;                   // ชื่อเล่น — Thai HR standard
  thaiId: string;                         // validated 13-digit
  dob: Date;
  isProbation: boolean;                   // < 119 days
  probationEndDate?: Date;

  baseSalary: number;
  monthlyAllowances: number;
  pvdRate: number;                        // 0.03–0.15
  bankCode: 'SCB' | 'KBANK' | 'BBL' | 'KTB' | 'TTB' | 'BAY';
  bankAccount: string;                    // 10-digit

  allowances: {
    spouse: boolean;
    childrenBornBefore2018: number;
    childrenBornAfter2018: number;
    parents: number;
    disabled: number;
    lifeInsurance?: number;               // cap 100k
    homeLoanInterest?: number;            // cap 100k
  };

  departmentId: string;
  positionId: string;
  managerId?: string;
  startDate: Date;
  status: 'active' | 'inactive' | 'terminated';
}
```

---

## 👤 Role Matrix (Explicit — who sees what)

| Page | HR Admin | Manager | Employee |
|---|:---:|:---:|:---:|
| Dashboard | ทั้งบริษัท | ทีมตัวเอง | ตัวเอง |
| Employee List | ✅ ทั้งหมด | ✅ ทีม (read-only) | ❌ redirect to own profile |
| Employee Add/Edit | ✅ | ❌ | ❌ |
| Employee Delete | ✅ | ❌ | ❌ |
| Clock In/Out | ✅ ของตัวเอง | ✅ ของตัวเอง | ✅ ของตัวเอง |
| My Attendance | ✅ | ✅ | ✅ |
| Team Attendance | ✅ ทั้งหมด | ✅ ทีมตัวเอง | ❌ |
| Apply Leave | ✅ | ✅ | ✅ |
| My Leaves | ✅ | ✅ | ✅ |
| Approval Queue | ✅ ทั้งหมด | ✅ ทีมตัวเอง | ❌ |
| My Payslip | ✅ ของตัวเอง | ✅ ของตัวเอง | ✅ ของตัวเอง |
| Employee Payslips | ✅ ทั้งหมด | ❌ | ❌ |
| Settings | ✅ | ✅ จำกัด | ✅ Profile เท่านั้น |

---

## 📁 Folder Structure (Refined)

```
/Users/peace/Desktop/work/rws/poc/hrm/
├── .nvmrc                          # 20.x
├── .eslintrc.cjs
├── .prettierrc
├── .editorconfig
├── components.json                 # shadcn-vue
├── tailwind.config.js              # Tailwind v3 config
├── postcss.config.js
├── vite.config.ts                  # alias + manualChunks (chart/xlsx/jspdf)
├── tsconfig.json                   # strict mode + path alias
├── index.html
├── package.json
│
├── public/
│   └── office-map.png
│
└── src/
    ├── main.ts
    ├── App.vue
    ├── style.css                   # @tailwind base/components/utilities
    │
    ├── lib/
    │   ├── utils.ts                # cn() helper
    │   ├── logger.ts               # dev-only console wrapper
    │   ├── storage.ts              # IndexedDB wrapper (idb-keyval)
    │   ├── export.ts               # Excel (exceljs) + PDF (jspdf)
    │   ├── thai-tax.ts             # Progressive brackets + calc
    │   ├── thai-id.ts              # 13-digit Mod-11 validator
    │   ├── thai-date.ts            # BE / CE converter
    │   ├── thai-holidays.ts        # Public holidays 2026
    │   ├── mock-seed.ts            # Seed 50 employees + 90 days attendance + payroll
    │   └── api/
    │       ├── client.ts           # fake async wrapper (simulate latency)
    │       ├── employee.repository.ts
    │       ├── attendance.repository.ts
    │       ├── leave.repository.ts
    │       └── payroll.repository.ts
    │
    ├── composables/
    │   ├── useAuth.ts
    │   └── useAsyncData.ts         # loading/error/data pattern
    │
    ├── i18n/
    │   ├── index.ts                # createI18n (legacy:false) + merge helper
    │   └── base/                   # shared translations
    │       ├── th.json
    │       └── en.json
    │
    ├── stores/
    │   ├── app.ts                  # theme, language (persist localStorage)
    │   └── notification.ts         # in-memory + persist recent 50
    │
    ├── router/
    │   ├── index.ts                # lazy imports
    │   └── guards.ts               # auth + role guards
    │
    ├── types/
    │   ├── api.ts
    │   ├── employee.ts
    │   ├── attendance.ts
    │   ├── leave.ts
    │   └── payroll.ts
    │
    ├── components/
    │   ├── ui/                     # shadcn-vue auto-generated
    │   ├── layout/
    │   │   ├── MainLayout.vue
    │   │   ├── AppSidebar.vue
    │   │   └── AppHeader.vue
    │   └── shared/
    │       ├── DataTable.vue
    │       ├── ConfirmDialog.vue
    │       ├── EmptyState.vue
    │       ├── LoadingState.vue
    │       ├── ErrorState.vue
    │       ├── ErrorBoundary.vue
    │       ├── PageHeader.vue
    │       └── RoleGate.vue        # conditional render by role
    │
    └── modules/
        ├── auth/
        │   ├── locales/{th,en}.json
        │   ├── pages/LoginPage.vue
        │   └── stores/auth.ts
        ├── dashboard/
        │   ├── locales/{th,en}.json
        │   └── pages/DashboardPage.vue
        ├── employee/
        │   ├── locales/{th,en}.json
        │   ├── pages/{List,Detail,AddEdit}.vue
        │   ├── schemas/employee.ts
        │   └── stores/employee.ts
        ├── attendance/
        │   ├── locales/{th,en}.json
        │   ├── pages/{ClockInOut,MyAttendance,TeamAttendance}.vue
        │   └── stores/attendance.ts
        ├── leave/
        │   ├── locales/{th,en}.json
        │   ├── pages/{MyLeaves,ApplyLeave,ApprovalQueue}.vue
        │   ├── schemas/leave.ts
        │   └── stores/leave.ts
        ├── payroll/
        │   ├── locales/{th,en}.json
        │   ├── pages/{MyPayslip,EmployeePayslips}.vue
        │   └── stores/payroll.ts
        ├── approval/
        │   ├── locales/{th,en}.json
        │   └── pages/ApprovalInbox.vue
        └── settings/
            ├── locales/{th,en}.json
            └── pages/SettingsPage.vue
```

**ไฟล์ประมาณ:** ~45-55 Vue + ~25-30 TS

---

## 🚧 Execution Plan v2 (Phase-by-Phase)

### ✅ Phase 0: Git Setup (เสร็จแล้ว)

### Phase 1: Project Setup (~30 min)
```bash
npm create vite@latest . -- --template vue-ts
npm install
npm install -D tailwindcss@^3.4.17 postcss autoprefixer @types/node@^22
npm install -D eslint@^9 eslint-plugin-vue@^9.32 @vue/eslint-config-typescript@^14.2 prettier@^3
npx tailwindcss init -p

# Core
npm install vue-router@^4.5 pinia@^2.3 pinia-plugin-persistedstate@^4.1
npm install vue-i18n@^9.14 lucide-vue-next@^0.468 date-fns@^4.1
npm install vee-validate@^4.15 @vee-validate/zod@^4.15 zod@^3.24
npm install @tanstack/vue-table@^8.21
npm install class-variance-authority clsx tailwind-merge
npm install idb-keyval@^6.2

# Charts + Export
npm install vue-chartjs@^5.3 chart.js@^4.4
npm install exceljs@^4.4 jspdf@^2.5 jspdf-autotable@^3.8

# shadcn-vue
npx shadcn-vue@latest init
```

**Config files:**
- `.nvmrc` (20)
- `.eslintrc.cjs`, `.prettierrc`, `.editorconfig`
- `vite.config.ts` — `@` alias + `manualChunks` for chart/exceljs/jspdf
- `tsconfig.json` — strict + paths
- `tailwind.config.js` (v3)
- `src/style.css` — `@tailwind` directives + CSS vars
- `src/lib/utils.ts` — `cn()` helper

### Phase 2: shadcn-vue Components (~15 min)
```bash
npx shadcn-vue@latest add button input label textarea select checkbox radio-group switch
npx shadcn-vue@latest add card dialog alert-dialog sheet drawer
npx shadcn-vue@latest add table tabs badge avatar separator
npx shadcn-vue@latest add dropdown-menu popover tooltip
npx shadcn-vue@latest add sonner
npx shadcn-vue@latest add form calendar date-picker
npx shadcn-vue@latest add progress skeleton
npx shadcn-vue@latest add command breadcrumb sidebar
```

### Phase 3: Infrastructure Foundation (~2 hrs)
- ESLint/Prettier configs + lint scripts
- `src/lib/{logger,storage,utils}.ts`
- `src/lib/thai-{tax,id,date,holidays}.ts` ✅ **Thai domain core**
- `src/lib/api/client.ts` + `*.repository.ts`
- `src/lib/mock-seed.ts` — **realistic seed**:
  - 50 Thai employees (ชื่อไทย + อังกฤษ + ชื่อเล่น)
  - 7 แผนก: ทรัพยากรบุคคล/บัญชี/ขาย/การตลาด/ไอที/ปฏิบัติการ/ผลิต
  - Salaries 15k–150k (realistic distribution)
  - 1 คนช่วง maternity, 1 probation, 1 high-earner (30% bracket demo)
  - Valid Thai IDs (generate with correct Mod-11)
  - Addresses: tambon/amphoe/changwat + zip
  - Banks (SCB/KBank/BBL/KTB/TTB/BAY) + 10-digit account
  - 90 วัน attendance (in/out + some late/OT/absent)
  - 3 เดือน leave history
  - 3 เดือน payroll history (consistent calc)
  - Thai public holidays 2026
- `src/i18n/index.ts` + per-module merge helper
- `src/stores/{app,notification}.ts`
- `src/router/{index,guards}.ts` — lazy imports + role guards
- `src/composables/useAsyncData.ts`
- `src/components/shared/{ErrorBoundary,EmptyState,LoadingState,ErrorState,ConfirmDialog,RoleGate}.vue`
- Global error handler → notification store + Sonner

### Phase 4: Layout + Auth (~1.5 hrs)
- `auth/stores/auth.ts` — `currentUser`, `currentRole`, `login()`, `logout()`, `switchRole()`
- `auth/pages/LoginPage.vue` — form + **quick login buttons for 3 personas** (demo convenience)
- `layout/MainLayout.vue` — responsive shell
- `layout/AppSidebar.vue` — collapsible, role-based via `RoleGate`
- `layout/AppHeader.vue` — notification bell, language switcher, theme toggle, user menu + **switch role dropdown**

### Phase 5: Dashboard (~1 hr)
- 4 KPI cards (clickable → ไป module)
- 1 chart (attendance trend 7 วัน — Chart.js line)
- Recent activity feed (latest 10 events)
- Quick Actions (Clock In, Apply Leave, View Payslip)

### Phase 6: Employee Module (~2 hrs)
- List: DataTable + sort + filter + search + pagination
- Detail: tabbed (Personal / Work / Compensation / History)
- Add/Edit form (single-page, zod validation):
  - Thai ID validation on blur → show formatted + valid/invalid badge
  - Bank account format validation
  - PVD rate slider (3-15%)
  - Allowances inputs
- Delete with ConfirmDialog
- Export to Excel (exceljs, dynamic import)

### Phase 7: Attendance Module (~2 hrs)
- Clock In/Out:
  - Big status button (Not clocked / Working / On break / Done)
  - Real-time clock
  - **Real GPS via `navigator.geolocation`** → coords + distance from office
  - Permission denied → fallback mock with clear error
  - Success animation + toast
- My Attendance: calendar + list toggle
- Team Attendance: DataTable + date range
- Business logic: OT (weekday 1.5x / holiday 2x / holiday OT 3x), late detection

### Phase 8: Leave Module (~1.5 hrs)
- My Leaves: balance cards (sick/personal/vacation) + history
- Apply Leave: date range picker + type + reason
- Cancel pending
- Approval Queue (Manager): list + quick approve/reject + comment
- Leave entitlements per กม. แรงงาน (seed in types file)

### Phase 9: Payroll Module (~2 hrs)
- My Payslip:
  - Month/year selector (+ BE/CE toggle)
  - Full breakdown (earnings + deductions) — Thai tax/SS/PVD คำนวณถูก
  - Net pay with Baht formatting
  - Download PDF (jsPDF + autoTable) ตาม LPA §75
- Employee Payslips (HR): list + drilldown
- Uses `thai-tax.ts` integrated with attendance + leave data

### Phase 10: Notifications + Approval Inbox (~1 hr)
- Notification store: add/read/markAllRead, persist recent 50
- Header bell: badge + dropdown
- Click notification → navigate
- Global Approval Inbox aggregates leave (extensible)
- Toast on new event (Sonner)

### Phase 11: Settings + Polish (~45 min)
- Settings: language, theme, profile edit
- Dark mode audit
- Responsive check (mobile/tablet/desktop)

### Phase 12: Verification (~45 min)
- `npm run build` — no TS/ESLint error
- `npm run dev` — walk through **demo script 7 ขั้น**
- Role matrix spot-check
- Refresh persist test
- Mobile simulator
- Language switch mid-flow
- Keyboard navigation

---

## 🎨 UX State Checklist (apply per page)

ทุก list/page ต้องมีครบ:
- [ ] Loading state (skeleton)
- [ ] Empty state (พร้อม CTA)
- [ ] Error state (พร้อมปุ่ม retry)
- [ ] Success feedback (toast)
- [ ] Confirmation dialog ก่อน destructive action (delete, logout, reject)
- [ ] Optimistic update สำหรับ approve/reject (rollback on error)
- [ ] Focus management ใน dialog

---

## ✅ Verification (Expanded)

1. **Build:** `npm run build` ผ่าน + bundle < 500KB main chunk gzipped
2. **Lint:** `npm run lint` + `npm run format:check`
3. **Demo script:** เดิน 7 ขั้น ไม่มี bug
4. **Role matrix:** 3 roles × key pages match matrix
5. **Thai domain:**
   - Salary 30,000 → tax/SS/PVD ตรงสูตร manual
   - Thai ID ผิด checksum → form reject
   - Holiday OT × 3 ถูก
   - BE date: 2026 → 2569
6. **Persist:** refresh browser → data คงอยู่
7. **i18n:** toggle TH↔EN ทุกหน้า ไม่มี missing key
8. **Responsive:** 320px, 768px, 1280px

---

## ⚠️ Risks & Mitigations (v2)

| Risk | Impact | Mitigation |
|---|---|---|
| Scope creep "ทุกปุ่มกดได้" | เวลาล้น | MVP cut ชัดเจน + deferred list เป็น backlog |
| Thai tax calc ผิด | Demo พัง | `thai-tax.ts` pure function + expected values in unit test-style comments |
| Seed data inconsistent | Downstream bug | Generate once, verify cross-refs, snapshot to JSON |
| IndexedDB quota | Attendance history หาย | Cap 90 days rolling + warn at >80% quota |
| GPS permission denied | Clock in พัง | Fallback mock location + clear error |
| Tailwind v3 vs shadcn-vue | Version mismatch | Pin shadcn-vue CLI + verify generated config |
| exceljs bundle size | Slow load | Dynamic import on export click (vite manualChunks) |

---

## 🔓 Permissions ที่ขอไว้
- `Bash(npm:*)`, `Bash(npx:*)`, `Bash(git:*)` ใน folder นี้
- `Bash(ls/pwd/cat/mkdir)`
- `Write/Edit` ในโฟลเดอร์ POC เท่านั้น
- Network: npm registry

---

## Sources
- Feedback consolidated from 3 specialized agents (Architecture / Scope / Thai Domain)
- [HumanSoft](https://www.humansoft.co.th/th)
- [Bplus HRM](https://www.businessplus.co.th/Product/hrm-payroll-c008)
- [Prosoft HRMI](https://www.prosofthrmi.com/)
- [shadcn-vue docs](https://www.shadcn-vue.com/)
- [Tailwind CSS v3](https://v3.tailwindcss.com/)
- [Thai Revenue Department](https://www.rd.go.th/)
- [Thai Labour Protection Act](https://www.mol.go.th/)
