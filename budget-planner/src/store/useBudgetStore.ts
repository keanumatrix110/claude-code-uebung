import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category, Transaction } from '../types'
import { SEED_CATEGORIES, generateSeedTransactions } from '../lib/seed'

interface BudgetState {
  categories: Category[]
  transactions: Transaction[]
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, t: Omit<Transaction, 'id'>) => void
  deleteTransaction: (id: string) => void
  addCategory: (c: Omit<Category, 'id'>) => void
  updateCategory: (id: string, c: Partial<Category>) => void
  deleteCategory: (id: string) => void
}

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      categories: SEED_CATEGORIES,
      transactions: generateSeedTransactions(),

      addTransaction: (t) =>
        set((state) => ({ transactions: [{ ...t, id: makeId() }, ...state.transactions] })),

      updateTransaction: (id, t) =>
        set((state) => ({
          transactions: state.transactions.map((tx) => (tx.id === id ? { ...t, id } : tx)),
        })),

      deleteTransaction: (id) =>
        set((state) => ({ transactions: state.transactions.filter((tx) => tx.id !== id) })),

      addCategory: (c) =>
        set((state) => ({ categories: [...state.categories, { ...c, id: makeId() }] })),

      updateCategory: (id, c) =>
        set((state) => ({
          categories: state.categories.map((cat) => (cat.id === id ? { ...cat, ...c } : cat)),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          transactions: state.transactions.filter((tx) => tx.categoryId !== id),
        })),
    }),
    {
      name: 'budget-planner-storage',
      version: 1,
    },
  ),
)
