<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Clock, MapPin, LogIn, LogOut, AlertCircle } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useAttendanceStore } from '@/modules/attendance/stores/attendance'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useLocale } from '@/composables/useLocale'
import type { AttendanceMethod } from '@/types/attendance'
import { toast } from 'vue-sonner'

const auth = useAuthStore()
const attendance = useAttendanceStore()
const notif = useNotificationStore()
const { time: fmtTime, date: fmtDate } = useLocale()

const method = ref<AttendanceMethod>('gps')
const now = ref(new Date())
let clockTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  clockTimer = setInterval(() => (now.value = new Date()), 1000)
})
onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

// Office coordinates (Bangkok EmQuartier as demo)
const OFFICE_LAT = 13.7305
const OFFICE_LNG = 100.5682

const position = ref<{ lat: number; lng: number; distance: number } | null>(null)
const gpsError = ref<string>('')

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const dφ = ((lat2 - lat1) * Math.PI) / 180
  const dλ = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

async function requestGPS(): Promise<{ lat: number; lng: number; distance: number } | null> {
  gpsError.value = ''
  if (method.value !== 'gps') return null
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      gpsError.value = 'Geolocation not supported; using mock location.'
      resolve({ lat: OFFICE_LAT, lng: OFFICE_LNG, distance: 0 })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const distance = haversine(lat, lng, OFFICE_LAT, OFFICE_LNG)
        position.value = { lat, lng, distance }
        resolve(position.value)
      },
      (err) => {
        gpsError.value = `GPS denied (${err.message}); using mock location.`
        const fallback = { lat: OFFICE_LAT, lng: OFFICE_LNG, distance: 0 }
        position.value = fallback
        resolve(fallback)
      },
      { enableHighAccuracy: true, timeout: 5000 },
    )
  })
}

const myToday = computed(() => {
  const emp = auth.currentEmployee
  if (!emp) return null
  const today = new Date().toISOString().slice(0, 10)
  return attendance.records.find((r) => r.employeeId === emp.id && r.date === today) ?? null
})

const state = computed<'not_clocked' | 'working' | 'done'>(() => {
  if (!myToday.value?.clockInAt) return 'not_clocked'
  if (!myToday.value.clockOutAt) return 'working'
  return 'done'
})

async function onClockIn() {
  const emp = auth.currentEmployee
  if (!emp) return
  const pos = await requestGPS()
  try {
    const rec = attendance.clockIn(emp.id, method.value, pos?.lat, pos?.lng, pos?.distance)
    notif.push(emp.id, 'general', {
      titleTh: 'ลงเวลาเข้างานสำเร็จ',
      titleEn: 'Clocked in',
      bodyTh: fmtTime(rec.clockInAt!),
      bodyEn: fmtTime(rec.clockInAt!),
      link: '/attendance/my',
    })
    toast.success(`Clocked in at ${fmtTime(rec.clockInAt!)}`)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
  }
}

async function onClockOut() {
  const emp = auth.currentEmployee
  if (!emp) return
  const pos = await requestGPS()
  try {
    const rec = attendance.clockOut(emp.id, method.value, pos?.lat, pos?.lng, pos?.distance)
    if (rec?.clockOutAt) {
      notif.push(emp.id, 'general', {
        titleTh: 'ลงเวลาออกงานสำเร็จ',
        titleEn: 'Clocked out',
        bodyTh: fmtTime(rec.clockOutAt),
        bodyEn: fmtTime(rec.clockOutAt),
      })
      toast.success(`Clocked out at ${fmtTime(rec.clockOutAt)}`)
    }
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
  }
}

const stateClass = computed(() => ({
  not_clocked: 'bg-gray-100 dark:bg-gray-800',
  working: 'bg-green-100 dark:bg-green-950',
  done: 'bg-blue-100 dark:bg-blue-950',
}[state.value]))

const stateLabel = computed(() => ({
  not_clocked: 'Not Clocked In',
  working: 'Working',
  done: 'Done for Today',
}[state.value]))
</script>

<template>
  <div>
    <PageHeader title="Clock In / Out" :description="auth.currentEmployee ? `${auth.currentEmployee.firstNameTh} ${auth.currentEmployee.lastNameTh}` : ''" />

    <div class="max-w-2xl">
      <Card :class="stateClass">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Clock class="h-5 w-5" />
            {{ stateLabel }}
          </CardTitle>
          <CardDescription>
            {{ fmtDate(now, 'd MMM yyyy') }} — {{ fmtTime(now) }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="text-5xl font-mono font-bold tabular-nums">
            {{ fmtTime(now) }}
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Check-in Method</label>
            <Select v-model="method">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gps">GPS</SelectItem>
                <SelectItem value="wifi">Wi-Fi</SelectItem>
                <SelectItem value="face_mock">Face Recognition (demo)</SelectItem>
                <SelectItem value="fingerprint_mock">Fingerprint (demo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="position" class="p-3 rounded-md bg-background/50 text-sm flex items-start gap-2">
            <MapPin class="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <div class="font-mono text-xs">{{ position.lat.toFixed(5) }}, {{ position.lng.toFixed(5) }}</div>
              <div :class="position.distance < 500 ? 'text-green-600' : 'text-orange-600'">
                {{ position.distance < 1000 ? `${position.distance.toFixed(0)} m` : `${(position.distance / 1000).toFixed(2)} km` }} from office
              </div>
            </div>
          </div>

          <div v-if="gpsError" class="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-start gap-2">
            <AlertCircle class="h-4 w-4 mt-0.5 shrink-0" />
            <span>{{ gpsError }}</span>
          </div>

          <div class="flex gap-2">
            <Button
              v-if="state === 'not_clocked'"
              size="lg"
              class="flex-1 h-14"
              @click="onClockIn"
            >
              <LogIn class="mr-2 h-5 w-5" />
              Clock In
            </Button>
            <Button
              v-if="state === 'working'"
              size="lg"
              variant="destructive"
              class="flex-1 h-14"
              @click="onClockOut"
            >
              <LogOut class="mr-2 h-5 w-5" />
              Clock Out
            </Button>
            <div v-if="state === 'done'" class="flex-1 text-center py-4 text-muted-foreground">
              ✓ You've completed your workday
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Today's record summary -->
      <Card v-if="myToday" class="mt-4">
        <CardHeader>
          <CardTitle class="text-base">Today's Record</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Clock In</span>
            <span class="font-mono">{{ myToday.clockInAt ? fmtTime(myToday.clockInAt) : '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Clock Out</span>
            <span class="font-mono">{{ myToday.clockOutAt ? fmtTime(myToday.clockOutAt) : '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Late Minutes</span>
            <Badge v-if="myToday.lateMinutes > 0" variant="destructive">{{ myToday.lateMinutes }} min</Badge>
            <span v-else>0</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">OT Minutes</span>
            <span>{{ myToday.otWeekdayMinutes }} min (1.5×)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
