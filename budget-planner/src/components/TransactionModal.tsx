import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Category, Transaction, TransactionType } from '../types'

interface TransactionModalProps {
  open: boolean
  categories: Category[]
  initial?: Transaction | null
  onClose: () => void
  onSave: (t: Omit<Transaction, 'id'>) => void
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function TransactionModal({ open, categories, initial, onClose, onSave }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(todayIso())
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const filteredCategories = categories.filter((c) => c.type === type)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setType(initial.type)
      setAmount(String(initial.amount))
      setCategoryId(initial.categoryId)
      setDate(initial.date.slice(0, 10))
      setNote(initial.note ?? '')
    } else {
      setType('expense')
      setAmount('')
      setCategoryId('')
      setDate(todayIso())
      setNote('')
    }
    setError('')
  }, [open, initial])

  useEffect(() => {
    if (!filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0]?.id ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = Number(amount.replace(',', '.'))
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Bitte einen gültigen Betrag angeben.')
      return
    }
    if (!categoryId) {
      setError('Bitte eine Kategorie wählen.')
      return
    }
    onSave({
      type,
      amount: Math.round(parsedAmount * 100) / 100,
      categoryId,
      date: new Date(date).toISOString(),
      note: note.trim() || undefined,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-in w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {initial ? 'Buchung bearbeiten' : 'Neue Buchung'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-lg p-1.5 text-[var(--ink-muted)] hover:bg-[var(--gridline)] hover:text-[var(--ink-primary)]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--page)] p-1">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={
                  'rounded-lg py-2 text-sm font-medium transition-colors ' +
                  (type === t
                    ? 'bg-[var(--surface-raised)] text-[var(--ink-primary)] shadow-sm'
                    : 'text-[var(--ink-muted)]')
                }
              >
                {t === 'expense' ? 'Ausgabe' : 'Einnahme'}
              </button>
            ))}
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Betrag (€)
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 py-2 text-base font-normal outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Kategorie
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 py-2 text-base font-normal outline-none focus:border-[var(--accent)]"
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Datum
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 py-2 text-base font-normal outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Notiz (optional)
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="z. B. Wocheneinkauf"
              className="rounded-xl border border-[var(--border)] bg-[var(--page)] px-3 py-2 text-base font-normal outline-none focus:border-[var(--accent)]"
            />
          </label>

          {error && <p className="text-sm font-medium text-[var(--critical)]">{error}</p>}

          <button
            type="submit"
            className="mt-2 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {initial ? 'Änderungen speichern' : 'Buchung hinzufügen'}
          </button>
        </form>
      </div>
    </div>
  )
}
