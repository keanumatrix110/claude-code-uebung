import type { HTMLAttributes } from 'react'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={['card', className].filter(Boolean).join(' ')} {...rest} />
}
