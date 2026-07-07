import { describe, expect, it } from 'vitest'
import {
  computeBalance,
  computeCategoryBreakdown,
  computeFixedCostRatio,
  computeGoalForecast,
  computeGoalProgress,
  computeInvestmentPerformance,
  computePortfolioTotalValue,
  computeSavingsRate,
  computeYearComparison,
  filterTransactionsForMonth,
  sumByType,
  sumFixedCostExpenses
} from '../src/shared/calculations'
import type { Category, Transaction } from '../src/shared/types'

function tx(partial: Partial<Transaction>): Pick<Transaction, 'date' | 'amountCents' | 'type' | 'categoryId'> {
  return {
    date: '2026-07-01',
    amountCents: 1000,
    type: 'expense',
    categoryId: null,
    ...partial
  }
}

describe('sumByType', () => {
  it('summiert nur den angegebenen Typ', () => {
    const rows = [tx({ type: 'income', amountCents: 500000 }), tx({ type: 'expense', amountCents: 20000 })]
    expect(sumByType(rows, 'income')).toBe(500000)
    expect(sumByType(rows, 'expense')).toBe(20000)
  })

  it('gibt 0 für leere Liste zurück', () => {
    expect(sumByType([], 'income')).toBe(0)
  })
})

describe('computeBalance', () => {
  it('berechnet Einnahmen, Ausgaben und Saldo', () => {
    const rows = [
      tx({ type: 'income', amountCents: 300000 }),
      tx({ type: 'expense', amountCents: 120000 }),
      tx({ type: 'expense', amountCents: 30000 })
    ]
    expect(computeBalance(rows)).toEqual({ incomeCents: 300000, expenseCents: 150000, balanceCents: 150000 })
  })

  it('kann negativen Saldo ergeben', () => {
    const rows = [tx({ type: 'income', amountCents: 1000 }), tx({ type: 'expense', amountCents: 5000 })]
    expect(computeBalance(rows).balanceCents).toBe(-4000)
  })
})

describe('filterTransactionsForMonth', () => {
  it('filtert nach Jahr und Monat', () => {
    const rows = [
      tx({ date: '2026-07-01' }),
      tx({ date: '2026-07-31' }),
      tx({ date: '2026-08-01' }),
      tx({ date: '2025-07-15' })
    ]
    expect(filterTransactionsForMonth(rows, 2026, 7)).toHaveLength(2)
  })
})

describe('computeSavingsRate', () => {
  it('berechnet die Sparquote korrekt', () => {
    expect(computeSavingsRate(300000, 240000)).toBeCloseTo(20)
  })

  it('gibt 0 bei fehlenden Einnahmen zurück (keine Division durch 0)', () => {
    expect(computeSavingsRate(0, 100)).toBe(0)
  })

  it('kann negativ sein, wenn mehr ausgegeben als eingenommen wird', () => {
    expect(computeSavingsRate(100000, 150000)).toBeCloseTo(-50)
  })

  it('ist 100 bei Ausgaben von 0', () => {
    expect(computeSavingsRate(100000, 0)).toBe(100)
  })
})

describe('computeFixedCostRatio', () => {
  it('berechnet die Fixkostenquote korrekt', () => {
    expect(computeFixedCostRatio(90000, 300000)).toBeCloseTo(30)
  })

  it('gibt 0 bei fehlenden Einnahmen zurück', () => {
    expect(computeFixedCostRatio(500, 0)).toBe(0)
  })
})

describe('sumFixedCostExpenses', () => {
  it('summiert nur Ausgaben aus Fixkosten-Kategorien', () => {
    const categories: Pick<Category, 'id' | 'isFixedCost'>[] = [
      { id: 1, isFixedCost: true },
      { id: 2, isFixedCost: false }
    ]
    const rows = [
      tx({ type: 'expense', categoryId: 1, amountCents: 80000 }),
      tx({ type: 'expense', categoryId: 2, amountCents: 5000 }),
      tx({ type: 'income', categoryId: 1, amountCents: 999999 })
    ]
    expect(sumFixedCostExpenses(rows, categories)).toBe(80000)
  })
})

describe('computeCategoryBreakdown', () => {
  it('gruppiert Buchungen nach Kategorie', () => {
    const categories: Category[] = [
      {
        id: 1,
        name: 'Lebensmittel',
        type: 'expense',
        isFixedCost: false,
        color: '#111',
        createdAt: '',
        updatedAt: ''
      }
    ]
    const rows = [
      tx({ categoryId: 1, amountCents: 3000 }),
      tx({ categoryId: 1, amountCents: 2000 }),
      tx({ categoryId: null, amountCents: 1000 })
    ]
    const result = computeCategoryBreakdown(rows, categories)
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ categoryId: 1, categoryName: 'Lebensmittel', amountCents: 5000 }),
        expect.objectContaining({ categoryId: null, categoryName: 'Ohne Kategorie', amountCents: 1000 })
      ])
    )
  })

  it('sortiert absteigend nach Betrag', () => {
    const rows = [tx({ categoryId: null, amountCents: 500 }), tx({ categoryId: 2, amountCents: 5000 })]
    const result = computeCategoryBreakdown(rows, [])
    expect(result[0].amountCents).toBe(5000)
  })
})

describe('computeYearComparison', () => {
  it('liefert 12 Monate mit korrekten Salden', () => {
    const rows = [
      tx({ date: '2026-01-15', type: 'income', amountCents: 100000 }),
      tx({ date: '2026-01-20', type: 'expense', amountCents: 40000 }),
      tx({ date: '2026-03-05', type: 'income', amountCents: 50000 })
    ]
    const result = computeYearComparison(rows, 2026)
    expect(result).toHaveLength(12)
    expect(result[0]).toEqual({ year: 2026, month: 1, incomeCents: 100000, expenseCents: 40000, balanceCents: 60000 })
    expect(result[2].incomeCents).toBe(50000)
    expect(result[5].balanceCents).toBe(0)
  })
})

describe('computeGoalProgress', () => {
  it('berechnet Fortschritt korrekt', () => {
    const progress = computeGoalProgress({ targetAmountCents: 100000 }, [
      { amountCents: 25000 },
      { amountCents: 25000 }
    ])
    expect(progress.currentAmountCents).toBe(50000)
    expect(progress.percent).toBe(50)
    expect(progress.remainingAmountCents).toBe(50000)
  })

  it('begrenzt den Fortschritt auf maximal 100 %', () => {
    const progress = computeGoalProgress({ targetAmountCents: 10000 }, [{ amountCents: 50000 }])
    expect(progress.percent).toBe(100)
    expect(progress.remainingAmountCents).toBe(0)
  })

  it('funktioniert ohne Beiträge', () => {
    const progress = computeGoalProgress({ targetAmountCents: 10000 }, [])
    expect(progress.currentAmountCents).toBe(0)
    expect(progress.percent).toBe(0)
  })
})

describe('computeGoalForecast', () => {
  it('liefert null-Prognose ohne Beiträge', () => {
    const forecast = computeGoalForecast({ targetAmountCents: 100000, targetDate: null }, [], '2026-07-01')
    expect(forecast.projectedCompletionDate).toBeNull()
    expect(forecast.onTrack).toBeNull()
  })

  it('erkennt bereits erreichtes Ziel', () => {
    const forecast = computeGoalForecast(
      { targetAmountCents: 10000, targetDate: '2026-12-01' },
      [{ amountCents: 20000, date: '2026-01-01' }],
      '2026-07-01'
    )
    expect(forecast.onTrack).toBe(true)
    expect(forecast.projectedCompletionDate).toBe('2026-07-01')
  })

  it('prognostiziert den Zeitpunkt anhand des Durchschnittsbeitrags', () => {
    // 1000€ über 5 Monate gespart = 200€/Monat, Ziel 3000€, fehlend 2000€ -> 10 weitere Monate
    const forecast = computeGoalForecast(
      { targetAmountCents: 300000, targetDate: null },
      [{ amountCents: 100000, date: '2026-01-01' }],
      '2026-06-01'
    )
    expect(forecast.monthlyAverageCents).toBeCloseTo(20000)
    expect(forecast.projectedCompletionDate).toBe('2027-04-01')
  })

  it('erkennt, ob eine Prognose innerhalb der Zielfrist liegt', () => {
    const forecast = computeGoalForecast(
      { targetAmountCents: 300000, targetDate: '2027-01-01' },
      [{ amountCents: 100000, date: '2026-01-01' }],
      '2026-06-01'
    )
    expect(forecast.onTrack).toBe(false)
  })
})

describe('computeInvestmentPerformance', () => {
  it('berechnet absolute und prozentuale Veränderung', () => {
    const perf = computeInvestmentPerformance([
      { date: '2026-01-01', valueCents: 1000000 },
      { date: '2026-06-01', valueCents: 1100000 }
    ])
    expect(perf).not.toBeNull()
    expect(perf?.absoluteChangeCents).toBe(100000)
    expect(perf?.percentChange).toBeCloseTo(10)
  })

  it('gibt null ohne Wertstände zurück', () => {
    expect(computeInvestmentPerformance([])).toBeNull()
  })

  it('sortiert unabhängig von der Eingabereihenfolge', () => {
    const perf = computeInvestmentPerformance([
      { date: '2026-06-01', valueCents: 1100000 },
      { date: '2026-01-01', valueCents: 1000000 }
    ])
    expect(perf?.firstValueCents).toBe(1000000)
    expect(perf?.lastValueCents).toBe(1100000)
  })
})

describe('computePortfolioTotalValue', () => {
  it('summiert die jeweils neuesten Wertstände aller Positionen', () => {
    const investments = [{ id: 1 }, { id: 2 }]
    const valuationsByInvestment = new Map([
      [
        1,
        [
          { date: '2026-01-01', valueCents: 10000 },
          { date: '2026-06-01', valueCents: 15000 }
        ]
      ],
      [2, [{ date: '2026-03-01', valueCents: 5000 }]]
    ])
    expect(computePortfolioTotalValue(investments, valuationsByInvestment)).toBe(20000)
  })

  it('ignoriert Positionen ohne Wertstand', () => {
    expect(computePortfolioTotalValue([{ id: 1 }], new Map())).toBe(0)
  })
})
