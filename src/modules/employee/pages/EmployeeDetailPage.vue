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

const NAT_LABELS: Record<string, string> = {
  TH: 'ไทย 🇹🇭',
  MM: 'เมียนมา 🇲🇲',
  KH: 'กัมพูชา 🇰🇭',
  LA: 'ลาว 🇱🇦',
  VN: 'เวียดนาม 🇻🇳',
  OTHER: 'อื่นๆ',
}
function natLabel(n: string) {
  return NAT_LABELS[n] ?? n
}

function genderLabel(g: string) {
  return g === 'male' ? 'ชาย' : g === 'female' ? 'หญิง' : 'อื่นๆ'
}

function expiryClass(dateStr: string): string {
  const days = (new Date(dateStr).getTime() - Date.now()) / 86400000
  if (days < 0) return 'text-destructive font-semibold'
  if (days < 30) return 'text-destructive'
  if (days < 90) return 'text-orange-600'
  return 'text-muted-foreground'
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
        <TabsTrigger value="personal">{{ t('employee.tabs.personal') }}</TabsTrigger>
        <TabsTrigger value="work">{{ t('employee.tabs.work') }}</TabsTrigger>
        <TabsTrigger value="compensation">{{ t('employee.tabs.compensation') }}</TabsTrigger>
        <TabsTrigger value="onboarding">{{ t('employee.tabs.onboarding') }}</TabsTrigger>
        <TabsTrigger value="history">{{ t('employee.tabs.history') }}</TabsTrigger>
      </TabsList>

      <TabsContent value="personal">
        <Card>
          <CardContent class="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-muted-foreground">สัญชาติ</div>
              <div class="flex items-center gap-2">
                <Badge>{{ natLabel(emp.nationality) }}</Badge>
              </div>
            </div>
            <div v-if="emp.nationality === 'TH' && emp.thaiId">
              <div class="text-xs text-muted-foreground">เลขบัตรประชาชน</div>
              <div class="font-mono">{{ formatThaiID(emp.thaiId) }}</div>
            </div>
            <template v-else-if="emp.foreign">
              <div>
                <div class="text-xs text-muted-foreground">บัตรชมพู (Work Permit)</div>
                <div class="font-mono">{{ emp.foreign.workPermitNo }}</div>
                <div v-if="emp.foreign.workPermitExpiry" class="text-xs" :class="expiryClass(emp.foreign.workPermitExpiry)">
                  หมดอายุ: {{ date(emp.foreign.workPermitExpiry) }}
                </div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">หนังสือเดินทาง (Passport)</div>
                <div class="font-mono">{{ emp.foreign.passportNo }}</div>
                <div v-if="emp.foreign.passportExpiry" class="text-xs" :class="expiryClass(emp.foreign.passportExpiry)">
                  หมดอายุ: {{ date(emp.foreign.passportExpiry) }}
                </div>
              </div>
              <div v-if="emp.foreign.visaType">
                <div class="text-xs text-muted-foreground">วีซ่า (Visa)</div>
                <div>{{ emp.foreign.visaType }}</div>
                <div v-if="emp.foreign.visaExpiry" class="text-xs" :class="expiryClass(emp.foreign.visaExpiry)">
                  หมดอายุ: {{ date(emp.foreign.visaExpiry) }}
                </div>
              </div>
              <div v-if="emp.foreign.entryDate">
                <div class="text-xs text-muted-foreground">วันเข้าประเทศ</div>
                <div>{{ date(emp.foreign.entryDate) }}</div>
              </div>
            </template>
            <div><div class="text-xs text-muted-foreground">วันเกิด</div><div>{{ date(emp.dob) }}</div></div>
            <div><div class="text-xs text-muted-foreground">เพศ</div><div>{{ genderLabel(emp.gender) }}</div></div>
            <div class="md:col-span-2">
              <div class="text-xs text-muted-foreground flex items-center gap-1"><MapPin class="h-3 w-3" />ที่อยู่</div>
              <div>{{ emp.address.addressLine }}, {{ emp.address.tambon }}, {{ emp.address.amphoe }}, {{ emp.address.changwat }} {{ emp.address.zipCode }}</div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="work">
        <Card>
          <CardContent class="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><div class="text-xs text-muted-foreground">{{ t('employee.fields.department') }}</div><div>{{ employee.getDepartmentName(emp.departmentId, app.locale) }}</div></div>
            <div><div class="text-xs text-muted-foreground">{{ t('employee.fields.position') }}</div><div>{{ employee.getPositionName(emp.positionId, app.locale) }}</div></div>
            <div><div class="text-xs text-muted-foreground flex items-center gap-1"><Calendar class="h-3 w-3" />{{ t('employee.fields.startDate') }}</div><div>{{ date(emp.startDate) }}</div></div>
            <div v-if="emp.probationEndDate"><div class="text-xs text-muted-foreground">{{ t('employee.fields.probationEnd') }}</div><div>{{ date(emp.probationEndDate) }}</div></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="compensation">
        <Card>
          <CardContent class="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><div class="text-xs text-muted-foreground">{{ t('employee.fields.baseSalary') }}</div><div class="font-semibold">{{ thb(emp.baseSalary) }}</div></div>
            <div><div class="text-xs text-muted-foreground">{{ t('employee.fields.allowances') }}</div><div>{{ thb(emp.monthlyAllowances) }}</div></div>
            <div><div class="text-xs text-muted-foreground">{{ t('employee.fields.pvdRate') }}</div><div>{{ (emp.pvdRate * 100).toFixed(1) }}%</div></div>
            <div><div class="text-xs text-muted-foreground flex items-center gap-1"><CreditCard class="h-3 w-3" />{{ t('employee.fields.bank') }}</div><div>{{ emp.bankCode }} — {{ emp.bankAccount }}</div></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="onboarding">
        <div v-if="!emp.onboarding">
          <Card>
            <CardContent class="pt-6">
              <EmptyState :title="t('employee.onboarding.noData')" />
            </CardContent>
          </Card>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Emergency Contact -->
          <Card v-if="emp.onboarding.emergencyContact">
            <CardHeader>
              <CardTitle class="text-base">{{ t('employee.onboarding.emergencyContact') }}</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <div class="grid grid-cols-3 gap-1">
                <span class="text-muted-foreground">{{ t('employee.onboarding.name') }}</span>
                <span class="col-span-2">{{ emp.onboarding.emergencyContact.name }}</span>
              </div>
              <div class="grid grid-cols-3 gap-1">
                <span class="text-muted-foreground">{{ t('employee.onboarding.relationship') }}</span>
                <span class="col-span-2">{{ emp.onboarding.emergencyContact.relationship }}</span>
              </div>
              <div class="grid grid-cols-3 gap-1">
                <span class="text-muted-foreground">{{ t('employee.onboarding.phone') }}</span>
                <span class="col-span-2 font-mono">{{ emp.onboarding.emergencyContact.phone }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- Education -->
          <Card v-if="emp.onboarding.education">
            <CardHeader>
              <CardTitle class="text-base">{{ t('employee.onboarding.education') }}</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <div class="grid grid-cols-3 gap-1">
                <span class="text-muted-foreground">{{ t('employee.onboarding.level') }}</span>
                <span class="col-span-2">{{ t(`employee.edu.${emp.onboarding.education.level}`) }}</span>
              </div>
              <div class="grid grid-cols-3 gap-1">
                <span class="text-muted-foreground">{{ t('employee.onboarding.institution') }}</span>
                <span class="col-span-2">{{ emp.onboarding.education.institution }}</span>
              </div>
              <div v-if="emp.onboarding.education.field" class="grid grid-cols-3 gap-1">
                <span class="text-muted-foreground">{{ t('employee.onboarding.field') }}</span>
                <span class="col-span-2">{{ emp.onboarding.education.field }}</span>
              </div>
              <div v-if="emp.onboarding.education.graduationYear" class="grid grid-cols-3 gap-1">
                <span class="text-muted-foreground">{{ t('employee.onboarding.graduationYear') }}</span>
                <span class="col-span-2">{{ emp.onboarding.education.graduationYear }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- Documents -->
          <Card class="md:col-span-2">
            <CardHeader>
              <CardTitle class="text-base">{{ t('employee.onboarding.documents') }}</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div
                  v-for="(received, key) in emp.onboarding.documents"
                  :key="key"
                  class="flex items-center justify-between p-2 rounded-md border text-sm"
                >
                  <span>{{ t(`employee.onboarding.docs.${key}`) }}</span>
                  <Badge :variant="received ? 'default' : 'secondary'">
                    {{ received ? '✓' : '—' }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Equipment -->
          <Card v-if="emp.onboarding.equipment">
            <CardHeader>
              <CardTitle class="text-base">{{ t('employee.onboarding.equipment') }}</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <div v-if="emp.onboarding.equipment.laptop" class="grid grid-cols-3 gap-1">
                <span class="text-muted-foreground">{{ t('employee.onboarding.laptop') }}</span>
                <span class="col-span-2 font-mono text-xs">{{ emp.onboarding.equipment.laptop }}</span>
              </div>
              <div v-if="emp.onboarding.equipment.badge" class="grid grid-cols-3 gap-1">
                <span class="text-muted-foreground">{{ t('employee.onboarding.badge') }}</span>
                <span class="col-span-2 font-mono">{{ emp.onboarding.equipment.badge }}</span>
              </div>
              <div v-if="emp.onboarding.equipment.phone" class="grid grid-cols-3 gap-1">
                <span class="text-muted-foreground">{{ t('employee.onboarding.phoneEquip') }}</span>
                <span class="col-span-2">{{ emp.onboarding.equipment.phone }}</span>
              </div>
              <div v-if="emp.onboarding.equipment.other?.length" class="grid grid-cols-3 gap-1">
                <span class="text-muted-foreground">{{ t('employee.onboarding.otherEquip') }}</span>
                <span class="col-span-2">{{ emp.onboarding.equipment.other.join(', ') }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- Checklist -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">{{ t('employee.onboarding.checklist') }}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-1.5 text-sm">
                <li
                  v-for="(done, key) in emp.onboarding.checklist"
                  :key="key"
                  class="flex items-center justify-between"
                >
                  <span>{{ t(`employee.onboarding.check.${key}`) }}</span>
                  <Badge :variant="done ? 'default' : 'outline'">
                    {{ done ? '✓' : '○' }}
                  </Badge>
                </li>
              </ul>
            </CardContent>
          </Card>

          <!-- Previous Employers -->
          <Card v-if="emp.onboarding.previousEmployers?.length" class="md:col-span-2">
            <CardHeader>
              <CardTitle class="text-base">{{ t('employee.onboarding.previousEmployers') }}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-3">
                <li v-for="(prev, idx) in emp.onboarding.previousEmployers" :key="idx" class="text-sm border-l-2 pl-3">
                  <div class="font-medium">{{ prev.company }}</div>
                  <div class="text-muted-foreground">{{ prev.position }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ date(prev.startDate) }} – {{ date(prev.endDate) }}
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <!-- Notes -->
          <Card v-if="emp.onboarding.notes" class="md:col-span-2">
            <CardHeader>
              <CardTitle class="text-base">{{ t('employee.onboarding.notes') }}</CardTitle>
            </CardHeader>
            <CardContent class="text-sm">{{ emp.onboarding.notes }}</CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader><CardTitle>{{ t('employee.detail.recentAttendance') }}</CardTitle></CardHeader>
          <CardContent>
            <ul class="space-y-1 text-sm">
              <li v-for="a in attendanceRecords" :key="a.id" class="flex justify-between">
                <span>{{ date(a.date) }}</span>
                <Badge :variant="a.status === 'present' ? 'default' : 'secondary'">{{ t(`attendance.recordStatus.${a.status}`) }}</Badge>
              </li>
              <li v-if="attendanceRecords.length === 0" class="text-muted-foreground">{{ t('employee.detail.noRecords') }}</li>
            </ul>
          </CardContent>
        </Card>
        <Card class="mt-4">
          <CardHeader><CardTitle>{{ t('employee.detail.leaveHistory') }}</CardTitle></CardHeader>
          <CardContent>
            <ul class="space-y-1 text-sm">
              <li v-for="l in leaveHistory" :key="l.id" class="flex justify-between">
                <span>{{ t(`leave.types.${l.leaveTypeKey}`) }} — {{ date(l.startDate) }} ({{ l.totalDays }}{{ t('leave.days').slice(0, 1) }})</span>
                <Badge :variant="l.status === 'approved' ? 'default' : l.status === 'pending' ? 'outline' : 'secondary'">{{ t(`leave.status.${l.status}`) }}</Badge>
              </li>
              <li v-if="leaveHistory.length === 0" class="text-muted-foreground">{{ t('employee.detail.noLeaves') }}</li>
            </ul>
          </CardContent>
        </Card>
        <Card class="mt-4">
          <CardHeader><CardTitle>{{ t('employee.detail.payslipHistory') }}</CardTitle></CardHeader>
          <CardContent>
            <ul class="space-y-1 text-sm">
              <li v-for="p in payslipHistory" :key="p.id" class="flex justify-between">
                <span>{{ date(p.period, 'MMM yyyy') }}</span>
                <span class="font-semibold">{{ thb(p.netPay) }}</span>
              </li>
              <li v-if="payslipHistory.length === 0" class="text-muted-foreground">{{ t('employee.detail.noPayslips') }}</li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
