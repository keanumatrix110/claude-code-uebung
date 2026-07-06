import { Wallet, TrendingDown, Scale, Sparkles } from 'lucide-react'
import { StatCard } from './StatCard'

interface SummaryCardsProps {
  income: number
  expense: number
  prevIncome: number
  prevExpense: number
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

export function SummaryCards({ income, expense, prevIncome, prevExpense }: SummaryCardsProps) {
  const balance = income - expense
  const prevBalance = prevIncome - prevExpense
  const savingsRate = income > 0 ? (balance / income) * 100 : 0
  const prevSavingsRate = prevIncome > 0 ? (prevBalance / prevIncome) * 100 : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Einnahmen"
        value={income}
        icon={<Wallet size={18} />}
        accent="good"
        delta={pctDelta(income, prevIncome)}
        deltaGoodDirection="up"
      />
      <StatCard
        label="Ausgaben"
        value={expense}
        icon={<TrendingDown size={18} />}
        accent="critical"
        delta={pctDelta(expense, prevExpense)}
        deltaGoodDirection="down"
      />
      <StatCard
        label="Saldo"
        value={balance}
        icon={<Scale size={18} />}
        accent={balance >= 0 ? 'good' : 'critical'}
        delta={pctDelta(balance, prevBalance)}
        deltaGoodDirection="up"
      />
      <StatCard
        label="Sparquote"
        value={savingsRate}
        suffix="%"
        icon={<Sparkles size={18} />}
        accent={savingsRate >= 0 ? 'good' : 'critical'}
        delta={pctDelta(savingsRate, prevSavingsRate)}
        deltaGoodDirection="up"
      />
    </div>
  )
}
