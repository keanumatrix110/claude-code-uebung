import type { Category } from '../types'
import { Icon } from './Icon'
import { formatCurrency } from '../lib/format'
import { resolveColor, type ColorSlot } from '../lib/palette'
import { useTheme } from '../store/useTheme'

interface CategoryBudgetsProps {
  categories: Category[]
  spentByCategory: Record<string, number>
}

export function CategoryBudgets({ categories, spentByCategory }: CategoryBudgetsProps) {
  const [theme] = useTheme()
  const budgeted = categories.filter((c) => c.type === 'expense' && c.monthlyLimit)

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Budget-Kategorien</h2>
        <span className="text-xs text-[var(--ink-muted)]">Aktueller Monat</span>
      </div>
      <ul className="flex flex-col gap-4">
        {budgeted.map((cat) => {
          const spent = spentByCategory[cat.id] ?? 0
          const limit = cat.monthlyLimit ?? 0
          const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0
          const overBudget = spent > limit
          const color = resolveColor(cat.color as ColorSlot, theme)
          const barColor = overBudget ? 'var(--critical)' : color

          return (
            <li key={cat.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-lg"
                    style={{ background: `${color}1a`, color }}
                  >
                    <Icon name={cat.icon} size={13} />
                  </span>
                  {cat.name}
                </span>
                <span className="tabular text-[var(--ink-secondary)]">
                  {formatCurrency(spent)}{' '}
                  <span className="text-[var(--ink-muted)]">/ {formatCurrency(limit)}</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--gridline)]">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
              {overBudget && (
                <p className="mt-1 text-xs font-medium text-[var(--critical)]">
                  {formatCurrency(spent - limit)} über Budget
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
