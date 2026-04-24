import type { NavigationGuardWithThis } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth'
import type { PermissionKey } from '@/lib/permissions'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresPermission?: PermissionKey | PermissionKey[]
    title?: string
  }
}

export const authGuard: NavigationGuardWithThis<undefined> = (to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth === false) return true
  if (!auth.isAuthed) {
    return { name: 'login', query: { next: to.fullPath } }
  }
  return true
}

export const permissionGuard: NavigationGuardWithThis<undefined> = (to) => {
  const auth = useAuthStore()
  if (!to.meta.requiresPermission) return true
  if (!auth.hasPermission(to.meta.requiresPermission)) {
    return { name: 'forbidden' }
  }
  return true
}
