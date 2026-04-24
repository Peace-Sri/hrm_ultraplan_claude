import { describe, it, expect } from 'vitest'
import { validateThaiID, formatThaiID, generateValidThaiID } from '@/lib/thai-id'

describe('Thai ID Mod-11 validator', () => {
  it('accepts a known valid ID', () => {
    // Canonical test ID (Mod-11 valid)
    expect(validateThaiID('1234567890121')).toBe(true)
  })

  it('rejects IDs with wrong checksum', () => {
    expect(validateThaiID('1234567890125')).toBe(false)
  })

  it('rejects IDs with non-13 length', () => {
    expect(validateThaiID('12345')).toBe(false)
    expect(validateThaiID('12345678901234567')).toBe(false)
  })

  it('rejects non-digit input', () => {
    expect(validateThaiID('123abc789012X')).toBe(false)
  })

  it('strips dashes before validation', () => {
    // 1234567890121 with dashes
    expect(validateThaiID('1-2345-67890-12-1')).toBe(true)
  })

  it('formats into canonical X-XXXX-XXXXX-XX-X', () => {
    expect(formatThaiID('1234567890121')).toBe('1-2345-67890-12-1')
  })

  it('generator produces valid IDs', () => {
    for (let i = 0; i < 20; i++) {
      const id = generateValidThaiID()
      expect(validateThaiID(id)).toBe(true)
    }
  })
})
