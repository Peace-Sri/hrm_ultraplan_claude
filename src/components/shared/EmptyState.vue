<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <Inbox class="h-12 w-12 text-muted-foreground/50 mb-4" />
    <h3 class="text-lg font-medium">{{ title ?? 'No data yet' }}</h3>
    <p v-if="description" class="text-sm text-muted-foreground mt-1 max-w-sm">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
