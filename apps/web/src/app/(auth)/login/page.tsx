'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthTerminal, TerminalInput, TerminalButton } from '@/components/auth'

type Step = 'email' | 'password' | 'submit'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const registered = searchParams.get('registered')
    const emailParam = searchParams.get('email')

    if (registered === 'true' && emailParam) {
      setSuccessMessage('Регистрация успешна! Проверьте почту и подтвердите email перед входом.')
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleEmailSubmit = () => {
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    setError('')
    setStep('password')
  }

  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      setError('Password is required')
      return
    }
    setError('')
    setStep('submit')
  }

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const errorMessage = error.message === 'Email not confirmed'
          ? 'Email не подтверждён. Проверьте почту.'
          : error.message
        setError(errorMessage)
        setLoading(false)
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const role = userData?.role

      if (role === 'owner') {
        window.location.href = '/dashboard'
      } else if (role === 'manager') {
        window.location.href = '/manager'
      } else if (role === 'client') {
        window.location.href = '/client'
      } else {
        window.location.href = '/'
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('email')
  }

  return (
    <AuthTerminal
      title="~/auth-login"
      error={error}
      success={successMessage}
    >
      {searchParams.get('error') === 'email_confirmation_failed' && (
        <div className="text-sm font-mono text-yellow-400">
          <span className="font-bold">[warning]</span> Email confirmation failed. Please try to confirm your email again or contact support.
        </div>
      )}

      {step === 'email' && (
        <TerminalInput
          label="enter email :"
          value={email}
          onChange={setEmail}
          onSubmit={handleEmailSubmit}
          type="email"
          autoFocus
        />
      )}

      {step === 'password' && (
        <div className="space-y-4">
          <div className="text-sm font-mono text-muted-foreground">
            <span className="text-terminal-prompt">$</span> enter email : <span className="text-terminal-prompt">{email}</span>
          </div>
          <TerminalInput
            label="enter password :"
            value={password}
            onChange={setPassword}
            onSubmit={handlePasswordSubmit}
            type="password"
            autoFocus
          />
        </div>
      )}

      {step === 'submit' && (
        <div className="space-y-4">
          <div className="text-sm font-mono text-muted-foreground">
            <span className="text-terminal-prompt">$</span> enter email : <span className="text-terminal-prompt">{email}</span>
          </div>
          <div className="text-sm font-mono text-muted-foreground">
            <span className="text-terminal-prompt">$</span> enter password : ********
          </div>
          <TerminalButton
            onClick={handleLogin}
            loading={loading}
          >
            ./login --execute
          </TerminalButton>
          <button
            onClick={handleReset}
            className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-terminal-prompt">$</span> ./reset
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-border">
        <p className="text-sm font-mono text-muted-foreground">
          <span className="text-terminal-comment">//</span> Нет аккаунта?{' '}
          <Link 
            href="/register" 
            className="inline-block px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors text-terminal-prompt hover:text-glow-sm"
          >
            ~/register
          </Link>
        </p>
      </div>
    </AuthTerminal>
  )
}
