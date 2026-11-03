import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline'
  loading?: boolean
}

export default function Button({ variant = 'primary', loading, children, className = '', disabled, ...rest }: Props) {
  const styles =
    variant === 'primary'
      ? 'bg-navy-700 text-white hover:bg-navy-800'
      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 ${styles} ${className}`}
      {...rest}
    >
      {loading ? 'Please wait...' : children}
    </button>
  )
}