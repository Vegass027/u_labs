import { ReactNode } from "react";

interface TerminalWindowProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const TerminalWindow = ({ title = "terminal", children, className = "" }: TerminalWindowProps) => {
  return (
    <div className={`rounded-lg overflow-hidden terminal-glow border border-border ${className}`}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-terminal-header border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(0 70% 55%)" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(40 80% 55%)" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(120 60% 45%)" }} />
        </div>
        <span className="font-mono text-xs text-muted-foreground ml-2">{title}</span>
      </div>
      {/* Body */}
      <div className="bg-card p-5 font-mono text-sm leading-relaxed scanline">
        {children}
      </div>
    </div>
  );
};

export default TerminalWindow;
