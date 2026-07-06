export type ColorSlot =
  | 'blue'
  | 'aqua'
  | 'yellow'
  | 'green'
  | 'violet'
  | 'red'
  | 'magenta'
  | 'orange'

export const CATEGORY_SLOTS: ColorSlot[] = [
  'blue',
  'aqua',
  'yellow',
  'green',
  'violet',
  'red',
  'magenta',
  'orange',
]

export const PALETTE: Record<'light' | 'dark', Record<ColorSlot, string>> = {
  light: {
    blue: '#2a78d6',
    aqua: '#1baf7a',
    yellow: '#eda100',
    green: '#008300',
    violet: '#4a3aa7',
    red: '#e34948',
    magenta: '#e87ba4',
    orange: '#eb6834',
  },
  dark: {
    blue: '#3987e5',
    aqua: '#199e70',
    yellow: '#c98500',
    green: '#008300',
    violet: '#9085e9',
    red: '#e66767',
    magenta: '#d55181',
    orange: '#d95926',
  },
}

export const STATUS = {
  light: { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b' },
  dark: { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b' },
}

export function resolveColor(slot: ColorSlot, mode: 'light' | 'dark'): string {
  return PALETTE[mode][slot]
}
