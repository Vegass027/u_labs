'use client'

import { useRef, useEffect, KeyboardEvent, useState } from 'react'

interface TerminalInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onBack?: () => void          // ← переход к предыдущему полю
  type?: 'text' | 'email' | 'password'
  disabled?: boolean
  autoFocus?: boolean
}

export function TerminalInput({
  label,
  value,
  onChange,
  onSubmit,
  onBack,
  type = 'text',
  disabled = false,
  autoFocus = false,
}: TerminalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() && !disabled) {
      e.preventDefault()
      onSubmit()
      return
    }
    // Backspace на пустом поле — вернуться назад
    if (e.key === 'Backspace' && value === '' && onBack && !disabled) {
      e.preventDefault()
      onBack()
    }
  }

  // Клик по завершённой строке — редактировать её
  const handleDisabledClick = () => {
    if (disabled && onBack) onBack()
  }

  const handleContainerClick = () => {
    if (disabled) {
      handleDisabledClick()
    } else {
      inputRef.current?.focus()
    }
  }

  const displayValue = type === 'password' ? '•'.repeat(value.length) : value
  const isCompleted = disabled && value.length > 0

  return (
    <div
      className={[
        'group flex items-center gap-2 text-sm font-mono transition-opacity duration-200',
        disabled ? 'cursor-pointer' : 'cursor-text',
        // завершённые строки чуть приглушены, но не мёртвые
        isCompleted ? 'opacity-60 hover:opacity-90' : '',
        !disabled && !isCompleted ? '' : '',
      ].join(' ')}
      onClick={handleContainerClick}
    >
      {/* Промпт — зелёный когда активно, серый когда завершено */}
      <span className={[
        'font-bold transition-colors shrink-0',
        !disabled ? 'text-terminal-prompt' : 'text-muted-foreground',
      ].join(' ')}>
        $
      </span>

      <span className="text-terminal-comment shrink-0">{label}</span>

      <div className="relative flex-1 flex items-center min-w-0">
        <span className={[
          'font-mono text-sm whitespace-pre pointer-events-none',
          !disabled ? 'text-terminal-prompt' : 'text-muted-foreground',
        ].join(' ')}>
          {displayValue}
        </span>

        {/* Курсор — только когда активно и в фокусе */}
        {isFocused && !disabled && (
          <span className="w-2.5 h-5 bg-terminal-prompt animate-blink inline-block shrink-0 ml-0.5 pointer-events-none" />
        )}

        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent font-mono text-sm cursor-text z-10 disabled:cursor-pointer"
        />
      </div>

      {/* Подсказка "← edit" на завершённых строках при наведении */}
      {isCompleted && onBack && (
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors select-none">
          ← edit
        </span>
      )}

      {/* Кнопки действий — Back ← и Enter ↵ */}
      {!disabled && (
        <div className="flex items-center gap-2 shrink-0">
          {/* Back ← — показываем только если есть onBack */}
          {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onBack()
              }}
              className={[
                'shrink-0 font-mono text-[11px] px-2.5 py-1 rounded transition-all duration-200',
                'border font-medium tracking-wide',
                'border-terminal-prompt/50 text-terminal-prompt bg-terminal-prompt/8 hover:bg-terminal-prompt/15 hover:border-terminal-prompt hover:shadow-[0_0_12px_rgba(var(--terminal-prompt-rgb),0.25)] cursor-pointer',
              ].join(' ')}
            >
              Back ←
            </button>
          )}
          
          {/* Enter ↵ — только на активном незавершённом поле */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (value.trim()) onSubmit()
            }}
            disabled={!value.trim()}
            className={[
              'shrink-0 font-mono text-[11px] px-2.5 py-1 rounded transition-all duration-200',
              'border font-medium tracking-wide',
              value.trim()
                ? 'border-terminal-prompt/50 text-terminal-prompt bg-terminal-prompt/8 hover:bg-terminal-prompt/15 hover:border-terminal-prompt hover:shadow-[0_0_12px_rgba(var(--terminal-prompt-rgb),0.25)] cursor-pointer'
                : 'border-border/40 text-muted-foreground/30 cursor-not-allowed',
            ].join(' ')}
          >
            Enter ↵
          </button>
        </div>
      )}
    </div>
  )
}