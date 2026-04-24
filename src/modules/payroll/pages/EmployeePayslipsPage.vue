<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Employee Payslips" description="Coming in Phase 10" />
    <EmptyState title="Phase 10 pending" description="HR view of all employees' payslips." />
  </div>
</template>
