import type {
  Category,
  Investment,
  InvestmentValuation,
  RecurringTransaction,
  SavingsContribution,
  SavingsGoal,
  Transaction,
  TransactionAuditEntry
} from '@shared/types'

// Rohzeilen aus better-sqlite3 verwenden snake_case Spaltennamen; diese Mapper
// übersetzen sie in die camelCase-Domänentypen, die App-weit verwendet werden.

export interface CategoryRow {
  id: number
  name: string
  type: string
  is_fixed_cost: number
  color: string
  created_at: string
  updated_at: string
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Category['type'],
    isFixedCost: row.is_fixed_cost === 1,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export interface TransactionRow {
  id: number
  date: string
  amount_cents: number
  type: string
  category_id: number | null
  description: string
  note: string | null
  recurring_id: number | null
  created_at: string
  updated_at: string
}

export function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    date: row.date,
    amountCents: row.amount_cents,
    type: row.type as Transaction['type'],
    categoryId: row.category_id,
    description: row.description,
    note: row.note,
    recurringId: row.recurring_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export interface AuditRow {
  id: number
  transaction_id: number
  changed_at: string
  field: string
  old_value: string | null
  new_value: string | null
}

export function mapAudit(row: AuditRow): TransactionAuditEntry {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    changedAt: row.changed_at,
    field: row.field,
    oldValue: row.old_value,
    newValue: row.new_value
  }
}

export interface RecurringRow {
  id: number
  name: string
  amount_cents: number
  type: string
  category_id: number | null
  day_of_month: number
  start_date: string
  end_date: string | null
  active: number
  last_generated_month: string | null
  created_at: string
  updated_at: string
}

export function mapRecurring(row: RecurringRow): RecurringTransaction {
  return {
    id: row.id,
    name: row.name,
    amountCents: row.amount_cents,
    type: row.type as RecurringTransaction['type'],
    categoryId: row.category_id,
    dayOfMonth: row.day_of_month,
    startDate: row.start_date,
    endDate: row.end_date,
    active: row.active === 1,
    lastGeneratedMonth: row.last_generated_month,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export interface SavingsGoalRow {
  id: number
  name: string
  target_amount_cents: number
  target_date: string | null
  created_at: string
  updated_at: string
}

export function mapSavingsGoal(row: SavingsGoalRow): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmountCents: row.target_amount_cents,
    targetDate: row.target_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export interface SavingsContributionRow {
  id: number
  goal_id: number
  date: string
  amount_cents: number
  note: string | null
  created_at: string
  updated_at: string
}

export function mapSavingsContribution(row: SavingsContributionRow): SavingsContribution {
  return {
    id: row.id,
    goalId: row.goal_id,
    date: row.date,
    amountCents: row.amount_cents,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export interface InvestmentRow {
  id: number
  name: string
  type: string
  ticker: string | null
  quantity: number
  notes: string | null
  created_at: string
  updated_at: string
}

export function mapInvestment(row: InvestmentRow): Investment {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Investment['type'],
    ticker: row.ticker,
    quantity: row.quantity,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export interface InvestmentValuationRow {
  id: number
  investment_id: number
  date: string
  value_cents: number
  created_at: string
  updated_at: string
}

export function mapInvestmentValuation(row: InvestmentValuationRow): InvestmentValuation {
  return {
    id: row.id,
    investmentId: row.investment_id,
    date: row.date,
    valueCents: row.value_cents,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}
