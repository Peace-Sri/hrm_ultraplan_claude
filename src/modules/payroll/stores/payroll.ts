import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Payslip } from '@/types/payroll'
import type { ID } from '@/types/common'
import { buildPayslips } from '@/lib/mock-seed'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useAttendanceStore } from '@/modules/attendance/stores/attendance'

export const usePayrollStore = defineStore(
  'payroll',
  () => {
    const auth = useAuthStore()
    const attendance = useAttendanceStore()
    const payslips = ref<Payslip[]>(buildPayslips(auth.allEmployees, attendance.records))

    const byEmployee = (employeeId: ID<'EMP'>) =>
      payslips.value.filter((p) => p.employeeId === employeeId).sort((a, b) => b.period.localeCompare(a.period))

    const forPeriod = (year: number, month: number) =>
      payslips.value.filter((p) => p.year === year && p.month === month)

    const latestForSelf = computed(() => {
      const emp = auth.currentEmployee
      if (!emp) return null
      return byEmployee(emp.id)[0] ?? null
    })

    const totalPayrollThisMonth = computed(() => {
      const now = new Date()
      return forPeriod(now.getFullYear(), now.getMonth() + 1).reduce((s, p) => s + p.netPay, 0)
    })

    return { payslips, byEmployee, forPeriod, latestForSelf, totalPayrollThisMonth }
  },
  { persist: { pick: ['payslips'] } },
)
