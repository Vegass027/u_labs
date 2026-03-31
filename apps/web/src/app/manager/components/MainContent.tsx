'use client'

import { useTabContext } from './TabContext'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { hasOpenTabs } = useTabContext()

  if (!hasOpenTabs) {
    return null
  }

  return <>{children}</>
}
