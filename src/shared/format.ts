export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

const GERMAN_MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember'
]

/** Formatiert Cent-Beträge im deutschen Format, z. B. 123456 -> "1.234,56 €". */
export function formatCurrencyDE(cents: number): string {
  if (!Number.isFinite(cents)) return '–'
  const rounded = Math.round(cents)
  const sign = rounded < 0 ? '-' : ''
  const abs = Math.abs(rounded)
  const euros = Math.floor(abs / 100)
  const centsPart = abs % 100
  const euroStr = euros.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${sign}${euroStr},${centsPart.toString().padStart(2, '0')} €`
}

/** Wie formatCurrencyDE, aber ohne Euro-Zeichen (für Eingabefelder). */
export function formatAmountInputDE(cents: number): string {
  const rounded = Math.round(cents)
  const sign = rounded < 0 ? '-' : ''
  const abs = Math.abs(rounded)
  const euros = Math.floor(abs / 100)
  const centsPart = abs % 100
  const euroStr = euros.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${sign}${euroStr},${centsPart.toString().padStart(2, '0')}`
}

const AMOUNT_PATTERN = /^(-)?(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?$/

/**
 * Parst einen deutschen Betragsstring ("1.234,56") streng in Cent.
 * Wirft eine ValidationError bei ungültiger Eingabe.
 */
export function parseCurrencyDE(input: string): number {
  const trimmed = input.trim()
  if (trimmed.length === 0) {
    throw new ValidationError('Bitte einen Betrag eingeben.')
  }
  const match = AMOUNT_PATTERN.exec(trimmed)
  if (!match) {
    throw new ValidationError('Ungültiger Betrag. Bitte im Format 1.234,56 eingeben.')
  }
  const [, negativeSign, integerPart, decimalPart] = match
  const cleanInteger = integerPart.replace(/\./g, '')
  const cents = parseInt(cleanInteger, 10) * 100 + parseInt((decimalPart ?? '').padEnd(2, '0'), 10)
  const signedCents = negativeSign ? -cents : cents
  if (signedCents === 0 && negativeSign) {
    return 0
  }
  return signedCents
}

/** Formatiert ein ISO-Datum (yyyy-MM-dd) als deutsches Datum (dd.MM.yyyy). */
export function formatDateDE(isoDate: string): string {
  const parts = isoDate.split('-')
  if (parts.length !== 3) return isoDate
  const [year, month, day] = parts
  return `${day}.${month}.${year}`
}

/** Formatiert Jahr/Monat als "Juli 2026". */
export function formatMonthYearDE(year: number, month: number): string {
  const name = GERMAN_MONTHS[month - 1] ?? '?'
  return `${name} ${year}`
}

export function formatPercentDE(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '–'
  return `${value.toFixed(decimals).replace('.', ',')} %`
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10)
}

export function assertValidIsoDate(value: string, fieldLabel = 'Datum'): void {
  if (!isValidIsoDate(value)) {
    throw new ValidationError(`${fieldLabel} ist ungültig. Bitte ein gültiges Datum wählen.`)
  }
}

export function assertNonEmpty(value: string, fieldLabel: string): void {
  if (value.trim().length === 0) {
    throw new ValidationError(`${fieldLabel} darf nicht leer sein.`)
  }
}

export function assertPositiveAmount(cents: number, fieldLabel = 'Betrag'): void {
  if (!Number.isFinite(cents) || cents <= 0) {
    throw new ValidationError(`${fieldLabel} muss größer als 0 sein.`)
  }
}
