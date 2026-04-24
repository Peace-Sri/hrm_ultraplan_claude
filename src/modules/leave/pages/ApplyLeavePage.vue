<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Send } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import PageHeader from '@/components/shared/PageHeader.vue'
import { useLeaveStore } from '@/modules/leave/stores/leave'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useAppStore } from '@/stores/app'
import { isHoliday } from '@/lib/thai-holidays'
import type { LeaveTypeKey } from '@/types/leave'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const router = useRouter()
const leave = useLeaveStore()
const auth = useAuthStore()
const app = useAppStore()

const today = new Date().toISOString().slice(0, 10)

const leaveTypeKey = ref<LeaveTypeKey>('sick')
const startDate = ref(today)
const endDate = ref(today)
const reason = ref('')

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
    toast.error('Selected dates include only weekends/holidays.')
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
    toast.success('Leave request submitted')
    router.replace('/leave/my')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
  }
}
</script>

<template>
  <div>
    <Button variant="ghost" size="sm" class="mb-3" @click="router.back()">
      <ArrowLeft class="h-4 w-4 mr-1" />
      {{ t('common.back') }}
    </Button>
    <PageHeader title="Apply Leave" />

    <Card class="max-w-2xl">
      <CardHeader>
        <CardTitle>New Leave Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit="onSubmit">
          <div class="space-y-2">
            <Label>Leave Type</Label>
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
              <Label>Start Date</Label>
              <Input v-model="startDate" type="date" required />
            </div>
            <div class="space-y-2">
              <Label>End Date</Label>
              <Input v-model="endDate" type="date" :min="startDate" required />
            </div>
          </div>

          <div class="p-3 rounded-md bg-muted text-sm">
            <span class="font-semibold">{{ totalDays }}</span> business day{{ totalDays !== 1 ? 's' : '' }}
            <span class="text-muted-foreground ml-2">(excluding weekends + Thai holidays)</span>
          </div>

          <div class="space-y-2">
            <Label>Reason</Label>
            <Textarea v-model="reason" rows="3" placeholder="Tell your manager why..." required />
          </div>

          <div class="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" @click="router.back()">
              {{ t('common.cancel') }}
            </Button>
            <Button type="submit" :disabled="totalDays === 0">
              <Send class="mr-2 h-4 w-4" />
              {{ t('common.submit') }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
