export type TransactionType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: TransactionType
  monthlyLimit?: number
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  categoryId: string
  date: string
  note?: string
}
