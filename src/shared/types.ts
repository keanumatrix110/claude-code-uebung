export type TransactionType = 'income' | 'expense'

export interface Category {
  id: number
  name: string
  type: TransactionType
  isFixedCost: boolean
  color: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: number
  date: string // ISO yyyy-MM-dd
  amountCents: number // always positive; sign derived from `type`
  type: TransactionType
  categoryId: number | null
  description: string
  note: string | null
  recurringId: number | null
  createdAt: string
  updatedAt: string
}

export interface TransactionAuditEntry {
  id: number
  transactionId: number
  changedAt: string
  field: string
  oldValue: string | null
  newValue: string | null
}

export interface RecurringTransaction {
  id: number
  name: string
  amountCents: number
  type: TransactionType
  categoryId: number | null
  dayOfMonth: number // 1-28 (safe for all months)
  startDate: string
  endDate: string | null
  active: boolean
  lastGeneratedMonth: string | null // yyyy-MM
  createdAt: string
  updatedAt: string
}

export interface SavingsGoal {
  id: number
  name: string
  targetAmountCents: number
  targetDate: string | null
  createdAt: string
  updatedAt: string
}

export interface SavingsContribution {
  id: number
  goalId: number
  date: string
  amountCents: number // may be negative for withdrawals
  note: string | null
  createdAt: string
  updatedAt: string
}

export type InvestmentType = 'stock' | 'etf' | 'fund' | 'bond' | 'crypto' | 'other'

export interface Investment {
  id: number
  name: string
  type: InvestmentType
  ticker: string | null
  quantity: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface InvestmentValuation {
  id: number
  investmentId: number
  date: string
  valueCents: number
  createdAt: string
  updatedAt: string
}

export interface MonthBalance {
  year: number
  month: number // 1-12
  incomeCents: number
  expenseCents: number
  balanceCents: number
}

export interface CategoryBreakdownEntry {
  categoryId: number | null
  categoryName: string
  type: TransactionType
  amountCents: number
  color: string
}

export interface BackupInfo {
  path: string
  createdAt: string
  sizeBytes: number
}

export interface CsvImportRow {
  date: string
  description: string
  amountCents: number
  type: TransactionType
  raw: Record<string, string>
}

export interface CsvColumnMapping {
  dateColumn: string
  descriptionColumn: string
  amountColumn: string
  dateFormat: 'dd.MM.yyyy' | 'yyyy-MM-dd' | 'MM/dd/yyyy'
  decimalSeparator: ',' | '.'
  delimiter: ',' | ';' | '\t'
}
