import type Database from 'better-sqlite3'
import type { SavingsContribution, SavingsGoal } from '@shared/types'
import type { SavingsGoalInput, SavingsContributionInput } from '@shared/inputs'
import { ValidationError, assertNonEmpty, assertValidIsoDate } from '@shared/format'
import { mapSavingsContribution, mapSavingsGoal, type SavingsContributionRow, type SavingsGoalRow } from '../rows'

export type { SavingsGoalInput, SavingsContributionInput }

function validateGoalInput(input: SavingsGoalInput): void {
  assertNonEmpty(input.name, 'Zielname')
  if (!Number.isFinite(input.targetAmountCents) || input.targetAmountCents <= 0) {
    throw new ValidationError('Zielbetrag muss größer als 0 sein.')
  }
  if (input.targetDate) {
    assertValidIsoDate(input.targetDate, 'Zieldatum')
  }
}

export function listSavingsGoals(db: Database.Database): SavingsGoal[] {
  const rows = db.prepare('SELECT * FROM savings_goals ORDER BY target_date IS NULL, target_date, name').all() as SavingsGoalRow[]
  return rows.map(mapSavingsGoal)
}

export function createSavingsGoal(db: Database.Database, input: SavingsGoalInput): SavingsGoal {
  validateGoalInput(input)
  const result = db
    .prepare('INSERT INTO savings_goals (name, target_amount_cents, target_date) VALUES (?, ?, ?)')
    .run(input.name.trim(), input.targetAmountCents, input.targetDate)
  const row = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(result.lastInsertRowid) as SavingsGoalRow
  return mapSavingsGoal(row)
}

export function updateSavingsGoal(db: Database.Database, id: number, input: SavingsGoalInput): SavingsGoal {
  validateGoalInput(input)
  const existing = db.prepare('SELECT id FROM savings_goals WHERE id = ?').get(id)
  if (!existing) throw new ValidationError('Sparziel wurde nicht gefunden.')
  db.prepare(
    `UPDATE savings_goals SET name = ?, target_amount_cents = ?, target_date = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`
  ).run(input.name.trim(), input.targetAmountCents, input.targetDate, id)
  const row = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(id) as SavingsGoalRow
  return mapSavingsGoal(row)
}

export function deleteSavingsGoal(db: Database.Database, id: number): void {
  const result = db.prepare('DELETE FROM savings_goals WHERE id = ?').run(id)
  if (result.changes === 0) {
    throw new ValidationError('Sparziel wurde nicht gefunden.')
  }
}

function validateContributionInput(input: SavingsContributionInput): void {
  assertValidIsoDate(input.date, 'Datum')
  if (!Number.isFinite(input.amountCents) || input.amountCents === 0) {
    throw new ValidationError('Betrag darf nicht 0 sein.')
  }
}

export function listContributions(db: Database.Database, goalId: number): SavingsContribution[] {
  const rows = db
    .prepare('SELECT * FROM savings_contributions WHERE goal_id = ? ORDER BY date DESC, id DESC')
    .all(goalId) as SavingsContributionRow[]
  return rows.map(mapSavingsContribution)
}

export function createContribution(db: Database.Database, input: SavingsContributionInput): SavingsContribution {
  validateContributionInput(input)
  const goal = db.prepare('SELECT id FROM savings_goals WHERE id = ?').get(input.goalId)
  if (!goal) throw new ValidationError('Sparziel wurde nicht gefunden.')
  const result = db
    .prepare('INSERT INTO savings_contributions (goal_id, date, amount_cents, note) VALUES (?, ?, ?, ?)')
    .run(input.goalId, input.date, input.amountCents, input.note)
  const row = db.prepare('SELECT * FROM savings_contributions WHERE id = ?').get(result.lastInsertRowid) as SavingsContributionRow
  return mapSavingsContribution(row)
}

export function deleteContribution(db: Database.Database, id: number): void {
  const result = db.prepare('DELETE FROM savings_contributions WHERE id = ?').run(id)
  if (result.changes === 0) {
    throw new ValidationError('Beitrag wurde nicht gefunden.')
  }
}
