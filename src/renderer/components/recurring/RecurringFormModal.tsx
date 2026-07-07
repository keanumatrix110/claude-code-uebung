import { useMemo, useState } from 'react'
import { Modal } from '@renderer/components/ui/Modal'
import { Button } from '@renderer/components/ui/Button'
import { TextField, SelectField } from '@renderer/components/ui/Field'
import { useCategoriesStore } from '@renderer/state/categoriesStore'
import { useRecurringStore } from '@renderer/state/recurringStore'
import { ValidationError, assertNonEmpty, assertValidIsoDate, formatAmountInputDE, parseCurrencyDE } from '@shared/format'
import type { RecurringTransaction, TransactionType } from '@shared/types'

interface RecurringFormModalProps {
  recurring?: RecurringTransaction
  onClose: () => void
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function RecurringFormModal({ recurring, onClose }: RecurringFormModalProps): JSX.Element {
  const categories = useCategoriesStore((s) => s.categories)
  const create = useRecurringStore((s) => s.create)
  const update = useRecurringStore((s) => s.update)

  const [name, setName] = useState(recurring?.name ?? '')
  const [type, setType] = useState<TransactionType>(recurring?.type ?? 'expense')
  const [amount, setAmount] = useState(recurring ? formatAmountInputDE(recurring.amountCents) : '')
  const [categoryId, setCategoryId] = useState<string>(recurring?.categoryId ? String(recurring.categoryId) : '')
  const [dayOfMonth, setDayOfMonth] = useState(recurring ? String(recurring.dayOfMonth) : '1')
  const [startDate, setStartDate] = useState(recurring?.startDate ?? todayIso())
  const [endDate, setEndDate] = useState(recurring?.endDate ?? '')
  const [active, setActive] = useState(recurring?.active ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const filteredCategories = useMemo(() => categories.filter((c) => c.type === type), [categories, type])

  async function handleSubmit(): Promise<void> {
    const nextErrors: Record<string, string> = {}
    let amountCents = 0

    try {
      assertNonEmpty(name, 'Bezeichnung')
    } catch (err) {
      if (err instanceof ValidationError) nextErrors.name = err.message
    }
    try {
      amountCents = parseCurrencyDE(amount)
      if (amountCents <= 0) nextErrors.amount = 'Betrag muss größer als 0 sein.'
    } catch (err) {
      if (err instanceof ValidationError) nextErrors.amount = err.message
    }
    try {
      assertValidIsoDate(startDate, 'Startdatum')
    } catch (err) {
      if (err instanceof ValidationError) nextErrors.startDate = err.message
    }
    const day = Number(dayOfMonth)
    if (!Number.isInteger(day) || day < 1 || day > 28) {
      nextErrors.dayOfMonth = 'Tag muss zwischen 1 und 28 liegen.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    const input = {
      name,
      amountCents,
      type,
      categoryId: categoryId ? Number(categoryId) : null,
      dayOfMonth: day,
      startDate,
      endDate: endDate || null,
      active
    }
    const success = recurring ? await update(recurring.id, input) : await create(input)
    setSubmitting(false)
    if (success) onClose()
  }

  return (
    <Modal
      title={recurring ? 'Wiederkehrende Buchung bearbeiten' : 'Neue wiederkehrende Buchung'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Abbrechen
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {recurring ? 'Speichern' : 'Anlegen'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TextField
          label="Bezeichnung"
          placeholder="z. B. Miete, Gehalt, Netflix"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <div className="form-row">
          <SelectField
            label="Typ"
            value={type}
            onChange={(e) => {
              setType(e.target.value as TransactionType)
              setCategoryId('')
            }}
          >
            <option value="expense">Ausgabe</option>
            <option value="income">Einnahme</option>
          </SelectField>
          <TextField label="Betrag (€)" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} error={errors.amount} />
        </div>
        <div className="form-row">
          <SelectField label="Kategorie" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Ohne Kategorie</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Tag im Monat"
            type="number"
            min={1}
            max={28}
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            error={errors.dayOfMonth}
            hint="1–28, damit jeder Monat den Tag hat"
          />
        </div>
        <div className="form-row">
          <TextField label="Startdatum" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} error={errors.startDate} />
          <TextField label="Enddatum (optional)" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Aktiv (wird automatisch monatlich gebucht)
        </label>
      </div>
    </Modal>
  )
}
