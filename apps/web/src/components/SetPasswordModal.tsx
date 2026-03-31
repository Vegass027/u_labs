'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TerminalInput } from '@/components/auth'
import TerminalWindow from '@/components/landing/TerminalWindow'

type Step = 'password' | 'confirm'

export function SetPasswordModal({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<Step>('password')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handlePasswordSubmit = () => {
    if (password.length < 8) {
      setError('минимум 8 символов')
      return
    }
    setError('')
    setStep('confirm')
  }

  const handleSubmit = async () => {
    if (password !== confirm) {
      setError('пароли не совпадают')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      password,
      data: { password_set: true }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    onSuccess()
  }

  const getPreviousSteps = () => {
    const steps = []
    if (step !== 'password') {
      steps.push({ label: 'enter password', value: '********' })
    }
    return steps
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="relative z-10 w-full max-w-2xl mx-4">
        <TerminalWindow title="~/set-password">
          <div className="space-y-6">
            {error && (
              <div className="text-sm font-mono text-red-400">
                <span className="font-bold">[error]</span> {error}
              </div>
            )}

            <div className="space-y-4">
              {getPreviousSteps().map((prevStep, index) => (
                <div key={index} className="text-sm font-mono text-muted-foreground">
                  <span className="text-terminal-prompt">$</span> {prevStep.label} : <span className="text-terminal-prompt">{prevStep.value}</span>
                </div>
              ))}

              {step === 'password' && (
                <TerminalInput
                  label="enter password :"
                  value={password}
                  onChange={setPassword}
                  type="password"
                  onSubmit={handlePasswordSubmit}
                  autoFocus
                />
              )}

              {step === 'confirm' && (
                <TerminalInput
                  label="confirm password :"
                  value={confirm}
                  onChange={setConfirm}
                  type="password"
                  onSubmit={handleSubmit}
                  autoFocus
                />
              )}

              {step === 'confirm' && (
                <p className="text-sm font-mono text-muted-foreground">
                  <span className="text-terminal-comment">//</span> установить пароль{' '}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-block px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors text-terminal-prompt hover:text-glow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ processing...' : './set-password --execute'}
                  </button>
                </p>
              )}
            </div>
          </div>
        </TerminalWindow>
      </div>
    </div>
  )
}
