'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Edit2, Check, X, MessageSquare } from 'lucide-react'

interface PaymentFieldProps {
  label: string
  value: string | null
  comment?: string | null
  onSave: (value: string | null) => Promise<void>
  onCommentSave?: (comment: string) => Promise<void>
  editable?: boolean
  isPhone?: boolean
  isCard?: boolean
}

export default function PaymentField({ label, value, comment, onSave, onCommentSave, editable = true, isPhone = false, isCard = false }: PaymentFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isEditingComment, setIsEditingComment] = useState(false)
  const [commentValue, setCommentValue] = useState(comment || '')
  const [isSavingComment, setIsSavingComment] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(value || '')
  }, [value])

  useEffect(() => {
    setCommentValue(comment || '')
  }, [comment])

  // Initialize editValue with '+7' when phone is empty and editing starts
  useEffect(() => {
    if (isPhone && isEditing && !value) {
      setEditValue('+7')
    }
  }, [isPhone, isEditing, value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      // Set cursor after +7 if phone is empty
      if (isPhone && (!value || value === '+7')) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(3, 3)
          }
        }, 10)
      }
    }
  }, [isEditing, isPhone, value])

  const handleSave = async () => {
    if (editValue === (value || '')) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(editValue || null)
      setIsEditing(false)
    } catch (error) {
      alert('Ошибка при сохранении')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value || '')
    setIsEditing(false)
  }

  const handleSaveComment = async () => {
    if (!onCommentSave) return
    setIsSavingComment(true)
    try {
      await onCommentSave(commentValue)
      setIsEditingComment(false)
    } catch (error) {
      alert('Ошибка при сохранении комментария')
    } finally {
      setIsSavingComment(false)
    }
  }

  const handleCancelComment = () => {
    setCommentValue(comment || '')
    setIsEditingComment(false)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // If user is deleting, just update the value
    if (inputValue.length < editValue.length && inputValue.startsWith('+7')) {
      setEditValue(inputValue)
      return
    }
    
    // Extract all digits from input, but skip the '7' from '+7'
    const digits = inputValue.replace(/\D/g, '').replace(/^7/, '')
    
    // Limit to 10 digits (after +7)
    const limitedDigits = digits.slice(0, 10)
    
    // Format: +7 999 123 45 67
    let formatted = '+7'
    if (limitedDigits.length > 0) {
      formatted += ` ${limitedDigits.slice(0, 3)}`
    }
    if (limitedDigits.length > 3) {
      formatted += ` ${limitedDigits.slice(3, 6)}`
    }
    if (limitedDigits.length > 6) {
      formatted += ` ${limitedDigits.slice(6, 8)}`
    }
    if (limitedDigits.length > 8) {
      formatted += ` ${limitedDigits.slice(8, 10)}`
    }
    
    setEditValue(formatted)
  }

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // If user is deleting, just update the value
    if (inputValue.length < editValue.length) {
      setEditValue(inputValue)
      return
    }
    
    // Extract all digits
    const digits = inputValue.replace(/\D/g, '')
    
    // Limit to 16 digits
    const limitedDigits = digits.slice(0, 16)
    
    // Format: 5536 9123 4567 8901
    let formatted = ''
    for (let i = 0; i < limitedDigits.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' '
      }
      formatted += limitedDigits[i]
    }
    
    setEditValue(formatted)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
        {label}
      </label>

      {isEditing ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center min-w-0 max-w-[200px] h-10 px-3 bg-card border border-border rounded-lg focus-within:border-primary transition-colors">
            <span className={[
              'font-mono text-sm whitespace-pre pointer-events-none',
              isFocused ? 'text-terminal-prompt' : 'text-muted-foreground',
            ].join(' ')}>
              {editValue}
            </span>

            {/* Курсор — только когда в фокусе */}
            {isFocused && (
              <span className="w-2.5 h-5 bg-terminal-prompt animate-blink inline-block shrink-0 ml-0.5 pointer-events-none" />
            )}

            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={isPhone ? handlePhoneChange : isCard ? handleCardChange : (e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isSaving}
              className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent font-mono text-sm cursor-text z-10 px-3"
              placeholder={isPhone ? '+7' : ''}
              inputMode="numeric"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-2 text-terminal-prompt hover:bg-terminal-prompt/10 rounded transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 group">
            <div className="relative flex-1 flex items-center min-w-0 max-w-[200px] h-10 px-3 bg-card border border-border rounded-lg">
              <span className="text-sm text-foreground font-mono">{(value && value !== '+7') ? value : '—'}</span>
            </div>
            {editable && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 text-muted-foreground hover:text-primary transition-opacity"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onCommentSave && (
              <button
                type="button"
                onClick={() => setIsEditingComment(true)}
                className="p-1 text-muted-foreground hover:text-primary transition-opacity"
                title="Комментарий"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
          </div>

          {isEditingComment && (
            <div className="flex gap-2 mt-4">
              <textarea
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                placeholder="Комментарий"
                className="flex-1 px-3 py-2 bg-card border border-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                rows={1}
                maxLength={500}
              />
              <button
                type="button"
                onClick={handleSaveComment}
                disabled={isSavingComment}
                className="px-3 py-2 bg-terminal-prompt text-background rounded-lg font-mono text-sm hover:bg-terminal-prompt/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingComment ? '...' : '✓'}
              </button>
              <button
                type="button"
                onClick={handleCancelComment}
                disabled={isSavingComment}
                className="px-3 py-2 bg-destructive text-destructive-foreground rounded-lg font-mono text-sm hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isEditingComment && comment && (
            <div className="text-xs text-muted-foreground font-mono">
              <span className="text-primary">// комментарий:</span> {comment}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
