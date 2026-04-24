import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Payslip } from '@/types/payroll'
import type { Employee } from '@/types/employee'
import { toBaht } from '@/types/common'
import { toBuddhistYear } from './format-date'

const bahtStr = (s: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(toBaht(s))

/**
 * Generate a PDF payslip following Thai LPA §75 minimum content.
 * NOTE: English-only for reliability; Thai font would require embedding NotoSansThai.
 */
export function exportPayslipPDF(slip: Payslip, employee: Employee, useBE = false): void {
  const doc = new jsPDF()
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const year = useBE ? toBuddhistYear(slip.year) : slip.year
  const period = `${monthNames[slip.month]} ${year}`

  doc.setFontSize(18)
  doc.text('PAYSLIP', 14, 20)
  doc.setFontSize(10)
  doc.text(`Period: ${period}`, 14, 28)
  doc.text(`Employee No: ${employee.employeeNo}`, 14, 34)
  doc.text(`Name: ${employee.titleEn}. ${employee.firstNameEn} ${employee.lastNameEn}`, 14, 40)
  doc.text(`ID: ${employee.thaiId}`, 14, 46)
  doc.text(`Bank: ${employee.bankCode} — ${employee.bankAccount}`, 14, 52)

  autoTable(doc, {
    startY: 62,
    head: [['Earnings', 'Amount (THB)']],
    body: [
      ['Base Salary', bahtStr(slip.earnings.baseSalary)],
      ['Monthly Allowances', bahtStr(slip.earnings.monthlyAllowances)],
      ['OT Weekday (1.5x)', bahtStr(slip.earnings.otWeekday)],
      ['OT Holiday Regular (2x)', bahtStr(slip.earnings.otHolidayReg)],
      ['OT Holiday Extra (3x)', bahtStr(slip.earnings.otHolidayExtra)],
      ['Bonus', bahtStr(slip.earnings.bonus)],
      [{ content: 'Total Earnings', styles: { fontStyle: 'bold' } }, { content: bahtStr(slip.earnings.total), styles: { fontStyle: 'bold' } }],
    ],
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
  })

  autoTable(doc, {
    head: [['Deductions', 'Amount (THB)']],
    body: [
      ['Social Security (5%, capped)', bahtStr(slip.deductions.sso)],
      ['Provident Fund', bahtStr(slip.deductions.pvd)],
      ['Withholding Tax', bahtStr(slip.deductions.withholdingTax)],
      ['Absence Deduction', bahtStr(slip.deductions.absence)],
      ['Other', bahtStr(slip.deductions.other)],
      [{ content: 'Total Deductions', styles: { fontStyle: 'bold' } }, { content: bahtStr(slip.deductions.total), styles: { fontStyle: 'bold' } }],
    ],
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
  })

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  doc.setFillColor(37, 99, 235)
  doc.rect(14, finalY, 182, 14, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.text('Net Pay', 18, finalY + 9)
  doc.text(`THB ${bahtStr(slip.netPay)}`, 196, finalY + 9, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  doc.setFontSize(8)
  doc.text(
    `Working Days: ${slip.workingDaysInMonth} | Paid Days: ${slip.paidDays} | Unpaid Leave: ${slip.unpaidLeaveDays}`,
    14,
    finalY + 24,
  )
  doc.text('This payslip complies with LPA §75.', 14, finalY + 30)
  doc.text(`Generated: ${new Date().toISOString().slice(0, 10)}`, 14, finalY + 36)

  doc.save(`payslip-${employee.employeeNo}-${slip.period}.pdf`)
}
