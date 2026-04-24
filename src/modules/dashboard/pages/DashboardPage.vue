<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Users, Clock, Plane, Inbox, LogIn, FileText } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useAttendanceStore } from '@/modules/attendance/stores/attendance'
import { useLeaveStore } from '@/modules/leave/stores/leave'
import { useEmployeeStore } from '@/modules/employee/stores/employee'
import { useLocale } from '@/composables/useLocale'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const attendance = useAttendanceStore()
const leave = useLeaveStore()
const employee = useEmployeeStore()
const { date: fmtDate } = useLocale()

const activeEmployees = computed(() => employee.active.length)
const teamSize = computed(() =>
  auth.currentEmployee ? employee.byManager(auth.currentEmployee.id).length : 0,
)

const scopeForRole = computed(() => {
  if (auth.currentRole === 'hr_admin') return activeEmployees.value
  if (auth.currentRole === 'manager') return teamSize.value
  return 1
})

const pendingForMe = computed(() => {
  if (auth.currentRole === 'hr_admin') return leave.pendingCount
  if (auth.currentRole === 'manager' && auth.currentEmployee)
    return leave.pendingForManager(auth.currentEmployee.id).length
  return leave.byEmployee(auth.currentEmployee?.id ?? ('EMP-00000' as never)).filter(
    (r) => r.status === 'pending',
  ).length
})

const stats = computed(() => [
  {
    label: t('nav.employees'),
    value: scopeForRole.value,
    icon: Users,
    tone: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50',
    to: '/employees',
  },
  {
    label: t('dashboard.presentToday'),
    value: attendance.presentTodayCount,
    icon: Clock,
    tone: 'text-green-600 bg-green-50 dark:bg-green-950/50',
    to: '/attendance/team',
  },
  {
    label: t('dashboard.onLeaveToday'),
    value: leave.onLeaveTodayCount,
    icon: Plane,
    tone: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50',
    to: '/leave/approvals',
  },
  {
    label: t('dashboard.pendingApprovals'),
    value: pendingForMe.value,
    icon: Inbox,
    tone: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50',
    to: '/approvals',
  },
])

const trend = computed(() => attendance.presentTrend(7))
const chartData = computed(() => ({
  labels: trend.value.map((d) => fmtDate(d.date, 'd MMM')),
  datasets: [
    {
      label: t('dashboard.presentToday'),
      data: trend.value.map((d) => d.count),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
}

const recentActivity = computed(() => {
  const leaves = leave.requests
    .slice(-8)
    .map((r) => {
      const e = employee.byId(r.employeeId)
      return {
        id: r.id,
        when: r.submittedAt,
        text: `${e?.firstNameTh ?? ''} ${e?.lastNameTh ?? ''} ยื่นใบลา ${r.totalDays} วัน (${r.status})`,
      }
    })
    .sort((a, b) => b.when.localeCompare(a.when))
  return leaves.slice(0, 10)
})

const quickActions = computed(() => [
  { label: t('dashboard.clockInOut'), icon: LogIn, to: '/attendance' },
  { label: t('dashboard.applyLeave'), icon: Plane, to: '/leave/apply' },
  { label: t('dashboard.myPayslip'), icon: FileText, to: '/payroll/my' },
])
</script>

<template>
  <div>
    <PageHeader
      :title="t('nav.dashboard')"
      :description="auth.currentRole ? t(`role.${auth.currentRole}`) : ''"
    />

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card
        v-for="s in stats"
        :key="s.label"
        class="cursor-pointer hover:shadow-md transition"
        @click="router.push(s.to)"
      >
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">
            {{ s.label }}
          </CardTitle>
          <div :class="`h-8 w-8 rounded-md flex items-center justify-center ${s.tone}`">
            <component :is="s.icon" class="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-bold">{{ s.value }}</div>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Chart -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>{{ t('dashboard.attendanceTrend') }}</CardTitle>
          <CardDescription>{{ t('dashboard.attendanceTrendDesc') }}</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-64">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </CardContent>
      </Card>

      <!-- Quick Actions -->
      <Card>
        <CardHeader>
          <CardTitle>{{ t('dashboard.quickActions') }}</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <Button
            v-for="a in quickActions"
            :key="a.label"
            variant="outline"
            class="w-full justify-start"
            @click="router.push(a.to)"
          >
            <component :is="a.icon" class="mr-2 h-4 w-4" />
            {{ a.label }}
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Activity -->
    <Card class="mt-4">
      <CardHeader>
        <CardTitle>{{ t('dashboard.recentActivity') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul class="divide-y">
          <li
            v-for="act in recentActivity"
            :key="act.id"
            class="py-2 flex items-center justify-between text-sm"
          >
            <span>{{ act.text }}</span>
            <span class="text-xs text-muted-foreground">{{ fmtDate(act.when, 'd MMM HH:mm') }}</span>
          </li>
          <li v-if="recentActivity.length === 0" class="py-4 text-center text-sm text-muted-foreground">
            {{ t('dashboard.noActivity') }}
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
