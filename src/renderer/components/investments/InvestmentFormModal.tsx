import { useState } from 'react'
import { Modal } from '@renderer/components/ui/Modal'
import { Button } from '@renderer/components/ui/Button'
import { TextField, SelectField } from '@renderer/components/ui/Field'
import { useInvestmentsStore } from '@renderer/state/investmentsStore'
import { ValidationError, assertNonEmpty } from '@shared/format'
import type { Investment, InvestmentType } from '@shared/types'

interface InvestmentFormModalProps {
  investment?: Investment
  onClose: () => void
}

const TYPE_LABELS: Record<InvestmentType, string> = {
  stock: 'Aktie',
  etf: 'ETF',
  fund: 'Fonds',
  bond: 'Anleihe',
  crypto: 'Krypto',
  other: 'Sonstiges'
}

export function InvestmentFormModal({ investment, onClose }: InvestmentFormModalProps): JSX.Element {
  const create = useInvestmentsStore((s) => s.create)
  const update = useInvestmentsStore((s) => s.update)

  const [name, setName] = useState(investment?.name ?? '')
  const [type, setType] = useState<InvestmentType>(investment?.type ?? 'etf')
  const [ticker, setTicker] = useState(investment?.ticker ?? '')
  const [quantity, setQuantity] = useState(investment ? String(investment.quantity) : '')
  const [notes, setNotes] = useState(investment?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(): Promise<void> {
    const nextErrors: Record<string, string> = {}
    try {
      assertNonEmpty(name, 'Name')
    } catch (err) {
      if (err instanceof ValidationError) nextErrors.name = err.message
    }
    const quantityNum = quantity.trim() === '' ? 0 : Number(quantity.replace(',', '.'))
    if (!Number.isFinite(quantityNum) || quantityNum < 0) {
      nextErrors.quantity = 'Ungültige Stückzahl.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    const input = {
      name,
      type,
      ticker: ticker.trim() ? ticker.trim().toUpperCase() : null,
      quantity: quantityNum,
      notes: notes.trim() ? notes.trim() : null
    }
    const success = investment ? await update(investment.id, input) : await create(input)
    setSubmitting(false)
    if (success) onClose()
  }

  return (
    <Modal
      title={investment ? 'Position bearbeiten' : 'Neue Position'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Abbrechen
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {investment ? 'Speichern' : 'Position anlegen'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TextField label="Name" placeholder="z. B. MSCI World ETF" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <div className="form-row">
          <SelectField label="Typ" value={type} onChange={(e) => setType(e.target.value as InvestmentType)}>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <TextField label="Ticker/ISIN (optional)" value={ticker} onChange={(e) => setTicker(e.target.value)} />
        </div>
        <TextField
          label="Stückzahl"
          placeholder="z. B. 12,5"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={errors.quantity}
        />
        <TextField label="Notizen (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </Modal>
  )
}
