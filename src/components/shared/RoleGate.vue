<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth'
import type { PermissionKey } from '@/lib/permissions'

const props = defineProps<{
  requires: PermissionKey | PermissionKey[]
}>()

const auth = useAuthStore()
const allowed = computed(() => auth.hasPermission(props.requires))
</script>

<template>
  <template v-if="allowed">
    <slot />
  </template>
  <template v-else>
    <slot name="fallback" />
  </template>
</template>
