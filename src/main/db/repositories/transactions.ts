import type Database from 'better-sqlite3'
import type { Transaction } from '@shared/types'
import type { TransactionInput, TransactionFilter, BulkImportRow, BulkImportResult } from '@shared/inputs'
import { ValidationError, assertPositiveAmount, assertValidIsoDate } from '@shared/format'
import { mapAudit, mapTransaction, type AuditRow, type TransactionRow } from '../rows'

export type { TransactionInput, TransactionFilter, BulkImportRow, BulkImportResult }

function validateInput(input: TransactionInput): void {
  assertValidIsoDate(input.date, 'Buchungsdatum')
  assertPositiveAmount(input.amountCents, 'Betrag')
  if (input.type !== 'income' && input.type !== 'expense') {
    throw new ValidationError('Ungültiger Buchungstyp.')
  }
}

export function listTransactions(db: Database.Database, filter: TransactionFilter = {}): Transaction[] {
  const clauses: string[] = []
  const params: (string | number)[] = []

  if (filter.year !== undefined && filter.month !== undefined) {
    const prefix = `${filter.year.toString().padStart(4, '0')}-${filter.month.toString().padStart(2, '0')}`
    clauses.push('date LIKE ?')
    params.push(`${prefix}%`)
  } else if (filter.year !== undefined) {
    clauses.push('date LIKE ?')
    params.push(`${filter.year.toString().padStart(4, '0')}%`)
  }
  if (filter.categoryId !== undefined) {
    clauses.push('category_id = ?')
    params.push(filter.categoryId)
  }
  if (filter.type !== undefined) {
    clauses.push('type = ?')
    params.push(filter.type)
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''
  const rows = db.prepare(`SELECT * FROM transactions ${where} ORDER BY date DESC, id DESC`).all(...params) as TransactionRow[]
  return rows.map(mapTransaction)
}

export function getTransaction(db: Database.Database, id: number): Transaction {
  const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as TransactionRow | undefined
  if (!row) throw new ValidationError('Buchung wurde nicht gefunden.')
  return mapTransaction(row)
}

export function createTransaction(
  db: Database.Database,
  input: TransactionInput,
  recurringId: number | null = null
): Transaction {
  validateInput(input)
  const result = db
    .prepare(
      `INSERT INTO transactions (date, amount_cents, type, category_id, description, note, recurring_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(input.date, input.amountCents, input.type, input.categoryId, input.description.trim(), input.note, recurringId)
  return getTransaction(db, result.lastInsertRowid as number)
}

export function updateTransaction(db: Database.Database, id: number, input: TransactionInput): Transaction {
  validateInput(input)
  const existing = db.prepare('SELECT id FROM transactions WHERE id = ?').get(id)
  if (!existing) throw new ValidationError('Buchung wurde nicht gefunden.')

  db.prepare(
    `UPDATE transactions
     SET date = ?, amount_cents = ?, type = ?, category_id = ?, description = ?, note = ?,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE id = ?`
  ).run(input.date, input.amountCents, input.type, input.categoryId, input.description.trim(), input.note, id)

  return getTransaction(db, id)
}

export function deleteTransaction(db: Database.Database, id: number): void {
  const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(id)
  if (result.changes === 0) {
    throw new ValidationError('Buchung wurde nicht gefunden.')
  }
}

export function listTransactionAudit(db: Database.Database, transactionId: number) {
  const rows = db
    .prepare('SELECT * FROM transaction_audit_log WHERE transaction_id = ? ORDER BY changed_at DESC, id DESC')
    .all(transactionId) as AuditRow[]
  return rows.map(mapAudit)
}

/** Importiert mehrere Buchungen (z. B. aus CSV) in einer Transaktion. Ungültige Zeilen werden übersprungen. */
export function bulkImportTransactions(db: Database.Database, rows: BulkImportRow[]): BulkImportResult {
  const result: BulkImportResult = { imported: 0, skipped: 0, errors: [] }

  const insert = db.prepare(
    `INSERT INTO transactions (date, amount_cents, type, category_id, description) VALUES (?, ?, ?, ?, ?)`
  )

  const run = db.transaction((items: BulkImportRow[]) => {
    items.forEach((row, index) => {
      try {
        validateInput({ ...row, note: null })
        insert.run(row.date, row.amountCents, row.type, row.categoryId, row.description.trim())
        result.imported++
      } catch (err) {
        result.skipped++
        const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
        result.errors.push(`Zeile ${index + 1}: ${message}`)
      }
    })
  })
  run(rows)

  return result
}
