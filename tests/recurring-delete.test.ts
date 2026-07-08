import Database from 'better-sqlite3'
import { describe, expect, it } from 'vitest'
import { SCHEMA_SQL } from '../src/main/db/schema'
import { createRecurring, deleteRecurring, listRecurring } from '../src/main/db/repositories/recurring'
import { generateDueRecurringTransactions } from '../src/main/recurring/generateDue'
import { listTransactions } from '../src/main/db/repositories/transactions'

describe('Löschen wiederkehrender Buchungen', () => {
  it('löscht Regel auch nachdem Buchungen generiert wurden', () => {
    const db = new Database(':memory:')
    db.pragma('foreign_keys = ON')
    db.exec(SCHEMA_SQL)

    const rule = createRecurring(db, {
      name: 'Gehalt',
      amountCents: 250000,
      type: 'income',
      categoryId: null,
      dayOfMonth: 1,
      startDate: '2026-01-01',
      endDate: null,
      active: true
    })

    generateDueRecurringTransactions(db, new Date('2026-07-08T00:00:00Z'))
    expect(listTransactions(db)).toHaveLength(7)

    deleteRecurring(db, rule.id)
    expect(listRecurring(db)).toHaveLength(0)
    // Buchungen bleiben erhalten, Verknüpfung wird gelöst
    const txs = listTransactions(db)
    expect(txs).toHaveLength(7)
    expect(txs.every((t) => t.recurringId === null)).toBe(true)
  })
})
