<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Apply Leave" description="Coming in Phase 9" />
    <EmptyState
      title="Phase 9 pending"
      description="Date range picker excluding weekends + Thai holidays, type selector, reason, attachments."
    />
  </div>
</template>
