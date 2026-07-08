import { create } from 'zustand'
import type { Investment, InvestmentValuation } from '@shared/types'
import type { InvestmentInput, InvestmentValuationInput } from '@shared/inputs'
import { notifyError, notifySuccess } from './toastStore'

interface InvestmentsState {
  investments: Investment[]
  valuationsByInvestment: Record<number, InvestmentValuation[]>
  loading: boolean
  load: () => Promise<void>
  create: (input: InvestmentInput) => Promise<boolean>
  update: (id: number, input: InvestmentInput) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  loadValuations: (investmentId: number) => Promise<void>
  addValuation: (input: InvestmentValuationInput) => Promise<boolean>
  removeValuation: (id: number, investmentId: number) => Promise<boolean>
}

export const useInvestmentsStore = create<InvestmentsState>((set, get) => ({
  investments: [],
  valuationsByInvestment: {},
  loading: false,
  load: async () => {
    set({ loading: true })
    try {
      const investments = await window.api.investments.list()
      set({ investments, loading: false })
      await Promise.all(investments.map((i) => get().loadValuations(i.id)))
    } catch (err) {
      set({ loading: false })
      notifyError(err)
    }
  },
  create: async (input) => {
    try {
      await window.api.investments.create(input)
      await get().load()
      notifySuccess('Position wurde angelegt.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  update: async (id, input) => {
    try {
      await window.api.investments.update(id, input)
      await get().load()
      notifySuccess('Position wurde aktualisiert.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  remove: async (id) => {
    try {
      await window.api.investments.delete(id)
      await get().load()
      notifySuccess('Position wurde gelöscht.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  loadValuations: async (investmentId) => {
    try {
      const valuations = await window.api.investments.listValuations(investmentId)
      set((state) => ({ valuationsByInvestment: { ...state.valuationsByInvestment, [investmentId]: valuations } }))
    } catch (err) {
      notifyError(err)
    }
  },
  addValuation: async (input) => {
    try {
      await window.api.investments.createValuation(input)
      await get().loadValuations(input.investmentId)
      notifySuccess('Wertstand wurde erfasst.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  removeValuation: async (id, investmentId) => {
    try {
      await window.api.investments.deleteValuation(id)
      await get().loadValuations(investmentId)
      notifySuccess('Wertstand wurde gelöscht.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  }
}))
