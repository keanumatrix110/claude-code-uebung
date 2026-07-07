import { useState } from 'react'
import { Modal } from '@renderer/components/ui/Modal'
import { Button } from '@renderer/components/ui/Button'
import { TextField } from '@renderer/components/ui/Field'
import { useSavingsGoalsStore } from '@renderer/state/savingsGoalsStore'
import { ValidationError, assertNonEmpty, formatAmountInputDE, parseCurrencyDE } from '@shared/format'
import type { SavingsGoal } from '@shared/types'

interface GoalFormModalProps {
  goal?: SavingsGoal
  onClose: () => void
}

export function GoalFormModal({ goal, onClose }: GoalFormModalProps): JSX.Element {
  const create = useSavingsGoalsStore((s) => s.create)
  const update = useSavingsGoalsStore((s) => s.update)

  const [name, setName] = useState(goal?.name ?? '')
  const [targetAmount, setTargetAmount] = useState(goal ? formatAmountInputDE(goal.targetAmountCents) : '')
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(): Promise<void> {
    const nextErrors: Record<string, string> = {}
    let targetAmountCents = 0

    try {
      assertNonEmpty(name, 'Name')
    } catch (err) {
      if (err instanceof ValidationError) nextErrors.name = err.message
    }
    try {
      targetAmountCents = parseCurrencyDE(targetAmount)
      if (targetAmountCents <= 0) nextErrors.targetAmount = 'Zielbetrag muss größer als 0 sein.'
    } catch (err) {
      if (err instanceof ValidationError) nextErrors.targetAmount = err.message
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    const input = { name, targetAmountCents, targetDate: targetDate || null }
    const success = goal ? await update(goal.id, input) : await create(input)
    setSubmitting(false)
    if (success) onClose()
  }

  return (
    <Modal
      title={goal ? 'Sparziel bearbeiten' : 'Neues Sparziel'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Abbrechen
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {goal ? 'Speichern' : 'Ziel anlegen'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TextField label="Name" placeholder="z. B. Notgroschen" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <div className="form-row">
          <TextField
            label="Zielbetrag (€)"
            placeholder="10.000,00"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            error={errors.targetAmount}
          />
          <TextField label="Zieldatum (optional)" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
