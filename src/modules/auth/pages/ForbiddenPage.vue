<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ShieldAlert } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md text-center space-y-4">
      <ShieldAlert class="h-16 w-16 text-destructive mx-auto" />
      <h1 class="text-3xl font-bold">{{ t('auth.forbidden.title') }}</h1>
      <p class="text-muted-foreground">
        {{ t('auth.forbidden.description') }}
      </p>
      <div class="flex gap-2 justify-center">
        <Button variant="outline" @click="router.back()">{{ t('common.goBack') }}</Button>
        <Button @click="router.replace('/dashboard')">{{ t('auth.forbidden.goHome') }}</Button>
      </div>
    </div>
  </div>
</template>
