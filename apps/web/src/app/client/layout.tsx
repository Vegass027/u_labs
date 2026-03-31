import { createClient } from '@/lib/supabase/server';
import ClientMenuBar from '@/app/client/ClientMenuBar';
import { PasswordGate } from './PasswordGate';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  if (user) {
    await supabase
      .from('orders')
      .update({ client_user_id: user.id })
      .eq('client_contact', user.email)
      .is('client_user_id', null);
  }

  const needsPassword = user?.user_metadata?.password_set === false;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex justify-center">
          <ClientMenuBar />
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 xl:px-12">
        {children}
      </main>
      {needsPassword && <PasswordGate />}
    </div>
  );
}
