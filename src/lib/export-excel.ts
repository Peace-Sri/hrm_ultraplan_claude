import * as XLSX from 'xlsx'
import type { Employee } from '@/types/employee'
import type { Department, Position } from '@/types/org'
import { toBaht } from '@/types/common'

export async function exportEmployeesToExcel(
  employees: Employee[],
  departments: Department[],
  positions: Position[],
  locale: 'th' | 'en' = 'th',
) {
  const rows = employees.map((e) => {
    const d = departments.find((x) => x.id === e.departmentId)
    const p = positions.find((x) => x.id === e.positionId)
    return {
      'Employee No': e.employeeNo,
      'Name (TH)': `${e.titleTh}${e.firstNameTh} ${e.lastNameTh}`,
      'Name (EN)': `${e.titleEn}. ${e.firstNameEn} ${e.lastNameEn}`,
      Nickname: e.nicknameTh ?? '',
      'Thai ID': e.thaiId,
      Email: e.email,
      Phone: e.phone,
      Department: locale === 'th' ? d?.nameTh : d?.nameEn,
      Position: locale === 'th' ? p?.titleTh : p?.titleEn,
      'Start Date': e.startDate,
      Status: e.status,
      'Base Salary (THB)': toBaht(e.baseSalary),
      'PVD Rate': e.pvdRate,
      Bank: e.bankCode,
      'Bank Account': e.bankAccount,
    }
  })
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Employees')
  XLSX.writeFile(wb, `employees-${new Date().toISOString().slice(0, 10)}.xlsx`)
}
