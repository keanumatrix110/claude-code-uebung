import { BrowserWindow, app, shell } from 'electron'
import { join } from 'node:path'
import { getDatabase, openDatabase, closeDatabase } from './db'
import { registerIpcHandlers } from './ipc/handlers'
import { generateDueRecurringTransactions } from './recurring/generateDue'

const isDev = !app.isPackaged

function getDbFilePath(): string {
  return join(app.getPath('userData'), 'finanzplaner.sqlite3')
}

function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0f1115',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(() => {
  const dbFilePath = getDbFilePath()
  openDatabase(dbFilePath)
  generateDueRecurringTransactions(getDatabase())

  const mainWindow = createMainWindow()
  registerIpcHandlers(getDatabase, dbFilePath, mainWindow)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  closeDatabase()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  closeDatabase()
})
