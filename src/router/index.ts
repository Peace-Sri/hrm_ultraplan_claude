import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { authGuard, permissionGuard } from './guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/pages/LoginPage.vue'),
    meta: { requiresAuth: false, title: 'Login' },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/modules/auth/pages/ForbiddenPage.vue'),
    meta: { requiresAuth: false, title: 'Forbidden' },
  },
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'dashboard' } },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/modules/dashboard/pages/DashboardPage.vue'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'employees',
        name: 'employees.list',
        component: () => import('@/modules/employee/pages/EmployeeListPage.vue'),
        meta: {
          title: 'Employees',
          requiresPermission: ['employee.view_all', 'employee.view_team'],
        },
      },
      {
        path: 'employees/new',
        name: 'employees.new',
        component: () => import('@/modules/employee/pages/EmployeeFormPage.vue'),
        meta: { title: 'Add Employee', requiresPermission: 'employee.create' },
      },
      {
        path: 'employees/:id',
        name: 'employees.detail',
        component: () => import('@/modules/employee/pages/EmployeeDetailPage.vue'),
        meta: {
          title: 'Employee Detail',
          requiresPermission: ['employee.view_all', 'employee.view_team', 'employee.view_self'],
        },
      },
      {
        path: 'employees/:id/edit',
        name: 'employees.edit',
        component: () => import('@/modules/employee/pages/EmployeeFormPage.vue'),
        meta: { title: 'Edit Employee', requiresPermission: 'employee.edit' },
      },
      {
        path: 'attendance',
        name: 'attendance.clock',
        component: () => import('@/modules/attendance/pages/ClockInOutPage.vue'),
        meta: { title: 'Clock In/Out', requiresPermission: 'attendance.clock_self' },
      },
      {
        path: 'attendance/my',
        name: 'attendance.my',
        component: () => import('@/modules/attendance/pages/MyAttendancePage.vue'),
        meta: { title: 'My Attendance', requiresPermission: 'attendance.view_self' },
      },
      {
        path: 'attendance/team',
        name: 'attendance.team',
        component: () => import('@/modules/attendance/pages/TeamAttendancePage.vue'),
        meta: {
          title: 'Team Attendance',
          requiresPermission: ['attendance.view_all', 'attendance.view_team'],
        },
      },
      {
        path: 'leave/my',
        name: 'leave.my',
        component: () => import('@/modules/leave/pages/MyLeavesPage.vue'),
        meta: { title: 'My Leaves', requiresPermission: 'leave.view_self' },
      },
      {
        path: 'leave/apply',
        name: 'leave.apply',
        component: () => import('@/modules/leave/pages/ApplyLeavePage.vue'),
        meta: { title: 'Apply Leave', requiresPermission: 'leave.apply_self' },
      },
      {
        path: 'leave/approvals',
        name: 'leave.approvals',
        component: () => import('@/modules/leave/pages/ApprovalQueuePage.vue'),
        meta: { title: 'Leave Approvals', requiresPermission: 'leave.approve_team' },
      },
      {
        path: 'payroll/my',
        name: 'payroll.my',
        component: () => import('@/modules/payroll/pages/MyPayslipPage.vue'),
        meta: { title: 'My Payslip', requiresPermission: 'payslip.view_self' },
      },
      {
        path: 'payroll/employees',
        name: 'payroll.employees',
        component: () => import('@/modules/payroll/pages/EmployeePayslipsPage.vue'),
        meta: { title: 'Employee Payslips', requiresPermission: 'payslip.view_all' },
      },
      {
        path: 'approvals',
        name: 'approvals.inbox',
        component: () => import('@/modules/approval/pages/ApprovalInboxPage.vue'),
        meta: {
          title: 'Approval Inbox',
          requiresPermission: ['approval.view_all', 'approval.view_team'],
        },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/modules/settings/pages/SettingsPage.vue'),
        meta: { title: 'Settings', requiresPermission: 'settings.profile_self' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(authGuard)
router.beforeEach(permissionGuard)
router.afterEach((to) => {
  const title = to.meta.title ? `${to.meta.title} — HRM POC` : 'HRM POC'
  document.title = title
})
