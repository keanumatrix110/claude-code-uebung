import { useState } from 'react'
import { Modal } from '@renderer/components/ui/Modal'
import { Button } from '@renderer/components/ui/Button'
import { TextField } from '@renderer/components/ui/Field'
import { useInvestmentsStore } from '@renderer/state/investmentsStore'
import { ValidationError, parseCurrencyDE } from '@shared/format'
import type { Investment } from '@shared/types'

interface ValuationModalProps {
  investment: Investment
  onClose: () => void
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function ValuationModal({ investment, onClose }: ValuationModalProps): JSX.Element {
  const addValuation = useInvestmentsStore((s) => s.addValuation)

  const [date, setDate] = useState(todayIso())
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(): Promise<void> {
    let valueCents: number
    try {
      valueCents = parseCurrencyDE(value)
      if (valueCents < 0) throw new ValidationError('Wert darf nicht negativ sein.')
    } catch (err) {
      setError(err instanceof ValidationError ? err.message : 'Ungültiger Wert.')
      return
    }
    setError(undefined)
    setSubmitting(true)
    const success = await addValuation({ investmentId: investment.id, date, valueCents })
    setSubmitting(false)
    if (success) onClose()
  }

  return (
    <Modal
      title={`Wertstand: ${investment.name}`}
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
        <TextField label="Datum" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <TextField label="Gesamtwert der Position (€)" placeholder="0,00" value={value} onChange={(e) => setValue(e.target.value)} error={error} />
      </div>
    </Modal>
  )
}
