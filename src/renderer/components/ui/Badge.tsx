interface BadgeProps {
  color: string
  label: string
}

export function Badge({ color, label }: BadgeProps): JSX.Element {
  return (
    <span className="badge" style={{ background: `${color}22`, color }}>
      <span className="badge-dot" style={{ background: color }} />
      {label}
    </span>
  )
}
