'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthTerminal, TerminalInput, TerminalButton } from '@/components/auth'

type Step = 'email' | 'password'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordSubmitted, setPasswordSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
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
    setPasswordSubmitted(true)
  }

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      console.log('[LOGIN] Attempting to sign in with email:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('[LOGIN] Sign in response:', { data, error })

      if (error) {
        const errorMessage = error.message === 'Email not confirmed'
          ? 'Email не подтверждён. Проверьте почту.'
          : error.message === 'Invalid login credentials'
          ? 'Неверный пароль'
          : error.message
        setError(errorMessage)
        setLoading(false)
        return
      }

      // Используем data.user напрямую из ответа signInWithPassword
      // Это гарантирует, что мы получаем актуальные данные пользователя сразу после входа
      const user = data.user

      console.log('[LOGIN] User data:', user)

      if (!user) {
        setError('Ошибка при получении пользователя')
        setLoading(false)
        return
      }

      // Роль хранится в app_metadata (raw_app_meta_data), а не в user_metadata
      const role = user.app_metadata?.role || user.user_metadata?.role

      console.log('[LOGIN] User role:', role)

      if (!role) {
        setError('Не удалось определить роль пользователя. Обратитесь в поддержку.')
        setLoading(false)
        return
      }

      // Проверяем cookies после входа
      console.log('[LOGIN] All cookies:', document.cookie)

      if (role === 'owner') {
        console.log('[LOGIN] Redirecting to /dashboard')
        router.replace('/dashboard')
      } else if (role === 'manager') {
        console.log('[LOGIN] Redirecting to /manager')
        router.replace('/manager')
      } else if (role === 'client') {
        console.log('[LOGIN] Redirecting to /client')
        router.replace('/client')
      } else {
        console.log('[LOGIN] Redirecting to /')
        router.replace('/')
      }
    } catch (err) {
      console.error('[LOGIN] Error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('email')
  }

  const handleForgotPassword = async () => {
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_WEB_URL}/auth/callback`
    })

    if (error) {
      setError(error.message)
      return
    }

    setForgotSuccess('письмо отправлено. проверьте почту.')
  }

  return (
    <AuthTerminal
      title={showForgotPassword ? "~/reset-password" : "~/auth-login"}
      error={error}
      success={successMessage}
    >
      {searchParams.get('error') === 'email_confirmation_failed' && (
        <div className="text-sm font-mono text-yellow-400">
          <span className="font-bold">[warning]</span> Email confirmation failed. Please try to confirm your email again or contact support.
        </div>
      )}

      {!showForgotPassword && (
        <>
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
                onChange={(value) => {
                  setPassword(value)
                  if (!value.trim()) {
                    setPasswordSubmitted(false)
                  }
                }}
                onSubmit={handlePasswordSubmit}
                type="password"
                autoFocus
              />
              {passwordSubmitted && (
                <p className="text-sm font-mono text-muted-foreground">
                  <span className="text-terminal-comment">//</span> войти{' '}
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="inline-block px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors text-terminal-prompt hover:text-glow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ processing...' : '~/login --execute'}
                  </button>
                </p>
              )}
            </div>
          )}
        </>
      )}

      <div className={!showForgotPassword ? "pt-4 border-t border-border" : ""}>
        {!showForgotPassword ? (
          <p className="text-sm font-mono text-muted-foreground mb-4">
            <span className="text-terminal-comment">//</span> забыли пароль?{' '}
            <button
              onClick={() => setShowForgotPassword(true)}
              className="inline-block px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors text-terminal-prompt hover:text-glow-sm"
            >
              ~/reset
            </button>
          </p>
        ) : (
          <div className="space-y-4 mb-4">
            <div className="pb-4 border-b border-border">
              <TerminalInput
                label="$ enter email"
                value={forgotEmail}
                onChange={setForgotEmail}
                type="email"
                onSubmit={handleForgotPassword}
              />
            </div>
            {forgotSuccess && (
              <p className="text-sm font-mono text-green-400">{forgotSuccess}</p>
            )}
            <p className="text-sm font-mono text-muted-foreground">
              <span className="text-terminal-comment">//</span> отменить{' '}
              <button
                onClick={() => setShowForgotPassword(false)}
                className="inline-block px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors text-terminal-prompt hover:text-glow-sm"
              >
                ~/cancel
              </button>
            </p>
          </div>
        )}
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
