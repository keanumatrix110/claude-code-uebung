import { create } from 'zustand'
import type { Category } from '@shared/types'
import type { CategoryInput } from '@shared/inputs'
import { notifyError, notifySuccess } from './toastStore'

interface CategoriesState {
  categories: Category[]
  loading: boolean
  load: () => Promise<void>
  create: (input: CategoryInput) => Promise<boolean>
  update: (id: number, input: CategoryInput) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  loading: false,
  load: async () => {
    set({ loading: true })
    try {
      const categories = await window.api.categories.list()
      set({ categories, loading: false })
    } catch (err) {
      set({ loading: false })
      notifyError(err)
    }
  },
  create: async (input) => {
    try {
      await window.api.categories.create(input)
      await get().load()
      notifySuccess('Kategorie wurde angelegt.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  update: async (id, input) => {
    try {
      await window.api.categories.update(id, input)
      await get().load()
      notifySuccess('Kategorie wurde aktualisiert.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  remove: async (id) => {
    try {
      await window.api.categories.delete(id)
      await get().load()
      notifySuccess('Kategorie wurde gelöscht.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  }
}))
