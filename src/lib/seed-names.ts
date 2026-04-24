/**
 * Hand-curated Thai/English name pool for realistic seed data.
 * Mix of common given names + family names.
 */

export const THAI_MALE_FIRST_NAMES: Array<{ th: string; en: string; nickname: string }> = [
  { th: 'สมชาย', en: 'Somchai', nickname: 'ชาย' },
  { th: 'วิชัย', en: 'Wichai', nickname: 'ตั้ม' },
  { th: 'อนุชา', en: 'Anucha', nickname: 'หนึ่ง' },
  { th: 'ประเสริฐ', en: 'Prasert', nickname: 'เส' },
  { th: 'สุรชัย', en: 'Surachai', nickname: 'ชัย' },
  { th: 'ธนา', en: 'Thana', nickname: 'ธนา' },
  { th: 'ภานุ', en: 'Phanu', nickname: 'นุ' },
  { th: 'ณัฐวุฒิ', en: 'Nattawut', nickname: 'ณัฐ' },
  { th: 'กิตติ', en: 'Kitti', nickname: 'กิต' },
  { th: 'อภิชาติ', en: 'Apichart', nickname: 'ชาติ' },
]

export const THAI_FEMALE_FIRST_NAMES: Array<{ th: string; en: string; nickname: string }> = [
  { th: 'สมหญิง', en: 'Somying', nickname: 'หญิง' },
  { th: 'อรทัย', en: 'Orathai', nickname: 'อร' },
  { th: 'พิมพ์ใจ', en: 'Pimjai', nickname: 'พิม' },
  { th: 'รัตนา', en: 'Rattana', nickname: 'รัต' },
  { th: 'สุดา', en: 'Suda', nickname: 'ดา' },
  { th: 'มณี', en: 'Manee', nickname: 'มณี' },
  { th: 'ปิยะดา', en: 'Piyada', nickname: 'ปิย' },
  { th: 'ศิริพร', en: 'Siriporn', nickname: 'ศิ' },
  { th: 'นพพร', en: 'Nopporn', nickname: 'นพ' },
  { th: 'ฐิติพร', en: 'Titiporn', nickname: 'ฐิ' },
]

export const THAI_LAST_NAMES: Array<{ th: string; en: string }> = [
  { th: 'ใจดี', en: 'Jaidee' },
  { th: 'รักษ์ไทย', en: 'Rakthai' },
  { th: 'สุขสวัสดิ์', en: 'Suksawat' },
  { th: 'จันทร์เพ็ญ', en: 'Janphen' },
  { th: 'ศรีสุวรรณ', en: 'Srisuwan' },
  { th: 'ทองสุข', en: 'Thongsuk' },
  { th: 'เจริญผล', en: 'Jaroenphon' },
  { th: 'มีสุข', en: 'Meesuk' },
  { th: 'วงศ์วาน', en: 'Wongwan' },
  { th: 'บุญเลิศ', en: 'Boonlert' },
  { th: 'สืบสาย', en: 'Suebsai' },
  { th: 'พงศ์พันธ์', en: 'Pongpan' },
]

export const THAI_DEPARTMENTS: Array<{ id: string; th: string; en: string; costCenter: string }> = [
  { id: 'DEPT-HR', th: 'ทรัพยากรบุคคล', en: 'Human Resources', costCenter: 'CC-HR' },
  { id: 'DEPT-FIN', th: 'บัญชีและการเงิน', en: 'Finance', costCenter: 'CC-FIN' },
  { id: 'DEPT-SAL', th: 'ขาย', en: 'Sales', costCenter: 'CC-SAL' },
  { id: 'DEPT-MKT', th: 'การตลาด', en: 'Marketing', costCenter: 'CC-MKT' },
  { id: 'DEPT-IT', th: 'เทคโนโลยีสารสนเทศ', en: 'Information Technology', costCenter: 'CC-IT' },
  { id: 'DEPT-OPS', th: 'ปฏิบัติการ', en: 'Operations', costCenter: 'CC-OPS' },
  { id: 'DEPT-PRD', th: 'ผลิต', en: 'Production', costCenter: 'CC-PRD' },
]

export const THAI_POSITIONS: Array<{
  id: string
  th: string
  en: string
  level: 'entry' | 'junior' | 'senior' | 'lead' | 'manager' | 'director'
  minBaht: number
  maxBaht: number
}> = [
  { id: 'POS-HR-MGR', th: 'ผู้จัดการฝ่ายบุคคล', en: 'HR Manager', level: 'manager', minBaht: 60000, maxBaht: 120000 },
  { id: 'POS-HR-STF', th: 'เจ้าหน้าที่บุคคล', en: 'HR Officer', level: 'junior', minBaht: 25000, maxBaht: 45000 },
  { id: 'POS-FIN-MGR', th: 'ผู้จัดการบัญชี', en: 'Finance Manager', level: 'manager', minBaht: 70000, maxBaht: 140000 },
  { id: 'POS-FIN-ACC', th: 'นักบัญชี', en: 'Accountant', level: 'junior', minBaht: 28000, maxBaht: 55000 },
  { id: 'POS-SAL-MGR', th: 'ผู้จัดการฝ่ายขาย', en: 'Sales Manager', level: 'manager', minBaht: 80000, maxBaht: 200000 },
  { id: 'POS-SAL-REP', th: 'พนักงานขาย', en: 'Sales Representative', level: 'junior', minBaht: 20000, maxBaht: 50000 },
  { id: 'POS-MKT-MGR', th: 'ผู้จัดการการตลาด', en: 'Marketing Manager', level: 'manager', minBaht: 70000, maxBaht: 130000 },
  { id: 'POS-MKT-SPC', th: 'นักการตลาด', en: 'Marketing Specialist', level: 'junior', minBaht: 30000, maxBaht: 60000 },
  { id: 'POS-IT-LEAD', th: 'หัวหน้าทีมไอที', en: 'IT Lead', level: 'lead', minBaht: 80000, maxBaht: 150000 },
  { id: 'POS-IT-DEV', th: 'นักพัฒนาโปรแกรม', en: 'Software Developer', level: 'junior', minBaht: 35000, maxBaht: 80000 },
  { id: 'POS-OPS-MGR', th: 'ผู้จัดการปฏิบัติการ', en: 'Operations Manager', level: 'manager', minBaht: 60000, maxBaht: 110000 },
  { id: 'POS-OPS-STF', th: 'เจ้าหน้าที่ปฏิบัติการ', en: 'Operations Staff', level: 'entry', minBaht: 18000, maxBaht: 35000 },
  { id: 'POS-PRD-SUP', th: 'หัวหน้างานผลิต', en: 'Production Supervisor', level: 'lead', minBaht: 35000, maxBaht: 65000 },
  { id: 'POS-PRD-WRK', th: 'คนงานผลิต', en: 'Production Worker', level: 'entry', minBaht: 15000, maxBaht: 25000 },
  { id: 'POS-CEO', th: 'ประธานกรรมการบริหาร', en: 'CEO', level: 'director', minBaht: 200000, maxBaht: 500000 },
]

export const THAI_CHANGWAT_SAMPLES: Array<{ th: string; en: string; tambon: string; amphoe: string; zip: string }> = [
  { th: 'กรุงเทพมหานคร', en: 'Bangkok', tambon: 'คลองเตย', amphoe: 'คลองเตย', zip: '10110' },
  { th: 'นนทบุรี', en: 'Nonthaburi', tambon: 'บางรักน้อย', amphoe: 'เมือง', zip: '11000' },
  { th: 'ปทุมธานี', en: 'Pathum Thani', tambon: 'คลองหนึ่ง', amphoe: 'คลองหลวง', zip: '12120' },
  { th: 'สมุทรปราการ', en: 'Samut Prakan', tambon: 'บางเมือง', amphoe: 'เมือง', zip: '10270' },
  { th: 'เชียงใหม่', en: 'Chiang Mai', tambon: 'สุเทพ', amphoe: 'เมือง', zip: '50200' },
]
