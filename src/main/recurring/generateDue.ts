import type Database from 'better-sqlite3'
import { addMonths, format, parseISO } from 'date-fns'
import type { GenerateDueResult } from '@shared/inputs'
import { mapRecurring, type RecurringRow } from '../db/rows'
import { createTransaction } from '../db/repositories/transactions'

export type { GenerateDueResult }

function monthKey(date: Date): string {
  return format(date, 'yyyy-MM')
}

function firstOfMonth(monthKeyStr: string): Date {
  return parseISO(`${monthKeyStr}-01`)
}

/**
 * Legt für alle aktiven wiederkehrenden Buchungen fehlende monatliche Buchungen
 * bis einschließlich des Monats von `asOfDate` an. Idempotent über `last_generated_month`.
 */
export function generateDueRecurringTransactions(db: Database.Database, asOfDate: Date = new Date()): GenerateDueResult {
  const rules = (db.prepare('SELECT * FROM recurring_transactions WHERE active = 1').all() as RecurringRow[]).map(
    mapRecurring
  )

  const generatedTransactionIds: number[] = []
  const currentMonthKey = monthKey(asOfDate)

  const updateLastGenerated = db.prepare(
    `UPDATE recurring_transactions SET last_generated_month = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`
  )

  const run = db.transaction(() => {
    for (const rule of rules) {
      let cursor = rule.lastGeneratedMonth ? monthKey(addMonths(firstOfMonth(rule.lastGeneratedMonth), 1)) : monthKey(parseISO(rule.startDate))

      if (cursor < monthKey(parseISO(rule.startDate))) {
        cursor = monthKey(parseISO(rule.startDate))
      }

      const endMonthKey = rule.endDate ? monthKey(parseISO(rule.endDate)) : null

      while (cursor <= currentMonthKey) {
        if (endMonthKey && cursor > endMonthKey) break

        const date = `${cursor}-${rule.dayOfMonth.toString().padStart(2, '0')}`

        const tx = createTransaction(
          db,
          {
            date,
            amountCents: rule.amountCents,
            type: rule.type,
            categoryId: rule.categoryId,
            description: rule.name,
            note: 'Automatisch aus wiederkehrender Buchung erstellt'
          },
          rule.id
        )
        generatedTransactionIds.push(tx.id)
        updateLastGenerated.run(cursor, rule.id)

        cursor = monthKey(addMonths(firstOfMonth(cursor), 1))
      }
    }
  })
  run()

  return { generatedCount: generatedTransactionIds.length, generatedTransactionIds }
}
