import { useState } from 'react'
import { Modal } from '@renderer/components/ui/Modal'
import { Button } from '@renderer/components/ui/Button'
import { TextField, SelectField } from '@renderer/components/ui/Field'
import { Badge } from '@renderer/components/ui/Badge'
import { TrashIcon } from '@renderer/components/icons'
import { useCategoriesStore } from '@renderer/state/categoriesStore'
import { ValidationError, assertNonEmpty } from '@shared/format'
import type { TransactionType } from '@shared/types'

interface CategoryManagerModalProps {
  onClose: () => void
}

const DEFAULT_COLOR = '#4c7cf0'

export function CategoryManagerModal({ onClose }: CategoryManagerModalProps): JSX.Element {
  const categories = useCategoriesStore((s) => s.categories)
  const create = useCategoriesStore((s) => s.create)
  const remove = useCategoriesStore((s) => s.remove)

  const [name, setName] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [isFixedCost, setIsFixedCost] = useState(false)
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [error, setError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  async function handleAdd(): Promise<void> {
    try {
      assertNonEmpty(name, 'Name')
    } catch (err) {
      if (err instanceof ValidationError) setError(err.message)
      return
    }
    setError(undefined)
    setSubmitting(true)
    const success = await create({ name, type, isFixedCost, color })
    setSubmitting(false)
    if (success) {
      setName('')
      setIsFixedCost(false)
    }
  }

  return (
    <Modal title="Kategorien verwalten" onClose={onClose} footer={<Button onClick={onClose}>Fertig</Button>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="card card-tight" style={{ background: 'var(--color-bg-elevated)' }}>
          <div className="form-row" style={{ marginBottom: 12 }}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} error={error} />
            <SelectField label="Typ" value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
              <option value="expense">Ausgabe</option>
              <option value="income">Einnahme</option>
            </SelectField>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, justifyContent: 'space-between' }}>
            <label className="checkbox-row">
              <input type="checkbox" checked={isFixedCost} onChange={(e) => setIsFixedCost(e.target.checked)} />
              Fixkosten
            </label>
            <label className="checkbox-row">
              Farbe
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 36, height: 28, border: 'none', background: 'none' }} />
            </label>
            <Button variant="primary" size="sm" onClick={handleAdd} disabled={submitting}>
              Hinzufügen
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          {categories.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 8,
                background: 'var(--color-bg-elevated)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Badge color={c.color} label={c.type === 'income' ? 'Einnahme' : 'Ausgabe'} />
                <span>{c.name}</span>
                {c.isFixedCost && <span className="tag-fixed">Fixkosten</span>}
              </div>
              <button className="icon-btn" onClick={() => remove(c.id)} aria-label="Löschen">
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
