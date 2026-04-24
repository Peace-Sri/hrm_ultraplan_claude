<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="My Attendance" description="Coming in Phase 8" />
    <EmptyState title="Phase 8 pending" description="Calendar + list of my clock events." />
  </div>
</template>
