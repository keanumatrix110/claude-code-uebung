import type Database from 'better-sqlite3'
import type { RecurringTransaction } from '@shared/types'
import type { RecurringInput } from '@shared/inputs'
import { ValidationError, assertNonEmpty, assertPositiveAmount, assertValidIsoDate } from '@shared/format'
import { mapRecurring, type RecurringRow } from '../rows'

export type { RecurringInput }

function validateInput(input: RecurringInput): void {
  assertNonEmpty(input.name, 'Bezeichnung')
  assertPositiveAmount(input.amountCents, 'Betrag')
  assertValidIsoDate(input.startDate, 'Startdatum')
  if (input.endDate) {
    assertValidIsoDate(input.endDate, 'Enddatum')
    if (input.endDate < input.startDate) {
      throw new ValidationError('Enddatum darf nicht vor dem Startdatum liegen.')
    }
  }
  if (!Number.isInteger(input.dayOfMonth) || input.dayOfMonth < 1 || input.dayOfMonth > 28) {
    throw new ValidationError('Der Buchungstag muss zwischen 1 und 28 liegen.')
  }
}

export function listRecurring(db: Database.Database): RecurringTransaction[] {
  const rows = db.prepare('SELECT * FROM recurring_transactions ORDER BY active DESC, name').all() as RecurringRow[]
  return rows.map(mapRecurring)
}

export function getRecurring(db: Database.Database, id: number): RecurringTransaction {
  const row = db.prepare('SELECT * FROM recurring_transactions WHERE id = ?').get(id) as RecurringRow | undefined
  if (!row) throw new ValidationError('Wiederkehrende Buchung wurde nicht gefunden.')
  return mapRecurring(row)
}

export function createRecurring(db: Database.Database, input: RecurringInput): RecurringTransaction {
  validateInput(input)
  const result = db
    .prepare(
      `INSERT INTO recurring_transactions (name, amount_cents, type, category_id, day_of_month, start_date, end_date, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.name.trim(),
      input.amountCents,
      input.type,
      input.categoryId,
      input.dayOfMonth,
      input.startDate,
      input.endDate,
      input.active ? 1 : 0
    )
  return getRecurring(db, result.lastInsertRowid as number)
}

export function updateRecurring(db: Database.Database, id: number, input: RecurringInput): RecurringTransaction {
  validateInput(input)
  const existing = db.prepare('SELECT id FROM recurring_transactions WHERE id = ?').get(id)
  if (!existing) throw new ValidationError('Wiederkehrende Buchung wurde nicht gefunden.')

  db.prepare(
    `UPDATE recurring_transactions
     SET name = ?, amount_cents = ?, type = ?, category_id = ?, day_of_month = ?, start_date = ?, end_date = ?, active = ?,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE id = ?`
  ).run(
    input.name.trim(),
    input.amountCents,
    input.type,
    input.categoryId,
    input.dayOfMonth,
    input.startDate,
    input.endDate,
    input.active ? 1 : 0,
    id
  )
  return getRecurring(db, id)
}

export function deleteRecurring(db: Database.Database, id: number): void {
  const result = db.prepare('DELETE FROM recurring_transactions WHERE id = ?').run(id)
  if (result.changes === 0) {
    throw new ValidationError('Wiederkehrende Buchung wurde nicht gefunden.')
  }
}
