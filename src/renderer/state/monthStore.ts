import { create } from 'zustand'

interface MonthState {
  year: number
  month: number // 1-12
  goToPrevious: () => void
  goToNext: () => void
  goToCurrent: () => void
  setYear: (year: number) => void
}

const now = new Date()

export const useMonthStore = create<MonthState>((set) => ({
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  goToPrevious: () =>
    set((state) => (state.month === 1 ? { year: state.year - 1, month: 12 } : { month: state.month - 1 })),
  goToNext: () =>
    set((state) => (state.month === 12 ? { year: state.year + 1, month: 1 } : { month: state.month + 1 })),
  goToCurrent: () => set({ year: now.getFullYear(), month: now.getMonth() + 1 }),
  setYear: (year) => set({ year })
}))
