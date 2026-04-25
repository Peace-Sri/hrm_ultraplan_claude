<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Send } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLeaveStore } from '@/modules/leave/stores/leave'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useAppStore } from '@/stores/app'
import { isHoliday } from '@/lib/thai-holidays'
import type { LeaveTypeKey } from '@/types/leave'
import { toast } from 'vue-sonner'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const leave = useLeaveStore()
const auth = useAuthStore()
const app = useAppStore()

const today = new Date().toISOString().slice(0, 10)
const leaveTypeKey = ref<LeaveTypeKey>('sick')
const startDate = ref(today)
const endDate = ref(today)
const reason = ref('')

watch(
  () => props.open,
  (v) => {
    if (v) {
      // Reset on open
      leaveTypeKey.value = 'sick'
      startDate.value = today
      endDate.value = today
      reason.value = ''
    }
  },
)

function businessDaysBetween(start: string, end: string): number {
  const s = new Date(start)
  const e = new Date(end)
  if (e < s) return 0
  let count = 0
  const cur = new Date(s)
  while (cur <= e) {
    const dow = cur.getDay()
    const iso = cur.toISOString().slice(0, 10)
    if (dow !== 0 && dow !== 6 && !isHoliday(iso)) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

const totalDays = computed(() => businessDaysBetween(startDate.value, endDate.value))

function onSubmit(ev: Event) {
  ev.preventDefault()
  if (!auth.currentEmployee) return
  if (totalDays.value === 0) {
    toast.error(t('leave.selectOnlyHolidays'))
    return
  }
  try {
    leave.apply({
      employeeId: auth.currentEmployee.id,
      leaveTypeKey: leaveTypeKey.value,
      startDate: startDate.value,
      endDate: endDate.value,
      totalDays: totalDays.value,
      reason: reason.value,
    })
    toast.success(t('leave.submitted'))
    emit('update:open', false)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ t('leave.newRequest') }}</DialogTitle>
        <DialogDescription>{{ t('leave.businessDaysNote') }}</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <div class="space-y-2">
          <Label>{{ t('leave.leaveType') }}</Label>
          <Select v-model="leaveTypeKey">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="lt in leave.types" :key="lt.key" :value="lt.key">
                <span class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: lt.colorHex }" />
                  {{ app.locale === 'th' ? lt.nameTh : lt.nameEn }}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <Label>{{ t('leave.startDate') }}</Label>
            <Input v-model="startDate" type="date" required />
          </div>
          <div class="space-y-2">
            <Label>{{ t('leave.endDate') }}</Label>
            <Input v-model="endDate" type="date" :min="startDate" required />
          </div>
        </div>

        <div class="p-3 rounded-md bg-muted text-sm">
          <span class="font-semibold">{{ totalDays }}</span> {{ t('leave.days') }}
          <span class="text-muted-foreground ml-2 text-xs">
            ({{ t('leave.businessDaysNote') }})
          </span>
        </div>

        <div class="space-y-2">
          <Label>{{ t('leave.reason') }}</Label>
          <Textarea v-model="reason" rows="3" :placeholder="t('leave.reasonPlaceholder')" required />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            {{ t('common.cancel') }}
          </Button>
          <Button type="submit" :disabled="totalDays === 0">
            <Send class="mr-2 h-4 w-4" />
            {{ t('common.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
