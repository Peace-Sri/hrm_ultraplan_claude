import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User, RoleKey } from '@/types/user'
import type { Employee } from '@/types/employee'
import type { PermissionKey } from '@/lib/permissions'
import { ROLE_PERMISSIONS, hasPermission as hp } from '@/lib/permissions'
import { buildUsers, buildEmployees } from '@/lib/mock-seed'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const users = ref<User[]>(buildUsers())
    const allEmployees = ref<Employee[]>(buildEmployees())
    const currentUserId = ref<User['id'] | null>(null)

    const currentUser = computed(() => users.value.find((u) => u.id === currentUserId.value) ?? null)
    const currentEmployee = computed<Employee | null>(() =>
      currentUser.value
        ? allEmployees.value.find((e) => e.id === currentUser.value!.employeeId) ?? null
        : null,
    )
    const currentRole = computed<RoleKey | null>(() => currentUser.value?.activeRoleKey ?? null)
    const permissions = computed<PermissionKey[]>(() =>
      currentRole.value ? ROLE_PERMISSIONS[currentRole.value] : [],
    )
    const isAuthed = computed(() => !!currentUser.value)

    function login(username: string, password: string): boolean {
      const user = users.value.find((u) => u.username === username)
      // POC: any non-empty password passes for seed users
      if (!user || !password) return false
      currentUserId.value = user.id
      user.lastLoginAt = new Date().toISOString()
      return true
    }

    /** Quick-login for demo: pick the first user with the given role. */
    function quickLogin(role: RoleKey): boolean {
      const user = users.value.find((u) => u.roleKeys.includes(role))
      if (!user) return false
      currentUserId.value = user.id
      user.activeRoleKey = role
      user.lastLoginAt = new Date().toISOString()
      return true
    }

    function logout() {
      currentUserId.value = null
    }

    function switchRole(role: RoleKey) {
      if (!currentUser.value) return
      if (!currentUser.value.roleKeys.includes(role)) {
        currentUser.value.roleKeys.push(role)
      }
      currentUser.value.activeRoleKey = role
    }

    function hasPermission(required: PermissionKey | PermissionKey[]): boolean {
      return hp(permissions.value, required)
    }

    function requirePermission(required: PermissionKey | PermissionKey[]): void {
      if (!hasPermission(required)) {
        throw new Error(`Permission denied: ${Array.isArray(required) ? required.join(' | ') : required}`)
      }
    }

    return {
      users,
      allEmployees,
      currentUserId,
      currentUser,
      currentEmployee,
      currentRole,
      permissions,
      isAuthed,
      login,
      quickLogin,
      logout,
      switchRole,
      hasPermission,
      requirePermission,
    }
  },
  {
    persist: {
      pick: ['currentUserId'],
    },
  },
)
