import { useMemo, useState } from 'react'
import { Modal } from '@renderer/components/ui/Modal'
import { Button } from '@renderer/components/ui/Button'
import { SelectField } from '@renderer/components/ui/Field'
import { useCategoriesStore } from '@renderer/state/categoriesStore'
import { useTransactionsStore } from '@renderer/state/transactionsStore'
import { buildImportPreview, parseCsvFile, toBulkImportRows, type CsvImportPreviewRow } from '@renderer/lib/csvImport'
import { formatCurrencyDE, formatDateDE } from '@shared/format'
import type { CsvColumnMapping } from '@shared/types'

interface CsvImportModalProps {
  onClose: () => void
}

function guessColumn(headers: string[], candidates: string[]): string {
  const lower = headers.map((h) => h.toLowerCase())
  for (const candidate of candidates) {
    const idx = lower.findIndex((h) => h.includes(candidate))
    if (idx !== -1) return headers[idx]
  }
  return headers[0] ?? ''
}

export function CsvImportModal({ onClose }: CsvImportModalProps): JSX.Element {
  const categories = useCategoriesStore((s) => s.categories)
  const bulkImport = useTransactionsStore((s) => s.bulkImport)

  const [fileName, setFileName] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<CsvColumnMapping>({
    dateColumn: '',
    descriptionColumn: '',
    amountColumn: '',
    dateFormat: 'dd.MM.yyyy',
    decimalSeparator: ',',
    delimiter: ';'
  })
  const [categoryId, setCategoryId] = useState<string>('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)

  async function handleFile(file: File): Promise<void> {
    const text = await file.text()
    setFileName(file.name)
    parseWith(text, mapping.delimiter)
  }

  function parseWith(text: string, delimiter: CsvColumnMapping['delimiter']): void {
    const { headers: parsedHeaders, rows } = parseCsvFile(text, delimiter)
    setHeaders(parsedHeaders)
    setRawRows(rows)
    setMapping((prev) => ({
      ...prev,
      delimiter,
      dateColumn: guessColumn(parsedHeaders, ['datum', 'buchungstag', 'date']),
      descriptionColumn: guessColumn(parsedHeaders, ['verwendungszweck', 'buchungstext', 'beschreibung', 'description']),
      amountColumn: guessColumn(parsedHeaders, ['betrag', 'amount', 'umsatz'])
    }))
  }

  const preview: CsvImportPreviewRow[] = useMemo(() => {
    if (!mapping.dateColumn || !mapping.amountColumn) return []
    return buildImportPreview(rawRows, mapping)
  }, [rawRows, mapping])

  const validCount = preview.filter((r) => r.valid).length
  const invalidCount = preview.length - validCount

  async function handleImport(): Promise<void> {
    setImporting(true)
    const rows = toBulkImportRows(preview, categoryId ? Number(categoryId) : null)
    const res = await bulkImport(rows)
    setImporting(false)
    if (res) setResult(res)
  }

  return (
    <Modal
      title="CSV-Import: Kontoauszug"
      onClose={onClose}
      footer={
        result ? (
          <Button variant="primary" onClick={onClose}>
            Schließen
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} disabled={importing}>
              Abbrechen
            </Button>
            <Button variant="primary" onClick={handleImport} disabled={importing || validCount === 0}>
              {validCount} Buchung(en) importieren
            </Button>
          </>
        )
      }
    >
      {result ? (
        <div>
          <p>
            <strong>{result.imported}</strong> Buchung(en) erfolgreich importiert.
            {result.skipped > 0 && (
              <>
                {' '}
                <strong>{result.skipped}</strong> übersprungen.
              </>
            )}
          </p>
          {result.errors.length > 0 && (
            <div className="muted" style={{ fontSize: 12, marginTop: 8, maxHeight: 150, overflowY: 'auto' }}>
              {result.errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="field-label">CSV-Datei auswählen</label>
            <input
              type="file"
              accept=".csv,text/csv"
              className="input"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {fileName && <span className="muted">Datei: {fileName}</span>}
          </div>

          {headers.length > 0 && (
            <>
              <div className="form-row-3">
                <SelectField
                  label="Trennzeichen"
                  value={mapping.delimiter}
                  onChange={(e) => {
                    const delimiter = e.target.value as CsvColumnMapping['delimiter']
                    setMapping((prev) => ({ ...prev, delimiter }))
                  }}
                >
                  <option value=";">Semikolon (;)</option>
                  <option value=",">Komma (,)</option>
                  <option value="\t">Tabulator</option>
                </SelectField>
                <SelectField
                  label="Datumsformat"
                  value={mapping.dateFormat}
                  onChange={(e) => setMapping((prev) => ({ ...prev, dateFormat: e.target.value as CsvColumnMapping['dateFormat'] }))}
                >
                  <option value="dd.MM.yyyy">TT.MM.JJJJ</option>
                  <option value="yyyy-MM-dd">JJJJ-MM-TT</option>
                  <option value="MM/dd/yyyy">MM/TT/JJJJ</option>
                </SelectField>
                <SelectField
                  label="Dezimaltrennzeichen"
                  value={mapping.decimalSeparator}
                  onChange={(e) => setMapping((prev) => ({ ...prev, decimalSeparator: e.target.value as CsvColumnMapping['decimalSeparator'] }))}
                >
                  <option value=",">Komma (1.234,56)</option>
                  <option value=".">Punkt (1234.56)</option>
                </SelectField>
              </div>

              <div className="form-row-3">
                <SelectField
                  label="Spalte: Datum"
                  value={mapping.dateColumn}
                  onChange={(e) => setMapping((prev) => ({ ...prev, dateColumn: e.target.value }))}
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Spalte: Beschreibung"
                  value={mapping.descriptionColumn}
                  onChange={(e) => setMapping((prev) => ({ ...prev, descriptionColumn: e.target.value }))}
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Spalte: Betrag"
                  value={mapping.amountColumn}
                  onChange={(e) => setMapping((prev) => ({ ...prev, amountColumn: e.target.value }))}
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </SelectField>
              </div>

              <SelectField label="Zielkategorie (optional, für alle Zeilen)" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Ohne Kategorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectField>

              <div>
                <div className="section-title" style={{ marginBottom: 8 }}>
                  <span>
                    Vorschau ({validCount} gültig{invalidCount > 0 ? `, ${invalidCount} ungültig` : ''})
                  </span>
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Datum</th>
                        <th>Beschreibung</th>
                        <th>Typ</th>
                        <th className="align-right">Betrag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 12).map((row, i) => (
                        <tr key={i}>
                          <td className={row.valid ? '' : 'text-negative'}>{row.valid ? formatDateDE(row.date) : `${row.date || '–'} (${row.reason})`}</td>
                          <td>{row.description || '–'}</td>
                          <td className="muted">{row.valid ? (row.type === 'income' ? 'Einnahme' : 'Ausgabe') : '–'}</td>
                          <td className="align-right tabular">{row.valid ? formatCurrencyDE(row.amountCents) : '–'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
