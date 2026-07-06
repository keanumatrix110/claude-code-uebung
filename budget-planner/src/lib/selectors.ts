import type { Transaction } from '../types'
import { monthKey, shiftMonth } from './format'

export function transactionsForMonth(transactions: Transaction[], key: string): Transaction[] {
  return transactions.filter((t) => t.date.slice(0, 7) === key)
}

export function totalByType(transactions: Transaction[], type: Transaction['type']): number {
  return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0)
}

export function spentByCategory(transactions: Transaction[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const t of transactions) {
    map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount
  }
  return map
}

export interface TrendPoint {
  month: string
  income: number
  expense: number
}

export function trendData(transactions: Transaction[], monthsBack: number, referenceKey: string): TrendPoint[] {
  const keys: string[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    keys.push(shiftMonth(referenceKey, -i))
  }
  return keys.map((key) => {
    const monthTx = transactionsForMonth(transactions, key)
    return {
      month: key,
      income: totalByType(monthTx, 'income'),
      expense: totalByType(monthTx, 'expense'),
    }
  })
}

export function currentMonthKey(): string {
  return monthKey(new Date())
}
