import { useState } from 'react'
import { Card } from '@renderer/components/ui/Card'
import { Button } from '@renderer/components/ui/Button'
import { ProgressBar } from '@renderer/components/ui/ProgressBar'
import { ConfirmDialog } from '@renderer/components/ui/ConfirmDialog'
import { EditIcon, PlusIcon, TrashIcon } from '@renderer/components/icons'
import { useSavingsGoalsStore } from '@renderer/state/savingsGoalsStore'
import { GoalFormModal } from '@renderer/components/goals/GoalFormModal'
import { ContributionModal } from '@renderer/components/goals/ContributionModal'
import { computeGoalForecast, computeGoalProgress } from '@shared/calculations'
import { formatCurrencyDE, formatDateDE, formatPercentDE } from '@shared/format'
import type { SavingsGoal } from '@shared/types'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function SavingsGoalsPage(): JSX.Element {
  const goals = useSavingsGoalsStore((s) => s.goals)
  const contributionsByGoal = useSavingsGoalsStore((s) => s.contributionsByGoal)
  const removeGoal = useSavingsGoalsStore((s) => s.remove)
  const removeContribution = useSavingsGoalsStore((s) => s.removeContribution)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SavingsGoal | undefined>()
  const [contributingTo, setContributingTo] = useState<SavingsGoal | undefined>()
  const [deleteCandidate, setDeleteCandidate] = useState<SavingsGoal | undefined>()
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sparziele</h1>
          <p className="page-subtitle">Fortschritt und Prognose je Ziel</p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setEditing(undefined)
              setShowForm(true)
            }}
          >
            Neues Sparziel
          </Button>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">Noch keine Sparziele angelegt.</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {goals.map((goal) => {
            const contributions = contributionsByGoal[goal.id] ?? []
            const progress = computeGoalProgress(goal, contributions)
            const forecast = computeGoalForecast(goal, contributions, todayIso())
            const isExpanded = expanded === goal.id

            return (
              <Card key={goal.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 650 }}>{goal.name}</h3>
                    {goal.targetDate && <span className="muted" style={{ fontSize: 12 }}>Ziel: {formatDateDE(goal.targetDate)}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="icon-btn"
                      onClick={() => {
                        setEditing(goal)
                        setShowForm(true)
                      }}
                    >
                      <EditIcon />
                    </button>
                    <button className="icon-btn" onClick={() => setDeleteCandidate(goal)}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                <ProgressBar percent={progress.percent} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
                  <span className="tabular">{formatCurrencyDE(progress.currentAmountCents)}</span>
                  <span className="muted tabular">von {formatCurrencyDE(progress.targetAmountCents)}</span>
                </div>

                <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 12.5 }}>
                  <div>
                    <div className="muted">Fortschritt</div>
                    <div className="tabular" style={{ fontWeight: 600 }}>{formatPercentDE(progress.percent, 0)}</div>
                  </div>
                  <div>
                    <div className="muted">Prognose Zielerreichung</div>
                    <div style={{ fontWeight: 600 }} className={forecast.onTrack === false ? 'text-negative' : forecast.onTrack === true ? 'text-positive' : ''}>
                      {forecast.projectedCompletionDate ? formatDateDE(forecast.projectedCompletionDate) : 'Noch unbekannt'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <Button size="sm" variant="primary" onClick={() => setContributingTo(goal)}>
                    Beitrag erfassen
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setExpanded(isExpanded ? null : goal.id)}>
                    {isExpanded ? 'Beiträge ausblenden' : `Beiträge (${contributions.length})`}
                  </Button>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 12, maxHeight: 200, overflowY: 'auto' }}>
                    {contributions.length === 0 ? (
                      <div className="muted" style={{ fontSize: 12.5 }}>
                        Noch keine Beiträge.
                      </div>
                    ) : (
                      <table className="data-table">
                        <tbody>
                          {contributions.map((c) => (
                            <tr key={c.id}>
                              <td className="muted tabular">{formatDateDE(c.date)}</td>
                              <td className={`tabular ${c.amountCents >= 0 ? 'text-positive' : 'text-negative'}`}>
                                {c.amountCents >= 0 ? '+' : ''}
                                {formatCurrencyDE(c.amountCents)}
                              </td>
                              <td className="align-right">
                                <button className="icon-btn" onClick={() => removeContribution(c.id, goal.id)}>
                                  <TrashIcon />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {showForm && (
        <GoalFormModal
          goal={editing}
          onClose={() => {
            setShowForm(false)
            setEditing(undefined)
          }}
        />
      )}
      {contributingTo && <ContributionModal goal={contributingTo} onClose={() => setContributingTo(undefined)} />}
      {deleteCandidate && (
        <ConfirmDialog
          title="Sparziel löschen"
          message={`Möchtest du das Sparziel "${deleteCandidate.name}" inklusive aller Beiträge wirklich löschen?`}
          onCancel={() => setDeleteCandidate(undefined)}
          onConfirm={async () => {
            await removeGoal(deleteCandidate.id)
            setDeleteCandidate(undefined)
          }}
        />
      )}
    </div>
  )
}
