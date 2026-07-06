import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { SummaryCards } from './components/SummaryCards'
import { CategoryBudgets } from './components/CategoryBudgets'
import { ExpenseBreakdownChart } from './components/ExpenseBreakdownChart'
import { TrendChart } from './components/TrendChart'
import { TransactionList } from './components/TransactionList'
import { TransactionModal } from './components/TransactionModal'
import { useBudgetStore } from './store/useBudgetStore'
import { useTheme } from './store/useTheme'
import { currentMonthKey, spentByCategory, totalByType, transactionsForMonth, trendData } from './lib/selectors'
import { shiftMonth } from './lib/format'
import type { Transaction } from './types'

function App() {
  const { categories, transactions, addTransaction, updateTransaction, deleteTransaction } =
    useBudgetStore()
  const [theme, toggleTheme] = useTheme()
  const [month, setMonth] = useState(currentMonthKey())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const monthTransactions = useMemo(() => transactionsForMonth(transactions, month), [transactions, month])
  const prevMonth = shiftMonth(month, -1)
  const prevMonthTransactions = useMemo(
    () => transactionsForMonth(transactions, prevMonth),
    [transactions, prevMonth],
  )

  const income = totalByType(monthTransactions, 'income')
  const expense = totalByType(monthTransactions, 'expense')
  const prevIncome = totalByType(prevMonthTransactions, 'income')
  const prevExpense = totalByType(prevMonthTransactions, 'expense')
  const spentMap = useMemo(() => spentByCategory(monthTransactions.filter((t) => t.type === 'expense')), [
    monthTransactions,
  ])
  const trend = useMemo(() => trendData(transactions, 6, month), [transactions, month])

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(t: Transaction) {
    setEditing(t)
    setModalOpen(true)
  }

  function handleSave(data: Omit<Transaction, 'id'>) {
    if (editing) {
      updateTransaction(editing.id, data)
    } else {
      addTransaction(data)
    }
    setModalOpen(false)
    setEditing(null)
  }

  return (
    <div className="min-h-full">
      <Header
        monthKey={month}
        onPrevMonth={() => setMonth((m) => shiftMonth(m, -1))}
        onNextMonth={() => setMonth((m) => shiftMonth(m, 1))}
        onAddTransaction={openAdd}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <SummaryCards income={income} expense={expense} prevIncome={prevIncome} prevExpense={prevExpense} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <TrendChart data={trend} />
            <CategoryBudgets categories={categories} spentByCategory={spentMap} />
          </div>
          <div className="flex flex-col gap-6">
            <ExpenseBreakdownChart categories={categories} spentByCategory={spentMap} />
          </div>
        </div>

        <TransactionList
          transactions={monthTransactions}
          categories={categories}
          onEdit={openEdit}
          onDelete={deleteTransaction}
        />
      </main>

      <TransactionModal
        open={modalOpen}
        categories={categories}
        initial={editing}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}

export default App
