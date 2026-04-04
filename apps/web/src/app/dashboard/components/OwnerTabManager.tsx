'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { TabBar } from '../../manager/components/TabBar'
import { useTabContext } from '../../manager/components/TabContext'

interface Tab {
  id: string
  filename: string
  href: string
}

export function OwnerTabManager() {
  const pathname = usePathname()
  const [tabs, setTabs] = useState<Tab[]>([])
  const addedPathsRef = useRef<Set<string>>(new Set())
  const { setHasOpenTabs } = useTabContext()

  useEffect(() => {
    // Update context about open tabs
    setHasOpenTabs(tabs.length > 0)
  }, [tabs.length, setHasOpenTabs])

  useEffect(() => {
    // Check if current path is already added
    if (addedPathsRef.current.has(pathname)) {
      return
    }
    
    // If it's a dashboard route, add it
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
      // Check if it's an order detail page
      const orderMatch = pathname.match(/^\/dashboard\/orders\/([^\/]+)$/)
      
      let filename: string
      if (orderMatch) {
        // Try to get order title from localStorage
        const orderId = orderMatch[1]
        const storedTitle = localStorage.getItem(`order_title_${orderId}`)
        filename = storedTitle ? `${storedTitle}.ts` : `${orderId}.ts`
      } else if (pathname === '/dashboard') {
        filename = '📋 all-orders.ts'
      } else if (pathname === '/dashboard/commissions') {
        filename = '💰 commissions.ts'
      } else if (pathname === '/settings/telegram') {
        filename = '⚙️ telegram.ts'
      } else {
        filename = pathname.split('/').pop() || 'file.ts'
      }
      
      const newTab: Tab = {
        id: pathname,
        filename,
        href: pathname,
      }
      
      addedPathsRef.current.add(pathname)
      setTabs(prev => [...prev, newTab])
    }
  }, [pathname])

  // Listen for order title updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('order_title_')) {
        const orderId = e.key.replace('order_title_', '')
        const orderPath = `/dashboard/orders/${orderId}`

        setTabs(prev => prev.map(tab =>
          tab.href === orderPath
            ? { ...tab, filename: `${e.newValue}.ts` }
            : tab
        ))
      }
    }

    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail?.orderId && e.detail?.title) {
        const orderPath = `/dashboard/orders/${e.detail.orderId}`

        setTabs(prev => prev.map(tab =>
          tab.href === orderPath
            ? { ...tab, filename: `${e.detail.title}.ts` }
            : tab
        ))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('orderTitleUpdated', handleCustomEvent as EventListener)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('orderTitleUpdated', handleCustomEvent as EventListener)
    }
  }, [])

  const handleCloseTab = (tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId)
      // Also remove from addedPathsRef
      const tabToRemove = prev.find(tab => tab.id === tabId)
      if (tabToRemove) {
        addedPathsRef.current.delete(tabToRemove.href)
      }
      return newTabs
    })
  }

  return (
    <TabBar tabs={tabs} onCloseTab={handleCloseTab} />
  )
}
