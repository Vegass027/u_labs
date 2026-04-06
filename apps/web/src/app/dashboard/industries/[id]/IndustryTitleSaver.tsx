'use client'

import { useEffect } from 'react'

interface IndustryTitleSaverProps {
  industryId: string
  title: string
}

export function IndustryTitleSaver({ industryId, title }: IndustryTitleSaverProps) {
  useEffect(() => {
    // Сохраняем заголовок в localStorage для отображения в табах браузера
    const key = `industry-title-${industryId}`
    localStorage.setItem(key, title)

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('industryTitleUpdated', {
      detail: { industryId, title }
    }))

    return () => {
      // Очищаем при размонтировании
      localStorage.removeItem(key)
    }
  }, [industryId, title])

  return null
}
