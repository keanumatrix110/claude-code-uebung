import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { Category } from '../types'
import { resolveColor, type ColorSlot } from '../lib/palette'
import { useTheme } from '../store/useTheme'
import { formatCurrency } from '../lib/format'

interface ExpenseBreakdownChartProps {
  categories: Category[]
  spentByCategory: Record<string, number>
}

export function ExpenseBreakdownChart({ categories, spentByCategory }: ExpenseBreakdownChartProps) {
  const [theme] = useTheme()
  const expenseCats = categories.filter((c) => c.type === 'expense')

  const data = expenseCats
    .map((c) => ({
      id: c.id,
      name: c.name,
      value: spentByCategory[c.id] ?? 0,
      color: resolveColor(c.color as ColorSlot, theme),
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">Ausgaben nach Kategorie</h2>
        <p className="py-10 text-center text-sm text-[var(--ink-muted)]">
          Noch keine Ausgaben in diesem Monat.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-5 shadow-sm">
      <h2 className="mb-2 text-base font-semibold">Ausgaben nach Kategorie</h2>
      <div className="relative mx-auto flex items-center justify-center">
        <PieChart width={220} height={220}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={64}
            outerRadius={98}
            paddingAngle={2}
            cornerRadius={4}
            stroke="var(--surface-raised)"
            strokeWidth={2}
          >
            {data.map((d) => (
              <Cell key={d.id} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              fontSize: 13,
              color: 'var(--ink-primary)',
            }}
          />
        </PieChart>
        <div className="pointer-events-none absolute flex flex-col items-center">
          <span className="text-xs text-[var(--ink-muted)]">Gesamt</span>
          <span className="tabular text-lg font-semibold">{formatCurrency(total)}</span>
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {data.map((d) => (
          <li key={d.id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-[var(--ink-secondary)]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="tabular font-medium">
              {formatCurrency(d.value)}{' '}
              <span className="text-[var(--ink-muted)]">
                ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
