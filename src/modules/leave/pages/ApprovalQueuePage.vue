<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Leave Approvals" description="Coming in Phase 9" />
    <EmptyState title="Phase 9 pending" description="Queue of pending requests with approve/reject." />
  </div>
</template>
