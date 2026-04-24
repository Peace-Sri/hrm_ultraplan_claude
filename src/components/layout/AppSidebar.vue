<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  LayoutDashboard,
  Users,
  Clock,
  Plane,
  Wallet,
  Inbox,
  Settings,
  Building2,
} from 'lucide-vue-next'
import { useAuthStore } from '@/modules/auth/stores/auth'
import type { PermissionKey } from '@/lib/permissions'

defineProps<{ collapsed: boolean }>()

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()

interface NavItem {
  key: string
  label: string
  icon: unknown
  to: string
  requires?: PermissionKey | PermissionKey[]
}

const navItems = computed<NavItem[]>(() => [
  { key: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, to: '/dashboard' },
  {
    key: 'employees',
    label: t('nav.employees'),
    icon: Users,
    to: '/employees',
    requires: ['employee.view_all', 'employee.view_team'],
  },
  {
    key: 'attendance',
    label: t('nav.attendance'),
    icon: Clock,
    to: '/attendance',
    requires: 'attendance.clock_self',
  },
  { key: 'leave', label: t('nav.leave'), icon: Plane, to: '/leave/my', requires: 'leave.view_self' },
  {
    key: 'payroll',
    label: t('nav.payroll'),
    icon: Wallet,
    to: '/payroll/my',
    requires: 'payslip.view_self',
  },
  {
    key: 'approvals',
    label: t('nav.approvals'),
    icon: Inbox,
    to: '/approvals',
    requires: ['approval.view_all', 'approval.view_team'],
  },
  {
    key: 'settings',
    label: t('nav.settings'),
    icon: Settings,
    to: '/settings',
    requires: 'settings.profile_self',
  },
])

const visibleItems = computed(() =>
  navItems.value.filter((item) => !item.requires || auth.hasPermission(item.requires)),
)

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}
</script>

<template>
  <aside
    class="border-r bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200"
    :class="collapsed ? 'w-16' : 'w-64'"
  >
    <div class="h-16 flex items-center gap-2 px-4 border-b border-sidebar-border">
      <Building2 class="h-5 w-5 text-sidebar-primary" />
      <span v-if="!collapsed" class="font-semibold">{{ t('app.name') }}</span>
    </div>

    <nav class="flex-1 overflow-y-auto p-2 space-y-1">
      <RouterLink
        v-for="item in visibleItems"
        :key="item.key"
        :to="item.to"
        class="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        :class="
          isActive(item.to)
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-sidebar-foreground/80'
        "
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" />
        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div v-if="!collapsed" class="p-3 border-t border-sidebar-border text-xs text-muted-foreground">
      v0.1.0 — POC
    </div>
  </aside>
</template>
