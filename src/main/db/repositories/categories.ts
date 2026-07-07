import type Database from 'better-sqlite3'
import type { Category } from '@shared/types'
import type { CategoryInput } from '@shared/inputs'
import { ValidationError, assertNonEmpty } from '@shared/format'
import { mapCategory, type CategoryRow } from '../rows'

export type { CategoryInput }

function validateInput(input: CategoryInput): void {
  assertNonEmpty(input.name, 'Kategoriename')
  if (input.type !== 'income' && input.type !== 'expense') {
    throw new ValidationError('Ungültiger Kategorietyp.')
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(input.color)) {
    throw new ValidationError('Ungültige Farbe.')
  }
}

export function listCategories(db: Database.Database): Category[] {
  const rows = db.prepare('SELECT * FROM categories ORDER BY type, name').all() as CategoryRow[]
  return rows.map(mapCategory)
}

export function createCategory(db: Database.Database, input: CategoryInput): Category {
  validateInput(input)
  try {
    const result = db
      .prepare('INSERT INTO categories (name, type, is_fixed_cost, color) VALUES (?, ?, ?, ?)')
      .run(input.name.trim(), input.type, input.isFixedCost ? 1 : 0, input.color)
    const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) as CategoryRow
    return mapCategory(row)
  } catch (err) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      throw new ValidationError('Eine Kategorie mit diesem Namen und Typ existiert bereits.')
    }
    throw err
  }
}

export function updateCategory(db: Database.Database, id: number, input: CategoryInput): Category {
  validateInput(input)
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id)
  if (!existing) {
    throw new ValidationError('Kategorie wurde nicht gefunden.')
  }
  try {
    db.prepare(
      `UPDATE categories SET name = ?, type = ?, is_fixed_cost = ?, color = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`
    ).run(input.name.trim(), input.type, input.isFixedCost ? 1 : 0, input.color, id)
  } catch (err) {
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      throw new ValidationError('Eine Kategorie mit diesem Namen und Typ existiert bereits.')
    }
    throw err
  }
  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as CategoryRow
  return mapCategory(row)
}

export function deleteCategory(db: Database.Database, id: number): void {
  const usage = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE category_id = ?').get(id) as {
    count: number
  }
  if (usage.count > 0) {
    throw new ValidationError(
      `Kategorie kann nicht gelöscht werden: ${usage.count} Buchung(en) verwenden sie noch.`
    )
  }
  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id)
  if (result.changes === 0) {
    throw new ValidationError('Kategorie wurde nicht gefunden.')
  }
}
