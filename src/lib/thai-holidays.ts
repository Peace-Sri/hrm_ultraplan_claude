export interface ThaiHoliday {
  date: string // ISO date "2026-01-01"
  nameTh: string
  nameEn: string
}

/**
 * Thai public holidays 2026.
 * Source: Bank of Thailand official announcement.
 * Lunar dates (Makha Bucha, Visakha Bucha, Asahna Bucha, Khao Phansa) adjusted yearly.
 */
export const THAI_HOLIDAYS_2026: ThaiHoliday[] = [
  { date: '2026-01-01', nameTh: 'วันขึ้นปีใหม่', nameEn: 'New Year' },
  { date: '2026-02-13', nameTh: 'วันมาฆบูชา', nameEn: 'Makha Bucha' },
  { date: '2026-04-06', nameTh: 'วันจักรี', nameEn: 'Chakri Day' },
  { date: '2026-04-13', nameTh: 'วันสงกรานต์', nameEn: 'Songkran' },
  { date: '2026-04-14', nameTh: 'วันสงกรานต์', nameEn: 'Songkran' },
  { date: '2026-04-15', nameTh: 'วันสงกรานต์', nameEn: 'Songkran' },
  { date: '2026-05-01', nameTh: 'วันแรงงาน', nameEn: 'Labour Day' },
  { date: '2026-05-04', nameTh: 'วันฉัตรมงคล', nameEn: 'Coronation Day' },
  { date: '2026-05-11', nameTh: 'วันวิสาขบูชา', nameEn: 'Visakha Bucha' },
  { date: '2026-06-03', nameTh: 'วันเฉลิมพระชนมพรรษา พระราชินี', nameEn: "Queen's Birthday" },
  { date: '2026-07-10', nameTh: 'วันอาสาฬหบูชา', nameEn: 'Asahna Bucha' },
  { date: '2026-07-11', nameTh: 'วันเข้าพรรษา', nameEn: 'Khao Phansa' },
  { date: '2026-07-28', nameTh: 'วันเฉลิมพระชนมพรรษา ร.10', nameEn: "King's Birthday" },
  { date: '2026-08-12', nameTh: 'วันแม่แห่งชาติ', nameEn: "Mother's Day" },
  { date: '2026-10-13', nameTh: 'วันคล้ายสวรรคต ร.9', nameEn: 'King Bhumibol Memorial' },
  { date: '2026-10-23', nameTh: 'วันปิยมหาราช', nameEn: 'Chulalongkorn Day' },
  { date: '2026-12-05', nameTh: 'วันพ่อแห่งชาติ', nameEn: "Father's Day" },
  { date: '2026-12-10', nameTh: 'วันรัฐธรรมนูญ', nameEn: 'Constitution Day' },
  { date: '2026-12-31', nameTh: 'วันสิ้นปี', nameEn: "New Year's Eve" },
]

export function isHoliday(dateISO: string): boolean {
  return THAI_HOLIDAYS_2026.some((h) => h.date === dateISO)
}

export function getHoliday(dateISO: string): ThaiHoliday | undefined {
  return THAI_HOLIDAYS_2026.find((h) => h.date === dateISO)
}
