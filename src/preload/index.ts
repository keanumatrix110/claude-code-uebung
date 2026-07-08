import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipc-channels'
import type { FinanzplanerApi } from '../shared/api'

const api: FinanzplanerApi = {
  categories: {
    list: () => ipcRenderer.invoke(IPC.categoriesList),
    create: (input) => ipcRenderer.invoke(IPC.categoriesCreate, input),
    update: (id, input) => ipcRenderer.invoke(IPC.categoriesUpdate, id, input),
    delete: (id) => ipcRenderer.invoke(IPC.categoriesDelete, id)
  },
  transactions: {
    list: (filter) => ipcRenderer.invoke(IPC.transactionsList, filter),
    get: (id) => ipcRenderer.invoke(IPC.transactionsGet, id),
    create: (input) => ipcRenderer.invoke(IPC.transactionsCreate, input),
    update: (id, input) => ipcRenderer.invoke(IPC.transactionsUpdate, id, input),
    delete: (id) => ipcRenderer.invoke(IPC.transactionsDelete, id),
    auditLog: (transactionId) => ipcRenderer.invoke(IPC.transactionsAuditLog, transactionId),
    bulkImport: (rows) => ipcRenderer.invoke(IPC.transactionsBulkImport, rows)
  },
  recurring: {
    list: () => ipcRenderer.invoke(IPC.recurringList),
    create: (input) => ipcRenderer.invoke(IPC.recurringCreate, input),
    update: (id, input) => ipcRenderer.invoke(IPC.recurringUpdate, id, input),
    delete: (id) => ipcRenderer.invoke(IPC.recurringDelete, id),
    generateDue: () => ipcRenderer.invoke(IPC.recurringGenerateDue)
  },
  savingsGoals: {
    list: () => ipcRenderer.invoke(IPC.savingsGoalsList),
    create: (input) => ipcRenderer.invoke(IPC.savingsGoalsCreate, input),
    update: (id, input) => ipcRenderer.invoke(IPC.savingsGoalsUpdate, id, input),
    delete: (id) => ipcRenderer.invoke(IPC.savingsGoalsDelete, id),
    listContributions: (goalId) => ipcRenderer.invoke(IPC.savingsGoalsListContributions, goalId),
    createContribution: (input) => ipcRenderer.invoke(IPC.savingsGoalsCreateContribution, input),
    deleteContribution: (id) => ipcRenderer.invoke(IPC.savingsGoalsDeleteContribution, id)
  },
  investments: {
    list: () => ipcRenderer.invoke(IPC.investmentsList),
    create: (input) => ipcRenderer.invoke(IPC.investmentsCreate, input),
    update: (id, input) => ipcRenderer.invoke(IPC.investmentsUpdate, id, input),
    delete: (id) => ipcRenderer.invoke(IPC.investmentsDelete, id),
    listValuations: (investmentId) => ipcRenderer.invoke(IPC.investmentsListValuations, investmentId),
    createValuation: (input) => ipcRenderer.invoke(IPC.investmentsCreateValuation, input),
    deleteValuation: (id) => ipcRenderer.invoke(IPC.investmentsDeleteValuation, id)
  },
  backup: {
    create: () => ipcRenderer.invoke(IPC.backupCreate),
    restore: () => ipcRenderer.invoke(IPC.backupRestore),
    exportCsv: () => ipcRenderer.invoke(IPC.backupExportCsv)
  },
  reports: {
    generateMonthly: (year, month) => ipcRenderer.invoke(IPC.reportsGenerateMonthly, year, month),
    generateYearly: (year) => ipcRenderer.invoke(IPC.reportsGenerateYearly, year)
  },
  app: {
    getDbPath: () => ipcRenderer.invoke(IPC.appGetDbPath),
    getVersion: () => ipcRenderer.invoke(IPC.appGetVersion)
  }
}

contextBridge.exposeInMainWorld('api', api)
