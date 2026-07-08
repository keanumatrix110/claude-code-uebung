import { useMemo, useState } from 'react'
import { Modal } from '@renderer/components/ui/Modal'
import { Button } from '@renderer/components/ui/Button'
import { TextField, SelectField, FieldWrapper } from '@renderer/components/ui/Field'
import { useCategoriesStore } from '@renderer/state/categoriesStore'
import { useTransactionsStore } from '@renderer/state/transactionsStore'
import { ValidationError, assertNonEmpty, assertValidIsoDate, formatAmountInputDE, parseCurrencyDE } from '@shared/format'
import type { Transaction, TransactionType } from '@shared/types'

interface TransactionFormModalProps {
  transaction?: Transaction
  onClose: () => void
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function TransactionFormModal({ transaction, onClose }: TransactionFormModalProps): JSX.Element {
  const categories = useCategoriesStore((s) => s.categories)
  const create = useTransactionsStore((s) => s.create)
  const update = useTransactionsStore((s) => s.update)

  const [date, setDate] = useState(transaction?.date ?? todayIso())
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense')
  const [amount, setAmount] = useState(transaction ? formatAmountInputDE(transaction.amountCents) : '')
  const [categoryId, setCategoryId] = useState<string>(transaction?.categoryId ? String(transaction.categoryId) : '')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [note, setNote] = useState(transaction?.note ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const filteredCategories = useMemo(() => categories.filter((c) => c.type === type), [categories, type])

  async function handleSubmit(): Promise<void> {
    const nextErrors: Record<string, string> = {}
    let amountCents = 0

    try {
      assertValidIsoDate(date, 'Datum')
    } catch (err) {
      if (err instanceof ValidationError) nextErrors.date = err.message
    }
    try {
      assertNonEmpty(description, 'Beschreibung')
    } catch (err) {
      if (err instanceof ValidationError) nextErrors.description = err.message
    }
    try {
      amountCents = parseCurrencyDE(amount)
      if (amountCents <= 0) {
        nextErrors.amount = 'Betrag muss größer als 0 sein.'
      }
    } catch (err) {
      if (err instanceof ValidationError) nextErrors.amount = err.message
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    const input = {
      date,
      amountCents,
      type,
      categoryId: categoryId ? Number(categoryId) : null,
      description,
      note: note.trim() ? note.trim() : null
    }
    const success = transaction ? await update(transaction.id, input) : await create(input)
    setSubmitting(false)
    if (success) onClose()
  }

  return (
    <Modal
      title={transaction ? 'Buchung bearbeiten' : 'Neue Buchung'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Abbrechen
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {transaction ? 'Speichern' : 'Buchung anlegen'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
          <TextField
            label="Datum"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />
        </div>

        <div className="form-row">
          <TextField
            label="Betrag (€)"
            placeholder="0,00"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
          />
          <SelectField label="Kategorie" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Ohne Kategorie</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.isFixedCost ? ' (Fixkosten)' : ''}
              </option>
            ))}
          </SelectField>
        </div>

        <TextField
          label="Beschreibung"
          placeholder="z. B. Supermarkt Einkauf"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />

        <FieldWrapper label="Notiz (optional)">
          <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </FieldWrapper>
      </div>
    </Modal>
  )
}
