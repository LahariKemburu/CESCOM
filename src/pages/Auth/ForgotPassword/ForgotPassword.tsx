import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Input from '../../../components/common/Input'
import Button from '../../../components/common/Button'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault()
    setError('')
    if (!email.trim()) return setError('Email is required')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email')

    setLoading(true)
    // Mock only. Type "fail@test.com" to see the error state.
    setTimeout(() => {
      setLoading(false)
      if (email.toLowerCase() === 'fail@test.com') {
        setError('Something went wrong. Please try again.')
      } else {
        setSent(true)
      }
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {sent ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto mb-3 text-green-600" size={40} />
            <h1 className="text-xl font-semibold text-navy-800">Check your email</h1>
            <p className="mt-2 text-sm text-slate-600">
              If an account exists for {email}, a password reset link has been sent.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold text-navy-800">Forgot password?</h1>
              <p className="mt-1 text-sm text-slate-500">
                Enter your email and we'll send you a reset link
              </p>
            </div>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
              />
              <Button type="submit" loading={loading} className="w-full">
                Send reset link
              </Button>
            </form>
          </>
        )}

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-navy-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back to login
        </Link>
      </div>
    </div>
  )
}