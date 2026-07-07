import type {
  BackupInfo,
  Category,
  Investment,
  InvestmentValuation,
  RecurringTransaction,
  SavingsContribution,
  SavingsGoal,
  Transaction,
  TransactionAuditEntry
} from './types'
import type {
  BulkImportResult,
  BulkImportRow,
  CategoryInput,
  GenerateDueResult,
  InvestmentInput,
  InvestmentValuationInput,
  RecurringInput,
  SavingsContributionInput,
  SavingsGoalInput,
  TransactionFilter,
  TransactionInput
} from './inputs'

export type BulkImportRowInput = BulkImportRow

/** Vollständige, typsichere IPC-Oberfläche, die im Renderer als `window.api` verfügbar ist. */
export interface FinanzplanerApi {
  categories: {
    list(): Promise<Category[]>
    create(input: CategoryInput): Promise<Category>
    update(id: number, input: CategoryInput): Promise<Category>
    delete(id: number): Promise<void>
  }
  transactions: {
    list(filter?: TransactionFilter): Promise<Transaction[]>
    get(id: number): Promise<Transaction>
    create(input: TransactionInput): Promise<Transaction>
    update(id: number, input: TransactionInput): Promise<Transaction>
    delete(id: number): Promise<void>
    auditLog(transactionId: number): Promise<TransactionAuditEntry[]>
    bulkImport(rows: BulkImportRowInput[]): Promise<BulkImportResult>
  }
  recurring: {
    list(): Promise<RecurringTransaction[]>
    create(input: RecurringInput): Promise<RecurringTransaction>
    update(id: number, input: RecurringInput): Promise<RecurringTransaction>
    delete(id: number): Promise<void>
    generateDue(): Promise<GenerateDueResult>
  }
  savingsGoals: {
    list(): Promise<SavingsGoal[]>
    create(input: SavingsGoalInput): Promise<SavingsGoal>
    update(id: number, input: SavingsGoalInput): Promise<SavingsGoal>
    delete(id: number): Promise<void>
    listContributions(goalId: number): Promise<SavingsContribution[]>
    createContribution(input: SavingsContributionInput): Promise<SavingsContribution>
    deleteContribution(id: number): Promise<void>
  }
  investments: {
    list(): Promise<Investment[]>
    create(input: InvestmentInput): Promise<Investment>
    update(id: number, input: InvestmentInput): Promise<Investment>
    delete(id: number): Promise<void>
    listValuations(investmentId: number): Promise<InvestmentValuation[]>
    createValuation(input: InvestmentValuationInput): Promise<InvestmentValuation>
    deleteValuation(id: number): Promise<void>
  }
  backup: {
    create(): Promise<BackupInfo | null>
    restore(): Promise<{ restarted: boolean } | null>
    exportCsv(): Promise<{ path: string; rowCount: number } | null>
  }
  reports: {
    generateMonthly(year: number, month: number): Promise<{ path: string } | null>
    generateYearly(year: number): Promise<{ path: string } | null>
  }
  app: {
    getDbPath(): Promise<string>
    getVersion(): Promise<string>
  }
}
