import { useState } from 'react'
import { Card } from '@renderer/components/ui/Card'
import { Button } from '@renderer/components/ui/Button'
import { SelectField } from '@renderer/components/ui/Field'
import { ReportIcon } from '@renderer/components/icons'
import { notifyError, notifySuccess } from '@renderer/state/toastStore'
import { formatMonthYearDE } from '@shared/format'

const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember'
]

function currentYear(): number {
  return new Date().getFullYear()
}

function yearOptions(): number[] {
  const y = currentYear()
  return [y - 2, y - 1, y, y + 1]
}

export function ReportsPage(): JSX.Element {
  const now = new Date()
  const [monthlyYear, setMonthlyYear] = useState(now.getFullYear())
  const [monthlyMonth, setMonthlyMonth] = useState(now.getMonth() + 1)
  const [yearlyYear, setYearlyYear] = useState(now.getFullYear())
  const [busy, setBusy] = useState<'monthly' | 'yearly' | null>(null)

  async function handleMonthly(): Promise<void> {
    setBusy('monthly')
    try {
      const result = await window.api.reports.generateMonthly(monthlyYear, monthlyMonth)
      if (result) notifySuccess(`Monatsbericht gespeichert: ${result.path}`)
    } catch (err) {
      notifyError(err)
    } finally {
      setBusy(null)
    }
  }

  async function handleYearly(): Promise<void> {
    setBusy('yearly')
    try {
      const result = await window.api.reports.generateYearly(yearlyYear)
      if (result) notifySuccess(`Jahresbericht gespeichert: ${result.path}`)
    } catch (err) {
      notifyError(err)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Berichte</h1>
          <p className="page-subtitle">Monats- und Jahresberichte als PDF exportieren</p>
        </div>
      </div>

      <div className="grid grid-2col">
        <Card>
          <div className="section-title">
            <span>Monatsbericht</span>
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginBottom: 16 }}>
            Bilanz, Kategorien, Sparquote und Fixkostenquote für {formatMonthYearDE(monthlyYear, monthlyMonth)}.
          </p>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <SelectField label="Monat" value={monthlyMonth} onChange={(e) => setMonthlyMonth(Number(e.target.value))}>
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Jahr" value={monthlyYear} onChange={(e) => setMonthlyYear(Number(e.target.value))}>
              {yearOptions().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </SelectField>
          </div>
          <Button variant="primary" icon={<ReportIcon />} disabled={busy !== null} onClick={handleMonthly}>
            {busy === 'monthly' ? 'Erstelle…' : 'Monatsbericht als PDF exportieren'}
          </Button>
        </Card>

        <Card>
          <div className="section-title">
            <span>Jahresbericht</span>
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginBottom: 16 }}>
            Jahresbilanz, Monatsübersicht und Kategorien für das gesamte Kalenderjahr {yearlyYear}.
          </p>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <SelectField label="Jahr" value={yearlyYear} onChange={(e) => setYearlyYear(Number(e.target.value))}>
              {yearOptions().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </SelectField>
          </div>
          <Button variant="primary" icon={<ReportIcon />} disabled={busy !== null} onClick={handleYearly}>
            {busy === 'yearly' ? 'Erstelle…' : 'Jahresbericht als PDF exportieren'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
