import { useId } from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'quiet'

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-sm px-5 font-semibold transition-opacity duration-[120ms] disabled:bg-sunken disabled:text-tertiary disabled:border-transparent'

const buttonVariants: Record<ButtonVariant, string> = {
  // Primary is iron fill with chalk text. Water is never a button fill.
  primary: 'bg-iron text-chalk',
  secondary: 'border border-hairline bg-transparent text-iron',
  quiet: 'bg-transparent text-rock',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  /** md = 48px, lg = 56px for client-facing screens. */
  size?: 'md' | 'lg'
}) {
  const height = size === 'lg' ? 'h-14' : 'h-12'
  return (
    <button
      className={`${buttonBase} ${buttonVariants[variant]} ${height} ${className}`}
      {...props}
    />
  )
}

export function Field({
  label,
  hint,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
}) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="type-detail font-medium text-iron">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-12 rounded-sm border border-hairline bg-raised px-4 type-body text-iron placeholder:text-tertiary ${
          // Invalid state is a 3px iron edge on the leading side, never red.
          error ? 'border-s-[3px] border-s-iron' : ''
        }`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="type-detail text-iron">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="type-detail text-rock">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/** One factual sentence and at most one button. */
export function EmptyState({
  message,
  action,
}: {
  message: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-md border border-hairline bg-raised p-6">
      <p className="type-body text-iron">{message}</p>
      {action}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-1 pb-6">
      {subtitle ? <p className="type-detail text-rock">{subtitle}</p> : null}
      <h1 className="type-title text-iron">{title}</h1>
    </header>
  )
}
