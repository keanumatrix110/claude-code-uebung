import { useState } from 'react'
import { Modal } from '@renderer/components/ui/Modal'
import { Button } from '@renderer/components/ui/Button'
import { TextField, SelectField } from '@renderer/components/ui/Field'
import { useSavingsGoalsStore } from '@renderer/state/savingsGoalsStore'
import { ValidationError, parseCurrencyDE } from '@shared/format'
import type { SavingsGoal } from '@shared/types'

interface ContributionModalProps {
  goal: SavingsGoal
  onClose: () => void
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function ContributionModal({ goal, onClose }: ContributionModalProps): JSX.Element {
  const addContribution = useSavingsGoalsStore((s) => s.addContribution)

  const [direction, setDirection] = useState<'deposit' | 'withdrawal'>('deposit')
  const [date, setDate] = useState(todayIso())
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(): Promise<void> {
    let amountCents: number
    try {
      amountCents = parseCurrencyDE(amount)
      if (amountCents <= 0) throw new ValidationError('Betrag muss größer als 0 sein.')
    } catch (err) {
      setError(err instanceof ValidationError ? err.message : 'Ungültiger Betrag.')
      return
    }
    setError(undefined)
    setSubmitting(true)
    const success = await addContribution({
      goalId: goal.id,
      date,
      amountCents: direction === 'deposit' ? amountCents : -amountCents,
      note: note.trim() ? note.trim() : null
    })
    setSubmitting(false)
    if (success) onClose()
  }

  return (
    <Modal
      title={`Beitrag für "${goal.name}"`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Abbrechen
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            Speichern
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-row">
          <SelectField label="Art" value={direction} onChange={(e) => setDirection(e.target.value as 'deposit' | 'withdrawal')}>
            <option value="deposit">Einzahlung</option>
            <option value="withdrawal">Entnahme</option>
          </SelectField>
          <TextField label="Datum" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <TextField label="Betrag (€)" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} error={error} />
        <TextField label="Notiz (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Modal>
  )
}
