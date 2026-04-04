'use client'

import { useState } from 'react'
import { createWithdrawalRequest } from '../../../actions/withdrawals'

interface WithdrawalFormProps {
  balancePayable: number
}

export function WithdrawalForm({ balancePayable }: WithdrawalFormProps) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess(false)
    
    try {
      await createWithdrawalRequest(new FormData(e.target as HTMLFormElement))
      setAmount('')
      setNote('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать запрос на вывод')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5">
          <div className="text-sm font-mono text-green-400">
            <span className="font-bold">[success]</span> запрос на вывод создан
          </div>
        </div>
      )}

      {error && (
        <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
          <div className="text-sm font-mono text-red-400">
            <span className="font-bold">[error]</span> {error}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          сумма к выводу
        </label>
        <div className="relative">
          <input
            type="number"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Введите сумму"
            className="w-full px-4 py-3 bg-card border border-border rounded-lg font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            min="1"
            step="0.01"
            max={balancePayable}
            required
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
            ₽
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          доступно: {balancePayable.toLocaleString('ru-RU')} ₽
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
          примечание (опционально)
        </label>
        <textarea
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Добавьте примечание к запросу..."
          className="w-full px-4 py-3 bg-card border border-border rounded-lg font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !amount || Number(amount) <= 0 || Number(amount) > Number(balancePayable)}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-mono font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'создание...' : 'создать запрос на вывод'}
      </button>
    </form>
  )
}
