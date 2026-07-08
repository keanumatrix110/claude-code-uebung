import { create } from 'zustand'

export interface Toast {
  id: number
  type: 'error' | 'success'
  message: string
}

interface ToastState {
  toasts: Toast[]
  push: (type: Toast['type'], message: string) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (type, message) => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 5000)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}))

/** Extrahiert eine anzeigbare Fehlermeldung, auch aus über IPC serialisierten Errors. */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    // Electron IPC serialisiert Handler-Fehler als "Error invoking remote method 'x': ValidationError: <message>"
    const match = /Error invoking remote method '[^']+':\s*(?:\w*Error:\s*)?(.+)$/s.exec(err.message)
    return (match?.[1] ?? err.message).trim()
  }
  return 'Unbekannter Fehler.'
}

export function notifyError(err: unknown): void {
  useToastStore.getState().push('error', errorMessage(err))
}

export function notifySuccess(message: string): void {
  useToastStore.getState().push('success', message)
}
