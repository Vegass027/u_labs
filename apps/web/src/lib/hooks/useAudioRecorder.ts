'use client';

import { useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  code?: string;
}

async function uploadAudioRequest<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {};

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Request failed', code: data.code };
    }

    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

export function useAudioRecorder(
  orderId: string,
  onTranscript: (transcript: string) => void,
  onError: (error: string) => void,
  onVoiceMessage: () => void
) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          onError('Не удалось записать аудио');
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Audio blob size:', audioBlob.size, 'bytes');
        
        // Сразу показываем голосовое сообщение
        onVoiceMessage();
        setIsUploading(true);
        
        await uploadAudio(audioBlob);
        setIsUploading(false);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      onError('Не удалось получить доступ к микрофону');
    }
  }, [orderId, onError, onVoiceMessage]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const uploadAudio = useCallback(async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    console.log('FormData entries:', Array.from(formData.entries()));

    try {
      const result = await uploadAudioRequest<{ transcript: string }>(
        `/api/ai/transcribe`,
        formData
      );
      
      console.log('Upload result:', result);
      
      if (result.error) {
        onError(result.error);
        return;
      }

      if (result.data) {
        onTranscript(result.data.transcript);
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError('Не удалось обработать голосовое сообщение');
    }
  }, [onTranscript, onError]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isUploading,
    toggleRecording,
  };
}
