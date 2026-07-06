import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { TrendPoint } from '../lib/selectors'
import { resolveColor } from '../lib/palette'
import { useTheme } from '../store/useTheme'
import { formatCompactCurrency, formatCurrency, formatShortMonthLabel } from '../lib/format'

interface TrendChartProps {
  data: TrendPoint[]
}

export function TrendChart({ data }: TrendChartProps) {
  const [theme] = useTheme()
  const incomeColor = resolveColor('blue', theme)
  const expenseColor = resolveColor('red', theme)

  const chartData = data.map((d) => ({
    ...d,
    label: formatShortMonthLabel(d.month),
  }))

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Einnahmen &amp; Ausgaben im Verlauf</h2>
        <div className="flex items-center gap-4 text-xs text-[var(--ink-secondary)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: incomeColor }} />
            Einnahmen
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: expenseColor }} />
            Ausgaben
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} barCategoryGap="28%" barGap={4}>
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis
            dataKey="label"
            axisLine={{ stroke: 'var(--baseline)' }}
            tickLine={false}
            tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
            tickFormatter={(v: number) => formatCompactCurrency(v)}
            width={56}
          />
          <Tooltip
            cursor={{ fill: 'var(--gridline)', opacity: 0.4 }}
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(label) => label}
            contentStyle={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              fontSize: 13,
              color: 'var(--ink-primary)',
            }}
          />
          <Bar dataKey="income" name="Einnahmen" fill={incomeColor} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expense" name="Ausgaben" fill={expenseColor} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
