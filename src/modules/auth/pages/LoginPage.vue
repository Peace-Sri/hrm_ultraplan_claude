<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UserCog, Briefcase, User, Globe, Moon, Sun } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useAppStore } from '@/stores/app'
import type { RoleKey } from '@/types/user'

const { t } = useI18n()
const auth = useAuthStore()
const app = useAppStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')

async function onLogin() {
  const ok = auth.login(username.value, password.value)
  if (!ok) {
    error.value = t('auth.invalid')
    return
  }
  const next = (route.query.next as string) || '/dashboard'
  await router.replace(next)
}

async function onQuickLogin(role: RoleKey) {
  auth.quickLogin(role)
  toast.success(`${t('auth.quickLogin')}: ${t(`role.${role}`)}`)
  const next = (route.query.next as string) || '/dashboard'
  await router.replace(next)
}

function toggleLocale() {
  const next = app.locale === 'th' ? 'en' : 'th'
  app.setLocale(next)
  const { locale } = useI18n()
  locale.value = next
}

function toggleTheme() {
  const next = app.theme === 'dark' ? 'light' : 'dark'
  app.setTheme(next)
}
</script>

<template>
  <div class="min-h-screen bg-muted/30 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="flex justify-end gap-2 mb-4">
        <Button variant="ghost" size="icon" :title="app.locale === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นไทย'" @click="toggleLocale">
          <Globe class="h-4 w-4" />
          <span class="sr-only">Toggle locale</span>
        </Button>
        <Button variant="ghost" size="icon" title="Toggle theme" @click="toggleTheme">
          <Sun v-if="app.theme === 'dark'" class="h-4 w-4" />
          <Moon v-else class="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle class="text-2xl">{{ t('auth.title') }}</CardTitle>
          <CardDescription>{{ t('auth.subtitle') }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Quick login -->
          <div class="space-y-2">
            <Label class="text-xs uppercase text-muted-foreground">{{ t('auth.quickLogin') }}</Label>
            <div class="grid grid-cols-3 gap-2">
              <Button variant="outline" class="flex-col h-auto py-3" @click="onQuickLogin('hr_admin')">
                <UserCog class="h-4 w-4 mb-1" />
                <span class="text-xs">{{ t('auth.hr') }}</span>
              </Button>
              <Button variant="outline" class="flex-col h-auto py-3" @click="onQuickLogin('manager')">
                <Briefcase class="h-4 w-4 mb-1" />
                <span class="text-xs">{{ t('auth.manager') }}</span>
              </Button>
              <Button variant="outline" class="flex-col h-auto py-3" @click="onQuickLogin('employee')">
                <User class="h-4 w-4 mb-1" />
                <span class="text-xs">{{ t('auth.employee') }}</span>
              </Button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Separator class="flex-1" />
            <span class="text-xs text-muted-foreground uppercase">or</span>
            <Separator class="flex-1" />
          </div>

          <!-- Form login -->
          <form class="space-y-4" @submit.prevent="onLogin">
            <div class="space-y-2">
              <Label for="username">{{ t('auth.username') }}</Label>
              <Input
                id="username"
                v-model="username"
                placeholder="hr / manager / employee"
                autocomplete="username"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="password">{{ t('auth.password') }}</Label>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••"
                autocomplete="current-password"
                required
              />
            </div>
            <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
            <Button type="submit" class="w-full">{{ t('auth.login') }}</Button>
          </form>

          <p class="text-xs text-center text-muted-foreground">
            POC — any non-empty password works for seed users.
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
