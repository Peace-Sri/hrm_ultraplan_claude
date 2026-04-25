<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Plus, X } from 'lucide-vue-next'
import LeaveApplyDialog from '@/modules/leave/components/LeaveApplyDialog.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useLeaveStore } from '@/modules/leave/stores/leave'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useAppStore } from '@/stores/app'
import { useLocale } from '@/composables/useLocale'
import { toast } from 'vue-sonner'
import type { ID } from '@/types/common'

const { t } = useI18n()
const route = useRoute()
const leave = useLeaveStore()
const applyOpen = ref(false)

onMounted(() => {
  if (route.query.apply === '1') applyOpen.value = true
})
const auth = useAuthStore()
const app = useAppStore()
const { date: fmtDate } = useLocale()

const myBalances = computed(() =>
  auth.currentEmployee ? leave.balancesFor(auth.currentEmployee.id) : [],
)
const myRequests = computed(() =>
  auth.currentEmployee
    ? leave.byEmployee(auth.currentEmployee.id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    : [],
)

function getType(key: string) {
  return leave.types.find((t) => t.key === key)
}

function remaining(b: { entitledDays: number; usedDays: number; pendingDays: number; carriedOverDays: number }) {
  return b.entitledDays + b.carriedOverDays - b.usedDays - b.pendingDays
}

const statusVariant: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  pending: 'outline',
  approved: 'default',
  rejected: 'destructive',
  cancelled: 'secondary',
  draft: 'secondary',
}

function onCancel(id: ID<'LVR'>) {
  try {
    leave.cancel(id)
    toast.success('Cancelled')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
  }
}
</script>

<template>
  <div>
    <PageHeader :title="t('leave.myLeaves')">
      <template #actions>
        <Button @click="applyOpen = true">
          <Plus class="mr-2 h-4 w-4" />
          {{ t('leave.apply') }}
        </Button>
      </template>
    </PageHeader>

    <LeaveApplyDialog v-model:open="applyOpen" />

    <!-- Balance cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <Card v-for="b in myBalances" :key="b.leaveTypeKey">
        <CardContent class="pt-4 pb-3">
          <div
            class="text-xs font-medium mb-1"
            :style="{ color: getType(b.leaveTypeKey)?.colorHex }"
          >
            {{ app.locale === 'th' ? getType(b.leaveTypeKey)?.nameTh : getType(b.leaveTypeKey)?.nameEn }}
          </div>
          <div class="text-2xl font-bold">{{ remaining(b) }}</div>
          <div class="text-xs text-muted-foreground">
            / {{ b.entitledDays }} {{ t('leave.days') }}
            <span v-if="b.pendingDays > 0" class="text-orange-600">(+{{ b.pendingDays }} {{ t('leave.pending') }})</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>{{ t('leave.leaveHistory') }}</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t('leave.table.type') }}</TableHead>
              <TableHead>{{ t('leave.table.dates') }}</TableHead>
              <TableHead>{{ t('leave.days') }}</TableHead>
              <TableHead>{{ t('leave.reason') }}</TableHead>
              <TableHead>{{ t('employee.table.status') }}</TableHead>
              <TableHead>{{ t('common.actions') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="r in myRequests" :key="r.id">
              <TableCell>
                <Badge :style="{ backgroundColor: getType(r.leaveTypeKey)?.colorHex, color: 'white' }">
                  {{ app.locale === 'th' ? getType(r.leaveTypeKey)?.nameTh : getType(r.leaveTypeKey)?.nameEn }}
                </Badge>
              </TableCell>
              <TableCell>{{ fmtDate(r.startDate) }} – {{ fmtDate(r.endDate) }}</TableCell>
              <TableCell>{{ r.totalDays }}</TableCell>
              <TableCell class="max-w-xs truncate">{{ r.reason }}</TableCell>
              <TableCell>
                <Badge :variant="statusVariant[r.status]">{{ t(`leave.status.${r.status}`) }}</Badge>
              </TableCell>
              <TableCell>
                <Button
                  v-if="r.status === 'pending'"
                  size="sm"
                  variant="ghost"
                  @click="onCancel(r.id)"
                >
                  <X class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="myRequests.length === 0">
              <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
                {{ t('leave.noHistory') }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
