'use client'

import { useEffect } from 'react'

interface OrderTitleSaverProps {
  orderId: string
  title: string
}

export function OrderTitleSaver({ orderId, title }: OrderTitleSaverProps) {
  useEffect(() => {
    if (title) {
      localStorage.setItem(`order_title_${orderId}`, title)
      
      // Dispatch custom event для обновления табов в реальном времени
      window.dispatchEvent(new CustomEvent('orderTitleUpdated', {
        detail: { orderId, title }
      }))
    }
  }, [orderId, title])

  return null
}
