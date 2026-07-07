import Papa from 'papaparse'
import type { CsvColumnMapping } from '@shared/types'
import type { BulkImportRow } from '@shared/inputs'

export interface ParsedCsv {
  headers: string[]
  rows: Record<string, string>[]
}

export function parseCsvFile(text: string, delimiter: CsvColumnMapping['delimiter']): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    delimiter,
    skipEmptyLines: true
  })
  const headers = result.meta.fields ?? []
  return { headers, rows: result.data }
}

function convertDateToIso(raw: string, dateFormat: CsvColumnMapping['dateFormat']): string | null {
  const value = raw.trim()
  if (dateFormat === 'yyyy-MM-dd') {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
  }
  if (dateFormat === 'dd.MM.yyyy') {
    const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value)
    if (!match) return null
    const [, d, m, y] = match
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  if (dateFormat === 'MM/dd/yyyy') {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value)
    if (!match) return null
    const [, m, d, y] = match
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return null
}

function parseAmountToCents(raw: string, decimalSeparator: CsvColumnMapping['decimalSeparator']): number | null {
  let value = raw.trim().replace(/\s|€/g, '')
  if (value === '') return null

  if (decimalSeparator === ',') {
    value = value.replace(/\./g, '').replace(',', '.')
  } else {
    value = value.replace(/,/g, '')
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.round(parsed * 100)
}

export interface CsvImportPreviewRow {
  valid: boolean
  reason?: string
  date: string
  description: string
  amountCents: number
  type: 'income' | 'expense'
  raw: Record<string, string>
}

export function buildImportPreview(
  rows: Record<string, string>[],
  mapping: CsvColumnMapping
): CsvImportPreviewRow[] {
  return rows.map((row) => {
    const rawDate = row[mapping.dateColumn] ?? ''
    const rawDescription = row[mapping.descriptionColumn] ?? ''
    const rawAmount = row[mapping.amountColumn] ?? ''

    const isoDate = convertDateToIso(rawDate, mapping.dateFormat)
    const amountCents = parseAmountToCents(rawAmount, mapping.decimalSeparator)

    if (!isoDate) {
      return { valid: false, reason: 'Ungültiges Datum', date: rawDate, description: rawDescription, amountCents: 0, type: 'expense', raw: row }
    }
    if (amountCents === null || amountCents === 0) {
      return { valid: false, reason: 'Ungültiger Betrag', date: isoDate, description: rawDescription, amountCents: 0, type: 'expense', raw: row }
    }

    return {
      valid: true,
      date: isoDate,
      description: rawDescription.trim(),
      amountCents: Math.abs(amountCents),
      type: amountCents < 0 ? 'expense' : 'income',
      raw: row
    }
  })
}

export function toBulkImportRows(previewRows: CsvImportPreviewRow[], categoryId: number | null): BulkImportRow[] {
  return previewRows
    .filter((r) => r.valid)
    .map((r) => ({
      date: r.date,
      amountCents: r.amountCents,
      type: r.type,
      categoryId,
      description: r.description
    }))
}
