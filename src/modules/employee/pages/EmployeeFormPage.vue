<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Save, ArrowLeft } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useEmployeeStore } from '@/modules/employee/stores/employee'
import { validateThaiID, formatThaiID } from '@/lib/thai-id'
import { toSatang, toBaht } from '@/types/common'
import type { BankCode, Employee } from '@/types/employee'
import type { ID } from '@/types/common'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const employee = useEmployeeStore()

const editingId = computed(() => route.params.id as ID<'EMP'> | undefined)
const isEdit = computed(() => !!editingId.value)
const existing = computed(() => (editingId.value ? employee.byId(editingId.value) : undefined))

import type { Nationality, VisaType } from '@/types/employee'

const form = ref<{
  titleTh: 'นาย' | 'นาง' | 'นางสาว'
  titleEn: 'Mr' | 'Mrs' | 'Ms'
  firstNameTh: string
  lastNameTh: string
  firstNameEn: string
  lastNameEn: string
  nicknameTh: string
  nationality: Nationality
  thaiId: string
  workPermitNo: string
  workPermitExpiry: string
  passportNo: string
  passportExpiry: string
  visaType: VisaType
  visaExpiry: string
  entryDate: string
  dob: string
  gender: 'male' | 'female' | 'other'
  email: string
  phone: string
  addressLine: string
  tambon: string
  amphoe: string
  changwat: string
  zipCode: string
  departmentId: string
  positionId: string
  startDate: string
  baseSalary: number
  monthlyAllowances: number
  pvdRate: number
  bankCode: BankCode
  bankAccount: string
}>({
  titleTh: 'นาย',
  titleEn: 'Mr',
  firstNameTh: '',
  lastNameTh: '',
  firstNameEn: '',
  lastNameEn: '',
  nicknameTh: '',
  nationality: 'TH',
  thaiId: '',
  workPermitNo: '',
  workPermitExpiry: '',
  passportNo: '',
  passportExpiry: '',
  visaType: 'Non-B',
  visaExpiry: '',
  entryDate: '',
  dob: '1990-01-01',
  gender: 'male',
  email: '',
  phone: '',
  addressLine: '',
  tambon: '',
  amphoe: '',
  changwat: 'กรุงเทพมหานคร',
  zipCode: '',
  departmentId: 'DEPT-IT',
  positionId: 'POS-IT-DEV',
  startDate: new Date().toISOString().slice(0, 10),
  baseSalary: 30000,
  monthlyAllowances: 0,
  pvdRate: 0.05,
  bankCode: 'SCB',
  bankAccount: '',
})

watchEffect(() => {
  if (existing.value) {
    const e = existing.value
    form.value = {
      titleTh: e.titleTh,
      titleEn: e.titleEn,
      firstNameTh: e.firstNameTh,
      lastNameTh: e.lastNameTh,
      firstNameEn: e.firstNameEn,
      lastNameEn: e.lastNameEn,
      nicknameTh: e.nicknameTh ?? '',
      nationality: e.nationality,
      thaiId: e.thaiId ?? '',
      workPermitNo: e.foreign?.workPermitNo ?? '',
      workPermitExpiry: e.foreign?.workPermitExpiry ?? '',
      passportNo: e.foreign?.passportNo ?? '',
      passportExpiry: e.foreign?.passportExpiry ?? '',
      visaType: e.foreign?.visaType ?? 'Non-B',
      visaExpiry: e.foreign?.visaExpiry ?? '',
      entryDate: e.foreign?.entryDate ?? '',
      dob: e.dob,
      gender: e.gender,
      email: e.email,
      phone: e.phone,
      addressLine: e.address.addressLine,
      tambon: e.address.tambon,
      amphoe: e.address.amphoe,
      changwat: e.address.changwat,
      zipCode: e.address.zipCode,
      departmentId: e.departmentId,
      positionId: e.positionId,
      startDate: e.startDate,
      baseSalary: toBaht(e.baseSalary),
      monthlyAllowances: toBaht(e.monthlyAllowances),
      pvdRate: e.pvdRate,
      bankCode: e.bankCode,
      bankAccount: e.bankAccount,
    }
  }
})

const isTH = computed(() => form.value.nationality === 'TH')

const thaiIdError = computed(() => {
  if (!isTH.value) return ''
  if (!form.value.thaiId) return ''
  return validateThaiID(form.value.thaiId) ? '' : 'เลขบัตรประชาชนไม่ถูกต้อง (Mod-11 ผิด)'
})

const passportError = computed(() => {
  if (isTH.value) return ''
  if (!form.value.passportNo) return ''
  return form.value.passportNo.length < 6 ? 'เลขหนังสือเดินทางต้องมีอย่างน้อย 6 หลัก' : ''
})

function onSubmit(ev: Event) {
  ev.preventDefault()
  if (thaiIdError.value) {
    toast.error(thaiIdError.value)
    return
  }
  if (passportError.value) {
    toast.error(passportError.value)
    return
  }
  const f = form.value
  const payload: Omit<Employee, 'id' | 'employeeNo' | 'createdAt' | 'updatedAt'> = {
    titleTh: f.titleTh,
    titleEn: f.titleEn,
    firstNameTh: f.firstNameTh,
    lastNameTh: f.lastNameTh,
    firstNameEn: f.firstNameEn,
    lastNameEn: f.lastNameEn,
    nicknameTh: f.nicknameTh || undefined,
    nationality: f.nationality,
    thaiId: isTH.value ? f.thaiId : undefined,
    foreign: !isTH.value
      ? {
          workPermitNo: f.workPermitNo || undefined,
          workPermitExpiry: f.workPermitExpiry || undefined,
          passportNo: f.passportNo || undefined,
          passportExpiry: f.passportExpiry || undefined,
          visaType: f.visaType,
          visaExpiry: f.visaExpiry || undefined,
          entryDate: f.entryDate || undefined,
        }
      : undefined,
    dob: f.dob,
    gender: f.gender,
    email: f.email,
    phone: f.phone,
    address: {
      addressLine: f.addressLine,
      tambon: f.tambon,
      amphoe: f.amphoe,
      changwat: f.changwat,
      zipCode: f.zipCode,
    },
    departmentId: f.departmentId as Employee['departmentId'],
    positionId: f.positionId as Employee['positionId'],
    startDate: f.startDate,
    status: 'active',
    baseSalary: toSatang(f.baseSalary),
    monthlyAllowances: toSatang(f.monthlyAllowances),
    pvdRate: f.pvdRate,
    bankCode: f.bankCode,
    bankAccount: f.bankAccount,
    taxAllowances: existing.value?.taxAllowances ?? {
      hasSpouse: false,
      childrenBornBefore2018: 0,
      childrenBornAfter2018: 0,
      parents: 0,
      disabled: 0,
      lifeInsurance: 0,
      healthInsurance: 0,
      homeLoanInterest: 0,
      rmf: 0,
      ssf: 0,
    },
  }
  try {
    if (isEdit.value && editingId.value) {
      employee.update(editingId.value, payload)
      toast.success('Updated')
      router.replace(`/employees/${editingId.value}`)
    } else {
      const created = employee.create(payload)
      toast.success('Created')
      router.replace(`/employees/${created.id}`)
    }
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
  }
}
</script>

<template>
  <div>
    <Button variant="ghost" size="sm" class="mb-3" @click="router.back()">
      <ArrowLeft class="h-4 w-4 mr-1" />
      {{ t('common.back') }}
    </Button>
    <PageHeader :title="isEdit ? 'Edit Employee' : 'Add Employee'" />

    <form @submit="onSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Personal</CardTitle></CardHeader>
          <CardContent class="space-y-3">
            <div class="grid grid-cols-3 gap-3">
              <div class="space-y-1">
                <Label>Title (TH)</Label>
                <Select v-model="form.titleTh">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="นาย">นาย</SelectItem>
                    <SelectItem value="นาง">นาง</SelectItem>
                    <SelectItem value="นางสาว">นางสาว</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1 col-span-2">
                <Label>First Name (TH)</Label>
                <Input v-model="form.firstNameTh" required />
              </div>
              <div class="space-y-1 col-span-3">
                <Label>Last Name (TH)</Label>
                <Input v-model="form.lastNameTh" required />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label>First (EN)</Label>
                <Input v-model="form.firstNameEn" required />
              </div>
              <div class="space-y-1">
                <Label>Last (EN)</Label>
                <Input v-model="form.lastNameEn" required />
              </div>
            </div>
            <div class="space-y-1">
              <Label>Nickname (ชื่อเล่น)</Label>
              <Input v-model="form.nicknameTh" />
            </div>
            <div class="space-y-1">
              <Label>สัญชาติ</Label>
              <Select v-model="form.nationality">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TH">🇹🇭 ไทย</SelectItem>
                  <SelectItem value="MM">🇲🇲 เมียนมา</SelectItem>
                  <SelectItem value="KH">🇰🇭 กัมพูชา</SelectItem>
                  <SelectItem value="LA">🇱🇦 ลาว</SelectItem>
                  <SelectItem value="VN">🇻🇳 เวียดนาม</SelectItem>
                  <SelectItem value="OTHER">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Thai citizen: show Thai ID -->
            <div v-if="form.nationality === 'TH'" class="space-y-1">
              <Label>เลขบัตรประชาชน (13 หลัก)</Label>
              <Input v-model="form.thaiId" placeholder="1234567890123" maxlength="17" />
              <p v-if="thaiIdError" class="text-xs text-destructive">{{ thaiIdError }}</p>
              <p v-else-if="form.thaiId && validateThaiID(form.thaiId)" class="text-xs text-green-600">
                ✓ ถูกต้อง: {{ formatThaiID(form.thaiId) }}
              </p>
            </div>

            <!-- Foreign worker: show WP + Passport + Visa -->
            <div v-else class="space-y-3 p-3 border rounded-md bg-muted/30">
              <div class="text-sm font-semibold">เอกสารต่างชาติ</div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <Label>บัตรชมพู (Work Permit)</Label>
                  <Input v-model="form.workPermitNo" placeholder="WP-XXXXXXX" />
                </div>
                <div class="space-y-1">
                  <Label>วันหมดอายุบัตรชมพู</Label>
                  <Input v-model="form.workPermitExpiry" type="date" />
                </div>
                <div class="space-y-1">
                  <Label>หนังสือเดินทาง (Passport)</Label>
                  <Input v-model="form.passportNo" placeholder="ABC12345" />
                  <p v-if="passportError" class="text-xs text-destructive">{{ passportError }}</p>
                </div>
                <div class="space-y-1">
                  <Label>วันหมดอายุ Passport</Label>
                  <Input v-model="form.passportExpiry" type="date" />
                </div>
                <div class="space-y-1">
                  <Label>ประเภทวีซ่า</Label>
                  <Select v-model="form.visaType">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Non-B">Non-B (ทำงาน)</SelectItem>
                      <SelectItem value="Non-ED">Non-ED (ศึกษา)</SelectItem>
                      <SelectItem value="Non-O">Non-O (ครอบครัว)</SelectItem>
                      <SelectItem value="LTR">LTR (พำนักระยะยาว)</SelectItem>
                      <SelectItem value="Smart">Smart Visa</SelectItem>
                      <SelectItem value="Other">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-1">
                  <Label>วันหมดอายุวีซ่า</Label>
                  <Input v-model="form.visaExpiry" type="date" />
                </div>
                <div class="space-y-1 col-span-2">
                  <Label>วันที่เข้าประเทศ</Label>
                  <Input v-model="form.entryDate" type="date" />
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label>DOB</Label>
                <Input v-model="form.dob" type="date" required />
              </div>
              <div class="space-y-1">
                <Label>Gender</Label>
                <Select v-model="form.gender">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label>Email</Label>
                <Input v-model="form.email" type="email" required />
              </div>
              <div class="space-y-1">
                <Label>Phone</Label>
                <Input v-model="form.phone" required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Work & Compensation</CardTitle></CardHeader>
          <CardContent class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label>Department</Label>
                <Select v-model="form.departmentId">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="d in employee.departments" :key="d.id" :value="d.id">{{ d.nameTh }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1">
                <Label>Position</Label>
                <Select v-model="form.positionId">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="p in employee.positions" :key="p.id" :value="p.id">{{ p.titleTh }}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="space-y-1">
              <Label>Start Date</Label>
              <Input v-model="form.startDate" type="date" required />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label>Base Salary (THB/mo)</Label>
                <Input v-model.number="form.baseSalary" type="number" min="0" step="100" required />
              </div>
              <div class="space-y-1">
                <Label>Allowances (THB/mo)</Label>
                <Input v-model.number="form.monthlyAllowances" type="number" min="0" step="100" />
              </div>
            </div>
            <div class="space-y-1">
              <Label>PVD Rate: {{ (form.pvdRate * 100).toFixed(0) }}%</Label>
              <Input v-model.number="form.pvdRate" type="range" min="0.03" max="0.15" step="0.01" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <Label>Bank</Label>
                <Select v-model="form.bankCode">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCB">SCB</SelectItem>
                    <SelectItem value="KBANK">KBank</SelectItem>
                    <SelectItem value="BBL">BBL</SelectItem>
                    <SelectItem value="KTB">KTB</SelectItem>
                    <SelectItem value="TTB">TTB</SelectItem>
                    <SelectItem value="BAY">BAY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1">
                <Label>Account (10 digits)</Label>
                <Input v-model="form.bankAccount" maxlength="10" required />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="mt-4 flex gap-2 justify-end">
        <Button type="button" variant="outline" @click="router.back()">{{ t('common.cancel') }}</Button>
        <Button type="submit">
          <Save class="mr-2 h-4 w-4" />
          {{ t('common.save') }}
        </Button>
      </div>
    </form>
  </div>
</template>
