<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'

const router = useRouter()
</script>

<template>
  <div>
    <PageHeader title="Employee Form" description="Coming in Phase 7" />
    <EmptyState
      title="Phase 7 pending"
      description="Single-page form with Thai ID Mod-11 validation, PVD slider, tax allowances."
    />
    <div class="mt-4 flex gap-2">
      <Button variant="outline" @click="router.back()">Back</Button>
    </div>
  </div>
</template>
