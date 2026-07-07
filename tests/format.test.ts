import { describe, expect, it } from 'vitest'
import {
  ValidationError,
  formatCurrencyDE,
  formatDateDE,
  formatMonthYearDE,
  formatPercentDE,
  isValidIsoDate,
  parseCurrencyDE
} from '../src/shared/format'

describe('formatCurrencyDE', () => {
  it('formatiert positive Beträge im deutschen Format', () => {
    expect(formatCurrencyDE(123456)).toBe('1.234,56 €')
  })

  it('formatiert Beträge unter 1000', () => {
    expect(formatCurrencyDE(500)).toBe('5,00 €')
  })

  it('formatiert 0', () => {
    expect(formatCurrencyDE(0)).toBe('0,00 €')
  })

  it('formatiert negative Beträge', () => {
    expect(formatCurrencyDE(-150)).toBe('-1,50 €')
  })

  it('formatiert große Beträge mit mehreren Tausendertrennzeichen', () => {
    expect(formatCurrencyDE(123456789)).toBe('1.234.567,89 €')
  })

  it('rundet auf ganze Cent', () => {
    expect(formatCurrencyDE(100.6)).toBe('1,01 €')
  })
})

describe('parseCurrencyDE', () => {
  it('parst einfache Beträge ohne Nachkommastellen', () => {
    expect(parseCurrencyDE('1234')).toBe(123400)
  })

  it('parst Beträge mit Tausenderpunkt und Komma', () => {
    expect(parseCurrencyDE('1.234,56')).toBe(123456)
  })

  it('parst Beträge ohne Tausenderpunkt', () => {
    expect(parseCurrencyDE('1234,56')).toBe(123456)
  })

  it('parst einstellige Nachkommastellen', () => {
    expect(parseCurrencyDE('12,5')).toBe(1250)
  })

  it('parst negative Beträge', () => {
    expect(parseCurrencyDE('-12,50')).toBe(-1250)
  })

  it('parst mehrere Tausendertrennzeichen', () => {
    expect(parseCurrencyDE('1.234.567,89')).toBe(123456789)
  })

  it('parst kleine Centbeträge', () => {
    expect(parseCurrencyDE('0,01')).toBe(1)
  })

  it('wirft bei leerem String', () => {
    expect(() => parseCurrencyDE('')).toThrow(ValidationError)
  })

  it('wirft bei nur Leerzeichen', () => {
    expect(() => parseCurrencyDE('   ')).toThrow(ValidationError)
  })

  it('wirft bei ungültigen Zeichen', () => {
    expect(() => parseCurrencyDE('abc')).toThrow(ValidationError)
  })

  it('wirft bei mehr als 2 Nachkommastellen', () => {
    expect(() => parseCurrencyDE('12,345')).toThrow(ValidationError)
  })

  it('wirft bei falscher Tausendergruppierung', () => {
    expect(() => parseCurrencyDE('12.3456,00')).toThrow(ValidationError)
  })

  it('wirft bei Punkt als Dezimaltrennzeichen (englisches Format)', () => {
    expect(() => parseCurrencyDE('1234.56')).toThrow(ValidationError)
  })

  it('wirft bei doppeltem Minus', () => {
    expect(() => parseCurrencyDE('--12,50')).toThrow(ValidationError)
  })
})

describe('formatDateDE', () => {
  it('formatiert ISO-Datum als deutsches Datum', () => {
    expect(formatDateDE('2026-07-07')).toBe('07.07.2026')
  })
})

describe('formatMonthYearDE', () => {
  it('formatiert Monat und Jahr auf Deutsch', () => {
    expect(formatMonthYearDE(2026, 7)).toBe('Juli 2026')
    expect(formatMonthYearDE(2025, 1)).toBe('Januar 2025')
    expect(formatMonthYearDE(2025, 12)).toBe('Dezember 2025')
  })
})

describe('formatPercentDE', () => {
  it('formatiert Prozentzahlen mit Komma', () => {
    expect(formatPercentDE(23.456)).toBe('23,5 %')
  })

  it('formatiert 0 Prozent', () => {
    expect(formatPercentDE(0)).toBe('0,0 %')
  })
})

describe('isValidIsoDate', () => {
  it('akzeptiert gültige Daten', () => {
    expect(isValidIsoDate('2026-07-07')).toBe(true)
    expect(isValidIsoDate('2024-02-29')).toBe(true)
  })

  it('lehnt ungültige Daten ab', () => {
    expect(isValidIsoDate('2025-02-30')).toBe(false)
    expect(isValidIsoDate('2025-13-01')).toBe(false)
    expect(isValidIsoDate('not-a-date')).toBe(false)
    expect(isValidIsoDate('07.07.2026')).toBe(false)
  })
})
