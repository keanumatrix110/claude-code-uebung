import type { FinanzplanerApi } from '@shared/api'

declare global {
  interface Window {
    api: FinanzplanerApi
  }
}

export {}
