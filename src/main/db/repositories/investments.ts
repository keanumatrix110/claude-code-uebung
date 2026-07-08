import type Database from 'better-sqlite3'
import type { Investment, InvestmentType, InvestmentValuation } from '@shared/types'
import type { InvestmentInput, InvestmentValuationInput } from '@shared/inputs'
import { ValidationError, assertNonEmpty, assertValidIsoDate } from '@shared/format'
import {
  mapInvestment,
  mapInvestmentValuation,
  type InvestmentRow,
  type InvestmentValuationRow
} from '../rows'

const VALID_TYPES: InvestmentType[] = ['stock', 'etf', 'fund', 'bond', 'crypto', 'other']

export type { InvestmentInput, InvestmentValuationInput }

function validateInvestmentInput(input: InvestmentInput): void {
  assertNonEmpty(input.name, 'Name')
  if (!VALID_TYPES.includes(input.type)) {
    throw new ValidationError('Ungültiger Anlagetyp.')
  }
  if (!Number.isFinite(input.quantity) || input.quantity < 0) {
    throw new ValidationError('Stückzahl darf nicht negativ sein.')
  }
}

export function listInvestments(db: Database.Database): Investment[] {
  const rows = db.prepare('SELECT * FROM investments ORDER BY name').all() as InvestmentRow[]
  return rows.map(mapInvestment)
}

export function createInvestment(db: Database.Database, input: InvestmentInput): Investment {
  validateInvestmentInput(input)
  const result = db
    .prepare('INSERT INTO investments (name, type, ticker, quantity, notes) VALUES (?, ?, ?, ?, ?)')
    .run(input.name.trim(), input.type, input.ticker, input.quantity, input.notes)
  const row = db.prepare('SELECT * FROM investments WHERE id = ?').get(result.lastInsertRowid) as InvestmentRow
  return mapInvestment(row)
}

export function updateInvestment(db: Database.Database, id: number, input: InvestmentInput): Investment {
  validateInvestmentInput(input)
  const existing = db.prepare('SELECT id FROM investments WHERE id = ?').get(id)
  if (!existing) throw new ValidationError('Position wurde nicht gefunden.')
  db.prepare(
    `UPDATE investments SET name = ?, type = ?, ticker = ?, quantity = ?, notes = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`
  ).run(input.name.trim(), input.type, input.ticker, input.quantity, input.notes, id)
  const row = db.prepare('SELECT * FROM investments WHERE id = ?').get(id) as InvestmentRow
  return mapInvestment(row)
}

export function deleteInvestment(db: Database.Database, id: number): void {
  const result = db.prepare('DELETE FROM investments WHERE id = ?').run(id)
  if (result.changes === 0) {
    throw new ValidationError('Position wurde nicht gefunden.')
  }
}

function validateValuationInput(input: InvestmentValuationInput): void {
  assertValidIsoDate(input.date, 'Datum')
  if (!Number.isFinite(input.valueCents) || input.valueCents < 0) {
    throw new ValidationError('Wert darf nicht negativ sein.')
  }
}

export function listValuations(db: Database.Database, investmentId: number): InvestmentValuation[] {
  const rows = db
    .prepare('SELECT * FROM investment_valuations WHERE investment_id = ? ORDER BY date')
    .all(investmentId) as InvestmentValuationRow[]
  return rows.map(mapInvestmentValuation)
}

export function createValuation(db: Database.Database, input: InvestmentValuationInput): InvestmentValuation {
  validateValuationInput(input)
  const investment = db.prepare('SELECT id FROM investments WHERE id = ?').get(input.investmentId)
  if (!investment) throw new ValidationError('Position wurde nicht gefunden.')
  try {
    const result = db
      .prepare('INSERT INTO investment_valuations (investment_id, date, value_cents) VALUES (?, ?, ?)')
      .run(input.investmentId, input.date, input.valueCents)
    const row = db.prepare('SELECT * FROM investment_valuations WHERE id = ?').get(result.lastInsertRowid) as InvestmentValuationRow
    return mapInvestmentValuation(row)
  } catch (err) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      throw new ValidationError('Für dieses Datum existiert bereits ein Wertstand. Bitte bearbeiten oder löschen.')
    }
    throw err
  }
}

export function deleteValuation(db: Database.Database, id: number): void {
  const result = db.prepare('DELETE FROM investment_valuations WHERE id = ?').run(id)
  if (result.changes === 0) {
    throw new ValidationError('Wertstand wurde nicht gefunden.')
  }
}
