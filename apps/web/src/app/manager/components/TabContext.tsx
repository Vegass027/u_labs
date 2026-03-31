'use client'

import { createContext, useContext, ReactNode, useState } from 'react'

interface TabContextType {
  hasOpenTabs: boolean
  setHasOpenTabs: (has: boolean) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function TabProvider({ children }: { children: ReactNode }) {
  const [hasOpenTabs, setHasOpenTabs] = useState(false)

  return (
    <TabContext.Provider value={{ hasOpenTabs, setHasOpenTabs }}>
      {children}
    </TabContext.Provider>
  )
}

export function useTabContext() {
  const context = useContext(TabContext)
  if (!context) {
    throw new Error('useTabContext must be used within TabProvider')
  }
  return context
}
