import { useEffect, useState } from 'react'
import { Modal } from '@renderer/components/ui/Modal'
import { Button } from '@renderer/components/ui/Button'
import { notifyError } from '@renderer/state/toastStore'
import { formatCurrencyDE, formatDateDE } from '@shared/format'
import type { Transaction, TransactionAuditEntry } from '@shared/types'

interface TransactionHistoryModalProps {
  transaction: Transaction
  onClose: () => void
}

const FIELD_LABELS: Record<string, string> = {
  date: 'Datum',
  amount_cents: 'Betrag',
  type: 'Typ',
  category_id: 'Kategorie',
  description: 'Beschreibung',
  note: 'Notiz'
}

function formatValue(field: string, value: string | null): string {
  if (value === null) return '–'
  if (field === 'amount_cents') return formatCurrencyDE(Number(value))
  if (field === 'date') return formatDateDE(value)
  if (field === 'type') return value === 'income' ? 'Einnahme' : 'Ausgabe'
  return value
}

export function TransactionHistoryModal({ transaction, onClose }: TransactionHistoryModalProps): JSX.Element {
  const [entries, setEntries] = useState<TransactionAuditEntry[] | null>(null)

  useEffect(() => {
    window.api.transactions
      .auditLog(transaction.id)
      .then(setEntries)
      .catch((err) => {
        notifyError(err)
        setEntries([])
      })
  }, [transaction.id])

  return (
    <Modal title="Änderungshistorie" onClose={onClose} footer={<Button onClick={onClose}>Schließen</Button>}>
      <div className="muted" style={{ marginBottom: 14, fontSize: 12.5 }}>
        Erstellt am {new Date(transaction.createdAt).toLocaleString('de-DE')} · Zuletzt geändert am{' '}
        {new Date(transaction.updatedAt).toLocaleString('de-DE')}
      </div>

      {entries === null && <div className="empty-state">Lädt…</div>}
      {entries?.length === 0 && <div className="empty-state">Keine Änderungen seit der Erstellung.</div>}
      {entries && entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
          {entries.map((entry) => (
            <div key={entry.id} className="card card-tight" style={{ background: 'var(--color-bg-elevated)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <strong style={{ fontSize: 13 }}>{FIELD_LABELS[entry.field] ?? entry.field}</strong>
                <span className="muted" style={{ fontSize: 11.5 }}>
                  {new Date(entry.changedAt).toLocaleString('de-DE')}
                </span>
              </div>
              <div style={{ fontSize: 13 }}>
                <span className="text-negative">{formatValue(entry.field, entry.oldValue)}</span>
                <span className="muted"> → </span>
                <span className="text-positive">{formatValue(entry.field, entry.newValue)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
