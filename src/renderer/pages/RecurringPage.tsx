import { useState } from 'react'
import { Card } from '@renderer/components/ui/Card'
import { Button } from '@renderer/components/ui/Button'
import { ConfirmDialog } from '@renderer/components/ui/ConfirmDialog'
import { EditIcon, PlusIcon, RefreshIcon, TrashIcon } from '@renderer/components/icons'
import { useCategoriesStore } from '@renderer/state/categoriesStore'
import { useRecurringStore } from '@renderer/state/recurringStore'
import { RecurringFormModal } from '@renderer/components/recurring/RecurringFormModal'
import { formatCurrencyDE, formatDateDE } from '@shared/format'
import type { RecurringTransaction } from '@shared/types'

export function RecurringPage(): JSX.Element {
  const items = useRecurringStore((s) => s.items)
  const removeRecurring = useRecurringStore((s) => s.remove)
  const generateDue = useRecurringStore((s) => s.generateDue)
  const categories = useCategoriesStore((s) => s.categories)
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RecurringTransaction | undefined>()
  const [deleteCandidate, setDeleteCandidate] = useState<RecurringTransaction | undefined>()
  const [checking, setChecking] = useState(false)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Wiederkehrende Buchungen</h1>
          <p className="page-subtitle">Miete, Gehalt und Abos werden automatisch monatlich gebucht</p>
        </div>
        <div className="page-actions">
          <Button
            variant="secondary"
            icon={<RefreshIcon />}
            disabled={checking}
            onClick={async () => {
              setChecking(true)
              await generateDue()
              setChecking(false)
            }}
          >
            Fällige Buchungen prüfen
          </Button>
          <Button
            variant="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setEditing(undefined)
              setShowForm(true)
            }}
          >
            Neue wiederkehrende Buchung
          </Button>
        </div>
      </div>

      <Card>
        {items.length === 0 ? (
          <div className="empty-state">Noch keine wiederkehrenden Buchungen angelegt.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Bezeichnung</th>
                <th>Kategorie</th>
                <th>Tag</th>
                <th>Zeitraum</th>
                <th>Status</th>
                <th className="align-right">Betrag</th>
                <th className="align-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="muted">{item.categoryId ? categoryById.get(item.categoryId)?.name ?? '–' : '–'}</td>
                  <td className="tabular">{item.dayOfMonth}.</td>
                  <td className="muted tabular">
                    {formatDateDE(item.startDate)} – {item.endDate ? formatDateDE(item.endDate) : 'offen'}
                  </td>
                  <td>
                    <span className={`badge`} style={{ background: item.active ? 'var(--color-positive-soft)' : 'var(--color-bg-elevated)', color: item.active ? 'var(--color-positive)' : 'var(--color-text-faint)' }}>
                      {item.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className={`align-right tabular ${item.type === 'income' ? 'text-positive' : 'text-negative'}`}>
                    {item.type === 'income' ? '+' : '−'}
                    {formatCurrencyDE(item.amountCents)}
                  </td>
                  <td className="align-right">
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setEditing(item)
                          setShowForm(true)
                        }}
                      >
                        <EditIcon />
                      </button>
                      <button className="icon-btn" onClick={() => setDeleteCandidate(item)}>
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showForm && (
        <RecurringFormModal
          recurring={editing}
          onClose={() => {
            setShowForm(false)
            setEditing(undefined)
          }}
        />
      )}
      {deleteCandidate && (
        <ConfirmDialog
          title="Wiederkehrende Buchung löschen"
          message={`Möchtest du "${deleteCandidate.name}" wirklich löschen? Bereits gebuchte Buchungen bleiben erhalten.`}
          onCancel={() => setDeleteCandidate(undefined)}
          onConfirm={async () => {
            await removeRecurring(deleteCandidate.id)
            setDeleteCandidate(undefined)
          }}
        />
      )}
    </div>
  )
}
