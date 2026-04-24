<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ShieldAlert } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md text-center space-y-4">
      <ShieldAlert class="h-16 w-16 text-destructive mx-auto" />
      <h1 class="text-3xl font-bold">403 — Forbidden</h1>
      <p class="text-muted-foreground">
        You don't have permission to view this page in your current role.
      </p>
      <div class="flex gap-2 justify-center">
        <Button variant="outline" @click="router.back()">Go Back</Button>
        <Button @click="router.replace('/dashboard')">Go to Dashboard</Button>
      </div>
    </div>
  </div>
</template>
