import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@renderer/components/ui/Card'
import { Button } from '@renderer/components/ui/Button'
import { StatTile } from '@renderer/components/ui/StatTile'
import { ConfirmDialog } from '@renderer/components/ui/ConfirmDialog'
import { EditIcon, PlusIcon, TrashIcon } from '@renderer/components/icons'
import { useInvestmentsStore } from '@renderer/state/investmentsStore'
import { InvestmentFormModal } from '@renderer/components/investments/InvestmentFormModal'
import { ValuationModal } from '@renderer/components/investments/ValuationModal'
import { computeInvestmentPerformance, computePortfolioTotalValue } from '@shared/calculations'
import { formatCurrencyDE, formatDateDE, formatPercentDE } from '@shared/format'
import type { Investment, InvestmentType } from '@shared/types'

const TYPE_LABELS: Record<InvestmentType, string> = {
  stock: 'Aktie',
  etf: 'ETF',
  fund: 'Fonds',
  bond: 'Anleihe',
  crypto: 'Krypto',
  other: 'Sonstiges'
}

export function InvestmentsPage(): JSX.Element {
  const investments = useInvestmentsStore((s) => s.investments)
  const valuationsByInvestment = useInvestmentsStore((s) => s.valuationsByInvestment)
  const removeInvestment = useInvestmentsStore((s) => s.remove)
  const removeValuation = useInvestmentsStore((s) => s.removeValuation)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Investment | undefined>()
  const [valuationFor, setValuationFor] = useState<Investment | undefined>()
  const [deleteCandidate, setDeleteCandidate] = useState<Investment | undefined>()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const portfolioValueCents = useMemo(() => {
    const map = new Map(investments.map((i) => [i.id, valuationsByInvestment[i.id] ?? []]))
    return computePortfolioTotalValue(investments, map)
  }, [investments, valuationsByInvestment])

  const selected = investments.find((i) => i.id === selectedId) ?? investments[0]
  const selectedValuations = selected ? valuationsByInvestment[selected.id] ?? [] : []
  const performance = computeInvestmentPerformance(selectedValuations)
  const chartData = selectedValuations.map((v) => ({ date: formatDateDE(v.date), Wert: v.valueCents / 100 }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Investments</h1>
          <p className="page-subtitle">Depot-Positionen und Wertentwicklung</p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setEditing(undefined)
              setShowForm(true)
            }}
          >
            Neue Position
          </Button>
        </div>
      </div>

      <div className="grid grid-stats section">
        <StatTile label="Depotwert gesamt" value={formatCurrencyDE(portfolioValueCents)} tone="accent" />
        <StatTile label="Positionen" value={String(investments.length)} />
        {performance && (
          <StatTile
            label={`Entwicklung: ${selected?.name ?? ''}`}
            value={formatPercentDE(performance.percentChange)}
            tone={performance.percentChange >= 0 ? 'positive' : 'negative'}
            meta={`${performance.absoluteChangeCents >= 0 ? '+' : ''}${formatCurrencyDE(performance.absoluteChangeCents)}`}
          />
        )}
      </div>

      {investments.length === 0 ? (
        <div className="empty-state">Noch keine Positionen im Depot.</div>
      ) : (
        <div className="grid grid-2col">
          <Card>
            <div className="section-title">
              <span>Positionen</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Typ</th>
                  <th className="align-right">Stück</th>
                  <th className="align-right">Wert</th>
                  <th className="align-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => {
                  const valuations = valuationsByInvestment[inv.id] ?? []
                  const latest = [...valuations].sort((a, b) => b.date.localeCompare(a.date))[0]
                  return (
                    <tr
                      key={inv.id}
                      className="clickable"
                      onClick={() => setSelectedId(inv.id)}
                      style={{ background: selected?.id === inv.id ? 'var(--color-surface-hover)' : undefined }}
                    >
                      <td>
                        {inv.name}
                        {inv.ticker && <span className="muted"> · {inv.ticker}</span>}
                      </td>
                      <td className="muted">{TYPE_LABELS[inv.type]}</td>
                      <td className="align-right tabular">{inv.quantity}</td>
                      <td className="align-right tabular">{latest ? formatCurrencyDE(latest.valueCents) : '–'}</td>
                      <td className="align-right">
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                          <button className="icon-btn" title="Wertstand erfassen" onClick={() => setValuationFor(inv)}>
                            +€
                          </button>
                          <button
                            className="icon-btn"
                            title="Bearbeiten"
                            onClick={() => {
                              setEditing(inv)
                              setShowForm(true)
                            }}
                          >
                            <EditIcon />
                          </button>
                          <button className="icon-btn" title="Löschen" onClick={() => setDeleteCandidate(inv)}>
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>

          <Card>
            <div className="section-title">
              <span>Wertentwicklung {selected ? `– ${selected.name}` : ''}</span>
            </div>
            {selectedValuations.length === 0 ? (
              <div className="empty-state">Noch keine Wertstände erfasst.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262c38" />
                    <XAxis dataKey="date" stroke="#8b93a3" fontSize={11} />
                    <YAxis stroke="#8b93a3" fontSize={11} tickFormatter={(v: number) => `${v.toLocaleString('de-DE')} €`} />
                    <Tooltip
                      formatter={(value: number) => `${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`}
                      contentStyle={{ background: '#181c24', border: '1px solid #262c38', borderRadius: 8 }}
                      labelStyle={{ color: '#e8eaed' }}
                    />
                    <Line type="monotone" dataKey="Wert" stroke="#4c7cf0" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
                <table className="data-table" style={{ marginTop: 12 }}>
                  <tbody>
                    {[...selectedValuations]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((v) => (
                        <tr key={v.id}>
                          <td className="muted tabular">{formatDateDE(v.date)}</td>
                          <td className="align-right tabular">{formatCurrencyDE(v.valueCents)}</td>
                          <td className="align-right">
                            <button className="icon-btn" onClick={() => selected && removeValuation(v.id, selected.id)}>
                              <TrashIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </>
            )}
          </Card>
        </div>
      )}

      {showForm && (
        <InvestmentFormModal
          investment={editing}
          onClose={() => {
            setShowForm(false)
            setEditing(undefined)
          }}
        />
      )}
      {valuationFor && <ValuationModal investment={valuationFor} onClose={() => setValuationFor(undefined)} />}
      {deleteCandidate && (
        <ConfirmDialog
          title="Position löschen"
          message={`Möchtest du die Position "${deleteCandidate.name}" inklusive aller Wertstände wirklich löschen?`}
          onCancel={() => setDeleteCandidate(undefined)}
          onConfirm={async () => {
            await removeInvestment(deleteCandidate.id)
            setDeleteCandidate(undefined)
          }}
        />
      )}
    </div>
  )
}
