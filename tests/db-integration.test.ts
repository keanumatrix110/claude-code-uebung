import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { SCHEMA_SQL } from '../src/main/db/schema'
import {
  createCategory,
  deleteCategory,
  listCategories
} from '../src/main/db/repositories/categories'
import {
  createTransaction,
  listTransactionAudit,
  listTransactions,
  updateTransaction
} from '../src/main/db/repositories/transactions'
import { createRecurring } from '../src/main/db/repositories/recurring'
import { generateDueRecurringTransactions } from '../src/main/recurring/generateDue'
import { ValidationError } from '../src/shared/format'

function createTestDb(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA_SQL)
  return db
}

describe('Kategorien-Repository', () => {
  let db: Database.Database
  beforeEach(() => {
    db = createTestDb()
  })

  it('legt eine Kategorie an und listet sie', () => {
    createCategory(db, { name: 'Testkategorie', type: 'expense', isFixedCost: false, color: '#123456' })
    const categories = listCategories(db)
    expect(categories.some((c) => c.name === 'Testkategorie')).toBe(true)
  })

  it('verhindert doppelte Kategorien (Name + Typ)', () => {
    createCategory(db, { name: 'Dup', type: 'expense', isFixedCost: false, color: '#123456' })
    expect(() => createCategory(db, { name: 'Dup', type: 'expense', isFixedCost: false, color: '#123456' })).toThrow(
      ValidationError
    )
  })

  it('verhindert das Löschen einer verwendeten Kategorie', () => {
    const cat = createCategory(db, { name: 'Miete', type: 'expense', isFixedCost: true, color: '#123456' })
    createTransaction(db, {
      date: '2026-01-01',
      amountCents: 90000,
      type: 'expense',
      categoryId: cat.id,
      description: 'Miete Januar',
      note: null
    })
    expect(() => deleteCategory(db, cat.id)).toThrow(ValidationError)
  })
})

describe('Buchungen: Audit-Log', () => {
  let db: Database.Database
  beforeEach(() => {
    db = createTestDb()
  })

  it('protokolliert Änderungen am Betrag und Datum', () => {
    const tx = createTransaction(db, {
      date: '2026-01-01',
      amountCents: 1000,
      type: 'expense',
      categoryId: null,
      description: 'Test',
      note: null
    })

    updateTransaction(db, tx.id, {
      date: '2026-01-02',
      amountCents: 2000,
      type: 'expense',
      categoryId: null,
      description: 'Test',
      note: null
    })

    const audit = listTransactionAudit(db, tx.id)
    const fields = audit.map((a) => a.field).sort()
    expect(fields).toContain('amount_cents')
    expect(fields).toContain('date')

    const amountEntry = audit.find((a) => a.field === 'amount_cents')
    expect(amountEntry?.oldValue).toBe('1000')
    expect(amountEntry?.newValue).toBe('2000')
  })

  it('aktualisiert updated_at bei Änderungen', async () => {
    const tx = createTransaction(db, {
      date: '2026-01-01',
      amountCents: 1000,
      type: 'expense',
      categoryId: null,
      description: 'Test',
      note: null
    })
    await new Promise((resolve) => setTimeout(resolve, 5))
    const updated = updateTransaction(db, tx.id, {
      date: '2026-01-01',
      amountCents: 5000,
      type: 'expense',
      categoryId: null,
      description: 'Test',
      note: null
    })
    expect(updated.updatedAt).not.toBe(updated.createdAt)
  })

  it('wirft bei ungültigem Betrag (<=0)', () => {
    expect(() =>
      createTransaction(db, {
        date: '2026-01-01',
        amountCents: 0,
        type: 'expense',
        categoryId: null,
        description: 'Ungültig',
        note: null
      })
    ).toThrow(ValidationError)
  })
})

describe('Wiederkehrende Buchungen: automatische Generierung', () => {
  let db: Database.Database
  beforeEach(() => {
    db = createTestDb()
  })

  it('generiert Buchungen für jeden Monat bis zum aktuellen Datum', () => {
    createRecurring(db, {
      name: 'Miete',
      amountCents: 90000,
      type: 'expense',
      categoryId: null,
      dayOfMonth: 1,
      startDate: '2026-01-01',
      endDate: null,
      active: true
    })

    const result = generateDueRecurringTransactions(db, new Date('2026-04-15T00:00:00Z'))
    expect(result.generatedCount).toBe(4) // Jan, Feb, Mär, Apr

    const transactions = listTransactions(db)
    expect(transactions).toHaveLength(4)
    expect(transactions.every((t) => t.recurringId !== null)).toBe(true)
  })

  it('ist idempotent: ein zweiter Lauf im selben Monat erzeugt nichts Neues', () => {
    createRecurring(db, {
      name: 'Gehalt',
      amountCents: 300000,
      type: 'income',
      categoryId: null,
      dayOfMonth: 27,
      startDate: '2026-01-01',
      endDate: null,
      active: true
    })

    generateDueRecurringTransactions(db, new Date('2026-02-01T00:00:00Z'))
    const second = generateDueRecurringTransactions(db, new Date('2026-02-15T00:00:00Z'))
    expect(second.generatedCount).toBe(0)

    const transactions = listTransactions(db)
    expect(transactions).toHaveLength(2)
  })

  it('berücksichtigt das Enddatum', () => {
    createRecurring(db, {
      name: 'Abo',
      amountCents: 999,
      type: 'expense',
      categoryId: null,
      dayOfMonth: 5,
      startDate: '2026-01-01',
      endDate: '2026-02-28',
      active: true
    })

    generateDueRecurringTransactions(db, new Date('2026-06-01T00:00:00Z'))
    const transactions = listTransactions(db)
    expect(transactions).toHaveLength(2)
  })
})
