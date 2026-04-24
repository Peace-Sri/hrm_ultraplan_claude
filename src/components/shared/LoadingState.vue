<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

defineProps<{ label?: string }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <Loader2 class="h-8 w-8 animate-spin text-muted-foreground mb-3" />
    <p class="text-sm text-muted-foreground">{{ label ?? 'Loading...' }}</p>
  </div>
</template>
