import type { InvestmentType, TransactionType } from './types'

export interface CategoryInput {
  name: string
  type: TransactionType
  isFixedCost: boolean
  color: string
}

export interface TransactionInput {
  date: string
  amountCents: number
  type: TransactionType
  categoryId: number | null
  description: string
  note: string | null
}

export interface TransactionFilter {
  year?: number
  month?: number
  categoryId?: number
  type?: TransactionType
}

export interface BulkImportRow {
  date: string
  amountCents: number
  type: TransactionType
  categoryId: number | null
  description: string
}

export interface BulkImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export interface RecurringInput {
  name: string
  amountCents: number
  type: TransactionType
  categoryId: number | null
  dayOfMonth: number
  startDate: string
  endDate: string | null
  active: boolean
}

export interface GenerateDueResult {
  generatedCount: number
  generatedTransactionIds: number[]
}

export interface SavingsGoalInput {
  name: string
  targetAmountCents: number
  targetDate: string | null
}

export interface SavingsContributionInput {
  goalId: number
  date: string
  amountCents: number
  note: string | null
}

export interface InvestmentInput {
  name: string
  type: InvestmentType
  ticker: string | null
  quantity: number
  notes: string | null
}

export interface InvestmentValuationInput {
  investmentId: number
  date: string
  valueCents: number
}
