import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { LeaveRequest, LeaveBalance, LeaveType, LeaveTypeKey } from '@/types/leave'
import type { ID } from '@/types/common'
import { buildLeaveRequests, buildLeaveBalances, buildLeaveTypes } from '@/lib/mock-seed'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useNotificationStore } from '@/stores/notification'

let nextSeq = 10000
const mkId = () => `LVR-2026-${String(nextSeq++).padStart(5, '0')}` as ID<'LVR'>

export const useLeaveStore = defineStore(
  'leave',
  () => {
    const auth = useAuthStore()
    const notif = useNotificationStore()
    const types = ref<LeaveType[]>(buildLeaveTypes())
    const requests = ref<LeaveRequest[]>(buildLeaveRequests(auth.allEmployees))
    const balances = ref<LeaveBalance[]>(buildLeaveBalances(auth.allEmployees))

    const pendingCount = computed(() => requests.value.filter((r) => r.status === 'pending').length)
    const onLeaveTodayCount = computed(() => {
      const today = new Date().toISOString().slice(0, 10)
      return requests.value.filter(
        (r) => r.status === 'approved' && r.startDate <= today && r.endDate >= today,
      ).length
    })

    function byEmployee(employeeId: ID<'EMP'>) {
      return requests.value.filter((r) => r.employeeId === employeeId)
    }

    function balancesFor(employeeId: ID<'EMP'>) {
      return balances.value.filter((b) => b.employeeId === employeeId)
    }

    function pendingForManager(managerId: ID<'EMP'>) {
      const teamIds = auth.allEmployees.filter((e) => e.managerId === managerId).map((e) => e.id)
      return requests.value.filter((r) => r.status === 'pending' && teamIds.includes(r.employeeId))
    }

    function apply(data: {
      employeeId: ID<'EMP'>
      leaveTypeKey: LeaveTypeKey
      startDate: string
      endDate: string
      totalDays: number
      reason: string
      isHalfDay?: boolean
    }): LeaveRequest {
      auth.requirePermission('leave.apply_self')
      const req: LeaveRequest = {
        id: mkId(),
        ...data,
        isHalfDay: data.isHalfDay ?? false,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      }
      requests.value.push(req)
      // bump pending balance
      const bal = balances.value.find(
        (b) => b.employeeId === data.employeeId && b.leaveTypeKey === data.leaveTypeKey,
      )
      if (bal) bal.pendingDays += data.totalDays

      // notify the employee's manager
      const emp = auth.allEmployees.find((e) => e.id === data.employeeId)
      if (emp?.managerId) {
        notif.push(emp.managerId, 'leave_submitted', {
          titleTh: 'มีใบลารออนุมัติ',
          titleEn: 'Leave request pending',
          bodyTh: `${emp.firstNameTh} ${emp.lastNameTh} ยื่นใบลา ${data.totalDays} วัน`,
          bodyEn: `${emp.firstNameEn} ${emp.lastNameEn} requested ${data.totalDays} day(s) off`,
          link: '/leave/approvals',
        })
      }
      return req
    }

    function approve(id: ID<'LVR'>, comment?: string) {
      auth.requirePermission('leave.approve_team')
      const req = requests.value.find((r) => r.id === id)
      if (!req || req.status !== 'pending') return
      req.status = 'approved'
      req.reviewedAt = new Date().toISOString()
      req.reviewedBy = auth.currentEmployee?.id
      req.reviewerComment = comment

      const bal = balances.value.find(
        (b) => b.employeeId === req.employeeId && b.leaveTypeKey === req.leaveTypeKey,
      )
      if (bal) {
        bal.pendingDays = Math.max(0, bal.pendingDays - req.totalDays)
        bal.usedDays += req.totalDays
      }
      notif.push(req.employeeId, 'leave_approved', {
        titleTh: 'ใบลาได้รับการอนุมัติ',
        titleEn: 'Leave approved',
        bodyTh: `ใบลา ${req.totalDays} วัน ตั้งแต่ ${req.startDate}`,
        bodyEn: `${req.totalDays} day(s) starting ${req.startDate}`,
        link: '/leave/my',
      })
    }

    function reject(id: ID<'LVR'>, comment?: string) {
      auth.requirePermission('leave.approve_team')
      const req = requests.value.find((r) => r.id === id)
      if (!req || req.status !== 'pending') return
      req.status = 'rejected'
      req.reviewedAt = new Date().toISOString()
      req.reviewedBy = auth.currentEmployee?.id
      req.reviewerComment = comment

      const bal = balances.value.find(
        (b) => b.employeeId === req.employeeId && b.leaveTypeKey === req.leaveTypeKey,
      )
      if (bal) bal.pendingDays = Math.max(0, bal.pendingDays - req.totalDays)

      notif.push(req.employeeId, 'leave_rejected', {
        titleTh: 'ใบลาถูกปฏิเสธ',
        titleEn: 'Leave rejected',
        bodyTh: comment ?? 'ไม่มีหมายเหตุ',
        bodyEn: comment ?? 'No comment',
        link: '/leave/my',
      })
    }

    function cancel(id: ID<'LVR'>) {
      auth.requirePermission('leave.cancel_self')
      const req = requests.value.find((r) => r.id === id)
      if (!req || req.status !== 'pending') return
      req.status = 'cancelled'
      const bal = balances.value.find(
        (b) => b.employeeId === req.employeeId && b.leaveTypeKey === req.leaveTypeKey,
      )
      if (bal) bal.pendingDays = Math.max(0, bal.pendingDays - req.totalDays)
    }

    return {
      types,
      requests,
      balances,
      pendingCount,
      onLeaveTodayCount,
      byEmployee,
      balancesFor,
      pendingForManager,
      apply,
      approve,
      reject,
      cancel,
    }
  },
  { persist: { pick: ['requests', 'balances'] } },
)
