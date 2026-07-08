import type { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: string
  meta?: ReactNode
  tone?: 'default' | 'positive' | 'negative' | 'warning' | 'accent'
}

export function StatTile({ label, value, meta, tone = 'default' }: StatTileProps): JSX.Element {
  const toneClass = tone !== 'default' ? `text-${tone}` : ''
  return (
    <div className="stat-tile">
      <span className="stat-tile-label">{label}</span>
      <span className={['stat-tile-value tabular', toneClass].filter(Boolean).join(' ')}>{value}</span>
      {meta ? <span className="stat-tile-meta">{meta}</span> : null}
    </div>
  )
}
