<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Approval Inbox" description="Coming in Phase 11" />
    <EmptyState
      title="Phase 11 pending"
      description="Global inbox aggregating leave + attendance corrections."
    />
  </div>
</template>
