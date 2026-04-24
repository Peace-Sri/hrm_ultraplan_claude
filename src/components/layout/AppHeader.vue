<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Bell,
  Globe,
  Moon,
  Sun,
  LogOut,
  Menu,
  UserCog,
  Briefcase,
  User as UserIcon,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useAppStore } from '@/stores/app'
import { useNotificationStore } from '@/stores/notification'
import type { RoleKey } from '@/types/user'
import { toast } from 'vue-sonner'

const { t, locale: i18nLocale } = useI18n()
const auth = useAuthStore()
const app = useAppStore()
const notif = useNotificationStore()
const router = useRouter()

const initials = computed(() => {
  const e = auth.currentEmployee
  if (!e) return '?'
  return `${e.firstNameEn[0] ?? ''}${e.lastNameEn[0] ?? ''}`.toUpperCase()
})

const displayName = computed(() => {
  const e = auth.currentEmployee
  if (!e) return ''
  return app.locale === 'th'
    ? `${e.titleTh}${e.firstNameTh} ${e.lastNameTh}`
    : `${e.titleEn} ${e.firstNameEn} ${e.lastNameEn}`
})

function toggleLocale() {
  const next = app.locale === 'th' ? 'en' : 'th'
  app.setLocale(next)
  i18nLocale.value = next
}

function toggleTheme() {
  const next = app.theme === 'dark' ? 'light' : 'dark'
  app.setTheme(next)
}

function toggleSidebar() {
  app.sidebarCollapsed = !app.sidebarCollapsed
}

function onSwitchRole(role: RoleKey) {
  auth.switchRole(role)
  toast.success(`${t('role.' + role)}`)
}

async function onLogout() {
  auth.logout()
  await router.replace('/login')
}
</script>

<template>
  <header class="h-16 border-b bg-background flex items-center gap-3 px-4 shrink-0">
    <Button variant="ghost" size="icon" @click="toggleSidebar">
      <Menu class="h-4 w-4" />
    </Button>

    <div class="flex-1" />

    <!-- Notifications -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon" class="relative">
          <Bell class="h-4 w-4" />
          <Badge
            v-if="notif.unreadCount > 0"
            class="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] rounded-full"
            variant="destructive"
          >
            {{ notif.unreadCount }}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-80">
        <DropdownMenuLabel class="flex items-center justify-between">
          <span>{{ t('notifications.title') }}</span>
          <button
            v-if="notif.unreadCount > 0"
            class="text-xs text-primary hover:underline"
            @click="notif.markAllRead"
          >
            {{ t('notifications.markAllRead') }}
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div v-if="notif.latest.length === 0" class="p-6 text-center text-sm text-muted-foreground">
          {{ t('notifications.none') }}
        </div>
        <DropdownMenuItem
          v-for="n in notif.latest.slice(0, 10)"
          :key="n.id"
          @click="notif.markRead(n.id)"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">
              {{ app.locale === 'th' ? n.titleTh : n.titleEn }}
            </p>
            <p class="text-xs text-muted-foreground truncate">
              {{ app.locale === 'th' ? n.bodyTh : n.bodyEn }}
            </p>
          </div>
          <span v-if="!n.readAt" class="w-2 h-2 rounded-full bg-primary shrink-0 ml-2" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Button variant="ghost" size="icon" @click="toggleLocale">
      <Globe class="h-4 w-4" />
      <span class="sr-only">Locale</span>
    </Button>
    <Button variant="ghost" size="icon" @click="toggleTheme">
      <Sun v-if="app.theme === 'dark'" class="h-4 w-4" />
      <Moon v-else class="h-4 w-4" />
    </Button>

    <!-- User menu -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" class="gap-2 px-2">
          <Avatar class="h-7 w-7">
            <AvatarFallback>{{ initials }}</AvatarFallback>
          </Avatar>
          <div class="hidden md:flex flex-col items-start leading-tight">
            <span class="text-sm font-medium">{{ displayName }}</span>
            <span class="text-[10px] text-muted-foreground uppercase">
              {{ auth.currentRole ? t(`role.${auth.currentRole}`) : '' }}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-56">
        <DropdownMenuLabel>{{ t('auth.quickLogin') }} (demo)</DropdownMenuLabel>
        <DropdownMenuItem @click="onSwitchRole('hr_admin')">
          <UserCog class="mr-2 h-4 w-4" /> {{ t('role.hr_admin') }}
        </DropdownMenuItem>
        <DropdownMenuItem @click="onSwitchRole('manager')">
          <Briefcase class="mr-2 h-4 w-4" /> {{ t('role.manager') }}
        </DropdownMenuItem>
        <DropdownMenuItem @click="onSwitchRole('employee')">
          <UserIcon class="mr-2 h-4 w-4" /> {{ t('role.employee') }}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="text-destructive" @click="onLogout">
          <LogOut class="mr-2 h-4 w-4" /> {{ t('nav.logout') }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>
