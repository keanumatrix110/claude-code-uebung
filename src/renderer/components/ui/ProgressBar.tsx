interface ProgressBarProps {
  percent: number
}

export function ProgressBar({ percent }: ProgressBarProps): JSX.Element {
  const clamped = Math.min(Math.max(percent, 0), 100)
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  )
}
