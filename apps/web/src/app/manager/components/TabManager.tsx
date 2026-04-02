'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { TabBar } from './TabBar'
import { useTabContext } from './TabContext'

interface Tab {
  id: string
  filename: string
  href: string
}

export function TabManager() {
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
    
    // If it's a manager route, add it
    if (pathname.startsWith('/manager') || pathname.startsWith('/settings')) {
      // Check if it's an order detail page
      const orderMatch = pathname.match(/^\/manager\/orders\/([^\/]+)$/)
      
      let filename: string
      if (orderMatch) {
        // Try to get order title from localStorage
        const orderId = orderMatch[1]
        const storedTitle = localStorage.getItem(`order_title_${orderId}`)
        filename = storedTitle ? `${storedTitle}.ts` : `${orderId}.ts`
      } else if (pathname === '/manager') {
        filename = '📋 мои заявки.ts'
      } else if (pathname === '/manager/balance') {
        filename = '💰 balance.ts'
      } else if (pathname === '/settings/telegram') {
        filename = '⚙️ settings.ts'
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
        const orderPath = `/manager/orders/${orderId}`

        setTabs(prev => prev.map(tab =>
          tab.href === orderPath
            ? { ...tab, filename: `${e.newValue}.ts` }
            : tab
        ))
      }
    }

    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail?.orderId && e.detail?.title) {
        const orderPath = `/manager/orders/${e.detail.orderId}`

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
    <>
      <TabBar tabs={tabs} onCloseTab={handleCloseTab} />
      {tabs.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
          <div className="text-center">
            <div className="text-4xl mb-4">📂</div>
            <p>откройте файл из проводника</p>
          </div>
        </div>
      )}
    </>
  )
}
