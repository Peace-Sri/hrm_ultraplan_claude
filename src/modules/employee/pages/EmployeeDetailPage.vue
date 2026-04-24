<script setup lang="ts">
import { useRoute } from 'vue-router'
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'

const route = useRoute()
</script>

<template>
  <div>
    <PageHeader title="Employee Detail" :description="`ID: ${route.params.id}`" />
    <EmptyState
      title="Phase 7 pending"
      description="Tabbed detail view (Personal / Work / Compensation / History)."
    />
  </div>
</template>
