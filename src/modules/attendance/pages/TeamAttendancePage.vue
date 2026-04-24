<script setup lang="ts">
import { computed, ref } from 'vue'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useAttendanceStore } from '@/modules/attendance/stores/attendance'
import { useEmployeeStore } from '@/modules/employee/stores/employee'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useAppStore } from '@/stores/app'
import { useLocale } from '@/composables/useLocale'

const attendance = useAttendanceStore()
const employee = useEmployeeStore()
const auth = useAuthStore()
const app = useAppStore()
const { time: fmtTime, date: fmtDate } = useLocale()

const selectedDate = ref(new Date().toISOString().slice(0, 10))

const scopedRecords = computed(() => {
  const records = attendance.records.filter((r) => r.date === selectedDate.value)
  if (auth.hasPermission('attendance.view_all')) return records
  if (auth.currentEmployee) {
    const teamIds = employee.byManager(auth.currentEmployee.id).map((e) => e.id)
    return records.filter((r) => teamIds.includes(r.employeeId))
  }
  return []
})

function nameOf(id: string) {
  const e = employee.byId(id as never)
  if (!e) return id
  return app.locale === 'th'
    ? `${e.firstNameTh} ${e.lastNameTh}`
    : `${e.firstNameEn} ${e.lastNameEn}`
}

const summary = computed(() => {
  const s = { present: 0, late: 0, absent: 0, leave: 0, other: 0 }
  for (const r of scopedRecords.value) {
    if (r.status === 'present') s.present++
    else if (r.status === 'late') s.late++
    else if (r.status === 'absent') s.absent++
    else if (r.status === 'leave') s.leave++
    else s.other++
  }
  return s
})
</script>

<template>
  <div>
    <PageHeader title="Team Attendance" :description="fmtDate(selectedDate)" />

    <div class="mb-4 flex items-end gap-3">
      <div class="space-y-1">
        <Label>Date</Label>
        <Input v-model="selectedDate" type="date" class="w-48" />
      </div>
      <div class="flex gap-2 flex-wrap">
        <Badge variant="default">Present: {{ summary.present }}</Badge>
        <Badge variant="destructive">Late: {{ summary.late }}</Badge>
        <Badge variant="destructive">Absent: {{ summary.absent }}</Badge>
        <Badge variant="secondary">Leave: {{ summary.leave }}</Badge>
      </div>
    </div>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Late</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="r in scopedRecords" :key="r.id">
            <TableCell>{{ nameOf(r.employeeId) }}</TableCell>
            <TableCell><Badge class="capitalize">{{ r.status }}</Badge></TableCell>
            <TableCell class="font-mono">{{ r.clockInAt ? fmtTime(r.clockInAt) : '—' }}</TableCell>
            <TableCell class="font-mono">{{ r.clockOutAt ? fmtTime(r.clockOutAt) : '—' }}</TableCell>
            <TableCell>{{ r.lateMinutes > 0 ? `${r.lateMinutes}m` : '—' }}</TableCell>
          </TableRow>
          <TableRow v-if="scopedRecords.length === 0">
            <TableCell colspan="5" class="text-center py-8 text-muted-foreground">No records for this date</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
