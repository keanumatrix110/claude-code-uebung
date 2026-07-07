import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@renderer/components/ui/Card'
import { StatTile } from '@renderer/components/ui/StatTile'
import { Badge } from '@renderer/components/ui/Badge'
import { ChevronLeftIcon, ChevronRightIcon } from '@renderer/components/icons'
import { useMonthStore } from '@renderer/state/monthStore'
import { useTransactionsStore } from '@renderer/state/transactionsStore'
import { useCategoriesStore } from '@renderer/state/categoriesStore'
import {
  computeBalance,
  computeCategoryBreakdown,
  computeFixedCostRatio,
  computeSavingsRate,
  computeYearComparison,
  filterTransactionsForMonth,
  sumFixedCostExpenses
} from '@shared/calculations'
import { formatCurrencyDE, formatMonthYearDE, formatPercentDE } from '@shared/format'

const MONTH_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

export function MonthOverviewPage(): JSX.Element {
  const { year, month, goToPrevious, goToNext, goToCurrent } = useMonthStore()
  const transactions = useTransactionsStore((s) => s.transactions)
  const categories = useCategoriesStore((s) => s.categories)

  const monthTransactions = useMemo(
    () => filterTransactionsForMonth(transactions, year, month),
    [transactions, year, month]
  )

  const { incomeCents, expenseCents, balanceCents } = computeBalance(monthTransactions)
  const fixedCents = sumFixedCostExpenses(monthTransactions, categories)
  const savingsRate = computeSavingsRate(incomeCents, expenseCents)
  const fixedCostRatio = computeFixedCostRatio(fixedCents, incomeCents)

  const expenseBreakdown = computeCategoryBreakdown(
    monthTransactions.filter((t) => t.type === 'expense'),
    categories
  )
  const incomeBreakdown = computeCategoryBreakdown(
    monthTransactions.filter((t) => t.type === 'income'),
    categories
  )

  const yearComparison = useMemo(() => computeYearComparison(transactions, year), [transactions, year])
  const chartData = yearComparison.map((m) => ({
    month: MONTH_SHORT[m.month - 1],
    Einnahmen: m.incomeCents / 100,
    Ausgaben: m.expenseCents / 100,
    Saldo: m.balanceCents / 100
  }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Monatsübersicht</h1>
          <p className="page-subtitle">Detailansicht und Jahresvergleich</p>
        </div>
        <div className="page-actions">
          <div className="month-nav">
            <button className="icon-btn" onClick={goToPrevious} aria-label="Vorheriger Monat">
              <ChevronLeftIcon />
            </button>
            <span className="month-nav-label tabular">{formatMonthYearDE(year, month)}</span>
            <button className="icon-btn" onClick={goToNext} aria-label="Nächster Monat">
              <ChevronRightIcon />
            </button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={goToCurrent}>
            Heute
          </button>
        </div>
      </div>

      <div className="grid grid-stats section">
        <StatTile label="Einnahmen" value={formatCurrencyDE(incomeCents)} tone="positive" />
        <StatTile label="Ausgaben" value={formatCurrencyDE(expenseCents)} tone="negative" />
        <StatTile label="Saldo" value={formatCurrencyDE(balanceCents)} tone={balanceCents >= 0 ? 'positive' : 'negative'} />
        <StatTile label="Sparquote" value={formatPercentDE(savingsRate)} tone="accent" />
        <StatTile label="Fixkostenquote" value={formatPercentDE(fixedCostRatio)} tone="warning" />
      </div>

      <Card className="section">
        <div className="section-title">
          <span>Jahresvergleich {year}</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262c38" vertical={false} />
            <XAxis dataKey="month" stroke="#8b93a3" fontSize={12} />
            <YAxis stroke="#8b93a3" fontSize={11} tickFormatter={(v: number) => `${v.toLocaleString('de-DE')} €`} />
            <Tooltip
              formatter={(value: number) => `${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`}
              contentStyle={{ background: '#181c24', border: '1px solid #262c38', borderRadius: 8 }}
              labelStyle={{ color: '#e8eaed' }}
            />
            <Legend wrapperStyle={{ fontSize: 12.5 }} />
            <Bar dataKey="Einnahmen" fill="#34b568" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Ausgaben" fill="#e05a5a" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Saldo" fill="#4c7cf0" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-2col section">
        <Card>
          <div className="section-title">
            <span>Ausgaben nach Kategorie</span>
          </div>
          {expenseBreakdown.length === 0 ? (
            <div className="empty-state">Keine Ausgaben in diesem Monat.</div>
          ) : (
            <table className="data-table">
              <tbody>
                {expenseBreakdown.map((b) => (
                  <tr key={`${b.type}-${b.categoryId}`}>
                    <td>
                      <Badge color={b.color} label={b.categoryName} />
                    </td>
                    <td className="align-right tabular text-negative">{formatCurrencyDE(b.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card>
          <div className="section-title">
            <span>Einnahmen nach Kategorie</span>
          </div>
          {incomeBreakdown.length === 0 ? (
            <div className="empty-state">Keine Einnahmen in diesem Monat.</div>
          ) : (
            <table className="data-table">
              <tbody>
                {incomeBreakdown.map((b) => (
                  <tr key={`${b.type}-${b.categoryId}`}>
                    <td>
                      <Badge color={b.color} label={b.categoryName} />
                    </td>
                    <td className="align-right tabular text-positive">{formatCurrencyDE(b.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  )
}
