<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Search } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PageHeader from '@/components/shared/PageHeader.vue'
import { usePayrollStore } from '@/modules/payroll/stores/payroll'
import { useEmployeeStore } from '@/modules/employee/stores/employee'
import { useAppStore } from '@/stores/app'
import { useLocale } from '@/composables/useLocale'

const { t } = useI18n()
const router = useRouter()
const payroll = usePayrollStore()
const employee = useEmployeeStore()
const app = useAppStore()
const { thb } = useLocale()

const search = ref('')

const now = new Date()
const thisMonth = computed(() => payroll.forPeriod(now.getFullYear(), now.getMonth() + 1))

const filtered = computed(() => {
  if (!search.value) return thisMonth.value
  const q = search.value.toLowerCase()
  return thisMonth.value.filter((p) => {
    const e = employee.byId(p.employeeId)
    return (
      e?.firstNameEn.toLowerCase().includes(q) ||
      e?.lastNameEn.toLowerCase().includes(q) ||
      e?.firstNameTh.includes(search.value) ||
      e?.lastNameTh.includes(search.value) ||
      e?.employeeNo.toLowerCase().includes(q)
    )
  })
})

const totalNet = computed(() => filtered.value.reduce((s, p) => s + p.netPay, 0))
const totalGross = computed(() => filtered.value.reduce((s, p) => s + p.earnings.total, 0))
const totalDed = computed(() => filtered.value.reduce((s, p) => s + p.deductions.total, 0))

function nameOf(id: string) {
  const e = employee.byId(id as never)
  if (!e) return id
  return app.locale === 'th'
    ? `${e.firstNameTh} ${e.lastNameTh}`
    : `${e.firstNameEn} ${e.lastNameEn}`
}
</script>

<template>
  <div>
    <PageHeader :title="t('payroll.employeePayslips')" :description="`${now.toLocaleString('th', { month: 'long', year: 'numeric' })}`" />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <Card>
        <CardContent class="pt-4">
          <div class="text-xs text-muted-foreground">{{ t('payroll.stats.totalGross') }}</div>
          <div class="text-xl font-bold">{{ thb(totalGross) }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-4">
          <div class="text-xs text-muted-foreground">{{ t('payroll.stats.totalDed') }}</div>
          <div class="text-xl font-bold text-destructive">{{ thb(totalDed) }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-4">
          <div class="text-xs text-muted-foreground">{{ t('payroll.stats.totalNet') }}</div>
          <div class="text-xl font-bold text-primary">{{ thb(totalNet) }}</div>
        </CardContent>
      </Card>
    </div>

    <div class="mb-4 relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input v-model="search" :placeholder="t('payroll.searchPlaceholder')" class="pl-9 max-w-md" />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>{{ filtered.length }} {{ t('payroll.payslip') }}</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t('leave.table.employee') }}</TableHead>
              <TableHead class="text-right">{{ t('payroll.earnings.total') }}</TableHead>
              <TableHead class="text-right">{{ t('payroll.deductions.tax') }}</TableHead>
              <TableHead class="text-right">SSO</TableHead>
              <TableHead class="text-right">PVD</TableHead>
              <TableHead class="text-right">{{ t('payroll.netPay') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="p in filtered.slice(0, 50)"
              :key="p.id"
              class="cursor-pointer hover:bg-muted/50"
              @click="router.push(`/employees/${p.employeeId}`)"
            >
              <TableCell>{{ nameOf(p.employeeId) }}</TableCell>
              <TableCell class="text-right font-mono">{{ thb(p.earnings.total) }}</TableCell>
              <TableCell class="text-right font-mono">{{ thb(p.deductions.withholdingTax) }}</TableCell>
              <TableCell class="text-right font-mono">{{ thb(p.deductions.sso) }}</TableCell>
              <TableCell class="text-right font-mono">{{ thb(p.deductions.pvd) }}</TableCell>
              <TableCell class="text-right font-mono font-semibold">{{ thb(p.netPay) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
