'use client'

import TerminalWindow from '../landing/TerminalWindow'

interface AuthTerminalProps {
  title: string
  children: React.ReactNode
  error?: string
  success?: string
}

export function AuthTerminal({ title, children, error, success }: AuthTerminalProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(155,255,155,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(155,255,155,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="relative z-10 w-full max-w-2xl mx-4">
        <TerminalWindow title={title}>
          <div className="space-y-6">
            {error && (
              <div className="text-sm font-mono text-red-400">
                <span className="font-bold">[error]</span> {error}
              </div>
            )}
            
            {success && (
              <div className="text-sm font-mono text-terminal-prompt">
                <span className="font-bold">[success]</span> {success}
              </div>
            )}
            
            <div className="space-y-4">
              {children}
            </div>
          </div>
        </TerminalWindow>
      </div>
    </div>
  )
}
