'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { api } from '@/lib/api'

interface AvatarUploadProps {
  currentAvatar?: string
  onAvatarChange: (url: string | null) => void
}

export default function AvatarUpload({ currentAvatar, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Размер файла не должен превышать 2MB')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.upload<{ avatar_url: string }>('/api/storage/avatar', formData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        setPreview(response.data.avatar_url)
        onAvatarChange(response.data.avatar_url)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Ошибка при загрузке аватара')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    try {
      const response = await api.delete('/api/storage/avatar')

      if (response.error) {
        throw new Error(response.error)
      }

      setPreview(null)
      onAvatarChange(null)
    } catch (error) {
      console.error('Remove error:', error)
      alert('Ошибка при удалении аватара')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-border">
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl text-primary font-mono">
              M
            </span>
          )}
        </div>

        {/* Кнопка загрузки - появляется при hover когда нет фото */}
        {!preview && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isUploading ? (
              <span className="text-white text-xs font-mono">Загрузка...</span>
            ) : (
              <Upload className="w-6 h-6 text-white" />
            )}
          </button>
        )}

        {/* Кнопка удаления - появляется при hover когда есть фото */}
        {preview && (
          <button
            onClick={handleRemove}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isUploading ? (
              <span className="text-white text-xs font-mono">Удаление...</span>
            ) : (
              <X className="w-6 h-6 text-white" />
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground font-mono">
        JPG, PNG, WebP • макс 2MB
      </p>
    </div>
  )
}
