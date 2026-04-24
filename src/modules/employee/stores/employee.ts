import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Employee } from '@/types/employee'
import type { Department, Position } from '@/types/org'
import type { ID } from '@/types/common'
import { buildDepartments, buildPositions } from '@/lib/mock-seed'
import { useAuthStore } from '@/modules/auth/stores/auth'

let nextIdSeq = 10000
const mkEmployeeId = () => `EMP-${String(nextIdSeq++).padStart(5, '0')}` as ID<'EMP'>

export const useEmployeeStore = defineStore(
  'employee',
  () => {
    const auth = useAuthStore()
    const departments = ref<Department[]>(buildDepartments())
    const positions = ref<Position[]>(buildPositions())

    // Note: employees are owned by authStore (allEmployees) for shared access.
    // Helpers / CRUD delegate to auth.allEmployees.
    const all = computed(() => auth.allEmployees)
    const active = computed(() => all.value.filter((e) => e.status === 'active'))
    const byDepartment = (deptId: ID<'DEPT'>) =>
      all.value.filter((e) => e.departmentId === deptId)

    function byId(id: ID<'EMP'>): Employee | undefined {
      return all.value.find((e) => e.id === id)
    }

    function byManager(managerId: ID<'EMP'>): Employee[] {
      return all.value.filter((e) => e.managerId === managerId)
    }

    function getDepartmentName(id: ID<'DEPT'>, locale: 'th' | 'en' = 'th'): string {
      const d = departments.value.find((x) => x.id === id)
      return d ? (locale === 'th' ? d.nameTh : d.nameEn) : ''
    }

    function getPositionName(id: ID<'POS'>, locale: 'th' | 'en' = 'th'): string {
      const p = positions.value.find((x) => x.id === id)
      return p ? (locale === 'th' ? p.titleTh : p.titleEn) : ''
    }

    function create(data: Omit<Employee, 'id' | 'employeeNo' | 'createdAt' | 'updatedAt'>): Employee {
      auth.requirePermission('employee.create')
      const seq = all.value.length + 1
      const id = mkEmployeeId()
      const emp: Employee = {
        ...data,
        id,
        employeeNo: `EMP${String(seq).padStart(5, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      auth.allEmployees.push(emp)
      return emp
    }

    function update(id: ID<'EMP'>, patch: Partial<Employee>) {
      auth.requirePermission('employee.edit')
      const idx = auth.allEmployees.findIndex((e) => e.id === id)
      if (idx < 0) return
      auth.allEmployees[idx] = {
        ...auth.allEmployees[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
      }
    }

    function softDelete(id: ID<'EMP'>) {
      auth.requirePermission('employee.delete')
      update(id, { status: 'terminated', terminationDate: new Date().toISOString().slice(0, 10) })
    }

    return {
      departments,
      positions,
      all,
      active,
      byDepartment,
      byId,
      byManager,
      getDepartmentName,
      getPositionName,
      create,
      update,
      softDelete,
    }
  },
)
