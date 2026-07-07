export const IPC = {
  categoriesList: 'categories:list',
  categoriesCreate: 'categories:create',
  categoriesUpdate: 'categories:update',
  categoriesDelete: 'categories:delete',

  transactionsList: 'transactions:list',
  transactionsGet: 'transactions:get',
  transactionsCreate: 'transactions:create',
  transactionsUpdate: 'transactions:update',
  transactionsDelete: 'transactions:delete',
  transactionsAuditLog: 'transactions:auditLog',
  transactionsBulkImport: 'transactions:bulkImport',

  recurringList: 'recurring:list',
  recurringCreate: 'recurring:create',
  recurringUpdate: 'recurring:update',
  recurringDelete: 'recurring:delete',
  recurringGenerateDue: 'recurring:generateDue',

  savingsGoalsList: 'savingsGoals:list',
  savingsGoalsCreate: 'savingsGoals:create',
  savingsGoalsUpdate: 'savingsGoals:update',
  savingsGoalsDelete: 'savingsGoals:delete',
  savingsGoalsListContributions: 'savingsGoals:listContributions',
  savingsGoalsCreateContribution: 'savingsGoals:createContribution',
  savingsGoalsDeleteContribution: 'savingsGoals:deleteContribution',

  investmentsList: 'investments:list',
  investmentsCreate: 'investments:create',
  investmentsUpdate: 'investments:update',
  investmentsDelete: 'investments:delete',
  investmentsListValuations: 'investments:listValuations',
  investmentsCreateValuation: 'investments:createValuation',
  investmentsDeleteValuation: 'investments:deleteValuation',

  backupCreate: 'backup:create',
  backupRestore: 'backup:restore',
  backupExportCsv: 'backup:exportCsv',

  reportsGenerateMonthly: 'reports:generateMonthly',
  reportsGenerateYearly: 'reports:generateYearly',

  appGetDbPath: 'app:getDbPath',
  appGetVersion: 'app:getVersion'
} as const
