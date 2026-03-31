'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { AuthTerminal, TerminalInput, TerminalButton } from '@/components/auth'

type Step = 'email' | 'password' | 'confirmPassword' | 'fullName' | 'phone' | 'role' | 'submit'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('email')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'manager' | 'client',
    fullName: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'manager' || roleParam === 'client') {
      setFormData(prev => ({ ...prev, role: roleParam }))
    }
  }, [searchParams])

  const handleEmailSubmit = () => {
    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }
    setError('')
    setStep('password')
  }

  const handlePasswordSubmit = () => {
    if (!formData.password.trim()) {
      setError('Password is required')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setError('')
    setStep('confirmPassword')
  }

  const handleConfirmPasswordSubmit = () => {
    if (!formData.confirmPassword.trim()) {
      setError('Please confirm your password')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setStep('fullName')
  }

  const handleFullNameSubmit = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return
    }
    setError('')
    setStep('phone')
  }

  const handlePhoneSubmit = () => {
    setError('')
    setStep('role')
  }

  const handleRoleSubmit = () => {
    setError('')
    setStep('submit')
  }

  const handleRegister = async () => {
    setError('')
    setLoading(true)

    try {
      const { data, error } = await api.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        fullName: formData.fullName,
        phone: formData.phone || undefined,
      })

      if (error) {
        setError(error)
        setLoading(false)
        return
      }

      router.push('/login?registered=true&email=' + encodeURIComponent(formData.email))
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('email')
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: 'client',
      fullName: '',
      phone: '',
    })
  }

  const getPreviousSteps = () => {
    const steps = []
    if (step !== 'email') {
      steps.push({ label: 'enter email', value: formData.email })
    }
    if (step !== 'email' && step !== 'password') {
      steps.push({ label: 'enter password', value: '********' })
    }
    if (step !== 'email' && step !== 'password' && step !== 'confirmPassword') {
      steps.push({ label: 'confirm password', value: '********' })
    }
    if (step !== 'email' && step !== 'password' && step !== 'confirmPassword' && step !== 'fullName') {
      steps.push({ label: 'enter name', value: formData.fullName })
    }
    if (step !== 'email' && step !== 'password' && step !== 'confirmPassword' && step !== 'fullName' && step !== 'phone') {
      steps.push({ label: 'enter phone', value: formData.phone || '(skipped)' })
    }
    if (step !== 'email' && step !== 'password' && step !== 'confirmPassword' && step !== 'fullName' && step !== 'phone' && step !== 'role') {
      steps.push({ label: 'select role', value: formData.role })
    }
    return steps
  }

  return (
    <AuthTerminal
      title="~/registration"
      error={error}
    >
      {getPreviousSteps().map((prevStep, index) => (
        <div key={index} className="text-sm font-mono text-muted-foreground">
          <span className="text-terminal-prompt">$</span> {prevStep.label} : <span className="text-terminal-prompt">{prevStep.value}</span>
        </div>
      ))}

      {step === 'email' && (
        <TerminalInput
          label="enter email :"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
          onSubmit={handleEmailSubmit}
          type="email"
          autoFocus
        />
      )}

      {step === 'password' && (
        <TerminalInput
          label="enter password :"
          value={formData.password}
          onChange={(value) => setFormData({ ...formData, password: value })}
          onSubmit={handlePasswordSubmit}
          type="password"
          autoFocus
        />
      )}

      {step === 'confirmPassword' && (
        <TerminalInput
          label="confirm password :"
          value={formData.confirmPassword}
          onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
          onSubmit={handleConfirmPasswordSubmit}
          type="password"
          autoFocus
        />
      )}

      {step === 'fullName' && (
        <TerminalInput
          label="enter name :"
          value={formData.fullName}
          onChange={(value) => setFormData({ ...formData, fullName: value })}
          onSubmit={handleFullNameSubmit}
          type="text"
          autoFocus
        />
      )}

      {step === 'phone' && (
        <div className="space-y-4">
          <TerminalInput
            label="enter phone :"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            onSubmit={handlePhoneSubmit}
            type="text"
            autoFocus
          />
          <button
            onClick={handlePhoneSubmit}
            className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-terminal-prompt">$</span> ./skip
          </button>
        </div>
      )}

      {step === 'role' && (
        <div className="space-y-4">
          <div className="text-sm font-mono text-muted-foreground">
            <span className="text-terminal-prompt">$</span> select role [client|manager]
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setFormData({ ...formData, role: 'client' })}
              className={`px-4 py-2 font-mono text-sm transition-all ${
                formData.role === 'client'
                  ? 'text-terminal-prompt text-glow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              client
            </button>
            <button
              onClick={() => setFormData({ ...formData, role: 'manager' })}
              className={`px-4 py-2 font-mono text-sm transition-all ${
                formData.role === 'manager'
                  ? 'text-terminal-prompt text-glow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              manager
            </button>
          </div>
          <button
            onClick={handleRoleSubmit}
            className="shrink-0 font-mono text-xs px-2 py-1 rounded border border-border text-terminal-prompt hover:border-primary/40 hover:text-glow-sm transition-colors"
          >
            ./confirm
          </button>
        </div>
      )}

      {step === 'submit' && (
        <div className="space-y-4">
          <TerminalButton
            onClick={handleRegister}
            loading={loading}
          >
            ./register --execute
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
          <span className="text-terminal-comment">//</span> Уже есть аккаунт?{' '}
          <Link 
            href="/login" 
            className="inline-block px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors text-terminal-prompt hover:text-glow-sm"
          >
            ~/login
          </Link>
        </p>
      </div>
    </AuthTerminal>
  )
}
