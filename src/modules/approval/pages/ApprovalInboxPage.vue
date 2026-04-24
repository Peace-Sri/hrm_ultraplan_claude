<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Check, X, Inbox as InboxIcon } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { useLeaveStore } from '@/modules/leave/stores/leave'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useEmployeeStore } from '@/modules/employee/stores/employee'
import { useAppStore } from '@/stores/app'
import { useLocale } from '@/composables/useLocale'
import { toast } from 'vue-sonner'
import type { ID } from '@/types/common'

const router = useRouter()
const leave = useLeaveStore()
const auth = useAuthStore()
const employee = useEmployeeStore()
const app = useAppStore()
const { date: fmtDate } = useLocale()

const activeTab = ref<'leave' | 'attendance' | 'all'>('all')

const pendingLeaves = computed(() => {
  if (!auth.currentEmployee) return []
  if (auth.hasPermission('leave.view_all')) {
    return leave.requests.filter((r) => r.status === 'pending')
  }
  return leave.pendingForManager(auth.currentEmployee.id)
})

function nameOf(id: string) {
  const e = employee.byId(id as never)
  if (!e) return id
  return app.locale === 'th' ? `${e.firstNameTh} ${e.lastNameTh}` : `${e.firstNameEn} ${e.lastNameEn}`
}

function onApprove(id: ID<'LVR'>) {
  try {
    leave.approve(id)
    toast.success('Approved')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
  }
}

function onReject(id: ID<'LVR'>) {
  try {
    leave.reject(id)
    toast.success('Rejected')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
  }
}
</script>

<template>
  <div>
    <PageHeader title="Approval Inbox" :description="`${pendingLeaves.length} pending across all categories`" />

    <Tabs v-model="activeTab">
      <TabsList>
        <TabsTrigger value="all">
          All
          <Badge variant="secondary" class="ml-2">{{ pendingLeaves.length }}</Badge>
        </TabsTrigger>
        <TabsTrigger value="leave">
          Leave
          <Badge variant="secondary" class="ml-2">{{ pendingLeaves.length }}</Badge>
        </TabsTrigger>
        <TabsTrigger value="attendance">
          Attendance
          <Badge variant="secondary" class="ml-2">0</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <Card class="mt-4">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <InboxIcon class="h-4 w-4" />
              Pending Items
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <Table v-if="pendingLeaves.length > 0">
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="r in pendingLeaves" :key="r.id">
                  <TableCell><Badge>Leave</Badge></TableCell>
                  <TableCell>{{ nameOf(r.employeeId) }}</TableCell>
                  <TableCell class="max-w-xs">
                    {{ r.leaveTypeKey }} — {{ r.totalDays }}d
                    <span class="text-muted-foreground text-xs">({{ fmtDate(r.startDate) }})</span>
                  </TableCell>
                  <TableCell>{{ fmtDate(r.submittedAt, 'd MMM') }}</TableCell>
                  <TableCell class="text-right">
                    <div class="flex gap-1 justify-end">
                      <Button size="sm" variant="outline" @click="onApprove(r.id)">
                        <Check class="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" @click="onReject(r.id)">
                        <X class="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <EmptyState v-else title="All caught up!" description="No pending approvals." />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="leave">
        <Card class="mt-4">
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Button @click="router.push('/leave/approvals')">Go to Leave Approvals</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="attendance">
        <Card class="mt-4">
          <CardContent class="pt-6">
            <EmptyState
              title="No attendance corrections"
              description="Attendance correction flow is deferred to Tier C."
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
