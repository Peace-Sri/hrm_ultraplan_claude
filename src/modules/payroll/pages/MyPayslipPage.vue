<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download, Calendar } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { usePayrollStore } from '@/modules/payroll/stores/payroll'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useAppStore } from '@/stores/app'
import { useLocale } from '@/composables/useLocale'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const payroll = usePayrollStore()
const auth = useAuthStore()
const app = useAppStore()
const { thb, date: fmtDate } = useLocale()

const myPayslips = computed(() =>
  auth.currentEmployee ? payroll.byEmployee(auth.currentEmployee.id) : [],
)
const selectedId = ref<string>('')
const selected = computed(() =>
  selectedId.value ? myPayslips.value.find((p) => p.id === selectedId.value) : myPayslips.value[0],
)

async function onDownload() {
  if (!selected.value || !auth.currentEmployee) return
  try {
    const { exportPayslipPDF } = await import('@/lib/export-pdf')
    exportPayslipPDF(selected.value, auth.currentEmployee, app.dateSystem === 'BE')
    toast.success(t('common.success'))
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
  }
}

const ytdTotal = computed(() => myPayslips.value.reduce((s, p) => s + p.netPay, 0))
</script>

<template>
  <div>
    <PageHeader :title="t('payroll.myPayslip')" :description="auth.currentEmployee ? `${auth.currentEmployee.firstNameTh} ${auth.currentEmployee.lastNameTh}` : ''">
      <template #actions>
        <Button :disabled="!selected" @click="onDownload">
          <Download class="mr-2 h-4 w-4" />
          {{ t('common.downloadPdf') }}
        </Button>
      </template>
    </PageHeader>

    <div v-if="myPayslips.length === 0">
      <EmptyState :title="t('payroll.noPayslips')" :description="t('payroll.noPayslipsDesc')" />
    </div>
    <div v-else>
      <div class="flex items-center gap-3 mb-4">
        <Calendar class="h-4 w-4 text-muted-foreground" />
        <Select v-model="selectedId">
          <SelectTrigger class="w-56">
            <SelectValue :placeholder="fmtDate(myPayslips[0].period, 'MMM yyyy')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="p in myPayslips" :key="p.id" :value="p.id">
              {{ fmtDate(p.period, 'MMM yyyy') }}
            </SelectItem>
          </SelectContent>
        </Select>
        <span class="text-sm text-muted-foreground">
          {{ t('payroll.ytd') }}: <span class="font-semibold text-foreground">{{ thb(ytdTotal) }}</span>
        </span>
      </div>

      <Card v-if="selected" class="max-w-3xl">
        <CardHeader>
          <div class="flex justify-between">
            <div>
              <CardTitle class="text-2xl">{{ t('payroll.payslip') }}</CardTitle>
              <CardDescription>
                {{ fmtDate(selected.period, 'MMMM yyyy') }} — {{ selected.workingDaysInMonth }} {{ t('payroll.workingDays') }}
              </CardDescription>
            </div>
            <div class="text-right">
              <div class="text-xs text-muted-foreground">{{ t('payroll.netPay') }}</div>
              <div class="text-3xl font-bold text-primary">{{ thb(selected.netPay) }}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Earnings -->
          <div>
            <h3 class="font-semibold text-sm text-green-600 mb-2">{{ t('payroll.earnings.title') }}</h3>
            <dl class="grid grid-cols-2 gap-y-1 text-sm">
              <dt class="text-muted-foreground">{{ t('payroll.earnings.base') }}</dt>
              <dd class="text-right font-mono">{{ thb(selected.earnings.baseSalary) }}</dd>

              <dt class="text-muted-foreground">{{ t('payroll.earnings.allowances') }}</dt>
              <dd class="text-right font-mono">{{ thb(selected.earnings.monthlyAllowances) }}</dd>

              <dt class="text-muted-foreground">{{ t('payroll.earnings.otWeekday') }}</dt>
              <dd class="text-right font-mono">{{ thb(selected.earnings.otWeekday) }}</dd>

              <dt class="text-muted-foreground">{{ t('payroll.earnings.otHolidayReg') }}</dt>
              <dd class="text-right font-mono">{{ thb(selected.earnings.otHolidayReg) }}</dd>

              <dt class="text-muted-foreground">{{ t('payroll.earnings.otHolidayExtra') }}</dt>
              <dd class="text-right font-mono">{{ thb(selected.earnings.otHolidayExtra) }}</dd>

              <dt class="text-muted-foreground">{{ t('payroll.earnings.bonus') }}</dt>
              <dd class="text-right font-mono">{{ thb(selected.earnings.bonus) }}</dd>

              <dt class="font-semibold border-t pt-1">{{ t('payroll.earnings.total') }}</dt>
              <dd class="text-right font-mono font-semibold border-t pt-1">
                {{ thb(selected.earnings.total) }}
              </dd>
            </dl>
          </div>

          <Separator />

          <!-- Deductions -->
          <div>
            <h3 class="font-semibold text-sm text-destructive mb-2">{{ t('payroll.deductions.title') }}</h3>
            <dl class="grid grid-cols-2 gap-y-1 text-sm">
              <dt class="text-muted-foreground">{{ t('payroll.deductions.sso') }}</dt>
              <dd class="text-right font-mono">{{ thb(selected.deductions.sso) }}</dd>

              <dt class="text-muted-foreground">{{ t('payroll.deductions.pvd') }}</dt>
              <dd class="text-right font-mono">{{ thb(selected.deductions.pvd) }}</dd>

              <dt class="text-muted-foreground">{{ t('payroll.deductions.tax') }}</dt>
              <dd class="text-right font-mono">{{ thb(selected.deductions.withholdingTax) }}</dd>

              <dt class="text-muted-foreground">{{ t('payroll.deductions.absence') }}</dt>
              <dd class="text-right font-mono">{{ thb(selected.deductions.absence) }}</dd>

              <dt class="font-semibold border-t pt-1">{{ t('payroll.deductions.total') }}</dt>
              <dd class="text-right font-mono font-semibold border-t pt-1">
                {{ thb(selected.deductions.total) }}
              </dd>
            </dl>
          </div>

          <Separator />

          <div class="flex justify-between items-center py-2 bg-primary/10 px-4 rounded-md">
            <span class="text-lg font-bold">{{ t('payroll.netPay') }}</span>
            <span class="text-2xl font-bold text-primary">{{ thb(selected.netPay) }}</span>
          </div>

          <p class="text-xs text-muted-foreground">
            {{ t('payroll.compliance') }}
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
