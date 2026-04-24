<script setup lang="ts">
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="My Payslip" description="Coming in Phase 10" />
    <EmptyState
      title="Phase 10 pending"
      description="Full breakdown with real Thai tax/SSO/PVD calc, BE/CE toggle, PDF download."
    />
  </div>
</template>
