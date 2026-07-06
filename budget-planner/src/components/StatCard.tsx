import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '../lib/format'

interface StatCardProps {
  label: string
  value: number
  icon: ReactNode
  accent?: 'default' | 'good' | 'critical'
  delta?: number | null
  deltaGoodDirection?: 'up' | 'down'
  suffix?: string
}

export function StatCard({
  label,
  value,
  icon,
  accent = 'default',
  delta,
  deltaGoodDirection = 'up',
  suffix,
}: StatCardProps) {
  const hasDelta = delta !== undefined && delta !== null && Number.isFinite(delta)
  const deltaIsUp = (delta ?? 0) >= 0
  const deltaIsGood = hasDelta && (deltaIsUp === (deltaGoodDirection === 'up'))

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-[var(--ink-secondary)]">{label}</span>
        <span
          className={
            'flex h-9 w-9 items-center justify-center rounded-xl ' +
            (accent === 'good'
              ? 'bg-[var(--good)]/10 text-[var(--good)]'
              : accent === 'critical'
                ? 'bg-[var(--critical)]/10 text-[var(--critical)]'
                : 'bg-[var(--accent)]/10 text-[var(--accent)]')
          }
        >
          {icon}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="tabular text-2xl font-semibold tracking-tight sm:text-3xl">
          {suffix ? `${value.toFixed(1)}${suffix}` : formatCurrency(value)}
        </p>
        {hasDelta && (
          <span
            className={
              'mb-1 flex items-center gap-0.5 text-xs font-medium ' +
              (deltaIsGood ? 'text-[var(--good)]' : 'text-[var(--critical)]')
            }
          >
            {deltaIsUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(delta!).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  )
}
