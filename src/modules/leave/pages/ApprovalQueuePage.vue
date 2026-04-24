<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, X } from 'lucide-vue-next'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { useLeaveStore } from '@/modules/leave/stores/leave'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useEmployeeStore } from '@/modules/employee/stores/employee'
import { useAppStore } from '@/stores/app'
import { useLocale } from '@/composables/useLocale'
import { toast } from 'vue-sonner'
import type { ID } from '@/types/common'

const { t } = useI18n()
const leave = useLeaveStore()
const auth = useAuthStore()
const employee = useEmployeeStore()
const app = useAppStore()
const { date: fmtDate } = useLocale()

const pending = computed(() => {
  if (!auth.currentEmployee) return []
  if (auth.hasPermission('leave.view_all')) {
    return leave.requests.filter((r) => r.status === 'pending')
  }
  return leave.pendingForManager(auth.currentEmployee.id)
})

const dialogOpen = ref(false)
const dialogAction = ref<'approve' | 'reject'>('approve')
const dialogComment = ref('')
const targetId = ref<ID<'LVR'> | null>(null)

function openDialog(id: ID<'LVR'>, action: 'approve' | 'reject') {
  targetId.value = id
  dialogAction.value = action
  dialogComment.value = ''
  dialogOpen.value = true
}

function onConfirm() {
  if (!targetId.value) return
  try {
    if (dialogAction.value === 'approve') {
      leave.approve(targetId.value, dialogComment.value || undefined)
      toast.success('Approved')
    } else {
      leave.reject(targetId.value, dialogComment.value || undefined)
      toast.success('Rejected')
    }
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
  } finally {
    dialogOpen.value = false
    targetId.value = null
  }
}

function nameOf(id: string) {
  const e = employee.byId(id as never)
  if (!e) return id
  return app.locale === 'th'
    ? `${e.firstNameTh} ${e.lastNameTh}`
    : `${e.firstNameEn} ${e.lastNameEn}`
}

function typeOf(key: string) {
  const lt = leave.types.find((t) => t.key === key)
  return app.locale === 'th' ? lt?.nameTh : lt?.nameEn
}
</script>

<template>
  <div>
    <PageHeader title="Leave Approvals" :description="`${pending.length} pending`" />

    <Card>
      <CardHeader v-if="pending.length > 0">
        <CardTitle>Pending Requests</CardTitle>
      </CardHeader>
      <CardContent class="pt-0">
        <Table v-if="pending.length > 0">
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="r in pending" :key="r.id">
              <TableCell>{{ nameOf(r.employeeId) }}</TableCell>
              <TableCell>
                <Badge variant="outline">{{ typeOf(r.leaveTypeKey) }}</Badge>
              </TableCell>
              <TableCell>{{ fmtDate(r.startDate) }} – {{ fmtDate(r.endDate) }}</TableCell>
              <TableCell>{{ r.totalDays }}</TableCell>
              <TableCell class="max-w-xs truncate">{{ r.reason }}</TableCell>
              <TableCell>{{ fmtDate(r.submittedAt, 'd MMM') }}</TableCell>
              <TableCell class="text-right">
                <div class="flex gap-1 justify-end">
                  <Button size="sm" variant="outline" @click="openDialog(r.id, 'approve')">
                    <Check class="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" @click="openDialog(r.id, 'reject')">
                    <X class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <EmptyState
          v-else
          title="No pending requests"
          description="All caught up! Incoming requests will show here."
        />
      </CardContent>
    </Card>

    <AlertDialog v-model:open="dialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="capitalize">{{ dialogAction }} Leave</AlertDialogTitle>
          <AlertDialogDescription>
            Add an optional comment for the employee.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea v-model="dialogComment" rows="3" placeholder="Comment (optional)" />
        <AlertDialogFooter>
          <AlertDialogCancel>{{ t('common.cancel') }}</AlertDialogCancel>
          <AlertDialogAction @click="onConfirm">
            {{ dialogAction === 'approve' ? t('common.approve') : t('common.reject') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
