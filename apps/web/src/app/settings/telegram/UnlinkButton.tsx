'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UnlinkButtonProps {
  userId: string;
}

export default function UnlinkButton({ userId }: UnlinkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUnlink = async () => {
    if (!confirm('Вы уверены, что хотите отвязать Telegram? Вы перестанете получать уведомления.')) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_chat_id: null,
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Ошибка при отвязке Telegram. Попробуйте позже.');
      }
    } catch (error) {
      alert('Ошибка при отвязке Telegram. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleUnlink}
      disabled={isLoading}
      className="w-full sm:w-auto px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Отвязка...' : 'Отвязать Telegram'}
    </button>
  );
}
