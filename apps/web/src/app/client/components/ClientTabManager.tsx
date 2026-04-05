'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { TabBar } from '@/components/terminal/TabBar'
import { useTabContext } from '@/components/terminal/TabContext'

interface Tab {
  id: string
  filename: string
  href: string
}

export function ClientTabManager() {
  const pathname = usePathname()
  const [tabs, setTabs] = useState<Tab[]>([])
  const addedPathsRef = useRef<Set<string>>(new Set())
  const { setHasOpenTabs } = useTabContext()

  useEffect(() => {
    setHasOpenTabs(tabs.length > 0)
  }, [tabs.length, setHasOpenTabs])

  useEffect(() => {
    if (addedPathsRef.current.has(pathname)) {
      return
    }
    
    if (pathname.startsWith('/client')) {
      const orderMatch = pathname.match(/^\/client\/orders\/([^\/]+)$/)
      
      let filename: string
      if (orderMatch) {
        const orderId = orderMatch[1]
        const storedTitle = localStorage.getItem(`order_title_${orderId}`)
        filename = storedTitle ? `${storedTitle}.ts` : `${orderId}.ts`
      } else if (pathname === '/client') {
        filename = 'мои заявки.ts'
      } else if (pathname === '/client/orders/new') {
        filename = 'создать заявку.ts'
      } else if (pathname === '/client/profile') {
        filename = 'profile.ts'
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

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('order_title_')) {
        const orderId = e.key.replace('order_title_', '')
        const orderPath = `/client/orders/${orderId}`

        setTabs(prev => prev.map(tab =>
          tab.href === orderPath
            ? { ...tab, filename: `${e.newValue}.ts` }
            : tab
        ))
      }
    }

    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail?.orderId && e.detail?.title) {
        const orderPath = `/client/orders/${e.detail.orderId}`

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
    </>
  )
}
