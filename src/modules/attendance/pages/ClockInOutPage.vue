<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Clock In / Out" description="Coming in Phase 8" />
    <EmptyState
      title="Phase 8 pending"
      description="Real GPS clock with office-distance check, status machine (Not clocked → Working → Done)."
    />
  </div>
</template>
