import { addMonths, differenceInCalendarMonths, format, parseISO } from 'date-fns'
import type {
  CategoryBreakdownEntry,
  Category,
  Investment,
  InvestmentValuation,
  MonthBalance,
  SavingsContribution,
  SavingsGoal,
  Transaction
} from './types'

/** Summiert Beträge (in Cent) für einen bestimmten Buchungstyp. */
export function sumByType(transactions: Pick<Transaction, 'amountCents' | 'type'>[], type: 'income' | 'expense'): number {
  return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amountCents, 0)
}

/** Berechnet Einnahmen, Ausgaben und Saldo für eine Menge von Buchungen (z. B. eines Monats). */
export function computeBalance(
  transactions: Pick<Transaction, 'amountCents' | 'type'>[]
): { incomeCents: number; expenseCents: number; balanceCents: number } {
  const incomeCents = sumByType(transactions, 'income')
  const expenseCents = sumByType(transactions, 'expense')
  return { incomeCents, expenseCents, balanceCents: incomeCents - expenseCents }
}

/** Filtert Buchungen auf einen bestimmten Kalendermonat (year: vierstellig, month: 1-12). */
export function filterTransactionsForMonth<T extends Pick<Transaction, 'date'>>(
  transactions: T[],
  year: number,
  month: number
): T[] {
  const prefix = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}`
  return transactions.filter((t) => t.date.startsWith(prefix))
}

/**
 * Sparquote = (Einnahmen - Ausgaben) / Einnahmen, in Prozent.
 * Bei Einnahmen von 0 wird 0 zurückgegeben, um Division durch 0 zu vermeiden.
 */
export function computeSavingsRate(incomeCents: number, expenseCents: number): number {
  if (incomeCents <= 0) return 0
  return ((incomeCents - expenseCents) / incomeCents) * 100
}

/**
 * Fixkostenquote = Fixkosten / Einnahmen, in Prozent.
 * Bei Einnahmen von 0 wird 0 zurückgegeben.
 */
export function computeFixedCostRatio(fixedExpenseCents: number, incomeCents: number): number {
  if (incomeCents <= 0) return 0
  return (fixedExpenseCents / incomeCents) * 100
}

/** Summe der Ausgaben aus Kategorien, die als Fixkosten markiert sind. */
export function sumFixedCostExpenses(
  transactions: Pick<Transaction, 'amountCents' | 'type' | 'categoryId'>[],
  categories: Pick<Category, 'id' | 'isFixedCost'>[]
): number {
  const fixedCategoryIds = new Set(categories.filter((c) => c.isFixedCost).map((c) => c.id))
  return transactions
    .filter((t) => t.type === 'expense' && t.categoryId !== null && fixedCategoryIds.has(t.categoryId))
    .reduce((sum, t) => sum + t.amountCents, 0)
}

/** Gruppiert Buchungen nach Kategorie und summiert die Beträge je Kategorie. */
export function computeCategoryBreakdown(
  transactions: Pick<Transaction, 'amountCents' | 'type' | 'categoryId'>[],
  categories: Category[]
): CategoryBreakdownEntry[] {
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const totals = new Map<string, CategoryBreakdownEntry>()

  for (const t of transactions) {
    const category = t.categoryId !== null ? categoryById.get(t.categoryId) : undefined
    const key = `${t.type}:${t.categoryId ?? 'none'}`
    const existing = totals.get(key)
    if (existing) {
      existing.amountCents += t.amountCents
    } else {
      totals.set(key, {
        categoryId: t.categoryId,
        categoryName: category?.name ?? 'Ohne Kategorie',
        type: t.type,
        amountCents: t.amountCents,
        color: category?.color ?? '#868e96'
      })
    }
  }

  return Array.from(totals.values()).sort((a, b) => b.amountCents - a.amountCents)
}

/** Berechnet Monatsbilanzen (Jan-Dez) für ein Kalenderjahr, zum Jahresvergleich. */
export function computeYearComparison(
  transactions: Pick<Transaction, 'date' | 'amountCents' | 'type'>[],
  year: number
): MonthBalance[] {
  const result: MonthBalance[] = []
  for (let month = 1; month <= 12; month++) {
    const monthTransactions = filterTransactionsForMonth(transactions, year, month)
    const { incomeCents, expenseCents, balanceCents } = computeBalance(monthTransactions)
    result.push({ year, month, incomeCents, expenseCents, balanceCents })
  }
  return result
}

export interface GoalProgress {
  currentAmountCents: number
  targetAmountCents: number
  remainingAmountCents: number
  percent: number
}

/** Fortschritt eines Sparziels aus der Summe seiner Beiträge. */
export function computeGoalProgress(
  goal: Pick<SavingsGoal, 'targetAmountCents'>,
  contributions: Pick<SavingsContribution, 'amountCents'>[]
): GoalProgress {
  const currentAmountCents = contributions.reduce((sum, c) => sum + c.amountCents, 0)
  const remainingAmountCents = Math.max(goal.targetAmountCents - currentAmountCents, 0)
  const percent = goal.targetAmountCents > 0 ? Math.min((currentAmountCents / goal.targetAmountCents) * 100, 100) : 0
  return { currentAmountCents, targetAmountCents: goal.targetAmountCents, remainingAmountCents, percent }
}

export interface GoalForecast {
  monthlyAverageCents: number
  projectedCompletionDate: string | null
  onTrack: boolean | null
}

/**
 * Prognostiziert, wann ein Sparziel erreicht wird, basierend auf dem monatlichen
 * Durchschnittsbeitrag seit dem ersten Beitrag.
 */
export function computeGoalForecast(
  goal: Pick<SavingsGoal, 'targetAmountCents' | 'targetDate'>,
  contributions: Pick<SavingsContribution, 'amountCents' | 'date'>[],
  asOfDate: string
): GoalForecast {
  const currentAmountCents = contributions.reduce((sum, c) => sum + c.amountCents, 0)

  if (contributions.length === 0) {
    return { monthlyAverageCents: 0, projectedCompletionDate: null, onTrack: null }
  }

  const sortedDates = [...contributions].map((c) => c.date).sort()
  const firstDate = sortedDates[0]
  const monthsElapsed = Math.max(differenceInCalendarMonths(parseISO(asOfDate), parseISO(firstDate)), 1)
  const monthlyAverageCents = currentAmountCents / monthsElapsed

  if (currentAmountCents >= goal.targetAmountCents) {
    const onTrack = goal.targetDate ? asOfDate <= goal.targetDate : true
    return { monthlyAverageCents, projectedCompletionDate: asOfDate, onTrack }
  }

  if (monthlyAverageCents <= 0) {
    return { monthlyAverageCents, projectedCompletionDate: null, onTrack: false }
  }

  const remainingCents = goal.targetAmountCents - currentAmountCents
  const remainingMonths = Math.ceil(remainingCents / monthlyAverageCents)
  const projectedCompletionDate = format(addMonths(parseISO(asOfDate), remainingMonths), 'yyyy-MM-dd')
  const onTrack = goal.targetDate ? projectedCompletionDate <= goal.targetDate : null

  return { monthlyAverageCents, projectedCompletionDate, onTrack }
}

export interface InvestmentPerformance {
  firstValueCents: number
  lastValueCents: number
  absoluteChangeCents: number
  percentChange: number
}

/** Wertentwicklung einer Position anhand chronologisch sortierter Wertstände. */
export function computeInvestmentPerformance(
  valuations: Pick<InvestmentValuation, 'date' | 'valueCents'>[]
): InvestmentPerformance | null {
  if (valuations.length === 0) return null
  const sorted = [...valuations].sort((a, b) => a.date.localeCompare(b.date))
  const firstValueCents = sorted[0].valueCents
  const lastValueCents = sorted[sorted.length - 1].valueCents
  const absoluteChangeCents = lastValueCents - firstValueCents
  const percentChange = firstValueCents > 0 ? (absoluteChangeCents / firstValueCents) * 100 : 0
  return { firstValueCents, lastValueCents, absoluteChangeCents, percentChange }
}

/** Gesamtwert des Depots aus dem jeweils aktuellsten Wertstand jeder Position. */
export function computePortfolioTotalValue(
  investments: Pick<Investment, 'id'>[],
  valuationsByInvestment: Map<number, Pick<InvestmentValuation, 'date' | 'valueCents'>[]>
): number {
  let total = 0
  for (const investment of investments) {
    const valuations = valuationsByInvestment.get(investment.id) ?? []
    if (valuations.length === 0) continue
    const latest = [...valuations].sort((a, b) => b.date.localeCompare(a.date))[0]
    total += latest.valueCents
  }
  return total
}
