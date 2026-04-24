<script setup lang="ts">
import { computed } from 'vue'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { useAttendanceStore } from '@/modules/attendance/stores/attendance'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useLocale } from '@/composables/useLocale'

const auth = useAuthStore()
const attendance = useAttendanceStore()
const { date: fmtDate, time: fmtTime } = useLocale()

const myRecords = computed(() =>
  auth.currentEmployee
    ? attendance.byEmployee(auth.currentEmployee.id).slice(-30).reverse()
    : [],
)

const statusVariant: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  present: 'default',
  late: 'destructive',
  absent: 'destructive',
  leave: 'secondary',
  holiday: 'outline',
  weekend: 'outline',
}
</script>

<template>
  <div>
    <PageHeader title="My Attendance" description="Last 30 days" />

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Worked</TableHead>
            <TableHead>Late</TableHead>
            <TableHead>OT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="r in myRecords" :key="r.id">
            <TableCell>{{ fmtDate(r.date) }}</TableCell>
            <TableCell>
              <Badge :variant="statusVariant[r.status]" class="capitalize">{{ r.status }}</Badge>
            </TableCell>
            <TableCell class="font-mono">{{ r.clockInAt ? fmtTime(r.clockInAt) : '—' }}</TableCell>
            <TableCell class="font-mono">{{ r.clockOutAt ? fmtTime(r.clockOutAt) : '—' }}</TableCell>
            <TableCell>{{ r.workedMinutes > 0 ? `${Math.floor(r.workedMinutes / 60)}h ${r.workedMinutes % 60}m` : '—' }}</TableCell>
            <TableCell>
              <span v-if="r.lateMinutes > 0" class="text-destructive">{{ r.lateMinutes }}m</span>
              <span v-else>—</span>
            </TableCell>
            <TableCell>
              <span v-if="r.otWeekdayMinutes > 0">{{ r.otWeekdayMinutes }}m</span>
              <span v-else>—</span>
            </TableCell>
          </TableRow>
          <TableRow v-if="myRecords.length === 0">
            <TableCell colspan="7">
              <EmptyState title="No attendance records" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
