'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Edit2, Check, X, Trash2 } from 'lucide-react'

interface ProfileFieldProps {
  label: string
  value: string
  onSave: (value: string) => Promise<void>
  editable?: boolean
  isPhone?: boolean
}

export default function ProfileField({ label, value, onSave, editable = true, isPhone = false }: ProfileFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

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
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Save error:', error)
      alert('Ошибка при сохранении')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Удалить номер телефона?')) {
      return
    }
    
    setIsSaving(true)
    try {
      await onSave('')
      setIsEditing(false)
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении')
    } finally {
      setIsSaving(false)
    }
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
          <div className="relative flex-1 flex items-center min-w-0">
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
              onChange={isPhone ? handlePhoneChange : (e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isSaving}
              className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent font-mono text-sm cursor-text z-10"
              placeholder={isPhone ? '+7' : ''}
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
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground font-mono">{value || '—'}</span>
            {isPhone && value && (
              <>
                <span className="text-muted-foreground">|</span>
                <button
                  onClick={handleDelete}
                  className="p-1 text-muted-foreground hover:text-destructive transition-opacity"
                  title="Удалить номер"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {editable && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-muted-foreground hover:text-primary transition-opacity"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
