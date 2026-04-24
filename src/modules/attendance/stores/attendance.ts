import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AttendanceRecord } from '@/types/attendance'
import type { ID } from '@/types/common'
import { buildAttendance } from '@/lib/mock-seed'
import { useAuthStore } from '@/modules/auth/stores/auth'

export const useAttendanceStore = defineStore(
  'attendance',
  () => {
    const auth = useAuthStore()
    const records = ref<AttendanceRecord[]>(buildAttendance(auth.allEmployees, 30))

    const todayISO = () => new Date().toISOString().slice(0, 10)

    const todayRecords = computed(() => records.value.filter((r) => r.date === todayISO()))
    const presentTodayCount = computed(
      () => todayRecords.value.filter((r) => r.status === 'present' || r.status === 'late').length,
    )

    function byEmployee(employeeId: ID<'EMP'>) {
      return records.value.filter((r) => r.employeeId === employeeId)
    }

    function byTeam(managerEmployeeId: ID<'EMP'>) {
      const teamIds = auth.allEmployees.filter((e) => e.managerId === managerEmployeeId).map((e) => e.id)
      return records.value.filter((r) => teamIds.includes(r.employeeId))
    }

    /** Count present per day for last N days. */
    function presentTrend(days = 7): Array<{ date: string; count: number }> {
      const today = new Date()
      return Array.from({ length: days }).map((_, i) => {
        const d = new Date(today.getTime() - (days - 1 - i) * 86400000)
        const iso = d.toISOString().slice(0, 10)
        const count = records.value.filter(
          (r) => r.date === iso && (r.status === 'present' || r.status === 'late'),
        ).length
        return { date: iso, count }
      })
    }

    /** Record a clock event (used in Phase 8). */
    function clockIn(
      employeeId: ID<'EMP'>,
      method: AttendanceRecord['clockInMethod'],
      lat?: number,
      lng?: number,
      distanceMeters?: number,
    ): AttendanceRecord {
      auth.requirePermission('attendance.clock_self')
      const today = todayISO()
      const existing = records.value.find((r) => r.employeeId === employeeId && r.date === today)
      if (existing && existing.clockInAt) return existing

      const shiftStart = new Date()
      shiftStart.setHours(8, 30, 0, 0)
      const now = new Date()
      const lateMin = Math.max(0, Math.floor((now.getTime() - shiftStart.getTime()) / 60000))

      const rec: AttendanceRecord = existing ?? {
        id: `ATT-${today}-${employeeId}` as AttendanceRecord['id'],
        employeeId,
        date: today,
        shiftId: 'SFT-DAY',
        status: lateMin > 15 ? 'late' : 'present',
        lateMinutes: lateMin,
        workedMinutes: 0,
        otWeekdayMinutes: 0,
        otHolidayRegMinutes: 0,
        otHolidayExtraMinutes: 0,
      }
      rec.clockInAt = now.toISOString()
      rec.clockInMethod = method
      rec.clockInLat = lat
      rec.clockInLng = lng
      rec.clockInDistanceMeters = distanceMeters
      rec.status = lateMin > 15 ? 'late' : 'present'
      rec.lateMinutes = lateMin

      if (!existing) records.value.push(rec)
      return rec
    }

    function clockOut(
      employeeId: ID<'EMP'>,
      method: AttendanceRecord['clockOutMethod'],
      lat?: number,
      lng?: number,
      distanceMeters?: number,
    ): AttendanceRecord | undefined {
      auth.requirePermission('attendance.clock_self')
      const today = todayISO()
      const rec = records.value.find((r) => r.employeeId === employeeId && r.date === today)
      if (!rec || !rec.clockInAt) return undefined
      const now = new Date()
      rec.clockOutAt = now.toISOString()
      rec.clockOutMethod = method
      rec.clockOutLat = lat
      rec.clockOutLng = lng
      rec.clockOutDistanceMeters = distanceMeters
      const inMs = new Date(rec.clockInAt).getTime()
      rec.workedMinutes = Math.floor((now.getTime() - inMs) / 60000) - 60
      const shiftEndMs = new Date(inMs)
      shiftEndMs.setHours(17, 30, 0, 0)
      rec.otWeekdayMinutes = Math.max(0, Math.floor((now.getTime() - shiftEndMs.getTime()) / 60000))
      return rec
    }

    return {
      records,
      todayRecords,
      presentTodayCount,
      byEmployee,
      byTeam,
      presentTrend,
      clockIn,
      clockOut,
    }
  },
  {
    persist: { pick: ['records'] },
  },
)
