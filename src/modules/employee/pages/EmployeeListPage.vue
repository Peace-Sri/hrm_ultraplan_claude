<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Plus } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { Button } from '@/components/ui/button'
import RoleGate from '@/components/shared/RoleGate.vue'

const { t } = useI18n()
</script>

<template>
  <div>
    <PageHeader :title="t('nav.employees')" description="Coming in Phase 7: list, search, filter, Excel export">
      <template #actions>
        <RoleGate requires="employee.create">
          <Button as-child>
            <RouterLink to="/employees/new">
              <Plus class="mr-2 h-4 w-4" />
              {{ t('common.add') }}
            </RouterLink>
          </Button>
        </RoleGate>
      </template>
    </PageHeader>

    <EmptyState title="Phase 7 pending" description="DataTable with sort/filter/pagination will arrive in Phase 7." />
  </div>
</template>
