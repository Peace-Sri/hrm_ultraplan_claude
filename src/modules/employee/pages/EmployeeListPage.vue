<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Plus, Search, Download, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import PageHeader from '@/components/shared/PageHeader.vue'
import RoleGate from '@/components/shared/RoleGate.vue'
import { useEmployeeStore } from '@/modules/employee/stores/employee'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useAppStore } from '@/stores/app'
import { useLocale } from '@/composables/useLocale'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const router = useRouter()
const employee = useEmployeeStore()
const auth = useAuthStore()
const app = useAppStore()
const { thb } = useLocale()

const search = ref('')
const deptFilter = ref<string>('all')
const statusFilter = ref<string>('active')
const page = ref(1)
const pageSize = 25

const scopedEmployees = computed(() => {
  if (auth.hasPermission('employee.view_all')) return employee.all
  if (auth.hasPermission('employee.view_team') && auth.currentEmployee) {
    return [...employee.byManager(auth.currentEmployee.id), auth.currentEmployee]
  }
  return auth.currentEmployee ? [auth.currentEmployee] : []
})

const filtered = computed(() => {
  return scopedEmployees.value.filter((e) => {
    if (deptFilter.value !== 'all' && e.departmentId !== deptFilter.value) return false
    if (statusFilter.value !== 'all' && e.status !== statusFilter.value) return false
    if (search.value) {
      const q = search.value.toLowerCase()
      const hit =
        e.firstNameTh.includes(search.value) ||
        e.lastNameTh.includes(search.value) ||
        e.firstNameEn.toLowerCase().includes(q) ||
        e.lastNameEn.toLowerCase().includes(q) ||
        e.employeeNo.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
      if (!hit) return false
    }
    return true
  })
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

function nameOf(e: { firstNameTh: string; lastNameTh: string; firstNameEn: string; lastNameEn: string }) {
  return app.locale === 'th'
    ? `${e.firstNameTh} ${e.lastNameTh}`
    : `${e.firstNameEn} ${e.lastNameEn}`
}

function initials(e: { firstNameEn: string; lastNameEn: string }) {
  return `${e.firstNameEn[0] ?? ''}${e.lastNameEn[0] ?? ''}`.toUpperCase()
}

async function onExport() {
  try {
    const { exportEmployeesToExcel } = await import('@/lib/export-excel')
    await exportEmployeesToExcel(filtered.value, employee.departments, employee.positions, app.locale)
    toast.success('Exported ' + filtered.value.length + ' employees')
  } catch (err) {
    toast.error('Export failed: ' + (err instanceof Error ? err.message : String(err)))
  }
}
</script>

<template>
  <div>
    <PageHeader :title="t('nav.employees')" :description="`${filtered.length} ${t('common.all').toLowerCase()}`">
      <template #actions>
        <Button variant="outline" @click="onExport">
          <Download class="mr-2 h-4 w-4" />
          {{ t('common.export') }}
        </Button>
        <RoleGate requires="employee.create">
          <Button @click="router.push('/employees/new')">
            <Plus class="mr-2 h-4 w-4" />
            {{ t('common.add') }}
          </Button>
        </RoleGate>
      </template>
    </PageHeader>

    <Card class="mb-4">
      <CardContent class="pt-6">
        <div class="flex flex-col md:flex-row gap-3">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input v-model="search" :placeholder="t('common.search')" class="pl-9" />
          </div>
          <Select v-model="deptFilter">
            <SelectTrigger class="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{{ t('common.all') }}</SelectItem>
              <SelectItem v-for="d in employee.departments" :key="d.id" :value="d.id">
                {{ app.locale === 'th' ? d.nameTh : d.nameEn }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{{ t('common.all') }}</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead class="hidden md:table-cell">Department</TableHead>
            <TableHead class="hidden lg:table-cell">Position</TableHead>
            <TableHead class="hidden xl:table-cell">Salary</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="e in paged"
            :key="e.id"
            class="cursor-pointer hover:bg-muted/50"
            @click="router.push(`/employees/${e.id}`)"
          >
            <TableCell class="font-mono text-xs">{{ e.employeeNo }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <Avatar class="h-8 w-8">
                  <AvatarFallback>{{ initials(e) }}</AvatarFallback>
                </Avatar>
                <div>
                  <div class="font-medium">{{ nameOf(e) }}</div>
                  <div v-if="e.nicknameTh" class="text-xs text-muted-foreground">({{ e.nicknameTh }})</div>
                </div>
              </div>
            </TableCell>
            <TableCell class="hidden md:table-cell">{{ employee.getDepartmentName(e.departmentId, app.locale) }}</TableCell>
            <TableCell class="hidden lg:table-cell">{{ employee.getPositionName(e.positionId, app.locale) }}</TableCell>
            <TableCell class="hidden xl:table-cell">{{ thb(e.baseSalary) }}</TableCell>
            <TableCell>
              <Badge :variant="e.status === 'active' ? 'default' : 'secondary'">
                {{ e.status }}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow v-if="paged.length === 0">
            <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
              No employees match filters.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div class="flex items-center justify-between p-3 border-t text-sm">
        <span class="text-muted-foreground">
          Page {{ page }} of {{ totalPages }} ({{ filtered.length }} total)
        </span>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" :disabled="page === 1" @click="page--">
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" :disabled="page >= totalPages" @click="page++">
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>
