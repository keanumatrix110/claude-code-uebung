import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { SCHEMA_SQL } from './schema'

let dbInstance: Database.Database | null = null

const DEFAULT_CATEGORIES: Array<{ name: string; type: 'income' | 'expense'; isFixedCost: boolean; color: string }> = [
  { name: 'Gehalt', type: 'income', isFixedCost: false, color: '#2f9e44' },
  { name: 'Sonstige Einnahmen', type: 'income', isFixedCost: false, color: '#66a80f' },
  { name: 'Miete', type: 'expense', isFixedCost: true, color: '#e8590c' },
  { name: 'Nebenkosten', type: 'expense', isFixedCost: true, color: '#e67700' },
  { name: 'Versicherungen', type: 'expense', isFixedCost: true, color: '#f08c00' },
  { name: 'Abonnements', type: 'expense', isFixedCost: true, color: '#ae3ec9' },
  { name: 'Lebensmittel', type: 'expense', isFixedCost: false, color: '#1971c2' },
  { name: 'Freizeit', type: 'expense', isFixedCost: false, color: '#3b5bdb' },
  { name: 'Mobilität', type: 'expense', isFixedCost: false, color: '#0c8599' },
  { name: 'Gesundheit', type: 'expense', isFixedCost: false, color: '#c2255c' },
  { name: 'Sonstige Ausgaben', type: 'expense', isFixedCost: false, color: '#495057' }
]

export function openDatabase(filePath: string): Database.Database {
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const db = new Database(filePath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(SCHEMA_SQL)

  seedDefaultCategories(db)

  dbInstance = db
  return db
}

function seedDefaultCategories(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }
  if (count.count > 0) return

  const insert = db.prepare(
    `INSERT INTO categories (name, type, is_fixed_cost, color) VALUES (@name, @type, @isFixedCost, @color)`
  )
  const insertMany = db.transaction((rows: typeof DEFAULT_CATEGORIES) => {
    for (const row of rows) {
      insert.run({ ...row, isFixedCost: row.isFixedCost ? 1 : 0 })
    }
  })
  insertMany(DEFAULT_CATEGORIES)
}

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    throw new Error('Datenbank wurde noch nicht initialisiert.')
  }
  return dbInstance
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

export function setDatabaseInstance(db: Database.Database): void {
  dbInstance = db
}
