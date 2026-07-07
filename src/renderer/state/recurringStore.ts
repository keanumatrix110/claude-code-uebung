import { create } from 'zustand'
import type { RecurringTransaction } from '@shared/types'
import type { RecurringInput } from '@shared/inputs'
import { notifyError, notifySuccess } from './toastStore'
import { useTransactionsStore } from './transactionsStore'

interface RecurringState {
  items: RecurringTransaction[]
  loading: boolean
  load: () => Promise<void>
  create: (input: RecurringInput) => Promise<boolean>
  update: (id: number, input: RecurringInput) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  generateDue: () => Promise<void>
}

export const useRecurringStore = create<RecurringState>((set, get) => ({
  items: [],
  loading: false,
  load: async () => {
    set({ loading: true })
    try {
      const items = await window.api.recurring.list()
      set({ items, loading: false })
    } catch (err) {
      set({ loading: false })
      notifyError(err)
    }
  },
  create: async (input) => {
    try {
      await window.api.recurring.create(input)
      await get().load()
      notifySuccess('Wiederkehrende Buchung wurde angelegt.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  update: async (id, input) => {
    try {
      await window.api.recurring.update(id, input)
      await get().load()
      notifySuccess('Wiederkehrende Buchung wurde aktualisiert.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  remove: async (id) => {
    try {
      await window.api.recurring.delete(id)
      await get().load()
      notifySuccess('Wiederkehrende Buchung wurde gelöscht.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  generateDue: async () => {
    try {
      const result = await window.api.recurring.generateDue()
      if (result.generatedCount > 0) {
        await useTransactionsStore.getState().load()
        notifySuccess(`${result.generatedCount} fällige Buchung(en) wurden automatisch erstellt.`)
      }
    } catch (err) {
      notifyError(err)
    }
  }
}))
