<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Users, Clock, Plane, Inbox } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useAuthStore } from '@/modules/auth/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()

const activeEmployees = computed(() => auth.allEmployees.filter((e) => e.status === 'active').length)
const teamSize = computed(() =>
  auth.currentEmployee
    ? auth.allEmployees.filter((e) => e.managerId === auth.currentEmployee!.id).length
    : 0,
)

const stats = computed(() => [
  {
    label: t('nav.employees'),
    value: auth.currentRole === 'hr_admin' ? activeEmployees.value : auth.currentRole === 'manager' ? teamSize.value : 1,
    icon: Users,
    tone: 'text-blue-600',
  },
  { label: t('nav.attendance'), value: '—', icon: Clock, tone: 'text-green-600' },
  { label: t('nav.leave'), value: '—', icon: Plane, tone: 'text-orange-600' },
  { label: t('nav.approvals'), value: '—', icon: Inbox, tone: 'text-purple-600' },
])
</script>

<template>
  <div>
    <PageHeader :title="t('nav.dashboard')" :description="auth.currentRole ? t(`role.${auth.currentRole}`) : ''" />

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="s in stats" :key="s.label">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{{ s.label }}</CardTitle>
          <component :is="s.icon" class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ s.value }}</div>
        </CardContent>
      </Card>
    </div>

    <Card class="mt-6">
      <CardHeader>
        <CardTitle>Coming in Phase 6</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-muted-foreground">
          Charts (attendance trend, leave distribution), activity feed, and quick actions will land in Phase 6.
        </p>
      </CardContent>
    </Card>
  </div>
</template>
