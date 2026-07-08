import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

interface FieldWrapperProps {
  label: string
  error?: string
  children: ReactNode
  hint?: string
}

export function FieldWrapper({ label, error, children, hint }: FieldWrapperProps): JSX.Element {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="muted">{hint}</span> : null}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, className, ...rest }: TextFieldProps): JSX.Element {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <input className={['input', error ? 'has-error' : '', className].filter(Boolean).join(' ')} {...rest} />
    </FieldWrapper>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  hint?: string
}

export function SelectField({ label, error, hint, className, children, ...rest }: SelectFieldProps): JSX.Element {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <select className={['select', error ? 'has-error' : '', className].filter(Boolean).join(' ')} {...rest}>
        {children}
      </select>
    </FieldWrapper>
  )
}
