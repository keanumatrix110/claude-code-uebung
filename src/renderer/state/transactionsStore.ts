import { create } from 'zustand'
import type { Transaction } from '@shared/types'
import type { BulkImportRow, BulkImportResult, TransactionInput } from '@shared/inputs'
import { notifyError, notifySuccess } from './toastStore'

interface TransactionsState {
  transactions: Transaction[]
  loading: boolean
  load: () => Promise<void>
  create: (input: TransactionInput) => Promise<boolean>
  update: (id: number, input: TransactionInput) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  bulkImport: (rows: BulkImportRow[]) => Promise<BulkImportResult | null>
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  loading: false,
  load: async () => {
    set({ loading: true })
    try {
      const transactions = await window.api.transactions.list()
      set({ transactions, loading: false })
    } catch (err) {
      set({ loading: false })
      notifyError(err)
    }
  },
  create: async (input) => {
    try {
      await window.api.transactions.create(input)
      await get().load()
      notifySuccess('Buchung wurde erfasst.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  update: async (id, input) => {
    try {
      await window.api.transactions.update(id, input)
      await get().load()
      notifySuccess('Buchung wurde aktualisiert.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  remove: async (id) => {
    try {
      await window.api.transactions.delete(id)
      await get().load()
      notifySuccess('Buchung wurde gelöscht.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  bulkImport: async (rows) => {
    try {
      const result = await window.api.transactions.bulkImport(rows)
      await get().load()
      notifySuccess(`${result.imported} Buchung(en) importiert${result.skipped > 0 ? `, ${result.skipped} übersprungen` : ''}.`)
      return result
    } catch (err) {
      notifyError(err)
      return null
    }
  }
}))
