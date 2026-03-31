import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import UnlinkButton from './UnlinkButton';

export default async function TelegramSettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('id, email, telegram_chat_id')
    .eq('id', user.id)
    .single();

  if (!userData) {
    redirect('/login');
  }

  const isLinked = !!userData.telegram_chat_id;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Настройки Telegram
          </h1>

          {isLinked ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-600 mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-green-900">
                      Telegram привязан
                    </p>
                    <p className="text-sm text-green-700">
                      Chat ID: {userData.telegram_chat_id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  Вы будете получать уведомления о новых заявках, изменениях статусов и сообщениях в Telegram.
                </p>
              </div>

              <UnlinkButton userId={user.id} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-900 mb-3">
                  Как привязать Telegram
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>
                    Найдите бота <span className="font-semibold">@AgencyBot</span> в Telegram
                  </li>
                  <li>
                    Отправьте команду <span className="font-semibold">/start</span>
                  </li>
                  <li>
                    Введите ваш email:{' '}
                    <span className="font-semibold">{userData.email}</span>
                  </li>
                </ol>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-sm text-gray-700">
                  После привязки вы будете получать уведомления о новых заявках,
                  изменениях статусов и сообщениях в Telegram.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
