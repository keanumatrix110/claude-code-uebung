import type { View } from '@renderer/App'
import {
  BackupIcon,
  CalendarIcon,
  DashboardIcon,
  RefreshIcon,
  ReportIcon,
  TargetIcon,
  TransactionsIcon,
  TrendUpIcon
} from './icons'

interface NavEntry {
  id: View
  label: string
  icon: (props: { className?: string }) => JSX.Element
}

const NAV_ENTRIES: NavEntry[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'month', label: 'Monatsübersicht', icon: CalendarIcon },
  { id: 'transactions', label: 'Budget & Ausgaben', icon: TransactionsIcon },
  { id: 'goals', label: 'Sparziele', icon: TargetIcon },
  { id: 'investments', label: 'Investments', icon: TrendUpIcon },
  { id: 'recurring', label: 'Wiederkehrend', icon: RefreshIcon },
  { id: 'reports', label: 'Berichte', icon: ReportIcon },
  { id: 'backup', label: 'Backup', icon: BackupIcon }
]

interface SidebarProps {
  active: View
  onSelect: (view: View) => void
}

export function Sidebar({ active, onSelect }: SidebarProps): JSX.Element {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">F</div>
        <span className="sidebar-brand-text">Finanzplaner</span>
      </div>
      <div className="nav-group">
        {NAV_ENTRIES.map((entry) => (
          <button
            key={entry.id}
            className={`nav-item ${active === entry.id ? 'active' : ''}`}
            onClick={() => onSelect(entry.id)}
          >
            <entry.icon className="nav-icon" />
            {entry.label}
          </button>
        ))}
      </div>
      <div className="sidebar-footer">Lokale Datenhaltung · SQLite · Version 1.0</div>
    </nav>
  )
}
