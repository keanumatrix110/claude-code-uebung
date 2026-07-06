import { ChevronLeft, ChevronRight, Moon, Plus, Sun, Wallet2 } from 'lucide-react'
import { formatMonthLabel } from '../lib/format'

interface HeaderProps {
  monthKey: string
  onPrevMonth: () => void
  onNextMonth: () => void
  onAddTransaction: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Header({
  monthKey,
  onPrevMonth,
  onNextMonth,
  onAddTransaction,
  theme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--page)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-white">
            <Wallet2 size={18} />
          </span>
          <span className="text-lg font-semibold tracking-tight">Budgetplaner</span>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-1 py-1">
          <button
            type="button"
            aria-label="Vorheriger Monat"
            onClick={onPrevMonth}
            className="rounded-lg p-1.5 text-[var(--ink-secondary)] hover:bg-[var(--gridline)]"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[9.5rem] text-center text-sm font-medium capitalize">
            {formatMonthLabel(monthKey)}
          </span>
          <button
            type="button"
            aria-label="Nächster Monat"
            onClick={onNextMonth}
            className="rounded-lg p-1.5 text-[var(--ink-secondary)] hover:bg-[var(--gridline)]"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Theme wechseln"
            onClick={onToggleTheme}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-2.5 text-[var(--ink-secondary)] hover:bg-[var(--gridline)]"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={onAddTransaction}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            Neue Buchung
          </button>
        </div>
      </div>
    </header>
  )
}
