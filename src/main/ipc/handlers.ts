import { type BrowserWindow, app, dialog, ipcMain } from 'electron'
import type Database from 'better-sqlite3'
import { format } from 'date-fns'
import { IPC } from '@shared/ipc-channels'
import * as categoriesRepo from '../db/repositories/categories'
import * as transactionsRepo from '../db/repositories/transactions'
import * as recurringRepo from '../db/repositories/recurring'
import * as savingsGoalsRepo from '../db/repositories/savingsGoals'
import * as investmentsRepo from '../db/repositories/investments'
import * as backupRepo from '../db/repositories/backup'
import { generateDueRecurringTransactions } from '../recurring/generateDue'
import { generateMonthlyReportPdf, generateYearlyReportPdf } from '../reports/pdf'
import { openDatabase, closeDatabase } from '../db'

export function registerIpcHandlers(getDb: () => Database.Database, dbFilePath: string, mainWindow: BrowserWindow): void {
  ipcMain.handle(IPC.categoriesList, () => categoriesRepo.listCategories(getDb()))
  ipcMain.handle(IPC.categoriesCreate, (_e, input: categoriesRepo.CategoryInput) =>
    categoriesRepo.createCategory(getDb(), input)
  )
  ipcMain.handle(IPC.categoriesUpdate, (_e, id: number, input: categoriesRepo.CategoryInput) =>
    categoriesRepo.updateCategory(getDb(), id, input)
  )
  ipcMain.handle(IPC.categoriesDelete, (_e, id: number) => categoriesRepo.deleteCategory(getDb(), id))

  ipcMain.handle(IPC.transactionsList, (_e, filter?: transactionsRepo.TransactionFilter) =>
    transactionsRepo.listTransactions(getDb(), filter)
  )
  ipcMain.handle(IPC.transactionsGet, (_e, id: number) => transactionsRepo.getTransaction(getDb(), id))
  ipcMain.handle(IPC.transactionsCreate, (_e, input: transactionsRepo.TransactionInput) =>
    transactionsRepo.createTransaction(getDb(), input)
  )
  ipcMain.handle(IPC.transactionsUpdate, (_e, id: number, input: transactionsRepo.TransactionInput) =>
    transactionsRepo.updateTransaction(getDb(), id, input)
  )
  ipcMain.handle(IPC.transactionsDelete, (_e, id: number) => transactionsRepo.deleteTransaction(getDb(), id))
  ipcMain.handle(IPC.transactionsAuditLog, (_e, transactionId: number) =>
    transactionsRepo.listTransactionAudit(getDb(), transactionId)
  )
  ipcMain.handle(IPC.transactionsBulkImport, (_e, rows: transactionsRepo.BulkImportRow[]) =>
    transactionsRepo.bulkImportTransactions(getDb(), rows)
  )

  ipcMain.handle(IPC.recurringList, () => recurringRepo.listRecurring(getDb()))
  ipcMain.handle(IPC.recurringCreate, (_e, input: recurringRepo.RecurringInput) =>
    recurringRepo.createRecurring(getDb(), input)
  )
  ipcMain.handle(IPC.recurringUpdate, (_e, id: number, input: recurringRepo.RecurringInput) =>
    recurringRepo.updateRecurring(getDb(), id, input)
  )
  ipcMain.handle(IPC.recurringDelete, (_e, id: number) => recurringRepo.deleteRecurring(getDb(), id))
  ipcMain.handle(IPC.recurringGenerateDue, () => generateDueRecurringTransactions(getDb()))

  ipcMain.handle(IPC.savingsGoalsList, () => savingsGoalsRepo.listSavingsGoals(getDb()))
  ipcMain.handle(IPC.savingsGoalsCreate, (_e, input: savingsGoalsRepo.SavingsGoalInput) =>
    savingsGoalsRepo.createSavingsGoal(getDb(), input)
  )
  ipcMain.handle(IPC.savingsGoalsUpdate, (_e, id: number, input: savingsGoalsRepo.SavingsGoalInput) =>
    savingsGoalsRepo.updateSavingsGoal(getDb(), id, input)
  )
  ipcMain.handle(IPC.savingsGoalsDelete, (_e, id: number) => savingsGoalsRepo.deleteSavingsGoal(getDb(), id))
  ipcMain.handle(IPC.savingsGoalsListContributions, (_e, goalId: number) =>
    savingsGoalsRepo.listContributions(getDb(), goalId)
  )
  ipcMain.handle(IPC.savingsGoalsCreateContribution, (_e, input: savingsGoalsRepo.SavingsContributionInput) =>
    savingsGoalsRepo.createContribution(getDb(), input)
  )
  ipcMain.handle(IPC.savingsGoalsDeleteContribution, (_e, id: number) =>
    savingsGoalsRepo.deleteContribution(getDb(), id)
  )

  ipcMain.handle(IPC.investmentsList, () => investmentsRepo.listInvestments(getDb()))
  ipcMain.handle(IPC.investmentsCreate, (_e, input: investmentsRepo.InvestmentInput) =>
    investmentsRepo.createInvestment(getDb(), input)
  )
  ipcMain.handle(IPC.investmentsUpdate, (_e, id: number, input: investmentsRepo.InvestmentInput) =>
    investmentsRepo.updateInvestment(getDb(), id, input)
  )
  ipcMain.handle(IPC.investmentsDelete, (_e, id: number) => investmentsRepo.deleteInvestment(getDb(), id))
  ipcMain.handle(IPC.investmentsListValuations, (_e, investmentId: number) =>
    investmentsRepo.listValuations(getDb(), investmentId)
  )
  ipcMain.handle(IPC.investmentsCreateValuation, (_e, input: investmentsRepo.InvestmentValuationInput) =>
    investmentsRepo.createValuation(getDb(), input)
  )
  ipcMain.handle(IPC.investmentsDeleteValuation, (_e, id: number) => investmentsRepo.deleteValuation(getDb(), id))

  ipcMain.handle(IPC.backupCreate, async () => {
    const defaultName = `finanzplaner-backup-${format(new Date(), 'yyyy-MM-dd_HHmm')}.sqlite3`
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Datenbank sichern',
      defaultPath: defaultName,
      filters: [{ name: 'SQLite-Datenbank', extensions: ['sqlite3'] }]
    })
    if (canceled || !filePath) return null
    const { sizeBytes } = backupRepo.checkpointAndCopy(getDb(), dbFilePath, filePath)
    return { path: filePath, createdAt: new Date().toISOString(), sizeBytes }
  })

  ipcMain.handle(IPC.backupRestore, async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Datenbank wiederherstellen',
      properties: ['openFile'],
      filters: [{ name: 'SQLite-Datenbank', extensions: ['sqlite3', 'db'] }]
    })
    if (canceled || filePaths.length === 0) return null

    const confirmation = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      buttons: ['Abbrechen', 'Wiederherstellen'],
      defaultId: 0,
      cancelId: 0,
      title: 'Datenbank wiederherstellen',
      message: 'Die aktuelle Datenbank wird durch die ausgewählte Sicherung ersetzt.',
      detail: 'Alle nicht gesicherten Änderungen gehen verloren. Dieser Vorgang kann nicht rückgängig gemacht werden.'
    })
    if (confirmation.response !== 1) return null

    closeDatabase()
    backupRepo.copyFileToDb(filePaths[0], dbFilePath)
    openDatabase(dbFilePath)
    return { restarted: true }
  })

  ipcMain.handle(IPC.backupExportCsv, async () => {
    const defaultName = `finanzplaner-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Buchungen als CSV exportieren',
      defaultPath: defaultName,
      filters: [{ name: 'CSV-Datei', extensions: ['csv'] }]
    })
    if (canceled || !filePath) return null
    const { rowCount } = backupRepo.exportTransactionsCsv(getDb(), filePath)
    return { path: filePath, rowCount }
  })

  ipcMain.handle(IPC.reportsGenerateMonthly, async (_e, year: number, month: number) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Monatsbericht exportieren',
      defaultPath: `monatsbericht-${year}-${month.toString().padStart(2, '0')}.pdf`,
      filters: [{ name: 'PDF-Dokument', extensions: ['pdf'] }]
    })
    if (canceled || !filePath) return null
    await generateMonthlyReportPdf(getDb(), year, month, filePath)
    return { path: filePath }
  })

  ipcMain.handle(IPC.reportsGenerateYearly, async (_e, year: number) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Jahresbericht exportieren',
      defaultPath: `jahresbericht-${year}.pdf`,
      filters: [{ name: 'PDF-Dokument', extensions: ['pdf'] }]
    })
    if (canceled || !filePath) return null
    await generateYearlyReportPdf(getDb(), year, filePath)
    return { path: filePath }
  })

  ipcMain.handle(IPC.appGetDbPath, () => dbFilePath)
  ipcMain.handle(IPC.appGetVersion, () => app.getVersion())
}
