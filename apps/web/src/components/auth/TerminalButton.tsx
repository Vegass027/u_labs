'use client'

interface TerminalButtonProps {
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  loading?: boolean
}

export function TerminalButton({
  onClick,
  children,
  disabled = false,
  loading = false,
}: TerminalButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center gap-2 text-sm font-mono text-terminal-prompt hover:text-glow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="font-bold">$</span>
      <span>{loading ? '⏳ processing...' : children}</span>
    </button>
  )
}
