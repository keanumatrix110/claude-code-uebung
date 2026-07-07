import { useEffect, useState } from 'react'
import { Card } from '@renderer/components/ui/Card'
import { Button } from '@renderer/components/ui/Button'
import { StatTile } from '@renderer/components/ui/StatTile'
import { BackupIcon } from '@renderer/components/icons'
import { notifyError, notifySuccess } from '@renderer/state/toastStore'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function BackupPage(): JSX.Element {
  const [dbPath, setDbPath] = useState<string>('')
  const [busy, setBusy] = useState<'backup' | 'restore' | 'export' | null>(null)
  const [lastBackup, setLastBackup] = useState<{ path: string; sizeBytes: number; createdAt: string } | null>(null)

  useEffect(() => {
    window.api.app.getDbPath().then(setDbPath).catch(notifyError)
  }, [])

  async function handleBackup(): Promise<void> {
    setBusy('backup')
    try {
      const result = await window.api.backup.create()
      if (result) {
        setLastBackup(result)
        notifySuccess(`Backup gespeichert: ${result.path}`)
      }
    } catch (err) {
      notifyError(err)
    } finally {
      setBusy(null)
    }
  }

  async function handleRestore(): Promise<void> {
    setBusy('restore')
    try {
      const result = await window.api.backup.restore()
      if (result?.restarted) {
        notifySuccess('Datenbank wiederhergestellt. Die Ansicht wird neu geladen…')
        setTimeout(() => window.location.reload(), 900)
      }
    } catch (err) {
      notifyError(err)
    } finally {
      setBusy(null)
    }
  }

  async function handleExportCsv(): Promise<void> {
    setBusy('export')
    try {
      const result = await window.api.backup.exportCsv()
      if (result) {
        notifySuccess(`${result.rowCount} Buchungen exportiert nach: ${result.path}`)
      }
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
          <h1 className="page-title">Backup</h1>
          <p className="page-subtitle">Datenbank sichern, wiederherstellen und exportieren</p>
        </div>
      </div>

      <div className="grid grid-2col">
        <Card>
          <div className="section-title">
            <span>Datenbank</span>
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginBottom: 16, wordBreak: 'break-all' }}>
            Speicherort: {dbPath || '…'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="primary" icon={<BackupIcon />} disabled={busy !== null} onClick={handleBackup}>
              {busy === 'backup' ? 'Sichere…' : 'Datenbank sichern'}
            </Button>
            <Button variant="secondary" disabled={busy !== null} onClick={handleRestore}>
              {busy === 'restore' ? 'Stelle wieder her…' : 'Datenbank wiederherstellen'}
            </Button>
            <Button variant="secondary" disabled={busy !== null} onClick={handleExportCsv}>
              {busy === 'export' ? 'Exportiere…' : 'Buchungen als CSV exportieren'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="section-title">
            <span>Letztes Backup (diese Sitzung)</span>
          </div>
          {lastBackup ? (
            <div className="grid grid-stats">
              <StatTile label="Größe" value={formatBytes(lastBackup.sizeBytes)} />
              <StatTile label="Erstellt" value={new Date(lastBackup.createdAt).toLocaleTimeString('de-DE')} />
            </div>
          ) : (
            <div className="empty-state">Noch kein Backup in dieser Sitzung erstellt.</div>
          )}
          <p className="muted" style={{ fontSize: 12, marginTop: 16 }}>
            Alle Daten werden ausschließlich lokal in einer SQLite-Datenbank gespeichert – es findet keine
            Cloud-Übertragung statt. Regelmäßige Backups werden empfohlen.
          </p>
        </Card>
      </div>
    </div>
  )
}
