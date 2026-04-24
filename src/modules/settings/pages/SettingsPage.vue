<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useAppStore } from '@/stores/app'
import type { Locale, Theme } from '@/stores/app'
import type { DateSystem } from '@/lib/format-date'
import { toast } from 'vue-sonner'

const { t, locale: i18nLocale } = useI18n()
const app = useAppStore()

function onLocaleChange(value: unknown) {
  if (!value) return
  const v = value as Locale
  app.setLocale(v)
  i18nLocale.value = v
  toast.success(t('common.success'))
}

function onThemeChange(value: unknown) {
  if (!value) return
  app.setTheme(value as Theme)
  toast.success(t('common.success'))
}

function onDateSystemChange(value: unknown) {
  if (!value) return
  app.dateSystem = value as DateSystem
  toast.success(t('common.success'))
}
</script>

<template>
  <div>
    <PageHeader :title="t('nav.settings')" />

    <div class="grid gap-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{{ t('settings.language') }}</CardTitle>
          <CardDescription>Switch interface between Thai and English.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-2">
            <Label>{{ t('settings.language') }}</Label>
            <Select :model-value="app.locale" @update:model-value="onLocaleChange">
              <SelectTrigger class="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="th">ไทย</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{{ t('settings.theme') }}</CardTitle>
          <CardDescription>Light, dark, or follow system preference.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-2">
            <Label>{{ t('settings.theme') }}</Label>
            <Select :model-value="app.theme" @update:model-value="onThemeChange">
              <SelectTrigger class="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{{ t('theme.light') }}</SelectItem>
                <SelectItem value="dark">{{ t('theme.dark') }}</SelectItem>
                <SelectItem value="system">{{ t('theme.system') }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{{ t('settings.dateSystem') }}</CardTitle>
          <CardDescription>Display dates in Christian Era (CE) or Buddhist Era (BE).</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-2">
            <Label>{{ t('settings.dateSystem') }}</Label>
            <Select :model-value="app.dateSystem" @update:model-value="onDateSystemChange">
              <SelectTrigger class="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CE">{{ t('dateSystem.CE') }} (2026)</SelectItem>
                <SelectItem value="BE">{{ t('dateSystem.BE') }} (2569)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{{ t('settings.profile') }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">Coming in Phase 12 — profile edit + avatar.</p>
          <Button variant="outline" disabled class="mt-3">Edit Profile</Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
