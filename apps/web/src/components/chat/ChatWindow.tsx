'use client';

import { useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { api } from '@/lib/api';

// ── Вынеси клиент ЗА компонент ──────────────────────────────
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

interface ChatWindowProps {
  orderId: string;
  currentUserId: string;
  currentUserRole: string;
}

export default function ChatWindow({ orderId, currentUserId, currentUserRole }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [orderId]);

  useEffect(() => {
    const channel = supabase
      .channel(`order-messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        async (payload) => {
          console.log('[Realtime] new message payload:', payload.new);
          const m = payload.new as any;

          // Загружаем имя отправителя из таблицы users
          const { data: userData } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', m.sender_id)
            .single();

          const senderName = userData?.full_name ?? 'Unknown';

          setMessages((prev) => {
            // Не дублируем если уже есть (собственное сообщение могло добавиться)
            if (prev.find((msg) => msg.id === m.id)) return prev;
            return [
              ...prev,
              {
                id: m.id,
                sender_id: m.sender_id,
                sender_name: senderName,
                content: m.content,
                created_at: m.created_at,
              },
            ];
          });
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]); // supabase больше не в deps — не пересоздаётся

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await api.get<Message[]>(`/api/orders/${orderId}/messages`);
      if (result.error) throw new Error(result.error);
      setMessages(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!content.trim()) return;
    try {
      setIsSending(true);
      setError(null);
      const result = await api.post<Message>(`/api/orders/${orderId}/messages`, {
        content,
      });
      if (result.error) throw new Error(result.error);
      setContent('');
      // НЕ добавляем сообщение вручную — Realtime его принесёт
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Чат заказа</h3>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Загрузка сообщений...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Сообщений пока нет. Начните общение.
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-xs font-medium mb-1 opacity-75">
                    {message.sender_name}
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    {formatTimestamp(message.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите сообщение... (Enter для отправки, Shift+Enter для новой строки)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            disabled={isSending}
          />
          <button
            onClick={sendMessage}
            disabled={!content.trim() || isSending}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </div>
    </div>
  );
}
