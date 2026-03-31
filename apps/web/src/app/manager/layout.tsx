import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';
import { LogoutButton } from '@/components/LogoutButton';

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: userData } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/manager" className="text-xl font-bold text-gray-900">
                Manager Portal
              </Link>
              <div className="flex space-x-4">
                <Link
                  href="/manager"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Заявки
                </Link>
                <Link
                  href="/manager/balance"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Баланс
                </Link>
                <Link
                  href="/settings/telegram"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Настройки
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell currentUserId={user.id} />
              <div className="flex items-center space-x-2">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{userData?.full_name || 'Manager'}</p>
                  <p className="text-gray-500 text-xs">{userData?.email}</p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
