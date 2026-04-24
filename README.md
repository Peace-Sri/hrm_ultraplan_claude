# HRM POC — Human Resource Management System

> Proof-of-Concept สำหรับระบบ HR Management ที่ได้แรงบันดาลใจจากผู้เล่นหลักในไทย: **HumanSoft**, **Bplus HRM (Business Plus)**, และ **Prosoft HRMI**

## 🎯 เป้าหมาย

สร้าง HRM POC ที่:
- ครอบคลุม **6 core modules** หลักของระบบ HR
- **ทุกปุ่มกดได้ + ทุก action ทำงานจริง** (no dead buttons)
- รองรับภาษา **ไทย / อังกฤษ**
- Data persist ใน localStorage (รีเฟรชไม่หาย)
- พร้อมให้ stakeholders review

## 🛠️ Tech Stack

| หมวด | Library |
|---|---|
| Build tool | **Vite** |
| Framework | **Vue 3** (Composition API + `<script setup>`) |
| Language | **TypeScript** |
| UI | **shadcn-vue** |
| CSS | **Tailwind CSS v4** |
| Routing | Vue Router 4 |
| State | Pinia + `pinia-plugin-persistedstate` |
| i18n | vue-i18n 9 |
| Icons | lucide-vue-next |
| Forms | vee-validate + zod |
| Charts | vue-chartjs + chart.js |
| Tables | @tanstack/vue-table |
| Export | xlsx (Excel), jspdf (PDF) |

## 📦 Modules

| # | Module | Features |
|---|---|---|
| 🔐 | **Auth & Layout** | Login, role switcher (HR/Manager/Employee), sidebar, header |
| 📊 | **Dashboard** | KPI cards, charts, recent activities, quick actions |
| 👥 | **Employee Management** | CRUD, wizard form, org chart, Excel export, filters |
| ⏰ | **Time Attendance** | Clock in/out (GPS/Face/Fingerprint), calendar, shift mgmt |
| 🏖️ | **Leave Management** | Apply/approve/cancel, balance, team calendar, leave types |
| 💰 | **Payroll** | Payslip (PDF), payroll run, Thai tax calc, bank file export |
| 📱 | **ESS** | Employee self-service portal |
| 🔔 | **Approval + Notifications** | Global inbox, bell dropdown, toast |
| ⚙️ | **Settings** | Language, theme, profile |

## 📋 Status

**Current Phase:** 🚧 Planning — preparing for **Ultraplan** refinement on Claude Code web

See [`PLAN.md`](./PLAN.md) for the full implementation plan.

## 🚀 Setup (Coming Soon)

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## 📚 Research

Full competitor analysis (HumanSoft vs Bplus vs Prosoft HRMI) and feature comparison are documented in [`PLAN.md`](./PLAN.md).

---

**Target audience:** HR teams at Thai SMEs and enterprises who want a modern, cloud-based HRM tool comparable to the top 3 players in the Thai market.
