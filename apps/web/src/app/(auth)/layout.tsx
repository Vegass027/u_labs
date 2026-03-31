import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agency Platform - Auth',
  description: 'Agency Platform authentication',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  )
}
