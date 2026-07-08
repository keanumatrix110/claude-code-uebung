import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { View } from '@renderer/App'
import { Card } from '@renderer/components/ui/Card'
import { StatTile } from '@renderer/components/ui/StatTile'
import { ProgressBar } from '@renderer/components/ui/ProgressBar'
import { Button } from '@renderer/components/ui/Button'
import { useTransactionsStore } from '@renderer/state/transactionsStore'
import { useCategoriesStore } from '@renderer/state/categoriesStore'
import { useSavingsGoalsStore } from '@renderer/state/savingsGoalsStore'
import { useInvestmentsStore } from '@renderer/state/investmentsStore'
import {
  computeBalance,
  computeCategoryBreakdown,
  computeFixedCostRatio,
  computeGoalProgress,
  computePortfolioTotalValue,
  computeSavingsRate,
  filterTransactionsForMonth,
  sumFixedCostExpenses
} from '@shared/calculations'
import { formatCurrencyDE, formatMonthYearDE, formatPercentDE } from '@shared/format'

interface DashboardPageProps {
  onNavigate: (view: View) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps): JSX.Element {
  const transactions = useTransactionsStore((s) => s.transactions)
  const categories = useCategoriesStore((s) => s.categories)
  const goals = useSavingsGoalsStore((s) => s.goals)
  const contributionsByGoal = useSavingsGoalsStore((s) => s.contributionsByGoal)
  const investments = useInvestmentsStore((s) => s.investments)
  const valuationsByInvestment = useInvestmentsStore((s) => s.valuationsByInvestment)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const monthTransactions = useMemo(
    () => filterTransactionsForMonth(transactions, year, month),
    [transactions, year, month]
  )

  const { incomeCents, expenseCents, balanceCents } = computeBalance(monthTransactions)
  const fixedCents = sumFixedCostExpenses(monthTransactions, categories)
  const savingsRate = computeSavingsRate(incomeCents, expenseCents)
  const fixedCostRatio = computeFixedCostRatio(fixedCents, incomeCents)

  const expenseBreakdown = useMemo(
    () =>
      computeCategoryBreakdown(
        monthTransactions.filter((t) => t.type === 'expense'),
        categories
      ).slice(0, 6),
    [monthTransactions, categories]
  )

  const recentTransactions = useMemo(() => transactions.slice(0, 8), [transactions])

  const portfolioValueCents = useMemo(() => {
    const map = new Map(investments.map((i) => [i.id, valuationsByInvestment[i.id] ?? []]))
    return computePortfolioTotalValue(investments, map)
  }, [investments, valuationsByInvestment])

  const topGoals = goals.slice(0, 3)

  const categoryById = new Map(categories.map((c) => [c.id, c]))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Übersicht für {formatMonthYearDE(year, month)}</p>
        </div>
        <div className="page-actions">
          <Button variant="primary" onClick={() => onNavigate('transactions')}>
            Buchung erfassen
          </Button>
        </div>
      </div>

      <div className="grid grid-stats section">
        <StatTile label="Einnahmen (Monat)" value={formatCurrencyDE(incomeCents)} tone="positive" />
        <StatTile label="Ausgaben (Monat)" value={formatCurrencyDE(expenseCents)} tone="negative" />
        <StatTile
          label="Saldo (Monat)"
          value={formatCurrencyDE(balanceCents)}
          tone={balanceCents >= 0 ? 'positive' : 'negative'}
        />
        <StatTile label="Sparquote" value={formatPercentDE(savingsRate)} tone="accent" />
        <StatTile label="Fixkostenquote" value={formatPercentDE(fixedCostRatio)} tone="warning" />
      </div>

      <div className="grid grid-2col section">
        <Card>
          <div className="section-title">
            <span>Ausgaben nach Kategorie</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('month')}>
              Monatsübersicht →
            </button>
          </div>
          {expenseBreakdown.length === 0 ? (
            <div className="empty-state">Noch keine Ausgaben in diesem Monat erfasst.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={expenseBreakdown} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262c38" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => formatCurrencyDE(v)}
                  stroke="#8b93a3"
                  fontSize={11}
                />
                <YAxis type="category" dataKey="categoryName" stroke="#8b93a3" fontSize={12} width={110} />
                <Tooltip
                  formatter={(value: number) => formatCurrencyDE(value)}
                  contentStyle={{ background: '#181c24', border: '1px solid #262c38', borderRadius: 8 }}
                  labelStyle={{ color: '#e8eaed' }}
                />
                <Bar dataKey="amountCents" radius={[0, 4, 4, 0]}>
                  {expenseBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <div className="grid" style={{ gap: 16 }}>
          <Card>
            <div className="section-title">
              <span>Sparziele</span>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('goals')}>
                Alle →
              </button>
            </div>
            {topGoals.length === 0 ? (
              <div className="empty-state">Noch keine Sparziele angelegt.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {topGoals.map((goal) => {
                  const progress = computeGoalProgress(goal, contributionsByGoal[goal.id] ?? [])
                  return (
                    <div key={goal.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span>{goal.name}</span>
                        <span className="muted tabular">{formatPercentDE(progress.percent, 0)}</span>
                      </div>
                      <ProgressBar percent={progress.percent} />
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card>
            <div className="section-title">
              <span>Investments</span>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('investments')}>
                Depot →
              </button>
            </div>
            <StatTile label="Depotwert gesamt" value={formatCurrencyDE(portfolioValueCents)} tone="accent" />
          </Card>
        </div>
      </div>

      <Card>
        <div className="section-title">
          <span>Letzte Buchungen</span>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('transactions')}>
            Alle Buchungen →
          </button>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="empty-state">Noch keine Buchungen erfasst.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Beschreibung</th>
                <th>Kategorie</th>
                <th className="align-right">Betrag</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t) => (
                <tr key={t.id}>
                  <td className="muted tabular">{t.date.split('-').reverse().join('.')}</td>
                  <td>{t.description || '–'}</td>
                  <td className="muted">{t.categoryId ? categoryById.get(t.categoryId)?.name ?? '–' : '–'}</td>
                  <td className={`align-right tabular ${t.type === 'income' ? 'text-positive' : 'text-negative'}`}>
                    {t.type === 'income' ? '+' : '−'}
                    {formatCurrencyDE(t.amountCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
