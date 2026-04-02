'use client'

import { useEffect } from 'react'

interface OrderTitleSaverProps {
  orderId: string
  title: string
}

export function OrderTitleSaver({ orderId, title }: OrderTitleSaverProps) {
  useEffect(() => {
    // Save order title to localStorage
    localStorage.setItem(`order_title_${orderId}`, title)

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('orderTitleUpdated', {
      detail: { orderId, title }
    }))
  }, [orderId, title])

  return null
}
