'use client';

import { useState, useRef, useEffect } from 'react';

export type MessageType = 'text' | 'audio' | 'file' | 'transcript';

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
}

export default function BriefChat({ orderId }: BriefChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      type: 'text',
      content: 'Привет! Я помогу вам составить подробный бриф для вашего проекта. Расскажите, что вы хотите создать, или загрузите файл с описанием.',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    simulateAIResponse();
  };

  const simulateAIResponse = () => {
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: 'text',
        content: 'Отлично! Расскажите подробнее о целевой аудитории вашего проекта. Кто будет использовать ваш продукт или услугу?',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 2000);
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate sending voice message
      const voiceMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        type: 'audio',
        audioUrl: '#',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, voiceMessage]);

      // Simulate transcription and AI response
      setTimeout(() => {
        const transcriptMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          type: 'transcript',
          content: 'Я хочу создать веб-приложение для управления задачами с возможностью командной работы.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, transcriptMessage]);
        simulateAIResponse();
      }, 1500);
    } else {
      setIsRecording(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      type: 'file',
      fileName: file.name,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, fileMessage]);

    // Simulate AI response
    simulateAIResponse();
  };

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card terminal-glow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
            <span className="text-sky-400">&gt;&gt;&gt;</span> Чат с Брифером <span className="text-sky-400">&lt;&lt;&lt;</span>
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">онлайн</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-card/50">
        {messages.map((message) => (
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
                        <div className="h-full bg-primary w-1/3 animate-pulse" />
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

                {message.type === 'transcript' && message.content && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium opacity-75 font-mono uppercase">
                      транскрипция:
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words font-mono italic">
                      {message.content}
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
        ))}

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

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end gap-2">
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
            accept=".txt"
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
            disabled={!inputText.trim()}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted/30 disabled:cursor-not-allowed transition-colors font-mono text-sm"
          >
            отправить
          </button>
        </div>
      </div>
    </div>
  );
}
