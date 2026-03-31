'use client';

import { useState } from 'react';

export default function OrderChatInput() {
  const [message, setMessage] = useState('');

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 bg-card text-terminal-prompt font-mono terminal-cursor-block"
        />
        <button 
          disabled={!message.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          отправить
        </button>
      </div>
    </div>
  );
}
