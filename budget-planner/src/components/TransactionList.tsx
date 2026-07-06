import { Pencil, Trash2 } from 'lucide-react'
import type { Category, Transaction } from '../types'
import { Icon } from './Icon'
import { formatCurrency, formatDate } from '../lib/format'
import { resolveColor, type ColorSlot } from '../lib/palette'
import { useTheme } from '../store/useTheme'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, categories, onEdit, onDelete }: TransactionListProps) {
  const [theme] = useTheme()
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold">Buchungen</h2>
      {sorted.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--ink-muted)]">
          Keine Buchungen in diesem Monat.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--gridline)]">
          {sorted.map((t) => {
            const cat = categoryMap[t.categoryId]
            const color = cat ? resolveColor(cat.color as ColorSlot, theme) : 'var(--ink-muted)'
            return (
              <li key={t.id} className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${color}1a`, color }}
                >
                  <Icon name={cat?.icon ?? 'MoreHorizontal'} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{cat?.name ?? 'Unbekannt'}</p>
                  <p className="truncate text-xs text-[var(--ink-muted)]">
                    {t.note ? `${t.note} · ` : ''}
                    {formatDate(t.date)}
                  </p>
                </div>
                <span
                  className={
                    'tabular shrink-0 text-sm font-semibold ' +
                    (t.type === 'income' ? 'text-[var(--good)]' : 'text-[var(--ink-primary)]')
                  }
                >
                  {t.type === 'income' ? '+' : '−'}
                  {formatCurrency(t.amount)}
                </span>
                <div className="ml-1 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label="Bearbeiten"
                    onClick={() => onEdit(t)}
                    className="rounded-lg p-1.5 text-[var(--ink-muted)] hover:bg-[var(--gridline)] hover:text-[var(--ink-primary)]"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Löschen"
                    onClick={() => onDelete(t.id)}
                    className="rounded-lg p-1.5 text-[var(--ink-muted)] hover:bg-[var(--critical)]/10 hover:text-[var(--critical)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
