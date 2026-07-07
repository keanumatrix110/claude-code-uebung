import { create } from 'zustand'
import type { SavingsContribution, SavingsGoal } from '@shared/types'
import type { SavingsContributionInput, SavingsGoalInput } from '@shared/inputs'
import { notifyError, notifySuccess } from './toastStore'

interface SavingsGoalsState {
  goals: SavingsGoal[]
  contributionsByGoal: Record<number, SavingsContribution[]>
  loading: boolean
  load: () => Promise<void>
  create: (input: SavingsGoalInput) => Promise<boolean>
  update: (id: number, input: SavingsGoalInput) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  loadContributions: (goalId: number) => Promise<void>
  addContribution: (input: SavingsContributionInput) => Promise<boolean>
  removeContribution: (id: number, goalId: number) => Promise<boolean>
}

export const useSavingsGoalsStore = create<SavingsGoalsState>((set, get) => ({
  goals: [],
  contributionsByGoal: {},
  loading: false,
  load: async () => {
    set({ loading: true })
    try {
      const goals = await window.api.savingsGoals.list()
      set({ goals, loading: false })
      await Promise.all(goals.map((g) => get().loadContributions(g.id)))
    } catch (err) {
      set({ loading: false })
      notifyError(err)
    }
  },
  create: async (input) => {
    try {
      await window.api.savingsGoals.create(input)
      await get().load()
      notifySuccess('Sparziel wurde angelegt.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  update: async (id, input) => {
    try {
      await window.api.savingsGoals.update(id, input)
      await get().load()
      notifySuccess('Sparziel wurde aktualisiert.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  remove: async (id) => {
    try {
      await window.api.savingsGoals.delete(id)
      await get().load()
      notifySuccess('Sparziel wurde gelöscht.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  loadContributions: async (goalId) => {
    try {
      const contributions = await window.api.savingsGoals.listContributions(goalId)
      set((state) => ({ contributionsByGoal: { ...state.contributionsByGoal, [goalId]: contributions } }))
    } catch (err) {
      notifyError(err)
    }
  },
  addContribution: async (input) => {
    try {
      await window.api.savingsGoals.createContribution(input)
      await get().loadContributions(input.goalId)
      notifySuccess('Beitrag wurde erfasst.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  },
  removeContribution: async (id, goalId) => {
    try {
      await window.api.savingsGoals.deleteContribution(id)
      await get().loadContributions(goalId)
      notifySuccess('Beitrag wurde gelöscht.')
      return true
    } catch (err) {
      notifyError(err)
      return false
    }
  }
}))
