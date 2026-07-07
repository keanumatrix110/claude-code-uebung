import { useMemo, useState } from 'react'
import { Card } from '@renderer/components/ui/Card'
import { Button } from '@renderer/components/ui/Button'
import { Badge } from '@renderer/components/ui/Badge'
import { ConfirmDialog } from '@renderer/components/ui/ConfirmDialog'
import { EditIcon, HistoryIcon, PlusIcon, TrashIcon, UploadIcon } from '@renderer/components/icons'
import { useCategoriesStore } from '@renderer/state/categoriesStore'
import { useTransactionsStore } from '@renderer/state/transactionsStore'
import { TransactionFormModal } from '@renderer/components/transactions/TransactionFormModal'
import { CategoryManagerModal } from '@renderer/components/transactions/CategoryManagerModal'
import { CsvImportModal } from '@renderer/components/transactions/CsvImportModal'
import { TransactionHistoryModal } from '@renderer/components/transactions/TransactionHistoryModal'
import { formatCurrencyDE, formatDateDE } from '@shared/format'
import type { Transaction, TransactionType } from '@shared/types'

export function TransactionsPage(): JSX.Element {
  const transactions = useTransactionsStore((s) => s.transactions)
  const categories = useCategoriesStore((s) => s.categories)
  const removeTransaction = useTransactionsStore((s) => s.remove)

  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Transaction | undefined>()
  const [showCategories, setShowCategories] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [historyFor, setHistoryFor] = useState<Transaction | undefined>()
  const [deleteCandidate, setDeleteCandidate] = useState<Transaction | undefined>()

  const categoryById = new Map(categories.map((c) => [c.id, c]))

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (categoryFilter && String(t.categoryId ?? '') !== categoryFilter) return false
      if (search.trim() && !t.description.toLowerCase().includes(search.trim().toLowerCase())) return false
      return true
    })
  }, [transactions, typeFilter, categoryFilter, search])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget & Ausgaben</h1>
          <p className="page-subtitle">{transactions.length} Buchungen erfasst</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" onClick={() => setShowCategories(true)}>
            Kategorien verwalten
          </Button>
          <Button variant="secondary" icon={<UploadIcon />} onClick={() => setShowImport(true)}>
            CSV-Import
          </Button>
          <Button
            variant="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setEditing(undefined)
              setShowForm(true)
            }}
          >
            Neue Buchung
          </Button>
        </div>
      </div>

      <Card>
        <div className="form-row-3" style={{ marginBottom: 18 }}>
          <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | TransactionType)}>
            <option value="all">Alle Typen</option>
            <option value="income">Einnahmen</option>
            <option value="expense">Ausgaben</option>
          </select>
          <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Alle Kategorien</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Beschreibung durchsuchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">Keine Buchungen gefunden.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Beschreibung</th>
                <th>Kategorie</th>
                <th className="align-right">Betrag</th>
                <th className="align-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const category = t.categoryId ? categoryById.get(t.categoryId) : undefined
                return (
                  <tr key={t.id}>
                    <td className="muted tabular">{formatDateDE(t.date)}</td>
                    <td>
                      {t.description || '–'}
                      {t.recurringId && <span className="tag-fixed" style={{ marginLeft: 8 }}>Automatisch</span>}
                    </td>
                    <td>
                      {category ? (
                        <Badge color={category.color} label={category.name} />
                      ) : (
                        <span className="muted">Ohne Kategorie</span>
                      )}
                    </td>
                    <td className={`align-right tabular ${t.type === 'income' ? 'text-positive' : 'text-negative'}`}>
                      {t.type === 'income' ? '+' : '−'}
                      {formatCurrencyDE(t.amountCents)}
                    </td>
                    <td className="align-right">
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button className="icon-btn" title="Verlauf" onClick={() => setHistoryFor(t)}>
                          <HistoryIcon />
                        </button>
                        <button
                          className="icon-btn"
                          title="Bearbeiten"
                          onClick={() => {
                            setEditing(t)
                            setShowForm(true)
                          }}
                        >
                          <EditIcon />
                        </button>
                        <button className="icon-btn" title="Löschen" onClick={() => setDeleteCandidate(t)}>
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      {showForm && (
        <TransactionFormModal
          transaction={editing}
          onClose={() => {
            setShowForm(false)
            setEditing(undefined)
          }}
        />
      )}
      {showCategories && <CategoryManagerModal onClose={() => setShowCategories(false)} />}
      {showImport && <CsvImportModal onClose={() => setShowImport(false)} />}
      {historyFor && <TransactionHistoryModal transaction={historyFor} onClose={() => setHistoryFor(undefined)} />}
      {deleteCandidate && (
        <ConfirmDialog
          title="Buchung löschen"
          message={`Möchtest du die Buchung "${deleteCandidate.description || 'ohne Beschreibung'}" über ${formatCurrencyDE(deleteCandidate.amountCents)} wirklich löschen?`}
          onCancel={() => setDeleteCandidate(undefined)}
          onConfirm={async () => {
            await removeTransaction(deleteCandidate.id)
            setDeleteCandidate(undefined)
          }}
        />
      )}
    </div>
  )
}
