import type Database from 'better-sqlite3'
import { copyFileSync, statSync, writeFileSync } from 'node:fs'
import Papa from 'papaparse'
import { mapTransaction, type TransactionRow } from '../rows'

/** Erstellt einen WAL-Checkpoint (schreibt alle Änderungen in die Hauptdatei) und kopiert sie. */
export function checkpointAndCopy(db: Database.Database, dbFilePath: string, destPath: string): { sizeBytes: number } {
  db.pragma('wal_checkpoint(TRUNCATE)')
  copyFileSync(dbFilePath, destPath)
  const stats = statSync(destPath)
  return { sizeBytes: stats.size }
}

export function copyFileToDb(sourcePath: string, dbFilePath: string): void {
  copyFileSync(sourcePath, dbFilePath)
}

export function exportTransactionsCsv(db: Database.Database, destPath: string): { rowCount: number } {
  const rows = db
    .prepare(
      `SELECT t.*, c.name as category_name
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       ORDER BY t.date DESC, t.id DESC`
    )
    .all() as (TransactionRow & { category_name: string | null })[]

  const csvRows = rows.map((row) => {
    const t = mapTransaction(row)
    return {
      Datum: t.date,
      Typ: t.type === 'income' ? 'Einnahme' : 'Ausgabe',
      Betrag_Cent: t.amountCents,
      Betrag_EUR: (t.amountCents / 100).toFixed(2).replace('.', ','),
      Kategorie: row.category_name ?? '',
      Beschreibung: t.description,
      Notiz: t.note ?? '',
      Erstellt: t.createdAt,
      Geaendert: t.updatedAt
    }
  })

  const csv = Papa.unparse(csvRows, { delimiter: ';' })
  writeFileSync(destPath, `﻿${csv}`, 'utf-8')

  return { rowCount: csvRows.length }
}
