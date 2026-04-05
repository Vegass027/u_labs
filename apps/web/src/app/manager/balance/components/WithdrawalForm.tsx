'use client'

import { useState, useRef, useEffect } from 'react'
import { createWithdrawalRequest } from '../../../actions/withdrawals'
import { updatePaymentDetailsDirect } from '../../../actions/manager'
import PaymentField from './PaymentField'

interface WithdrawalFormProps {
  balancePayable: number
  sbpPhone: string | null
  cardNumber: string | null
  sbpComment: string | null
}

export function WithdrawalForm({ balancePayable, sbpPhone, cardNumber, sbpComment }: WithdrawalFormProps) {
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [currentSbpPhone, setCurrentSbpPhone] = useState(sbpPhone)
  const [currentCardNumber, setCurrentCardNumber] = useState(cardNumber)
  const [currentSbpComment, setCurrentSbpComment] = useState(sbpComment || '')

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validate that at least one payment method is set
    if (!currentSbpPhone && !currentCardNumber) {
      setError('Укажите реквизиты для вывода (СБП или карта)')
      return
    }

    // Validate amount
    const amountNum = Number(amount)
    if (amountNum <= 0) {
      setError('Сумма должна быть больше 0')
      return
    }
    if (amountNum > balancePayable) {
      setError('Недостаточно средств')
      return
    }

    setIsSubmitting(true)
    
    try {
      await createWithdrawalRequest(new FormData(e.target as HTMLFormElement))
      setAmount('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать запрос на вывод')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSaveSbpPhone(value: string | null) {
    try {
      // If phone is null (empty), also clear comment
      const commentToSave = value === null ? null : currentSbpComment
      await updatePaymentDetailsDirect({
        sbp_phone: value,
        card_number: currentCardNumber,
        sbp_comment: commentToSave,
      })
      setCurrentSbpPhone(value)
      if (value === null) {
        setCurrentSbpComment('')
      }
    } catch (error) {
      throw error
    }
  }

  async function handleSaveCardNumber(value: string | null) {
    try {
      await updatePaymentDetailsDirect({
        sbp_phone: currentSbpPhone,
        card_number: value,
        sbp_comment: currentSbpComment,
      })
      setCurrentCardNumber(value)
    } catch (error) {
      throw error
    }
  }

  async function handleSaveComment(comment: string) {
    try {
      // Allow empty comment (will be converted to null on backend)
      await updatePaymentDetailsDirect({
        sbp_phone: currentSbpPhone,
        card_number: currentCardNumber,
        sbp_comment: comment || null,
      })
      setCurrentSbpComment(comment)
    } catch (error) {
      throw error
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">
            сумма к выводу
          </label>
          <span className="text-xs text-muted-foreground font-mono">
            доступно: {balancePayable.toLocaleString('ru-RU')} ₽
          </span>
        </div>
        <div className="relative max-w-xs">
          <span className={[
            'absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm pointer-events-none',
            isFocused ? 'text-terminal-prompt' : 'text-muted-foreground',
          ].join(' ')}>
            {amount || ''}
          </span>

          {/* Курсор — только когда в фокусе */}
          {isFocused && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-5 bg-terminal-prompt animate-blink inline-block pointer-events-none ml-[calc(var(--cursor-offset,0px)+0.125rem)]" style={{ '--cursor-offset': `${(amount || '').length}ch` } as React.CSSProperties} />
          )}

          <input
            ref={inputRef}
            type="number"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 bg-card border border-border rounded-lg font-mono text-transparent caret-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="1"
            step="0.01"
            max={balancePayable}
            required
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            inputMode="numeric"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
            ₽
          </span>
        </div>
      </div>

      <div className="pt-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
              СБП
            </label>
            <PaymentField
              label=""
              value={currentSbpPhone}
              comment={currentSbpComment}
              onSave={handleSaveSbpPhone}
              onCommentSave={handleSaveComment}
              isPhone
            />
          </div>

          <div className="flex-1">
            <label className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
              Карта
            </label>
            <PaymentField
              label=""
              value={currentCardNumber}
              onSave={handleSaveCardNumber}
              isCard
            />
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting || !amount || Number(amount) <= 0 || Number(amount) > Number(balancePayable)}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-mono font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'создание...' : 'создать запрос на вывод'}
        </button>
      </div>
    </form>
  )
}
