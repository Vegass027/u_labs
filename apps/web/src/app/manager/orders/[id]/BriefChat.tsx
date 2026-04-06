'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';

export type MessageType = 'text' | 'audio' | 'file';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  type: MessageType;
  content?: string;
  audioUrl?: string;
  fileName?: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface BriefChatProps {
  orderId: string;
  userRole?: 'client' | 'manager' | 'owner';
}

export default function BriefChat({ orderId, userRole = 'manager' }: BriefChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [canGenerateBrief, setCanGenerateBrief] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendAiChatMessage = useCallback(async (message: string) => {
    setIsTyping(true);
    setError(null);

    try {
      const result = await api.post<{ response: string; canGenerateBrief: boolean }>(`/api/ai/chat`, {
        message: message,
        orderId: orderId,
      });

      if (result.data) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          type: 'text',
          content: result.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setCanGenerateBrief(result.data.canGenerateBrief);
      }
    } catch (error: any) {
      if (error?.error === 'OpenAI API недоступен в вашем регионе') {
        setError('OpenAI API недоступен в вашем регионе. Используйте VPN или обратитесь к администратору.');
      } else {
        setError('Не удалось отправить сообщение. Попробуйте позже.');
      }
    } finally {
      setIsTyping(false);
    }
  }, [orderId]);

  const handleTranscript = useCallback(async (transcript: string) => {
    // Не показываем транскрипцию как отдельное сообщение
    // Сразу отправляем в AI-чат
    await sendAiChatMessage(transcript);
  }, [sendAiChatMessage]);

  const handleRecordingError = useCallback((error: string) => {
    setError(error);
  }, []);

  const handleVoiceMessage = useCallback(() => {
    const voiceMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      type: 'audio',
      audioUrl: '#',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, voiceMessage]);
  }, []);

  const { isRecording, isUploading, toggleRecording } = useAudioRecorder(
    orderId,
    handleTranscript,
    handleRecordingError,
    handleVoiceMessage
  );

  useEffect(() => {
    loadChatHistory();
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const result = await api.get<any[]>(`/api/orders/${orderId}/ai-chat`);
      if (result.data) {
        const chatMessages: ChatMessage[] = result.data.map((msg: any) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          type: 'text',
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const result = await api.post<{ response: string; canGenerateBrief: boolean }>(`/api/ai/chat`, {
        message: inputText,
        orderId: orderId,
      });

      if (result.data) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          type: 'text',
          content: result.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setCanGenerateBrief(result.data.canGenerateBrief);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      if (error?.error === 'OpenAI API недоступен в вашем регионе') {
        setError('OpenAI API недоступен в вашем регионе. Используйте VPN или обратитесь к администратору.');
      } else {
        setError('Не удалось отправить сообщение. Попробуйте позже.');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateBrief = async () => {
    setIsGeneratingBrief(true);
    setError(null);

    const fullHistory = messages
      .filter(m => m.type === 'text' && m.content)
      .map(m => `${m.role === 'user' ? 'Менеджер' : 'AI'}: ${m.content}`)
      .join('\n\n');

    try {
      const result = await api.post<{ brief: any }>(`/api/ai/structure`, {
        text: fullHistory,
        order_id: orderId,
      });

      if (result.data) {
        // Добавляем сообщение в чат
        const successMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          type: 'text',
          content: 'Ваш бриф сохранен, можете увидеть его во вкладке >>> Бриф <<<',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
        
        // Скрываем кнопку без обновления страницы
        setCanGenerateBrief(false);
        
        // Обновляем страницу для перезагрузки данных из БД
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to generate brief:', error);
      setError('Не удалось сохранить бриф. Попробуйте позже.');
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleResetBrief = async () => {
    if (!confirm('Это удалит историю чата с AI. Текущий бриф останется на месте. Продолжить?')) return;

    try {
      await api.delete(`/api/orders/${orderId}/ai-chat`);
      setMessages([]);
      setCanGenerateBrief(false);
    } catch (error) {
      setError('Не удалось создать новый бриф');
    }
  };

  const handleVoiceRecord = () => {
    toggleRecording();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setError('Размер файла не должен превышать 1 МБ');
      return;
    }

    setError(null);
    setIsTyping(true);

    const fileMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      type: 'file',
      fileName: file.name,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, fileMessage]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const supabase = (await import('@/lib/supabase/client')).createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const headers: Record<string, string> = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/documents/${orderId}`, {
        method: 'POST',
        headers,
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload document')
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: 'text',
        content: result.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setCanGenerateBrief(result.canGenerateBrief);
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      setError('Не удалось загрузить файл. Попробуйте позже.');
      setMessages((prev) => prev.filter(m => m.id !== fileMessage.id));
    } finally {
      setIsTyping(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Messages Area */}
      <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-card/50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground font-mono">
            загрузка истории чата...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground font-mono">
            <div className="text-center space-y-2">
              <p>Привет! Я помогу вам составить подробный бриф для вашего проекта.</p>
              <p className="text-sm opacity-75">Расскажите, что вы хотите создать, или загрузите файл с описанием.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Message Bubble */}
                <div
                  className={`rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium font-mono opacity-75">
                      {message.role === 'user' ? 'вы' : 'ai-ассистент'}
                    </span>
                    <span className="text-xs opacity-75 font-mono">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  {/* Message Content */}
                  {message.type === 'text' && message.content && (
                    <div className="text-sm whitespace-pre-wrap break-words font-mono">
                      {message.content}
                    </div>
                  )}

                  {message.type === 'audio' && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="h-1 bg-primary/30 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-1/3" />
                        </div>
                        <span className="text-xs mt-1 block opacity-75">голосовое сообщение</span>
                      </div>
                    </div>
                  )}

                  {message.type === 'file' && message.fileName && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{message.fileName}</div>
                        <span className="text-xs opacity-75">файл загружен</span>
                      </div>
                    </div>
                  )}

                  {/* Copy Button for AI Messages */}
                  {message.role === 'assistant' && message.type === 'text' && message.content && (
                    <button
                      onClick={() => handleCopyToClipboard(message.content!)}
                      className="mt-2 flex items-center gap-1 text-xs opacity-75 hover:opacity-100 transition-opacity font-mono"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      копировать
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-lg px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-start">
            <div className="bg-red-500/10 text-red-400 rounded-lg px-4 py-3 max-w-[75%]">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm font-mono">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Generate Brief Button */}
      <div className="px-4 py-2 border-t border-border bg-muted/50 flex items-center gap-2">
        {canGenerateBrief && (
          <button
            onClick={handleGenerateBrief}
            disabled={isGeneratingBrief}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed transition-colors font-mono text-sm font-bold flex items-center gap-2"
          >
            {isGeneratingBrief ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Сохранение...
              </>
            ) : (
              '✨ Сохранить бриф'
            )}
          </button>
        )}

        <div className="flex-1" />

        <button
          onClick={handleResetBrief}
          className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors font-mono text-sm"
        >
          🗑️ Создать новый бриф
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            title="Загрузить файл"
          >
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
 
          {/* Text Input */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 border border-border rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-primary/50 bg-card text-terminal-prompt font-mono terminal-cursor-block"
            rows={1}
            disabled={isTyping}
          />
 
          {/* Voice Record Button */}
          <button
            onClick={handleVoiceRecord}
            className={`p-2 rounded-lg border transition-colors ${
              isRecording
                ? 'bg-red-500/20 border-red-500/50 text-red-500 animate-pulse'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
            }`}
            title={isRecording ? 'Остановить запись' : 'Записать голосовое'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isRecording ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
          </button>
 
          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted/30 disabled:cursor-not-allowed transition-colors font-mono text-sm"
          >
            {isTyping ? '...' : 'отправить'}
          </button>
        </div>
      </div>
    </>
  );
}
