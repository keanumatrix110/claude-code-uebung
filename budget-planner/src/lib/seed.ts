import type { Category, Transaction } from '../types'
import { monthKey, shiftMonth } from './format'

export const SEED_CATEGORIES: Category[] = [
  { id: 'cat-gehalt', name: 'Gehalt', icon: 'Wallet', color: 'green', type: 'income' },
  { id: 'cat-freelance', name: 'Freelance', icon: 'Laptop', color: 'blue', type: 'income' },
  { id: 'cat-sonst-einn', name: 'Sonstige Einnahmen', icon: 'PiggyBank', color: 'aqua', type: 'income' },

  { id: 'cat-wohnen', name: 'Wohnen', icon: 'Home', color: 'blue', type: 'expense', monthlyLimit: 1000 },
  { id: 'cat-lebensmittel', name: 'Lebensmittel', icon: 'ShoppingCart', color: 'aqua', type: 'expense', monthlyLimit: 450 },
  { id: 'cat-transport', name: 'Transport', icon: 'Car', color: 'yellow', type: 'expense', monthlyLimit: 180 },
  { id: 'cat-freizeit', name: 'Freizeit & Hobby', icon: 'Popcorn', color: 'violet', type: 'expense', monthlyLimit: 220 },
  { id: 'cat-gesundheit', name: 'Gesundheit', icon: 'HeartPulse', color: 'red', type: 'expense', monthlyLimit: 120 },
  { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBag', color: 'magenta', type: 'expense', monthlyLimit: 250 },
  { id: 'cat-sonstiges', name: 'Sonstiges', icon: 'MoreHorizontal', color: 'orange', type: 'expense', monthlyLimit: 150 },
]

function seededVariance(seed: number, spread: number): number {
  const x = Math.sin(seed * 999) * 10000
  const frac = x - Math.floor(x)
  return (frac - 0.5) * 2 * spread
}

export function generateSeedTransactions(referenceDate = new Date()): Transaction[] {
  const currentKey = monthKey(referenceDate)
  const transactions: Transaction[] = []

  for (let i = 5; i >= 0; i--) {
    const key = shiftMonth(currentKey, -i)
    const [year, month] = key.split('-').map(Number)
    const day = (d: number) => new Date(year, month - 1, d).toISOString()
    const seedBase = year * 12 + month

    transactions.push(
      { id: `${key}-inc-1`, type: 'income', amount: Math.round(3250 + seededVariance(seedBase + 1, 120)), categoryId: 'cat-gehalt', date: day(1), note: 'Monatsgehalt' },
      { id: `${key}-inc-2`, type: 'income', amount: Math.round(280 + seededVariance(seedBase + 2, 150)), categoryId: 'cat-freelance', date: day(14), note: 'Freelance-Projekt' },
      { id: `${key}-exp-1`, type: 'expense', amount: Math.round(950 + seededVariance(seedBase + 3, 20)), categoryId: 'cat-wohnen', date: day(3), note: 'Miete & Nebenkosten' },
      { id: `${key}-exp-2`, type: 'expense', amount: Math.round(380 + seededVariance(seedBase + 4, 60)), categoryId: 'cat-lebensmittel', date: day(8), note: 'Wocheneinkauf' },
      { id: `${key}-exp-3`, type: 'expense', amount: Math.round(120 + seededVariance(seedBase + 5, 40)), categoryId: 'cat-lebensmittel', date: day(21), note: 'Supermarkt' },
      { id: `${key}-exp-4`, type: 'expense', amount: Math.round(95 + seededVariance(seedBase + 6, 45)), categoryId: 'cat-transport', date: day(5), note: 'Tanken' },
      { id: `${key}-exp-5`, type: 'expense', amount: Math.round(65 + seededVariance(seedBase + 7, 55)), categoryId: 'cat-freizeit', date: day(17), note: 'Kino & Restaurant' },
      { id: `${key}-exp-6`, type: 'expense', amount: Math.round(70 + seededVariance(seedBase + 8, 60)), categoryId: 'cat-shopping', date: day(19), note: 'Kleidung' },
      { id: `${key}-exp-7`, type: 'expense', amount: Math.round(45 + seededVariance(seedBase + 9, 40)), categoryId: 'cat-sonstiges', date: day(24), note: 'Diverses' },
    )

    if (seedBase % 2 === 0) {
      transactions.push({
        id: `${key}-exp-8`,
        type: 'expense',
        amount: Math.round(60 + seededVariance(seedBase + 10, 30)),
        categoryId: 'cat-gesundheit',
        date: day(12),
        note: 'Apotheke',
      })
    }
  }

  return transactions
}
