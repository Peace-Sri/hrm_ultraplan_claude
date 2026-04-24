<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Pencil, Trash2, ArrowLeft, Mail, Phone, MapPin, Calendar, CreditCard } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import RoleGate from '@/components/shared/RoleGate.vue'
import { useEmployeeStore } from '@/modules/employee/stores/employee'
import { useAttendanceStore } from '@/modules/attendance/stores/attendance'
import { useLeaveStore } from '@/modules/leave/stores/leave'
import { usePayrollStore } from '@/modules/payroll/stores/payroll'
import { useAppStore } from '@/stores/app'
import { useLocale } from '@/composables/useLocale'
import { formatThaiID } from '@/lib/thai-id'
import { toast } from 'vue-sonner'
import type { ID } from '@/types/common'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const employee = useEmployeeStore()
const attendance = useAttendanceStore()
const leave = useLeaveStore()
const payroll = usePayrollStore()
const app = useAppStore()
const { thb, date } = useLocale()

const showDeleteDialog = ref(false)

const id = computed(() => route.params.id as ID<'EMP'>)
const emp = computed(() => employee.byId(id.value))

const name = computed(() => {
  if (!emp.value) return ''
  return app.locale === 'th'
    ? `${emp.value.titleTh}${emp.value.firstNameTh} ${emp.value.lastNameTh}`
    : `${emp.value.titleEn}. ${emp.value.firstNameEn} ${emp.value.lastNameEn}`
})

const initials = computed(() => {
  if (!emp.value) return '?'
  return `${emp.value.firstNameEn[0] ?? ''}${emp.value.lastNameEn[0] ?? ''}`.toUpperCase()
})

const attendanceRecords = computed(() => (emp.value ? attendance.byEmployee(emp.value.id).slice(-10).reverse() : []))
const leaveHistory = computed(() => (emp.value ? leave.byEmployee(emp.value.id) : []))
const payslipHistory = computed(() => (emp.value ? payroll.byEmployee(emp.value.id) : []))

function onDelete() {
  if (!emp.value) return
  try {
    employee.softDelete(emp.value.id)
    toast.success(t('common.success'))
    router.replace('/employees')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
  }
}
</script>

<template>
  <div v-if="!emp">
    <EmptyState title="Employee not found" />
  </div>
  <div v-else>
    <Button variant="ghost" size="sm" class="mb-3" @click="router.back()">
      <ArrowLeft class="h-4 w-4 mr-1" />
      {{ t('common.back') }}
    </Button>

    <PageHeader :title="name" :description="emp.employeeNo">
      <template #actions>
        <RoleGate requires="employee.edit">
          <Button variant="outline" @click="router.push(`/employees/${emp.id}/edit`)">
            <Pencil class="mr-2 h-4 w-4" />
            {{ t('common.edit') }}
          </Button>
        </RoleGate>
        <RoleGate requires="employee.delete">
          <AlertDialog v-model:open="showDeleteDialog">
            <AlertDialogTrigger as-child>
              <Button variant="destructive">
                <Trash2 class="mr-2 h-4 w-4" />
                {{ t('common.delete') }}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {{ name }}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This marks the employee as terminated (soft delete). You can reactivate later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{{ t('common.cancel') }}</AlertDialogCancel>
                <AlertDialogAction @click="onDelete">{{ t('common.confirm') }}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </RoleGate>
      </template>
    </PageHeader>

    <div class="flex items-start gap-6 mb-6">
      <Avatar class="h-24 w-24">
        <AvatarFallback class="text-2xl">{{ initials }}</AvatarFallback>
      </Avatar>
      <div class="flex-1 space-y-1">
        <div class="flex items-center gap-2">
          <Badge>{{ employee.getDepartmentName(emp.departmentId, app.locale) }}</Badge>
          <Badge variant="outline">{{ employee.getPositionName(emp.positionId, app.locale) }}</Badge>
          <Badge :variant="emp.status === 'active' ? 'default' : 'secondary'">{{ emp.status }}</Badge>
        </div>
        <p class="text-sm text-muted-foreground flex items-center gap-1">
          <Mail class="h-3.5 w-3.5" />{{ emp.email }}
        </p>
        <p class="text-sm text-muted-foreground flex items-center gap-1">
          <Phone class="h-3.5 w-3.5" />{{ emp.phone }}
        </p>
      </div>
    </div>

    <Tabs default-value="personal">
      <TabsList>
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="work">Work</TabsTrigger>
        <TabsTrigger value="compensation">Compensation</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="personal">
        <Card>
          <CardContent class="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><div class="text-xs text-muted-foreground">Thai ID</div><div class="font-mono">{{ formatThaiID(emp.thaiId) }}</div></div>
            <div><div class="text-xs text-muted-foreground">Date of Birth</div><div>{{ date(emp.dob) }}</div></div>
            <div><div class="text-xs text-muted-foreground">Gender</div><div class="capitalize">{{ emp.gender }}</div></div>
            <div class="md:col-span-2"><div class="text-xs text-muted-foreground flex items-center gap-1"><MapPin class="h-3 w-3" />Address</div>
              <div>{{ emp.address.addressLine }}, {{ emp.address.tambon }}, {{ emp.address.amphoe }}, {{ emp.address.changwat }} {{ emp.address.zipCode }}</div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="work">
        <Card>
          <CardContent class="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><div class="text-xs text-muted-foreground">Department</div><div>{{ employee.getDepartmentName(emp.departmentId, app.locale) }}</div></div>
            <div><div class="text-xs text-muted-foreground">Position</div><div>{{ employee.getPositionName(emp.positionId, app.locale) }}</div></div>
            <div><div class="text-xs text-muted-foreground flex items-center gap-1"><Calendar class="h-3 w-3" />Start Date</div><div>{{ date(emp.startDate) }}</div></div>
            <div v-if="emp.probationEndDate"><div class="text-xs text-muted-foreground">Probation End</div><div>{{ date(emp.probationEndDate) }}</div></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="compensation">
        <Card>
          <CardContent class="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><div class="text-xs text-muted-foreground">Base Salary</div><div class="font-semibold">{{ thb(emp.baseSalary) }}</div></div>
            <div><div class="text-xs text-muted-foreground">Monthly Allowances</div><div>{{ thb(emp.monthlyAllowances) }}</div></div>
            <div><div class="text-xs text-muted-foreground">PVD Rate</div><div>{{ (emp.pvdRate * 100).toFixed(1) }}%</div></div>
            <div><div class="text-xs text-muted-foreground flex items-center gap-1"><CreditCard class="h-3 w-3" />Bank</div><div>{{ emp.bankCode }} — {{ emp.bankAccount }}</div></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader>
          <CardContent>
            <ul class="space-y-1 text-sm">
              <li v-for="a in attendanceRecords" :key="a.id" class="flex justify-between">
                <span>{{ date(a.date) }}</span>
                <Badge :variant="a.status === 'present' ? 'default' : 'secondary'" class="capitalize">{{ a.status }}</Badge>
              </li>
              <li v-if="attendanceRecords.length === 0" class="text-muted-foreground">No records</li>
            </ul>
          </CardContent>
        </Card>
        <Card class="mt-4">
          <CardHeader><CardTitle>Leave History</CardTitle></CardHeader>
          <CardContent>
            <ul class="space-y-1 text-sm">
              <li v-for="l in leaveHistory" :key="l.id" class="flex justify-between">
                <span>{{ l.leaveTypeKey }} — {{ date(l.startDate) }} ({{ l.totalDays }}d)</span>
                <Badge :variant="l.status === 'approved' ? 'default' : l.status === 'pending' ? 'outline' : 'secondary'">{{ l.status }}</Badge>
              </li>
              <li v-if="leaveHistory.length === 0" class="text-muted-foreground">No leave records</li>
            </ul>
          </CardContent>
        </Card>
        <Card class="mt-4">
          <CardHeader><CardTitle>Payslip History</CardTitle></CardHeader>
          <CardContent>
            <ul class="space-y-1 text-sm">
              <li v-for="p in payslipHistory" :key="p.id" class="flex justify-between">
                <span>{{ date(p.period, 'MMM yyyy') }}</span>
                <span class="font-semibold">{{ thb(p.netPay) }}</span>
              </li>
              <li v-if="payslipHistory.length === 0" class="text-muted-foreground">No payslips</li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
