# Plan: HRM POC — Vue 3 + Vite + shadcn-vue + Tailwind

## Context
ผู้ใช้ต้องการสร้างโปรแกรม HRM (Human Resource Management) POC ในโฟลเดอร์
`/Users/peace/Desktop/work/rws/poc/hrm` (ปัจจุบันว่างเปล่า ยกเว้น `.claude/settings.local.json`)
โดยได้แรงบันดาลใจจากฟีเจอร์ของ **HumanSoft + Bplus HRM + Prosoft HRMI**
(ซึ่ง research ไว้แล้วในการสนทนาก่อนหน้า)

**เป้าหมาย:**
- Scope: **MVP Core Modules เจาะลึก** (4-5 โมดูลหลัก ใช้งานได้จริง)
- ทุกปุ่มกดได้ + ทุก action ทำงาน (no dead buttons)
- รองรับภาษา TH + EN
- Mock data ผ่าน Pinia + persist ลง localStorage (รีเฟรชไม่หาย)
- Tech stack: **Vite + Vue 3 + TypeScript + shadcn-vue + Tailwind CSS v4**

---

## Tech Stack (ขั้นสุดท้าย)

| หมวด | Library |
|---|---|
| Build tool | Vite |
| Framework | Vue 3 (Composition API + `<script setup>`) |
| Language | TypeScript |
| UI components | **shadcn-vue** (registry-based, copy-to-project) |
| CSS | **Tailwind CSS v4** (ใหม่ล่าสุด ใช้ `@import` แทน config file) |
| Routing | Vue Router 4 |
| State | **Pinia** + `pinia-plugin-persistedstate` (persist ลง localStorage) |
| i18n | `vue-i18n@9` |
| Icons | `lucide-vue-next` |
| Forms | `vee-validate` + `zod` |
| Dates | `date-fns` |
| Charts | `vue-chartjs` + `chart.js` |
| Tables | shadcn-vue Data Table (สร้างจาก `@tanstack/vue-table`) |
| Export | `xlsx` (Excel), `jspdf` + `jspdf-autotable` (PDF payslip) |
| Toast | shadcn-vue `Sonner` |

---

## Scope: 6 Core Modules + Supporting

### 🔐 0. Authentication & Layout (Mock)
- หน้า Login (username/password, validation, "remember me")
- Logout จาก header menu
- **Switch user for demo** — เลือก role ได้ (HR Admin / Manager / Employee)
- MainLayout: Sidebar + Header + Content
- Sidebar: collapse/expand, active state, role-based menu
- Header: notification bell, language switcher, theme toggle, user menu
- Route guards: redirect to `/login` ถ้ายังไม่ login

### 📊 1. Dashboard
- KPI cards (คลิกได้ → ไป module นั้น):
  - Total Employees, Present Today, On Leave Today, Pending Approvals
- Charts:
  - Attendance trend (7 วันล่าสุด) — Line chart
  - Leave by type — Pie chart
  - Monthly payroll cost — Bar chart
- Recent Activities feed (live จาก store)
- Quick Actions (Clock In/Out, Request Leave, View Payslip)
- Birthdays/Anniversaries ของเดือนนี้

### 👥 2. Employee Management
- **List:** Data Table พร้อม pagination, sort, filter, search
  - Filter: แผนก, ตำแหน่ง, สถานะ (active/inactive)
  - Bulk actions: activate/deactivate/export/delete
  - Export ไป Excel (.xlsx)
  - Import จาก Excel (optional)
- **Detail:** tab interface (Personal / Work / Bank / Documents / History)
  - Upload avatar (base64 → localStorage)
  - Edit inline (toggle edit mode)
  - Delete พร้อม confirm dialog
  - History: ดูประวัติการเข้างาน/ลา/เงินเดือน
- **Add/Edit Form:** Multi-step wizard
  - Step 1: Personal Info (name, DOB, ID, address)
  - Step 2: Work Info (department, position, start date, employment type)
  - Step 3: Compensation (salary, bank account)
  - Draft ไว้ได้ (save to localStorage)
  - Form validation ทุกช่อง (zod schema)
- **Organization Chart:** tree view แสดงโครงสร้าง

### ⏰ 3. Time Attendance
- **Clock In/Out:**
  - ปุ่มใหญ่แสดงสถานะปัจจุบัน (Not clocked / Working / Break / Done)
  - เวลาปัจจุบัน real-time
  - เลือก method: **GPS, Wi-Fi, Face Recognition (mock camera), Fingerprint (simulated)**
  - GPS: ใช้ `navigator.geolocation` จริง → แสดงพิกัด + distance จาก office
  - Face Recognition: เปิด webcam ถ่ายรูป → เก็บ base64
  - บันทึก timestamp ลง store
- **My Attendance:** calendar + list view
  - แสดงเวลาเข้า-ออก, overtime, late
  - Request correction ถ้าลืมกด
- **Team Attendance (Manager/HR):**
  - ตาราง attendance ทุกคนตามวัน
  - Filter by department, date range
  - Export
- **Shift Management (HR):**
  - สร้าง shift patterns (เช้า 8-17, บ่าย 14-23)
  - Assign shift ให้ employee
  - Roster calendar
- **Approve Corrections:** queue สำหรับ manager อนุมัติการแก้ไขเวลา

### 🏖️ 4. Leave Management
- **My Leaves:**
  - Leave balance dashboard (sick, personal, vacation, maternity, military)
  - History ของตัวเอง พร้อม status
  - Apply Leave: form + date range picker + reason + attachment
  - Cancel pending request
- **Team Calendar:** ดูว่าใครลาวันไหน (month view)
- **Approval Queue (Manager):**
  - List requests รออนุมัติ
  - ดู context (leave balance, ประวัติ) ก่อน decide
  - Approve/Reject พร้อม comment
  - Notify requester (update store)
- **Leave Types Settings (HR):**
  - CRUD leave types
  - Set default entitlements

### 💰 5. Payroll
- **My Payslip:**
  - เลือกเดือน/ปี
  - แสดง Earnings (base, OT, allowance, bonus)
  - Deductions (tax, SS, provident fund, absence)
  - Net pay
  - **Download PDF** (ใช้ jsPDF)
  - YTD summary
- **Payroll Run (HR):**
  - เลือก period (เดือน/ปี)
  - ระบบคำนวณอัตโนมัติจากข้อมูล attendance + leave
  - Preview ตารางทุกคน
  - ปรับรายบุคคล (adjust allowance, add bonus)
  - Lock & finalize
  - Generate payslips ให้ทุกคน
  - **Export bank transfer file** (CSV mock)
- **Tax Summary:**
  - สรุปภาษีเดือนนั้น (ภ.ง.ด.1 mock)
  - Export

### 📱 6. Employee Self-Service (ESS)
- My Profile (ดู/แก้ personal info)
- Submit leave
- View attendance
- View payslip
- Submit expense claim (optional simple flow)
- View announcements

### 🔔 Supporting: Approval Workflow + Notifications
- **Global Approval Inbox:** ทุก action ที่รออนุมัติรวมที่เดียว
  - Leave, OT, Attendance correction, Expense
  - Filter by type, status
  - Quick approve/reject
- **Notification System:**
  - Bell icon + badge count
  - Dropdown list latest 10
  - Click → navigate to item
  - Mark as read / mark all as read
  - Toast ขึ้นเวลามี event ใหม่

### ⚙️ Settings
- Language switcher (TH ↔ EN) — persist
- Theme toggle (light / dark / system) — persist
- Company info (name, logo, address)
- Profile management
- Change password (mock)
- Notification preferences

---

## Folder Structure

```
/Users/peace/Desktop/work/rws/poc/hrm/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                    # shadcn-vue components (auto-generated)
│   │   ├── layout/                # AppSidebar, AppHeader, MainLayout
│   │   └── shared/                # DataTable, EmptyState, ConfirmDialog, etc.
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useNotification.ts
│   │   └── useGeolocation.ts
│   ├── i18n/
│   │   ├── locales/{th,en}.json
│   │   └── index.ts
│   ├── lib/
│   │   ├── utils.ts               # cn() helper
│   │   ├── mock-seed.ts           # seed data ~50 employees
│   │   └── export.ts              # Excel/PDF helpers
│   ├── modules/
│   │   ├── auth/{pages,stores}
│   │   ├── dashboard/pages
│   │   ├── employee/{pages,stores,schemas,types}
│   │   ├── attendance/{pages,stores,schemas}
│   │   ├── leave/{pages,stores,schemas}
│   │   ├── payroll/{pages,stores,schemas}
│   │   ├── ess/pages
│   │   ├── approval/{pages,stores}
│   │   └── settings/pages
│   ├── router/index.ts
│   ├── stores/
│   │   ├── app.ts                 # theme, language
│   │   └── notification.ts
│   ├── types/index.ts
│   ├── App.vue
│   ├── main.ts
│   └── style.css                  # Tailwind directives
├── components.json                # shadcn-vue config
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Execution Plan (Phase-by-Phase)

### 🔀 Phase 0: Git Setup สำหรับใช้ Ultraplan (~5 min) — ทำก่อน

**เป้าหมาย:** เตรียม folder ให้เป็น git repo + มี commit เริ่มต้น เพื่อให้ user push ขึ้น GitHub แล้วใช้ Ultraplan refine plan ต่อ

1. `git init` ใน `/Users/peace/Desktop/work/rws/poc/hrm`
2. สร้าง `README.md` อธิบายโปรเจกต์ HRM POC
3. สร้าง `.gitignore` (ignore `node_modules/`, `dist/`, `.env`, `.DS_Store`, etc.)
4. Copy plan มาเก็บที่ `PLAN.md` ใน repo (เพื่อให้ Ultraplan เห็น context)
5. `git add .` + `git commit -m "chore: initial project plan and README"`

**หลัง Phase 0 เสร็จ:** หยุดรอ user สร้าง GitHub repo + push + ใช้ Ultraplan → refine plan → กลับมา execute Phase 1+

---

### Phase 1: Project Setup (~15 min)
```bash
cd /Users/peace/Desktop/work/rws/poc/hrm
npm create vite@latest . -- --template vue-ts
npm install
# Tailwind v4 + shadcn-vue deps
npm install tailwindcss @tailwindcss/vite
npm install -D @types/node
# Core libs
npm install vue-router@4 pinia pinia-plugin-persistedstate vue-i18n@9
npm install lucide-vue-next date-fns
npm install vee-validate @vee-validate/zod zod
npm install @tanstack/vue-table
npm install class-variance-authority clsx tailwind-merge
# Charts + Export
npm install vue-chartjs chart.js
npm install xlsx jspdf jspdf-autotable
# shadcn-vue init
npx shadcn-vue@latest init
```

**Config files to create/edit:**
- `vite.config.ts` — add Tailwind v4 plugin + `@` path alias
- `tsconfig.json` — add path alias
- `src/style.css` — Tailwind `@import "tailwindcss"` + CSS variables
- `components.json` — shadcn-vue config
- `src/lib/utils.ts` — `cn()` helper

### Phase 2: Install shadcn-vue Components (~10 min)
```bash
npx shadcn-vue@latest add button input label textarea select
npx shadcn-vue@latest add card dialog alert-dialog sheet drawer
npx shadcn-vue@latest add table tabs badge avatar
npx shadcn-vue@latest add dropdown-menu popover tooltip
npx shadcn-vue@latest add toast sonner
npx shadcn-vue@latest add form checkbox radio-group switch
npx shadcn-vue@latest add calendar date-picker
npx shadcn-vue@latest add progress skeleton separator
npx shadcn-vue@latest add command navigation-menu breadcrumb
npx shadcn-vue@latest add sidebar
```

### Phase 3: Base Infrastructure (~1 hr)
- `src/i18n/` — setup vue-i18n with TH/EN
- `src/i18n/locales/th.json, en.json` — base translations
- `src/lib/mock-seed.ts` — สร้างข้อมูล 50 employees, departments, shifts, leave types, ~3 เดือน attendance/leave/payroll history
- `src/stores/app.ts` — theme/language state (persist)
- `src/stores/notification.ts` — notification state
- `src/router/index.ts` — routes + auth guard
- `src/main.ts` — register Pinia, Router, i18n
- `src/App.vue` — root + RouterView + Toaster

### Phase 4: Layout & Auth (~1 hr)
- `components/layout/MainLayout.vue` — sidebar + header + main
- `components/layout/AppSidebar.vue` — collapsible, role-based nav
- `components/layout/AppHeader.vue` — search, notifications, language, theme, user menu
- `modules/auth/stores/auth.ts` — current user, roles, login/logout
- `modules/auth/pages/LoginPage.vue` — form + role switcher (for demo)

### Phase 5: Dashboard (~1 hr)
- KPI cards (live จาก stores)
- Charts (Chart.js)
- Recent activities
- Quick actions

### Phase 6: Employee Module (~2 hrs)
- List with DataTable (sort, filter, search, pagination, bulk actions)
- Detail page (tabs)
- Add/Edit wizard (3 steps + draft save)
- Organization chart
- Excel export/import
- Store (CRUD + persist)

### Phase 7: Attendance Module (~2 hrs)
- Clock In/Out page (real GPS + mock camera)
- My Attendance calendar
- Team view
- Shift management
- Corrections approval
- Store + business logic (OT calculation, late detection)

### Phase 8: Leave Module (~1.5 hrs)
- My Leaves + balance
- Apply form + calendar
- Team calendar
- Approval queue
- Leave types CRUD
- Store

### Phase 9: Payroll Module (~2 hrs)
- Payslip view
- Payroll run (HR)
- Tax calculation logic (Thai progressive tax)
- Social security calc
- PDF export
- Store

### Phase 10: ESS + Approval + Notifications (~1.5 hr)
- ESS landing page
- Global approval inbox
- Notification dropdown + toast
- Cross-module integration

### Phase 11: Settings + Polish (~1 hr)
- Settings pages
- Theme dark mode audit
- Empty states
- Loading states
- Error states
- Responsive check (mobile/tablet)

### Phase 12: Verification (~30 min)
- รัน `npm run dev` → เปิดทุกหน้า
- ทดสอบทุกปุ่มว่าทำงาน
- Login flow, role switching
- CRUD employee end-to-end
- Clock in/out, apply leave, approve, payroll run
- Language switch, theme switch
- Refresh test (persist ทำงาน)

---

## Critical Files To Create (ย่อ)

```
src/main.ts
src/App.vue
src/router/index.ts
src/i18n/index.ts
src/i18n/locales/{th,en}.json
src/stores/app.ts
src/stores/notification.ts
src/lib/{utils,mock-seed,export}.ts
src/composables/{useAuth,useNotification,useGeolocation}.ts

src/components/layout/{MainLayout,AppSidebar,AppHeader}.vue
src/components/shared/{DataTable,ConfirmDialog,EmptyState,PageHeader}.vue

src/modules/auth/{stores/auth.ts, pages/LoginPage.vue}
src/modules/dashboard/pages/DashboardPage.vue
src/modules/employee/{pages/*, stores/employee.ts, schemas/employee.ts}
src/modules/attendance/{pages/*, stores/attendance.ts}
src/modules/leave/{pages/*, stores/leave.ts}
src/modules/payroll/{pages/*, stores/payroll.ts}
src/modules/ess/pages/*
src/modules/approval/{pages/*, stores/approval.ts}
src/modules/settings/pages/*
```

**ประมาณการ:** ~60-80 ไฟล์ Vue + ~15-20 ไฟล์ TS

---

## Verification Plan

1. **Build check:** `npm run build` ผ่านไม่มี error
2. **Dev check:** `npm run dev` เปิด `http://localhost:5173` ทดสอบทุกปุ่มในทุกหน้า
3. **Functional tests (manual):**
   - Login → เห็น dashboard
   - สลับ role → sidebar เปลี่ยนตาม permission
   - Employee: add → list → edit → detail → delete (ทั้ง flow)
   - Clock in → clock out → ดู history
   - Apply leave → approve → ดู balance เปลี่ยน
   - Run payroll → ดู payslip → export PDF
   - Switch language → ข้อความเปลี่ยน
   - Switch theme → dark mode ทำงาน
   - Refresh browser → ข้อมูลคงอยู่ (persist)
4. **Responsive:** ทดสอบที่ mobile/tablet/desktop sizes

---

## 🔓 Permissions ที่ต้องขอ

### Bash commands
| Command | วัตถุประสงค์ |
|---|---|
| `npm create vite@latest . -- --template vue-ts` | Scaffold โปรเจกต์ Vue 3 + TS |
| `npm install` / `npm install <pkg>` | ติดตั้ง dependencies |
| `npm install -D <pkg>` | ติดตั้ง dev dependencies |
| `npx shadcn-vue@latest init` | Setup shadcn-vue |
| `npx shadcn-vue@latest add <component>` | เพิ่มคอมโพเนนต์ |
| `npm run dev` | รัน dev server เพื่อตรวจสอบ |
| `npm run build` | Production build (verify) |
| `mkdir -p <path>` | สร้างโฟลเดอร์ (ถ้าจำเป็น) |
| `ls`, `cat`, `pwd` | ตรวจ state ของโปรเจกต์ |

### File operations
- **Write/Edit** ไฟล์ใน `/Users/peace/Desktop/work/rws/poc/hrm/**` เท่านั้น
- **ไม่แตะ** ไฟล์อื่นนอกโฟลเดอร์

### Network
- ดาวน์โหลด packages จาก npm registry (ผ่าน `npm install`, `npx`)

### อนุญาตเพิ่มเติมที่ควรให้
- `Bash(npm:*)` — ทุก npm command
- `Bash(npx:*)` — ทุก npx command
- `Write(*)` และ `Edit(*)` ในโฟลเดอร์ปัจจุบัน
- `Bash(mkdir:*)`, `Bash(ls:*)`, `Bash(pwd)` (พื้นฐาน)

### ไม่ต้องการ
- ❌ Git push / commit (POC ภายใน ไม่ผูก remote)
- ❌ Deploy / hosting
- ❌ การแก้ไขไฟล์นอกโฟลเดอร์ POC
- ❌ Internet requests อื่นๆนอกจาก npm registry

---

## ความเสี่ยง / Trade-offs

1. **Scope ใหญ่มาก** — 6 modules + supporting + ทุกปุ่มกดได้ = งาน ~10-15 ชม.
   - **Mitigation:** ทำเป็น phase เรียงลำดับ ถ้าหยุดกลางทาง โมดูลที่เสร็จแล้วใช้งานได้
2. **Tailwind v4 ใหม่มาก** — syntax เปลี่ยนจาก v3 (ไม่ใช้ tailwind.config.js)
   - **Mitigation:** ใช้ shadcn-vue docs ที่ official รองรับ v4 แล้ว
3. **Face Recognition / Fingerprint** เป็น mock (ไม่ใช่ ML จริง)
   - **Mitigation:** UI flow เสมือนจริง แต่ไม่มีการ match ML
4. **PDF/Excel export** — ใช้ library ฝั่ง client (ไม่ต้อง backend)
5. **Tax calculation** — ใช้สูตรภาษีไทยแบบ simplified (progressive bracket ปัจจุบัน)

---

## Sources (จาก research เดิม)
- [HumanSoft](https://www.humansoft.co.th/th)
- [Bplus HRM](https://www.businessplus.co.th/Product/hrm-payroll-c008)
- [Prosoft HRMI](https://www.prosofthrmi.com/)
- [shadcn-vue docs](https://www.shadcn-vue.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Vite](https://vite.dev/)
