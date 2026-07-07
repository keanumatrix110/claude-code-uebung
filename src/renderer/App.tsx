import { useEffect, useState } from 'react'
import { Sidebar } from '@renderer/components/Sidebar'
import { ToastStack } from '@renderer/components/ui/ToastStack'
import { useCategoriesStore } from '@renderer/state/categoriesStore'
import { useTransactionsStore } from '@renderer/state/transactionsStore'
import { useRecurringStore } from '@renderer/state/recurringStore'
import { useSavingsGoalsStore } from '@renderer/state/savingsGoalsStore'
import { useInvestmentsStore } from '@renderer/state/investmentsStore'
import { DashboardPage } from '@renderer/pages/DashboardPage'
import { TransactionsPage } from '@renderer/pages/TransactionsPage'
import { MonthOverviewPage } from '@renderer/pages/MonthOverviewPage'
import { SavingsGoalsPage } from '@renderer/pages/SavingsGoalsPage'
import { InvestmentsPage } from '@renderer/pages/InvestmentsPage'
import { RecurringPage } from '@renderer/pages/RecurringPage'
import { ReportsPage } from '@renderer/pages/ReportsPage'
import { BackupPage } from '@renderer/pages/BackupPage'

export type View =
  | 'dashboard'
  | 'transactions'
  | 'month'
  | 'goals'
  | 'investments'
  | 'recurring'
  | 'reports'
  | 'backup'

function App(): JSX.Element {
  const [view, setView] = useState<View>('dashboard')

  useEffect(() => {
    void useCategoriesStore.getState().load()
    void useRecurringStore
      .getState()
      .generateDue()
      .then(() => useTransactionsStore.getState().load())
    void useSavingsGoalsStore.getState().load()
    void useInvestmentsStore.getState().load()
    void useRecurringStore.getState().load()
  }, [])

  return (
    <div className="app-shell">
      <Sidebar active={view} onSelect={setView} />
      <main className="app-main">
        {view === 'dashboard' && <DashboardPage onNavigate={setView} />}
        {view === 'transactions' && <TransactionsPage />}
        {view === 'month' && <MonthOverviewPage />}
        {view === 'goals' && <SavingsGoalsPage />}
        {view === 'investments' && <InvestmentsPage />}
        {view === 'recurring' && <RecurringPage />}
        {view === 'reports' && <ReportsPage />}
        {view === 'backup' && <BackupPage />}
      </main>
      <ToastStack />
    </div>
  )
}

export default App
